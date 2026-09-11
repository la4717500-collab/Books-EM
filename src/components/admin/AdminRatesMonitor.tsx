import React, { useState } from 'react';
import {
  TrendingUp,
  RefreshCw,
  DollarSign,
  Euro,
  ExternalLink,
  Calculator,
  CheckCircle2,
  Copy,
  AlertCircle,
  SlidersHorizontal,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BcvRates, formatCurrencyAmount, convertCurrency } from '../../services/bcvRates';
import { Book } from '../../types';

interface AdminRatesMonitorProps {
  bcvRates: BcvRates;
  books: Book[];
  onRefreshRates: () => Promise<void | BcvRates>;
  onUpdateRates: (rates: BcvRates) => void;
}

export const AdminRatesMonitor: React.FC<AdminRatesMonitorProps> = ({
  bcvRates,
  books,
  onRefreshRates,
  onUpdateRates,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Quick calculator state
  const [calcAmount, setCalcAmount] = useState<number>(20);
  const [calcCurrency, setCalcCurrency] = useState<'USD' | 'EUR' | 'VES'>('USD');

  // Manual override state
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [manualUsd, setManualUsd] = useState<number>(bcvRates.usd);
  const [manualEur, setManualEur] = useState<number>(bcvRates.eur);

  // Handle live refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFeedbackMessage(null);
    try {
      await onRefreshRates();
      setFeedbackMessage('¡Tasas del BCV sincronizadas exitosamente con la API oficial!');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (e) {
      console.error(e);
      setFeedbackMessage('No se pudo conectar con el servidor BCV en este momento. Se mantienen las tasas en caché.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle manual rate override
  const handleSaveManualRates = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUsd <= 0 || manualEur <= 0) return;

    const customRates: BcvRates = {
      ...bcvRates,
      usd: Number(manualUsd),
      eur: Number(manualEur),
      lastUpdated: `${new Date().toLocaleDateString('es-VE')} (Ajuste Manual)`,
      lastFetchedTimestamp: Date.now(),
      isLive: false,
      source: 'Fijada manualmente por Administrador',
    };
    onUpdateRates(customRates);
    setFeedbackMessage('Tasas personalizadas aplicadas correctamente a la tienda.');
    setShowManualOverride(false);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Calculation results
  const calculatedInVes = convertCurrency(calcAmount, calcCurrency, 'VES', bcvRates);
  const calculatedInUsd = convertCurrency(calcAmount, calcCurrency, 'USD', bcvRates);
  const calculatedInEur = convertCurrency(calcAmount, calcCurrency, 'EUR', bcvRates);

  // Copy quick quote to clipboard for WhatsApp
  const handleCopyQuote = () => {
    let quoteText = '';
    if (calcCurrency === 'USD') {
      quoteText = `📚 Cotización Books EM:\n• Monto: $${calcAmount.toFixed(2)}\n• En Bolívares (Tasa Oficial BCV): Bs. ${formatCurrencyAmount(calculatedInVes, 'VES', false)}\n• Tasa del día BCV: Bs. ${formatCurrencyAmount(bcvRates.usd, 'VES', false)} / USD\n¡A la orden para confirmar tu pedido!`;
    } else if (calcCurrency === 'EUR') {
      quoteText = `📚 Cotización Books EM:\n• Monto: €${calcAmount.toFixed(2)}\n• En Bolívares (Tasa Oficial BCV): Bs. ${formatCurrencyAmount(calculatedInVes, 'VES', false)}\n• Tasa del día BCV: Bs. ${formatCurrencyAmount(bcvRates.eur, 'VES', false)} / EUR\n¡A la orden para confirmar tu pedido!`;
    } else {
      quoteText = `📚 Cotización Books EM:\n• Monto: Bs. ${formatCurrencyAmount(calcAmount, 'VES', false)}\n• Equivalente en Dólares (BCV): $${calculatedInUsd.toFixed(2)}\n• Equivalente en Euros (BCV): €${calculatedInEur.toFixed(2)}\n• Tasa oficial del día: Bs. ${formatCurrencyAmount(bcvRates.usd, 'VES', false)} / USD`;
    }

    navigator.clipboard.writeText(quoteText);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  // Catalog financial metrics with current rates
  const totalInventoryUsd = books.reduce((acc, book) => {
    const cur = book.currency || 'USD';
    const inUsd = convertCurrency(book.price, cur, 'USD', bcvRates);
    return acc + inUsd;
  }, 0);

  const totalInventoryVes = convertCurrency(totalInventoryUsd, 'USD', 'VES', bcvRates);

  return (
    <div id="admin-rates-monitor-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Banner / Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFD0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5C3218]/10 text-[#5C3218] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-[#5C3218]" />
            </div>
            <div>
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-[#3B2213]">
                Monitor de Tasas del Día (BCV)
              </h2>
              <p className="text-xs text-[#735F52]">
                Supervisión y control de cotizaciones oficiales del Banco Central de Venezuela
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            id="admin-btn-refresh-rates"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Consultar y actualizar tasas en vivo desde el Banco Central"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Actualizando...' : 'Actualizar Tasas en Vivo'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowManualOverride(!showManualOverride)}
            id="admin-btn-manual-override-rates"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#5C3218] border border-[#E8DFC8] rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Ajustar o fijar tasas manualmente"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showManualOverride ? 'Ocultar Ajuste' : 'Ajuste Manual'}</span>
          </button>

          <a
            href="https://www.bcv.org.ve"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs text-[#8C7464] hover:text-[#3B2213] transition-colors"
            title="Ver portal oficial del Banco Central de Venezuela"
          >
            <span>Sitio Oficial BCV</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Manual Override Form (Collapsible) */}
      {showManualOverride && (
        <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-3xl border border-[#E8DFC8] space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-[#5C3218]">
            <SlidersHorizontal className="w-4 h-4" />
            <h3 className="text-sm font-bold">Fijar Tasa Personalizada (Modo Manual)</h3>
          </div>
          <p className="text-xs text-[#735F52]">
            Utiliza esta opción si necesitas fijar una tasa especial en días festivos, feriados bancarios o por disposición interna.
          </p>

          <form onSubmit={handleSaveManualRates} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                Tasa Dólar (USD en Bs.) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={manualUsd}
                onChange={(e) => setManualUsd(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#E5DACB] rounded-xl text-sm font-bold text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                Tasa Euro (EUR en Bs.) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={manualEur}
                onChange={(e) => setManualEur(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#E5DACB] rounded-xl text-sm font-bold text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#5C3218] hover:bg-[#452410] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Aplicar Tasa
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3 py-2 bg-white hover:bg-[#EFE8DF] border border-[#E8DFC8] text-[#5C3218] rounded-xl text-xs font-semibold cursor-pointer"
                title="Restablecer a tasa automática oficial"
              >
                Restablecer BCV
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Monitoring Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Official USD BCV */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD0] shadow-xs relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#2D241E] uppercase tracking-wider block">
                  Dólar Oficial BCV
                </span>
                <span className="text-[10px] text-[#8C7464]">USD / VES</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {bcvRates.isLive ? 'API Oficial' : 'Sincronizado'}
            </span>
          </div>

          <div className="pt-2">
            <span className="text-xs text-[#8C7464] block">Cotización por 1 USD:</span>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-[#2D241E] tracking-tight mt-0.5">
              Bs. {formatCurrencyAmount(bcvRates.usd, 'VES', false)}
            </div>
          </div>

          <div className="pt-2 border-t border-[#F2ECE4] text-[11px] text-[#735F52] flex items-center justify-between">
            <span>Fecha de corte oficial:</span>
            <span className="font-semibold text-[#3B2213]">{bcvRates.lastUpdated}</span>
          </div>
        </div>

        {/* Card 2: Official EUR BCV */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD0] shadow-xs relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Euro className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#2D241E] uppercase tracking-wider block">
                  Euro Oficial BCV
                </span>
                <span className="text-[10px] text-[#8C7464]">EUR / VES</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {bcvRates.isLive ? 'API Oficial' : 'Sincronizado'}
            </span>
          </div>

          <div className="pt-2">
            <span className="text-xs text-[#8C7464] block">Cotización por 1 EUR:</span>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-[#2D241E] tracking-tight mt-0.5">
              Bs. {formatCurrencyAmount(bcvRates.eur, 'VES', false)}
            </div>
          </div>

          <div className="pt-2 border-t border-[#F2ECE4] text-[11px] text-[#735F52] flex items-center justify-between">
            <span>Fecha de corte oficial:</span>
            <span className="font-semibold text-[#3B2213]">{bcvRates.lastUpdated}</span>
          </div>
        </div>

        {/* Card 3: Cross Ratio & Source */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD0] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2D241E] uppercase tracking-wider block">
                Relación EUR / USD
              </span>
              <span className="text-[10px] text-[#8C7464]">Arbitraje oficial BCV</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs text-[#8C7464] block">Valor cruzado oficial:</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#5C3218] tracking-tight mt-0.5">
              1 EUR = {(bcvRates.usd > 0 ? bcvRates.eur / bcvRates.usd : 1).toFixed(4)} USD
            </div>
          </div>

          <div className="pt-2 border-t border-[#F2ECE4] text-[11px] text-[#735F52]">
            <p className="line-clamp-2">
              Fuente certificada: <strong>{bcvRates.source}</strong>. Aplicada en el catálogo y WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Utility: Live Quick Calculator + Catalog Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Calculator for WhatsApp & Sales (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8DFD0] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E8DD]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#5C3218] border border-[#E8DFC8] flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-brand text-base font-bold text-[#3B2213]">
                  Calculadora y Cotizador Rápido
                </h3>
                <span className="text-[11px] text-[#8C7464]">
                  Cotiza montos al instante para responder consultas de clientes
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyQuote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#5C3218] border border-[#E8DFC8] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Copiar texto formateado para enviar por WhatsApp"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedQuote ? '¡Copiado!' : 'Copiar Cotización'}</span>
            </button>
          </div>

          {/* Calculator Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Monto a convertir
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-base font-bold text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Moneda Origen
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF7F2] rounded-xl border border-[#E5DACB]">
                  {(['USD', 'EUR', 'VES'] as const).map((cur) => (
                    <button
                      type="button"
                      key={cur}
                      onClick={() => setCalcCurrency(cur)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        calcCurrency === cur
                          ? 'bg-[#5C3218] text-white shadow-xs'
                          : 'text-[#6E5A4E] hover:bg-[#EFE8DF]'
                      }`}
                    >
                      {cur === 'USD' ? '$' : cur === 'EUR' ? '€' : 'Bs.'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Deltas */}
            <div className="flex flex-wrap gap-1.5">
              {[5, 10, 15, 20, 30, 50, 100].map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setCalcAmount(v)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    calcAmount === v
                      ? 'bg-[#5C3218] text-white border-[#5C3218]'
                      : 'bg-[#FAF7F2] text-[#6E5A4E] hover:bg-[#F2ECE4] border-[#E8DFC8]'
                  }`}
                >
                  {calcCurrency === 'VES' ? `${v * 100} Bs.` : `$${v}`}
                </button>
              ))}
            </div>

            {/* Converted Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC8]">
              {/* Result in Bolívares */}
              <div className="p-3 bg-white rounded-xl border border-[#EAE1D4] shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7464] block">
                  En Bolívares (VES)
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-[#2D241E] block mt-0.5">
                  Bs. {formatCurrencyAmount(calculatedInVes, 'VES', false)}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Tasa oficial BCV</span>
              </div>

              {/* Result in Dollars */}
              <div className="p-3 bg-white rounded-xl border border-[#EAE1D4] shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7464] block">
                  En Dólares (USD)
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-[#2D241E] block mt-0.5">
                  ${calculatedInUsd.toFixed(2)}
                </span>
                <span className="text-[10px] text-[#8C7464]">Referencial</span>
              </div>

              {/* Result in Euros */}
              <div className="p-3 bg-white rounded-xl border border-[#EAE1D4] shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7464] block">
                  En Euros (EUR)
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-[#2D241E] block mt-0.5">
                  €{calculatedInEur.toFixed(2)}
                </span>
                <span className="text-[10px] text-[#8C7464]">Referencial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Catalog Financial Impact & Compliance (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8DFD0] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#F0E8DD]">
              <Layers className="w-5 h-5 text-[#5C3218]" />
              <h3 className="font-brand text-base font-bold text-[#3B2213]">
                Impacto en el Inventario
              </h3>
            </div>

            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8]">
                <span className="text-xs text-[#735F52]">Títulos en Catálogo:</span>
                <span className="text-sm font-bold text-[#3B2213]">{books.length} publicaciones</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8]">
                <span className="text-xs text-[#735F52]">Valor Total Estimado (USD):</span>
                <span className="text-sm font-mono font-bold text-[#3B2213]">
                  ${totalInventoryUsd.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900">Total en Bolívares (BCV):</span>
                <span className="text-sm font-mono font-bold text-emerald-800">
                  Bs. {formatCurrencyAmount(totalInventoryVes, 'VES', false)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8DFC8] space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#8C5E3C] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#735F52] leading-relaxed">
                <strong className="text-[#5C3218]">Cumplimiento Normativo BCV:</strong> Los precios de cada libro muestran su conversión automática en Bolívares al tipo de cambio oficial del día, garantizando transparencia en pagos por Pago Móvil y transferencias bancarias.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
