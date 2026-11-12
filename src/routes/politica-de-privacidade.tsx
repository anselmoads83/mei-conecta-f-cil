import { StructuredData } from "@/components/StructuredData";
import { privacySchema } from "@/lib/structured-data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, ChevronDown, Shield } from "lucide-react";
import logoImg from "@/assets/images/logo-anselmo-dias.webp";
import { openCookiePreferencesModal } from "@/lib/cookie-consent";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade, Cookies e Termos de Uso — Anselmo Dias Contador" },
      {
        name: "description",
        content:
          "Conheça nossa Política de Privacidade, as regras de uso de cookies e os Termos de Uso do site Anselmo Dias Contador. Transparência, segurança e conformidade com a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade, Cookies e Termos de Uso — Anselmo Dias Contador" },
      {
        property: "og:description",
        content:
          "Transparência, proteção de dados e diretrizes de uso do site oficial do Anselmo Dias Contador em conformidade com a LGPD.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.anselmodiascontador.com.br/politica-de-privacidade" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "Anselmo Dias Contador" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Política de Privacidade, Cookies e Termos de Uso — Anselmo Dias Contador" },
      { name: "twitter:description", content: "Diretrizes de privacidade, cookies e termos de uso do site Anselmo Dias Contador." },
    ],
    links: [
      { rel: "canonical", href: "https://www.anselmodiascontador.com.br/politica-de-privacidade" },
    ],
  }),
  component: PoliticaPrivacidadePage,
});

