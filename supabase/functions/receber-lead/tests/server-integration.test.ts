// Testes automatizados do fluxo completo Servidor Node.js -> Edge Function `receber-lead`.
// Valida:
// 1. Mapeamento dos campos do formulário (`name`, `phone`, `email`, `message`) para o contrato da Edge Function.
// 2. Preservação integral da mensagem de até 1.000 caracteres sem truncamento.
// 3. Preservação de `tipo_atividade` e `origem`.
// 4. Modo `validar_apenas: true` verificando a coluna `mensagem` em `public.leads`.
// 5. Autenticação via `LEAD_INGEST_SECRET` exclusivamente no servidor (sem cabeçalho `Origin`).
// 6. Proteções multicamadas contra spam, envios duplicados e abuso (independentes de falsificação de IP).
// 7. Timeout e tratamento seguro de falhas de comunicação com o Supabase.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createLeadSubmissionService,
  sanitizePublicLeadInput,
  validateAndMapFormInput,
  PROTECTION_DEFAULTS,
} from "../../../../src/lib/leads.server.ts";
import { createHandler } from "../handler.ts";
import { createPostgresRepository, type SqlTag } from "../repository.ts";

const SECRET = "segredo-servidor-para-supabase-2026";
const EDGE_URL = "https://jsmxdavhddvwuspzqtkn.supabase.co/functions/v1/receber-lead";

function createConnectedSetup(opts: { dbFail?: boolean; secretMismatch?: boolean } = {}) {
  const sqlCalls: Array<{ query: string; values: unknown[] }> = [];
  const sql: SqlTag = (strings, ...values) => {
    const query = strings.join("$?").replace(/\s+/g, " ").trim();
    sqlCalls.push({ query, values });
    if (opts.dbFail) {
      return Promise.reject(new Error("connection refused: postgres://secret-user:secret-pass@db.internal"));
    }
    return Promise.resolve([]);
  };

  const edgeHandler = createHandler({
    getEnv: (name) => (name === "LEAD_INGEST_SECRET" ? SECRET : undefined),
    getRepository: () => createPostgresRepository(() => sql),
  });

  const capturedRequests: Request[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const req = new Request(String(input), init);
    capturedRequests.push(req.clone());
    return await edgeHandler(req);
  };

  let currentClock = 1_700_000_000_000;
  const serverEvents: string[] = [];

  const submitLead = createLeadSubmissionService({
    getConfig: () => ({
      leadIngestSecret: opts.secretMismatch ? "segredo-incorreto" : SECRET,
      supabaseEdgeFunctionUrl: EDGE_URL,
    }),
    fetchImpl,
    now: () => currentClock,
    log: (ev) => serverEvents.push(ev),
  });

  return {
    submitLead,
    sqlCalls,
    capturedRequests,
    serverEvents,
    advanceTime: (ms: number) => {
      currentClock += ms;
    },
  };
}

const validFormInput = {
  name: "Carlos Eduardo Mendes",
  phone: "(11) 98330-2016",
  email: "Carlos.Mendes@EmpresaMEI.com.br",
  message: "Olá, gostaria de regularizar meu MEI e contratar o acompanhamento mensal.",
  elapsedMs: 4500,
};

test("[server->edge] fluxo completo persiste mensagem integral de 1.000 caracteres sem truncamento", async () => {
  const { submitLead, sqlCalls, capturedRequests } = createConnectedSetup();
  const message1000 =
    "Preciso de assessoria contábil completa para MEI (emissão de notas e DASN). ".padEnd(1000, "A");
  assert.equal(message1000.length, 1000);

  const res = await submitLead({
    ...validFormInput,
    message: message1000,
    tipo_atividade: "Serviços de TI",
  });

  assert.deepEqual(res, { ok: true, status: 201, gravado: true });
  assert.equal(capturedRequests.length, 1);

  // Confirma que a requisição servidor -> Supabase não possui cabeçalho Origin e usa LEAD_INGEST_SECRET
  const outReq = capturedRequests[0];
  assert.equal(outReq.headers.get("origin"), null);
  assert.equal(outReq.headers.get("authorization"), `Bearer ${SECRET}`);
  assert.equal(outReq.headers.get("apikey"), SECRET);

  // Confirma o SQL parametrizado recebido pelo repositório da Edge Function
  assert.equal(sqlCalls.length, 1);
  assert.equal(
    sqlCalls[0].query,
    "INSERT INTO public.leads (nome, email, whatsapp, tipo_atividade, origem, mensagem) VALUES ($?, $?, $?, $?, $?, $?)",
  );
  assert.deepEqual(sqlCalls[0].values, [
    "Carlos Eduardo Mendes",
    "carlos.mendes@empresamei.com.br",
    "11983302016",
    "Serviços de TI",
    "site-floating-form",
    message1000,
  ]);
});

