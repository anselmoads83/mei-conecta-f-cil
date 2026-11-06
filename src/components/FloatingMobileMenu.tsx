import { useState, useEffect, useRef, useCallback } from "react";
import { Mail, X, Layers, ChevronUp, Sparkles } from "lucide-react";
import { Mei360Modal } from "./Mei360Modal";

export function FloatingMobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMei360Open, setIsMei360Open] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Fecha o menu com tecla Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  const handleOpenContact = () => {
    closeMenu();
    window.dispatchEvent(new CustomEvent("ad_open_contact_form"));
  };

  const handleOpenMei360 = () => {
    closeMenu();
    setIsMei360Open(true);
  };

  return (
    <>
      {/* Container visível exclusivamente em mobile (md:hidden) */}
      <div className="flex md:hidden">
        {/* Backdrop overlay para fechamento ao toque externo */}
        {isMenuOpen && (
          <div
            onClick={closeMenu}
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30 transition-opacity duration-200 animate-in fade-in"
            aria-hidden="true"
          />
        )}

        {/* Menu vertical expansível (Speed Dial) */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            aria-label="Opções de atendimento e diagnóstico"
            className="fixed bottom-[88px] right-4 z-40 flex flex-col items-end gap-3 font-['Poppins',sans-serif] animate-in slide-in-from-bottom-3 fade-in duration-200"
          >
            {/* Opção 1: MEI 360° */}
            <button
              type="button"
              role="menuitem"
              onClick={handleOpenMei360}
              className="flex items-center gap-3 bg-[#000000] text-white border border-[#CBFF1F]/60 px-4 py-3 rounded-2xl shadow-2xl transition-all active:scale-95 text-right select-none group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F]"
            >
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[#CBFF1F] text-black">
                    Novo
                  </span>
                  <span className="text-sm font-bold text-white tracking-tight">
                    MEI 360°
                  </span>
                </div>
                <span className="text-[11px] text-white/70 font-normal">
                  Diagnóstico e orientação completa
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#CBFF1F] text-black flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <Sparkles className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
              </div>
            </button>

            {/* Opção 2: Fale Conosco (Formulário existente) */}
            <button
              type="button"
              role="menuitem"
              onClick={handleOpenContact}
              className="flex items-center gap-3 bg-white text-black border border-gray-200 px-4 py-3 rounded-2xl shadow-2xl transition-all active:scale-95 text-right select-none group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-black tracking-tight">
                  Fale Conosco
                </span>
                <span className="text-[11px] text-gray-500 font-normal">
                  Mensagem para nossa equipe
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#000000] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <Mail className="w-5 h-5 stroke-[2]" aria-hidden="true" />
              </div>
            </button>
          </div>
        )}

        {/* Botão Gatilho do Menu Flutuante no Mobile */}
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fechar menu de opções" : "Menu de opções de contato e diagnóstico"}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          className={`fixed bottom-5 right-[78px] z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 select-none flex-shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F] focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer ${
            isMenuOpen
              ? "bg-black text-[#CBFF1F] border-2 border-[#CBFF1F] rotate-90"
              : "bg-[#CBFF1F] text-black hover:scale-105"
          }`}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
          ) : (
            <Layers className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Modal MEI 360° para acionamento mobile */}
      <Mei360Modal
        isOpen={isMei360Open}
        onClose={() => setIsMei360Open(false)}
        origem="menu-mobile-mei-360"
      />
    </>
  );
}
