import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanCnpjDigits, formatCnpj, validateCnpj } from "../src/lib/cnpj.ts";

test("[cnpj] cleanCnpjDigits remove caracteres não numéricos e limita a 14 dígitos", () => {
  assert.equal(cleanCnpjDigits("00.000.000/0001-91"), "00000000000191");
  assert.equal(cleanCnpjDigits("123.456.789/0001-99extra123"), "12345678900019");
  assert.equal(cleanCnpjDigits(null), "");
  assert.equal(cleanCnpjDigits(undefined), "");
  assert.equal(cleanCnpjDigits(12345), "");
});

test("[cnpj] formatCnpj formata progressivamente os dígitos", () => {
  assert.equal(formatCnpj(""), "");
  assert.equal(formatCnpj("1"), "1");
  assert.equal(formatCnpj("12"), "12");
  assert.equal(formatCnpj("123"), "12.3");
  assert.equal(formatCnpj("12345"), "12.345");
  assert.equal(formatCnpj("123456"), "12.345.6");
  assert.equal(formatCnpj("12345678"), "12.345.678");
  assert.equal(formatCnpj("123456780001"), "12.345.678/0001");
  assert.equal(formatCnpj("00000000000191"), "00.000.000/0001-91");
});

test("[cnpj] validateCnpj valida CNPJs legítimos da Receita Federal", () => {
  // CNPJs válidos conhecidos
  assert.equal(validateCnpj("00.000.000/0001-91"), true); // Banco do Brasil
  assert.equal(validateCnpj("00000000000191"), true); // Sem máscara
  assert.equal(validateCnpj("33.000.167/0001-01"), true); // Petrobras
  assert.equal(validateCnpj("06.990.590/0001-23"), true); // Google Brasil
});

test("[cnpj] validateCnpj rejeita sequências repetidas e tamanhos incorretos", () => {
  assert.equal(validateCnpj("00.000.000/0000-00"), false);
  assert.equal(validateCnpj("11.111.111/1111-11"), false);
  assert.equal(validateCnpj("99.999.999/9999-99"), false);
  assert.equal(validateCnpj("00.000.000/0001-9"), false); // 13 dígitos
  assert.equal(validateCnpj(""), false);
  assert.equal(validateCnpj(null), false);
});

test("[cnpj] validateCnpj rejeita CNPJs com dígitos verificadores incorretos", () => {
  assert.equal(validateCnpj("00.000.000/0001-90"), false); // DV2 incorreto
  assert.equal(validateCnpj("00.000.000/0001-81"), false); // DV1 incorreto
  assert.equal(validateCnpj("06.990.590/0001-24"), false); // DV incorreto
});
