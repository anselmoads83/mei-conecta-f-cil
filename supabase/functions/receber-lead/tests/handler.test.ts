// Testes do HANDLER COMPLETO: Request/Response reais (Web API) passando por
// createHandler, com persistência simulada (repositório em memória e
// template `sql` que captura o SQL gerado). NÃO acessa Supabase nem PostgreSQL.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "../handler.ts";
import type { LeadRepository } from "../handler.ts";
import { createPostgresRepository } from "../repository.ts";
import type { SqlTag } from "../repository.ts";
import type { Lead } from "../validation.ts";

const URL_FN = "http://localhost/functions/v1/receber-lead";
const SECRET = "segredo-dedicado-de-teste";

function makeRepo(opts: { fail?: boolean } = {}) {
  const inserted: Lead[] = [];
  let dryRuns = 0;
  const repo: LeadRepository = {
    async dryRun() {
      dryRuns++;
      if (opts.fail) throw new Error("db down: postgres://user:pass@host");
    },
    async insert(lead) {
      if (opts.fail) throw new Error("db down: postgres://user:pass@host");
      inserted.push(lead);
    },
  };
  return { repo, inserted, dryRuns: () => dryRuns };
}

function makeHandler(
  repo: LeadRepository,
  vars: Record<string, string> = { LEAD_INGEST_SECRET: SECRET },
) {
  const logs: string[] = [];
  const handler = createHandler({
    getEnv: (n) => vars[n],
    getRepository: () => repo,
    log: (e) => logs.push(e),
  });
  return { handler, logs };
}

const lead = {
  nome: "João Teste",
  email: "JOAO@Teste.com",
  whatsapp: "(11) 91547-0723",
  tipo_atividade: null,
  origem: "site",
};

function post(
  body: unknown,
  headers: Record<string, string> = { Authorization: `Bearer ${SECRET}` },
  contentType: string | null = "application/json",
) {
  const h: Record<string, string> = { ...headers };
  if (contentType !== null) h["Content-Type"] = contentType;
  return new Request(URL_FN, {
    method: "POST",
    headers: h,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function assertSecurityHeaders(res: Response) {
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
}

// ---------- Segurança de borda ----------
test("[handler] Origin -> 403 mesmo com credencial válida", async () => {
  const { repo, inserted } = makeRepo();
  const { handler } = makeHandler(repo);
  const res = await handler(
    post(lead, { Authorization: `Bearer ${SECRET}`, Origin: "https://x.com" }),
  );
  assert.equal(res.status, 403);
  assertSecurityHeaders(res);
  assert.equal(inserted.length, 0);
});

test("[handler] método diferente de POST -> 405", async () => {
  const { handler } = makeHandler(makeRepo().repo);
  const res = await handler(new Request(URL_FN, { method: "GET", headers: { apikey: SECRET } }));
  assert.equal(res.status, 405);
  assertSecurityHeaders(res);
});

// ---------- 1. Content-Type ----------
test("[handler] Content-Type incorreto ou ausente -> 415", async () => {
  const { repo, inserted } = makeRepo();
  const { handler } = makeHandler(repo);
  for (const ct of ["text/plain", "application/x-www-form-urlencoded", "multipart/form-data", null]) {
    const res = await handler(post(lead, undefined, ct));
    assert.equal(res.status, 415, String(ct));
    assertSecurityHeaders(res);
  }
  assert.equal(inserted.length, 0);
});

test("[handler] Content-Type aceita maiúsculas e parâmetros (charset)", async () => {
  const { handler } = makeHandler(makeRepo().repo);
  assert.equal((await handler(post(lead, undefined, "APPLICATION/JSON"))).status, 201);
  assert.equal((await handler(post(lead, undefined, "application/json; charset=utf-8"))).status, 201);
});

test("[handler] autenticação é avaliada antes do Content-Type", async () => {
  const { handler } = makeHandler(makeRepo().repo);
  const res = await handler(post(lead, { Authorization: "Bearer errado" }, "text/plain"));
  assert.equal(res.status, 401);
});

// ---------- 8. Autenticação ----------
test("[handler] segredo dedicado -> 201 { ok: true } e persistência normalizada", async () => {
  const { repo, inserted } = makeRepo();
  const { handler, logs } = makeHandler(repo);
  const res = await handler(post(lead));
  assert.equal(res.status, 201);
  assertSecurityHeaders(res);
  assert.deepEqual(await res.json(), { ok: true });
  assert.deepEqual(inserted, [
    {
      nome: "João Teste",
      email: "joao@teste.com",
      whatsapp: "11915470723",
      tipo_atividade: null,
      origem: "site",
    },
  ]);
  assert.equal(logs.length, 0);
});

test("[handler] credencial inválida ou ausente -> 401 sem tocar o banco", async () => {
  const { repo, inserted, dryRuns } = makeRepo();
  const { handler } = makeHandler(repo);
  const r1 = await handler(post(lead, { Authorization: "Bearer errado" }));
  assert.equal(r1.status, 401);
  assertSecurityHeaders(r1);
  assert.equal((await handler(post(lead, {}))).status, 401);
  assert.equal(inserted.length, 0);
  assert.equal(dryRuns(), 0);
});

test("[handler] sem nenhuma credencial configurada no ambiente -> 401 (falha segura)", async () => {
  const { repo, inserted } = makeRepo();
  const { handler } = makeHandler(repo, {});
  assert.equal((await handler(post(lead, { apikey: "qualquer" }))).status, 401);
  assert.equal(inserted.length, 0);
});

test("[handler] credenciais transitórias aceitas e registradas em log (sem valor)", async () => {
  const { repo } = makeRepo();
  const { handler, logs } = makeHandler(repo, {
    LEAD_INGEST_SECRET: SECRET,
    SUPABASE_SECRET_KEYS: '{"default":"sb_secret_abc"}',
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
  });
  assert.equal((await handler(post(lead, { apikey: "sb_secret_abc" }))).status, 201);
  assert.equal((await handler(post(lead, { Authorization: "Bearer service-role" }))).status, 201);
  assert.deepEqual(logs, ["legacy_credential_used", "legacy_credential_used"]);
});

// ---------- Payload > 16.384 bytes ----------
test("[handler] payload > 16.384 bytes -> 413 (com e sem Content-Length)", async () => {
  const { repo, inserted } = makeRepo();
  const { handler } = makeHandler(repo);
  const big = JSON.stringify({ ...lead, nome: "a".repeat(17 * 1024) });
  const res = await handler(post(big));
  assert.equal(res.status, 413);
  assertSecurityHeaders(res);

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(new TextEncoder().encode(big));
      c.close();
    },
  });
  const chunked = new Request(URL_FN, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: stream,
    // @ts-expect-error: opção exigida pelo Node para corpos em stream
    duplex: "half",
  });
  assert.equal((await handler(chunked)).status, 413);
  assert.equal(inserted.length, 0);
});

