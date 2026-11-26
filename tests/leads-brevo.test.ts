import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createLeadSubmissionService,
  sanitizePublicLeadInput,
  validateAndMapFormInput,
  escapeHtml,
} from "../src/lib/leads.server.ts";
import type { ServerConfig } from "../src/lib/config.server.ts";

function createMockConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    nodeEnv: "test",
    allowedOrigins: "https://www.anselmodiascontador.com.br",
    brevoApiKey: "xkeysib-test-mock-api-key-2026",
    brevoSenderName: "Anselmo Dias Contador",
    brevoSenderEmail: "gestao@anselmodiascontador.com.br",
    brevoNotificationEmail: "gestao@anselmodiascontador.com.br",
    brevoTemplateMei360Internal: 101,
    brevoTemplateMei360Confirmation: 102,
    brevoTemplateContactInternal: 201,
    brevoTemplateContactConfirmation: 202,
    ...overrides,
  };
}

test("[escapeHtml] escapa caracteres sensíveis adequadamente", () => {
  assert.equal(
    escapeHtml('<script>alert("xss & \'hack\'")</script>'),
    "&lt;script&gt;alert(&quot;xss &amp; &#39;hack&#39;&quot;)&lt;/script&gt;",
  );
  assert.equal(escapeHtml("Texto normal sem tags"), "Texto normal sem tags");
});

test("[sanitizePublicLeadInput] sanitiza campos públicos preservando cnpj e consentimento", () => {
  const sanitized = sanitizePublicLeadInput({
    name: " João da Silva ",
    phone: "11988887777",
    email: "joao@email.com",
    cnpj: "00.000.000/0001-91",
    consentimento_comunicados: true,
    origem: "popup-desktop-mei-360",
    validar_apenas: true, // deve ser descartado
  });

  assert.equal(sanitized.name, " João da Silva ");
  assert.equal(sanitized.phone, "11988887777");
  assert.equal(sanitized.email, "joao@email.com");
  assert.equal(sanitized.cnpj, "00.000.000/0001-91");
  assert.equal(sanitized.consentimento_comunicados, true);
  assert.equal(sanitized.origem, "popup-desktop-mei-360");
  assert.equal("validar_apenas" in sanitized, false);
});

