import process from "node:process";

// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
//
// On Cloudflare Workers / Nitro, env binds at REQUEST time. Module-scope reads
// (e.g. `const x = process.env.X`) resolve to undefined — always read
// process.env INSIDE a function or handler.

export interface ServerConfig {
  nodeEnv?: string;
  allowedOrigins?: string;

  // Credenciais e Parâmetros da API Transacional Brevo
  brevoApiKey?: string;
  brevoSenderName: string;
  brevoSenderEmail: string;
  brevoNotificationEmail: string;

  // IDs dos 4 Templates Transacionais cadastrados no Painel da Brevo
  brevoTemplateMei360Internal?: number;
  brevoTemplateMei360Confirmation?: number;
  brevoTemplateContactInternal?: number;
  brevoTemplateContactConfirmation?: number;
}

export function getServerConfig(): ServerConfig {
  return {
    nodeEnv: process.env.NODE_ENV,
    allowedOrigins: process.env.ALLOWED_ORIGINS,

    // Brevo API Transacional
    brevoApiKey: process.env.BREVO_API_KEY,
    brevoSenderName: process.env.BREVO_SENDER_NAME?.trim() || "Anselmo Dias Contador",
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL?.trim() || "gestao@anselmodiascontador.com.br",
    brevoNotificationEmail: process.env.BREVO_NOTIFICATION_EMAIL?.trim() || "gestao@anselmodiascontador.com.br",

    // Identificadores numéricos dos templates transacionais configuráveis por ambiente
    brevoTemplateMei360Internal: process.env.BREVO_TEMPLATE_MEI360_INTERNAL
      ? Number(process.env.BREVO_TEMPLATE_MEI360_INTERNAL)
      : undefined,
    brevoTemplateMei360Confirmation: process.env.BREVO_TEMPLATE_MEI360_CONFIRMATION
      ? Number(process.env.BREVO_TEMPLATE_MEI360_CONFIRMATION)
      : undefined,
    brevoTemplateContactInternal: process.env.BREVO_TEMPLATE_CONTACT_INTERNAL
      ? Number(process.env.BREVO_TEMPLATE_CONTACT_INTERNAL)
      : undefined,
    brevoTemplateContactConfirmation: process.env.BREVO_TEMPLATE_CONTACT_CONFIRMATION
      ? Number(process.env.BREVO_TEMPLATE_CONTACT_CONFIRMATION)
      : undefined,
  };
}
