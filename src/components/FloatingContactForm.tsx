import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { User, Phone, Mail, MessageSquare, Send, X, AlertCircle, Info } from "lucide-react";

interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
}

/* Brazilian phone number formatter: (XX) XXXXX-XXXX or (XX) XXXX-XXXX */
function formatBrazilianPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function validateBrazilianPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  if (digits.length === 11 && digits[2] !== "9") return false;
  // Reject repetitive sequences like 11111111111
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function FloatingContactForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Focus management & Escape key handling
  useEffect(() => {
    if (isOpen) {
      // Lock scroll while modal is active
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Focus first input
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsOpen(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer);
      };
    } else {
      // Return focus to trigger button when closing
      triggerButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    setSubmissionNotice(null);
    setErrors({});
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBrazilianPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleChange = (
    field: keyof FormData,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionNotice(null);

    const newErrors: FormErrors = {};

    // Validate Name
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Por favor, informe seu nome completo.";
    } else if (trimmedName.length < 3) {
      newErrors.name = "O nome deve conter pelo menos 3 caracteres.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "O nome não pode exceder 100 caracteres.";
    }

    // Validate Phone
    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = "Por favor, informe seu número de WhatsApp.";
    } else if (!validateBrazilianPhone(trimmedPhone)) {
      newErrors.phone = "Informe um número válido com DDD (ex: (11) 99999-9999).";
    }

    // Validate Email
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Por favor, informe seu e-mail.";
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.email = "Informe um endereço de e-mail válido.";
    } else if (trimmedEmail.length > 120) {
      newErrors.email = "O e-mail não pode exceder 120 caracteres.";
    }

    // Validate Message
    const trimmedMessage = formData.message.trim();
    if (!trimmedMessage) {
      newErrors.message = "Por favor, digite sua mensagem.";
    } else if (trimmedMessage.length < 10) {
      newErrors.message = "A mensagem deve conter pelo menos 10 caracteres.";
    } else if (trimmedMessage.length > 1000) {
      newErrors.message = "A mensagem não pode exceder 1000 caracteres.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Client-side validation passed!
    // Note: Backend integration (Supabase/Brevo) is not yet authorized.
    // We clearly communicate that direct online message sending is not yet available,
    // preserving user inputs and without sending false success claims.
    setSubmissionNotice(
      "O envio online pelo formulário ainda não está ativado nesta fase. Para atendimento imediato, fale conosco diretamente pelo WhatsApp ao lado!"
    );
  };

  return (
    <>
      {/* Floating Neon-Green Contact Button (Side-by-side with WhatsApp) */}
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={handleOpen}
        aria-label="Fale Conosco"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="fixed bottom-5 right-[84px] sm:bottom-6 sm:right-[92px] xl:right-[312px] z-40 w-14 h-14 rounded-full bg-[#CBFF1F] text-black shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F] focus-visible:ring-offset-2 focus-visible:ring-offset-black select-none flex-shrink-0"
      >
        <Mail className="w-7 h-7 text-black stroke-[2]" aria-hidden="true" />
      </button>

      {/* Floating Modal Contact Form */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="fale-conosco-title"
          aria-describedby="fale-conosco-desc"
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          {/* Backdrop overlay */}
          <div
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Modal Container: centered on mobile, bottom-right aligned on desktop above buttons */}
          <div className="relative min-h-full flex items-center justify-center md:items-end md:justify-end p-3.5 sm:p-4 md:p-6 md:pb-24 pointer-events-none">
            <div
              ref={dialogRef}
              className="pointer-events-auto relative w-full max-w-[420px] bg-white rounded-[26px] sm:rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-black/10 p-5 sm:p-6 md:p-7 max-h-[calc(100dvh-2rem)] md:max-h-[calc(100dvh-7.5rem)] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2
                    id="fale-conosco-title"
                    className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase"
                  >
                    FALE CONOSCO
                  </h2>
                  <p
                    id="fale-conosco-desc"
                    className="text-xs sm:text-[13px] text-[#4B5563] mt-1 leading-relaxed font-normal"
                  >
                    Tem alguma dúvida? Envie sua mensagem e nossa equipe entrará em contato.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Fechar formulário"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-black/80 hover:text-black hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black flex-shrink-0"
                >
                  <X className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                </button>
              </div>

              {/* Notice Banner (when validation passes but backend is not yet active) */}
              {submissionNotice && (
                <div
                  role="status"
                  className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-[12.5px] leading-relaxed flex items-start gap-2.5"
                >
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 stroke-[2.2]" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-950">Aviso informativo</p>
                    <p className="mt-0.5 text-amber-900">{submissionNotice}</p>
                    <a
                      href="https://wa.me/5511915470723"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-emerald-700 underline mt-2 hover:text-emerald-800"
                    >
                      Falar agora pelo WhatsApp →
                    </a>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3 sm:space-y-3.5">
                {/* Field 1 — Nome completo */}
                <div>
                  <div
                    className={`rounded-2xl p-3 sm:p-3.5 transition-all flex items-start gap-3 bg-[#F4F5F7] border ${
                      errors.name
                        ? "border-red-400 bg-red-50/30"
                        : "border-transparent focus-within:border-black/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#CBFF1F]/50"
                    }`}
                  >
                    <User
                      className="w-5 h-5 text-black stroke-[1.8] flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor="fc-name"
                        className="block text-[11px] sm:text-xs font-semibold text-[#111827] leading-tight"
                      >
                        Nome completo
                      </label>
                      <input
                        ref={nameInputRef}
                        id="fc-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange("name", e)}
                        placeholder="Seu nome completo"
                        className="w-full bg-transparent text-xs sm:text-[13px] text-black placeholder:text-[#9CA3AF] outline-none pt-0.5"
                      />
                    </div>
                  </div>
                  {errors.name && (
                    <p className="mt-1 ml-2 text-[11px] font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 stroke-[2] flex-shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Field 2 — WhatsApp */}
                <div>
                  <div
                    className={`rounded-2xl p-3 sm:p-3.5 transition-all flex items-start gap-3 bg-[#F4F5F7] border ${
                      errors.phone
                        ? "border-red-400 bg-red-50/30"
                        : "border-transparent focus-within:border-black/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#CBFF1F]/50"
                    }`}
                  >
                    <Phone
                      className="w-5 h-5 text-black stroke-[1.8] flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor="fc-phone"
                        className="block text-[11px] sm:text-xs font-semibold text-[#111827] leading-tight"
                      >
                        WhatsApp
                      </label>
                      <input
                        id="fc-phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-transparent text-xs sm:text-[13px] text-black placeholder:text-[#9CA3AF] outline-none pt-0.5"
                      />
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="mt-1 ml-2 text-[11px] font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 stroke-[2] flex-shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Field 3 — E-mail */}
                <div>
                  <div
                    className={`rounded-2xl p-3 sm:p-3.5 transition-all flex items-start gap-3 bg-[#F4F5F7] border ${
                      errors.email
                        ? "border-red-400 bg-red-50/30"
                        : "border-transparent focus-within:border-black/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#CBFF1F]/50"
                    }`}
                  >
                    <Mail
                      className="w-5 h-5 text-black stroke-[1.8] flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor="fc-email"
                        className="block text-[11px] sm:text-xs font-semibold text-[#111827] leading-tight"
                      >
                        E-mail
                      </label>
                      <input
                        id="fc-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full bg-transparent text-xs sm:text-[13px] text-black placeholder:text-[#9CA3AF] outline-none pt-0.5"
                      />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-1 ml-2 text-[11px] font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 stroke-[2] flex-shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Field 4 — Sua mensagem */}
                <div>
                  <div
                    className={`rounded-2xl p-3 sm:p-3.5 transition-all flex items-start gap-3 bg-[#F4F5F7] border ${
                      errors.message
                        ? "border-red-400 bg-red-50/30"
                        : "border-transparent focus-within:border-black/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#CBFF1F]/50"
                    }`}
                  >
                    <MessageSquare
                      className="w-5 h-5 text-black stroke-[1.8] flex-shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor="fc-message"
                        className="block text-[11px] sm:text-xs font-semibold text-[#111827] leading-tight"
                      >
                        Sua mensagem
                      </label>
                      <textarea
                        id="fc-message"
                        name="message"
                        rows={3}
                        required
                        value={formData.message}
                        onChange={(e) => handleChange("message", e)}
                        placeholder="Como podemos ajudar você?"
                        className="w-full bg-transparent text-xs sm:text-[13px] text-black placeholder:text-[#9CA3AF] outline-none pt-0.5 resize-none"
                      />
                    </div>
                  </div>
                  {errors.message && (
                    <p className="mt-1 ml-2 text-[11px] font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 stroke-[2] flex-shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Action Button: ENVIAR MENSAGEM */}
                <button
                  type="submit"
                  className="w-full mt-4 sm:mt-5 py-3.5 sm:py-4 px-6 rounded-2xl bg-[#CBFF1F] text-black font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-md hover:brightness-105 active:scale-[0.99] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
                >
                  <Send className="w-4 h-4 text-black stroke-[2.4] flex-shrink-0 -rotate-12 translate-x-0.5" aria-hidden="true" />
                  <span>ENVIAR MENSAGEM</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
