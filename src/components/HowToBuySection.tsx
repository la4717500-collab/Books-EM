import React from 'react';
import { MessageCircle, CheckCircle2, CreditCard, Send, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';
import { BotanicalSprig } from './BotanicalElements';

interface HowToBuySectionProps {
  settings: StoreSettings;
}

export const HowToBuySection: React.FC<HowToBuySectionProps> = ({ settings }) => {
  return (
    <section id="how-to-buy-section" className="py-16 bg-[#F5EFEB] border-y border-[#EAE0D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BotanicalSprig className="w-8 h-4 text-[#5C3218] opacity-70 -scale-x-100" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C5E3C]">
              Proceso Simple y Transparente
            </span>
            <BotanicalSprig className="w-8 h-4 text-[#5C3218] opacity-70" />
          </div>
          <h2 className="font-brand text-2xl sm:text-4xl font-bold text-[#3B2213] tracking-tight mb-4">
            ¿Cómo Comprar en Books EM?
          </h2>
          <p className="text-sm sm:text-base text-[#685548] leading-relaxed">
            Sin registros complicados ni carritos olvidados. Nos comunicamos directamente contigo por WhatsApp para brindarte la mejor atención humana.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DAC5C2] shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-[#EADBD9] border border-[#DAC5C2] text-[#5C3218] font-brand text-xl font-bold flex items-center justify-center mb-5">
              1
            </div>
            <h3 className="font-serif-title text-lg font-bold text-[#3B2213] mb-2">
              Explora y Selecciona
            </h3>
            <p className="text-xs sm:text-sm text-[#6E5A4E] leading-relaxed">
              Recorre nuestro catálogo, lee las sinopsis detalladas y escoge los títulos que despierten tu curiosidad literaria.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DAC5C2] shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#128C7E] font-brand text-xl font-bold flex items-center justify-center mb-5">
              2
            </div>
            <h3 className="font-serif-title text-lg font-bold text-[#3B2213] mb-2">
              Solicita por WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-[#6E5A4E] leading-relaxed">
              Haz clic en el botón de WhatsApp. Se abrirá automáticamente la conversación con todos los detalles del libro ya redactados.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DAC5C2] shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-[#EADBD9] border border-[#DAC5C2] text-[#5C3218] font-brand text-xl font-bold flex items-center justify-center mb-5">
              3
            </div>
            <h3 className="font-serif-title text-lg font-bold text-[#3B2213] mb-2">
              Pago y Envío Seguro
            </h3>
            <p className="text-xs sm:text-sm text-[#6E5A4E] leading-relaxed">
              Acordamos el medio de pago que te resulte más cómodo y despachamos tu paquete protegido con seguimiento directo.
            </p>
          </div>
        </div>

        {/* Payment and Direct Details Card */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#DAC5C2] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#F0E8DD]">
            <div>
              <h4 className="font-serif-title text-base sm:text-lg font-bold text-[#3B2213] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#8C5E3C]" /> Métodos de Pago Aceptados
              </h4>
              <p className="text-xs text-[#735F52] mt-1">
                {settings.paymentMethods}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Compra 100% Protegida
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#735F52]">
            <div>
              <span className="font-semibold text-[#3B2213]">Sede y Envíos:</span> {settings.storeLocation}
            </div>
            <div>
              <span className="font-semibold text-[#3B2213]">Contacto:</span> {settings.contactEmail}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
