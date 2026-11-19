import crypto from "node:crypto";
import { getServerConfig, type ServerConfig } from "./config.server.ts";
import { cleanCnpjDigits, formatCnpj, validateCnpj } from "./cnpj.ts";

// Módulo exclusivamente de servidor (.server.ts).
// O Vite impede que este arquivo seja incluído no bundle do navegador,
// garantindo que BREVO_API_KEY e configurações confidenciais nunca cheguem ao cliente.

export const FORM_LIMITS = {
  nomeMin: 3,
  nomeMax: 100,
  emailMax: 120,
  whatsappRawMax: 30,
  cnpjRawMax: 25,
  mensagemMin: 10,
  mensagemMax: 1000,
  tipoAtividadeMax: 150,
  origemMax: 100,
} as const;

export const PROTECTION_DEFAULTS = {
  timeoutMs: 10_000,
  minFillTimeMs: 1_200,
  duplicatePayloadTtlMs: 5 * 60 * 1_000, // 5 minutos para payload idêntico
  contactWindowMs: 2 * 60 * 1_000, // 2 minutos por e-mail/WhatsApp
  contactMaxPerWindow: 2,
  clientWindowMs: 10 * 60 * 1_000, // 10 minutos por chave de cliente
  clientMaxPerWindow: 5,
  globalWindowMs: 60 * 1_000, // 1 minuto global na instância
  globalMaxPerWindow: 30,
  maxConcurrent: 5,
  maxTrackedKeys: 2_000,
} as const;

export const BREVO_API_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export interface LeadFormSubmissionInput {
  name: unknown;
  phone: unknown;
  email: unknown;
  cnpj?: unknown;
  consentimento_comunicados?: unknown;
  message?: unknown;
  tipo_atividade?: unknown;
  origem?: unknown;
  validar_apenas?: unknown;
  honeypot?: unknown;
  elapsedMs?: unknown;
}

export type PublicLeadFormSubmissionInput = Omit<LeadFormSubmissionInput, "validar_apenas">;

export function sanitizePublicLeadInput(input: unknown): PublicLeadFormSubmissionInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {
      name: undefined,
      phone: undefined,
      email: undefined,
      message: undefined,
    };
  }

  const data = input as Record<string, unknown>;
  return {
    name: data.name,
    phone: data.phone,
    email: data.email,
    ...(data.cnpj !== undefined ? { cnpj: data.cnpj } : {}),
    ...(data.consentimento_comunicados !== undefined
      ? { consentimento_comunicados: data.consentimento_comunicados }
      : {}),
    ...(data.message !== undefined ? { message: data.message } : {}),
    ...(data.tipo_atividade !== undefined ? { tipo_atividade: data.tipo_atividade } : {}),
    ...(data.origem !== undefined ? { origem: data.origem } : {}),
    ...(data.honeypot !== undefined ? { honeypot: data.honeypot } : {}),
    ...(data.elapsedMs !== undefined ? { elapsedMs: data.elapsedMs } : {}),
  };
}

export interface ValidatedLeadPayload {
  nome: string;
  email: string;
  whatsapp: string;
  cnpj: string | null;
  cnpjFormatado: string | null;
  consentimentoComunicados: boolean;
  consentimentoData: string | null;
  consentimentoVersao: string | null;
  tipo_atividade: string | null;
  origem: string;
  mensagem: string | null;
  validar_apenas?: boolean;
}

export interface RequestMetadata {
  headers?: Headers | Record<string, string | undefined>;
}

export type LeadSubmissionErrorCode =
  | "validation_error"
  | "spam_detected"
  | "too_fast"
  | "forbidden_origin"
  | "duplicate_submission"
  | "contact_rate_limited"
  | "rate_limited"
  | "server_misconfigured"
  | "upstream_timeout"
  | "upstream_unavailable";

