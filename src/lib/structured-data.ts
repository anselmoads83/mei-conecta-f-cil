export const SITE_URL = "https://www.anselmodiascontador.com.br/";

// Resolve the imported Vite asset for this build, rather than hardcoding its hash.
export function createHomeSchema(logoUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.anselmodiascontador.com.br/#organization",
        "name": "Anselmo Dias Contador",
        "url": "https://www.anselmodiascontador.com.br/",
        "description": "Contabilidade especializada para microempreendedores individuais, com atendimento digital em todo o Brasil.",
        "logo": logoUrl,
        "email": "gestao@anselmodiascontador.com.br",
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        },
        "telephone": "+5511915470723"
      },
      {
        "@type": "WebSite",
        "@id": "https://www.anselmodiascontador.com.br/#website",
        "url": "https://www.anselmodiascontador.com.br/",
        "name": "Anselmo Dias Contador",
        "inLanguage": "pt-BR",
        "publisher": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://www.anselmodiascontador.com.br/#webpage",
        "url": "https://www.anselmodiascontador.com.br/",
        "name": "Anselmo Dias — Contador Especialista em MEI",
        "description": "Regularize seu MEI com um contador especialista: DAS atrasado, DASN-SIMEI, dívidas, NF-e, abertura e baixa. Atendimento online em todo o Brasil.",
        "inLanguage": "pt-BR",
        "isPartOf": {
          "@id": "https://www.anselmodiascontador.com.br/#website"
        },
        "mainEntity": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        },
        "publisher": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        }
      },
      {
        "@type": "Service",
        "@id": "https://www.anselmodiascontador.com.br/#service-abertura-mei",
        "name": "Abertura do MEI",
        "serviceType": "Abertura do MEI",
        "description": "Formalize seu negócio com orientação especializada.",
        "url": "https://www.anselmodiascontador.com.br/#servicos",
        "provider": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        }
      },
      {
        "@type": "Service",
        "@id": "https://www.anselmodiascontador.com.br/#service-alteracao-cadastral",
        "name": "Alteração Cadastral",
        "serviceType": "Alteração Cadastral",
        "description": "Atualize atividades, endereço e dados do MEI.",
        "url": "https://www.anselmodiascontador.com.br/#servicos",
        "provider": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        }
      },
      {
        "@type": "Service",
        "@id": "https://www.anselmodiascontador.com.br/#service-encerramento-mei",
        "name": "Encerramento do MEI",
        "serviceType": "Encerramento do MEI",
        "description": "Encerre seu MEI com orientação adequada.",
        "url": "https://www.anselmodiascontador.com.br/#servicos",
        "provider": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        }
      },
      {
        "@type": "Service",
        "@id": "https://www.anselmodiascontador.com.br/#service-das-parcelamentos",
        "name": "DAS e Parcelamentos",
        "serviceType": "DAS e Parcelamentos",
        "description": "Atualize guias e negocie seus débitos.",
        "url": "https://www.anselmodiascontador.com.br/#servicos",
        "provider": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        }
      },
      {
        "@type": "Service",
        "@id": "https://www.anselmodiascontador.com.br/#service-declaracao-anual",
        "name": "Declaração Anual (DASN-SIMEI)",
        "serviceType": "Declaração Anual (DASN-SIMEI)",
        "description": "Elaboração e envio da declaração do MEI.",
        "url": "https://www.anselmodiascontador.com.br/#servicos",
        "provider": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        }
      },
      {
        "@type": "Service",
        "@id": "https://www.anselmodiascontador.com.br/#service-emissao-notas",
        "name": "Emissão de Notas Fiscais",
        "serviceType": "Emissão de Notas Fiscais",
        "description": "Emissão de NFS-e e orientação fiscal.",
        "url": "https://www.anselmodiascontador.com.br/#servicos",
        "provider": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        }
      },
      {
        "@type": "Service",
        "@id": "https://www.anselmodiascontador.com.br/#service-imposto-renda",
        "name": "Imposto de Renda (IRPF)",
        "serviceType": "Imposto de Renda (IRPF)",
        "description": "Declaração de IRPF do titular do MEI.",
        "url": "https://www.anselmodiascontador.com.br/#servicos",
        "provider": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        }
      },
      {
        "@type": "Service",
        "@id": "https://www.anselmodiascontador.com.br/#service-consultoria-contabil",
        "name": "Consultoria Contábil",
        "serviceType": "Consultoria Contábil",
        "description": "Orientação especializada para seu negócio.",
        "url": "https://www.anselmodiascontador.com.br/#servicos",
        "provider": {
          "@id": "https://www.anselmodiascontador.com.br/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        }
      }
    ]
  };
}

export const privacySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.anselmodiascontador.com.br/politica-de-privacidade#webpage",
  "url": "https://www.anselmodiascontador.com.br/politica-de-privacidade",
  "name": "Política de Privacidade, Cookies e Termos de Uso — Anselmo Dias Contador",
  "description": "Conheça nossa Política de Privacidade, as regras de uso de cookies e os Termos de Uso do site Anselmo Dias Contador. Transparência, segurança e conformidade com a LGPD.",
  "inLanguage": "pt-BR",
  "isPartOf": {
    "@id": "https://www.anselmodiascontador.com.br/#website"
  },
  "publisher": {
    "@id": "https://www.anselmodiascontador.com.br/#organization"
  }
};
