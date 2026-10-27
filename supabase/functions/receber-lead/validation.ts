// Validação do contrato original da Edge Function receber-lead.
// Módulo puro (sem dependências de runtime) para permitir testes locais.

export const MAX_PAYLOAD_BYTES = 16 * 1024; // 16.384 bytes

export const LIMITS = {
  nome: 150,
  email: 254,
  whatsapp: 30,
  origem: 100,
  tipo_atividade: 150,
  mensagem: 1000,
} as const;

export const ALLOWED_FIELDS: readonly string[] = [
  "nome",
  "email",
  "whatsapp",
  "tipo_atividade",
  "origem",
  "mensagem",
  "validar_apenas",
];

export const WHATSAPP_PATTERN = /^\+?[0-9]{10,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface Lead {
  nome: string;
  email: string;
  whatsapp: string;
  tipo_atividade: string | null;
  origem: string;
  mensagem: string | null;
}

export type ValidationResult =
  | { ok: true; lead: Lead; validarApenas: boolean }
  | { ok: false; errors: string[] };

// Remove apenas separadores comuns (espaços, parênteses, hífens e pontos).
// Qualquer outro caractere permanece e faz o padrão falhar.
export function normalizeWhatsapp(raw: string): string {
  return raw.trim().replace(/[\s().-]/g, "");
}

function requiredText(
  value: unknown,
  field: string,
  max: number,
  errors: string[],
): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`O campo '${field}' é obrigatório.`);
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    errors.push(`O campo '${field}' deve ter no máximo ${max} caracteres.`);
    return null;
  }
  return trimmed;
}

export function validateLead(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, errors: ["O corpo da requisição deve ser um objeto JSON."] };
  }

  const data = body as Record<string, unknown>;
  const errors: string[] = [];

  // Rejeição de campos desconhecidos (nomes não são refletidos na resposta).
  if (Object.keys(data).some((key) => !ALLOWED_FIELDS.includes(key))) {
    errors.push("A requisição contém campos não permitidos.");
  }

  const nome = requiredText(data.nome, "nome", LIMITS.nome, errors);

  let email: string | null = null;
  const emailRaw = requiredText(data.email, "email", LIMITS.email, errors);
  if (emailRaw !== null) {
    const normalized = emailRaw.toLowerCase();
    if (EMAIL_PATTERN.test(normalized)) {
      email = normalized;
    } else {
      errors.push("O campo 'email' é inválido.");
    }
  }

  let whatsapp: string | null = null;
  const whatsappRaw = requiredText(data.whatsapp, "whatsapp", LIMITS.whatsapp, errors);
  if (whatsappRaw !== null) {
    const normalized = normalizeWhatsapp(whatsappRaw);
    if (WHATSAPP_PATTERN.test(normalized)) {
      whatsapp = normalized;
    } else {
      errors.push("O campo 'whatsapp' é inválido.");
    }
  }

  const origem = requiredText(data.origem, "origem", LIMITS.origem, errors);

  let tipoAtividade: string | null = null;
  let tipoAtividadeValid = false;
  if (data.tipo_atividade === null) {
    tipoAtividade = null;
    tipoAtividadeValid = true;
  } else if (typeof data.tipo_atividade === "string") {
    const trimmed = data.tipo_atividade.trim();
    if (trimmed.length === 0) {
      errors.push("O campo 'tipo_atividade', quando informado, não pode estar vazio.");
    } else if (trimmed.length > LIMITS.tipo_atividade) {
      errors.push(
        `O campo 'tipo_atividade' deve ter no máximo ${LIMITS.tipo_atividade} caracteres.`,
      );
    } else {
      tipoAtividade = trimmed;
      tipoAtividadeValid = true;
    }
  } else {
    errors.push("O campo 'tipo_atividade' deve ser texto ou null.");
  }

  let mensagem: string | null = null;
  let mensagemValid = false;
  if (data.mensagem === undefined || data.mensagem === null) {
    mensagem = null;
    mensagemValid = true;
  } else if (typeof data.mensagem === "string") {
    const trimmed = data.mensagem.trim();
    if (trimmed.length === 0) {
      errors.push("O campo 'mensagem', quando informado, não pode estar vazio.");
    } else if (trimmed.length > LIMITS.mensagem) {
      errors.push(
        `O campo 'mensagem' deve ter no máximo ${LIMITS.mensagem} caracteres.`,
      );
    } else {
      mensagem = trimmed;
      mensagemValid = true;
    }
  } else {
    errors.push("O campo 'mensagem' deve ser texto ou null.");
  }

  let validarApenas = false;
  if (data.validar_apenas !== undefined) {
    if (typeof data.validar_apenas !== "boolean") {
      errors.push("O campo 'validar_apenas' deve ser booleano.");
    } else {
      validarApenas = data.validar_apenas;
    }
  }

  if (
    errors.length > 0 ||
    nome === null ||
    email === null ||
    whatsapp === null ||
    origem === null ||
    !tipoAtividadeValid ||
    !mensagemValid
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    lead: { nome, email, whatsapp, tipo_atividade: tipoAtividade, origem, mensagem },
    validarApenas,
  };
}
