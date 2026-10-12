import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Instagram,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Heart,
  MapPin,
  Sparkles,
  Receipt,
  FileText,
  Briefcase,
  Quote,
  ChevronDown,
  Mail,
  Phone,
  Menu,
  X,
  FilePenLine,
  MessagesSquare,
  Calculator,
  BriefcaseBusiness,
  ClipboardCheck,
  FileCheck,
  Crown,
} from "lucide-react";
import anselmoPhoto from "@/assets/images/about-anselmo.jpg";
import anselmoPhotoHero from "@/assets/images/hero-anselmo.jpg";
import logoImg from "@/assets/images/logo-anselmo-dias.png";
import heroGeometricImg from "@/assets/images/hero-geometric.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Número WhatsApp: (11) 98330-2016
const WHATSAPP_NUMBER = "5511983302016";
const WHATSAPP_MSG = encodeURIComponent(
  "Olá Anselmo! Vim pela landing page e gostaria de uma orientação sobre meu MEI."
);
const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;
const instagramLink = "https://www.instagram.com/anselmodiascontador/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anselmo Dias — Contador Especialista em MEI" },
      {
        name: "description",
        content:
          "Regularize seu MEI com um contador especialista: DAS atrasado, DASN-SIMEI, dívidas, NF-e, abertura e baixa. Atendimento online em todo o Brasil.",
      },
      { property: "og:title", content: "Anselmo Dias — Contador Especialista em MEI" },
      {
        property: "og:description",
        content:
          "Receba orientação especializada para regularizar seu MEI. Atendimento humanizado via WhatsApp.",
      },
      { property: "og:image", content: anselmoPhotoHero },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "Anselmo Dias Contador" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Anselmo Dias — Contador Especialista em MEI" },
      { name: "twitter:description", content: "Regularize seu MEI com um contador especialista: DAS atrasado, DASN-SIMEI, dívidas, NF-e, abertura e baixa." },
      { name: "twitter:image", content: anselmoPhotoHero },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: LandingPage,
});

/* ----------------------------- UI Primitives ----------------------------- */

