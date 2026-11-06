import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { X, CheckCircle2, Info, ArrowRight } from "lucide-react";
import logoMei360 from "@/assets/images/logo-mei-360.png";
import { submitMei360Lead } from "@/lib/api/leads.functions";

interface Mei360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  origem: "popup-desktop-mei-360" | "menu-mobile-mei-360";
}

interface FormData {
  name: string;
  phone: string;
  email: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

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
  if (/^(\d)\1+$/.test(digits) || /^(\d)\1+$/.test(digits.slice(2))) return false;
  return true;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function Mei360Modal({ isOpen, onClose, origem }: Mei360ModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const openedAtRef = useRef<number | null>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = (document.activeElement as HTMLElement) || null;
      openedAtRef.current = Date.now();
      setSubmissionNotice(null);
      setSubmissionStatus("idle");
      setErrors({});

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 60);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          handleClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    try {
      sessionStorage.setItem("ad_mei360_dismissed", "true");
    } catch {}
    onClose();
  }, [onClose]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBrazilianPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleChange = (
    field: keyof FormData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || isSubmittingRef.current) return;

    setSubmissionNotice(null);
    setSubmissionStatus("idle");

    const newErrors: FormErrors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Por favor, informe seu nome completo.";
    } else if (trimmedName.length < 3) {
      newErrors.name = "O nome deve conter pelo menos 3 caracteres.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "O nome não pode exceder 100 caracteres.";
    }

    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = "Por favor, informe seu número de WhatsApp.";
    } else if (!validateBrazilianPhone(trimmedPhone)) {
      newErrors.phone = "Informe um número válido com DDD (ex: (11) 99999-9999).";
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Por favor, informe seu e-mail.";
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.email = "Informe um endereço de e-mail válido.";
    } else if (trimmedEmail.length > 120) {
      newErrors.email = "O e-mail não pode exceder 120 caracteres.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const elapsedMs =
      openedAtRef.current !== null ? Math.max(0, Date.now() - openedAtRef.current) : undefined;

    try {
      const result = await submitMei360Lead({
        data: {
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          origem,
          elapsedMs,
        },
      });

      if (result && result.ok === true && result.gravado === true && result.status === 201) {
        setSubmissionStatus("success");
        setSubmissionNotice(
          "Solicitação recebida com sucesso! Nossa equipe entrará em contato pelo seu WhatsApp com a avaliação do seu MEI 360°."
        );
        try {
          sessionStorage.setItem("ad_mei360_dismissed", "true");
        } catch {}
        setFormData({ name: "", phone: "", email: "" });
        setErrors({});
      } else {
        if (result && !result.ok && result.fieldErrors) {
          setErrors({
            name: result.fieldErrors.name,
            phone: result.fieldErrors.phone,
            email: result.fieldErrors.email,
          });
        }
        setSubmissionStatus("error");
        setSubmissionNotice(
          (result && !result.ok && result.error) ||
            "Não foi possível concluir o envio online agora. Para atendimento imediato, chame-nos no WhatsApp!"
        );
      }
    } catch {
      setSubmissionStatus("error");
      setSubmissionNotice(
        "Não foi possível concluir o envio online agora. Para atendimento imediato, chame-nos no WhatsApp!"
      );
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mei360-title"
      aria-describedby="mei360-desc"
      className="fixed inset-0 z-[60] overflow-y-auto"
    >
      {/* Backdrop com blur suave */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Container centralizado */}
      <div className="relative min-h-full flex items-center justify-center p-3 sm:p-5 md:p-6 pointer-events-none">
        <div
          ref={dialogRef}
          className="pointer-events-auto relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-black/10 overflow-y-auto md:overflow-hidden font-['Poppins',sans-serif] max-h-[calc(100dvh-2rem)] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Botão Fechar (X) acessível com contraste responsivo */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar pop-up MEI 360"
            className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white md:bg-black/10 md:hover:bg-black/20 md:text-black flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF1F] md:focus-visible:ring-black cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
          </button>

          {/* PAINEL ESQUERDO: Fundo Preto com Identidade MEI 360 */}
          <div className="w-full md:w-[45%] bg-[#000000] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden flex-shrink-0">
            {/* Decoração sutil de luz verde-limão */}
            <div
              className="absolute -top-24 -left-24 w-56 h-56 bg-[#CBFF1F]/15 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-24 -right-24 w-56 h-56 bg-[#CBFF1F]/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10">
              {/* Logotipo Oficial MEI 360 */}
              <div className="w-full max-w-[260px] sm:max-w-[290px] mx-auto md:mx-0 mb-5 sm:mb-6">
                <img
                  src={logoMei360}
                  alt="MEI 360 - Diagnóstico e Orientação Completa para o seu MEI"
                  width={1024}
                  height={512}
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Mensagem curta */}
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-6">
                Diagnóstico especializado para manter seu microempreendimento protegido, com obrigações em dia e pronto para crescer com segurança.
              </p>

              {/* Três Benefícios */}
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#CBFF1F]/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#CBFF1F]">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-semibold text-white">Análise da situação do MEI</h4>
                    <p className="text-[11px] sm:text-xs text-white/70 leading-snug">Verificação cadastral e tributária detalhada.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#CBFF1F]/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#CBFF1F]">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-semibold text-white">Identificação de possíveis pendências</h4>
                    <p className="text-[11px] sm:text-xs text-white/70 leading-snug">Prevenção contra multas e dívidas ativas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#CBFF1F]/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#CBFF1F]">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-semibold text-white">Orientações personalizadas</h4>
                    <p className="text-[11px] sm:text-xs text-white/70 leading-snug">Atendimento humano focado na sua realidade.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-5 border-t border-white/10 hidden md:block">
              <p className="text-[11px] text-white/60">
                Atendimento humanizado para microempreendedores individuais de todo o Brasil.
              </p>
            </div>
          </div>

          {/* PAINEL DIREITO: Fundo Branco com Formulário */}
          <div className="w-full md:w-[55%] bg-white p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="pr-8">
                <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-black bg-[#CBFF1F] px-2.5 py-0.5 rounded-full mb-2">
                  Diagnóstico Estratégico
                </span>
                <h3
                  id="mei360-title"
                  className="text-lg sm:text-2xl font-bold text-black tracking-tight leading-tight"
                >
                  Descubra como está a saúde do seu MEI
                </h3>
                <p
                  id="mei360-desc"
                  className="text-xs sm:text-sm text-[#4B5563] mt-1.5 leading-relaxed"
                >
                  Receba uma avaliação da situação do seu MEI e orientações práticas para cuidar do seu negócio.
                </p>
              </div>

              {/* Status Banner */}
              {submissionNotice && (
                <div
                  role="status"
                  className={`mt-4 p-3.5 rounded-xl border text-xs sm:text-[12.5px] leading-relaxed flex items-start gap-2.5 ${
                    submissionStatus === "success"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : "bg-amber-50 border-amber-300 text-amber-950"
                  }`}
                >
                  <Info
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 stroke-[2.2] ${
                      submissionStatus === "success" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{submissionNotice}</p>
                    {submissionStatus === "error" && (
                      <a
                        href="https://wa.me/5511915470723"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-black bg-[#CBFF1F] px-3 py-1.5 rounded-full hover:brightness-105"
                      >
                        Chamar no WhatsApp <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSubmit} noValidate className="mt-4 sm:mt-5 space-y-3 sm:space-y-3.5">
                {/* Nome Completo */}
                <div>
                  <label htmlFor="mei360-name" className="block text-xs font-semibold text-black mb-1">
                    Nome completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    id="mei360-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e)}
                    disabled={isSubmitting}
                    placeholder="Seu nome completo"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CBFF1F] focus:border-black transition-all ${
                      errors.name ? "border-red-500 bg-red-50/30" : "border-gray-300 bg-gray-50/50"
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.name}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="mei360-phone" className="block text-xs font-semibold text-black mb-1">
                    WhatsApp com DDD <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="mei360-phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    disabled={isSubmitting}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CBFF1F] focus:border-black transition-all ${
                      errors.phone ? "border-red-500 bg-red-50/30" : "border-gray-300 bg-gray-50/50"
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.phone}</p>}
                </div>

                {/* E-mail */}
                <div>
                  <label htmlFor="mei360-email" className="block text-xs font-semibold text-black mb-1">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="mei360-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e)}
                    disabled={isSubmitting}
                    placeholder="seuemail@exemplo.com.br"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CBFF1F] focus:border-black transition-all ${
                      errors.email ? "border-red-500 bg-red-50/30" : "border-gray-300 bg-gray-50/50"
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.email}</p>}
                </div>

                {/* Aviso LGPD / Política de Privacidade */}
                <p className="text-[11px] text-[#6B7280] leading-snug pt-1">
                  Seus dados estão protegidos e serão utilizados exclusivamente para realizar o atendimento da sua solicitação, em conformidade com nossa{" "}
                  <Link
                    to="/politica-de-privacidade"
                    className="text-black font-semibold underline hover:text-[#4B5563]"
                  >
                    Política de Privacidade
                  </Link>
                  . Não emitimos diagnósticos automatizados instantâneos.
                </p>

                {/* Botão de Envio (CTA) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-5 rounded-full bg-[#CBFF1F] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wide transition-all duration-200 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Processando envio seguro...</span>
                  ) : (
                    <>
                      <span>QUERO MEU MEI 360°</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
