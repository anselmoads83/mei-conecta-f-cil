import { useState, useEffect, useRef } from "react";
import {
  getCookieConsent,
  CONSENT_CHANGED_EVENT,
} from "@/lib/cookie-consent";
import { Mei360Modal } from "./Mei360Modal";

const TIMER_DELAY_MS = 6000; // 6 segundos

export function Mei360AutoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Somente roda no cliente e em telas desktop / tablets grandes (>= 768px)
    if (typeof window === "undefined") return;

    const isDesktop = () => window.innerWidth >= 768;

    // Cancela o temporizador de forma segura
    const cancelCountdown = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    // 2. Se já foi dispensado ou submetido na sessão atual, não exibe automaticamente
    const isDismissed = () => {
      try {
        return sessionStorage.getItem("ad_mei360_dismissed") === "true";
      } catch {
        return false;
      }
    };

    // Listener para abertura manual (ex: menu flutuante ou atalhos)
    const handleManualOpen = () => {
      cancelCountdown();
      try {
        sessionStorage.setItem("ad_mei360_dismissed", "true");
      } catch {}
      setIsOpen(true);
    };

    // Se outro formulário for acionado, cancela o temporizador para evitar sobreposições
    const handleOtherFormOpen = () => {
      cancelCountdown();
    };

    window.addEventListener("ad_open_mei360_modal", handleManualOpen);
    window.addEventListener("ad_open_contact_form", handleOtherFormOpen);

    if (isDismissed()) {
      return () => {
        window.removeEventListener("ad_open_mei360_modal", handleManualOpen);
        window.removeEventListener("ad_open_contact_form", handleOtherFormOpen);
        cancelCountdown();
      };
    }

    // Inicia o timer de 6 segundos se atender aos critérios
    const startCountdown = () => {
      cancelCountdown();

      timerRef.current = setTimeout(() => {
        // Verifica se a tela ainda é desktop e não foi dispensado
        if (!isDesktop() || isDismissed()) return;

        // Não abre se outro modal/dialog já estiver ativo na tela
        const existingDialog = document.querySelector('[role="dialog"]');
        if (existingDialog) return;

        // Não abre se o banner de cookies ainda estiver visível
        const cookieBanner = document.querySelector('[aria-label="Aviso de Privacidade e Cookies"]');
        if (cookieBanner) return;

        setIsOpen(true);
      }, TIMER_DELAY_MS);
    };

    // 3. Verifica o status do consentimento de cookies
    const existingConsent = getCookieConsent();

    if (existingConsent) {
      // Visitante já resolveu os cookies em visita anterior -> inicia 6s após montagem
      startCountdown();
    } else {
      // Visitante ainda não resolveu -> escuta o evento de resolução
      const handleConsentResolved = () => {
        startCountdown();
      };

      window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentResolved);
      return () => {
        window.removeEventListener("ad_open_mei360_modal", handleManualOpen);
        window.removeEventListener("ad_open_contact_form", handleOtherFormOpen);
        window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentResolved);
        cancelCountdown();
      };
    }

    return () => {
      window.removeEventListener("ad_open_mei360_modal", handleManualOpen);
      window.removeEventListener("ad_open_contact_form", handleOtherFormOpen);
      cancelCountdown();
    };
  }, []);

  return (
    <Mei360Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      origem="popup-desktop-mei-360"
    />
  );
}
