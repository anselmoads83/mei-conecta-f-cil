export type CookieConsentStatus = "accepted" | "rejected";

export interface CookieConsentRecord {
  status: CookieConsentStatus;
  version: string;
  updatedAt: string;
}

export const CONSENT_STORAGE_KEY = "ad_cookie_consent";
export const CONSENT_VERSION = "1.0.0";
export const OPEN_PREFERENCES_EVENT = "ad_open_cookie_preferences";
export const CONSENT_CHANGED_EVENT = "ad_cookie_consent_changed";

/**
 * Lê de forma segura a preferência de cookies gravada no localStorage.
 * Trata ambientes SSR (onde window/localStorage não existem) e restrições
 * de privacidade do navegador (cookies/storage bloqueados).
 */
export function getCookieConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      (parsed.status === "accepted" || parsed.status === "rejected") &&
      typeof parsed.updatedAt === "string"
    ) {
      return parsed as CookieConsentRecord;
    }
    return null;
  } catch {
    // Falha silenciosa segura em caso de bloqueio de storage pelo navegador
    return null;
  }
}

/**
 * Grava a escolha do visitante (accepted ou rejected) com timestamp e versão.
 */
export function setCookieConsent(status: CookieConsentStatus): CookieConsentRecord | null {
  if (typeof window === "undefined") {
    return null;
  }
  const record: CookieConsentRecord = {
    status,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: record }));
    return record;
  } catch {
    return null;
  }
}

/**
 * Dispara evento customizado para reabrir o painel de consentimento.
 */
export function openCookiePreferencesModal(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT));
}
