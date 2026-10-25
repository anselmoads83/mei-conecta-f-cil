import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Instagram,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Receipt,
  FileText,
  Quote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
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
  Award,
  Users,
  Laptop,
  AlertCircle,
  ArrowLeft,
  Coins,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Search,
  Plus,
  Minus,
  Clock,
} from "lucide-react";
import anselmoPortrait from "@/assets/images/anselmo-dias-retrato-profissional.png";
import anselmoPhotoHero from "@/assets/images/hero-anselmo.jpg";
import logoImg from "@/assets/images/logo-anselmo-dias.png";
import heroGeometricImg from "@/assets/images/hero-geometric.png";
import brazilFlagImg from "@/assets/images/brazil-flag-waving.png";
import marcosAlvesImg from "@/assets/images/testimonials/marcos-alves.png";
import mayaraSantosImg from "@/assets/images/testimonials/mayara-santos.png";
import joaoManoelImg from "@/assets/images/testimonials/joao-manoel.png";
import rodrigoSilvaImg from "@/assets/images/testimonials/rodrigo-silva.png";
import sheilaRodriguesImg from "@/assets/images/testimonials/sheila-rodrigues.png";
import antonioFilhoImg from "@/assets/images/testimonials/antonio-filho.png";
import gustavoPedrosoImg from "@/assets/images/testimonials/gustavo-pedroso.png";
import nathanOliveiraImg from "@/assets/images/testimonials/nathan-oliveira.png";
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
  type CarouselApi,
} from "@/components/ui/carousel";
import { FloatingContactForm } from "@/components/FloatingContactForm";

