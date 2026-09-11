import React from 'react';
import { Edit3, Star, Trash2, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Book, BookStatus, CurrencyCode } from '../../types';
import { formatPrice, getStatusDetails } from '../../utils/helpers';
import { BcvRates, calculateBcvBreakdown } from '../../services/bcvRates';

interface PublicationCardProps {
  book: Book;
  isSelected: boolean;
  currencySymbol: string;
  bcvRates?: BcvRates;
  onSelect: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onToggleFeatured: (id: string) => void;
  onUpdateStatus: (id: string, status: BookStatus) => void;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({
  book,
  isSelected,
  currencySymbol,
  bcvRates,
  onSelect,
  onEdit,
  onDelete,
  onToggleFeatured,
  onUpdateStatus,
}) => {
  const statusInfo = getStatusDetails(book.status);
  const currency: CurrencyCode = book.currency || 'USD';
  const priceDisplay = formatPrice(book.price, currencySymbol, currency);
  const bcvBreakdown = bcvRates ? calculateBcvBreakdown(book.price, currency, bcvRates) : null;

  // Status cycling for one-click quick correction
  const handleCycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sequence: BookStatus[] = ['disponible', 'bajo_pedido', 'agotado'];
    const nextIndex = (sequence.indexOf(book.status) + 1) % sequence.length;
    onUpdateStatus(book.id, sequence[nextIndex]);
  };

  return (
    <div
      onClick={() => onSelect(book)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        isSelected
          ? 'border-[#8C5E3C] ring-3 ring-[#8C5E3C]/25 shadow-lg bg-[#FDFBF7] -translate-y-1'
          : 'border-[#EAE1D4] hover:border-[#D4C3B3] hover:shadow-md hover:-translate-y-0.5'
      }`}
      id={`publication-card-${book.id}`}
    >
      {/* Top Selection Ribbon / Indicator */}
      {isSelected && (
        <div className="bg-[#5C3218] text-[#FDFBF7] text-[11px] font-bold py-1 px-3 flex items-center justify-between tracking-wide animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Publicación Seleccionada
          </span>
          <span className="text-[10px] text-[#E2D2C0] font-normal">
            Clic en «Modificar» para editar
          </span>
        </div>
      )}

      {/* Main Publication Layout */}
      <div className="p-4 flex gap-4 flex-1">
        {/* Cover Thumbnail */}
        <div className="relative w-24 sm:w-28 shrink-0 aspect-[2/3] rounded-xl overflow-hidden bg-[#EFE8DF] shadow-xs border border-[#E8DFD0]">
          <img
            src={book.coverUrl}
            alt={book.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Quick Featured Badge */}
          {book.featured && (
            <div className="absolute top-1.5 left-1.5 bg-amber-400 text-amber-950 p-1 rounded-md shadow-xs" title="Publicación Destacada">
              <Star className="w-3 h-3 fill-amber-950" />
            </div>
          )}
        </div>

        {/* Publication Information */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Genre and Status Row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#6B5547] border border-[#E8DFC8]">
                {book.genre}
              </span>

              {/* Status Pill with direct cycle click */}
              <button
                type="button"
                onClick={handleCycleStatus}
                title="Clic para cambiar estado de disponibilidad"
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors flex items-center gap-1 ${statusInfo.badgeBg} hover:opacity-85`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                <span>{statusInfo.label}</span>
              </button>
            </div>

            {/* Title & Author */}
            <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#2D241E] leading-snug line-clamp-2">
              {book.title}
            </h3>
            <p className="text-xs text-[#735F52] mt-0.5 font-medium line-clamp-1">
              {book.author}
            </p>

            {/* Brief synopsis preview */}
            <p className="text-[11px] text-[#8C7464] mt-2 line-clamp-2 leading-relaxed">
              {book.synopsis}
            </p>
          </div>

          {/* Price & Primary Modification Actions */}
          <div className="pt-3 mt-2 border-t border-[#F2ECE4] flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-brand font-bold text-base sm:text-lg text-[#5C3218]">
                  {priceDisplay}
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#8C5E3C] border border-[#E8DFC8]">
                  {currency}
                </span>
              </div>
              {bcvBreakdown && currency !== 'VES' && (
                <div className="flex items-center gap-1 text-[11px] text-[#735F52] font-medium mt-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span>≈ {bcvBreakdown.bolivaresFormatted}</span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {/* Toggle Featured */}
              <button
                type="button"
                onClick={() => onToggleFeatured(book.id)}
                title={book.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                className={`p-2 rounded-xl border transition-colors ${
                  book.featured
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-white border-[#E8DFC8] text-[#A89484] hover:text-amber-500'
                }`}
              >
                <Star className={`w-4 h-4 ${book.featured ? 'fill-amber-400' : ''}`} />
              </button>

              {/* Edit / Modify button */}
              <button
                type="button"
                onClick={() => onEdit(book)}
                id={`btn-edit-${book.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5C3218] hover:bg-[#472611] text-white text-xs font-bold shadow-xs transition-colors"
                title="Modificar publicación"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modificar</span>
              </button>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => onDelete(book)}
                className="p-2 rounded-xl text-[#A89484] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                title="Eliminar publicación"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
