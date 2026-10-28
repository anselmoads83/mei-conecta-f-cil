// Testes automatizados do arquivo único preparado para o Dashboard:
// `supabase/functions/receber-lead/receber-lead.dashboard.mensagem.index.ts`
//
// Executa o código real do arquivo único em ambiente Node.js isolado (simulando Deno.env, Deno.serve e driver postgres),
// sem acessar nem gravar dados no Supabase de produção.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rollbackPath = path.resolve(__dirname, "../receber-lead.rollback.index.ts");
const dashboardPath = path.resolve(__dirname, "../receber-lead.dashboard.mensagem.index.ts");

const rollbackSource = fs.readFileSync(rollbackPath, "utf8");
const dashboardSource = fs.readFileSync(dashboardPath, "utf8");

interface SqlCall {
  query: string;
  values: unknown[];
}

interface HarnessOptions {
  env?: Record<string, string | undefined>;
  dbFail?: boolean;
}

function loadDashboardSingleFile(opts: HarnessOptions = {}) {
  const defaultEnv: Record<string, string | undefined> = {
    SUPABASE_DB_URL: "postgres://local-mock/db",
    SUPABASE_SECRET_KEYS: JSON.stringify({ default: "sb_secret_test_key_2026" }),
    SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role_mock.sig",
    ...opts.env,
  };

  const sqlCalls: SqlCall[] = [];
  let capturedHandler: ((req: Request) => Promise<Response>) | null = null;
  const errorLogs: string[] = [];

  const mockPostgres = (_url: string, _options: unknown) => {
    return (strings: TemplateStringsArray, ...values: unknown[]) => {
      const query = strings.join("$?").replace(/\s+/g, " ").trim();
      sqlCalls.push({ query, values });
      if (opts.dbFail) {
        return Promise.reject(new Error("connection error: postgres://secret@internal"));
      }
      return Promise.resolve([]);
    };
  };

  // Remove apenas as duas linhas de import do topo (específicas do runtime Deno/JSR)
  // e transpila as anotações de tipo TypeScript mantendo 100% da lógica original.
  const executableTs = dashboardSource
    .replace(/^import\s+"jsr:@supabase\/functions-js\/edge-runtime\.d\.ts";\r?\n/, "")
    .replace(/^import\s+postgres\s+from\s+"npm:postgres@3\.4\.7";\r?\n/, "");

  const transpiled = ts.transpileModule(executableTs, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;

  const sandbox = {
    Deno: {
      env: {
        get: (name: string) => defaultEnv[name],
      },
      serve: (fn: (req: Request) => Promise<Response>) => {
        capturedHandler = fn;
      },
    },
    postgres: mockPostgres,
    Response,
    Request,
    Headers,
    crypto,
    TextEncoder,
    TextDecoder,
    console: {
      error: (msg: string) => errorLogs.push(String(msg)),
    },
    exports: {},
  };

  vm.runInNewContext(transpiled, sandbox, { filename: "receber-lead.dashboard.mensagem.index.ts" });

  if (!capturedHandler) {
    throw new Error("Deno.serve handler was not registered");
  }

  return {
    handler: capturedHandler as (req: Request) => Promise<Response>,
    sqlCalls,
    errorLogs,
  };
}

const basePayload = {
  nome: "Maria Oliveira",
  email: "Maria.Oliveira@Exemplo.com.br",
  whatsapp: "(11) 91547-0723",
  tipo_atividade: "Serviços Administrativos",
  origem: "site-floating-form",
};

function makePost(
  body: unknown,
  headers: Record<string, string> = {
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_mock.sig",
    apikey: "sb_secret_test_key_2026",
    "Content-Type": "application/json",
  },
) {
  return new Request("https://jsmxdavhddvwuspzqtkn.supabase.co/functions/v1/receber-lead", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("[dashboard-single-file] preserva intocado o arquivo de rollback e altera apenas o necessário para mensagem", () => {
  const rollbackLines = rollbackSource.replace(/\r\n/g, "\n").trim().split("\n");
  const dashboardLines = dashboardSource.replace(/\r\n/g, "\n").trim().split("\n");

  assert.equal(rollbackLines.length, 86);
  assert.equal(dashboardLines.length, 87);

  // Confirma que a função authorized() é 100% idêntica byte a byte entre os dois arquivos
  const extractAuthorized = (src: string) => {
    const normalized = src.replace(/\r\n/g, "\n");
    const start = normalized.indexOf("async function authorized");
    const end = normalized.indexOf("async function readJson");
    return normalized.slice(start, end);
  };
  assert.equal(extractAuthorized(dashboardSource), extractAuthorized(rollbackSource));
});

test("[dashboard-single-file] 1. mensagem válida (incluindo 1.000 caracteres sem truncamento) -> 201", async () => {
  const { handler, sqlCalls } = loadDashboardSingleFile();
  const msg1000 = "Gostaria de abrir meu MEI e contratar assessoria mensal. ".padEnd(1000, "M");
  assert.equal(msg1000.length, 1000);

  const res = await handler(makePost({ ...basePayload, mensagem: msg1000 }));
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");

  assert.equal(sqlCalls.length, 1);
  assert.equal(
    sqlCalls[0].query,
    "insert into public.leads (nome, email, whatsapp, tipo_atividade, origem, mensagem) values ($?, $?, $?, $?, $?, $?)",
  );
  assert.deepEqual(sqlCalls[0].values, [
    "Maria Oliveira",
    "maria.oliveira@exemplo.com.br",
    "11915470723",
    "Serviços Administrativos",
    "site-floating-form",
    msg1000,
  ]);
});

test("[dashboard-single-file] 2 e 3. mensagem ausente e mensagem null -> 201 gravando null (retrocompatibilidade)", async () => {
  const { handler, sqlCalls } = loadDashboardSingleFile();

  // Mensagem ausente
  const resAbsent = await handler(makePost(basePayload));
  assert.equal(resAbsent.status, 201);

  // Mensagem null
  const resNull = await handler(makePost({ ...basePayload, mensagem: null }));
  assert.equal(resNull.status, 201);

  assert.equal(sqlCalls.length, 2);
  assert.equal(sqlCalls[0].values[5], null);
  assert.equal(sqlCalls[1].values[5], null);
});

test("[dashboard-single-file] 4 e 5. mensagem vazia, apenas espaços, > 1.000 caracteres ou tipo inválido -> 400", async () => {
  const { handler, sqlCalls } = loadDashboardSingleFile();

  for (const invalidMsg of ["", "     ", "x".repeat(1001), 12345, true, {}, []]) {
    const res = await handler(makePost({ ...basePayload, mensagem: invalidMsg }));
    assert.equal(res.status, 400);
  }

  assert.equal(sqlCalls.length, 0);
});

test("[dashboard-single-file] 6. campo desconhecido -> 400 { erro: 'Campo desconhecido.' }", async () => {
  const { handler, sqlCalls } = loadDashboardSingleFile();
  const res = await handler(makePost({ ...basePayload, campo_extra: "invalido" }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { erro: "Campo desconhecido." });
  assert.equal(sqlCalls.length, 0);
});

test("[dashboard-single-file] 7. preservação da autenticação original (SUPABASE_SECRET_KEYS e SUPABASE_SERVICE_ROLE_KEY)", async () => {
  const { handler, sqlCalls } = loadDashboardSingleFile();

  // A. SUPABASE_SECRET_KEYS (apikey começando com sb_secret_ + Authorization com JWT anon)
  const rSecretKey = await handler(
    makePost(basePayload, {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_mock.sig",
      apikey: "sb_secret_test_key_2026",
      "Content-Type": "application/json",
    }),
  );
  assert.equal(rSecretKey.status, 201);

  // B. SUPABASE_SERVICE_ROLE_KEY via Authorization Bearer
  const rServiceRole = await handler(
    makePost(basePayload, {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role_mock.sig",
      "Content-Type": "application/json",
    }),
  );
  assert.equal(rServiceRole.status, 201);

  // C. Credencial incorreta -> 401
  const rInvalid = await handler(
    makePost(basePayload, {
      Authorization: "Bearer token-invalido",
      apikey: "sb_secret_invalida",
      "Content-Type": "application/json",
    }),
  );
  assert.equal(rInvalid.status, 401);
  assert.equal(sqlCalls.length, 2);
});

test("[dashboard-single-file] 8. dry-run (validar_apenas: true) consulta as 8 colunas incluindo mensagem sem inserir", async () => {
  const { handler, sqlCalls } = loadDashboardSingleFile();
  const res = await handler(
    makePost({
      ...basePayload,
      mensagem: "Teste dry-run com coluna mensagem.",
      validar_apenas: true,
    }),
  );
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, validado: true, gravado: false });
  assert.equal(sqlCalls.length, 1);
  assert.equal(
    sqlCalls[0].query,
    "select id, created_at, nome, email, whatsapp, tipo_atividade, origem, mensagem from public.leads limit 0",
  );
  assert.deepEqual(sqlCalls[0].values, []);
});

test("[dashboard-single-file] 9. preservação das demais validações (405, 403 Origin, 415, 413, 400, 503)", async () => {
  const { handler, sqlCalls } = loadDashboardSingleFile();

  // Método diferente de POST -> 405
  const rGet = await handler(
    new Request("https://jsmxdavhddvwuspzqtkn.supabase.co/functions/v1/receber-lead", {
      method: "GET",
    }),
  );
  assert.equal(rGet.status, 405);

  // Cabeçalho Origin presente -> 403
  const rOrigin = await handler(
    makePost(basePayload, {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_mock.sig",
      apikey: "sb_secret_test_key_2026",
      Origin: "https://site-externo.com",
      "Content-Type": "application/json",
    }),
  );
  assert.equal(rOrigin.status, 403);

  // Content-Type inválido -> 415
  const rCt = await handler(
    makePost(basePayload, {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_mock.sig",
      apikey: "sb_secret_test_key_2026",
      "Content-Type": "text/plain",
    }),
  );
  assert.equal(rCt.status, 415);

  // Payload > 16.384 bytes -> 413
  const rBig = await handler(makePost({ ...basePayload, mensagem: "a".repeat(17000) }));
  assert.equal(rBig.status, 413);

  // Campos obrigatórios inválidos -> 400
  const rBadEmail = await handler(makePost({ ...basePayload, email: "email-invalido" }));
  assert.equal(rBadEmail.status, 400);

  assert.equal(sqlCalls.length, 0);

  // Falha de banco -> 503 sem expor detalhes internos
  const failSetup = loadDashboardSingleFile({ dbFail: true });
  const rDbFail = await failSetup.handler(makePost(basePayload));
  assert.equal(rDbFail.status, 503);
  const errText = await rDbFail.text();
  assert.ok(!errText.includes("postgres://"));
});
