import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
  AlertTriangle,
  Briefcase,
  Building2,
  XCircle,
  Quote,
  ChevronDown,
  Mail,
  Phone,
} from "lucide-react";
import anselmoPhoto from "@/assets/anselmo-dias.jpg";
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
const instagramLink = "https://instagram.com/anselmodiascontador";

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
      { property: "og:url", content: "/" },
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
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "dark";
  href?: string;
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

/* --------------------------------- Page --------------------------------- */

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <About />
        <InstagramSection />
        <Pain />
        <Services />
        <Differentials />
        <HowItWorks />
        <Testimonials />
        <TrustBlock />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

/* --------------------------------- Header -------------------------------- */

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#e5e7eb]">
      <div className="container-x flex items-center justify-between h-16">
        <a href="#top" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#111111] grid place-items-center">
            <span className="text-[#cbff1f] font-bold text-sm">A</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Anselmo Dias</div>
            <div className="text-[10px] text-[#6b7280] uppercase tracking-wider">
              Contador · MEI
            </div>
          </div>
        </a>
        <CtaButton className="!px-4 !py-2 !text-sm">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Falar no WhatsApp</span>
          <span className="sm:hidden">WhatsApp</span>
        </CtaButton>
      </div>
    </header>
  );
}

/* ---------------------------------- Hero --------------------------------- */

