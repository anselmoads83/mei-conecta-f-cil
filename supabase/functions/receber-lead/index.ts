// Edge Function: receber-lead
// Projeto Supabase: anselmo-dias-contador (jsmxdavhddvwuspzqtkn)
// Tabela de destino: public.leads
//
// Ponto de entrada do runtime Deno. Toda a lógica está em módulos testáveis:
//   auth.ts        -> LEAD_INGEST_SECRET + credenciais transitórias
//   validation.ts  -> contrato original (limites, campos, 16.384 bytes)
//   handler.ts     -> fluxo HTTP e códigos de resposta
//   repository.ts  -> SQL do dry-run e da inserção

import postgres from "npm:postgres@3.4.7";
import { createHandler } from "./handler.ts";
import { createPostgresRepository } from "./repository.ts";
import type { SqlTag } from "./repository.ts";

let sqlClient: ReturnType<typeof postgres> | null = null;

function getSql(): SqlTag {
  if (!sqlClient) {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    // Ausência da URL é tratada pelo handler como banco indisponível (503).
    if (!dbUrl) throw new Error("db_url_missing");
    sqlClient = postgres(dbUrl, {
      max: 1,
      prepare: false,
      ssl: "require",
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sqlClient as unknown as SqlTag;
}

const repository = createPostgresRepository(getSql);

Deno.serve(
  createHandler({
    getEnv: (name) => Deno.env.get(name),
    getRepository: () => repository,
    // Somente nomes de eventos; nunca credenciais ou dados pessoais.
    log: (event) => console.error(JSON.stringify({ fn: "receber-lead", event })),
  }),
);
