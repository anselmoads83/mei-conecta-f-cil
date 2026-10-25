// Autenticação da Edge Function receber-lead.
// Módulo puro (usa apenas Web Crypto / Headers) para permitir testes locais.
//
// Credenciais aceitas:
//   1. LEAD_INGEST_SECRET          -> credencial dedicada (novo fluxo Vercel -> Supabase)
//   2. SUPABASE_SECRET_KEYS (JSON) -> transitória, gerenciada pelo Supabase (somente leitura)
//   3. SUPABASE_SERVICE_ROLE_KEY   -> transitória, legado
// Nenhuma variável gerenciada pelo Supabase é escrita ou modificada aqui.

export type EnvGetter = (name: string) => string | undefined;

export type AuthMethod = "dedicated" | "secret_keys" | "service_role";

export type AuthResult = { ok: true; method: AuthMethod } | { ok: false };

// Comparação em tempo constante sobre digests SHA-256 (tamanho fixo de 32 bytes),
// evitando vazamento de conteúdo ou comprimento por temporização.
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const bufA = new Uint8Array(hashA);
  const bufB = new Uint8Array(hashB);
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

// SUPABASE_SECRET_KEYS é um objeto JSON (ex.: {"default":"sb_secret_..."}).
// Valores inválidos ou formatos diferentes resultam em lista vazia (falha segura).
export function parseSecretKeys(raw: string | undefined): string[] {
  if (!raw || raw.trim().length === 0) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return [];
    return Object.values(parsed as Record<string, unknown>)
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  } catch {
    return [];
  }
}

// Credenciais candidatas: "Authorization: Bearer <token>" e "apikey: <token>".
export function extractCredentials(headers: Headers): string[] {
  const candidates: string[] = [];
  const authorization = headers.get("authorization");
  if (authorization) {
    const match = /^Bearer\s+(\S+)\s*$/i.exec(authorization.trim());
    if (match) candidates.push(match[1]);
  }
  const apikey = headers.get("apikey")?.trim();
  if (apikey) candidates.push(apikey);
  return candidates;
}

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function authenticate(headers: Headers, getEnv: EnvGetter): Promise<AuthResult> {
  const candidates = extractCredentials(headers);
  if (candidates.length === 0) return { ok: false };

  const accepted: Array<{ secret: string; method: AuthMethod }> = [];

  const dedicated = nonEmpty(getEnv("LEAD_INGEST_SECRET"));
  if (dedicated) accepted.push({ secret: dedicated, method: "dedicated" });

  for (const key of parseSecretKeys(getEnv("SUPABASE_SECRET_KEYS"))) {
    accepted.push({ secret: key, method: "secret_keys" });
  }

  const serviceRole = nonEmpty(getEnv("SUPABASE_SERVICE_ROLE_KEY"));
  if (serviceRole) accepted.push({ secret: serviceRole, method: "service_role" });

  if (accepted.length === 0) return { ok: false };

  // Avalia todas as combinações (sem interrupção antecipada) e retorna o
  // método de maior prioridade que coincidiu.
  let matched: AuthMethod | null = null;
  for (const entry of accepted) {
    for (const candidate of candidates) {
      if ((await safeEqual(candidate, entry.secret)) && matched === null) {
        matched = entry.method;
      }
    }
  }

  return matched ? { ok: true, method: matched } : { ok: false };
}
