import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BooksEmLogo } from './BotanicalElements';

interface PWAInstallPromptProps {
  /** Optional override to force open from header/footer */
  manualTrigger?: boolean;
  onManualTriggerHandled?: () => void;
}

const AUTO_DISMISS_SECONDS = 14;

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  manualTrigger = false,
  onManualTriggerHandled,
}) => {
  const { isInstallable, isInstalled, isIOS, hasNativePrompt, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(AUTO_DISMISS_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Show prompt after a short delay on initial load if not installed and not previously dismissed in session
  useEffect(() => {
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    if (manualTrigger) {
      setIsVisible(true);
      setSecondsRemaining(AUTO_DISMISS_SECONDS);
      if (onManualTriggerHandled) onManualTriggerHandled();
      return;
    }

    // Check if dismissed in this session
    const hasDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (!hasDismissed) {
      const enterTimer = setTimeout(() => {
        setIsVisible(true);
        setSecondsRemaining(AUTO_DISMISS_SECONDS);
      }, 1500); // 1.5s after load

      return () => clearTimeout(enterTimer);
    }
  }, [isInstalled, manualTrigger, onManualTriggerHandled]);

  // Countdown timer for auto-dismiss (10-15 seconds)
  useEffect(() => {
    if (!isVisible || isPaused || showIOSModal || installSuccess) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible, isPaused, showIOSModal, installSuccess]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (hasNativePrompt) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 2200);
      } else {
        handleDismiss();
      }
    } else {
      // Browser doesn't support beforeinstallprompt (e.g. Firefox desktop or in-app browser)
      setShowIOSModal(true);
    }
  };

  // If already installed as a standalone app, never render
  if (isInstalled) {
    return null;
  }

  const progressPercentage = (secondsRemaining / AUTO_DISMISS_SECONDS) * 100;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id="pwa-install-floating-banner"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-md w-auto"
          >
            <div className="relative overflow-hidden bg-[#FAF5F4] text-[#2C2420] rounded-2xl border border-[#DAC5C2] shadow-2xl shadow-[#3B2213]/20 backdrop-blur-md">
              {/* Brand Logo Header Image (Books EM Official Logo with white square in O and background #EADBD9) */}
              <div className="relative w-full h-28 sm:h-32 bg-[#EADBD9] border-b border-[#DAC5C2] overflow-hidden flex items-center justify-center p-3">
                <BooksEmLogo
                  size="md"
                  showSubtitle={false}
                  showSlogan={false}
                  className="w-full max-w-[260px]"
                />

                {/* Top overlay badge */}
                <div className="absolute top-2.5 left-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF5F4]/95 backdrop-blur-md text-[#5C3218] text-[10px] font-bold tracking-wide uppercase shadow-xs border border-[#DAC5C2]">
                  <Sparkles className="w-3 h-3 text-[#D97706]" />
                  <span>Instalar Aplicación</span>
                </div>

                {/* Top close & timer */}
                <div className="absolute top-2.5 right-3 flex items-center gap-1.5 bg-[#FAF5F4]/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#DAC5C2] shadow-xs">
                  <span className="text-[10px] font-mono font-semibold text-[#8C5E3C]">
                    {secondsRemaining}s
                  </span>
                  <button
                    id="pwa-close-btn"
                    onClick={handleDismiss}
                    className="p-0.5 rounded-full text-[#786D65] hover:text-[#2C2420] transition-colors"
                    title="Cerrar notificación"
                    aria-label="Cerrar ventana de instalación"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Content Body with App Icon Badge */}
              <div className="p-4 flex items-start gap-3.5">
                {/* App icon badge showing the installed app logo with white square in O and #EADBD9 background */}
                <div className="w-12 h-12 rounded-xl bg-[#EADBD9] border border-[#DAC5C2] p-1 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                  <BooksEmLogo size="sm" showSubtitle={false} className="w-full h-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-serif-title font-bold text-sm text-[#3B2213] leading-snug">
                    {installSuccess
                      ? '¡Aplicación instalada con éxito!'
                      : '¿Deseas instalar Books EM en tu dispositivo?'}
                  </h4>
                  <p className="text-xs text-[#6B5A4E] mt-0.5 leading-relaxed">
                    {installSuccess
                      ? 'Ya puedes acceder directamente con este icono desde tu pantalla de inicio.'
                      : 'Acceso instantáneo con este logo en tu pantalla de inicio, catálogo y compras por WhatsApp.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 px-4 pb-3.5 pt-0">
                <button
                  id="pwa-dismiss-btn"
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-medium text-[#786D65] hover:text-[#3B2213] hover:bg-[#EADBD9] rounded-lg transition-colors cursor-pointer"
                >
                  Quizás luego
                </button>

                {!installSuccess ? (
                  <button
                    id="pwa-install-action-btn"
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#5C3218] hover:bg-[#43230F] active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Instalar Ahora</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instalado</span>
                  </div>
                )}
              </div>

              {/* Auto-dismiss progress bar indicator (10-15s) */}
              <div className="w-full h-1 bg-[#DAC5C2] overflow-hidden">
                <div
                  className="h-full bg-[#8C5E3C] transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS & Manual Installation Instruction Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div
            id="pwa-ios-modal-overlay"
            className="fixed inset-0 z-50 bg-[#1A120B]/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FAF5F4] border border-[#DAC5C2] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-[#2C2420]"
            >
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-[#786D65] hover:text-[#2C2420] hover:bg-[#EADBD9] transition-colors"
                title="Cerrar guía"
              >
                <X className="w-5 h-5" />
              </button>

              {/* App Icon preview */}
              <div className="flex items-center gap-3.5 mb-4 p-3 rounded-xl bg-[#EADBD9]/60 border border-[#DAC5C2]">
                <div className="w-14 h-14 rounded-xl bg-[#EADBD9] border border-[#DAC5C2] p-1 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                  <BooksEmLogo size="sm" showSubtitle={false} className="w-full h-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif-title text-base font-bold text-[#3B2213]">Books EM</h4>
                  <p className="text-xs text-[#786D65]">Este será el icono oficial en tu dispositivo</p>
                  <span className="inline-block mt-0.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">PWA Lista para instalar</span>
                </div>
              </div>

              <h3 className="font-serif-title text-lg font-bold text-[#3B2213]">
                {isIOS ? 'Instalar en iPhone o iPad' : 'Instalar en tu Pantalla de Inicio'}
              </h3>

              <p className="text-xs text-[#6B5A4E] mt-1 leading-relaxed">
                {isIOS
                  ? 'Sigue estos sencillos pasos en Safari para agregar Books EM con este logo a tu pantalla de inicio:'
                  : 'Añade Books EM a tu pantalla principal siguiendo estos pasos desde tu navegador:'}
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F4EDE4] border border-[#E5DACB]">
                  <div className="w-7 h-7 rounded-lg bg-[#5C3218] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs text-[#3B2213]">
                    {isIOS ? (
                      <>
                        Toca el botón <strong className="font-semibold">Compartir</strong>{' '}
                        <Share className="inline-block w-3.5 h-3.5 mx-0.5 text-[#5C3218]" /> en la barra inferior de Safari.
                      </>
                    ) : (
                      <>
                        Abre el menú de opciones de tu navegador (los tres puntos <strong className="font-semibold">⋮</strong> en la esquina).
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F4EDE4] border border-[#E5DACB]">
                  <div className="w-7 h-7 rounded-lg bg-[#5C3218] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs text-[#3B2213]">
                    {isIOS ? (
                      <>
                        Desplázate hacia abajo y selecciona{' '}
                        <strong className="font-semibold">"Agregar a inicio"</strong>{' '}
                        <PlusSquare className="inline-block w-3.5 h-3.5 mx-0.5 text-[#5C3218]" />.
                      </>
                    ) : (
                      <>
                        Selecciona <strong className="font-semibold">"Instalar aplicación"</strong> o{' '}
                        <strong className="font-semibold">"Agregar a la pantalla principal"</strong>.
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowIOSModal(false);
                  handleDismiss();
                }}
                className="w-full mt-5 py-2.5 bg-[#5C3218] hover:bg-[#43230F] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