function Hero() {
  const badges = [
    "Especialista em MEI",
    "Atendimento em Todo Brasil",
    "Suporte Humanizado",
    "Orientação Inicial Gratuita",
  ];
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(203,255,31,0.15),transparent_70%)]" />
      <div className="container-x grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 py-16 md:py-24 items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#6b7280] mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#cbff1f]" />
            Contador especialista em MEI
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[#111111]">
            MEI com DAS atrasado,{" "}
            <span className="relative inline-block">
              <span className="relative z-10">dívidas</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-[#cbff1f] -z-0" />
            </span>{" "}
            ou pendências?
          </h1>
          <p className="mt-6 text-lg text-[#6b7280] leading-relaxed max-w-xl">
            Descubra gratuitamente como regularizar sua situação antes que os
            problemas aumentem. Orientação para regularização do MEI,
            parcelamento de débitos, DASN-SIMEI, NF-e e muito mais.
          </p>
          <p className="mt-3 text-sm font-medium text-[#111111]">
            Atendimento online para todo o Brasil.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <CtaButton className="!px-7 !py-4 !text-base">
              <MessageCircle className="h-5 w-5" />
              Falar com Especialista no WhatsApp
            </CtaButton>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {badges.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-[#111111]">
                <CheckCircle2 className="h-4 w-4 text-[#111111]" strokeWidth={2.5} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-fade-up">
          <div className="absolute -inset-6 bg-[#cbff1f]/30 blur-3xl rounded-full -z-10" />
          <div className="relative rounded-3xl overflow-hidden border border-[#111111]/10 bg-[#f5f5f5] aspect-[4/5] shadow-2xl">
            <img
              src={anselmoPhoto}
              alt="Anselmo Dias, contador especialista em MEI"
              className="w-full h-full object-cover"
              width={896}
              height={1152}
            />
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="text-white font-semibold text-lg">Anselmo Dias</div>
              <div className="text-white/80 text-xs mb-2">
                Contador · Especialista em MEI
              </div>
              <p className="text-white/90 text-[13px] leading-snug">
                Ajudo microempreendedores a resolver pendências, evitar multas e
                manter seus negócios em conformidade.
              </p>
            </div>
          </div>
          <div className="hidden md:flex absolute -left-6 top-10 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] p-3 items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#cbff1f] grid place-items-center">
              <ShieldCheck className="h-5 w-5 text-[#111111]" />
            </div>
            <div>
              <div className="text-xs text-[#6b7280]">CNPJ em dia</div>
              <div className="text-sm font-semibold">100% conforme a lei</div>
            </div>
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
    <section className="border-y border-[#e5e7eb] bg-[#fafafa]">
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
    <section className="py-20 md:py-28">
      <div className="container-x grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 relative">
          <div className="rounded-3xl overflow-hidden aspect-square border border-[#111111]/10">
            <img
              src={anselmoPhoto}
              alt="Anselmo Dias em ambiente profissional"
              className="w-full h-full object-cover"
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
              Sou contador, empreendedor e sócio da <strong className="text-[#111111]">Target Gestão Contábil</strong>.
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

/* ------------------------------- Instagram ------------------------------- */

function InstagramSection() {
  const topics = [
    "DAS e Parcelamentos",
    "DASN-SIMEI",
    "Emissão de Nota Fiscal",
    "Direitos Previdenciários",
    "Regularização do MEI",
    "Atualizações da Legislação",
  ];
  return (
    <section className="py-20 md:py-28 bg-[#111111] text-white relative overflow-hidden">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(203,255,31,0.12),transparent_70%)]" />
      <div className="container-x relative">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[#cbff1f] mb-3">
            @anselmodiascontador
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Conteúdo gratuito para quem é MEI
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {topics.map((t) => (
            <div
              key={t}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 hover:bg-white/[0.06] hover:border-[#cbff1f]/40 transition-all duration-300"
            >
              <Instagram className="h-5 w-5 text-[#cbff1f] mb-4" />
              <div className="font-semibold">{t}</div>
              <div className="mt-3 text-xs text-white/50 flex items-center gap-1.5">
                Ver conteúdo
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <CtaButton href={instagramLink}>
            <Instagram className="h-5 w-5" />
            Seguir @anselmodiascontador
          </CtaButton>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Pain --------------------------------- */

function Pain() {
  const pains = [
    { icon: AlertTriangle, title: "DAS atrasado", desc: "Mensalidades acumulando juros e multas." },
    { icon: FileText, title: "DASN não entregue", desc: "Declaração anual em atraso e pendente." },
    { icon: Receipt, title: "Dívidas do MEI", desc: "Débitos crescendo no seu CNPJ." },
    { icon: Briefcase, title: "Emissão de Nota Fiscal", desc: "Dúvidas sobre como emitir NF-e." },
    { icon: XCircle, title: "MEI desenquadrado", desc: "Perdeu o enquadramento e não sabe o próximo passo." },
    { icon: Building2, title: "Baixa do MEI", desc: "Quer encerrar o CNPJ da forma correta." },
  ];
  return (
    <section className="py-20 md:py-28 bg-[#fafafa]">
      <div className="container-x">
        <SectionTitle
          kicker="Identificou sua situação?"
          title="Você está passando por alguma dessas situações?"
          subtitle="Se você se identificou com algum desses cenários, a hora de agir é agora — antes que o problema fique maior."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pains.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl bg-white border border-[#e5e7eb] p-6 hover:border-[#111111] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-11 w-11 rounded-xl bg-[#111111] grid place-items-center mb-4 group-hover:bg-[#cbff1f] transition-colors">
                <Icon className="h-5 w-5 text-[#cbff1f] group-hover:text-[#111111] transition-colors" />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-[#6b7280] mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <CtaButton>
            <MessageCircle className="h-5 w-5" />
            Quero Analisar Meu MEI
          </CtaButton>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Services ------------------------------- */

function Services() {
  const services = [
    "Regularização de MEI",
    "Parcelamento de Débitos",
    "DASN-SIMEI",
    "Emissão de NFS-e",
    "Baixa de MEI",
    "Abertura de MEI",
    "Desenquadramento do MEI",
    "Consultoria para MEI",
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <SectionTitle
          kicker="Serviços"
          title="Como posso te ajudar"
          subtitle="Soluções completas para o ciclo de vida do seu MEI — do início ao encerramento."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((s, i) => (
            <div
              key={s}
              className="group relative rounded-2xl border border-[#e5e7eb] bg-white p-6 hover:border-[#cbff1f] hover:shadow-md transition-all duration-300"
            >
              <div className="text-xs text-[#6b7280] mb-2">
                0{i + 1}
              </div>
              <h3 className="font-semibold text-lg leading-snug">{s}</h3>
              <ArrowRight className="absolute top-6 right-6 h-4 w-4 text-[#6b7280] group-hover:text-[#111111] group-hover:translate-x-1 transition-all" />
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
    { icon: Briefcase, title: "Experiência Prática", desc: "Anos resolvendo casos reais de MEI." },
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

/* ----------------------------- How it works ------------------------------ */

function HowItWorks() {
  const steps = [
    { n: "01", t: "Clique no WhatsApp", d: "Inicie a conversa em segundos." },
    { n: "02", t: "Explique sua situação", d: "Conte o que está acontecendo com seu MEI." },
    { n: "03", t: "Receba análise inicial", d: "Diagnóstico gratuito do seu caso." },
    { n: "04", t: "Conheça a melhor solução", d: "Plano de ação claro e personalizado." },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <SectionTitle
          kicker="Como funciona"
          title="Simples, rápido e sem complicação"
          subtitle="Em quatro passos você sai da pendência e volta a operar tranquilo."
        />
        <div className="grid md:grid-cols-4 gap-4 relative">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-2xl bg-white border border-[#e5e7eb] p-6"
            >
              <div className="text-5xl font-bold text-[#cbff1f] leading-none">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold text-lg">{s.t}</h3>
              <p className="mt-1 text-sm text-[#6b7280]">{s.d}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 h-5 w-5 text-[#e5e7eb]" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <CtaButton>
            <MessageCircle className="h-5 w-5" />
            Falar com Especialista no WhatsApp
          </CtaButton>
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
    "Atendimento em Todo Brasil",
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

          <div>
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
