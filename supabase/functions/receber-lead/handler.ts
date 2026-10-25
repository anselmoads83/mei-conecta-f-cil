// Handler HTTP da Edge Function receber-lead (independente do runtime).
// A persistência é injetada (LeadRepository) para permitir testes locais
// do handler completo sem acesso ao banco publicado.

import { authenticate } from "./auth.ts";
import type { EnvGetter } from "./auth.ts";
import { MAX_PAYLOAD_BYTES, validateLead } from "./validation.ts";
import type { Lead } from "./validation.ts";

export interface LeadRepository {
  dryRun(): Promise<void>;
  insert(lead: Lead): Promise<void>;
}

export interface HandlerDeps {
  getEnv: EnvGetter;
  getRepository: () => LeadRepository;
  log?: (event: string) => void;
}

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...extra } });
}

class PayloadTooLargeError extends Error {}

// Lê o corpo respeitando o limite, inclusive sem Content-Length (chunked).
async function readBodyLimited(req: Request, max: number): Promise<Uint8Array> {
  const declared = req.headers.get("content-length");
  if (declared !== null) {
    const size = Number(declared);
    if (Number.isFinite(size) && size > max) throw new PayloadTooLargeError();
  }
  if (!req.body) return new Uint8Array(0);

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => {});
      throw new PayloadTooLargeError();
    }
    chunks.push(value);
  }

  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

export function createHandler(deps: HandlerDeps): (req: Request) => Promise<Response> {
  const log = deps.log ?? (() => {});

  return async (req: Request): Promise<Response> => {
    // 1. Bloqueio de chamadas originadas em navegador (não é autenticação).
    if (req.headers.has("origin")) {
      return json(403, { erro: "Origem não permitida." });
    }

    // 2. Método HTTP.
    if (req.method !== "POST") {
      return json(405, { erro: "Método não permitido." }, { Allow: "POST" });
    }

    // 3. Autenticação (antes de qualquer leitura do corpo).
    const auth = await authenticate(req.headers, deps.getEnv);
    if (!auth.ok) {
      return json(401, { erro: "Não autorizado." });
    }
    if (auth.method !== "dedicated") {
      log("legacy_credential_used");
    }

    // 4. Content-Type deve começar com application/json (sem diferenciar maiúsculas).
    const contentType = (req.headers.get("content-type") ?? "").trim().toLowerCase();
    if (!contentType.startsWith("application/json")) {
      return json(415, { erro: "Content-Type deve ser application/json." });
    }

    // 5. Limite de payload (16.384 bytes).
    let raw: Uint8Array;
    try {
      raw = await readBodyLimited(req, MAX_PAYLOAD_BYTES);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return json(413, { erro: "Payload excede o limite permitido." });
      }
      return json(400, { erro: "Corpo da requisição inválido." });
    }

    // 6. JSON.
    let body: unknown;
    try {
      body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw));
    } catch {
      return json(400, { erro: "JSON inválido." });
    }

    // 7. Contrato.
    const result = validateLead(body);
    if (!result.ok) {
      return json(400, { erro: "Dados inválidos.", detalhes: result.errors });
    }

    // 8. Banco: dry-run (consulta de estrutura) ou inserção.
    try {
      const repository = deps.getRepository();

      if (result.validarApenas) {
        await repository.dryRun();
        return json(200, { ok: true, validado: true, gravado: false });
      }

      await repository.insert(result.lead);
      return json(201, { ok: true });
    } catch {
      // Conexão indisponível ou erro de banco. Nenhum detalhe interno
      // (mensagem, stack, dados do lead) é exposto ou registrado.
      log("database_unavailable");
      return json(503, { erro: "Serviço temporariamente indisponível." });
    }
  };
}
