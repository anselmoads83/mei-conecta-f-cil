import crypto from "node:crypto";
import { getServerConfig } from "./config.server.ts";

// Módulo exclusivamente de servidor (.server.ts).
// O Vite impede que este arquivo seja incluído no bundle do navegador,
// garantindo que LEAD_INGEST_SECRET nunca seja exposto ao cliente.

export const FORM_LIMITS = {
  nomeMin: 3,
  nomeMax: 100,
  emailMax: 120,
  whatsappRawMax: 30,
  mensagemMin: 10,
  mensagemMax: 1000,
  tipoAtividadeMax: 150,
  origemMax: 100,
} as const;

export const PROTECTION_DEFAULTS = {
  timeoutMs: 8_000,
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

export interface LeadFormSubmissionInput {
  name: unknown;
  phone: unknown;
  email: unknown;
  message: unknown;
  tipo_atividade?: unknown;
  origem?: unknown;
  validar_apenas?: unknown;
  honeypot?: unknown;
  elapsedMs?: unknown;
}

export interface EdgeFunctionLeadPayload {
  nome: string;
  email: string;
  whatsapp: string;
  tipo_atividade: string | null;
  origem: string;
  mensagem: string;
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
      status: 200 | 201;
      validado?: boolean;
      gravado: boolean;
    }
  | {
      ok: false;
      status: 400 | 403 | 429 | 503;
      code: LeadSubmissionErrorCode;
      error: string;
      fieldErrors?: Partial<Record<"name" | "phone" | "email" | "message" | "tipo_atividade" | "origem", string>>;
    };

export interface ServerConfigProvider {
  leadIngestSecret?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseEdgeFunctionUrl?: string;
}

export interface LeadSubmissionServiceDeps {
  getConfig?: () => ServerConfigProvider;
  fetchImpl?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
  log?: (event: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

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

function resolveEdgeFunctionUrl(config: ServerConfigProvider): string | null {
  const direct = config.supabaseEdgeFunctionUrl?.trim();
  if (direct) return direct;
  const baseUrl = config.supabaseUrl?.trim();
  if (!baseUrl) return null;
  return `${baseUrl.replace(/\/+$/, "")}/functions/v1/receber-lead`;
}

export function validateAndMapFormInput(input: unknown):
  | {
      ok: true;
      payload: EdgeFunctionLeadPayload;
      contactEmail: string;
      contactWhatsappDigits: string;
      honeypotTriggered: boolean;
      elapsedMs: number | null;
    }
  | {
      ok: false;
      fieldErrors: Partial<Record<"name" | "phone" | "email" | "message" | "tipo_atividade" | "origem", string>>;
    } {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {
      ok: false,
      fieldErrors: { name: "Dados de envio inválidos." },
    };
  }

  const data = input as Record<string, unknown>;
  const fieldErrors: Partial<Record<"name" | "phone" | "email" | "message" | "tipo_atividade" | "origem", string>> = {};

  // Honeypot anti-bot: qualquer valor não vazio indica preenchimento automatizado.
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

  // 4. Sua mensagem (preservada integralmente até 1.000 caracteres, sem truncamento)
  const rawMessage = typeof data.message === "string" ? data.message.trim() : "";
  if (!rawMessage) {
    fieldErrors.message = "Por favor, digite sua mensagem.";
  } else if (rawMessage.length < FORM_LIMITS.mensagemMin) {
    fieldErrors.message = "A mensagem deve conter pelo menos 10 caracteres.";
  } else if (rawMessage.length > FORM_LIMITS.mensagemMax) {
    fieldErrors.message = "A mensagem não pode exceder 1000 caracteres.";
  } else if (CONTROL_CHARS_REGEX.test(rawMessage)) {
    fieldErrors.message = "A mensagem contém caracteres inválidos.";
  }

  // 5. tipo_atividade (preservado como opcional, padrão null)
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

  // 6. origem (padrão "site-floating-form")
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

  // 7. validar_apenas (opcional, booleano)
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

  const payload: EdgeFunctionLeadPayload = {
    nome: rawName,
    email: normalizedEmail,
    whatsapp: rawPhone,
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

  // Estruturas limitadas em memória para rate-limit e deduplicação
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
    // Prioriza cabeçalho injetado pelo proxy da borda (Cloudflare/Guará Cloud),
    // combinado com hash de User-Agent. Não é a única barreira de proteção.
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

  function isCrossSiteRequest(meta?: RequestMetadata): boolean {
    const secFetchSite = getHeader(meta?.headers, "sec-fetch-site")?.trim().toLowerCase();
    if (secFetchSite && secFetchSite === "cross-site") {
      return true;
    }
    const origin = getHeader(meta?.headers, "origin")?.trim();
    const host = getHeader(meta?.headers, "host")?.trim();
    if (origin && host) {
      try {
        const originHost = new URL(origin).host.toLowerCase();
        if (originHost !== host.toLowerCase()) return true;
      } catch {
        return true;
      }
    }
    return false;
  }

  return async function submitLead(
    input: unknown,
    meta?: RequestMetadata,
  ): Promise<LeadSubmissionResult> {
    const currentTime = now();
    pruneExpired(currentTime);

    // 1. Verificação de origem / Sec-Fetch-Site quando cabeçalhos da requisição estão presentes
    if (isCrossSiteRequest(meta)) {
      log("lead_rejected_cross_site");
      return {
        ok: false,
        status: 403,
        code: "forbidden_origin",
        error: "Origem da requisição não autorizada.",
      };
    }

    // 2. Validação estrutural e mapeamento de campos
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

    // 3. Honeypot anti-bot
    if (validation.honeypotTriggered) {
      log("lead_rejected_honeypot");
      return {
        ok: false,
        status: 400,
        code: "spam_detected",
        error: "Não foi possível processar o envio.",
      };
    }

    // 4. Tempo mínimo humano de preenchimento (quando informado pelo cliente)
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

    // 5. Proteção global de concorrência e janela global (independente de IP)
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

    // 6. Deduplicação por conteúdo exato (independente de IP)
    const payloadHash = sha256Hex(
      `${validation.contactEmail}|${validation.contactWhatsappDigits}|${validation.payload.mensagem}`,
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

    // 7. Limite por identidade de contato (e-mail ou WhatsApp, independente de IP)
    const emailKey = `email:${ sha256Hex(validation.contactEmail) }`;
    const phoneKey = `phone:${ sha256Hex(validation.contactWhatsappDigits) }`;
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

    // 8. Limite por chave composta de cliente (IP de borda + User-Agent)
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

    // 9. Verificação das credenciais de servidor
    const config = getConfig();
    const secret = config.leadIngestSecret?.trim();
    const anonKey = config.supabaseAnonKey?.trim();
    const bearerToken = anonKey || secret;
    const edgeUrl = resolveEdgeFunctionUrl(config);
    if (!secret || !edgeUrl) {
      log("lead_server_config_missing");
      return {
        ok: false,
        status: 503,
        code: "server_misconfigured",
        error: "O envio online está temporariamente indisponível. Fale conosco pelo WhatsApp!",
      };
    }

    // Registra tentativa nos limitadores de taxa
    globalTimestamps.push(currentTime);
    setBoundedMap( clientBuckets, clientKey, [...clientHistory, currentTime] );
    inFlightCount++;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Chamada servidor -> Supabase Edge Function (sem cabeçalho Origin).
      // Se SUPABASE_ANON_KEY estiver configurada (cenário com Verify JWT ativo no Gateway),
      // envia o JWT anon em Authorization e o LEAD_INGEST_SECRET em apikey.
      // Caso contrário (Verify JWT desativado na função), envia LEAD_INGEST_SECRET em ambos.
      const response = await fetchImpl(edgeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${bearerToken}`,
          apikey: secret,
        },
        body: JSON.stringify(validation.payload),
        signal: controller.signal,
      });

      if (response.status === 201) {
        setBoundedMap(duplicatePayloads, payloadHash, currentTime + PROTECTION_DEFAULTS.duplicatePayloadTtlMs);
        setBoundedMap(contactBuckets, emailKey, [...emailHistory, currentTime]);
        setBoundedMap(contactBuckets, phoneKey, [...phoneHistory, currentTime]);
        return { ok: true, status: 201, gravado: true };
      }

      if (response.status === 200 && validation.payload.validar_apenas === true) {
        return { ok: true, status: 200, validado: true, gravado: false };
      }

      if (response.status === 400) {
        log("lead_upstream_validation_rejected");
        return {
          ok: false,
          status: 400,
          code: "validation_error",
          error: "Não foi possível validar os dados informados. Verifique os campos e tente novamente.",
        };
      }

      log(`lead_upstream_error_${response.status}`);
      return {
        ok: false,
        status: 503,
        code: "upstream_unavailable",
        error: "Serviço temporariamente indisponível. Por favor, fale conosco pelo WhatsApp!",
      };
    } catch (error) {
      const isAbort =
        error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
      log(isAbort ? "lead_upstream_timeout" : "lead_upstream_network_error");
      return {
        ok: false,
        status: 503,
        code: isAbort ? "upstream_timeout" : "upstream_unavailable",
        error: "O servidor demorou para responder. Para atendimento imediato, fale conosco pelo WhatsApp!",
      };
    } finally {
      clearTimeout(timer);
      inFlightCount = Math.max(0, inFlightCount - 1);
    }
  };
}

export const submitLeadFromServer = createLeadSubmissionService();
