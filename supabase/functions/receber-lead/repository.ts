// Persistência via conexão direta PostgreSQL (SUPABASE_DB_URL + driver `postgres`).
// Recebe a função de template `sql` por injeção para permitir testes locais
// que inspecionam o SQL e os parâmetros gerados.

import type { LeadRepository } from "./handler.ts";
import type { Lead } from "./validation.ts";

export type SqlTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => PromiseLike<ReadonlyArray<Record<string, unknown>>>;

export function createPostgresRepository(getSql: () => SqlTag): LeadRepository {
  return {
    // Verificação de estrutura do modo validar_apenas (inclui a coluna mensagem).
    // Falha (coluna/tabela ausente ou conexão indisponível) propaga como exceção.
    async dryRun(): Promise<void> {
      const sql = getSql();
      await sql`SELECT id, created_at, nome, email, whatsapp, tipo_atividade, origem, mensagem FROM public.leads LIMIT 0`;
    },

    async insert(lead: Lead): Promise<void> {
      const sql = getSql();
      await sql`
        INSERT INTO public.leads (nome, email, whatsapp, tipo_atividade, origem, mensagem)
        VALUES (${lead.nome}, ${lead.email}, ${lead.whatsapp}, ${lead.tipo_atividade}, ${lead.origem}, ${lead.mensagem})
      `;
    },
  };
}