test("[server->edge] modo validar_apenas: true verifica a coluna mensagem sem gravar dados", async () => {
  const { submitLead, sqlCalls } = createConnectedSetup();
  const res = await submitLead({
    ...validFormInput,
    validar_apenas: true,
  });

  assert.deepEqual(res, { ok: true, status: 200, validado: true, gravado: false });
  assert.equal(sqlCalls.length, 1);
  assert.equal(
    sqlCalls[0].query,
    "SELECT id, created_at, nome, email, whatsapp, tipo_atividade, origem, mensagem FROM public.leads LIMIT 0",
  );
  assert.deepEqual(sqlCalls[0].values, []);
});

test("[server] validação rejeita mensagem > 1.000 caracteres, mensagem < 10 caracteres e telefone inválido", () => {
  const rTooLong = validateAndMapFormInput({
    ...validFormInput,
    message: "x".repeat(1001),
  });
  assert.equal(rTooLong.ok, false);
  if (!rTooLong.ok) assert.ok(rTooLong.fieldErrors.message);

  const rTooShort = validateAndMapFormInput({
    ...validFormInput,
    message: "curta",
  });
  assert.equal(rTooShort.ok, false);
  if (!rTooShort.ok) assert.ok(rTooShort.fieldErrors.message);

  const rBadPhone = validateAndMapFormInput({
    ...validFormInput,
    phone: "(11) 99999-9999",
  });
  assert.equal(rBadPhone.ok, false);
  if (!rBadPhone.ok) assert.ok(rBadPhone.fieldErrors.phone);
});

test("[segurança] bloqueia honeypot preenchido e submissão instantânea (< 1200ms) sem chamar o Supabase", async () => {
  const { submitLead, capturedRequests } = createConnectedSetup();

  const rHoneypot = await submitLead({
    ...validFormInput,
    honeypot: "https://spam-bot.example",
  });
  assert.equal(rHoneypot.ok, false);
  if (!rHoneypot.ok) assert.equal(rHoneypot.code, "spam_detected");

  const rFast = await submitLead({
    ...validFormInput,
    elapsedMs: 300,
  });
  assert.equal(rFast.ok, false);
  if (!rFast.ok) assert.equal(rFast.code, "too_fast");

  assert.equal(capturedRequests.length, 0);
});

test("[segurança] bloqueia requisição cross-site (Sec-Fetch-Site ou Origin divergente)", async () => {
  const { submitLead, capturedRequests } = createConnectedSetup();

  const rCross = await submitLead(validFormInput, {
    headers: { "sec-fetch-site": "cross-site" },
  });
  assert.equal(rCross.ok, false);
  if (!rCross.ok) {
    assert.equal(rCross.status, 403);
    assert.equal(rCross.code, "forbidden_origin");
  }

  const rBadOrigin = await submitLead(validFormInput, {
    headers: {
      origin: "https://site-malicioso.com",
      host: "anselmodiascontador.com.br",
    },
  });
  assert.equal(rBadOrigin.ok, false);
  if (!rBadOrigin.ok) assert.equal(rBadOrigin.status, 403);

  assert.equal(capturedRequests.length, 0);
});

