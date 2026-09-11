import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Menu, X, Search, Download } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneNumber } from '../utils/helpers';
import { BooksEmLogo } from './BotanicalElements';
import { BcvRates } from '../services/bcvRates';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  settings: StoreSettings;
  wishlistCount: number;
  bcvRates?: BcvRates;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onScrollToCatalog: () => void;
  onScrollToHowToBuy: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenInstallPrompt?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  wishlistCount,
  onOpenWishlist,
  onOpenAdmin,
  onScrollToCatalog,
  onScrollToHowToBuy,
  searchQuery,
  onSearchChange,
  onOpenInstallPrompt,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { isInstalled } = usePWAInstall();

  // Secret Triple-click detection on the main brand logo on the left side to open Admin Panel
  const logoClicksRef = useRef<number>(0);
  const logoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBrandLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logoClicksRef.current += 1;

    if (logoTimerRef.current) {
      clearTimeout(logoTimerRef.current);
    }

    if (logoClicksRef.current >= 3) {
      logoClicksRef.current = 0;
      onOpenAdmin();
    } else {
      if (logoClicksRef.current === 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      logoTimerRef.current = setTimeout(() => {
        logoClicksRef.current = 0;
      }, 1000);
    }
  };

  const cleanPhone = cleanPhoneNumber(settings.whatsappNumber);
  const generalWhatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${settings.storeName}! Quisiera hacer una consulta sobre su catálogo de libros.`)}`
    : '#';

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#EFE8DF] shadow-[0_2px_12px_rgba(74,44,23,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-4">
          {/* Logo & Store Name on the left (Triple click opens admin panel) */}
          <div className="flex items-center">
            <button
              onClick={handleBrandLogoClick}
              className="flex items-center text-left group cursor-pointer focus:outline-none py-1 hover:opacity-95 transition-opacity"
              id="brand-logo-btn"
              title="Books EM"
            >
              <BooksEmLogo size="sm" showSubtitle={false} showSlogan={false} />
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-6">
            <div className="relative w-full">
              <input
                type="text"
                id="header-search-input"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por título, autor o género..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5ECE9] border border-[#DAC5C2] rounded-full text-sm text-[#2D241E] placeholder-[#9E8E81] focus:outline-none focus:border-[#8C5E3C] focus:bg-white focus:ring-2 focus:ring-[#8C5E3C]/15 transition-all"
              />
              <Search className="w-4 h-4 text-[#8C7464] absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#9E8E81] hover:text-[#3B2213] bg-[#E2D2D0] rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#4A3B32]">
            <button
              onClick={onScrollToCatalog}
              id="nav-catalog-btn"
              className="hover:text-[#5C3218] transition-colors cursor-pointer py-1"
            >
              Catálogo
            </button>
            <button
              onClick={onScrollToHowToBuy}
              id="nav-how-to-buy-btn"
              className="hover:text-[#5C3218] transition-colors cursor-pointer py-1"
            >
              Cómo Comprar
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              id="header-wishlist-btn"
              className="relative p-2.5 text-[#5C3218] hover:bg-[#EADBD9] rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
              title="Ver lista de deseos"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-[#C05621] text-[#C05621]' : 'text-[#6B4E3D]'}`} />
              <span className="text-xs font-semibold">{wishlistCount > 0 ? wishlistCount : ''}</span>
            </button>

            {/* Optional Install App Button (Visible only if not already installed) */}
            {!isInstalled && onOpenInstallPrompt && (
              <button
                onClick={onOpenInstallPrompt}
                id="header-install-app-btn"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5C3218] hover:text-[#3B2213] bg-[#E2D2D0] hover:bg-[#DAC5C2] rounded-full transition-all cursor-pointer shadow-2xs"
                title="Instalar aplicación en tu dispositivo"
              >
                <Download className="w-3.5 h-3.5 text-[#8C5E3C]" />
                <span>Instalar App</span>
              </button>
            )}

            {/* WhatsApp Contact Action */}
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-whatsapp-contact-btn"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Tienda</span>
            </a>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              id="mobile-search-toggle-btn"
              className="p-2 text-[#5C3218] hover:bg-[#EADBD9] rounded-lg transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenWishlist}
              id="mobile-wishlist-btn"
              className="relative p-2 text-[#5C3218] hover:bg-[#EADBD9] rounded-lg transition-colors"
              aria-label="Lista de deseos"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-[#C05621] text-[#C05621]' : 'text-[#6B4E3D]'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C05621] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="p-2 text-[#5C3218] hover:bg-[#EADBD9] rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {isSearchExpanded && (
          <div className="py-3 border-t border-[#EFE8DF] md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por libro, autor, género..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5ECE9] border border-[#DAC5C2] rounded-xl text-sm text-[#2D241E] placeholder-[#9E8E81] focus:outline-none focus:border-[#8C5E3C]"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#8C7464] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Mobile Navigation Dropdown (Without any Admin buttons) */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#DAC5C2] space-y-3">
            <button
              onClick={() => {
                onScrollToCatalog();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-[#4A3B32] hover:bg-[#EADBD9] rounded-lg"
            >
              📚 Ver Catálogo Completo
            </button>
            <button
              onClick={() => {
                onScrollToHowToBuy();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-[#4A3B32] hover:bg-[#EADBD9] rounded-lg"
            >
              🛒 ¿Cómo Comprar por WhatsApp?
            </button>
            <button
              onClick={() => {
                onOpenWishlist();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full text-left px-3 py-2 text-base font-medium text-[#4A3B32] hover:bg-[#EADBD9] rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C05621]" /> Lista de Deseos
              </span>
              <span className="text-xs bg-[#E2D2D0] px-2 py-0.5 rounded-full font-bold">
                {wishlistCount}
              </span>
            </button>

            {!isInstalled && onOpenInstallPrompt && (
              <button
                onClick={() => {
                  onOpenInstallPrompt();
                  setMobileMenuOpen(false);
                }}
                id="mobile-install-app-btn"
                className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-base font-medium text-[#5C3218] bg-[#F4EDE4] hover:bg-[#EAE0D3] rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 text-[#8C5E3C]" />
                <span>Instalar Aplicación en tu Dispositivo</span>
              </button>
            )}

            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-xl font-medium text-sm shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chatear por WhatsApp con la Librería</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
