// Testes UNITÁRIOS (funções isoladas): validation.ts e auth.ts.
// Execução: node --test supabase/functions/receber-lead/tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLead, normalizeWhatsapp, LIMITS, MAX_PAYLOAD_BYTES } from "../validation.ts";
import { authenticate, parseSecretKeys, safeEqual } from "../auth.ts";

const base = {
  nome: "Maria Silva",
  email: "Maria@Exemplo.com.br",
  whatsapp: "+55 (11) 91547-0723",
  tipo_atividade: null,
  origem: "site",
};

// ---------- 1. Limites originais e contagem por .length ----------
test("[unit] nome: 150 aceito, 151 rejeitado", () => {
  assert.equal(validateLead({ ...base, nome: "a".repeat(LIMITS.nome) }).ok, true);
  assert.equal(validateLead({ ...base, nome: "a".repeat(LIMITS.nome + 1) }).ok, false);
});

test("[unit] contagem de caracteres usa .length (UTF-16) e não Array.from", () => {
  // 149 caracteres ASCII + 1 emoji (par substituto UTF-16: .length === 2) => .length === 151.
  const comEmoji = "a".repeat(149) + "😀";
  assert.equal(Array.from(comEmoji).length, 150);
  assert.equal(comEmoji.length, 151);
  assert.equal(validateLead({ ...base, nome: comEmoji }).ok, false);
  assert.equal(validateLead({ ...base, tipo_atividade: comEmoji }).ok, false);
});

test("[unit] email: 254 aceito, 255 rejeitado", () => {
  const ok = "a".repeat(254 - "@ex.com".length) + "@ex.com";
  assert.equal(ok.length, 254);
  assert.equal(validateLead({ ...base, email: ok }).ok, true);
  assert.equal(validateLead({ ...base, email: "a" + ok }).ok, false);
});

test("[unit] origem: 100 aceito, 101 rejeitado", () => {
  assert.equal(validateLead({ ...base, origem: "o".repeat(100) }).ok, true);
  assert.equal(validateLead({ ...base, origem: "o".repeat(101) }).ok, false);
});

test("[unit] tipo_atividade: 150 aceito, 151 rejeitado, vazio rejeitado, null aceito, ausente rejeitado", () => {
  assert.equal(validateLead({ ...base, tipo_atividade: "t".repeat(150) }).ok, true);
  assert.equal(validateLead({ ...base, tipo_atividade: "t".repeat(151) }).ok, false);
  assert.equal(validateLead({ ...base, tipo_atividade: "   " }).ok, false);
  assert.equal(validateLead({ ...base, tipo_atividade: "" }).ok, false);
  const rNull = validateLead({ ...base, tipo_atividade: null });
  assert.ok(rNull.ok);
  if (rNull.ok) assert.equal(rNull.lead.tipo_atividade, null);
  const { tipo_atividade: _t, ...semTipo } = base;
  assert.equal(validateLead(semTipo).ok, false);
  assert.equal(validateLead({ ...base, tipo_atividade: 123 }).ok, false);
});

test("[unit] limite de payload é 16.384 bytes", () => {
  assert.equal(MAX_PAYLOAD_BYTES, 16384);
});

// ---------- 2. Origem obrigatória ----------
test("[unit] origem obrigatória", () => {
  const { origem: _o, ...semOrigem } = base;
  assert.equal(validateLead(semOrigem).ok, false);
  assert.equal(validateLead({ ...base, origem: "  " }).ok, false);
});

test("[unit] nome, email e whatsapp obrigatórios", () => {
  for (const field of ["nome", "email", "whatsapp"] as const) {
    const copy: Record<string, unknown> = { ...base };
    delete copy[field];
    assert.equal(validateLead(copy).ok, false, field);
  }
});

test("[unit] email normalizado em minúsculas", () => {
  const r = validateLead(base);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.lead.email, "maria@exemplo.com.br");
});

// ---------- 3. WhatsApp: limite bruto de 30 e normalização ----------
test("[unit] whatsapp bruto: até 30 caracteres aceito, 31 rejeitado antes da normalização", () => {
  assert.equal(LIMITS.whatsapp, 30);
  // "+55 (11) 91547-0723" (19) + 11 hífens = 30 caracteres brutos; normaliza para "+5511915470723".
  const trinta = "+55 (11) 91547-0723" + "-".repeat(11);
  assert.equal(trinta.length, 30);
  assert.equal(validateLead({ ...base, whatsapp: trinta }).ok, true);

  // 31 caracteres brutos: mesmo normalizando para 14 dígitos, deve ser rejeitado pelo limite bruto.
  const trintaEUm = "+55 (11) 91547-0723" + "-".repeat(12);
  assert.equal(trintaEUm.length, 31);
  assert.equal(validateLead({ ...base, whatsapp: trintaEUm }).ok, false);
});

