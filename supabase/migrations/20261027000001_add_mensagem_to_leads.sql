-- Migração SQL idempotente: adiciona a coluna `mensagem` à tabela `public.leads`
-- Projeto: Anselmo Dias Contador (mei-conecta-f-cil)
-- Data: 2026-10-27
-- Status: PREPARADA LOCALMENTE (NÃO EXECUTADA NO BANCO REMOTO)
--
-- Objetivos e garantias:
-- 1. Armazenar integralmente o campo `message` do formulário de contato (até 1.000 caracteres, sem truncamento).
-- 2. Preservar integralmente a coluna `tipo_atividade` e todas as demais colunas e registros existentes.
-- 3. Manter `mensagem` anulável (NULL permitido) para compatibilidade com registros anteriores
--    e integrações que não informem esse campo.
-- 4. Garantir via CHECK constraint idempotente que, quando informada, `mensagem` não seja vazia
--    (após remoção de espaços nas extremidades) e tenha no máximo 1.000 caracteres.

BEGIN;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS mensagem text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'leads'
      AND c.conname = 'leads_mensagem_check'
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_mensagem_check
      CHECK (
        mensagem IS NULL
        OR (
          char_length(btrim(mensagem)) >= 1
          AND char_length(mensagem) <= 1000
        )
      );
  END IF;
END
$$;

COMMENT ON COLUMN public.leads.mensagem IS
  'Mensagem enviada pelo visitante no formulário de contato do site (opcional, até 1.000 caracteres).';

COMMIT;
