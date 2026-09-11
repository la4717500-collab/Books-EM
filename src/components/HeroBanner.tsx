import React from 'react';
import { BookOpen, ShoppingCart, Truck, Heart, ArrowDown } from 'lucide-react';
import { StoreSettings } from '../types';
import { BooksEmLogo } from './BotanicalElements';

interface HeroBannerProps {
  settings: StoreSettings;
  totalBooks: number;
  availableCount: number;
  onScrollToCatalog: () => void;
  onSelectGenre: (genre: string) => void;
  selectedGenre: string;
  catalogs?: string[];
}

const DEFAULT_POPULAR_GENRES = [
  'Realismo Mágico',
  'Desarrollo Personal',
  'Misterio y Novela',
  'Ciencia Ficción Distópica',
  'Clásicos y Filosofía',
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalBooks,
  availableCount,
  onScrollToCatalog,
  onSelectGenre,
  selectedGenre,
  catalogs,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#EADBD9] border-b border-[#DAC5C2] py-10 sm:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Recreating the Banner Logo and 4 Feature Icons */}
          <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left pl-0 sm:pl-8 lg:pl-12">
            {/* The pure BOOKS EM Brand Logo & Typography without branches or extra slogans */}
            <div className="w-full flex justify-center lg:justify-start mb-6">
              <BooksEmLogo
                size="hero"
                showSubtitle={false}
                showSlogan={false}
              />
            </div>

            {/* 4 Minimalist Line Icons from the user's banner:
                1) Variedad de títulos (open book)
                2) Compra segura (shopping cart)
                3) Envíos a todo el país (truck)
                4) Pasión por la lectura (heart) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 my-6 max-w-lg w-full">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/60 sm:bg-transparent border sm:border-0 border-[#DEC9C6]">
                <div className="w-10 h-10 rounded-full bg-[#E2D2D0] flex items-center justify-center text-[#5C3218] mb-1.5 shadow-2xs">
                  <BookOpen className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#4A382D] leading-tight">
                  Variedad de títulos
                </span>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/60 sm:bg-transparent border sm:border-0 border-[#DEC9C6]">
                <div className="w-10 h-10 rounded-full bg-[#E2D2D0] flex items-center justify-center text-[#5C3218] mb-1.5 shadow-2xs">
                  <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#4A382D] leading-tight">
                  Compra segura
                </span>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/60 sm:bg-transparent border sm:border-0 border-[#DEC9C6]">
                <div className="w-10 h-10 rounded-full bg-[#E2D2D0] flex items-center justify-center text-[#5C3218] mb-1.5 shadow-2xs">
                  <Truck className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#4A382D] leading-tight">
                  Envíos a todo el país
                </span>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/60 sm:bg-transparent border sm:border-0 border-[#DEC9C6]">
                <div className="w-10 h-10 rounded-full bg-[#E2D2D0] flex items-center justify-center text-[#5C3218] mb-1.5 shadow-2xs">
                  <Heart className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-medium text-[#4A382D] leading-tight">
                  Pasión por la lectura
                </span>
              </div>
            </div>

            {/* Action button matching the banner: "Explora nuestro catálogo" */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2">
              <button
                onClick={onScrollToCatalog}
                id="hero-explore-btn"
                className="inline-flex items-center gap-2 bg-[#5C3218] hover:bg-[#472611] text-[#FDFBF7] px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explora nuestro catálogo</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A483E] bg-[#FFFFFF] px-4 py-3 rounded-xl border border-[#E8DFC8] shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{availableCount} de {totalBooks} libros disponibles</span>
              </div>
            </div>

            {/* Genre filter chips */}
            <div className="mt-8 pt-5 border-t border-[#EAE1D3] w-full max-w-xl">
              <span className="text-[11px] uppercase tracking-wider text-[#8C7464] font-bold block mb-2 text-center lg:text-left">
                Explorar por género
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                {['Todos', ...(catalogs && catalogs.length > 0 ? catalogs : DEFAULT_POPULAR_GENRES)].map((genre) => {
                  const isTodos = genre === 'Todos';
                  const isActive = (isTodos && !selectedGenre) || (Boolean(selectedGenre) && selectedGenre.trim().toLowerCase() === genre.trim().toLowerCase());
                  return (
                    <button
                      key={genre}
                      onClick={() => {
                        onSelectGenre(isTodos ? '' : genre);
                        onScrollToCatalog();
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#5C3218] text-white shadow-xs'
                          : 'bg-white/80 hover:bg-white text-[#5A483E] border border-[#E5DACB] hover:border-[#8C5E3C]'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Arched Window with Book Showcase and the Circular Stamp Badge */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Arched Window Container */}
              <div className="relative bg-[#E2D2D0] rounded-t-[140px] sm:rounded-t-[180px] rounded-b-3xl p-4 sm:p-5 pb-5 sm:pb-6 border border-[#DAC5C2] shadow-lg overflow-hidden">
                {/* Background warm aesthetic image with books, ceramic mug with heart, and botanical plant */}
                <div className="relative h-80 sm:h-96 w-full rounded-t-[125px] sm:rounded-t-[160px] rounded-b-2xl overflow-hidden shadow-inner bg-gradient-to-b from-[#EADBD9] to-[#DAC5C2]">
                  <img
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80"
                    alt="Colección de libros y café"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle warm tint overlay */}
                  <div className="absolute inset-0 bg-[#5C3218]/10 mix-blend-multiply pointer-events-none" />

                  {/* Aesthetic book spine labels representation */}
                  <div className="absolute top-6 inset-x-6 flex items-center justify-center">
                    <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/95 bg-[#3B2213]/70 backdrop-blur-xs px-3 py-1 rounded-full">
                      ✦ Ediciones Selectas ✦
                    </span>
                  </div>
                </div>
              </div>

              {/* Circular Stamp / Seal Badge: "Lee más, siente más, vive más ♡"
                  Positioned overlapping the arched container just like in the banner */}
              <div className="absolute -bottom-4 sm:-bottom-6 -left-3 sm:-left-6 z-20">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#5C3218] text-[#FAF7F2] p-2 flex flex-col items-center justify-center text-center shadow-xl border-2 border-dashed border-[#E2D2C0] transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#E2D2C0] mb-0.5 stroke-[1.8]" />
                  <p className="text-[9px] sm:text-[10px] font-serif-title font-bold leading-tight px-1 text-[#F7F2EA]">
                    Lee más, <br />
                    siente más, <br />
                    vive más
                  </p>
                  <span className="text-xs text-[#E2D2C0] mt-0.5">♡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
