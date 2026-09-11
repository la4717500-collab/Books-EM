import React from 'react';
import {
  BookOpen,
  MessageCircle,
  Store,
  Plus,
  Edit3,
  Star,
  Trash2,
  X,
  CheckCircle2,
  TrendingUp,
  Tags,
} from 'lucide-react';
import { Book } from '../../types';
import { formatPrice, getStatusDetails } from '../../utils/helpers';
import { BcvRates, calculateBcvBreakdown } from '../../services/bcvRates';

export type AdminTab = 'publications' | 'catalogs' | 'whatsapp' | 'store' | 'rates';
export type ViewMode = 'grid' | 'table';

interface AdminBottomDockProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  selectedBook: Book | null;
  currencySymbol: string;
  bcvRates?: BcvRates;
  totalBooksCount: number;
  catalogsCount?: number;
  onOpenAddModal: () => void;
  onEditSelected: () => void;
  onDeselect: () => void;
  onDeleteSelected: () => void;
  onToggleFeaturedSelected: () => void;
  onCycleStatusSelected: () => void;
}

export const AdminBottomDock: React.FC<AdminBottomDockProps> = ({
  activeTab,
  onTabChange,
  selectedBook,
  currencySymbol,
  bcvRates,
  totalBooksCount,
  catalogsCount = 0,
  onOpenAddModal,
  onEditSelected,
  onDeselect,
  onDeleteSelected,
  onToggleFeaturedSelected,
  onCycleStatusSelected,
}) => {
  const statusInfo = selectedBook ? getStatusDetails(selectedBook.status) : null;
  const selectedCurrency = selectedBook?.currency || 'USD';
  const selectedBcvBreakdown =
    selectedBook && bcvRates
      ? calculateBcvBreakdown(selectedBook.price, selectedCurrency, bcvRates)
      : null;

  return (
    <aside
      aria-label="Barra inferior de navegación y control de administración"
      id="admin-bottom-dock"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#8C5E3C] shadow-[0_-10px_35px_rgba(45,33,24,0.14)]"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* If a publication is selected, display immediate quick-action modification strip */}
        {selectedBook && (
          <div className="pt-2 pb-1.5 px-2 mb-1 border-b border-[#F0E8DD] bg-[#FDFBF7] rounded-xl my-1.5 border border-[#E8DFC8] animate-in slide-in-from-bottom-2 duration-150 flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Selected Book Quick Info */}
            <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
              <div className="relative w-8 h-10 rounded-md overflow-hidden bg-[#EFE8DF] shrink-0 border border-[#E5DACB]">
                <img
                  src={selectedBook.coverUrl}
                  alt={selectedBook.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 sm:flex-initial">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E3C] bg-[#F9F6F0] px-1.5 py-0.5 rounded border border-[#E8DFC8]">
                    Seleccionado
                  </span>
                  <button
                    type="button"
                    onClick={onCycleStatusSelected}
                    title="Clic para alternar estado de disponibilidad"
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-opacity hover:opacity-80 cursor-pointer ${statusInfo?.badgeBg}`}
                  >
                    {statusInfo?.label}
                  </button>
                </div>

                <h4 className="font-serif-title text-xs sm:text-sm font-bold text-[#2D241E] truncate max-w-xs">
                  {selectedBook.title}
                </h4>
                <p className="text-[11px] text-[#735F52] truncate flex items-center gap-1.5 flex-wrap">
                  <span>{selectedBook.author}</span>
                  <span>•</span>
                  <span className="font-bold text-[#5C3218]">
                    {formatPrice(selectedBook.price, currencySymbol, selectedCurrency)}
                  </span>
                  {selectedBcvBreakdown && selectedCurrency !== 'VES' && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      ≈ {selectedBcvBreakdown.bolivaresFormatted}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Direct Action Buttons for Selected Book */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onToggleFeaturedSelected}
                className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  selectedBook.featured
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-white border-[#E8DFC8] text-[#8C7464] hover:text-amber-500'
                }`}
                title={selectedBook.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
              >
                <Star className={`w-4 h-4 ${selectedBook.featured ? 'fill-amber-400' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onDeleteSelected}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                title="Eliminar publicación"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onEditSelected}
                id="dock-btn-modify"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5C3218] hover:bg-[#472611] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                title="Modificar publicación"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modificar</span>
              </button>

              <button
                type="button"
                onClick={onDeselect}
                className="p-2 text-[#8C7464] hover:text-[#3B2213] rounded-xl hover:bg-[#FAF7F2] border border-transparent hover:border-[#E5DACB] transition-colors cursor-pointer"
                title="Deseleccionar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Tabs - 4 Sections: Publicaciones, Tasas del Día, WhatsApp, Tienda */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 py-2">
          {/* Tabs Container */}
          <nav
            aria-label="Secciones del panel de administración"
            className="flex-1 grid grid-cols-5 gap-1 sm:gap-1.5"
          >
            {/* Tab 1: Publicaciones */}
            <button
              type="button"
              id="dock-tab-publications"
              onClick={() => onTabChange('publications')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2.5 rounded-xl transition-all cursor-pointer select-none ${
                activeTab === 'publications'
                  ? 'bg-[#5C3218] text-white shadow-sm ring-1 ring-[#5C3218]'
                  : 'bg-[#FAF7F2] text-[#6E5A4E] hover:bg-[#F2ECE4] border border-[#E8DFC8]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                <span
                  className={`hidden md:inline-block ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'publications'
                      ? 'bg-white/25 text-white'
                      : 'bg-[#EAE0D3] text-[#5C3218]'
                  }`}
                >
                  {totalBooksCount}
                </span>
              </div>
              <div className="text-center sm:text-left leading-tight">
                <span className="block text-[9px] sm:text-xs font-bold tracking-tight">
                  Publicaciones
                </span>
                <span className="hidden lg:block text-[9px] opacity-80">
                  {totalBooksCount} títulos
                </span>
              </div>
            </button>

            {/* Tab 2: Catálogos / Géneros */}
            <button
              type="button"
              id="dock-tab-catalogs"
              onClick={() => onTabChange('catalogs')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2.5 rounded-xl transition-all cursor-pointer select-none ${
                activeTab === 'catalogs'
                  ? 'bg-[#5C3218] text-white shadow-sm ring-1 ring-[#5C3218]'
                  : 'bg-[#FAF7F2] text-[#6E5A4E] hover:bg-[#F2ECE4] border border-[#E8DFC8]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Tags className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                {catalogsCount > 0 && (
                  <span
                    className={`hidden md:inline-block ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      activeTab === 'catalogs'
                        ? 'bg-white/25 text-white'
                        : 'bg-[#EAE0D3] text-[#5C3218]'
                    }`}
                  >
                    {catalogsCount}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left leading-tight">
                <span className="block text-[9px] sm:text-xs font-bold tracking-tight">
                  Catálogos
                </span>
                <span className="hidden lg:block text-[9px] opacity-80">
                  Explorar género
                </span>
              </div>
            </button>

            {/* Tab 3: Tasas del Día (BCV) */}
            <button
              type="button"
              id="dock-tab-rates"
              onClick={() => onTabChange('rates')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2.5 rounded-xl transition-all cursor-pointer select-none ${
                activeTab === 'rates'
                  ? 'bg-[#5C3218] text-white shadow-sm ring-1 ring-[#5C3218]'
                  : 'bg-[#FAF7F2] text-[#6E5A4E] hover:bg-[#F2ECE4] border border-[#E8DFC8]'
              }`}
            >
              <div className="flex items-center justify-center">
                <TrendingUp
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${
                    activeTab === 'rates' ? 'text-emerald-300' : 'text-emerald-600'
                  }`}
                />
              </div>
              <div className="text-center sm:text-left leading-tight">
                <span className="block text-[9px] sm:text-xs font-bold tracking-tight">
                  Tasas del Día
                </span>
                <span className="hidden lg:block text-[9px] opacity-80">
                  Monitor BCV
                </span>
              </div>
            </button>

            {/* Tab 3: WhatsApp */}
            <button
              type="button"
              id="dock-tab-whatsapp"
              onClick={() => onTabChange('whatsapp')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer select-none ${
                activeTab === 'whatsapp'
                  ? 'bg-[#128C7E] text-white shadow-sm ring-1 ring-[#128C7E]'
                  : 'bg-[#FAF7F2] text-[#6E5A4E] hover:bg-[#F2ECE4] border border-[#E8DFC8]'
              }`}
            >
              <div className="flex items-center justify-center">
                <MessageCircle
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${
                    activeTab === 'whatsapp' ? 'fill-white' : 'text-[#25D366]'
                  }`}
                />
              </div>
              <div className="text-center sm:text-left leading-tight">
                <span className="block text-[10px] sm:text-xs font-bold tracking-tight">
                  WhatsApp
                </span>
                <span className="hidden lg:block text-[9px] opacity-80">
                  Pedidos & Chat
                </span>
              </div>
            </button>

            {/* Tab 4: Tienda */}
            <button
              type="button"
              id="dock-tab-store"
              onClick={() => onTabChange('store')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer select-none ${
                activeTab === 'store'
                  ? 'bg-[#5C3218] text-white shadow-sm ring-1 ring-[#5C3218]'
                  : 'bg-[#FAF7F2] text-[#6E5A4E] hover:bg-[#F2ECE4] border border-[#E8DFC8]'
              }`}
            >
              <div className="flex items-center justify-center">
                <Store className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
              </div>
              <div className="text-center sm:text-left leading-tight">
                <span className="block text-[10px] sm:text-xs font-bold tracking-tight">
                  Tienda
                </span>
                <span className="hidden lg:block text-[9px] opacity-80">
                  Ajustes & Pagos
                </span>
              </div>
            </button>
          </nav>

          {/* Quick Action: New Publication Button */}
          <div className="hidden sm:flex items-center pl-2">
            <button
              type="button"
              onClick={onOpenAddModal}
              id="dock-btn-new-publication"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              title="Crear nueva publicación en el catálogo"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Nueva</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