test("[segurança] deduplicação e limite por contato bloqueiam abuso mesmo com falsificação de X-Forwarded-For", async () => {
  const { submitLead, capturedRequests, advanceTime } = createConnectedSetup();

  // 1º envio com IP simulado A -> 201
  const r1 = await submitLead(validFormInput, {
    headers: { "x-forwarded-for": "203.0.113.1" },
  });
  assert.equal(r1.ok, true);

  // 2º envio com exatamente o mesmo conteúdo, mas falsificando outro IP -> bloqueado por deduplicação de payload
  const rDup = await submitLead(validFormInput, {
    headers: { "x-forwarded-for": "198.51.100.99" },
  });
  assert.equal(rDup.ok, false);
  if (!rDup.ok) {
    assert.equal(rDup.status, 429);
    assert.equal(rDup.code, "duplicate_submission");
  }

  // 3º envio mudando a mensagem E falsificando os IPs, mas usando o mesmo e-mail/WhatsApp:
  // (permite até contactMaxPerWindow = 2 na janela de 2 minutos; o 3º é bloqueado)
  const r2 = await submitLead(
    { ...validFormInput, message: "Segunda dúvida diferente enviada em seguida pelo mesmo contato." },
    { headers: { "x-forwarded-for": "192.0.2.55" } },
  );
  assert.equal(r2.ok, true);

  const r3Blocked = await submitLead(
    { ...validFormInput, message: "Terceira mensagem seguida tentando burlar por troca de IP." },
    { headers: { "x-forwarded-for": "198.18.0.12" } },
  );
  assert.equal(r3Blocked.ok, false);
  if (!r3Blocked.ok) {
    assert.equal(r3Blocked.status, 429);
    assert.equal(r3Blocked.code, "contact_rate_limited");
  }

  // Apenas as 2 chamadas legítimas chegaram à Edge Function
  assert.equal(capturedRequests.length, 2);

  // Após expirar a janela de contato (2 minutos), um novo envio diferente volta a ser permitido
  advanceTime(PROTECTION_DEFAULTS.contactWindowMs + 1_000);
  const rAfterWindow = await submitLead({
    ...validFormInput,
    message: "Nova mensagem após aguardar o período de resfriamento do contato.",
  });
  assert.equal(rAfterWindow.ok, true);
});

test("[segurança] timeout, falha de banco e ausência de segredo retornam 503 sem expor segredos ou PII", async () => {
  // 1. Falha de banco na Edge Function
  const dbFailSetup = createConnectedSetup({ dbFail: true });
  const rDb = await dbFailSetup.submitLead(validFormInput);
  assert.equal(rDb.ok, false);
  if (!rDb.ok) {
    assert.equal(rDb.status, 503);
    assert.equal(rDb.code, "upstream_unavailable");
    assert.ok(!rDb.error.includes("postgres://"));
    assert.ok(!rDb.error.includes(SECRET));
  }

  // 2. Segredo ausente no servidor
  const missingSecretService = createLeadSubmissionService({
    getConfig: () => ({ leadIngestSecret: "", supabaseEdgeFunctionUrl: EDGE_URL }),
  });
  const rMissing = await missingSecretService(validFormInput);
  assert.equal(rMissing.ok, false);
  if (!rMissing.ok) {
    assert.equal(rMissing.status, 503);
    assert.equal(rMissing.code, "server_misconfigured");
  }

  // 3. Timeout na chamada ao Supabase
  const slowService = createLeadSubmissionService({
    getConfig: () => ({ leadIngestSecret: SECRET, supabaseEdgeFunctionUrl: EDGE_URL }),
    timeoutMs: 30,
    fetchImpl: async (_url, init) => {
      return await new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    },
  });
  const rTimeout = await slowService(validFormInput);
  assert.equal(rTimeout.ok, false);
  if (!rTimeout.ok) {
    assert.equal(rTimeout.status, 503);
    assert.equal(rTimeout.code, "upstream_timeout");
  }
});

