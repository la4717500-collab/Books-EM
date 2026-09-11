import React, { useMemo, useState } from 'react';
import { Search, Filter, X, Star, BookOpen } from 'lucide-react';
import { Book, SortOption, StoreSettings } from '../types';
import { BookCard } from './BookCard';
import { BotanicalSprig, BotanicalDivider } from './BotanicalElements';
import { BcvRates, convertCurrency } from '../services/bcvRates';

interface BookCatalogProps {
  books: Book[];
  settings: StoreSettings;
  wishlistIds: string[];
  bcvRates?: BcvRates;
  catalogs?: string[];
  onToggleWishlist: (id: string) => void;
  onSelectBook: (book: Book) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  isAdminLoggedIn?: boolean;
  onEditBook?: (book: Book) => void;
}

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  settings,
  wishlistIds,
  bcvRates,
  catalogs,
  onToggleWishlist,
  onSelectBook,
  searchQuery,
  onSearchChange,
  selectedGenre,
  onSelectGenre,
  isAdminLoggedIn = false,
  onEditBook,
}) => {
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Derive unique genres and configured catalogs
  const allGenres = useMemo(() => {
    const set = new Set<string>(catalogs || []);
    books.forEach((b) => {
      if (b.genre) set.add(b.genre.trim());
    });
    return Array.from(set).filter(Boolean);
  }, [books, catalogs]);

  const allAuthors = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.author) set.add(b.author.trim());
    });
    return Array.from(set).sort();
  }, [books]);

  // Filter and sort logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = book.title.toLowerCase().includes(query);
          const matchAuthor = book.author.toLowerCase().includes(query);
          const matchGenre = book.genre.toLowerCase().includes(query);
          const matchSynopsis = book.synopsis.toLowerCase().includes(query);
          if (!matchTitle && !matchAuthor && !matchGenre && !matchSynopsis) {
            return false;
          }
        }

        // Genre (case and trim insensitive)
        if (
          selectedGenre &&
          (!book.genre || book.genre.trim().toLowerCase() !== selectedGenre.trim().toLowerCase())
        ) {
          return false;
        }

        // Author
        if (selectedAuthor && book.author !== selectedAuthor) {
          return false;
        }

        // Status
        if (selectedStatus !== 'all' && book.status !== selectedStatus) {
          return false;
        }

        // Featured
        if (featuredOnly && !book.featured) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Helper to compare prices accurately regardless of original currency (USD, VES, EUR)
        const getUsdPrice = (book: Book): number => {
          const cur = book.currency || 'USD';
          if (!bcvRates || cur === 'USD') return book.price;
          return convertCurrency(book.price, cur, 'USD', bcvRates);
        };

        switch (sortBy) {
          case 'featured':
            if (a.featured === b.featured) {
              return b.createdAt - a.createdAt;
            }
            return a.featured ? -1 : 1;
          case 'price_asc':
            return getUsdPrice(a) - getUsdPrice(b);
          case 'price_desc':
            return getUsdPrice(b) - getUsdPrice(a);
          case 'title_asc':
            return a.title.localeCompare(b.title);
          case 'recent':
            return b.createdAt - a.createdAt;
          default:
            return 0;
        }
      });
  }, [books, searchQuery, selectedGenre, selectedAuthor, selectedStatus, featuredOnly, sortBy, bcvRates]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedGenre) ||
    Boolean(selectedAuthor) ||
    selectedStatus !== 'all' ||
    featuredOnly;

  const clearAllFilters = () => {
    onSearchChange('');
    onSelectGenre('');
    setSelectedAuthor('');
    setSelectedStatus('all');
    setFeaturedOnly(false);
    setSortBy('featured');
  };

  return (
    <section id="catalog-section" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BotanicalSprig className="w-8 h-4 text-[#5C3218] opacity-75 -scale-x-100" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C5E3C]">
              Colección Books EM
            </span>
            <BotanicalSprig className="w-8 h-4 text-[#5C3218] opacity-75" />
          </div>
          <h2 className="font-brand text-2xl sm:text-4xl font-bold text-[#3B2213] tracking-tight">
            Catálogo de Libros
          </h2>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <span className="text-xs sm:text-sm text-[#735F52] bg-white px-3.5 py-1.5 rounded-xl border border-[#E8DFC8] shadow-2xs">
            <strong className="text-[#3B2213]">{filteredBooks.length}</strong> de {books.length} títulos
          </span>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#5C3218] text-white"
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DFD0] p-4 sm:p-5 shadow-xs mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
          {/* Search bar inside catalog */}
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <input
              type="text"
              id="catalog-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar título, autor..."
              className="w-full pl-9 pr-8 py-2 bg-[#F5ECE9] border border-[#DAC5C2] rounded-xl text-xs sm:text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-[#8C7464] absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9E8E81] hover:text-[#3B2213]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Genre Filter */}
          <div className="lg:col-span-2">
            <select
              id="catalog-genre-select"
              value={selectedGenre}
              onChange={(e) => onSelectGenre(e.target.value)}
              className="w-full py-2 px-3 bg-[#F5ECE9] border border-[#DAC5C2] rounded-xl text-xs sm:text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
            >
              <option value="">Géneros: Todos</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div className="lg:col-span-2">
            <select
              id="catalog-author-select"
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full py-2 px-3 bg-[#F5ECE9] border border-[#DAC5C2] rounded-xl text-xs sm:text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
            >
              <option value="">Autores: Todos</option>
              {allAuthors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              id="catalog-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-[#F5ECE9] border border-[#DAC5C2] rounded-xl text-xs sm:text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
            >
              <option value="all">Estado: Todos</option>
              <option value="disponible">🟢 Disponible</option>
              <option value="bajo_pedido">🟡 Bajo Pedido</option>
              <option value="agotado">⚪ Agotado</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <div className="relative">
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full py-2 pl-3 pr-7 bg-[#F5ECE9] border border-[#DAC5C2] rounded-xl text-xs sm:text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
              >
                <option value="featured">Destacados</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="title_asc">Título A-Z</option>
                <option value="recent">Nuevos Ingresos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Second Row: Quick Filter Toggles and Active Tags */}
        <div className="mt-3 pt-3 border-t border-[#DAC5C2] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Featured toggle pill */}
            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              id="catalog-featured-toggle-btn"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                featuredOnly
                  ? 'bg-[#5C3218] text-white shadow-xs'
                  : 'bg-[#F5ECE9] text-[#6E5A4E] border border-[#DAC5C2] hover:border-[#8C5E3C]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${featuredOnly ? 'fill-amber-300 text-amber-300' : 'text-[#8C7464]'}`} />
              <span>Solo Libros Destacados</span>
            </button>

            {/* Quick availability shortcuts */}
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'disponible' ? 'all' : 'disponible')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedStatus === 'disponible'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-[#F5ECE9] text-[#6E5A4E] border border-[#DAC5C2] hover:border-emerald-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Disponibles para entrega</span>
            </button>
          </div>

          {/* Reset button if filters active */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              id="catalog-clear-filters-btn"
              className="inline-flex items-center gap-1 text-[#8C5E3C] hover:text-[#5C3218] font-semibold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Restablecer todos los filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div
          id="books-grid-container"
          className="grid grid-cols-2 gap-3.5 sm:gap-6 md:gap-8 max-w-5xl mx-auto"
        >
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              settings={settings}
              bcvRates={bcvRates}
              isWishlisted={wishlistIds.includes(book.id)}
              onToggleWishlist={onToggleWishlist}
              onSelectBook={onSelectBook}
              isAdminLoggedIn={isAdminLoggedIn}
              onEditBook={onEditBook}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#DAC5C2] p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-[#EADBD9] text-[#8C5E3C] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#DAC5C2]">
            <BookOpen className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-serif-title text-xl font-bold text-[#3B2213] mb-2">
            No se encontraron libros
          </h3>
          <p className="text-sm text-[#735F52] mb-6">
            No encontramos ningún título que coincida con tus criterios de búsqueda o filtros seleccionados.
          </p>
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-2 bg-[#5C3218] hover:bg-[#472611] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <span>Ver todo el catálogo</span>
          </button>
        </div>
      )}

      {/* Decorative Botanical Flourish Divider */}
      <div className="mt-12">
        <BotanicalDivider />
      </div>
    </section>
  );
};