test("[handler] payload de exatamente 16.384 bytes não é rejeitado pelo limite", async () => {
  const { handler } = makeHandler(makeRepo().repo);
  const bytes = (s: string) => new TextEncoder().encode(s).length;
  const pad = 16384 - bytes(JSON.stringify({ ...lead, tipo_atividade: "" }));
  const body = JSON.stringify({ ...lead, tipo_atividade: "x".repeat(pad) });
  assert.equal(bytes(body), 16384);
  // Rejeitado pelo limite do campo (400), e não pelo tamanho (413).
  assert.equal((await handler(post(body))).status, 400);
});

// ---------- 7. Contrato via handler ----------
test("[handler] JSON inválido / campo desconhecido / sem origem / sem tipo_atividade / whatsapp > 30 -> 400", async () => {
  const { repo, inserted } = makeRepo();
  const { handler } = makeHandler(repo);
  const r = await handler(post("{nao-json"));
  assert.equal(r.status, 400);
  assertSecurityHeaders(r);
  assert.equal((await handler(post({ ...lead, extra: 1 }))).status, 400);
  const { origem: _o, ...semOrigem } = lead;
  assert.equal((await handler(post(semOrigem))).status, 400);
  const { tipo_atividade: _t, ...semTipo } = lead;
  assert.equal((await handler(post(semTipo))).status, 400);
  assert.equal((await handler(post({ ...lead, whatsapp: "+55 (11) 91547-0723------------" }))).status, 400);
  assert.equal((await handler(post({ ...lead, validar_apenas: "true" }))).status, 400);
  assert.equal(inserted.length, 0);
});

test("[handler] tipo_atividade: null -> 201 e gravado como null", async () => {
  const { repo, inserted } = makeRepo();
  const { handler } = makeHandler(repo);
  assert.equal((await handler(post({ ...lead, tipo_atividade: null }))).status, 201);
  assert.equal(inserted[0].tipo_atividade, null);
});

