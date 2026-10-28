import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import {
  sanitizePublicLeadInput,
  submitLeadFromServer,
  type PublicLeadFormSubmissionInput,
  type LeadSubmissionResult,
} from "../leads.server";

// Server Function do TanStack Start para envio seguro de leads do formulário de contato.
// Toda a execução de `.handler` ocorre exclusivamente no servidor Node.js,
// preservando LEAD_INGEST_SECRET fora do alcance do navegador.
// O endpoint público aceita exclusivamente os campos do formulário e descarta
// qualquer tentativa externa de controlar `validar_apenas`.

export const submitContactLead = createServerFn({ method: "POST" })
  .inputValidator((data: PublicLeadFormSubmissionInput) => sanitizePublicLeadInput(data))
  .handler(async ({ data }): Promise<LeadSubmissionResult> => {
    let headers: Headers | Record<string, string | undefined> | undefined;
    try {
      headers = getRequestHeaders() as unknown as Headers | Record<string, string | undefined>;
    } catch {
      headers = undefined;
    }

    const publicInput = sanitizePublicLeadInput(data);
    return await submitLeadFromServer(publicInput, { headers });
  });
