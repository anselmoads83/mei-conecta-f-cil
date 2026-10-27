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
    capturedRequests.push(req);
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
