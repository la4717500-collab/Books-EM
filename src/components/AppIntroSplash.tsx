import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BooksEmLogo } from './BotanicalElements';
import { ArrowRight, Sparkles, X } from 'lucide-react';

interface AppIntroSplashProps {
  onComplete: () => void;
  onExiting?: () => void;
  storeName?: string;
}

export const AppIntroSplash: React.FC<AppIntroSplashProps> = ({
  onComplete,
  onExiting,
  storeName = 'Books EM',
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Prevent background scrolling while splash is active
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Auto-dismiss after 2.8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleExit();
    }, 2800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExiting]);

  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    if (onExiting) {
      onExiting();
    }
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="app-intro-splash-screen"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ backgroundColor: '#EADBD9' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#EADBD9] overflow-hidden select-none"
          onClick={handleExit}
        >
          {/* Subtle warm background radial light */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.65)_0%,transparent_70%)] pointer-events-none" />

          {/* Top Skip Button */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleExit();
              }}
              id="intro-skip-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-[#5C3218] border border-[#DAC5C2] text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer shadow-2xs"
            >
              <span>Entrar</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Central Logo Container with Motion */}
          <div className="relative z-10 flex flex-col items-center px-4 max-w-lg w-full text-center">
            {/* Animated Glow Pill */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-[#DAC5C2] text-[11px] font-bold text-[#5C3218] mb-6 shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-amber-700 animate-pulse" />
              <span>Librería & Colecciones Selectas</span>
            </motion.div>

            {/* Official Branded Logo with entrance animation */}
            <motion.div
              initial={{ scale: 0.88, y: 14, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative p-6 sm:p-8 rounded-3xl bg-white/40 border border-white/60 shadow-[0_16px_40px_rgba(74,40,16,0.08)] backdrop-blur-xs"
            >
              {/* Floating ambient shimmer behind logo */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-200/20 via-rose-200/20 to-amber-200/20 blur-xl opacity-60 pointer-events-none -z-10" />

              <BooksEmLogo
                size="hero"
                theme="light"
                className="drop-shadow-xs"
              />

              {/* Tagline below logo */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-4 font-serif text-xs sm:text-sm text-[#6B503D] font-medium tracking-wide"
              >
                Ediciones selectas, historias que inspiran y perduran
              </motion.p>
            </motion.div>

            {/* Loading & Enter Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 w-48 sm:w-56"
            >
              <div className="h-1.5 w-full bg-[#DAC5C2] rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                  className="h-full bg-[#5C3218] rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#7A6455] font-semibold mt-2">
                <span>Cargando catálogo</span>
                <span className="flex items-center gap-1 text-[#5C3218]">
                  Toca para entrar <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
