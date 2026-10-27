import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { submitLeadFromServer, type LeadFormSubmissionInput, type LeadSubmissionResult } from "../leads.server";

// Server Function do TanStack Start para envio seguro de leads do formulário de contato.
// Toda a execução de `.handler` ocorre exclusivamente no servidor Node.js,
// preservando LEAD_INGEST_SECRET fora do alcance do navegador.

export const submitContactLead = createServerFn({ method: "POST" })
  .inputValidator((data: LeadFormSubmissionInput) => data)
  .handler(async ({ data }): Promise<LeadSubmissionResult> => {
    let headers: Headers | Record<string, string | undefined> | undefined;
    try {
      headers = getRequestHeaders() as unknown as Headers | Record<string, string | undefined>;
    } catch {
      headers = undefined;
    }

    return await submitLeadFromServer(data, { headers });
  });
