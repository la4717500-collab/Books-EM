import React, { useEffect } from 'react';
import { X, Heart, Trash2, MessageCircle } from 'lucide-react';
import { Book, StoreSettings } from '../types';
import { formatPrice, generateWishlistWhatsAppUrl, getStatusDetails, FALLBACK_BOOK_COVER } from '../utils/helpers';
import { BcvRates, calculateBcvBreakdown, convertCurrency, formatCurrencyAmount } from '../services/bcvRates';

interface WishlistModalProps {
  isOpen: boolean;
  wishlistIds: string[];
  allBooks: Book[];
  settings: StoreSettings;
  bcvRates?: BcvRates;
  onClose: () => void;
  onRemoveFromWishlist: (id: string) => void;
  onSelectBook: (book: Book) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  wishlistIds,
  allBooks,
  settings,
  bcvRates,
  onClose,
  onRemoveFromWishlist,
  onSelectBook,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKey);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const savedBooks = allBooks.filter((b) => wishlistIds.includes(b.id));
  const totalPrice = savedBooks.reduce((sum, b) => sum + b.price, 0);

  // Total in Bolívares using BCV
  let totalInBs = 0;
  if (bcvRates) {
    totalInBs = savedBooks.reduce((sum, b) => {
      const cur = b.currency || 'USD';
      return sum + convertCurrency(b.price, cur, 'VES', bcvRates);
    }, 0);
  }

  const whatsappUrl = generateWishlistWhatsAppUrl(savedBooks, settings, bcvRates);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FFFFFF] rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[85vh] overflow-hidden border border-[#E8DFD0] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="wishlist-modal"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#DAC5C2] flex items-center justify-between bg-[#EADBD9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="font-serif-title text-xl font-bold text-[#3B2213]">
                Tu Lista de Deseos
              </h3>
              <p className="text-xs text-[#8C7464]">
                {savedBooks.length} {savedBooks.length === 1 ? 'libro guardado' : 'libros guardados'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C7464] hover:text-[#3B2213] rounded-full hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal List Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3 divide-y divide-[#F2ECE4]">
          {savedBooks.length > 0 ? (
            savedBooks.map((book) => {
              const status = getStatusDetails(book.status);
              return (
                <div
                  key={book.id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-4 group"
                >
                  <div
                    onClick={() => {
                      onClose();
                      onSelectBook(book);
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_BOOK_COVER;
                      }}
                      className="w-12 h-16 object-cover rounded-md shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif-title text-sm font-bold text-[#2D241E] truncate group-hover:text-[#5C3218]">
                        {book.title}
                      </h4>
                      <p className="text-xs text-[#735F52] truncate">{book.author}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-bold text-[#5C3218]">
                          {formatPrice(book.price, settings.currencySymbol, book.currency || 'USD')}
                        </span>
                        {bcvRates && (book.currency || 'USD') !== 'VES' && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ≈ {calculateBcvBreakdown(book.price, book.currency || 'USD', bcvRates).bolivaresFormatted}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${status.badgeBg}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromWishlist(book.id)}
                    className="p-2 text-[#A89484] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar de la lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <Heart className="w-12 h-12 text-[#D4C3B3] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#5A483E]">Tu lista de deseos está vacía</p>
              <p className="text-xs text-[#8C7464] mt-1">
                Explora el catálogo y presiona el ícono de corazón para guardar tus lecturas preferidas.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {savedBooks.length > 0 && (
          <div className="p-5 sm:p-6 bg-[#EADBD9] border-t border-[#DAC5C2] space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold text-[#735F52] uppercase tracking-wider block">
                  Total Estimado
                </span>
                {totalInBs > 0 && (
                  <span className="text-xs text-emerald-700 font-semibold">
                    ≈ Bs. {formatCurrencyAmount(totalInBs, 'VES', false)} (Tasa BCV)
                  </span>
                )}
              </div>
              <span className="text-2xl font-extrabold text-[#5C3218]">
                {formatPrice(totalPrice, settings.currencySymbol)}
              </span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="wishlist-whatsapp-bulk-btn"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span>Solicitar todos los libros por WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