test("[headers] suporta tanto Verify JWT desativado (apenas LEAD_INGEST_SECRET) quanto Verify JWT ativo (SUPABASE_ANON_KEY + LEAD_INGEST_SECRET)", async () => {
  const ANON_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon-test-payload.signature";
  const sqlCalls: Array<{ query: string; values: unknown[] }> = [];
  const sql: SqlTag = (strings, ...values) => {
    sqlCalls.push({ query: strings.join("$?").replace(/\s+/g, " ").trim(), values });
    return Promise.resolve([]);
  };

  const edgeHandler = createHandler({
    getEnv: (name) => (name === "LEAD_INGEST_SECRET" ? SECRET : undefined),
    getRepository: () => createPostgresRepository(() => sql),
  });

  const capturedHeaders: Array<{ authorization: string | null; apikey: string | null }> = [];
  const submitWithAnon = createLeadSubmissionService({
    getConfig: () => ({
      leadIngestSecret: SECRET,
      supabaseAnonKey: ANON_JWT,
      supabaseEdgeFunctionUrl: EDGE_URL,
    }),
    fetchImpl: async (input, init) => {
      const req = new Request(String(input), init);
      capturedHeaders.push({
        authorization: req.headers.get("authorization"),
        apikey: req.headers.get("apikey"),
      });
      return await edgeHandler(req);
    },
  });

  const res = await submitWithAnon(validFormInput);
  assert.deepEqual(res, { ok: true, status: 201, gravado: true });
  assert.equal(capturedHeaders.length, 1);
  assert.equal(capturedHeaders[0].authorization, `Bearer ${ANON_JWT}`);
  assert.equal(capturedHeaders[0].apikey, SECRET);
  assert.equal(sqlCalls.length, 1);
});

test("[etapa 4.9] timeout padrão é de 15.000 ms (15 segundos) acima do connect_timeout do PostgreSQL", () => {
  assert.equal(PROTECTION_DEFAULTS.timeoutMs, 15_000);
});