test("[handler] resposta de erro não reflete nomes de campos desconhecidos", async () => {
  const { handler } = makeHandler(makeRepo().repo);
  const text = await (await handler(post({ ...lead, "<script>": 1 }))).text();
  assert.ok(!text.includes("<script>"));
});

// ---------- 5. Dry-run ----------
test("[handler] validar_apenas: true -> 200 { ok, validado, gravado:false }, sem dados pessoais", async () => {
  const { repo, inserted, dryRuns } = makeRepo();
  const { handler } = makeHandler(repo);
  const res = await handler(post({ ...lead, validar_apenas: true }));
  assert.equal(res.status, 200);
  assertSecurityHeaders(res);
  const text = await res.text();
  assert.deepEqual(JSON.parse(text), { ok: true, validado: true, gravado: false });
  for (const pii of ["João", "joao@teste.com", "91547", "site"]) {
    assert.ok(!text.includes(pii), pii);
  }
  assert.equal(dryRuns(), 1);
  assert.equal(inserted.length, 0);
});

// ---------- 2. Banco indisponível ----------
test("[handler] erro de banco na inserção -> 503 sem expor detalhes", async () => {
  const { handler, logs } = makeHandler(makeRepo({ fail: true }).repo);
  const res = await handler(post(lead));
  assert.equal(res.status, 503);
  assertSecurityHeaders(res);
  const text = await res.text();
  assert.ok(!text.includes("postgres://") && !text.includes("db down"));
  assert.deepEqual(logs, ["database_unavailable"]);
});

test("[handler] erro de banco no dry-run -> 503", async () => {
  const { handler } = makeHandler(makeRepo({ fail: true }).repo);
  assert.equal((await handler(post({ ...lead, validar_apenas: true }))).status, 503);
});

test("[handler] SUPABASE_DB_URL ausente (getRepository/getSql lança) -> 503", async () => {
  const handler = createHandler({
    getEnv: (n) => ({ LEAD_INGEST_SECRET: SECRET })[n],
    getRepository: () =>
      createPostgresRepository(() => {
        throw new Error("db_url_missing");
      }),
  });
  assert.equal((await handler(post(lead))).status, 503);
  assert.equal((await handler(post({ ...lead, validar_apenas: true }))).status, 503);
});

// ---------- 4. SQL original (driver postgres simulado) ----------
function fakeSql(opts: { fail?: boolean } = {}) {
  const calls: Array<{ strings: readonly string[]; values: unknown[] }> = [];
  const sql: SqlTag = (strings, ...values) => {
    calls.push({ strings: [...strings], values });
    return opts.fail ? Promise.reject(new Error("relation does not exist")) : Promise.resolve([]);
  };
  return { sql, calls };
}

test("[handler+repo] dry-run executa exatamente a consulta original, sem parâmetros e sem insert", async () => {
  const { sql, calls } = fakeSql();
  const { handler } = makeHandler(createPostgresRepository(() => sql));
  const res = await handler(post({ ...lead, validar_apenas: true }));
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].strings, [
    "SELECT id, created_at, nome, email, whatsapp, tipo_atividade, origem FROM public.leads LIMIT 0",
  ]);
  assert.deepEqual(calls[0].values, []);
});

test("[handler+repo] dry-run com tabela/coluna inexistente -> 503", async () => {
  const { sql } = fakeSql({ fail: true });
  const { handler } = makeHandler(createPostgresRepository(() => sql));
  assert.equal((await handler(post({ ...lead, validar_apenas: true }))).status, 503);
});

test("[handler+repo] inserção parametrizada em public.leads", async () => {
  const { sql, calls } = fakeSql();
  const { handler } = makeHandler(createPostgresRepository(() => sql));
  const res = await handler(post({ ...lead, tipo_atividade: "Comércio" }));
  assert.equal(res.status, 201);
  assert.equal(calls.length, 1);
  const text = calls[0].strings.join("$?").replace(/\s+/g, " ").trim();
  assert.equal(
    text,
    "INSERT INTO public.leads (nome, email, whatsapp, tipo_atividade, origem) VALUES ($?, $?, $?, $?, $?)",
  );
  assert.deepEqual(calls[0].values, [
    "João Teste",
    "joao@teste.com",
    "11915470723",
    "Comércio",
    "site",
  ]);
});
