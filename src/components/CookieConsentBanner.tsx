import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import {
  getCookieConsent,
  setCookieConsent,
  OPEN_PREFERENCES_EVENT,
  type CookieConsentStatus,
} from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<CookieConsentStatus | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Inicialização segura após montagem no cliente (evita divergências de hidratação SSR)
  useEffect(() => {
    setIsMounted(true);
    const existing = getCookieConsent();
    if (existing) {
      setCurrentStatus(existing.status);
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }

    const handleOpen = () => {
      const latest = getCookieConsent();
      setCurrentStatus(latest ? latest.status : null);
      setIsVisible(true);
    };

    window.addEventListener(OPEN_PREFERENCES_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_PREFERENCES_EVENT, handleOpen);
    };
  }, []);

  const handleAccept = useCallback(() => {
    setCookieConsent("accepted");
    setCurrentStatus("accepted");
    setIsVisible(false);
  }, []);

  const handleReject = useCallback(() => {
    setCookieConsent("rejected");
    setCurrentStatus("rejected");
    setIsVisible(false);
  }, []);

  // Não renderiza nada durante o SSR
  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <aside
      ref={bannerRef}
      role="region"
      aria-label="Aviso de Privacidade e Cookies"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:max-w-lg z-50 bg-[#000000] border border-white/20 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/90 font-['Poppins',sans-serif] text-white animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3.5">
        {/* Ícone Minimalista de Privacidade */}
        <div
          className="w-9 h-9 rounded-full bg-[#CBFF1F]/10 border border-[#CBFF1F]/30 flex items-center justify-center flex-shrink-0 text-[#CBFF1F] mt-0.5"
          aria-hidden="true"
        >
          <Shield className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Título Oficial */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              Privacidade e Cookies
            </h2>
            {currentStatus && (
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                {currentStatus === "accepted" ? "Opcionais Ativos" : "Opcionais Desativados"}
              </span>
            )}
          </div>

          {/* Mensagem Oficial */}
          <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed mt-2">
            Utilizamos cookies necessários para o funcionamento do site e, com sua autorização, cookies
            opcionais de análise e publicidade, quando utilizados. Saiba mais em nossa{" "}
            <Link
              to="/politica-de-privacidade"
              hash="privacidade"
              className="text-[#CBFF1F] underline underline-offset-2 hover:brightness-110 font-medium transition-colors"
            >
              Política de Privacidade e Cookies
            </Link>
            .
          </p>

          {/* Ações do Painel */}
          <div className="mt-4 pt-1 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            {/* Botão Secundário: Rejeitar opcionais */}
            <button
              type="button"
              onClick={handleReject}
              className="px-4 py-2.5 rounded-full border border-white text-white hover:bg-white/10 font-semibold text-xs sm:text-[13px] tracking-wide transition-all duration-200 text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Rejeitar opcionais
            </button>

            {/* Botão Principal: Aceitar */}
            <button
              type="button"
              onClick={handleAccept}
              className="px-5 py-2.5 rounded-full bg-[#CBFF1F] text-black font-extrabold text-xs sm:text-[13px] tracking-wide transition-all duration-200 text-center cursor-pointer hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F]"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