// Número WhatsApp: (11) 98330-2016
const WHATSAPP_NUMBER = "5511983302016";
const WHATSAPP_MSG = encodeURIComponent(
  "Olá Anselmo! Vim pela landing page e gostaria de uma orientação sobre meu MEI."
);
const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;
const OFFICIAL_WHATSAPP_URL = "https://wa.me/5511915470723";
const instagramLink = "https://www.instagram.com/anselmodiascontador";

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
        <SocialProof />
        <About />
        <SectionDivider />
        <Services />
        <SectionDivider />
        <Plans />
        <SectionDivider />
        <SuccessCases />
        <SectionDivider />
        <Testimonials />
        <SectionDivider />
        <FAQ />
        <SectionDivider />
        <FinalCTA />
      </main>
      <SectionDivider />
      <Footer />
      <FloatingWhatsApp />
      <FloatingContactForm />
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

        {/* Right: Action Buttons & Mobile Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Action Buttons (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Em breve"
              className="inline-flex items-center justify-center rounded-full border border-[#CBFF1F] bg-transparent px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#CBFF1F] transition-all duration-200 cursor-not-allowed opacity-90 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Entrar
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Em breve"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#CBFF1F] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#111111] shadow-[0_0_20px_-4px_rgba(203,255,31,0.5)] transition-all duration-200 cursor-not-allowed opacity-90 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Fale Conosco</span>
            </button>
          </div>

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
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Em breve"
              className="w-full inline-flex items-center justify-center rounded-full border border-[#CBFF1F] bg-transparent py-3 text-sm font-semibold text-[#CBFF1F] transition-all duration-200 cursor-not-allowed opacity-90"
            >
              Entrar
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Em breve"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#CBFF1F] py-3 text-sm font-semibold text-[#111111] shadow-[0_0_20px_-4px_rgba(203,255,31,0.5)] transition-all duration-200 cursor-not-allowed opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Fale Conosco</span>
            </button>
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
                href={OFFICIAL_WHATSAPP_URL}
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

/* ------------------------------ Statistics ------------------------------- */

interface StatConfig {
  id: string;
  type: "counter" | "flag";
  finalValue?: number;
  formatValue?: (val: number) => string;
  minWidthCh?: string;
  staticText?: string;
  caption: string;
  icon?: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}

const STATS_ITEMS: StatConfig[] = [
  {
    id: "meis-atendidos",
    type: "counter",
    finalValue: 800,
    formatValue: (v) => `+${v}`,
    minWidthCh: "min-w-[4.2ch]",
    caption: "MEIS ATENDIDOS",
    icon: Users,
    ariaLabel: "Mais de 800 MEIs atendidos",
  },
  {
    id: "obrigacoes-regularizadas",
    type: "counter",
    finalValue: 2500,
    formatValue: (v) => `+${new Intl.NumberFormat("pt-BR").format(v)}`,
    minWidthCh: "min-w-[5.8ch]",
    caption: "OBRIGAÇÕES REGULARIZADAS",
    icon: FileText,
    ariaLabel: "Mais de 2.500 obrigações regularizadas",
  },
  {
    id: "atendimento-digital",
    type: "counter",
    finalValue: 100,
    formatValue: (v) => `${v}%`,
    minWidthCh: "min-w-[4.2ch]",
    caption: "ATENDIMENTO DIGITAL",
    icon: Laptop,
    ariaLabel: "100% atendimento digital",
  },
  {
    id: "atendimento-nacional",
    type: "flag",
    staticText: "BR",
    caption: "ATENDIMENTO NACIONAL",
    ariaLabel: "Atendimento nacional em todo o Brasil",
  },
];

function StatIndicator({
  item,
  index,
  isInView,
  prefersReducedMotion,
}: {
  item: StatConfig;
  index: number;
  isInView: boolean;
  prefersReducedMotion: boolean;
}) {
  const [count, setCount] = useState<number>(() =>
    prefersReducedMotion ? (item.finalValue ?? 0) : 0
  );
  const [flagWaving, setFlagWaving] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Smooth counter animation using Ease-Out Cubic
  const runCounterAnimation = useCallback(() => {
    if (prefersReducedMotion || item.finalValue === undefined) {
      setCount(item.finalValue ?? 0);
      return;
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const duration = 1500; // ~1.5 seconds
    const startVal = 0;
    const endVal = item.finalValue;
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: fast start, soft and natural landing
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * easeOutProgress);
      setCount(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [item.finalValue, prefersReducedMotion]);

  // Gentle waving animation trigger for Brazilian flag
  const runFlagAnimation = useCallback(() => {
    if (prefersReducedMotion) return;
    setFlagWaving(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlagWaving(true);
      });
    });
  }, [prefersReducedMotion]);

  // Initial animation trigger when section enters viewport
  useEffect(() => {
    if (isInView) {
      if (item.type === "counter") {
        runCounterAnimation();
      } else if (item.type === "flag") {
        runFlagAnimation();
      }
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isInView, item.type, runCounterAnimation, runFlagAnimation]);

  // Mouse hover: restart only this specific indicator
  const handleMouseEnter = () => {
    if (item.type === "counter") {
      runCounterAnimation();
    } else if (item.type === "flag") {
      runFlagAnimation();
    }
  };

  const IconComponent = item.icon;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      role="group"
      aria-label={item.ariaLabel}
      className="relative flex flex-col items-center justify-center py-4 lg:py-6 px-3 group select-none cursor-default transition-all duration-200"
    >
      {/* Screen reader only persistent text */}
      <span className="sr-only">{item.ariaLabel}</span>

      {/* Visual content: Icon + Number OR BR + Brazilian Flag */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-2.5 sm:gap-3.5"
      >
        {/* Lucide Outline Icon */}
        {IconComponent && (
          <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-[#84cc16] stroke-[2.2] flex-shrink-0" />
        )}

        {/* Dynamic Numerical Counter */}
        {item.type === "counter" && item.formatValue && (
          <span
            className={`font-black text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] text-[#000000] tracking-tight tabular-nums inline-block text-left ${
              item.minWidthCh ?? ""
            }`}
          >
            {item.formatValue(count)}
          </span>
        )}

        {/* BR Indicator + Waving Brazilian Flag */}
        {item.type === "flag" && (
          <>
            <span className="font-black text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] text-[#000000] tracking-tight">
              {item.staticText}
            </span>
            <img
              src={brazilFlagImg}
              alt=""
              width={115}
              height={66}
              className={`w-12 sm:w-14 lg:w-[58px] h-auto object-contain flex-shrink-0 origin-left drop-shadow-sm select-none pointer-events-none ${
                flagWaving ? "animate-flag-wave" : ""
              }`}
              onAnimationEnd={() => setFlagWaving(false)}
            />
          </>
        )}
      </div>

      {/* Elegant Uppercase Caption */}
      <div
        aria-hidden="true"
        className="text-[10.5px] xs:text-[11px] sm:text-xs font-semibold tracking-[0.14em] text-[#6b7280] uppercase mt-2.5 text-center leading-tight"
      >
        {item.caption}
      </div>

      {/* Subtle light-gray vertical divider on Desktop (between columns 0-1, 1-2, 2-3) */}
      {index < 3 && (
        <div
          aria-hidden="true"
          className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 sm:h-14 bg-gray-200/90 pointer-events-none"
        />
      )}

      {/* Subtle light-gray vertical divider on Tablet/Mobile 2-column layout (left column) */}
      {index % 2 === 0 && (
        <div
          aria-hidden="true"
          className="block lg:hidden absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-11 bg-gray-200/90 pointer-events-none"
        />
      )}
    </div>
  );
}

function SocialProof() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Monitor user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // Viewport intersection observer: trigger once on scroll entry
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Trigger automatically only once on initial entry
        }
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="estatisticas"
      className="bg-white border-y-[1.5px] border-[#CBFF1F] relative z-20 py-8 sm:py-10 lg:py-12"
    >
      <div className="container-x">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 sm:gap-y-10 lg:gap-y-0">
          {STATS_ITEMS.map((item, index) => (
            <StatIndicator
              key={item.id}
              item={item}
              index={index}
              isInView={isInView}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- About --------------------------------- */

function About() {
  return (
    <section id="quem-somos" className="py-20 md:py-28">
      <div className="container-x grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 relative max-w-[460px] mx-auto md:max-w-none w-full">
          <div className="rounded-3xl overflow-hidden aspect-[3/4] border border-[#111111]/10 shadow-lg bg-[#181a1b]">
            <img
              src={anselmoPortrait}
              alt="Anselmo Dias — Contador e Co-fundador"
              className="w-full h-full object-cover object-top"
              loading="lazy"
              width={768}
              height={1024}
            />
          </div>
          {/* Overlapping Professional Credential Card */}
          <div className="absolute -bottom-5 right-2 sm:-right-4 md:-right-6 bg-[#000000] text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/10 border-b-2 border-b-[#CBFF1F] flex items-center z-10 select-none">
            {/* Credential Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#CBFF1F]/10 border border-[#CBFF1F]/30 flex items-center justify-center text-[#CBFF1F] flex-shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#CBFF1F]" />
            </div>

            {/* Vertical Lime-Green Separator */}
            <div className="h-9 w-px bg-[#CBFF1F] mx-3 sm:mx-3.5 flex-shrink-0" />

            {/* Credential Details */}
            <div className="flex flex-col justify-center">
              <div className="font-bold text-white text-xs sm:text-sm tracking-wider uppercase leading-snug">
                CONTADOR
              </div>
              <div className="text-xs sm:text-[13px] font-semibold mt-0.5 tracking-tight flex items-center gap-1.5 whitespace-nowrap leading-snug">
                <span className="text-[#CBFF1F] font-bold">CRC</span>
                <span className="text-white font-medium">1SP226494/O-2</span>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          {/* Main Section Heading */}
          <h2 className="relative md:-top-[30px] text-xl sm:text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#000000] tracking-tight uppercase mb-8 sm:mb-10 lg:mb-[52px]">
            QUEM SOMOS
          </h2>

          {/* Professional Identification */}
          <div>
            <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#6b7280]">
              CEO | CO-FUNDADOR
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Anselmo Dias
            </h3>
          </div>

          {/* Two-Paragraph Biography */}
          <div className="mt-6 space-y-4 text-[#4b5563] text-base sm:text-[16.5px] leading-relaxed">
            <p>
              Anselmo Dias é especialista em contabilidade para Microempreendedores Individuais (MEIs), com experiência em gestão contábil, orientação empresarial e regularização de negócios. À frente da empresa Anselmo Dias Contador, une conhecimento técnico e visão empreendedora para oferecer soluções contábeis práticas, seguras e acessíveis.
            </p>
            <p>
              Seu propósito é simplificar e democratizar o acesso à contabilidade especializada, descomplicando processos burocráticos e oferecendo orientações claras e personalizadas para que cada microempreendedor tenha mais segurança, tranquilidade e confiança na gestão do seu negócio.
            </p>
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
            href={OFFICIAL_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#CBFF1F] hover:bg-[#b8e818] text-[#111111] font-extrabold uppercase text-sm sm:text-base px-8 sm:px-10 py-4 sm:py-4.5 rounded-full shadow-[0_0_30px_rgba(203,255,31,0.45)] hover:shadow-[0_0_45px_rgba(203,255,31,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 tracking-wide"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
            </svg>
            <span>FALAR COM ESPECIALISTA</span>
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
    <div className="w-5 h-5 rounded-full bg-[#cbff1f] flex items-center justify-center flex-shrink-0 mt-0.5">
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
      nameColor: "text-white",
      desc: "Essencial para o seu MEI.",
      price: "99,00",
      period: "/mês",
      highlighted: false,
      badge: null,
      waLink: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Olá! Tenho interesse no Plano START de R$ 99,00/mês. Gostaria de saber mais."
      )}`,
      services: [
        "Abertura do CNPJ MEI.",
        "Emissão da guia DAS mensal.",
        "Recálculo da guia DAS em atraso.",
        "Elaboração da Declaração Anual (DASN-SIMEI).",
        "Acompanhamento do faturamento do MEI.",
        "Monitoramento de pendências fiscais.",
        "App de Serviços.",
        "Suporte pelo WhatsApp.",
      ],
    },
    {
      id: "pro",
      name: "PRO",
      nameColor: "text-white",
      desc: "Mais praticidade e suporte.",
      price: "169,00",
      period: "/mês",
      highlighted: true,
      badge: "MAIS ESCOLHIDO",
      waLink: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Olá! Tenho interesse no Plano PRO de R$ 169,00/mês. Gostaria de saber mais."
      )}`,
      services: [
        "Todos os serviços do plano START.",
        "Emissão de até 5 notas fiscais de serviço (NFS-e) por mês.",
        "Notas fiscais adicionais por R$ 8,50 cada.",
        "Orientação sobre emissão de notas fiscais de serviços.",
        "Solicitação e acompanhamento de parcelamentos.",
        "Alterações no CNPJ MEI.",
        "Baixa do CNPJ MEI.",
        "App de Serviços.",
        "Suporte pelo WhatsApp.",
      ],
    },
    {
      id: "black",
      name: "BLACK",
      nameColor: "text-white",
      desc: "Gestão completa para o seu MEI.",
      price: "269,00",
      period: "/mês",
      highlighted: false,
      badge: null,
      waLink: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Olá! Tenho interesse no Plano BLACK de R$ 269,00/mês. Gostaria de saber mais."
      )}`,
      services: [
        "Todos os serviços do plano PRO.",
        "Emissão de até 30 notas fiscais de serviço (NFS-e) por mês.",
        "Emissão de até 30 notas fiscais de produto (NF-e) por mês.",
        "Notas adicionais ou emitidas pela equipe: R$ 8,50 cada.",
        "Desenquadramento do MEI.",
        "Consultoria para transição do MEI ao Simples Nacional.",
        "Regularização de CNPJ INAPTO.",
        "Emissão de certidões negativas.",
        "Consultoria Fiscal estratégica.",
        "App de Serviços.",
        "Suporte pelo WhatsApp.",
      ],
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="planos"
      className="bg-[#000000] text-white py-20 sm:py-24 lg:py-32 relative overflow-hidden"
    >
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
              className={`relative flex flex-col justify-between h-full rounded-[28px] p-7 sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1.5 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:animate-none motion-reduce:opacity-100 ${
                plan.highlighted
                  ? "bg-[#0d0f0f] border-2 border-[#cbff1f]"
                  : "bg-[#0d0f0f] border border-[#272b2b] hover:border-white/20"
              } ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {/* Highlight Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#cbff1f] text-[#000000] text-xs font-black uppercase tracking-wider py-1.5 px-4 rounded-full inline-flex items-center gap-1.5 select-none whitespace-nowrap">
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

                <div className="mt-5 mb-6 flex items-baseline">
                  <span className="text-xl sm:text-2xl font-bold text-white mr-1.5">R$</span>
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{plan.price}</span>
                  <span className="text-white/60 text-sm font-medium ml-2">
                    {plan.period}
                  </span>
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
                  className="w-full py-3.5 px-6 rounded-full bg-[#cbff1f] hover:bg-[#b8e818] text-[#000000] font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                  </svg>
                  <span>QUERO ESTE PLANO</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Success Cases ----------------------------- */

interface SuccessCaseItem {
  id: number;
  number: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  situacao: string;
  atuacao: string;
}

const SUCCESS_CASES: SuccessCaseItem[] = [
  {
    id: 1,
    number: "01",
    category: "REGULARIZAÇÃO FISCAL",
    icon: FileText,
    title: "MEI COM DÍVIDAS NA RECEITA FEDERAL",
    description:
      "Identificamos débitos acumulados, conferimos as competências em aberto e orientamos a regularização fiscal do microempreendedor, com emissão de guias e análise das possibilidades de parcelamento.",
    situacao: "DAS EM ATRASO",
    atuacao: "REGULARIZAÇÃO",
  },
  {
    id: 2,
    number: "02",
    category: "DÍVIDA ATIVA",
    icon: Coins,
    title: "DÉBITOS DO MEI NA PGFN",
    description:
      "Realizamos o levantamento das inscrições em Dívida Ativa da União, analisamos as modalidades de negociação disponíveis no portal Regularize e acompanhamos os procedimentos para regularização.",
    situacao: "PGFN",
    atuacao: "NEGOCIAÇÃO",
  },
  {
    id: 3,
    number: "03",
    category: "OBRIGAÇÕES ACESSÓRIAS",
    icon: ClipboardCheck,
    title: "DECLARAÇÕES ANUAIS NÃO ENTREGUES",
    description:
      "Identificamos declarações DASN-SIMEI pendentes de exercícios anteriores, levantamos as informações de faturamento e providenciamos sua transmissão para regularizar as obrigações declarativas.",
    situacao: "DASN-SIMEI",
    atuacao: "ENTREGA EM ATRASO",
  },
  {
    id: 4,
    number: "04",
    category: "RETIFICAÇÃO FISCAL",
    icon: FilePenLine,
    title: "FATURAMENTO DECLARADO INCORRETAMENTE",
    description:
      "Revisamos declarações anuais transmitidas sem movimento ou com valores divergentes da realidade, apuramos o faturamento efetivo e realizamos as retificações necessárias.",
    situacao: "FATURAMENTO",
    atuacao: "RETIFICAÇÃO",
  },
  {
    id: 5,
    number: "05",
    category: "DESENQUADRAMENTO",
    icon: AlertTriangle,
    title: "DESENQUADRAMENTO DO MEI",
    description:
      "Identificamos situações de desenquadramento não percebidas pelo empresário, levantamos as pendências decorrentes da mudança de regime e estruturamos os procedimentos necessários à regularização.",
    situacao: "SIMEI",
    atuacao: "MUDANÇA DE REGIME",
  },
  {
    id: 6,
    number: "06",
    category: "TRANSIÇÃO EMPRESARIAL",
    icon: TrendingUp,
    title: "DO MEI PARA MICROEMPRESA",
    description:
      "Orientamos a transição de negócios que deixaram de atender aos requisitos do MEI, avaliando o enquadramento adequado, as obrigações tributárias e os ajustes cadastrais necessários.",
    situacao: "ME",
    atuacao: "TRANSIÇÃO",
  },
  {
    id: 7,
    number: "07",
    category: "SITUAÇÃO CADASTRAL",
    icon: ShieldAlert,
    title: "REGULARIZAÇÃO DE CNPJ INAPTO",
    description:
      "Analisamos as causas da inaptidão cadastral, identificamos obrigações e pendências que precisam ser resolvidas e conduzimos os procedimentos de regularização perante os órgãos competentes.",
    situacao: "CNPJ INAPTO",
    atuacao: "REGULARIZAÇÃO",
  },
  {
    id: 8,
    number: "08",
    category: "DIAGNÓSTICO CONTÁBIL",
    icon: Search,
    title: "ANOS DE PENDÊNCIAS FISCAIS ORGANIZADOS",
    description:
      "Realizamos um diagnóstico da situação fiscal do empreendedor, reunindo débitos, declarações, informações cadastrais e obrigações pendentes em um plano organizado de regularização.",
    situacao: "DIAGNÓSTICO",
    atuacao: "PLANO DE AÇÃO",
  },
];

function SuccessCases() {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const updateCarouselState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateCarouselState();
    api.on("select", updateCarouselState);
    api.on("reInit", updateCarouselState);

    return () => {
      api.off("select", updateCarouselState);
      api.off("reInit", updateCarouselState);
    };
  }, [api]);

  return (
    <section
      id="cases-de-sucesso"
      className="bg-[#000000] text-white py-20 sm:py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="container-x relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div>
            {/* Refined Neon-Lime Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#CBFF1F] text-[#000000] text-xs sm:text-[13px] font-black uppercase tracking-wider py-1.5 px-4 rounded-full select-none mb-4">
              <span>CASES DE SUCESSO</span>
              <ArrowRight className="w-4 h-4 stroke-[2.8] text-[#000000] flex-shrink-0" aria-hidden="true" />
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-[1.05]">
              <span className="text-white">CONHEÇA </span>
              <span className="text-[#cbff1f]">NOSSOS CASES</span>
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3 self-end sm:self-auto select-none">
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Caso anterior"
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollPrev
                  ? "bg-[#cbff1f] hover:bg-[#b8e818] text-[#000000] hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(203,255,31,0.35)]"
                  : "border border-white/10 bg-[#0d0f0f] text-white/30 cursor-not-allowed opacity-40 shadow-none"
              }`}
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Próximo caso"
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollNext
                  ? "bg-[#cbff1f] hover:bg-[#b8e818] text-[#000000] hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(203,255,31,0.35)]"
                  : "border border-white/10 bg-[#0d0f0f] text-white/30 cursor-not-allowed opacity-40 shadow-none"
              }`}
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 8-Card Horizontal Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: false,
            slidesToScroll: 1,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent
            viewportClassName="overflow-hidden px-3 py-4 -mx-3 -my-4"
            className="-ml-4 sm:-ml-5 items-stretch"
          >
            {SUCCESS_CASES.map((caseItem) => {
              const CategoryIcon = caseItem.icon;
              return (
                <CarouselItem
                  key={caseItem.id}
                  className="pl-4 sm:pl-5 basis-full sm:basis-1/2 lg:basis-1/4 flex flex-col"
                >
                  <div className="relative z-0 hover:z-20 h-full rounded-2xl bg-[#0d0f0f] border border-[#272b2b] p-6 sm:p-7 lg:p-5 xl:p-7 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-[#cbff1f]/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] motion-reduce:transform-none motion-reduce:transition-none">
                    <div className="flex-1 flex flex-col">
                      {/* Top Header: Category Pill + Background Case Number */}
                      <div className="flex items-center justify-between gap-2 xl:gap-3 select-none">
                        <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#cbff1f]/50 bg-black/40 text-[#cbff1f] text-[10px] sm:text-[10.5px] xl:text-[11px] font-bold tracking-wider uppercase">
                          <CategoryIcon className="w-3.5 h-3.5 text-[#cbff1f] stroke-[2.2] flex-shrink-0" />
                          <span>{caseItem.category}</span>
                        </div>
                        <span className="font-black text-3xl sm:text-4xl text-[#1e2323] tracking-tighter leading-none select-none">
                          {caseItem.number}
                        </span>
                      </div>

                      {/* Case Title */}
                      <h3 className="text-white font-extrabold text-[16px] sm:text-[18px] lg:text-[17px] xl:text-[19px] tracking-tight leading-snug mt-4 xl:mt-5 mb-2.5 xl:mb-3 uppercase">
                        {caseItem.title}
                      </h3>

                      {/* Case Description */}
                      <p className="text-[#9ca3af] text-[12px] sm:text-[13px] leading-[1.55] font-normal">
                        {caseItem.description}
                      </p>
                    </div>

                    {/* Bottom Area Pinned to Bottom */}
                    <div className="mt-auto">
                      {/* Thin Divider */}
                      <div className="h-px w-full bg-white/10 mt-5 xl:mt-6 mb-4 xl:mb-5" />

                      {/* Two Columns: SITUAÇÃO and ATUAÇÃO */}
                      <div className="grid grid-cols-2 gap-2 xl:gap-3 pt-1">
                        {/* Column 1: SITUAÇÃO */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1 xl:gap-1.5 text-[#6b7280] text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider">
                            <AlertCircle className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-[#cbff1f] stroke-[2.2] flex-shrink-0" />
                            <span>SITUAÇÃO</span>
                          </div>
                          <div className="text-white font-bold text-[11px] sm:text-xs xl:text-[12.5px] uppercase mt-1 tracking-tight leading-tight">
                            {caseItem.situacao}
                          </div>
                        </div>

                        {/* Column 2: ATUAÇÃO */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1 xl:gap-1.5 text-[#6b7280] text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-[#cbff1f] stroke-[2.2] flex-shrink-0" />
                            <span>ATUAÇÃO</span>
                          </div>
                          <div className="text-[#cbff1f] font-bold text-[11px] sm:text-xs xl:text-[12.5px] uppercase mt-1 tracking-tight leading-tight">
                            {caseItem.atuacao}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

/* ------------------------------ Testimonials ----------------------------- */

interface TestimonialItem {
  id: number;
  initials: string;
  clientName: string;
  serviceTopic: string;
  quote: string;
  rating?: number;
  isVerified?: boolean;
  photo?: string;
}

function Testimonials() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const updateCarouselState = () => {
      setCurrent(api.selectedScrollSnap());
      setCount(api.scrollSnapList().length);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateCarouselState();
    api.on("select", updateCarouselState);
    api.on("reInit", updateCarouselState);

    return () => {
      api.off("select", updateCarouselState);
      api.off("reInit", updateCarouselState);
    };
  }, [api]);

  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      initials: "MA",
      clientName: "Marcos Alves",
      serviceTopic: "Abertura do MEI",
      quote:
        "Eu tinha muitas dúvidas sobre como abrir meu MEI, mas fui muito bem orientado. O processo foi rápido, simples e sem complicações.",
      rating: 5,
      isVerified: false,
      photo: marcosAlvesImg,
    },
    {
      id: 2,
      initials: "MS",
      clientName: "Mayara Santos",
      serviceTopic: "Atendimento Humanizado",
      quote:
        "Atendimento excelente! Todas as minhas dúvidas foram esclarecidas com paciência e atenção. É muito bom contar com um profissional que realmente se preocupa com o cliente.",
      rating: 5,
      isVerified: false,
      photo: mayaraSantosImg,
    },
    {
      id: 3,
      initials: "JM",
      clientName: "João Manoel",
      serviceTopic: "Regularização de Débitos",
      quote:
        "Meu MEI estava com várias pendências e eu não sabia por onde começar. Recebi toda a orientação necessária para organizar minha situação.",
      rating: 5,
      isVerified: false,
      photo: joaoManoelImg,
    },
    {
      id: 4,
      initials: "RS",
      clientName: "Rodrigo Silva",
      serviceTopic: "Emissão de Notas Fiscais",
      quote:
        "Eu tinha muita dificuldade para emitir notas fiscais. Agora tenho o suporte que preciso e consigo cuidar do meu negócio com muito mais tranquilidade.",
      rating: 5,
      isVerified: false,
      photo: rodrigoSilvaImg,
    },
    {
      id: 5,
      initials: "SR",
      clientName: "Sheila Rodrigues",
      serviceTopic: "Declaração Anual",
      quote:
        "Sempre tive receio de fazer a declaração anual do MEI de forma errada. Com o acompanhamento contábil, tudo ficou mais simples e organizado.",
      rating: 5,
      isVerified: false,
      photo: sheilaRodriguesImg,
    },
    {
      id: 6,
      initials: "AF",
      clientName: "Antônio Filho",
      serviceTopic: "Suporte pelo WhatsApp",
      quote:
        "O que mais gostei foi da facilidade no atendimento. Sempre que preciso de orientação, consigo esclarecer minhas dúvidas pelo WhatsApp de maneira prática.",
      rating: 5,
      isVerified: false,
      photo: antonioFilhoImg,
    },
    {
      id: 7,
      initials: "GP",
      clientName: "Gustavo Pedroso",
      serviceTopic: "Consultoria Contábil",
      quote:
        "Ter uma orientação profissional fez toda a diferença para o meu negócio. Hoje entendo melhor minhas obrigações e consigo tomar decisões com mais segurança.",
      rating: 5,
      isVerified: false,
      photo: gustavoPedrosoImg,
    },
    {
      id: 8,
      initials: "NO",
      clientName: "Nathan Oliveira",
      serviceTopic: "Experiência Geral",
      quote:
        "Profissionalismo, atenção e muita clareza nas explicações. Recomendo para quem é MEI e procura um atendimento de confiança e qualidade.",
      rating: 5,
      isVerified: false,
      photo: nathanOliveiraImg,
    },
  ];

  return (
    <section id="depoimentos" className="py-20 sm:py-24 lg:py-32 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#6b7280] mb-3 select-none">
            DEPOIMENTOS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#000000] tracking-tight uppercase leading-[1.1]">
            O QUE DIZEM NOSSOS CLIENTES
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555555] max-w-2xl mx-auto leading-relaxed">
            A confiança de quem já conta com o nosso trabalho.
          </p>
        </div>

        {/* Carousel Container with Flanking Navigation Arrows */}
        <div className="relative px-5 sm:px-12 lg:px-14">
          <Carousel
            opts={{
              align: "start",
              loop: false,
              slidesToScroll: 1,
            }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-4 sm:-ml-5 items-stretch">
              {testimonials.map((t) => (
                <CarouselItem
                  key={t.id}
                  className="pl-4 sm:pl-5 basis-full sm:basis-1/2 lg:basis-1/4 flex flex-col"
                >
                  <div className="h-full rounded-[16px] bg-[#000000] border border-[#222222] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-[#cbff1f]/40 hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none">
                    <div className="flex-1 flex flex-col">
                      {/* Circular Avatar */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#181a1a] border border-[#cbff1f]/30 flex items-center justify-center overflow-hidden flex-shrink-0 select-none shadow-inner">
                        {t.photo ? (
                          <img
                            src={t.photo}
                            alt={t.clientName}
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-[#cbff1f] font-bold text-sm sm:text-base tracking-wider">
                            {t.initials}
                          </span>
                        )}
                      </div>

                      {/* Decorative Neon Lime-Green Quotation Mark */}
                      <div className="mt-4 mb-2 text-[#cbff1f] select-none" aria-hidden="true">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-[#cbff1f]" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>

                      {/* Testimonial Quote */}
                      <p className="text-white/90 text-sm sm:text-[14.5px] leading-relaxed font-normal">
                        "{t.quote}"
                      </p>
                    </div>

                    {/* Card Footer: Client Info & Star Rating */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex flex-col">
                      <div className="font-bold text-white text-[15px] sm:text-base tracking-tight leading-snug">
                        {t.clientName}
                      </div>
                      <div className="text-xs text-white/60 mt-0.5">
                        {t.serviceTopic}
                      </div>

                      {/* Five-Star Rating Element (Displayed when genuine ratings are verified) */}
                      {t.isVerified && t.rating ? (
                        <div
                          className="flex items-center gap-1 mt-2.5"
                          aria-label={`Avaliação: ${t.rating} de 5 estrelas`}
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < t.rating!
                                  ? "text-[#cbff1f] fill-[#cbff1f]"
                                  : "text-white/20"
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Previous Arrow Button */}
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Depoimento anterior"
            className="absolute left-0 sm:left-1 lg:-left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#CBFF1F] border border-black shadow-md hover:shadow-lg flex items-center justify-center text-black transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <ChevronLeft className="w-6 h-6 text-black stroke-[2.8]" />
          </button>

          {/* Next Arrow Button */}
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Próximo depoimento"
            className="absolute right-0 sm:right-1 lg:-right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#CBFF1F] border border-black shadow-md hover:shadow-lg flex items-center justify-center text-black transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <ChevronRight className="w-6 h-6 text-black stroke-[2.8]" />
          </button>
        </div>

        {/* Pagination Indicators */}
        {count > 0 && (
          <div
            className="flex items-center justify-center gap-2.5 mt-8 sm:mt-10"
            role="tablist"
            aria-label="Indicadores dos depoimentos"
          >
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={current === i}
                aria-label={`Ir para slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={`transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cbff1f] ${
                  current === i
                    ? "w-3 h-3 bg-[#cbff1f] shadow-[0_0_8px_rgba(203,255,31,0.5)]"
                    : "w-2.5 h-2.5 bg-[#d1d5db] hover:bg-[#9ca3af]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


/* ----------------------------------- FAQ --------------------------------- */

function FAQ() {
  const faqs = [
    {
      id: "01",
      q: "Meu MEI está com DAS em atraso. Posso continuar emitindo notas fiscais?",
      a: "Em regra, sim. O atraso no pagamento do DAS não impede automaticamente a emissão de notas fiscais. Entretanto, os débitos podem gerar encargos, cobrança e outras consequências fiscais. É importante verificar a situação cadastral e fiscal do CNPJ para identificar possíveis restrições e regularizar as pendências.",
    },
    {
      id: "02",
      q: "Minha dívida do MEI foi enviada para a Procuradoria-Geral da Fazenda Nacional (PGFN). O que devo fazer?",
      a: "Quando a dívida é inscrita em Dívida Ativa da União, sua negociação passa a ser realizada pelo portal Regularize, da PGFN. Dependendo das condições do débito e das modalidades disponíveis, pode ser possível parcelar ou negociar a dívida com benefícios específicos. Uma análise individualizada ajuda a identificar a alternativa adequada.",
    },
    {
      id: "03",
      q: "Entreguei a Declaração Anual do MEI com faturamento errado. Posso corrigir?",
      a: "Sim. A DASN-SIMEI pode ser retificada para corrigir informações de faturamento declaradas incorretamente, inclusive quando foi transmitida sem movimento, embora tenha ocorrido receita. A correção deve refletir os valores efetivos do período e pode exigir a revisão de outras obrigações fiscais.",
    },
    {
      id: "04",
      q: "Fui desenquadrado do MEI e não sabia. Posso regularizar minha empresa?",
      a: "Sim. É necessário identificar o motivo e a data de efeito do desenquadramento, verificar possíveis impostos e declarações pendentes e adequar a empresa ao regime tributário correspondente. Dependendo da situação, o negócio poderá continuar como Microempresa (ME), com novas obrigações fiscais e contábeis.",
    },
    {
      id: "05",
      q: "Meu MEI ultrapassou o limite de faturamento. Preciso mudar para Microempresa?",
      a: "Depende do valor excedido e do período em que ocorreu. O excesso de faturamento pode exigir o desenquadramento do SIMEI, com efeitos no ano seguinte ou retroativos, conforme o caso. Uma análise contábil permite identificar os impostos devidos e organizar a transição para Microempresa (ME).",
    },
    {
      id: "06",
      q: "Sou MEI e presto serviços para empresas. Preciso emitir nota fiscal pelo sistema nacional?",
      a: "Sim. O MEI prestador de serviços deve emitir a Nota Fiscal de Serviços eletrônica (NFS-e) pelo padrão nacional nas operações com pessoas jurídicas. A emissão pode ser realizada pelo Emissor Nacional, inclusive pelo aplicativo, observadas as regras aplicáveis à operação.",
    },
    {
      id: "07",
      q: "É possível voltar a ser MEI após o desenquadramento?",
      a: "Sim! Dependendo do motivo do desenquadramento, é possível retornar ao MEI, desde que a empresa volte a cumprir todos os requisitos legais, como limite de faturamento, atividades permitidas e demais condições do regime. O reenquadramento não é automático e deve ser solicitado dentro do prazo estabelecido pela Receita Federal, geralmente em janeiro, com efeitos a partir de 1º de janeiro, quando deferido. Por isso, é importante realizar uma análise contábil para verificar a elegibilidade e os procedimentos necessários.",
    },
    {
      id: "08",
      q: "Meu MEI está sem movimento. Ainda preciso entregar a Declaração Anual?",
      a: "Sim. Mesmo sem faturamento durante o ano, o MEI deve entregar a DASN-SIMEI, informando receita bruta igual a zero, quando aplicável. A ausência de movimentação não dispensa automaticamente as obrigações fiscais, e declarações anteriores pendentes também devem ser verificadas.",
    },
  ];

  return (
    <section id="duvidas" className="py-20 md:py-28 bg-[#FFFFFF] relative">
      <div className="container-x max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <span className="inline-block bg-[#CBFF1F] text-black text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-1.5 rounded-full mb-4 sm:mb-5">
            PERGUNTAS FREQUENTES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-black tracking-tight leading-[1.18]">
            Tire suas dúvidas<br />
            sobre o{" "}
            <span className="bg-[#CBFF1F] text-black px-2.5 py-0.5 rounded-lg inline-block">
              seu MEI
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-[17px] text-[#4B5563] leading-relaxed max-w-xl mx-auto">
            Respostas claras e objetivas para as principais dúvidas dos microempreendedores.
          </p>
        </div>

        {/* 8 Accordion Items */}
        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="w-full space-y-3 sm:space-y-3.5"
        >
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.id}
              value={`item-${i}`}
              className="faq-card group rounded-2xl border border-[#E5E7EB] bg-white transition-colors duration-200"
            >
              <AccordionTrigger
                hideChevron
                className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 hover:no-underline text-left cursor-pointer transition-none"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0 pr-3 sm:pr-4">
                  {/* Circular Number Badge with Hover Zoom Animation */}
                  <div
                    className="faq-number-badge w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black border-2 border-[#CBFF1F] flex items-center justify-center flex-shrink-0 select-none"
                    aria-hidden="true"
                  >
                    <span className="text-[#CBFF1F] font-bold text-xs sm:text-sm tracking-tight">
                      {f.id}
                    </span>
                  </div>

                  {/* Question Text */}
                  <span className="text-black font-bold text-[14.5px] sm:text-base md:text-[16.5px] leading-snug">
                    {f.q}
                  </span>
                </div>

                {/* Expand / Collapse Circular Icon */}
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 bg-[#71767B] text-white group-data-[state=open]:bg-[#CBFF1F] group-data-[state=open]:text-black"
                  aria-hidden="true"
                >
                  <Plus className="w-4 h-4 stroke-[3] block group-data-[state=open]:hidden" />
                  <Minus className="w-4 h-4 stroke-[3] hidden group-data-[state=open]:block" />
                </div>
              </AccordionTrigger>

              <AccordionContent className="overflow-hidden p-0">
                <div className="mx-5 sm:mx-6 h-px bg-[#F0F2F5]" />
                <div className="px-5 sm:px-6 pt-4 pb-5 sm:pb-6 text-[#4B5563] text-sm sm:text-[15.5px] leading-relaxed">
                  {f.a}
                </div>
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
  const benefits = [
    "Contabilidade Especializada",
    "Atendimento Humanizado",
    "Para MEIs de todo o Brasil",
  ];

  return (
    <section className="py-20 sm:py-24 md:py-28 lg:py-32 bg-[#CBFF1F] relative">
      <div className="container-x relative text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[26px] sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.15] text-black max-w-4xl mx-auto">
          Você cuida do seu negócio.<br className="hidden sm:inline" />
          {" "}Nós cuidamos da<br className="hidden md:inline" />
          {" "}contabilidade do seu MEI.
        </h2>

        <p className="mt-6 sm:mt-7 text-base sm:text-lg md:text-[18px] text-black font-normal leading-relaxed max-w-3xl mx-auto">
          Menos burocracia, mais tranquilidade para empreender. Conte com uma<br className="hidden md:inline" />{" "}
          contabilidade especializada para manter seu MEI organizado, regularizado e em dia.
        </p>

        <div className="mt-8 sm:mt-10 flex justify-center">
          <a
            href={OFFICIAL_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-black hover:bg-[#1a1d1e] text-white text-[15px] sm:text-base font-semibold px-7 sm:px-8 py-3.5 sm:py-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#CBFF1F] shadow-lg"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-[#CBFF1F] flex-shrink-0"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
            </svg>
            <span>FALAR COM ESPECIALISTA</span>
          </a>
        </div>

        <ul className="mt-8 sm:mt-10 lg:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-10">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="inline-flex items-center gap-2.5 text-sm sm:text-[15px] font-semibold text-black"
            >
              <CheckCircle2 className="w-5 h-5 text-black stroke-[2.2] flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------- Footer -------------------------------- */

function Footer() {
  const contactWhatsApp = "https://wa.me/5511915470723";
  const contactEmail = "gestao@anselmodiascontador.com.br";
  const facebookUrl = "https://www.facebook.com/share/194VXXbUPe/";
  const instagramUrl = "https://www.instagram.com/anselmodiascontador";

  return (
    <footer className="bg-[#000000] text-white pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-10">
      <div className="container-x max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr_1fr] xl:grid-cols-[1.05fr_1.25fr_0.95fr] gap-10 lg:gap-0 items-stretch">
          {/* Column 1 — Official Brand Logo & Summary */}
          <div className="lg:pr-6 xl:pr-10 flex flex-col justify-start min-w-0">
            <a
              href="#top"
              className="group inline-block w-[210px] sm:w-[240px] lg:w-[230px] xl:w-[260px] aspect-[644/290] overflow-hidden relative"
              aria-label="Anselmo Dias Contador - Início"
            >
              <img
                src={logoImg}
                alt="Anselmo Dias Contador"
                className="absolute max-w-none w-[127.18%] h-auto left-[-13.35%] top-[-116.21%] transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </a>
            <p className="mt-5 sm:mt-6 text-[13px] sm:text-[13.5px] lg:text-[13px] xl:text-[14px] text-[#9CA3AF] leading-relaxed">
              <span className="xl:whitespace-nowrap">Soluções contábeis práticas, seguras e acessíveis</span>
              <br className="hidden xl:inline" />
              <span> para microempreendedores de todo o Brasil.</span>
            </p>
          </div>

          {/* Column 2 — Contato */}
          <div
            id="contato"
            className="lg:border-x lg:border-white/10 lg:px-6 xl:px-10 flex flex-col justify-start min-w-0"
          >
            <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.18em] text-[#CBFF1F] mb-6">
              CONTATO
            </h3>
            <div className="space-y-4 sm:space-y-5">
              {/* WhatsApp */}
              <a
                href={contactWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 xl:gap-3.5 transition-colors min-w-0"
              >
                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-transparent border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#CBFF1F]/50 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-[#CBFF1F] flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    WHATSAPP
                  </span>
                  <span className="text-sm xl:text-base font-bold text-white group-hover:text-[#CBFF1F] transition-colors whitespace-nowrap">
                    (11) 91547-0723
                  </span>
                </div>
              </a>

              {/* E-mail */}
              <a
                href={`mailto:${contactEmail}`}
                className="group flex items-center gap-3 xl:gap-3.5 transition-colors min-w-0"
              >
                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-transparent border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#CBFF1F]/50 transition-colors">
                  <Mail className="w-5 h-5 text-[#CBFF1F] stroke-[2]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    E-MAIL
                  </span>
                  <span className="text-[12.5px] sm:text-sm lg:text-[13px] xl:text-sm 2xl:text-base font-bold text-white group-hover:text-[#CBFF1F] transition-colors break-words sm:whitespace-nowrap">
                    gestao@<wbr />anselmodiascontador.com.br
                  </span>
                </div>
              </a>

              {/* Localização */}
              <div className="group flex items-center gap-3 xl:gap-3.5 transition-colors min-w-0">
                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-transparent border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#CBFF1F]/50 transition-colors">
                  <MapPin className="w-5 h-5 text-[#CBFF1F] stroke-[2]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    LOCALIZAÇÃO
                  </span>
                  <span className="text-sm xl:text-base font-bold text-white group-hover:text-[#CBFF1F] transition-colors whitespace-nowrap">
                    São Paulo / SP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 — Atendimento & Redes Sociais */}
          <div className="lg:pl-6 xl:pl-10 flex flex-col justify-start min-w-0">
            <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.18em] text-[#CBFF1F] mb-6">
              ATENDIMENTO
            </h3>
            <div className="space-y-4 sm:space-y-5">
              {/* Horário */}
              <div className="group flex items-center gap-3 xl:gap-3.5 transition-colors min-w-0">
                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-transparent border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#CBFF1F]/50 transition-colors">
                  <Clock className="w-5 h-5 text-[#CBFF1F] stroke-[2]" />
                </div>
                <div className="text-[12.5px] sm:text-sm xl:text-[14.5px] font-medium text-white group-hover:text-[#CBFF1F] transition-colors leading-snug">
                  Segunda a sexta-feira,
                  <br />
                  das 09:00 às 18:00
                </div>
              </div>

              {/* Registro Profissional */}
              <div className="group flex items-center gap-3 xl:gap-3.5 transition-colors min-w-0">
                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-transparent border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#CBFF1F]/50 transition-colors">
                  <Award className="w-5 h-5 text-[#CBFF1F] stroke-[2]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    REGISTRO PROFISSIONAL
                  </span>
                  <span className="text-xs sm:text-sm xl:text-base font-bold text-white group-hover:text-[#CBFF1F] transition-colors whitespace-nowrap">
                    CRC: 1SP226494/O-2
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="w-full h-px bg-white/10 my-6" />

            {/* Redes Sociais Heading */}
            <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.18em] text-[#CBFF1F] mb-4">
              REDES SOCIAIS
            </h3>

            {/* 3 Full-color Social Icons */}
            <div className="flex items-center gap-3 xl:gap-3.5">
              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group block rounded-[14px] overflow-hidden transition-transform duration-200 ease-out hover:scale-[1.08] active:scale-95 will-change-transform"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-[14px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shadow-md">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-white"
                    aria-hidden="true"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group block rounded-[14px] overflow-hidden transition-transform duration-200 ease-out hover:scale-[1.08] active:scale-95 will-change-transform"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-[14px] bg-[#1877F2] flex items-center justify-center shadow-md">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-white translate-x-0.5 translate-y-0.5"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={contactWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="group block rounded-[14px] overflow-hidden transition-transform duration-200 ease-out hover:scale-[1.08] active:scale-95 will-change-transform"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-[14px] bg-[#25D366] flex items-center justify-center shadow-md">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-white"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Thin Horizontal Divider beneath the 3 columns */}
        <div className="w-full h-px bg-white/10 mt-12 sm:mt-14 lg:mt-16 mb-6 sm:mb-8" />

        {/* Copyright Area */}
        <div className="text-center lg:text-right lg:pr-24 xl:pr-[380px]">
          <p className="text-xs sm:text-sm text-[#9CA3AF]">
            © 2026 Anselmo Dias Contador. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------- Floating WhatsApp --------------------------- */

const FLOATING_WHATSAPP_URL = "https://wa.me/5511915470723";

function FloatingWhatsApp() {
  return (
    <a
      href={FLOATING_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale com o especialista pelo WhatsApp"
      className="group fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 rounded-full"
    >
      <span className="hidden xl:inline-flex items-center bg-white text-[#111111] text-sm font-semibold px-4 py-2.5 rounded-full border border-[#e5e7eb] shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:scale-[1.02]">
        Fale com o especialista
      </span>
      <div className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_8px_25px_rgba(37,211,102,0.45)] active:scale-95 flex-shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 text-white"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
        </svg>
      </div>
    </a>
  );
}