export type LeadSubmissionResult =
  | {
      ok: true;
      status: 201;
      enviado: boolean;
      gravado: true; // mantido para compatibilidade reversa com os consumidores do front-end
      internalNotificationSent: boolean;
      visitorConfirmationSent: boolean;
    }
  | {
      ok: true;
      status: 200;
      validado: true;
      enviado: false;
      gravado: false;
    }
  | {
      ok: false;
      status: 400 | 403 | 429 | 502 | 503;
      code: LeadSubmissionErrorCode;
      error: string;
      fieldErrors?: Partial<
        Record<"name" | "phone" | "email" | "cnpj" | "message" | "tipo_atividade" | "origem", string>
      >;
    };

export interface LeadSubmissionServiceDeps {
  getConfig?: () => ServerConfig;
  fetchImpl?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
  log?: (event: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

/**
 * Escapa caracteres sensíveis para evitar que entradas de formulário
 * sejam interpretadas como HTML executável nos templates.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function validateBrazilianPhoneDigits(raw: string): { ok: true; digits: string } | { ok: false } {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 11) return { ok: false };
  const ddd = Number.parseInt(digits.slice(0, 2), 10);
  if (!Number.isFinite(ddd) || ddd < 11 || ddd > 99) return { ok: false };
  if (digits.length === 11 && digits[2] !== "9") return { ok: false };
  if (/^(\d)\1+$/.test(digits) || /^(\d)\1+$/.test(digits.slice(2))) return { ok: false };
  return { ok: true, digits };
}

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function getHeader(
  headers: Headers | Record<string, string | undefined> | undefined,
  name: string,
): string | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

export function validateAndMapFormInput(input: unknown):
  | {
      ok: true;
      payload: ValidatedLeadPayload;
      contactEmail: string;
      contactWhatsappDigits: string;
      honeypotTriggered: boolean;
      elapsedMs: number | null;
    }
  | {
      ok: false;
      fieldErrors: Partial<
        Record<"name" | "phone" | "email" | "cnpj" | "message" | "tipo_atividade" | "origem", string>
      >;
    } {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {
      ok: false,
      fieldErrors: { name: "Dados de envio inválidos." },
    };
  }

  const data = input as Record<string, unknown>;
  const fieldErrors: Partial<
    Record<"name" | "phone" | "email" | "cnpj" | "message" | "tipo_atividade" | "origem", string>
  > = {};

  // Honeypot anti-bot
  const honeypotTriggered =
    typeof data.honeypot === "string"
      ? data.honeypot.trim().length > 0
      : data.honeypot !== undefined && data.honeypot !== null && data.honeypot !== "";

  let elapsedMs: number | null = null;
  if (typeof data.elapsedMs === "number" && Number.isFinite(data.elapsedMs)) {
    elapsedMs = data.elapsedMs;
  }

  // 1. Nome completo
  const rawName = typeof data.name === "string" ? data.name.trim() : "";
  if (!rawName) {
    fieldErrors.name = "Por favor, informe seu nome completo.";
  } else if (rawName.length < FORM_LIMITS.nomeMin) {
    fieldErrors.name = "O nome deve conter pelo menos 3 caracteres.";
  } else if (rawName.length > FORM_LIMITS.nomeMax) {
    fieldErrors.name = "O nome não pode exceder 100 caracteres.";
  } else if (CONTROL_CHARS_REGEX.test(rawName)) {
    fieldErrors.name = "O nome contém caracteres inválidos.";
  }

  // 2. WhatsApp
  const rawPhone = typeof data.phone === "string" ? data.phone.trim() : "";
  let normalizedWhatsappDigits = "";
  if (!rawPhone) {
    fieldErrors.phone = "Por favor, informe seu número de WhatsApp.";
  } else if (rawPhone.length > FORM_LIMITS.whatsappRawMax) {
    fieldErrors.phone = "Informe um número válido com DDD (ex: (11) 99999-9999).";
  } else {
    const phoneCheck = validateBrazilianPhoneDigits(rawPhone);
    if (!phoneCheck.ok) {
      fieldErrors.phone = "Informe um número válido com DDD (ex: (11) 99999-9999).";
    } else {
      normalizedWhatsappDigits = phoneCheck.digits;
    }
  }

  // 3. E-mail
  const rawEmail = typeof data.email === "string" ? data.email.trim() : "";
  const normalizedEmail = rawEmail.toLowerCase();
  if (!rawEmail) {
    fieldErrors.email = "Por favor, informe seu e-mail.";
  } else if (rawEmail.length > FORM_LIMITS.emailMax) {
    fieldErrors.email = "O e-mail não pode exceder 120 caracteres.";
  } else if (!EMAIL_REGEX.test(normalizedEmail) || CONTROL_CHARS_REGEX.test(normalizedEmail)) {
    fieldErrors.email = "Informe um endereço de e-mail válido.";
  }

  // Identificação do formulário pela origem
  let origem = "site-floating-form";
  if (data.origem !== undefined && data.origem !== null) {
    if (typeof data.origem !== "string") {
      fieldErrors.origem = "A origem informada é inválida.";
    } else {
      const trimmedOrigem = data.origem.trim();
      if (trimmedOrigem.length === 0 || trimmedOrigem.length > FORM_LIMITS.origemMax) {
        fieldErrors.origem = "A origem informada é inválida.";
      } else {
        origem = trimmedOrigem;
      }
    }
  }

  const isMei360 = origem === "popup-desktop-mei-360" || origem === "menu-mobile-mei-360";

  // 4. CNPJ (Obrigatório para MEI 360°, não aplicável para Fale Conosco)
  let cleanedCnpj: string | null = null;
  let formattedCnpj: string | null = null;
  if (isMei360) {
    const rawCnpj = typeof data.cnpj === "string" ? data.cnpj.trim() : "";
    cleanedCnpj = cleanCnpjDigits(rawCnpj);
    if (!rawCnpj) {
      fieldErrors.cnpj = "Por favor, informe o CNPJ do seu MEI.";
    } else if (cleanedCnpj.length !== 14 || !validateCnpj(cleanedCnpj)) {
      fieldErrors.cnpj = "Informe um CNPJ válido com 14 dígitos (ex: 00.000.000/0000-00).";
    } else {
      formattedCnpj = formatCnpj(cleanedCnpj);
    }
  }

  // 5. Consentimento para novidades e comunicados (Opcional para MEI 360°)
  let consentimentoComunicados = false;
  let consentimentoData: string | null = null;
  let consentimentoVersao: string | null = null;
  if (isMei360 && data.consentimento_comunicados === true) {
    consentimentoComunicados = true;
    consentimentoData = new Date().toISOString();
    consentimentoVersao = "v1-2026-11";
  }

  // 6. Mensagem (Obrigatória para Fale Conosco, Opcional/Nula para MEI 360°)
  let rawMessage: string | null = null;
  if (data.message === undefined || data.message === null || (isMei360 && typeof data.message === "string" && data.message.trim() === "")) {
    if (!isMei360) {
      fieldErrors.message = "Por favor, digite sua mensagem.";
    } else {
      rawMessage = null;
    }
  } else if (typeof data.message === "string") {
    const trimmed = data.message.trim();
    if (!trimmed) {
      if (!isMei360) {
        fieldErrors.message = "Por favor, digite sua mensagem.";
      } else {
        rawMessage = null;
      }
    } else if (trimmed.length < FORM_LIMITS.mensagemMin && !isMei360) {
      fieldErrors.message = "A mensagem deve conter pelo menos 10 caracteres.";
    } else if (trimmed.length > FORM_LIMITS.mensagemMax) {
      fieldErrors.message = "A mensagem não pode exceder 1000 caracteres.";
    } else if (CONTROL_CHARS_REGEX.test(trimmed)) {
      fieldErrors.message = "A mensagem contém caracteres inválidos.";
    } else {
      rawMessage = trimmed;
    }
  } else {
    fieldErrors.message = "A mensagem deve ser um texto válido.";
  }

  // 7. tipo_atividade (opcional, padrão null)
  let tipoAtividade: string | null = null;
  if (data.tipo_atividade !== undefined && data.tipo_atividade !== null) {
    if (typeof data.tipo_atividade !== "string") {
      fieldErrors.tipo_atividade = "O campo tipo de atividade é inválido.";
    } else {
      const trimmedTipo = data.tipo_atividade.trim();
      if (trimmedTipo.length === 0 || trimmedTipo.length > FORM_LIMITS.tipoAtividadeMax) {
        fieldErrors.tipo_atividade = "O campo tipo de atividade deve ter entre 1 e 150 caracteres.";
      } else {
        tipoAtividade = trimmedTipo;
      }
    }
  }

  // 8. validar_apenas (opcional, booleano para testes)
  let validarApenas: boolean | undefined = undefined;
  if (data.validar_apenas !== undefined) {
    if (typeof data.validar_apenas === "boolean") {
      validarApenas = data.validar_apenas;
    } else {
      fieldErrors.name = "Parâmetro de validação inválido.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const payload: ValidatedLeadPayload = {
    nome: rawName,
    email: normalizedEmail,
    whatsapp: rawPhone,
    cnpj: cleanedCnpj,
    cnpjFormatado: formattedCnpj,
    consentimentoComunicados,
    consentimentoData,
    consentimentoVersao,
    tipo_atividade: tipoAtividade,
    origem,
    mensagem: rawMessage,
    ...(validarApenas !== undefined ? { validar_apenas: validarApenas } : {}),
  };

  return {
    ok: true,
    payload,
    contactEmail: normalizedEmail,
    contactWhatsappDigits: normalizedWhatsappDigits,
    honeypotTriggered,
    elapsedMs,
  };
}

export function createLeadSubmissionService(deps: LeadSubmissionServiceDeps = {}) {
  const getConfig = deps.getConfig ?? getServerConfig;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? (() => Date.now());
  const timeoutMs = deps.timeoutMs ?? PROTECTION_DEFAULTS.timeoutMs;
  const log = deps.log ?? (() => {});

  // Estruturas de rate-limit e deduplicação limitadas em memória (Sem Banco de Dados)
  const duplicatePayloads = new Map<string, number>(); // hash -> expiresAt
  const contactBuckets = new Map<string, number[]>(); // contactKey -> timestamps
  const clientBuckets = new Map<string, number[]>(); // clientKey -> timestamps
  let globalTimestamps: number[] = [];
  let inFlightCount = 0;

  function pruneExpired(currentTime: number) {
    for (const [key, exp] of duplicatePayloads) {
      if (exp <= currentTime) duplicatePayloads.delete(key);
    }
    for (const [key, list] of contactBuckets) {
      const active = list.filter((t) => currentTime - t < PROTECTION_DEFAULTS.contactWindowMs);
      if (active.length === 0) contactBuckets.delete(key);
      else contactBuckets.set(key, active);
    }
    for (const [key, list] of clientBuckets) {
      const active = list.filter((t) => currentTime - t < PROTECTION_DEFAULTS.clientWindowMs);
      if (active.length === 0) clientBuckets.delete(key);
      else clientBuckets.set(key, active);
    }
    globalTimestamps = globalTimestamps.filter(
      (t) => currentTime - t < PROTECTION_DEFAULTS.globalWindowMs,
    );
  }

  function setBoundedMap<V>(map: Map<string, V>, key: string, value: V) {
    if (!map.has(key) && map.size >= PROTECTION_DEFAULTS.maxTrackedKeys) {
      const oldestKey = map.keys().next().value;
      if (oldestKey !== undefined) map.delete(oldestKey);
    }
    map.set(key, value);
  }

  function extractClientKey(meta?: RequestMetadata): string {
    const cfIp = getHeader(meta?.headers, "cf-connecting-ip")?.trim();
    const realIp = getHeader(meta?.headers, "x-real-ip")?.trim();
    const xff = getHeader(meta?.headers, "x-forwarded-for");
    const xffHop = xff
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .at(-1);
    const ipPart = cfIp || realIp || xffHop || "unknown-ip";
    const uaPart = (getHeader(meta?.headers, "user-agent") ?? "unknown-ua").slice(0, 120);
    return sha256Hex(`${ipPart}|${uaPart}`);
  }

  const DEFAULT_ALLOWED_ORIGIN_HOSTS = [
    "www.anselmodiascontador.com.br",
    "anselmodiascontador.com.br",
    "site-anselmo-dias-23f525-meu-projeto-a191.guaracloud.com",
  ] as const;

  const LOCAL_DEV_ALLOWED_HOSTS = ["localhost", "127.0.0.1"] as const;

  function getAllowedOriginsSet(customAllowedOrigins?: string): Set<string> {
    const allowed = new Set<string>();

    for (const host of DEFAULT_ALLOWED_ORIGIN_HOSTS) {
      allowed.add(`https://${host}`);
    }

    for (const host of LOCAL_DEV_ALLOWED_HOSTS) {
      allowed.add(`http://${host}`);
      allowed.add(`http://${host}:3000`);
      allowed.add(`http://${host}:5173`);
    }

    if (customAllowedOrigins) {
      for (const item of customAllowedOrigins.split(",")) {
        const trimmed = item.trim();
        if (!trimmed) continue;
        try {
          const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
          if (url.origin && url.origin !== "null") {
            allowed.add(url.origin.toLowerCase());
          }
        } catch {
          // ignora formato inválido
        }
      }
    }

    return allowed;
  }

  function isCrossSiteRequest(meta?: RequestMetadata, allowedOriginsEnv?: string): boolean {
    if (!meta?.headers) {
      return false;
    }

    const secFetchSite = getHeader(meta.headers, "sec-fetch-site")?.trim().toLowerCase();
    if (secFetchSite && secFetchSite === "cross-site") {
      return true;
    }

    const rawOrigin = getHeader(meta.headers, "origin")?.trim();
    const rawReferer = getHeader(meta.headers, "referer")?.trim();
    const rawHost = getHeader(meta.headers, "host")?.trim();
    const rawUserAgent = getHeader(meta.headers, "user-agent")?.trim();
    const allowedOrigins = getAllowedOriginsSet(allowedOriginsEnv);

    if (rawOrigin) {
      if (rawOrigin === "null") return true;

      let originUrl: URL;
      try {
        originUrl = new URL(rawOrigin);
      } catch {
        return true;
      }

      const origin = originUrl.origin.toLowerCase();
      const hostname = originUrl.hostname.toLowerCase();

      if (originUrl.protocol !== "https:") {
        const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
        if (!isLocalHost || originUrl.protocol !== "http:") {
          return true;
        }
      }

      if (allowedOrigins.has(origin)) {
        return false;
      }

      const normalizedHostOrigin = `${originUrl.protocol}//${originUrl.host.toLowerCase()}`;
      if (allowedOrigins.has(normalizedHostOrigin)) {
        return false;
      }

      return true;
    }

    if (rawReferer) {
      let refererUrl: URL;
      try {
        refererUrl = new URL(rawReferer);
      } catch {
        return true;
      }

      const refererOrigin = refererUrl.origin.toLowerCase();
      const refererHostname = refererUrl.hostname.toLowerCase();

      if (refererUrl.protocol !== "https:") {
        const isLocalHost = refererHostname === "localhost" || refererHostname === "127.0.0.1";
        if (!isLocalHost || refererUrl.protocol !== "http:") {
          return true;
        }
      }

      if (allowedOrigins.has(refererOrigin)) {
        return false;
      }

      const normalizedRefererOrigin = `${refererUrl.protocol}//${refererUrl.host.toLowerCase()}`;
      if (allowedOrigins.has(normalizedRefererOrigin)) {
        return false;
      }

      return true;
    }

    if (rawHost || rawUserAgent || secFetchSite) {
      return true;
    }

    return false;
  }

  /**
   * Despacha um e-mail transacional via API REST v3 da Brevo.
   * Não grava em banco de dados e não insere contatos em listas de marketing.
   */
  async function sendBrevoTransactionalEmail(opts: {
    apiKey: string;
    senderName: string;
    senderEmail: string;
    recipientEmail: string;
    recipientName: string;
    templateId: number;
    params: Record<string, unknown>;
    signal: AbortSignal;
  }): Promise<{ ok: boolean; status: number; errorMsg?: string }> {
    const payload = {
      sender: {
        name: opts.senderName,
        email: opts.senderEmail,
      },
      to: [
        {
          email: opts.recipientEmail,
          name: opts.recipientName,
        },
      ],
      templateId: opts.templateId,
      params: opts.params,
    };

    try {
      const response = await fetchImpl(BREVO_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          accept: "application/json",
          "api-key": opts.apiKey,
        },
        body: JSON.stringify(payload),
        redirect: "error",
        signal: opts.signal,
      });

      if (response.status === 201 || response.status === 200) {
        return { ok: true, status: response.status };
      }

      let errorDetail = "";
      try {
        const errorJson = await response.json();
        errorDetail = typeof errorJson === "object" && errorJson !== null ? JSON.stringify(errorJson) : "";
      } catch {
        // Ignora falha de parse do erro
      }

      return {
        ok: false,
        status: response.status,
        errorMsg: `Brevo HTTP ${response.status}: ${errorDetail}`,
      };
    } catch (err) {
      const isAbort = err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError");
      return {
        ok: false,
        status: isAbort ? 504 : 503,
        errorMsg: isAbort ? "Brevo Timeout" : "Brevo Network Error",
      };
    }
  }

  return async function submitLead(
    input: unknown,
    meta?: RequestMetadata,
  ): Promise<LeadSubmissionResult> {
    const currentTime = now();
    pruneExpired(currentTime);

    // 1. Verificação de origem / Sec-Fetch-Site (CSRF)
    const config = getConfig();
    if (isCrossSiteRequest(meta, config.allowedOrigins)) {
      log("lead_rejected_cross_site");
      return {
        ok: false,
        status: 403,
        code: "forbidden_origin",
        error: "Origem da requisição não autorizada.",
      };
    }

    // 2. Honeypot anti-bot prioritário
    const rawHoneypot = typeof input === "object" && input !== null ? (input as Record<string, unknown>).honeypot : undefined;
    const honeypotTriggered =
      typeof rawHoneypot === "string"
        ? rawHoneypot.trim().length > 0
        : rawHoneypot !== undefined && rawHoneypot !== null && rawHoneypot !== "";

    if (honeypotTriggered) {
      log("lead_rejected_honeypot");
      return {
        ok: false,
        status: 400,
        code: "spam_detected",
        error: "Não foi possível processar o envio.",
      };
    }

    // 3. Validação estrutural e mapeamento de campos
    const validation = validateAndMapFormInput(input);
    if (!validation.ok) {
      return {
        ok: false,
        status: 400,
        code: "validation_error",
        error: "Por favor, revise os campos destacados no formulário.",
        fieldErrors: validation.fieldErrors,
      };
    }

    // 4. Tempo mínimo humano de preenchimento (< 1200ms)
    if (
      validation.elapsedMs !== null &&
      validation.elapsedMs >= 0 &&
      validation.elapsedMs < PROTECTION_DEFAULTS.minFillTimeMs
    ) {
      log("lead_rejected_too_fast");
      return {
        ok: false,
        status: 429,
        code: "too_fast",
        error: "Envio muito rápido. Aguarde alguns segundos e tente novamente.",
      };
    }

    // 5. Modo de validação exclusiva (sem envio de e-mails)
    if (validation.payload.validar_apenas === true) {
      return { ok: true, status: 200, validado: true, enviado: false, gravado: false };
    }

    // 6. Proteção global de concorrência e janela global em memória
    if (
      inFlightCount >= PROTECTION_DEFAULTS.maxConcurrent ||
      globalTimestamps.length >= PROTECTION_DEFAULTS.globalMaxPerWindow
    ) {
      log("lead_rejected_global_rate_limit");
      return {
        ok: false,
        status: 429,
        code: "rate_limited",
        error: "Muitas solicitações simultâneas. Aguarde um instante ou chame no WhatsApp.",
      };
    }

    // 7. Deduplicação por hash de conteúdo (5 minutos)
    const payloadHash = sha256Hex(
      `${validation.contactEmail}|${validation.contactWhatsappDigits}|${validation.payload.cnpj ?? "sem_cnpj"}|${validation.payload.mensagem ?? "null"}`,
    );
    const duplicateExpiresAt = duplicatePayloads.get(payloadHash);
    if (duplicateExpiresAt !== undefined && duplicateExpiresAt > currentTime) {
      log("lead_rejected_duplicate_payload");
      return {
        ok: false,
        status: 429,
        code: "duplicate_submission",
        error: "Sua mensagem já foi enviada recentemente. Em breve entraremos em contato!",
      };
    }

    // 8. Limite por identidade de contato (e-mail ou WhatsApp)
    const emailKey = `email:${sha256Hex(validation.contactEmail)}`;
    const phoneKey = `phone:${sha256Hex(validation.contactWhatsappDigits)}`;
    const emailHistory = contactBuckets.get(emailKey) ?? [];
    const phoneHistory = contactBuckets.get(phoneKey) ?? [];
    if (
      emailHistory.length >= PROTECTION_DEFAULTS.contactMaxPerWindow ||
      phoneHistory.length >= PROTECTION_DEFAULTS.contactMaxPerWindow
    ) {
      log("lead_rejected_contact_rate_limit");
      return {
        ok: false,
        status: 429,
        code: "contact_rate_limited",
        error: "Você já enviou solicitações recentes. Aguarde alguns minutos ou fale conosco pelo WhatsApp.",
      };
    }

    // 9. Limite por chave composta de cliente (IP + User-Agent)
    const clientKey = extractClientKey(meta);
    const clientHistory = clientBuckets.get(clientKey) ?? [];
    if (clientHistory.length >= PROTECTION_DEFAULTS.clientMaxPerWindow) {
      log("lead_rejected_client_rate_limit");
      return {
        ok: false,
        status: 429,
        code: "rate_limited",
        error: "Limite de envios atingido temporariamente. Tente novamente em alguns minutos.",
      };
    }

    // 10. Validação das configurações da Brevo no servidor
    const apiKey = config.brevoApiKey?.trim();
    if (!apiKey) {
      log("lead_brevo_api_key_missing");
      return {
        ok: false,
        status: 503,
        code: "server_misconfigured",
        error: "O envio online está temporariamente indisponível. Fale conosco pelo WhatsApp!",
      };
    }

    const isMei360 =
      validation.payload.origem === "popup-desktop-mei-360" ||
      validation.payload.origem === "menu-mobile-mei-360";

    const internalTemplateId = isMei360
      ? config.brevoTemplateMei360Internal
      : config.brevoTemplateContactInternal;

    const confirmationTemplateId = isMei360
      ? config.brevoTemplateMei360Confirmation
      : config.brevoTemplateContactConfirmation;

    if (!internalTemplateId) {
      log("lead_brevo_template_missing");
      return {
        ok: false,
        status: 503,
        code: "server_misconfigured",
        error: "O envio online está temporariamente indisponível. Fale conosco pelo WhatsApp!",
      };
    }

    // Registra tentativa nos limitadores em memória
    globalTimestamps.push(currentTime);
    setBoundedMap(clientBuckets, clientKey, [...clientHistory, currentTime]);
    inFlightCount++;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const nowFormatted = new Date(currentTime).toISOString();

      // Monta os parâmetros higienizados para o e-mail interno
      const internalParams: Record<string, unknown> = isMei360
        ? {
            NOME: escapeHtml(validation.payload.nome),
            WHATSAPP: escapeHtml(validation.payload.whatsapp),
            EMAIL: escapeHtml(validation.payload.email),
            CNPJ: escapeHtml(validation.payload.cnpjFormatado || validation.payload.cnpj || ""),
            ORIGEM: escapeHtml(validation.payload.origem),
            CONSENTIMENTO: validation.payload.consentimentoComunicados ? "SIM" : "NÃO",
            CONSENTIMENTO_STATUS: validation.payload.consentimentoComunicados,
            DATA_HORA: nowFormatted,
            TERMO_VERSAO: validation.payload.consentimentoVersao || "N/A",
          }
        : {
            NOME: escapeHtml(validation.payload.nome),
            WHATSAPP: escapeHtml(validation.payload.whatsapp),
            EMAIL: escapeHtml(validation.payload.email),
            MENSAGEM: escapeHtml(validation.payload.mensagem || ""),
            ORIGEM: escapeHtml(validation.payload.origem),
            DATA_HORA: nowFormatted,
          };

      // PASSO 1: Envia a Notificação Interna para a equipe
      const internalResult = await sendBrevoTransactionalEmail({
        apiKey,
        senderName: config.brevoSenderName,
        senderEmail: config.brevoSenderEmail,
        recipientEmail: config.brevoNotificationEmail,
        recipientName: "Equipe Anselmo Dias Contador",
        templateId: internalTemplateId,
        params: internalParams,
        signal: controller.signal,
      });

      if (!internalResult.ok) {
        log(`lead_brevo_internal_failed_${internalResult.status}`);
        return {
          ok: false,
          status: internalResult.status >= 500 ? 503 : 502,
          code: "upstream_unavailable",
          error: "Não foi possível concluir o envio da sua solicitação agora. Fale conosco pelo WhatsApp!",
        };
      }

      // Notificação interna foi aceita pela Brevo com sucesso
      setBoundedMap(duplicatePayloads, payloadHash, currentTime + PROTECTION_DEFAULTS.duplicatePayloadTtlMs);
      setBoundedMap(contactBuckets, emailKey, [...emailHistory, currentTime]);
      setBoundedMap(contactBuckets, phoneKey, [...phoneHistory, currentTime]);

      // PASSO 2: Envia a Confirmação Automática ao Visitante (se template configurado)
      let visitorConfirmationSent = false;
      if (confirmationTemplateId) {
        const visitorParams: Record<string, unknown> = isMei360
          ? {
              NOME: escapeHtml(validation.payload.nome),
              PRAZO: "até 72 horas úteis",
              DATA_HORA: nowFormatted,
            }
          : {
              NOME: escapeHtml(validation.payload.nome),
              DATA_HORA: nowFormatted,
            };

        const visitorResult = await sendBrevoTransactionalEmail({
          apiKey,
          senderName: config.brevoSenderName,
          senderEmail: config.brevoSenderEmail,
          recipientEmail: validation.payload.email,
          recipientName: validation.payload.nome,
          templateId: confirmationTemplateId,
          params: visitorParams,
          signal: controller.signal,
        });

        visitorConfirmationSent = visitorResult.ok;
        if (!visitorResult.ok) {
          log(`lead_brevo_visitor_confirmation_failed_${visitorResult.status}`);
        }
      }

      return {
        ok: true,
        status: 201,
        enviado: true,
        gravado: true,
        internalNotificationSent: true,
        visitorConfirmationSent,
      };
    } catch (error) {
      const isAbort = error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
      log(isAbort ? "lead_upstream_timeout" : "lead_upstream_network_error");
      return {
        ok: false,
        status: 503,
        code: isAbort ? "upstream_timeout" : "upstream_unavailable",
        error: isAbort
          ? "O servidor demorou para responder. Para atendimento imediato, fale conosco pelo WhatsApp!"
          : "Serviço temporariamente indisponível. Por favor, fale conosco pelo WhatsApp!",
      };
    } finally {
      clearTimeout(timer);
      inFlightCount = Math.max(0, inFlightCount - 1);
    }
  };
}

export const submitLeadFromServer = createLeadSubmissionService();