function PoliticaPrivacidadePage() {
  // Controle de expansão acessível dos dois cartões
  const [openCard1, setOpenCard1] = useState(true);
  const [openCard2, setOpenCard2] = useState(true);

  // Tratamento de âncoras na URL (#privacidade ou #termos)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#privacidade") {
        setOpenCard1(true);
        const el = document.getElementById("privacidade");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else if (hash === "#termos") {
        setOpenCard2(true);
        const el = document.getElementById("termos");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const toggleCard1 = () => {
    setOpenCard1((prev) => !prev);
  };

  const toggleCard2 = () => {
    setOpenCard2((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#CBFF1F] selection:text-black font-['Poppins',sans-serif]">
      <StructuredData id="schema-privacy" data={privacySchema} />
      {/* ------------------------- Cabeçalho Oficial ------------------------- */}
      <header className="w-full bg-[#000000] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-24 sm:h-28 flex items-center justify-between">
          {/* Logotipo Oficial Original */}
          <Link
            to="/"
            className="group block flex-shrink-0 w-[150px] sm:w-[190px] lg:w-[220px]"
            aria-label="Anselmo Dias Contador - Voltar à Página Inicial"
          >
            <span className="relative block w-full overflow-hidden aspect-[644/290] origin-left transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.03]">
              <img
                src={logoImg}
                alt="Anselmo Dias Contador"
                className="absolute max-w-none w-[127.18%] h-auto left-[-13.35%] top-[-116.21%]"
                width={644}
                height={290}
              />
            </span>
          </Link>

          {/* Botão VOLTAR AO SITE */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#CBFF1F] text-[#CBFF1F] hover:bg-[#CBFF1F] hover:text-black font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Voltar ao site</span>
          </Link>
        </div>
      </header>

      {/* ------------------------- Conteúdo Principal ------------------------- */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        {/* Selo: TRANSPARÊNCIA E SEGURANÇA */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CBFF1F] text-black font-extrabold text-[11px] sm:text-xs tracking-wider uppercase shadow-sm">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            Transparência e Segurança
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase mb-4">
          Política de Privacidade, <br className="hidden sm:inline" />
          Cookies e Termos de Uso
        </h1>

        {/* Data de Atualização */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 mb-10 sm:mb-12">
          <Calendar className="w-4 h-4 text-[#CBFF1F]" aria-hidden="true" />
          <span>Última atualização: 01 de novembro de 2026</span>
        </div>

        {/* ----------------- DOIS BLOCOS DE NAVEGAÇÃO / CARTÕES ----------------- */}
        <div className="space-y-8">
          {/* ==================== CARTÃO 01 ==================== */}
          <section
            id="privacidade"
            aria-labelledby="card-01-title"
            className="rounded-2xl sm:rounded-3xl border border-white/15 bg-[#000000] overflow-hidden transition-colors hover:border-white/25"
          >
            {/* Cabeçalho do Cartão 01 (Botão Interativo de Expansão) */}
            <button
              type="button"
              onClick={toggleCard1}
              aria-expanded={openCard1}
              aria-controls="card-01-content"
              className="group w-full text-left p-5 sm:p-7 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F] bg-[#000000]"
            >
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                {/* Número 01 em Verde-Limão */}
                <div className="text-3xl sm:text-4xl font-extrabold text-[#CBFF1F] tracking-tight flex-shrink-0 font-['Poppins']">
                  01
                </div>

                {/* Divisor Vertical */}
                <div className="h-8 sm:h-10 w-[1px] bg-white/20 flex-shrink-0" aria-hidden="true" />

                {/* Título e Subtítulo */}
                <div className="min-w-0">
                  <h2
                    id="card-01-title"
                    className="text-base sm:text-xl font-bold text-white tracking-tight uppercase leading-snug"
                  >
                    Política de Privacidade e Cookies
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9CA3AF] mt-0.5 leading-snug">
                    Como tratamos seus dados e utilizamos cookies.
                  </p>
                </div>
              </div>

              {/* Botão Circular de Expansão com Estados Normal, Hover e Ativo */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 motion-reduce:transition-none ${
                  openCard1
                    ? "bg-[#CBFF1F] border-[#CBFF1F] text-black"
                    : "bg-white/[0.05] border-white/20 text-white group-hover:bg-[#CBFF1F] group-hover:border-[#CBFF1F] group-hover:text-black group-focus-visible:bg-[#CBFF1F] group-focus-visible:border-[#CBFF1F] group-focus-visible:text-black"
                }`}
                aria-hidden="true"
              >
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 motion-reduce:transition-none ${
                    openCard1 ? "rotate-180 text-black" : "text-current"
                  }`}
                />
              </div>
            </button>

            {/* Conteúdo Integral do Cartão 01 em Fundo Branco */}
            <div
              id="card-01-content"
              hidden={!openCard1}
              className={
                !openCard1
                  ? "hidden"
                  : "bg-[#FFFFFF] text-black px-5 sm:px-8 lg:px-9 py-7 sm:py-9 text-sm sm:text-[15px] leading-relaxed space-y-6 font-['Poppins',sans-serif]"
              }
            >
              <p className="text-black">
                O site Anselmo Dias Contador, sob responsabilidade de <strong>Anselmo Dias da Silva</strong>, contador
                registrado no Conselho Regional de Contabilidade de São Paulo sob nº <strong>1SP226494/O-2</strong>,
                respeita a privacidade de seus visitantes e está comprometido com a proteção dos dados pessoais, em
                conformidade com a Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD).
              </p>

              <p className="text-black">
                Esta política apresenta, de forma clara e objetiva, como os dados pessoais são coletados, utilizados,
                armazenados e protegidos, além de informar sobre o uso de cookies e os direitos dos visitantes.
              </p>

              {/* 1. Dados coletados e finalidades */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">1.</span>
                    <span className="text-white">Dados coletados e finalidades</span>
                  </h3>
                </div>
                <p className="text-black">
                  O site Anselmo Dias Contador coleta dados pessoais fornecidos voluntariamente pelos visitantes,
                  como nome, telefone, WhatsApp, endereço de e-mail e informações encaminhadas por formulários ou
                  canais de atendimento.
                </p>
                <p className="text-black">
                  Esses dados são utilizados para responder solicitações, esclarecer dúvidas, realizar atendimentos,
                  apresentar propostas e prestar os serviços solicitados.
                </p>
                <p className="text-black">
                  O tratamento ocorre conforme as bases legais aplicáveis, especialmente a realização de
                  procedimentos preliminares relacionados à contratação, a execução de contratos e, quando
                  necessário, o consentimento do titular.
                </p>
              </div>

              {/* 2. Armazenamento e prazo de retenção */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">2.</span>
                    <span className="text-white">Armazenamento e prazo de retenção</span>
                  </h3>
                </div>
                <p className="text-black">
                  Os dados pessoais são armazenados em sistemas tecnológicos utilizados na operação do site,
                  observadas medidas adequadas de segurança e proteção.
                </p>
                <p className="text-black">
                  As informações de visitantes que solicitarem contato, mas não contratarem serviços, poderão ser
                  conservadas por até 12 meses após o último contato relevante, sendo posteriormente eliminadas ou
                  anonimizadas, salvo quando houver fundamento legal para sua conservação.
                </p>
                <p className="text-black">
                  Os dados relacionados à prestação de serviços serão mantidos durante o período necessário ao
                  atendimento das finalidades contratuais e ao cumprimento das obrigações legais aplicáveis.
                </p>
              </div>

              {/* 3. Cookies e consentimento */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">3.</span>
                    <span className="text-white">Cookies e consentimento</span>
                  </h3>
                </div>
                <p className="text-black">
                  O site poderá utilizar cookies e tecnologias semelhantes para garantir seu funcionamento,
                  preservar a segurança e, quando aplicável, analisar o desempenho das páginas e das campanhas de
                  divulgação.
                </p>
                <p className="text-black">
                  Os cookies estritamente necessários poderão ser utilizados para assegurar funcionalidades
                  essenciais do site. Já os cookies opcionais de análise e publicidade, quando utilizados e sujeitos
                  a consentimento, somente serão ativados após a autorização do visitante.
                </p>
                <p className="text-black">
                  O visitante poderá aceitar ou rejeitar os cookies opcionais, sem prejuízo do acesso às
                  funcionalidades essenciais do site, e modificar suas preferências posteriormente por meio do
                  recurso disponibilizado na página.
                </p>
                <p className="text-black">
                  A duração dos cookies poderá variar conforme sua finalidade e as configurações dos serviços
                  efetivamente utilizados.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openCookiePreferencesModal()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black bg-black text-white hover:bg-neutral-800 hover:border-neutral-800 transition-all font-semibold text-xs sm:text-sm cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#CBFF1F]" aria-hidden="true" />
                    <span>Gerenciar preferências de cookies</span>
                  </button>
                </div>
              </div>

              {/* 4. Compartilhamento e proteção dos dados */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">4.</span>
                    <span className="text-white">Compartilhamento e proteção dos dados</span>
                  </h3>
                </div>
                <p className="text-black">
                  Os dados pessoais poderão ser tratados por fornecedores tecnológicos necessários ao funcionamento
                  do site, incluindo serviços de hospedagem, armazenamento e comunicação, respeitadas as disposições
                  da LGPD.
                </p>
                <p className="text-black">
                  São adotadas medidas técnicas e administrativas adequadas para reduzir os riscos de acesso não
                  autorizado, perda, alteração ou utilização indevida das informações.
                </p>
                <p className="text-black">
                  Caso ocorra algum incidente de segurança envolvendo dados pessoais, serão adotadas as
                  providências cabíveis, inclusive as comunicações legalmente exigidas, quando aplicáveis.
                </p>
              </div>

              {/* 5. Direitos dos titulares */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">5.</span>
                    <span className="text-white">Direitos dos titulares</span>
                  </h3>
                </div>
                <p className="text-black">
                  Nos termos do artigo 18 da LGPD, os titulares poderão solicitar, conforme os requisitos legais:
                  confirmação da existência de tratamento de seus dados pessoais; acesso às informações
                  armazenadas; correção de dados incompletos, incorretos ou desatualizados; anonimização, bloqueio ou
                  eliminação, quando cabível; informações sobre o compartilhamento de dados; e revogação do
                  consentimento anteriormente concedido.
                </p>
                <p className="text-black">
                  As solicitações poderão ser encaminhadas ao canal de contato indicado nesta política, respeitadas
                  as hipóteses legais de conservação dos dados.
                </p>
              </div>

              {/* 6. Controlador dos dados e contato */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">6.</span>
                    <span className="text-white">Controlador dos dados e contato</span>
                  </h3>
                </div>
                <p className="text-black">
                  O responsável pelas decisões relativas ao tratamento dos dados pessoais coletados por meio deste
                  site é:
                </p>
                <div className="bg-[#F8F9FA] p-4 sm:p-5 rounded-xl border border-gray-200 space-y-1.5 text-xs sm:text-sm text-black">
                  <p>
                    <strong className="text-black">Controlador:</strong> Anselmo Dias da Silva
                  </p>
                  <p>
                    <strong className="text-black">Qualificação profissional:</strong> Contador
                  </p>
                  <p>
                    <strong className="text-black">Registro profissional:</strong> CRC-SP 1SP226494/O-2
                  </p>
                  <p>
                    <strong className="text-black">Nome comercial:</strong> Anselmo Dias Contador
                  </p>
                  <p>
                    <strong className="text-black">E-mail para assuntos de privacidade:</strong>{" "}
                    <a
                      href="mailto:gestao@anselmodiascontador.com.br"
                      className="text-black font-semibold underline underline-offset-2 hover:text-black/80"
                    >
                      gestao@anselmodiascontador.com.br
                    </a>
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  Os visitantes poderão utilizar esse canal para esclarecer dúvidas e exercer seus direitos
                  relacionados à proteção de dados pessoais.
                </p>
              </div>

              {/* 7. Atualizações desta política */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">7.</span>
                    <span className="text-white">Atualizações desta política</span>
                  </h3>
                </div>
                <p className="text-black">
                  Esta Política de Privacidade e Cookies poderá ser atualizada para refletir alterações nos serviços
                  prestados, nas tecnologias utilizadas ou nas exigências legais aplicáveis.
                </p>
                <p className="text-black">
                  A versão vigente será disponibilizada neste site, acompanhada da data de sua última atualização.
                </p>
              </div>
            </div>
          </section>

          {/* ==================== CARTÃO 02 ==================== */}
          <section
            id="termos"
            aria-labelledby="card-02-title"
            className="rounded-2xl sm:rounded-3xl border border-white/15 bg-[#000000] overflow-hidden transition-colors hover:border-white/25"
          >
            {/* Cabeçalho do Cartão 02 (Botão Interativo de Expansão) */}
            <button
              type="button"
              onClick={toggleCard2}
              aria-expanded={openCard2}
              aria-controls="card-02-content"
              className="group w-full text-left p-5 sm:p-7 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F] bg-[#000000]"
            >
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                {/* Número 02 em Verde-Limão */}
                <div className="text-3xl sm:text-4xl font-extrabold text-[#CBFF1F] tracking-tight flex-shrink-0 font-['Poppins']">
                  02
                </div>

                {/* Divisor Vertical */}
                <div className="h-8 sm:h-10 w-[1px] bg-white/20 flex-shrink-0" aria-hidden="true" />

                {/* Título e Subtítulo */}
                <div className="min-w-0">
                  <h2
                    id="card-02-title"
                    className="text-base sm:text-xl font-bold text-white tracking-tight uppercase leading-snug"
                  >
                    Termos de Uso
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9CA3AF] mt-0.5 leading-snug">
                    Condições de utilização do site.
                  </p>
                </div>
              </div>

              {/* Botão Circular de Expansão com Estados Normal, Hover e Ativo */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 motion-reduce:transition-none ${
                  openCard2
                    ? "bg-[#CBFF1F] border-[#CBFF1F] text-black"
                    : "bg-white/[0.05] border-white/20 text-white group-hover:bg-[#CBFF1F] group-hover:border-[#CBFF1F] group-hover:text-black group-focus-visible:bg-[#CBFF1F] group-focus-visible:border-[#CBFF1F] group-focus-visible:text-black"
                }`}
                aria-hidden="true"
              >
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 motion-reduce:transition-none ${
                    openCard2 ? "rotate-180 text-black" : "text-current"
                  }`}
                />
              </div>
            </button>

            {/* Conteúdo Integral do Cartão 02 em Fundo Branco */}
            <div
              id="card-02-content"
              hidden={!openCard2}
              className={
                !openCard2
                  ? "hidden"
                  : "bg-[#FFFFFF] text-black px-5 sm:px-8 lg:px-9 py-7 sm:py-9 text-sm sm:text-[15px] leading-relaxed space-y-6 font-['Poppins',sans-serif]"
              }
            >
              <p className="text-black">
                Bem-vindo ao site Anselmo Dias Contador. Ao acessar e utilizar este site, o visitante deve observar
                as condições descritas nestes Termos de Uso, respeitada a legislação brasileira aplicável.
              </p>

              {/* 1. Finalidade do site */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">1.</span>
                    <span className="text-white">Finalidade do site</span>
                  </h3>
                </div>
                <p className="text-black">
                  O site Anselmo Dias Contador tem como finalidade apresentar informações, conteúdos educativos e
                  serviços relacionados à contabilidade, orientação empresarial, regularização de MEI e demais
                  atividades profissionais divulgadas na plataforma.
                </p>
                <p className="text-black">
                  As informações disponibilizadas possuem caráter informativo e não substituem uma análise
                  personalizada da situação de cada negócio.
                </p>
              </div>

              {/* 2. Utilização do conteúdo */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">2.</span>
                    <span className="text-white">Utilização do conteúdo</span>
                  </h3>
                </div>
                <p className="text-black">
                  Os textos, marcas, logotipos, elementos visuais e demais conteúdos veiculados neste site são de
                  titularidade de Anselmo Dias Contador ou foram devidamente autorizados por seus titulares.
                </p>
                <p className="text-black">
                  É permitida a consulta e a leitura das informações para uso pessoal ou profissional individual.
                  A reprodução, distribuição, modificação ou exploração comercial não autorizada dependerá de prévia
                  autorização.
                </p>
              </div>

              {/* 3. Informações e atualizações */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">3.</span>
                    <span className="text-white">Informações e atualizações</span>
                  </h3>
                </div>
                <p className="text-black">
                  Buscamos manter as informações disponíveis neste site corretas e atualizadas. No entanto, em razão
                  das constantes alterações nas legislações tributária, trabalhista e previdenciária, orienta-se a
                  confirmação das regras aplicáveis ao caso concreto antes da tomada de decisões.
                </p>
              </div>

              {/* 4. Links externos */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">4.</span>
                    <span className="text-white">Links externos</span>
                  </h3>
                </div>
                <p className="text-black">
                  O site poderá apresentar links para plataformas externas, incluindo órgãos públicos e serviços
                  governamentais. Anselmo Dias Contador não possui controle sobre tais ambientes, cabendo ao visitante
                  analisar as políticas e termos de terceiros.
                </p>
              </div>

              {/* 5. Responsabilidades do visitante */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">5.</span>
                    <span className="text-white">Responsabilidades do visitante</span>
                  </h3>
                </div>
                <p className="text-black">
                  O visitante se compromete a utilizar este site de maneira ética, respeitando a lei e não
                  comprometendo sua integridade, estabilidade ou segurança, abstendo-se de condutas que possam violar
                  os direitos de terceiros.
                </p>
                <p className="text-black">
                  As informações encaminhadas por formulários deverão ser verdadeiras e adequadas à finalidade do
                  atendimento solicitado.
                </p>
              </div>

              {/* 6. Privacidade e proteção de dados */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">6.</span>
                    <span className="text-white">Privacidade e proteção de dados</span>
                  </h3>
                </div>
                <p className="text-black">
                  O tratamento de dados pessoais realizado por meio do site observará a Lei nº 13.709/2018 — Lei
                  Geral de Proteção de Dados Pessoais (LGPD).
                </p>
                <p className="text-black">
                  As informações sobre coleta, utilização, armazenamento e direitos dos titulares estão disponíveis na
                  Política de Privacidade e Cookies, acessível neste site.
                </p>
              </div>

              {/* 7. Alterações dos Termos de Uso */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">7.</span>
                    <span className="text-white">Alterações dos Termos de Uso</span>
                  </h3>
                </div>
                <p className="text-black">
                  Estes Termos de Uso poderão ser modificados para refletir alterações nos serviços, nas
                  funcionalidades do site ou na legislação aplicável.
                </p>
                <p className="text-black">
                  A versão atualizada será disponibilizada nesta página, acompanhada da respectiva data de
                  atualização.
                </p>
              </div>

              {/* 8. Legislação aplicável */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">8.</span>
                    <span className="text-white">Legislação aplicável</span>
                  </h3>
                </div>
                <p className="text-black">Estes Termos de Uso são regidos pela legislação da República Federativa do Brasil.</p>
                <p className="text-black">
                  Eventuais controvérsias serão solucionadas conforme as regras de competência estabelecidas pela
                  legislação brasileira, respeitados os direitos legalmente assegurados aos usuários e consumidores.
                </p>
              </div>

              {/* 9. Responsável e contato */}
              <div className="space-y-3 pt-2">
                <div className="bg-[#000000] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                    <span className="text-[#CBFF1F]">9.</span>
                    <span className="text-white">Responsável e contato</span>
                  </h3>
                </div>
                <div className="bg-[#F8F9FA] p-4 sm:p-5 rounded-xl border border-gray-200 space-y-1.5 text-xs sm:text-sm text-black">
                  <p>
                    <strong className="text-black">Responsável:</strong> Anselmo Dias da Silva
                  </p>
                  <p>
                    <strong className="text-black">Qualificação profissional:</strong> Contador — CRC-SP 1SP226494/O-2
                  </p>
                  <p>
                    <strong className="text-black">Nome comercial:</strong> Anselmo Dias Contador
                  </p>
                  <p>
                    <strong className="text-black">E-mail:</strong>{" "}
                    <a
                      href="mailto:gestao@anselmodiascontador.com.br"
                      className="text-black font-semibold underline underline-offset-2 hover:text-black/80"
                    >
                      gestao@anselmodiascontador.com.br
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ------------------------- Rodapé da Página Legal ------------------------- */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
          <p>© 2026 Anselmo Dias Contador. Todos os direitos reservados.</p>
          <Link
            to="/"
            className="text-white hover:text-[#CBFF1F] transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Voltar à página inicial
          </Link>
        </div>
      </main>
    </div>
  );
}