test("[mei360] submissão bem-sucedida envia notificação interna e confirmação ao visitante via Brevo", async () => {
  const sentRequests: Array<{ url: string; headers: Record<string, string>; body: any }> = [];

  const mockFetch: typeof fetch = async (url, init) => {
    const bodyText = typeof init?.body === "string" ? init.body : "";
    sentRequests.push({
      url: String(url),
      headers: init?.headers as Record<string, string>,
      body: JSON.parse(bodyText),
    });
    return new Response(JSON.stringify({ messageId: "<20261119-mock-id@brevo.com>" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  };

  const service = createLeadSubmissionService({
    getConfig: () => createMockConfig(),
    fetchImpl: mockFetch,
  });

  const result = await service({
    name: "Maria Empresária",
    phone: "(11) 91234-5678",
    email: "maria@empresa.com.br",
    cnpj: "00.000.000/0001-91",
    consentimento_comunicados: true,
    origem: "popup-desktop-mei-360",
    elapsedMs: 3000,
  });

  assert.equal(result.ok, true);
  if (result.ok && result.status === 201) {
    assert.equal(result.enviado, true);
    assert.equal(result.gravado, true);
    assert.equal(result.internalNotificationSent, true);
    assert.equal(result.visitorConfirmationSent, true);
  }

  // Devem ter sido disparadas exatamente 2 chamadas à Brevo (Interno e Visitante)
  assert.equal(sentRequests.length, 2);

  // Chamada 1: Notificação interna
  assert.equal(sentRequests[0].url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(sentRequests[0].headers["api-key"], "xkeysib-test-mock-api-key-2026");
  assert.equal(sentRequests[0].body.templateId, 101);
  assert.equal(sentRequests[0].body.to[0].email, "gestao@anselmodiascontador.com.br");
  assert.equal(sentRequests[0].body.params.NOME, "Maria Empresária");
  assert.equal(sentRequests[0].body.params.CNPJ, "00.000.000/0001-91");
  assert.equal(sentRequests[0].body.params.CONSENTIMENTO, "SIM");
  assert.equal(sentRequests[0].body.params.CONSENTIMENTO_STATUS, true);
  assert.equal(sentRequests[0].body.params.TERMO_VERSAO, "v1-2026-11");

  // Chamada 2: Confirmação ao visitante
  assert.equal(sentRequests[1].body.templateId, 102);
  assert.equal(sentRequests[1].body.to[0].email, "maria@empresa.com.br");
  assert.equal(sentRequests[1].body.params.PRAZO, "até 72 horas úteis");
});

test("[mei360] submissão com consentimento desmarcado registra 'NÃO' e mantém confirmação", async () => {
  const sentRequests: any[] = [];
  const mockFetch: typeof fetch = async (url, init) => {
    sentRequests.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ messageId: "<ok>" }), { status: 201 });
  };

  const service = createLeadSubmissionService({
    getConfig: () => createMockConfig(),
    fetchImpl: mockFetch,
  });

  const result = await service({
    name: "Carlos MEI",
    phone: "(11) 98765-4321",
    email: "carlos@mei.com.br",
    cnpj: "33.000.167/0001-01",
    consentimento_comunicados: false,
    origem: "menu-mobile-mei-360",
    elapsedMs: 2500,
  });

  assert.equal(result.ok, true);
  assert.equal(sentRequests.length, 2);
  assert.equal(sentRequests[0].params.CONSENTIMENTO, "NÃO");
  assert.equal(sentRequests[0].params.CONSENTIMENTO_STATUS, false);
});

test("[mei360] rejeita CNPJ inválido com mensagem clara de acessibilidade", async () => {
  const service = createLeadSubmissionService({
    getConfig: () => createMockConfig(),
  });

  // CNPJ com dígito verificador incorreto
  const resultBadDv = await service({
    name: "Ana Silva",
    phone: "(11) 98765-4321",
    email: "ana@email.com",
    cnpj: "00.000.000/0001-99", // DV incorreto
    origem: "popup-desktop-mei-360",
  });

  assert.equal(resultBadDv.ok, false);
  if (!resultBadDv.ok) {
    assert.equal(resultBadDv.status, 400);
    assert.equal(resultBadDv.code, "validation_error");
    assert.match(resultBadDv.fieldErrors?.cnpj || "", /CNPJ válido/);
  }

  // CNPJ repetido
  const resultRepeated = await service({
    name: "Ana Silva",
    phone: "(11) 98765-4321",
    email: "ana@email.com",
    cnpj: "11.111.111/1111-11",
    origem: "popup-desktop-mei-360",
  });
  assert.equal(resultRepeated.ok, false);

  // CNPJ ausente no MEI 360
  const resultMissing = await service({
    name: "Ana Silva",
    phone: "(11) 98765-4321",
    email: "ana@email.com",
    cnpj: "",
    origem: "popup-desktop-mei-360",
  });
  assert.equal(resultMissing.ok, false);
});

test("[fale-conosco] não exige CNPJ e envia templates 3 e 4 com mensagem (regressão protegida)", async () => {
  const sentBodies: any[] = [];
  const mockFetch: typeof fetch = async (url, init) => {
    sentBodies.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ messageId: "<ok>" }), { status: 201 });
  };

  const service = createLeadSubmissionService({
    getConfig: () => createMockConfig(),
    fetchImpl: mockFetch,
  });

  const result = await service({
    name: "Visitante Contato",
    phone: "(11) 97777-6666",
    email: "visitante@contato.com",
    message: "Gostaria de saber sobre a regularização do meu cadastro.",
    origem: "site-floating-form",
    elapsedMs: 4000,
  });

  assert.equal(result.ok, true);
  assert.equal(sentBodies.length, 2);

  // Notificação Interna do Fale Conosco
  assert.equal(sentBodies[0].templateId, 201);
  assert.equal(sentBodies[0].to[0].email, "gestao@anselmodiascontador.com.br");
  assert.equal(sentBodies[0].params.MENSAGEM, "Gostaria de saber sobre a regularização do meu cadastro.");

  // Confirmação ao Visitante do Fale Conosco
  assert.equal(sentBodies[1].templateId, 202);
  assert.equal(sentBodies[1].to[0].email, "visitante@contato.com");
});

test("[fale-conosco] exige mensagem com no mínimo 10 caracteres", async () => {
  const service = createLeadSubmissionService({
    getConfig: () => createMockConfig(),
  });

  const result = await service({
    name: "Visitante",
    phone: "(11) 97777-6666",
    email: "visitante@contato.com",
    message: "Curto",
    origem: "site-floating-form",
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.fieldErrors?.message || "", /pelo menos 10 caracteres/);
  }
});

