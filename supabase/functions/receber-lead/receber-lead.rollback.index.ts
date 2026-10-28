import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.7";

// Server-to-server endpoint. Never place a privileged key in website code.
const dbUrl = Deno.env.get("SUPABASE_DB_URL");
const sql = dbUrl ? postgres(dbUrl, { max: 1, prepare: false, ssl: "require", idle_timeout: 20, connect_timeout: 10 }) : null;
const maxBytes = 16384;
const reply = (status: number, body: object) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

async function authorized(req: Request): Promise<boolean> {
  let currentKeys: string[] = [];
  try { currentKeys = Object.values(JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}")).filter((v): v is string => typeof v === "string"); } catch { return false; }
  const expected = [...currentKeys, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")].filter((v): v is string => !!v);
  const supplied = req.headers.get("apikey")?.startsWith("sb_secret_") ? req.headers.get("apikey")! : req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!expected.length || !supplied || supplied.length > 4096) return false;
  const digest = async (value: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  const b = await digest(supplied);
  let matched = 0;
  for (const key of expected) {
    const a = await digest(key);
    let difference = 0;
    for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
    matched |= Number(difference === 0);
  }
  return matched === 1;
}

async function readJson(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("json");
  const parts: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) { await reader.cancel(); throw new Error("size"); }
      parts.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply(405, { erro: "Use POST." });
  if (!(await authorized(req))) return reply(401, { erro: "Acesso nao autorizado." });
  // Browsers must call a separate protected form integration, never this admin endpoint.
  if (req.headers.has("origin")) return reply(403, { erro: "Endpoint exclusivo para servidor." });
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return reply(415, { erro: "Envie application/json." });
  let body: Record<string, unknown>;
  try {
    body = await readJson(req);
  } catch (error) {
    return reply(error instanceof Error && error.message === "size" ? 413 : 400, { erro: "JSON invalido ou tamanho excedido." });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, { erro: "Envie um objeto JSON." });
  const allowed = new Set(["nome", "email", "whatsapp", "tipo_atividade", "origem", "validar_apenas"]);
  if (Object.keys(body).some((key) => !allowed.has(key))) return reply(400, { erro: "Campo desconhecido." });
  const text = (key: string, max: number) => typeof body[key] === "string" && (body[key] as string).trim().length <= max ? (body[key] as string).trim() : "";
  const nome = text("nome", 150);
  const email = text("email", 254).toLowerCase();
  const whatsappRaw = text("whatsapp", 30);
  const whatsapp = whatsappRaw.replace(/[ ().-]/g, "");
  const origem = text("origem", 100);
  const tipo = body.tipo_atividade == null ? null : text("tipo_atividade", 150);
  if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?[0-9]{10,15}$/.test(whatsapp) || !origem || (body.tipo_atividade != null && !tipo) || (body.validar_apenas !== undefined && typeof body.validar_apenas !== "boolean")) {
    return reply(400, { erro: "Confira nome, email, whatsapp, origem e tipo_atividade." });
  }
  if (!sql) return reply(503, { erro: "Conexao interna indisponivel." });
  try {
    if (body.validar_apenas === true) {
      await sql`select id, created_at, nome, email, whatsapp, tipo_atividade, origem from public.leads limit 0`;
      return reply(200, { ok: true, validado: true, gravado: false });
    }
    await sql`insert into public.leads (nome, email, whatsapp, tipo_atividade, origem) values (${nome}, ${email}, ${whatsapp}, ${tipo}, ${origem})`;
    return reply(201, { ok: true });
  } catch {
    // Do not log payloads, database URLs, credentials, or database error details.
    console.error("receber-lead: database operation failed");
    return reply(503, { erro: "Nao foi possivel processar. Tente novamente mais tarde." });
  }
});