test("[unit] whatsapp normalizado e validado por ^\\+?[0-9]{10,15}$", () => {
  assert.equal(normalizeWhatsapp("+55 (11) 91547-0723"), "+5511915470723");
  assert.equal(normalizeWhatsapp("11.91547.0723"), "11915470723");
  const r = validateLead(base);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.lead.whatsapp, "+5511915470723");
  assert.equal(validateLead({ ...base, whatsapp: "123456789" }).ok, false); // 9 dígitos
  assert.equal(validateLead({ ...base, whatsapp: "1234567890123456" }).ok, false); // 16
  assert.equal(validateLead({ ...base, whatsapp: "11abc915470723" }).ok, false);
  assert.equal(validateLead({ ...base, whatsapp: "55+11915470723" }).ok, false);
});

// ---------- 4. Campos desconhecidos ----------
test("[unit] campos desconhecidos rejeitados", () => {
  assert.equal(validateLead({ ...base, admin: true }).ok, false);
});

test("[unit] validar_apenas exclusivamente booleano", () => {
  assert.equal(validateLead({ ...base, validar_apenas: true }).ok, true);
  assert.equal(validateLead({ ...base, validar_apenas: "true" }).ok, false);
  assert.equal(validateLead({ ...base, validar_apenas: 1 }).ok, false);
});

test("[unit] corpo não-objeto rejeitado", () => {
  for (const v of [null, [], "x", 1]) assert.equal(validateLead(v).ok, false);
});

// ---------- Autenticação isolada ----------
test("[unit] safeEqual", async () => {
  assert.equal(await safeEqual("abc", "abc"), true);
  assert.equal(await safeEqual("abc", "abd"), false);
  assert.equal(await safeEqual("abc", "abcd"), false);
});

test("[unit] parseSecretKeys interpreta JSON e falha com segurança", () => {
  assert.deepEqual(parseSecretKeys('{"default":"sb_secret_A","outra":"sb_secret_B"}'), [
    "sb_secret_A",
    "sb_secret_B",
  ]);
  assert.deepEqual(parseSecretKeys("sb_secret_A"), []); // não-JSON
  assert.deepEqual(parseSecretKeys('["a"]'), []); // array
  assert.deepEqual(parseSecretKeys('{"x":1,"y":""}'), []);
  assert.deepEqual(parseSecretKeys(undefined), []);
});

const env = (vars: Record<string, string>) => (name: string) => vars[name];

test("[unit] authenticate: segredo dedicado via Bearer e via apikey", async () => {
  const getEnv = env({ LEAD_INGEST_SECRET: "dedicado-123" });
  const r1 = await authenticate(new Headers({ Authorization: "Bearer dedicado-123" }), getEnv);
  const r2 = await authenticate(new Headers({ apikey: "dedicado-123" }), getEnv);
  assert.deepEqual(r1, { ok: true, method: "dedicated" });
  assert.deepEqual(r2, { ok: true, method: "dedicated" });
});

test("[unit] authenticate: rejeita inválido, ausente e ambiente vazio", async () => {
  const getEnv = env({ LEAD_INGEST_SECRET: "dedicado-123" });
  assert.equal((await authenticate(new Headers({ Authorization: "Bearer x" }), getEnv)).ok, false);
  assert.equal((await authenticate(new Headers(), getEnv)).ok, false);
  assert.equal((await authenticate(new Headers({ Authorization: "dedicado-123" }), getEnv)).ok, false); // sem "Bearer"
  assert.equal((await authenticate(new Headers({ apikey: "qualquer" }), env({}))).ok, false);
  assert.equal(
    (await authenticate(new Headers({ apikey: "   " }), env({ LEAD_INGEST_SECRET: "   " }))).ok,
    false,
  );
});

test("[unit] authenticate: credenciais transitórias continuam aceitas", async () => {
  const getEnv = env({
    LEAD_INGEST_SECRET: "dedicado-123",
    SUPABASE_SECRET_KEYS: '{"default":"sb_secret_xyz"}',
    SUPABASE_SERVICE_ROLE_KEY: "service-role-jwt",
  });
  assert.deepEqual(await authenticate(new Headers({ apikey: "sb_secret_xyz" }), getEnv), {
    ok: true,
    method: "secret_keys",
  });
  assert.deepEqual(
    await authenticate(new Headers({ Authorization: "Bearer service-role-jwt" }), getEnv),
    { ok: true, method: "service_role" },
  );
});

test("[unit] authenticate: JWT anon no Authorization + segredo no apikey é aceito", async () => {
  // Cenário do período de transição com Verify JWT ainda habilitado.
  const getEnv = env({ LEAD_INGEST_SECRET: "dedicado-123" });
  const r = await authenticate(
    new Headers({ Authorization: "Bearer jwt-anon-qualquer", apikey: "dedicado-123" }),
    getEnv,
  );
  assert.deepEqual(r, { ok: true, method: "dedicated" });
});