test("[etapa 4.9] Secret Key moderna (sb_secret_) exige SUPABASE_ANON_KEY e retorna server_misconfigured se ausente", async () => {
  const MODERN_SECRET = "sb_secret_test_key_only_for_local_unit_test";
  const ANON_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon-test-payload.signature";
  let networkCalls = 0;

  // 1. Sem SUPABASE_ANON_KEY -> bloqueia antes da rede com server_misconfigured
  const serviceWithoutAnon = createLeadSubmissionService({
    getConfig: () => ({
      leadIngestSecret: MODERN_SECRET,
      supabaseAnonKey: "",
      supabaseEdgeFunctionUrl: EDGE_URL,
    }),
    fetchImpl: async () => {
      networkCalls++;
      return new Response(JSON.stringify({ ok: true }), { status: 201 });
    },
  });

  const rMissingAnon = await serviceWithoutAnon(validFormInput);
  assert.equal(rMissingAnon.ok, false);
  if (!rMissingAnon.ok) {
    assert.equal(rMissingAnon.status, 503);
    assert.equal(rMissingAnon.code, "server_misconfigured");
    assert.ok(!rMissingAnon.error.includes(MODERN_SECRET));
  }
  assert.equal(networkCalls, 0);

  // 2. Com SUPABASE_ANON_KEY presente -> envia Authorization: Bearer <ANON_JWT> e apikey: <MODERN_SECRET> sem Origin
  const capturedRequests: Request[] = [];
  const serviceWithAnon = createLeadSubmissionService({
    getConfig: () => ({
      leadIngestSecret: MODERN_SECRET,
      supabaseAnonKey: ANON_JWT,
      supabaseEdgeFunctionUrl: EDGE_URL,
    }),
    fetchImpl: async (input, init) => {
      const req = new Request(String(input), init);
      capturedRequests.push(req);
      return new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  const rSuccess = await serviceWithAnon(validFormInput);
  assert.deepEqual(rSuccess, { ok: true, status: 201, gravado: true });
  assert.equal(capturedRequests.length, 1);
  assert.equal(capturedRequests[0].headers.get("authorization"), `Bearer ${ANON_JWT}`);
  assert.equal(capturedRequests[0].headers.get("apikey"), MODERN_SECRET);
  assert.equal(capturedRequests[0].headers.get("content-type"), "application/json; charset=utf-8");
  assert.equal(capturedRequests[0].headers.get("origin"), null);
});

test("[etapa 4.9] rota pública (sanitizePublicLeadInput) descarta validar_apenas e nunca encaminha validar_apenas: true à Edge Function", async () => {
  const { submitLead, capturedRequests, sqlCalls } = createConnectedSetup();

  const craftedClientPayload = {
    ...validFormInput,
    validar_apenas: true,
  };

  const sanitized = sanitizePublicLeadInput(craftedClientPayload);
  assert.equal("validar_apenas" in sanitized, false);

  const res = await submitLead(sanitized);
  assert.deepEqual(res, { ok: true, status: 201, gravado: true });
  assert.equal(capturedRequests.length, 1);

  const sentJson = (await capturedRequests[0].clone().json()) as Record<string, unknown>;
  assert.equal("validar_apenas" in sentJson, false);
  assert.equal(sqlCalls.length, 1);
  assert.ok(sqlCalls[0].query.startsWith("INSERT INTO public.leads"));
});

test("[etapa 4.9] HTTP 200 sem validar_apenas não é aceito como envio real gravado", async () => {
  const service = createLeadSubmissionService({
    getConfig: () => ({
      leadIngestSecret: SECRET,
      supabaseEdgeFunctionUrl: EDGE_URL,
    }),
    fetchImpl: async () =>
      new Response(JSON.stringify({ ok: true, validado: true, gravado: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });

  const res = await service(validFormInput);
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.status, 503);
    assert.equal(res.code, "upstream_unavailable");
  }
});

test("[etapa 5.1b] chamada utiliza redirect: 'error' e bloqueia redirecionamentos com falha segura sem reenviar segredos", async () => {
  const capturedRequests: Request[] = [];
  let simulatedRedirectAttempts = 0;

  // 1. Confirma que a propriedade redirect: 'error' é enviada com os cabeçalhos corretos
  const service = createLeadSubmissionService({
    getConfig: () => ({
      leadIngestSecret: SECRET,
      supabaseEdgeFunctionUrl: EDGE_URL,
    }),
    fetchImpl: async (input, init) => {
      const req = new Request(String(input), init);
      capturedRequests.push(req);
      assert.equal(req.redirect, "error");
      return new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  const res = await service(validFormInput);
  assert.deepEqual(res, { ok: true, status: 201, gravado: true });
  assert.equal(capturedRequests.length, 1);
  assert.equal(capturedRequests[0].redirect, "error");
  assert.equal(capturedRequests[0].headers.get("authorization"), `Bearer ${SECRET}`);
  assert.equal(capturedRequests[0].headers.get("apikey"), SECRET);

  // 2. Simula resposta de redirecionamento HTTP (301/302) onde fetch rejeita devido a redirect: 'error'
  const redirectRejectService = createLeadSubmissionService({
    getConfig: () => ({
      leadIngestSecret: SECRET,
      supabaseEdgeFunctionUrl: EDGE_URL,
    }),
    fetchImpl: async (_input, init) => {
      simulatedRedirectAttempts++;
      if (init?.redirect === "error") {
        // Comportamento especificado pelo standard Fetch quando redirect: 'error' encontra status 3xx
        const redirectError = new TypeError("Failed to fetch: redirect mode is set to error");
        return Promise.reject(redirectError);
      }
      return new Response(null, { status: 302, headers: { Location: "https://outro-site.com/intercept" } });
    },
  });

  const resRedirect = await redirectRejectService(validFormInput);
  assert.equal(resRedirect.ok, false);
  if (!resRedirect.ok) {
    assert.equal(resRedirect.status, 503);
    assert.equal(resRedirect.code, "upstream_unavailable");
    assert.equal(
      resRedirect.error,
      "Serviço temporariamente indisponível. Por favor, fale conosco pelo WhatsApp!",
    );
  }
  // Confirma que não houve tentativas de seguir o redirecionamento
  assert.equal(simulatedRedirectAttempts, 1);
});

test("[origem / proxy] aceita domínios autorizados (Bunny CDN, oficial www/apex, Guará Cloud) e rejeita ataques cross-site e spoofing", async () => {
  const { submitLead, advanceTime } = createConnectedSetup();

  // 1. Bunny CDN temporário com X-Forwarded-Host e Host da Guará Cloud -> 201 Aceito
  const rBunnyXf = await submitLead(
    { ...validFormInput, email: "teste.bunny1@empresa.com", phone: "(11) 98330-2001" },
    {
      headers: {
        origin: "https://anselmodiascontador.b-cdn.net",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
        "x-forwarded-host": "anselmodiascontador.b-cdn.net",
        "sec-fetch-site": "same-origin",
      },
    },
  );
  assert.equal(rBunnyXf.ok, true);

  // 2. Bunny CDN sem X-Forwarded-Host (apenas Host interno da Guará Cloud) -> 201 Aceito pela lista estrita
  const rBunnyDirect = await submitLead(
    { ...validFormInput, email: "teste.bunny2@empresa.com", phone: "(11) 98330-2002" },
    {
      headers: {
        origin: "https://anselmodiascontador.b-cdn.net",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
        "sec-fetch-site": "same-origin",
      },
    },
  );
  assert.equal(rBunnyDirect.ok, true);

  // 3. Domínio oficial de produção (www.anselmodiascontador.com.br) via proxy -> 201 Aceito
  const rOficialWww = await submitLead(
    { ...validFormInput, email: "teste.oficial1@empresa.com", phone: "(11) 98330-2003" },
    {
      headers: {
        origin: "https://www.anselmodiascontador.com.br",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
        "x-forwarded-host": "www.anselmodiascontador.com.br:443",
      },
    },
  );
  assert.equal(rOficialWww.ok, true);

  // 4. Domínio apex de produção (anselmodiascontador.com.br) -> 201 Aceito
  const rOficialApex = await submitLead(
    { ...validFormInput, email: "teste.oficial2@empresa.com", phone: "(11) 98330-2004" },
    {
      headers: {
        origin: "https://anselmodiascontador.com.br",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
      },
    },
  );
  assert.equal(rOficialApex.ok, true);

  // 5. Tentativa de spoofing com subdomínio malicioso (anselmodiascontador.b-cdn.net.malicious.com) -> 403 Bloqueado
  const rSpoof = await submitLead(
    { ...validFormInput, email: "teste.spoof@empresa.com", phone: "(11) 98330-2005" },
    {
      headers: {
        origin: "https://anselmodiascontador.b-cdn.net.malicious.com",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
      },
    },
  );
  assert.equal(rSpoof.ok, false);
  if (!rSpoof.ok) {
    assert.equal(rSpoof.status, 403);
    assert.equal(rSpoof.code, "forbidden_origin");
    assert.equal(rSpoof.error, "Origem da requisição não autorizada.");
  }

  // 6. Requisição com Sec-Fetch-Site: cross-site -> 403 Bloqueado
  const rCross = await submitLead(
    { ...validFormInput, email: "teste.cross@empresa.com", phone: "(11) 98330-2006" },
    {
      headers: {
        origin: "https://www.anselmodiascontador.com.br",
        "sec-fetch-site": "cross-site",
      },
    },
  );
  assert.equal(rCross.ok, false);
  if (!rCross.ok) {
    assert.equal(rCross.status, 403);
    assert.equal(rCross.code, "forbidden_origin");
  }

  // 7. Proxy com múltiplos hops em X-Forwarded-Host (client-host, proxy2) -> 201 Aceito
  const rMultiHop = await submitLead(
    { ...validFormInput, email: "teste.hop@empresa.com", phone: "(11) 98330-2007" },
    {
      headers: {
        origin: "https://anselmodiascontador.b-cdn.net",
        host: "10.0.0.1",
        "x-forwarded-host": "anselmodiascontador.b-cdn.net, proxy-interno.guara",
      },
    },
  );
  assert.equal(rMultiHop.ok, true);

  // 8. Origem customizada configurada via allowedOrigins -> 201 Aceito
  const customService = createLeadSubmissionService({
    getConfig: () => ({
      leadIngestSecret: SECRET,
      supabaseEdgeFunctionUrl: EDGE_URL,
      allowedOrigins: "https://homologacao.parceiro.com.br",
    }),
    fetchImpl: async () => new Response(JSON.stringify({ ok: true }), { status: 201 }),
  });
  const rCustom = await customService(
    { ...validFormInput, email: "teste.custom@empresa.com", phone: "(11) 98330-2008" },
    {
      headers: {
        origin: "https://homologacao.parceiro.com.br",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
      },
    },
  );
  assert.equal(rCustom.ok, true);

  advanceTime(PROTECTION_DEFAULTS.clientWindowMs + 1000);
  // 9. Referer fallback quando Origin está ausente -> 201 Aceito
  const rReferer = await submitLead(
    { ...validFormInput, email: "teste.ref@empresa.com", phone: "(11) 98330-2009" },
    {
      headers: {
        referer: "https://www.anselmodiascontador.com.br/contato",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
      },
    },
  );
  assert.equal(rReferer.ok, true);
});

test("[auditoria de segurança] validação de origem é imune a falsificação de X-Forwarded-Host, esquemas inseguros, Origin null e conflitos", async () => {
  const { submitLead, advanceTime } = createConnectedSetup();

  // 1. Atacante forja Origin malicioso E X-Forwarded-Host idêntico -> 403 Bloqueado (X-Forwarded-Host não autoriza)
  const rSpoofedXf = await submitLead(
    { ...validFormInput, email: "teste.spoofedxf@empresa.com", phone: "(11) 98330-2101" },
    {
      headers: {
        origin: "https://site-malicioso.com",
        "x-forwarded-host": "site-malicioso.com",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
      },
    },
  );
  assert.equal(rSpoofedXf.ok, false);
  if (!rSpoofedXf.ok) {
    assert.equal(rSpoofedXf.status, 403);
    assert.equal(rSpoofedXf.code, "forbidden_origin");
  }

  // 2. Esquema HTTP inseguro para domínio oficial em produção -> 403 Bloqueado (apenas HTTPS é aceito)
  const rInsecureHttp = await submitLead(
    { ...validFormInput, email: "teste.insecure@empresa.com", phone: "(11) 98330-2102" },
    {
      headers: {
        origin: "http://www.anselmodiascontador.com.br",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
      },
    },
  );
  assert.equal(rInsecureHttp.ok, false);
  if (!rInsecureHttp.ok) {
    assert.equal(rInsecureHttp.status, 403);
    assert.equal(rInsecureHttp.code, "forbidden_origin");
  }

  // 3. Origin "null" (comum em sandboxed iframes e data: URIs) -> 403 Bloqueado
  const rNullOrigin = await submitLead(
    { ...validFormInput, email: "teste.null@empresa.com", phone: "(11) 98330-2103" },
    {
      headers: {
        origin: "null",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
      },
    },
  );
  assert.equal(rNullOrigin.ok, false);
  if (!rNullOrigin.ok) {
    assert.equal(rNullOrigin.status, 403);
    assert.equal(rNullOrigin.code, "forbidden_origin");
  }

  // 4. Porta não autorizada em produção (ex: :8443) -> 403 Bloqueado
  const rBadPort = await submitLead(
    { ...validFormInput, email: "teste.badport@empresa.com", phone: "(11) 98330-2104" },
    {
      headers: {
        origin: "https://www.anselmodiascontador.com.br:8443",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
      },
    },
  );
  assert.equal(rBadPort.ok, false);
  if (!rBadPort.ok) {
    assert.equal(rBadPort.status, 403);
    assert.equal(rBadPort.code, "forbidden_origin");
  }

  // 5. Porta padrão :443 explícita no Origin -> 201 Aceito (normalizada para HTTPS padrão)
  const rStandardPort = await submitLead(
    { ...validFormInput, email: "teste.stdport@empresa.com", phone: "(11) 98330-2105" },
    {
      headers: {
        origin: "https://www.anselmodiascontador.com.br:443",
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
      },
    },
  );
  assert.equal(rStandardPort.ok, true);

  // 6. Cabeçalhos conflitantes: Origin legítimo mas Sec-Fetch-Site: cross-site -> 403 Bloqueado
  const rConflict = await submitLead(
    { ...validFormInput, email: "teste.conflict@empresa.com", phone: "(11) 98330-2106" },
    {
      headers: {
        origin: "https://www.anselmodiascontador.com.br",
        "sec-fetch-site": "cross-site",
      },
    },
  );
  assert.equal(rConflict.ok, false);
  if (!rConflict.ok) {
    assert.equal(rConflict.status, 403);
    assert.equal(rConflict.code, "forbidden_origin");
  }

  // 7. Ausência total de Origin e Referer, mas com Sec-Fetch-Site: cross-site -> 403 Bloqueado
  const rNoOriginCrossSite = await submitLead(
    { ...validFormInput, email: "teste.noorigincross@empresa.com", phone: "(11) 98330-2107" },
    {
      headers: {
        "sec-fetch-site": "cross-site",
      },
    },
  );
  assert.equal(rNoOriginCrossSite.ok, false);
  if (!rNoOriginCrossSite.ok) {
    assert.equal(rNoOriginCrossSite.status, 403);
    assert.equal(rNoOriginCrossSite.code, "forbidden_origin");
  }

  // 8. Ambiente local (localhost / 127.0.0.1 com HTTP) -> 201 Aceito
  advanceTime(PROTECTION_DEFAULTS.clientWindowMs + 1000);
  const rLocalDev = await submitLead(
    { ...validFormInput, email: "teste.localdev@empresa.com", phone: "(11) 98330-2108" },
    {
      headers: {
        origin: "http://localhost:3000",
        host: "localhost:3000",
      },
    },
  );
  assert.equal(rLocalDev.ok, true);
});

test("[política zero-trust] requisições externas sem Origin e Referer são rejeitadas para impedir bypass por bots e CSRF no-referrer", async () => {
  const { submitLead } = createConnectedSetup();

  // 1. Requisição externa com Host oficial, mas sem Origin, sem Referer e sem Sec-Fetch-Site -> 403 Bloqueado
  const rNoOriginOficial = await submitLead(
    { ...validFormInput, email: "teste.noorigin1@empresa.com", phone: "(11) 98330-2201" },
    {
      headers: {
        host: "www.anselmodiascontador.com.br",
      },
    },
  );
  assert.equal(rNoOriginOficial.ok, false);
  if (!rNoOriginOficial.ok) {
    assert.equal(rNoOriginOficial.status, 403);
    assert.equal(rNoOriginOficial.code, "forbidden_origin");
    assert.equal(rNoOriginOficial.error, "Origem da requisição não autorizada.");
  }

  // 2. Requisição externa com Host da CDN (Bunny), mas sem Origin e sem Referer -> 403 Bloqueado
  const rNoOriginCdn = await submitLead(
    { ...validFormInput, email: "teste.noorigin2@empresa.com", phone: "(11) 98330-2202" },
    {
      headers: {
        host: "anselmodiascontador.b-cdn.net",
      },
    },
  );
  assert.equal(rNoOriginCdn.ok, false);
  if (!rNoOriginCdn.ok) {
    assert.equal(rNoOriginCdn.status, 403);
    assert.equal(rNoOriginCdn.code, "forbidden_origin");
  }

  // 3. Script externo/bot enviando User-Agent e Host sem Origin -> 403 Bloqueado
  const rBotScript = await submitLead(
    { ...validFormInput, email: "teste.bot@empresa.com", phone: "(11) 98330-2203" },
    {
      headers: {
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
        "user-agent": "python-requests/2.31.0",
      },
    },
  );
  assert.equal(rBotScript.ok, false);
  if (!rBotScript.ok) {
    assert.equal(rBotScript.status, 403);
    assert.equal(rBotScript.code, "forbidden_origin");
  }

  // 4. Tentativa com Sec-Fetch-Site: same-origin forjado, porém sem Origin nem Referer -> 403 Bloqueado
  const rSameOriginNoHeaders = await submitLead(
    { ...validFormInput, email: "teste.sameoriginnohead@empresa.com", phone: "(11) 98330-2204" },
    {
      headers: {
        host: "www.anselmodiascontador.com.br",
        "sec-fetch-site": "same-origin",
      },
    },
  );
  assert.equal(rSameOriginNoHeaders.ok, false);
  if (!rSameOriginNoHeaders.ok) {
    assert.equal(rSameOriginNoHeaders.status, 403);
    assert.equal(rSameOriginNoHeaders.code, "forbidden_origin");
  }

  // 5. Chamada de navegador legítimo fornecendo Origin oficial -> 201 Aceito
  const rLegitimateBrowser = await submitLead(
    { ...validFormInput, email: "teste.legitimo@empresa.com", phone: "(11) 98330-2205" },
    {
      headers: {
        host: "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
        origin: "https://www.anselmodiascontador.com.br",
        referer: "https://www.anselmodiascontador.com.br/",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    },
  );
  assert.equal(rLegitimateBrowser.ok, true);
});
