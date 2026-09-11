/**
 * Books EM - Librería y Tienda de Libros Online
 * Complete, responsive, client-side store with WhatsApp checkout and private Admin panel.
 */

import React, { useState } from 'react';
import { useBooksStore } from './hooks/useBooksStore';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { BookCatalog } from './components/BookCatalog';
import { HowToBuySection } from './components/HowToBuySection';
import { Footer } from './components/Footer';
import { BookDetailModal } from './components/BookDetailModal';
import { WishlistModal } from './components/WishlistModal';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { AppIntroSplash } from './components/AppIntroSplash';
import { MessageCircle, Loader2 } from 'lucide-react';
import { cleanPhoneNumber } from './utils/helpers';
import { Book } from './types';

// Code-splitting: Only load the heavy admin panel bundle when admin logs in
const AdminPanel = React.lazy(() =>
  import('./components/admin/AdminPanel').then((module) => ({
    default: module.AdminPanel,
  }))
);

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isIntroExiting, setIsIntroExiting] = useState(false);
  const {
    books,
    settings,
    bcvRates,
    wishlistIds,
    isAdminOpen,
    isAdminLoggedIn,
    selectedBook,
    isWishlistOpen,
    setIsAdminOpen,
    setSelectedBook,
    setIsWishlistOpen,
    addBook,
    updateBook,
    deleteBook,
    toggleFeatured,
    updateBookStatus,
    updateSettings,
    resetToDefaults,
    importCatalog,
    toggleWishlist,
    refreshBcvRates,
    updateBcvRates,
    catalogs,
    addCatalog,
    updateCatalog,
    deleteCatalog,
    reorderCatalogs,
    resetCatalogs,
    loginAdmin,
    logoutAdmin,
  } = useBooksStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [directEditBook, setDirectEditBook] = useState<Book | null>(null);
  const [manualInstallTrigger, setManualInstallTrigger] = useState(false);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowToBuy = () => {
    const el = document.getElementById('how-to-buy-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const availableBooksCount = books.filter((b) => b.status === 'disponible').length;
  const cleanPhone = cleanPhoneNumber(settings.whatsappNumber);
  const floatingWhatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `¡Hola ${settings.storeName}! 👋 Tengo una consulta sobre su catálogo de libros.`
      )}`
    : '#';

  // Dedicated Fullscreen Admin Login Page (If Admin opened but not authenticated)
  if (isAdminOpen && !isAdminLoggedIn) {
    return (
      <AdminLoginView
        onLogin={loginAdmin}
        onBackToStore={() => setIsAdminOpen(false)}
        storeName={settings.storeName}
      />
    );
  }

  // Dedicated Fullscreen Admin Page (When Admin is logged in and unlocked)
  if (isAdminOpen && isAdminLoggedIn) {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#EADBD9] flex flex-col items-center justify-center gap-3 text-[#5C3218]">
            <Loader2 className="w-8 h-8 animate-spin text-[#8C5E3C]" />
            <p className="font-serif-title text-base font-bold">Cargando Panel de Administración...</p>
          </div>
        }
      >
        <AdminPanel
          books={books}
          settings={settings}
          bcvRates={bcvRates}
          onRefreshRates={refreshBcvRates}
          onUpdateRates={updateBcvRates}
          catalogs={catalogs}
          onAddCatalog={addCatalog}
          onUpdateCatalog={updateCatalog}
          onDeleteCatalog={deleteCatalog}
          onReorderCatalogs={reorderCatalogs}
          onResetCatalogs={resetCatalogs}
          isExpanded={isAdminOpen}
          onToggleExpand={setIsAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onLogout={() => {
            logoutAdmin();
            setIsAdminOpen(false);
          }}
          onAddBook={addBook}
          onUpdateBook={updateBook}
          onDeleteBook={deleteBook}
          onToggleFeatured={toggleFeatured}
          onUpdateBookStatus={updateBookStatus}
          onUpdateSettings={updateSettings}
          onResetDefaults={resetToDefaults}
          onImportCatalog={importCatalog}
          externalSelectedBookId={selectedBook?.id}
          onSelectBook={setSelectedBook}
          directEditBook={directEditBook}
          onClearDirectEditBook={() => setDirectEditBook(null)}
        />
      </React.Suspense>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#EADBD9]">
      {/* Animated App Intro Splash with Books EM Brand Logo (Guaranteed to be active first) */}
      {showIntro && (
        <AppIntroSplash
          onComplete={() => {
            setShowIntro(false);
            setIsIntroExiting(false);
          }}
          onExiting={() => setIsIntroExiting(true)}
          storeName={settings.storeName}
        />
      )}

      {/* Main Store Content - strictly hidden while loading splash is active, then smoothly fades in as splash exits */}
      <div
        className={`min-h-screen flex flex-col bg-[#EADBD9] text-[#2C2420] selection:bg-[#DEC9C6] transition-opacity duration-300 ${
          showIntro && !isIntroExiting ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 visible'
        }`}
        aria-hidden={showIntro && !isIntroExiting}
      >
        {/* Top Main Navigation */}
        <Header
        settings={settings}
        wishlistCount={wishlistIds.length}
        bcvRates={bcvRates}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToCatalog={scrollToCatalog}
        onScrollToHowToBuy={scrollToHowToBuy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenInstallPrompt={() => setManualInstallTrigger(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Literary Hero Presentation */}
        <HeroBanner
          settings={settings}
          totalBooks={books.length}
          availableCount={availableBooksCount}
          onScrollToCatalog={scrollToCatalog}
          onSelectGenre={setSelectedGenre}
          selectedGenre={selectedGenre}
          catalogs={catalogs}
        />

        {/* Public Catalog with Filters, Search, and Book Cards */}
        <BookCatalog
          books={books}
          settings={settings}
          wishlistIds={wishlistIds}
          bcvRates={bcvRates}
          catalogs={catalogs}
          onToggleWishlist={toggleWishlist}
          onSelectBook={(book) => setSelectedBook(book)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
          isAdminLoggedIn={isAdminLoggedIn}
          onEditBook={(book) => {
            setDirectEditBook(book);
            setIsAdminOpen(true);
          }}
        />

        {/* 3-Step WhatsApp Purchase Guide & Payment Info */}
        <HowToBuySection settings={settings} />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenInstallPrompt={() => setManualInstallTrigger(true)}
      />

      {/* Book Detailed Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          settings={settings}
          bcvRates={bcvRates}
          isWishlisted={wishlistIds.includes(selectedBook.id)}
          onToggleWishlist={toggleWishlist}
          onClose={() => setSelectedBook(null)}
          isAdminLoggedIn={isAdminLoggedIn}
          onEditInAdmin={(book) => {
            setSelectedBook(null);
            setDirectEditBook(book);
            setIsAdminOpen(true);
          }}
        />
      )}

      {/* Customer Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        wishlistIds={wishlistIds}
        allBooks={books}
        settings={settings}
        bcvRates={bcvRates}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveFromWishlist={toggleWishlist}
        onSelectBook={(book) => setSelectedBook(book)}
      />

      {/* Quick Floating WhatsApp Action Button on bottom-right for Customers */}
      <a
        href={floatingWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        className="fixed right-6 bottom-6 z-30 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5 group transform hover:scale-105"
        title="Consultar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white shrink-0" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          ¿Deseas consultar un libro?
        </span>
      </a>
      {/* Floating PWA Install Prompt Banner (Only when not installed, auto-dismiss in 14s or manually) */}
      <PWAInstallPrompt
        manualTrigger={manualInstallTrigger}
        onManualTriggerHandled={() => setManualInstallTrigger(false)}
      />
      </div>
    </div>
  );
}
