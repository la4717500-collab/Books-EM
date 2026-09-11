import React, { useEffect, useState, useMemo } from 'react';
import { X, MessageCircle, Heart, Share2, Star, BookText, Calendar, Building, Hash, Check, Edit3, TrendingUp, Info, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Book, CurrencyCode, StoreSettings } from '../types';
import { formatPrice, getStatusDetails, generateWhatsAppUrl, buildWhatsAppMessage, FALLBACK_BOOK_COVER } from '../utils/helpers';
import { BotanicalSprig } from './BotanicalElements';
import { BcvRates, calculateBcvBreakdown } from '../services/bcvRates';

interface BookDetailModalProps {
  book: Book | null;
  settings: StoreSettings;
  isWishlisted: boolean;
  bcvRates?: BcvRates;
  onToggleWishlist: (id: string) => void;
  onClose: () => void;
  isAdminLoggedIn?: boolean;
  onEditInAdmin?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  settings,
  isWishlisted,
  bcvRates,
  onToggleWishlist,
  onClose,
  isAdminLoggedIn,
  onEditInAdmin,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Compute image list
  const imageList = useMemo(() => {
    if (!book) return [];
    const rawList = Array.isArray(book.images) && book.images.length > 0
      ? book.images
      : (book.coverUrl ? [book.coverUrl] : []);
    const valid = rawList.filter(Boolean);
    return valid.length > 0 ? valid : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80'];
  }, [book]);

  const hasMultipleImages = imageList.length > 1;

