/**
 * Utilitário para formatação e validação matemática de CNPJ (Cadastro Nacional da Pessoa Jurídica).
 * Implementa o algoritmo oficial de validação por dígitos verificadores (módulo 11)
 * da Secretaria da Receita Federal do Brasil.
 */

/**
 * Remove todos os caracteres não numéricos de uma string de CNPJ.
 * Limita o resultado a no máximo 14 dígitos.
 */
export function cleanCnpjDigits(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\D/g, "").slice(0, 14);
}

/**
 * Aplica a máscara dinâmica de CNPJ: 00.000.000/0000-00
 */
export function formatCnpj(value: unknown): string {
  const digits = cleanCnpjDigits(value);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Valida matematicamente um CNPJ de acordo com a regra de cálculo dos dois dígitos verificadores (DV1 e DV2).
 * Rejeita sequências com tamanho incorreto ou com todos os números iguais.
 */
export function validateCnpj(value: unknown): boolean {
  const digits = cleanCnpjDigits(value);

  // Deve possuir exatamente 14 dígitos
  if (digits.length !== 14) {
    return false;
  }

  // Rejeita sequências conhecidas de dígitos repetidos (ex: 00000000000000, 11111111111111, etc.)
  if (/^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  // Cálculo do 1º Dígito Verificador (DV1)
  // Pesos: 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += Number(digits[i]) * weights1[i];
  }
  const mod1 = sum1 % 11;
  const dv1 = mod1 < 2 ? 0 : 11 - mod1;

  if (Number(digits[12]) !== dv1) {
    return false;
  }

  // Cálculo do 2º Dígito Verificador (DV2)
  // Pesos: 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += Number(digits[i]) * weights2[i];
  }
  const mod2 = sum2 % 11;
  const dv2 = mod2 < 2 ? 0 : 11 - mod2;

  return Number(digits[13]) === dv2;
}
