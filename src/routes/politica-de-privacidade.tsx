import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, ChevronDown, Shield, FileText, Check } from "lucide-react";
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
            className="rounded-2xl border border-white/15 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/25"
          >
            {/* Cabeçalho do Cartão 01 (Botão Interativo de Expansão) */}
            <button
              type="button"
              onClick={toggleCard1}
              aria-expanded={openCard1}
              aria-controls="card-01-content"
              className="w-full text-left p-5 sm:p-7 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F]"
            >
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                {/* Número 01 em Verde-Limão */}
                <div className="text-3xl sm:text-4xl font-extrabold text-[#CBFF1F] tracking-tight flex-shrink-0 font-['Poppins']">
                  01
                </div>

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

              {/* Ícone Circular de Seta */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 text-white/80 transition-transform duration-300 ${
                  openCard1 ? "rotate-180 bg-white/10 text-white" : ""
                }`}
                aria-hidden="true"
              >
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            {/* Conteúdo Integral do Cartão 01 */}
            <div
              id="card-01-content"
              hidden={!openCard1}
              className={!openCard1 ? "hidden" : "px-5 sm:px-7 pb-8 pt-2 border-t border-white/10 text-white/90 text-sm sm:text-[15px] leading-relaxed space-y-6"}
            >
                <div className="pt-2 text-xs sm:text-sm font-semibold tracking-wider text-[#CBFF1F] uppercase">
                  Anselmo Dias Contador — Versão de referência: 01 de novembro de 2026
                </div>

                <p>
                  O site Anselmo Dias Contador, sob responsabilidade de <strong>Anselmo Dias da Silva</strong>, contador
                  registrado no Conselho Regional de Contabilidade de São Paulo sob nº <strong>1SP226494/O-2</strong>,
                  respeita a privacidade de seus visitantes e está comprometido com a proteção dos dados pessoais, em
                  conformidade com a Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD).
                </p>

                <p>
                  Esta política apresenta, de forma clara e objetiva, como os dados pessoais são coletados, utilizados,
                  armazenados e protegidos, além de informar sobre o uso de cookies e os direitos dos visitantes.
                </p>

                {/* 1. Dados coletados e finalidades */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">1.</span> Dados coletados e finalidades
                  </h3>
                  <p>
                    O site Anselmo Dias Contador coleta dados pessoais fornecidos voluntariamente pelos visitantes,
                    como nome, telefone, WhatsApp, endereço de e-mail e informações encaminhadas por formulários ou
                    canais de atendimento.
                  </p>
                  <p>
                    Esses dados são utilizados para responder solicitações, esclarecer dúvidas, realizar atendimentos,
                    apresentar propostas e prestar os serviços solicitados.
                  </p>
                  <p>
                    O tratamento ocorre conforme as bases legais aplicáveis, especialmente a realização de
                    procedimentos preliminares relacionados à contratação, a execução de contratos e, quando
                    necessário, o consentimento do titular.
                  </p>
                </div>

                {/* 2. Armazenamento e prazo de retenção */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">2.</span> Armazenamento e prazo de retenção
                  </h3>
                  <p>
                    Os dados pessoais são armazenados em sistemas tecnológicos utilizados na operação do site,
                    observadas medidas adequadas de segurança e proteção.
                  </p>
                  <p>
                    As informações de visitantes que solicitarem contato, mas não contratarem serviços, poderão ser
                    conservadas por até 12 meses após o último contato relevante, sendo posteriormente eliminadas ou
                    anonimizadas, salvo quando houver fundamento legal para sua conservação.
                  </p>
                  <p>
                    Os dados relacionados à prestação de serviços serão mantidos durante o período necessário ao
                    atendimento das finalidades contratuais e ao cumprimento das obrigações legais aplicáveis.
                  </p>
                </div>

                {/* 3. Cookies e consentimento */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">3.</span> Cookies e consentimento
                  </h3>
                  <p>
                    O site poderá utilizar cookies e tecnologias semelhantes para garantir seu funcionamento,
                    preservar a segurança e, quando aplicável, analisar o desempenho das páginas e das campanhas de
                    divulgação.
                  </p>
                  <p>
                    Os cookies estritamente necessários poderão ser utilizados para assegurar funcionalidades
                    essenciais do site. Já os cookies opcionais de análise e publicidade, quando utilizados e sujeitos
                    a consentimento, somente serão ativados após a autorização do visitante.
                  </p>
                  <p>
                    O visitante poderá aceitar ou rejeitar os cookies opcionais, sem prejuízo do acesso às
                    funcionalidades essenciais do site, e modificar suas preferências posteriormente por meio do
                    recurso disponibilizado na página.
                  </p>
                  <p>
                    A duração dos cookies poderá variar conforme sua finalidade e as configurações dos serviços
                    efetivamente utilizados.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => openCookiePreferencesModal()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 text-xs sm:text-sm text-white hover:border-[#CBFF1F] hover:text-[#CBFF1F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F] cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#CBFF1F]" aria-hidden="true" />
                      <span>Gerenciar preferências de cookies</span>
                    </button>
                  </div>
                </div>

                {/* 4. Compartilhamento e proteção dos dados */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">4.</span> Compartilhamento e proteção dos dados
                  </h3>
                  <p>
                    Os dados pessoais poderão ser tratados por fornecedores tecnológicos necessários ao funcionamento
                    do site, incluindo serviços de hospedagem, armazenamento e comunicação, respeitadas as disposições
                    da LGPD.
                  </p>
                  <p>
                    São adotadas medidas técnicas e administrativas adequadas para reduzir os riscos de acesso não
                    autorizado, perda, alteração ou utilização indevida das informações.
                  </p>
                  <p>
                    Caso ocorra algum incidente de segurança envolvendo dados pessoais, serão adotadas as
                    providências cabíveis, inclusive as comunicações legalmente exigidas, quando aplicáveis.
                  </p>
                </div>

                {/* 5. Direitos dos titulares */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">5.</span> Direitos dos titulares
                  </h3>
                  <p>
                    Nos termos do artigo 18 da LGPD, os titulares poderão solicitar, conforme os requisitos legais:
                    confirmação da existência de tratamento de seus dados pessoais; acesso às informações
                    armazenadas; correção de dados incompletos, incorretos ou desatualizados; anonimização, bloqueio ou
                    eliminação, quando cabível; informações sobre o compartilhamento de dados; e revogação do
                    consentimento anteriormente concedido.
                  </p>
                  <p>
                    As solicitações poderão ser encaminhadas ao canal de contato indicado nesta política, respeitadas
                    as hipóteses legais de conservação dos dados.
                  </p>
                </div>

                {/* 6. Controlador dos dados e contato */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">6.</span> Controlador dos dados e contato
                  </h3>
                  <p>
                    O responsável pelas decisões relativas ao tratamento dos dados pessoais coletados por meio deste
                    site é:
                  </p>
                  <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-1.5 text-xs sm:text-sm">
                    <p>
                      <strong>Controlador:</strong> Anselmo Dias da Silva
                    </p>
                    <p>
                      <strong>Qualificação profissional:</strong> Contador
                    </p>
                    <p>
                      <strong>Registro profissional:</strong> CRC-SP 1SP226494/O-2
                    </p>
                    <p>
                      <strong>Nome comercial:</strong> Anselmo Dias Contador
                    </p>
                    <p>
                      <strong>E-mail para assuntos de privacidade:</strong>{" "}
                      <a
                        href="mailto:gestao@anselmodiascontador.com.br"
                        className="text-[#CBFF1F] hover:underline"
                      >
                        gestao@anselmodiascontador.com.br
                      </a>
                    </p>
                  </div>
                  <p className="text-xs text-white/70">
                    Os visitantes poderão utilizar esse canal para esclarecer dúvidas e exercer seus direitos
                    relacionados à proteção de dados pessoais.
                  </p>
                </div>

                {/* 7. Atualizações desta política */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">7.</span> Atualizações desta política
                  </h3>
                  <p>
                    Esta Política de Privacidade e Cookies poderá ser atualizada para refletir alterações nos serviços
                    prestados, nas tecnologias utilizadas ou nas exigências legais aplicáveis.
                  </p>
                  <p>
                    A versão vigente será disponibilizada neste site, acompanhada da data de sua última atualização.
                  </p>
                </div>
              </div>
          </section>

          {/* ==================== CARTÃO 02 ==================== */}
          <section
            id="termos"
            aria-labelledby="card-02-title"
            className="rounded-2xl border border-white/15 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/25"
          >
            {/* Cabeçalho do Cartão 02 (Botão Interativo de Expansão) */}
            <button
              type="button"
              onClick={toggleCard2}
              aria-expanded={openCard2}
              aria-controls="card-02-content"
              className="w-full text-left p-5 sm:p-7 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F]"
            >
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                {/* Número 02 em Verde-Limão */}
                <div className="text-3xl sm:text-4xl font-extrabold text-[#CBFF1F] tracking-tight flex-shrink-0 font-['Poppins']">
                  02
                </div>

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

              {/* Ícone Circular de Seta */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 text-white/80 transition-transform duration-300 ${
                  openCard2 ? "rotate-180 bg-white/10 text-white" : ""
                }`}
                aria-hidden="true"
              >
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            {/* Conteúdo Integral do Cartão 02 */}
            <div
              id="card-02-content"
              hidden={!openCard2}
              className={!openCard2 ? "hidden" : "px-5 sm:px-7 pb-8 pt-2 border-t border-white/10 text-white/90 text-sm sm:text-[15px] leading-relaxed space-y-6"}
            >
                <div className="pt-2 text-xs sm:text-sm font-semibold tracking-wider text-[#CBFF1F] uppercase">
                  Anselmo Dias Contador — Versão de referência: 01 de novembro de 2026
                </div>

                <p>
                  Bem-vindo ao site Anselmo Dias Contador. Ao acessar e utilizar este site, o visitante deve observar
                  as condições descritas nestes Termos de Uso, respeitada a legislação brasileira aplicável.
                </p>

                {/* 1. Finalidade do site */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">1.</span> Finalidade do site
                  </h3>
                  <p>
                    O site Anselmo Dias Contador tem como finalidade apresentar informações, conteúdos educativos e
                    serviços relacionados à contabilidade, orientação empresarial, regularização de MEI e demais
                    atividades profissionais divulgadas na plataforma.
                  </p>
                  <p>
                    As informações disponibilizadas possuem caráter informativo e não substituem uma análise
                    individualizada da situação de cada interessado.
                  </p>
                </div>

                {/* 2. Utilização do conteúdo */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">2.</span> Utilização do conteúdo
                  </h3>
                  <p>
                    Os textos, elementos gráficos, identidade visual e demais materiais disponibilizados neste site são
                    protegidos pela legislação aplicável de propriedade intelectual, ressalvados os conteúdos de
                    terceiros devidamente identificados.
                  </p>
                  <p>
                    É permitida a consulta e utilização pessoal das informações, sendo vedada a reprodução comercial
                    não autorizada dos materiais protegidos.
                  </p>
                </div>

                {/* 3. Informações e atualizações */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">3.</span> Informações e atualizações
                  </h3>
                  <p>O Anselmo Dias Contador busca disponibilizar informações claras, corretas e atualizadas.</p>
                  <p>
                    Entretanto, conteúdos relacionados à legislação tributária, contábil e empresarial podem sofrer
                    alterações em razão de novas normas ou interpretações dos órgãos competentes.
                  </p>
                  <p>
                    O conteúdo do site poderá ser atualizado, corrigido ou removido sempre que necessário, sem obrigação
                    de comunicação individual prévia aos visitantes.
                  </p>
                </div>

                {/* 4. Links externos */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">4.</span> Links externos
                  </h3>
                  <p>
                    O site poderá disponibilizar links para páginas de terceiros, incluindo órgãos públicos,
                    plataformas de serviços e outros conteúdos informativos.
                  </p>
                  <p>
                    O Anselmo Dias Contador não controla o funcionamento, a disponibilidade ou as políticas dessas
                    páginas externas, não se responsabilizando por conteúdos e práticas de terceiros que estejam fora de
                    sua atuação, ressalvadas as responsabilidades previstas em lei.
                  </p>
                </div>

                {/* 5. Responsabilidades do visitante */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">5.</span> Responsabilidades do visitante
                  </h3>
                  <p>
                    O visitante compromete-se a utilizar o site de maneira lícita, respeitando a legislação vigente e
                    os direitos de terceiros.
                  </p>
                  <p>
                    As informações encaminhadas por formulários deverão ser verdadeiras e adequadas à finalidade do
                    atendimento solicitado.
                  </p>
                </div>

                {/* 6. Privacidade e proteção de dados */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">6.</span> Privacidade e proteção de dados
                  </h3>
                  <p>
                    O tratamento de dados pessoais realizado por meio do site observará a Lei nº 13.709/2018 — Lei
                    Geral de Proteção de Dados Pessoais (LGPD).
                  </p>
                  <p>
                    As informações sobre coleta, utilização, armazenamento e direitos dos titulares estão disponíveis na
                    Política de Privacidade e Cookies, acessível neste site.
                  </p>
                </div>

                {/* 7. Alterações dos Termos de Uso */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">7.</span> Alterações dos Termos de Uso
                  </h3>
                  <p>
                    Estes Termos de Uso poderão ser modificados para refletir alterações nos serviços, nas
                    funcionalidades do site ou na legislação aplicável.
                  </p>
                  <p>
                    A versão atualizada será disponibilizada nesta página, acompanhada da respectiva data de
                    atualização.
                  </p>
                </div>

                {/* 8. Legislação aplicável */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">8.</span> Legislação aplicável
                  </h3>
                  <p>Estes Termos de Uso são regidos pela legislação da República Federativa do Brasil.</p>
                  <p>
                    Eventuais controvérsias serão solucionadas conforme as regras de competência estabelecidas pela
                    legislação brasileira, respeitados os direitos legalmente assegurados aos usuários e consumidores.
                  </p>
                </div>

                {/* 9. Responsável e contato */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#CBFF1F]">9.</span> Responsável e contato
                  </h3>
                  <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-1.5 text-xs sm:text-sm">
                    <p>
                      <strong>Responsável:</strong> Anselmo Dias da Silva
                    </p>
                    <p>
                      <strong>Qualificação profissional:</strong> Contador — CRC-SP 1SP226494/O-2
                    </p>
                    <p>
                      <strong>Nome comercial:</strong> Anselmo Dias Contador
                    </p>
                    <p>
                      <strong>E-mail:</strong>{" "}
                      <a
                        href="mailto:gestao@anselmodiascontador.com.br"
                        className="text-[#CBFF1F] hover:underline"
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