function CtaButton({
  children,
  className = "",
  variant = "primary",
  href = waLink,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "dark";
  href?: string;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-all duration-200 active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-[#cbff1f] text-[#111111] shadow-[0_8px_24px_-8px_rgba(203,255,31,0.6)] hover:bg-[#b8e818] hover:shadow-[0_12px_28px_-8px_rgba(203,255,31,0.7)] hover:-translate-y-0.5"
      : variant === "dark"
      ? "bg-[#111111] text-white hover:bg-[#2a2a2a]"
      : "border border-[#111111]/15 text-[#111111] hover:bg-[#111111] hover:text-white";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </a>
  );
}

function SectionTitle({
  kicker,
  title,
  subtitle,
  center = true,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-3xl mb-12`}>
      {kicker && (
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280] mb-3">
          {kicker}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-bold text-[#111111] tracking-tight leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-[#6b7280] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div
      role="separator"
      className={`w-full h-px bg-[#cbff1f] shadow-[0_0_8px_rgba(203,255,31,0.6)] border-0 relative z-20 pointer-events-none ${className}`}
    />
  );
}

/* --------------------------------- Page --------------------------------- */

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans overflow-x-clip">
      <Header />
      <main>
        <Hero />
        <SectionDivider />
        <SocialProof />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Services />
        <SectionDivider />
        <Plans />
        <SectionDivider />
        <Differentials />
        <SectionDivider />
        <Testimonials />
        <SectionDivider />
        <TrustBlock />
        <SectionDivider />
        <FAQ />
        <SectionDivider />
        <FinalCTA />
      </main>
      <SectionDivider />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

/* --------------------------------- Header -------------------------------- */

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Quem Somos", href: "#quem-somos" },
    { label: "Serviços", href: "#servicos" },
    { label: "Planos", href: "#planos" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full max-w-[100vw] bg-[#000000] border-b border-white/10 shadow-lg">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center justify-between h-24 sm:h-28 lg:h-32">
        {/* Left: Official Logo. The PNG has large black margins, so it is shown inside a
            frame matching the artwork's own aspect ratio (original file untouched, no distortion).
            The hover zoom is applied to the frame itself, so the clip box scales with the artwork. */}
        <a
          href="#top"
          className="group block flex-shrink-0 w-[150px] sm:w-[190px] lg:w-[230px]"
          aria-label="Anselmo Dias Contador - Início"
        >
          <span className="relative block w-full overflow-hidden aspect-[644/290] origin-left transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.04]">
            <img
              src={logoImg}
              alt="Anselmo Dias Contador"
              className="absolute max-w-none w-[127.18%] h-auto left-[-13.35%] top-[-116.21%]"
            />
          </span>
        </a>

        {/* Center: Desktop Navigation (lg and up) */}
        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[#CBFF1F] hover:text-white font-semibold text-[15px] tracking-tight transition-colors duration-200 py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: WhatsApp CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop/Tablet WhatsApp Button */}
          <div className="hidden sm:block">
            <CtaButton className="!px-5 !py-2.5 !text-sm font-semibold shadow-[0_0_20px_-4px_rgba(203,255,31,0.5)]">
              <MessageCircle className="h-4 w-4" />
              <span>Falar no WhatsApp</span>
            </CtaButton>
          </div>

          {/* Compact Mobile WhatsApp Button */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar no WhatsApp"
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#cbff1f] text-[#111111] shadow-[0_0_12px_rgba(203,255,31,0.4)] active:scale-95 transition-transform flex-shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-[#CBFF1F] hover:bg-white/15 transition-colors focus:outline-none flex-shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#000000] border-t border-white/10 px-5 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#CBFF1F] hover:text-white font-medium text-base py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-white/10">
            <CtaButton
              className="w-full !py-3 !text-sm font-semibold justify-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Falar no WhatsApp</span>
            </CtaButton>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------------------------- Hero --------------------------------- */

function Hero() {
  return (
    <section id="top" className="relative bg-[#000000] text-white overflow-hidden py-14 sm:py-20 lg:py-28">
      {/* Desktop Independent Right-Side Geometric Illustration Container */}
      <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-8 lg:right-12 xl:right-20 w-[40%] xl:w-[42%] h-full items-center justify-center pointer-events-none select-none z-10">
        <img
          src={heroGeometricImg}
          alt="Quadrados neon sobrepostos Anselmo Dias Contador"
          aria-hidden="true"
          className="w-full max-w-[460px] xl:max-w-[520px] h-auto object-contain scale-[1.35] xl:scale-[1.45] origin-center p-3"
        />
      </div>

      <div className="container-x relative z-20">
        <div className="max-w-[700px] xl:max-w-[780px]">
          {/* Typography Headline, Subtitle, CTA */}
          <div className="animate-fade-up">
            <h1 className="font-black uppercase tracking-[-0.035em] leading-[0.92] text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[5.25rem]">
              <span className="block text-white">CONTABILIDADE</span>
              <span className="block text-[#CBFF1F]">ESPECIALIZADA</span>
              <span className="block text-white">PARA O MEI</span>
            </h1>

            <p className="mt-6 sm:mt-7 text-white/85 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-xl">
              Soluções completas para abrir, regularizar, organizar{" "}
              <br className="hidden sm:inline" />
              e manter o seu MEI em dia, com segurança e praticidade.
            </p>

            <div className="mt-8 sm:mt-10 flex items-center">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#CBFF1F] text-[#111111] font-black uppercase text-sm sm:text-base px-7 sm:px-8 py-4 sm:py-4.5 rounded-full shadow-[0_0_30px_rgba(203,255,31,0.5)] hover:shadow-[0_0_45px_rgba(203,255,31,0.7)] hover:bg-[#b8e818] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] tracking-wide"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                </svg>
                <span>QUERO CONTRATAR</span>
                <ArrowRight className="h-5 w-5 stroke-[2.5]" />
              </a>
            </div>
          </div>

          {/* Mobile/Tablet Geometric Illustration (Stacked Below CTA) */}
          <div className="mt-12 flex lg:hidden items-center justify-center select-none pointer-events-none">
            <img
              src={heroGeometricImg}
              alt="Quadrados neon sobrepostos Anselmo Dias Contador"
              aria-hidden="true"
              className="w-full max-w-[300px] sm:max-w-[380px] md:max-w-[420px] h-auto object-contain origin-center p-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Social Proof ----------------------------- */

function SocialProof() {
  const stats = [
    { value: "+800", label: "MEIs Atendidos" },
    { value: "+1.000", label: "Obrigações Regularizadas" },
    { value: "100%", label: "Atendimento Digital" },
    { value: "BR", label: "Atendimento Nacional" },
  ];
  return (
    <section className="bg-[#fafafa]">
      <div className="container-x py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-bold tracking-tight text-[#111111]">
              {s.value}
            </div>
            <div className="text-xs md:text-sm text-[#6b7280] mt-1 uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- About --------------------------------- */

function About() {
  return (
    <section id="quem-somos" className="py-20 md:py-28">
      <div className="container-x grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 relative">
          <div className="rounded-3xl overflow-hidden aspect-square border border-[#111111]/10">
            <img
              src={anselmoPhoto}
              alt="Anselmo Dias em ambiente profissional"
              className="w-full h-full object-cover object-top"
              loading="lazy"
              width={896}
              height={896}
            />
          </div>
          <div className="absolute -bottom-6 -right-4 md:-right-6 bg-[#111111] text-white rounded-2xl p-5 max-w-[220px] shadow-xl">
            <div className="text-[#cbff1f] text-2xl font-bold">+800</div>
            <div className="text-xs text-white/70">
              Microempreendedores ajudados pelo Brasil
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
            Sobre
          </span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Quem é Anselmo Dias?
          </h2>
          <div className="mt-6 space-y-4 text-[#6b7280] leading-relaxed">
            <p>
              Sou contador, empreendedor e sócio da <strong className="text-[#111111]">Target Gestão Contábil</strong>.&nbsp;
              <br />
              Ao longo da minha trajetória, já ajudei centenas de microempreendedores
              a regularizar seus negócios, evitar multas e manter seus CNPJs em dia.
            </p>
            <p>
              Acredito que o MEI precisa de orientação <strong className="text-[#111111]">simples, clara e acessível</strong>,
              sem burocracia e sem linguagem complicada.
            </p>
            <p>
              Por isso, compartilho diariamente conteúdos educativos no Instagram
              e ofereço suporte especializado para quem precisa resolver problemas
              do MEI.
            </p>
          </div>
          <div className="mt-8">
            <CtaButton variant="dark" href={instagramLink}>
              <Instagram className="h-4 w-4" />
              Conhecer Meu Instagram
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Services ------------------------------- */

function Services() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const serviceList = [
    {
      title: "Abertura do MEI",
      desc: "Formalize seu negócio com orientação especializada.",
      icon: BriefcaseBusiness,
    },
    {
      title: "Alteração Cadastral",
      desc: "Atualize atividades, endereço e dados do MEI.",
      icon: FilePenLine,
    },
    {
      title: "Encerramento do MEI",
      desc: "Encerre seu MEI com orientação adequada.",
      icon: FileCheck,
    },
    {
      title: "DAS e Parcelamentos",
      desc: "Atualize guias e negocie seus débitos.",
      icon: Receipt,
    },
    {
      title: "Declaração Anual (DASN-SIMEI)",
      desc: "Elaboração e envio da declaração do MEI.",
      icon: ClipboardCheck,
    },
    {
      title: "Emissão de Notas Fiscais",
      desc: "Emissão de NFS-e e orientação fiscal.",
      icon: FileText,
    },
    {
      title: "Imposto de Renda (IRPF)",
      desc: "Declaração de IRPF do titular do MEI.",
      icon: Calculator,
    },
    {
      title: "Consultoria Contábil",
      desc: "Orientação especializada para seu negócio.",
      icon: MessagesSquare,
    },
  ];

  return (
    <section ref={sectionRef} id="servicos" className="bg-[#000000] text-white py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      <div className="container-x relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-white">
            SERVIÇOS
          </h2>

          <p className="mt-4 sm:mt-5 text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Soluções especializadas para abrir, regularizar e cuidar do seu MEI.
          </p>
        </div>

        {/* 8 Service Cards Grid: 4 cols on desktop, 2 cols on tablet, 1 col on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {serviceList.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`group flex flex-col rounded-2xl border border-[#303535] bg-[#101313] p-6 sm:p-7 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#cbff1f]/50 hover:shadow-[0_8px_30px_rgba(203,255,31,0.12)] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:animate-none motion-reduce:opacity-100 ${
                  isVisible ? "animate-fade-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Minimalist Icon Badge */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1b2b0a] to-[#0d1606] border border-[#cbff1f]/30 flex items-center justify-center text-[#cbff1f] group-hover:border-[#cbff1f]/60 group-hover:shadow-[0_0_15px_rgba(203,255,31,0.25)] group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                  <Icon className="h-6 w-6 stroke-[2]" />
                </div>

                {/* Service Title */}
                <h3 className="text-white font-bold text-lg sm:text-[19px] mt-6 mb-2 leading-snug">
                  {item.title}
                </h3>

                {/* Service Description */}
                <p className="text-white/70 text-sm sm:text-[15px] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Section CTA Button */}
        <div className="mt-14 sm:mt-16 flex justify-center">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#CBFF1F] hover:bg-[#b8e818] text-[#111111] font-extrabold uppercase text-sm sm:text-base px-8 sm:px-10 py-4 sm:py-4.5 rounded-full shadow-[0_0_30px_rgba(203,255,31,0.45)] hover:shadow-[0_0_45px_rgba(203,255,31,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 tracking-wide"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
            </svg>
            <span>QUERO FALAR COM UM ESPECIALISTA</span>
            <ArrowRight className="h-5 w-5 stroke-[2.5]" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Plans --------------------------------- */

function PlanCheckIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-[#cbff1f] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_8px_rgba(203,255,31,0.4)]">
      <svg
        viewBox="0 0 12 12"
        fill="none"
        className="w-3 h-3 text-[#000000] stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round"
        aria-hidden="true"
      >
        <polyline points="2.5 6 4.8 8.5 9.5 3.5" />
      </svg>
    </div>
  );
}

function Plans() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      id: "start",
      name: "START",
      nameColor: "text-[#cbff1f]",
      desc: "Essencial para o seu MEI",
      price: "79,90",
      period: "por mês",
      highlighted: false,
      badge: null,
      waLink: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Olá! Tenho interesse no plano START de R$ 79,90 por mês."
      )}`,
      services: [
        "Emissão da guia DAS mensal",
        "Elaboração e envio da Declaração Anual (DASN-SIMEI)",
        "Acompanhamento do faturamento do MEI",
        "Monitoramento de pendências fiscais",
        "Suporte pelo WhatsApp",
      ],
    },
    {
      id: "pro",
      name: "PRO",
      nameColor: "text-white",
      desc: "Mais praticidade e suporte",
      price: "149,90",
      period: "por mês",
      highlighted: true,
      badge: "MAIS ESCOLHIDO",
      waLink: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Olá! Tenho interesse no plano PRO de R$ 149,90 por mês."
      )}`,
      services: [
        "Todos os serviços do plano START",
        "Emissão de até 5 notas fiscais de serviço (NFS-e) por mês",
        "Recálculo de guias DAS em atraso",
        "Solicitação e acompanhamento de parcelamentos",
        "Alterações cadastrais do MEI",
        "Orientação sobre emissão de notas fiscais de serviços",
        "Suporte pelo WhatsApp",
      ],
    },
    {
      id: "premium",
      name: "PREMIUM",
      nameColor: "text-white",
      desc: "Gestão completa para o seu MEI",
      price: "249,90",
      period: "por mês",
      highlighted: false,
      badge: null,
      waLink: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Olá! Tenho interesse no plano PREMIUM de R$ 249,90 por mês."
      )}`,
      services: [
        "Todos os serviços do plano PRO",
        "Emissão de até 30 notas fiscais de serviço (NFS-e) por mês",
        "Notas fiscais adicionais por R$ 5,90 cada",
        "Gestão da folha de pagamento de até 1 funcionário",
        "Consultoria contábil",
        "Acompanhamento das obrigações do MEI",
        "Atendimento prioritário pelo WhatsApp",
      ],
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="planos"
      className="bg-[#000000] text-white py-20 sm:py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Background Subtle Radial Glow */}
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_50%_35%,rgba(203,255,31,0.07),transparent_70%)] pointer-events-none" />

      <div className="container-x relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight uppercase text-white font-sans">
            PLANOS
          </h2>
          <p className="mt-4 sm:mt-5 text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Escolha o plano ideal para o seu MEI e tenha todo o suporte que você precisa em um só lugar.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-[28px] p-7 sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1.5 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:animate-none motion-reduce:opacity-100 ${
                plan.highlighted
                  ? "bg-[#0d0f0f] border-2 border-[#cbff1f] shadow-[0_0_35px_rgba(203,255,31,0.22)] hover:shadow-[0_0_45px_rgba(203,255,31,0.35)]"
                  : "bg-[#0d0f0f] border border-[#272b2b] hover:border-[#cbff1f]/50 hover:shadow-[0_8px_30px_rgba(203,255,31,0.12)]"
              } ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {/* Highlight Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#cbff1f] text-[#000000] text-xs font-black uppercase tracking-wider py-1.5 px-4 rounded-full inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(203,255,31,0.5)] select-none whitespace-nowrap">
                    <Crown className="w-3.5 h-3.5 fill-current stroke-[2]" />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Card Body */}
              <div className="flex-1 flex flex-col">
                <h3 className={`font-black text-2xl sm:text-[26px] tracking-tight uppercase ${plan.nameColor}`}>
                  {plan.name}
                </h3>
                <p className="text-white/70 text-sm sm:text-[15px] mt-1">
                  {plan.desc}
                </p>

                <div className="mt-5 mb-1 flex items-baseline">
                  <span className="text-xl sm:text-2xl font-bold text-white mr-1.5">R$</span>
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{plan.price}</span>
                </div>
                <div className="text-white/60 text-sm font-medium mb-6">
                  {plan.period}
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                {/* Services List */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.services.map((service) => (
                    <li key={service} className="flex items-start gap-3.5">
                      <PlanCheckIcon />
                      <span className="text-white/90 text-sm sm:text-[14.5px] leading-snug">
                        {service}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card CTA Button (Horizontally aligned at the bottom across all cards) */}
              <div className="mt-auto pt-2">
                <a
                  href={plan.waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-full bg-[#cbff1f] hover:bg-[#b8e818] text-[#000000] font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_0_20px_rgba(203,255,31,0.35)] hover:shadow-[0_0_30px_rgba(203,255,31,0.55)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                  </svg>
                  <span>Quero este plano</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Differentials ----------------------------- */

function Differentials() {
  const items = [
    { icon: Heart, title: "Atendimento Humanizado", desc: "Atenção pessoal, sem robôs ou frieza." },
    { icon: Sparkles, title: "Especialização em MEI", desc: "Foco total em microempreendedores." },
    { icon: MessageCircle, title: "Linguagem Simples", desc: "Sem juridiquês, direto ao ponto." },
    { icon: MapPin, title: "Atendimento Nacional", desc: "Online para todo o Brasil." },
    { icon: ShieldCheck, title: "Transparência", desc: "Valores e prazos sempre claros." },
    { icon: Briefcase, title: "Experiência Prática", desc: "Há anos resolvendo casos reais de MEI." },
  ];
  return (
    <section className="py-20 md:py-28 bg-[#111111] text-white">
      <div className="container-x">
        <div className="max-w-3xl mb-12 text-center mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[#cbff1f] mb-3">
            Diferenciais
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Por que escolher Anselmo Dias?
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div className="h-11 w-11 rounded-xl bg-[#cbff1f] grid place-items-center mb-4">
                <Icon className="h-5 w-5 text-[#111111]" />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-white/60 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Testimonials ----------------------------- */

function Testimonials() {
  const testimonials = [
    {
      name: "Mariana S.",
      role: "MEI · Confeitaria",
      text: "Estava com DAS atrasado há mais de um ano. Em poucos dias o Anselmo organizou tudo e ainda parcelou os débitos. Atendimento incrível!",
    },
    {
      name: "Carlos M.",
      role: "MEI · Serviços Gerais",
      text: "Linguagem simples, sem enrolação. Resolvi a DASN que estava pendente e hoje meu CNPJ está 100% em dia.",
    },
    {
      name: "Juliana R.",
      role: "MEI · Designer",
      text: "Precisava emitir NF-e e estava perdida. O Anselmo me ensinou tudo pelo WhatsApp em uma tarde. Recomendo demais.",
    },
    {
      name: "Rafael T.",
      role: "MEI · E-commerce",
      text: "Fui desenquadrado e achei que perderia meu negócio. Ele me guiou em cada passo. Profissional de confiança.",
    },
  ];
  return (
    <section className="py-20 md:py-28 bg-[#fafafa]">
      <div className="container-x">
        <SectionTitle
          kicker="Depoimentos"
          title="O que dizem nossos clientes"
        />
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {testimonials.map((t) => (
              <CarouselItem
                key={t.name}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="h-full rounded-2xl bg-white border border-[#e5e7eb] p-6 md:p-7">
                  <Quote className="h-7 w-7 text-[#cbff1f]" />
                  <p className="mt-4 text-[#111111] leading-relaxed">
                    "{t.text}"
                  </p>
                  <div className="mt-6 pt-4 border-t border-[#e5e7eb]">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-[#6b7280]">{t.role}</div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

/* ------------------------------ Trust Block ------------------------------ */

function TrustBlock() {
  const items = [
    "Atendimento Humanizado",
    "Orientação Personalizada",
    "Especialista em MEI",
    "Atendimento Nacional",
    "Suporte pelo WhatsApp",
    "Transparência Total",
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <div className="rounded-3xl bg-[#111111] text-white p-8 md:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#cbff1f]/20 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[#cbff1f] mb-3">
                Confiança
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Você será atendido por um contador de verdade
              </h2>
              <p className="mt-5 text-white/70 max-w-xl">
                Nada de chatbot, atendente terceirizado ou solução genérica.
                Atendimento direto, pessoal e especializado para o seu MEI.
              </p>
              <div className="mt-7">
                <CtaButton>
                  <MessageCircle className="h-5 w-5" />
                  Falar com Especialista
                </CtaButton>
              </div>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {items.map((i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#cbff1f] shrink-0" />
                  <span className="text-sm font-medium">{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ --------------------------------- */

function FAQ() {
  const faqs = [
    {
      q: "Posso baixar meu MEI com dívidas?",
      a: "Sim. É possível dar baixa no MEI mesmo com débitos pendentes — mas as dívidas migram para o seu CPF. O ideal é avaliar a melhor estratégia antes de encerrar.",
    },
    {
      q: "O DAS atrasado gera problemas no CPF?",
      a: "Sim. Débitos não pagos podem ser inscritos em Dívida Ativa, gerar restrições e ser cobrados diretamente do CPF do titular.",
    },
    {
      q: "Posso parcelar minhas dívidas?",
      a: "Sim. Existem diferentes modalidades de parcelamento conforme o tipo de débito. Faço a análise e indico a opção mais vantajosa para você.",
    },
    {
      q: "Quanto custa regularizar um MEI?",
      a: "Depende do tamanho e da complexidade da pendência. A orientação inicial é gratuita — após a análise, apresento um valor justo e transparente.",
    },
    {
      q: "Meu MEI foi desenquadrado. E agora?",
      a: "É preciso entender o motivo do desenquadramento e avaliar se você migra para outro regime ou regulariza para retornar ao MEI.",
    },
    {
      q: "Não entreguei a DASN-SIMEI. O que fazer?",
      a: "É necessário entregar o quanto antes e regularizar a multa. Te ajudo no processo completo, sem complicação.",
    },
    {
      q: "Preciso emitir Nota Fiscal?",
      a: "Para pessoas jurídicas, a emissão é obrigatória. Para pessoas físicas, depende da atividade. Te oriento sobre seu caso específico.",
    },
  ];
  return (
    <section className="py-20 md:py-28 bg-[#fafafa]">
      <div className="container-x max-w-3xl">
        <SectionTitle kicker="Dúvidas" title="Perguntas frequentes" />
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-[#e5e7eb] bg-white px-5 [&[data-state=open]]:border-[#111111]"
            >
              <AccordionTrigger className="text-left font-semibold text-[#111111] hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#6b7280] leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ------------------------------- Final CTA ------------------------------- */

function FinalCTA() {
  const reinforcements = [
    "Atendimento Online",
    "Orientação Inicial Gratuita",
    "Atendimento em todo Brasil",
  ];
  return (
    <section className="py-20 md:py-28 bg-[#cbff1f] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_50%_100%,rgba(0,0,0,0.08),transparent)]" />
      <div className="container-x relative text-center max-w-3xl">
        <h2 className="text-3xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[#111111]">
          Resolva seu MEI antes que o problema fique mais caro
        </h2>
        <p className="mt-5 text-lg text-[#111111]/75">
          Receba orientação especializada e descubra os próximos passos para
          regularizar sua situação.
        </p>
        <div className="mt-9">
          <CtaButton variant="dark" className="!px-8 !py-4 !text-base">
            <MessageCircle className="h-5 w-5 text-[#cbff1f]" />
            Falar com Especialista no WhatsApp
          </CtaButton>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {reinforcements.map((r) => (
            <li
              key={r}
              className="flex items-center gap-2 text-sm font-medium text-[#111111]"
            >
              <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------- Footer -------------------------------- */

function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-16 pb-8">
      <div className="container-x">
        <div className="grid md:grid-cols-3 gap-10 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-[#cbff1f] grid place-items-center">
                <span className="text-[#111111] font-bold">A</span>
              </div>
              <div>
                <div className="font-semibold">Anselmo Dias Contador</div>
                <div className="text-xs text-white/60">
                  Contador Especialista em MEI
                </div>
              </div>
            </div>
            <p className="text-sm text-white/60 max-w-xs">
              Atendimento humanizado para microempreendedores em todo o Brasil.
            </p>
          </div>

          <div id="contato">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">
              Contato
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#cbff1f] transition-colors"
                >
                  <Phone className="h-4 w-4" /> WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Mail className="h-4 w-4" /> contato@anselmodias.com.br
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <MapPin className="h-4 w-4" /> São Paulo / SP
              </li>
              <li className="text-white/50 text-xs pt-2">CRC: 0000000/0-0</li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">
              Redes Sociais
            </div>
            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
            >
              <Instagram className="h-4 w-4" />
              @anselmodiascontador
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/50">
          <p className="max-w-2xl leading-relaxed">
            As orientações são realizadas de forma personalizada conforme a
            situação de cada contribuinte e a legislação vigente.
          </p>
          <p>© {new Date().getFullYear()} Anselmo Dias Contador.</p>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------- Floating WhatsApp --------------------------- */

function FloatingWhatsApp() {
  const [open, setOpen] = useState(true);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-end gap-2">
      {open && (
        <div className="hidden sm:flex items-center gap-2 bg-white border border-[#e5e7eb] shadow-xl rounded-full pl-4 pr-2 py-2 animate-fade-up">
          <span className="text-sm font-medium text-[#111111]">
            Fale agora com o especialista
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="h-6 w-6 grid place-items-center rounded-full text-[#6b7280] hover:bg-[#f5f5f5]"
          >
            ×
          </button>
        </div>
      )}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="h-14 w-14 rounded-full bg-[#cbff1f] grid place-items-center shadow-[0_12px_28px_-8px_rgba(203,255,31,0.7)] hover:scale-105 active:scale-95 transition-transform"
      >
        <MessageCircle className="h-7 w-7 text-[#111111]" strokeWidth={2.5} />
      </a>
    </div>
  );
}
