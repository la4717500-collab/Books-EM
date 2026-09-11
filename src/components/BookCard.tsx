import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Star, Edit2, TrendingUp, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Book, CurrencyCode, StoreSettings } from '../types';
import { formatPrice, getStatusDetails, generateWhatsAppUrl, FALLBACK_BOOK_COVER } from '../utils/helpers';
import { BotanicalSprig } from './BotanicalElements';
import { BcvRates, calculateBcvBreakdown } from '../services/bcvRates';

interface BookCardProps {
  book: Book;
  settings: StoreSettings;
  isWishlisted: boolean;
  bcvRates?: BcvRates;
  onToggleWishlist: (id: string) => void;
  onSelectBook: (book: Book) => void;
  isAdminLoggedIn?: boolean;
  onEditBook?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  settings,
  isWishlisted,
  bcvRates,
  onToggleWishlist,
  onSelectBook,
  isAdminLoggedIn = false,
  onEditBook,
}) => {
  const statusInfo = getStatusDetails(book.status);
  const whatsappUrl = generateWhatsAppUrl(book, settings, bcvRates);

  const currency: CurrencyCode = book.currency || 'USD';
  const priceDisplay = formatPrice(book.price, settings.currencySymbol, currency);
  const bcvBreakdown = bcvRates ? calculateBcvBreakdown(book.price, currency, bcvRates) : null;

  // Multi-image list setup
  const imageList = React.useMemo(() => {
    const rawList = Array.isArray(book.images) && book.images.length > 0
      ? book.images
      : (book.coverUrl ? [book.coverUrl] : []);
    const valid = rawList.filter(Boolean);
    return valid.length > 0 ? valid : [FALLBACK_BOOK_COVER];
  }, [book.images, book.coverUrl]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const hasMultipleImages = imageList.length > 1;

  // Rotate images every 5 seconds, paused when hovering to avoid jumping while reading
  useEffect(() => {
    if (!hasMultipleImages || isHovered) return;

    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % imageList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [hasMultipleImages, imageList.length, isHovered]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % imageList.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(book.id);
  };

  return (
    <div
      id={`book-card-${book.id}`}
      onClick={() => onSelectBook(book)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#FFFFFF] rounded-2xl border border-[#EAE2D5] hover:border-[#8C5E3C]/60 shadow-[0_2px_8px_rgba(74,44,23,0.04)] hover:shadow-[0_10px_26px_rgba(74,44,23,0.10)] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer transform hover:-translate-y-1"
    >
      {/* Cover Image Container with 5-Second Carousel */}
      <div className="relative aspect-[3/4] w-full bg-[#F4EFEB] overflow-hidden">
        {/* Layered images for silky smooth crossfade */}
        {imageList.map((imgUrl, idx) => (
          <img
            key={`${imgUrl}-${idx}`}
            src={imgUrl}
            alt={`Foto ${idx + 1} de ${book.title}`}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_BOOK_COVER;
            }}
            className={`absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-in-out ${
              idx === activeImageIndex
                ? 'opacity-100 scale-100 z-1'
                : 'opacity-0 scale-98 pointer-events-none z-0'
            }`}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        ))}

        {/* Book spine overlay shadow effect for realistic book appearance */}
        <div className="absolute inset-y-0 left-0 w-2.5 sm:w-3 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none z-10" />

        {/* Multi-image indicators (dots) and photo counter */}
        {hasMultipleImages && (
          <>
            {/* Bottom dots indicator */}
            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-20 pointer-events-none">
              {imageList.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === activeImageIndex
                      ? 'w-4 bg-white shadow-xs'
                      : 'w-1.5 bg-white/50 backdrop-blur-2xs'
                  }`}
                />
              ))}
            </div>

            {/* Subtle photo count pill in bottom-left */}
            <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/40 text-white backdrop-blur-2xs shadow-2xs">
                <Images className="w-2.5 h-2.5" />
                <span>{activeImageIndex + 1}/{imageList.length}</span>
              </span>
            </div>

            {/* Hover manual navigation arrows */}
            <div className="absolute inset-y-0 inset-x-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-25 pointer-events-none">
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Foto anterior"
                className="pointer-events-auto w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Foto siguiente"
                className="pointer-events-auto w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 shadow-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* Top Badges & Actions Overlay */}
        <div className="absolute top-2 inset-x-2 sm:top-2.5 sm:inset-x-2.5 flex items-start justify-between gap-1 pointer-events-none z-20">
          <div className="flex flex-col gap-1 pointer-events-auto">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-semibold tracking-wide border shadow-2xs ${statusInfo.badgeBg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
              <span className="truncate max-w-[80px] sm:max-w-none">{statusInfo.tagText}</span>
            </span>

            {/* Featured Badge */}
            {book.featured && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-[#5C3218] text-[#FDFBF7] shadow-2xs">
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                <span className="hidden sm:inline">Destacado</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Admin Quick Edit Button */}
            {isAdminLoggedIn && onEditBook && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBook(book);
                }}
                aria-label="Modificar publicación"
                title="Modificar publicación (Admin)"
                className="pointer-events-auto p-1.5 sm:p-2 rounded-full bg-[#5C3218] hover:bg-[#472611] text-white shadow-sm hover:shadow transition-transform active:scale-90"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              aria-label={isWishlisted ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              className="pointer-events-auto p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-[#5C3218] shadow-sm hover:shadow transition-transform active:scale-90"
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                  isWishlisted ? 'fill-[#C05621] text-[#C05621]' : 'text-[#6B4E3D]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Quick View Hover Peek Overlay on desktop */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center pointer-events-none z-15">
          <span className="inline-flex items-center gap-1.5 bg-white/95 text-[#3B2213] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
            <Eye className="w-3.5 h-3.5" />
            Ver detalles
          </span>
        </div>
      </div>

      {/* Book Metadata & Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between relative">
        {/* Subtle decorative leaf background watermark on hover */}
        <div className="absolute bottom-1 right-1 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity">
          <BotanicalSprig className="w-16 h-6 text-[#5C3218]" />
        </div>

        <div>
          {/* Genre Tag */}
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8C7464] block mb-1 truncate">
            {book.genre}
          </span>

          {/* Title */}
          <h3 className="font-serif-title text-sm sm:text-base md:text-lg font-bold text-[#2C2420] leading-snug line-clamp-2 group-hover:text-[#5C3218] transition-colors mb-1">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs sm:text-sm text-[#6E5A4E] line-clamp-1 mb-2">
            {book.author}
          </p>

          {/* Synopsis Short Snip (hidden on smallest screens to keep 2-by-2 neat) */}
          <p className="text-xs text-[#827164] line-clamp-2 leading-relaxed mb-3 hidden sm:block">
            {book.synopsis}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="pt-2 sm:pt-3 border-t border-[#F2ECE4]">
          <div className="mb-2 sm:mb-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8C7464] font-medium">
                Precio
              </span>
              <span className="text-sm sm:text-base md:text-lg font-extrabold text-[#5C3218]">
                {priceDisplay}
              </span>
            </div>

            {/* Official BCV Rate Conversion Subtitle */}
            {bcvBreakdown && currency !== 'VES' && (
              <div className="flex items-center justify-between text-[11px] mt-0.5">
                <span className="text-[#8C5E3C] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="truncate">≈ {bcvBreakdown.bolivaresFormatted}</span>
                </span>
                <span className="text-[10px] text-[#8C7464] bg-[#F7F2EA] px-1.5 py-0.5 rounded font-medium">
                  Tasa BCV
                </span>
              </div>
            )}
            {bcvBreakdown && currency === 'VES' && (
              <div className="flex items-center justify-between text-[11px] mt-0.5 text-[#8C7464]">
                <span>≈ {bcvBreakdown.usdFormatted}</span>
                <span className="text-[10px] bg-[#F7F2EA] px-1.5 py-0.5 rounded">BCV Ref</span>
              </div>
            )}
          </div>

          {/* Action Button: WhatsApp */}
          <div className="grid grid-cols-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              id={`buy-whatsapp-btn-${book.id}`}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white py-2 sm:py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold tracking-wide shadow-xs hover:shadow transition-all cursor-pointer transform active:scale-98"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
              <span className="truncate">
                {book.status === 'agotado'
                  ? 'Consultar'
                  : book.status === 'bajo_pedido'
                  ? 'Encargar'
                  : 'Comprar WhatsApp'}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