test("[segurança] bloqueia honeypot, preenchimento instantâneo e deduplica em memória", async () => {
  let callCount = 0;
  const mockFetch: typeof fetch = async () => {
    callCount++;
    return new Response("{}", { status: 201 });
  };

  const service = createLeadSubmissionService({
    getConfig: () => createMockConfig(),
    fetchImpl: mockFetch,
  });

  // Honeypot preenchido
  const resHoneypot = await service({
    name: "Bot Spammer",
    phone: "(11) 99999-9999",
    email: "bot@spam.com",
    cnpj: "00.000.000/0001-91",
    origem: "popup-desktop-mei-360",
    honeypot: "eu_sou_um_bot",
  });
  assert.equal(resHoneypot.ok, false);
  if (!resHoneypot.ok) assert.equal(resHoneypot.code, "spam_detected");
  assert.equal(callCount, 0);

  // Submissão muito rápida (< 1200ms)
  const resFast = await service({
    name: "Bot Rápido",
    phone: "(11) 98765-4321",
    email: "rapido@spam.com",
    cnpj: "00.000.000/0001-91",
    origem: "popup-desktop-mei-360",
    elapsedMs: 500,
  });
  assert.equal(resFast.ok, false);
  if (!resFast.ok) assert.equal(resFast.code, "too_fast");
  assert.equal(callCount, 0);

  // Submissão legítima
  const resValid = await service({
    name: "Cliente Real",
    phone: "(11) 98888-7777",
    email: "cliente@real.com",
    cnpj: "00.000.000/0001-91",
    origem: "popup-desktop-mei-360",
    elapsedMs: 3000,
  });
  assert.equal(resValid.ok, true);

  // Submissão idêntica duplicada imediata (bloqueada pelo hash em memória)
  const resDuplicate = await service({
    name: "Cliente Real",
    phone: "(11) 98888-7777",
    email: "cliente@real.com",
    cnpj: "00.000.000/0001-91",
    origem: "popup-desktop-mei-360",
    elapsedMs: 3000,
  });
  assert.equal(resDuplicate.ok, false);
  if (!resDuplicate.ok) assert.equal(resDuplicate.code, "duplicate_submission");
});

test("[resiliência] falha na notificação interna interrompe o processo e retorna erro ao visitante", async () => {
  const mockFetch: typeof fetch = async () => {
    return new Response(JSON.stringify({ message: "Invalid API key" }), { status: 401 });
  };

  const service = createLeadSubmissionService({
    getConfig: () => createMockConfig(),
    fetchImpl: mockFetch,
  });

  const result = await service({
    name: "Cliente Teste",
    phone: "(11) 98888-7777",
    email: "cliente@teste.com",
    cnpj: "00.000.000/0001-91",
    origem: "popup-desktop-mei-360",
    elapsedMs: 3000,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 502);
    assert.equal(result.code, "upstream_unavailable");
  }
});

test("[resiliência] sucesso na notificação interna e falha na confirmação ao visitante ainda conclui com sucesso", async () => {
  let call = 0;
  const mockFetch: typeof fetch = async () => {
    call++;
    if (call === 1) {
      // Notificação interna: OK
      return new Response(JSON.stringify({ messageId: "<internal-ok>" }), { status: 201 });
    }
    // Confirmação ao visitante: falha (ex: domínio rejeitado pela Brevo)
    return new Response(JSON.stringify({ message: "Recipient domain invalid" }), { status: 400 });
  };

  const service = createLeadSubmissionService({
    getConfig: () => createMockConfig(),
    fetchImpl: mockFetch,
  });

  const result = await service({
    name: "Cliente Teste",
    phone: "(11) 98888-7777",
    email: "cliente@dominio-ruim.com",
    cnpj: "00.000.000/0001-91",
    origem: "popup-desktop-mei-360",
    elapsedMs: 3000,
  });

  // Como a equipe recebeu a notificação interna, a solicitação foi salva e não é perdida!
  assert.equal(result.ok, true);
  if (result.ok && result.status === 201) {
    assert.equal(result.internalNotificationSent, true);
    assert.equal(result.visitorConfirmationSent, false);
  }
});