  // Reset index when book changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsPaused(false);
  }, [book?.id]);

  // Automatic rotation every 5 seconds, paused on hover
  useEffect(() => {
    if (!hasMultipleImages || isPaused) return;

    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % imageList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [hasMultipleImages, imageList.length, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasMultipleImages) {
        setActiveImageIndex((prev) => (prev + 1) % imageList.length);
      }
      if (e.key === 'ArrowLeft' && hasMultipleImages) {
        setActiveImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
      }
    };
    if (book) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [book, onClose, hasMultipleImages, imageList.length]);

  if (!book) return null;

  const statusInfo = getStatusDetails(book.status);
  const whatsappUrl = generateWhatsAppUrl(book, settings, bcvRates);
  const rawMessage = buildWhatsAppMessage(book, settings, bcvRates);

  const currency: CurrencyCode = book.currency || 'USD';
  const priceFormatted = formatPrice(book.price, settings.currencySymbol, currency);
  const bcvBreakdown = bcvRates ? calculateBcvBreakdown(book.price, currency, bcvRates) : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${book.title} - Books EM`,
          text: `Mira este libro en Books EM: ${book.title} de ${book.author} por ${priceFormatted}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fall back to copy
      }
    }
    navigator.clipboard.writeText(`${book.title} - ${book.author} (${priceFormatted})\nSolicítalo en Books EM`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FFFFFF] rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-[#E8DFD0] shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
        id="book-detail-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-detail-modal-btn"
          className="absolute top-4 right-4 z-20 p-2 text-[#8C7464] hover:text-[#3B2213] bg-white/90 hover:bg-[#FAF7F2] rounded-full shadow-sm transition-all"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Cover Column with 5-Second Carousel & Gallery */}
          <div
            className="md:col-span-5 bg-[#FAF7F2] p-5 sm:p-7 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-[#EFE8DF] relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Main Image Display */}
            <div className="relative aspect-[3/4] w-full max-w-[260px] rounded-2xl overflow-hidden shadow-[0_14px_36px_rgba(74,44,23,0.18)] bg-[#F4EFEB]">
              {imageList.map((imgUrl, idx) => (
                <img
                  key={`${imgUrl}-${idx}`}
                  src={imgUrl}
                  alt={`${book.title} - Foto ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_BOOK_COVER;
                  }}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-600 ease-in-out ${
                    idx === activeImageIndex
                      ? 'opacity-100 scale-100 z-1'
                      : 'opacity-0 scale-95 pointer-events-none z-0'
                  }`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              ))}

              {/* Spine effect */}
              <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/35 via-black/10 to-transparent pointer-events-none z-10" />

              {/* Multi-image indicators & navigation controls */}
              {hasMultipleImages && (
                <>
                  {/* Badge: Foto X de Y */}
                  <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/55 text-white backdrop-blur-2xs shadow-xs">
                      <Images className="w-3 h-3" />
                      <span>{activeImageIndex + 1} de {imageList.length}</span>
                    </span>
                  </div>

                  {/* Left & Right Arrows */}
                  <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between z-20 pointer-events-none">
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length)}
                      aria-label="Foto previa"
                      className="pointer-events-auto p-1.5 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-xs transition-transform active:scale-90 shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % imageList.length)}
                      aria-label="Foto siguiente"
                      className="pointer-events-auto p-1.5 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-xs transition-transform active:scale-90 shadow-xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Dot Indicators */}
                  <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-20 pointer-events-none">
                    {imageList.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          dotIdx === activeImageIndex
                            ? 'w-5 bg-white shadow-xs'
                            : 'w-1.5 bg-white/50 backdrop-blur-2xs'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip (if multiple images) */}
            {hasMultipleImages && (
              <div className="mt-3.5 w-full max-w-[260px]">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#8C7464] mb-1.5 text-center">
                  Galería ({imageList.length} fotos • rotación cada 5s)
                </p>
                <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {imageList.map((thumbUrl, thumbIdx) => (
                    <button
                      key={`thumb-${thumbIdx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(thumbIdx)}
                      className={`relative w-10 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        thumbIdx === activeImageIndex
                          ? 'border-[#5C3218] ring-2 ring-[#5C3218]/20 scale-105 shadow-xs'
                          : 'border-[#E5DACB] opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={`Miniatura ${thumbIdx + 1}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_BOOK_COVER;
                        }}
                        className="w-full h-full object-cover"
                      />
                      {thumbIdx === 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-[#5C3218] rounded-bl-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability pill below cover */}
            <div className="mt-4 w-full max-w-[260px]">
              <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold ${statusInfo.badgeBg}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                <span>{statusInfo.fullDescription}</span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Featured Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C5E3C] bg-[#F7F2EA] px-2.5 py-1 rounded-md">
                    {book.genre}
                  </span>
                  <BotanicalSprig className="w-8 h-4 text-[#5C3218] opacity-60 hidden sm:block" />
                </div>

                {book.featured && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#78350F] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    Destacado
                  </span>
                )}
              </div>

              {/* Title & Author */}
              <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2D241E] leading-tight mb-1">
                {book.title}
              </h2>
              <p className="text-sm sm:text-base font-medium text-[#6B574B] mb-5">
                Por <span className="text-[#3B2213] font-semibold">{book.author}</span>
              </p>

              {/* Price Highlight with BCV Breakdown */}
              <div className="bg-[#F5ECE9] rounded-2xl p-4 sm:p-5 border border-[#DAC5C2] mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#8C7464] uppercase tracking-wider font-semibold block">
                      Precio de venta ({currency})
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#5C3218]">
                      {priceFormatted}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-[#8C7464]">
                    <span>Atención directa</span>
                    <span className="block font-medium text-[#3B2213]">Sin comisiones extra</span>
                  </div>
                </div>

                {/* BCV Conversion Section */}
                {bcvBreakdown && (
                  <div className="pt-3 border-t border-[#DAC5C2] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-[#DAC5C2]">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#8C7464] font-bold block">
                          Equivalente en Bolívares (Tasa Oficial BCV)
                        </span>
                        <span className="text-lg sm:text-xl font-mono font-extrabold text-[#2D241E]">
                          {bcvBreakdown.bolivaresFormatted}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-[#8C7464] font-bold block">
                          {currency === 'EUR' ? 'Equivalente en Dólares' : 'Equivalente en Euros'}
                        </span>
                        <span className="text-sm font-bold text-[#5C3218]">
                          {currency === 'EUR' ? bcvBreakdown.usdFormatted : bcvBreakdown.eurFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#735F52]">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{bcvBreakdown.rateAppliedText} • Banco Central de Venezuela</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-2 flex items-center gap-1.5">
                  <BookText className="w-4 h-4" /> Sinopsis
                </h4>
                <p className="text-sm text-[#4A3B32] leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-1">
                  {book.synopsis}
                </p>
              </div>

              {/* Technical Specifications */}
              {(book.editorial || book.pages || book.publishedYear || book.isbn) && (
                <div className="grid grid-cols-2 gap-2 text-xs text-[#6B574B] bg-[#FDFBF7] p-3 rounded-xl border border-[#EFE8DF] mb-6">
                  {book.editorial && (
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#8C7464]" />
                      <span>{book.editorial}</span>
                    </div>
                  )}
                  {book.pages && (
                    <div className="flex items-center gap-1.5">
                      <BookText className="w-3.5 h-3.5 text-[#8C7464]" />
                      <span>{book.pages} páginas</span>
                    </div>
                  )}
                  {book.publishedYear && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8C7464]" />
                      <span>Año: {book.publishedYear}</span>
                    </div>
                  )}
                  {book.isbn && (
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-[#8C7464]" />
                      <span>ISBN: {book.isbn}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions & WhatsApp Purchase Flow */}
            <div className="space-y-3 pt-4 border-t border-[#EFE8DF]">
              {/* Main Primary Action: WhatsApp Purchase */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="modal-whatsapp-buy-btn"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform active:scale-98"
              >
                <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                <span>
                  {book.status === 'agotado'
                    ? 'Consultar reposición por WhatsApp'
                    : book.status === 'bajo_pedido'
                    ? 'Encargar libro por WhatsApp'
                    : 'Comprar / Solicitar por WhatsApp'}
                </span>
              </a>

              {/* Message preview snippet */}
              <div className="bg-[#F8F5EE] p-2.5 rounded-lg text-[11px] text-[#6B574B] border border-[#E8DFC8]">
                <span className="font-semibold text-[#3B2213] block mb-0.5">Mensaje predeterminado que se enviará:</span>
                <p className="italic text-[#7A6658] line-clamp-2">"{rawMessage}"</p>
              </div>

              {/* Admin quick modification shortcut */}
              {isAdminLoggedIn && onEditInAdmin && (
                <button
                  type="button"
                  onClick={() => onEditInAdmin(book)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#5C3218] hover:bg-[#452410] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Modificar Publicación en Panel de Administrador</span>
                </button>
              )}

              {/* Secondary utility actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onToggleWishlist(book.id)}
                  id="modal-wishlist-toggle-btn"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-white border-[#E8DFC8] text-[#5A483E] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-[#8C7464]'}`} />
                  <span>{isWishlisted ? 'En tu lista de deseos' : 'Guardar en deseos'}</span>
                </button>

                <button
                  onClick={handleShare}
                  id="modal-share-btn"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-[#E8DFC8] text-[#5A483E] hover:bg-[#FAF7F2] transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#8C7464]" />}
                  <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
