import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Check,
  AlertCircle,
  Eye,
  DollarSign,
  Star,
  BookOpen,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
  TrendingUp,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Images,
  Sparkles,
  Link as LinkIcon,
  ArrowUpDown,
} from 'lucide-react';
import { Book, BookStatus, CurrencyCode } from '../../types';
import { formatPrice, getStatusDetails, compressImageFile, FALLBACK_BOOK_COVER } from '../../utils/helpers';
import { BcvRates, calculateBcvBreakdown, getCurrencySymbol } from '../../services/bcvRates';

interface PublicationEditorInlineProps {
  bookToEdit: Book | null;
  currencySymbol: string;
  bcvRates?: BcvRates;
  catalogs?: string[];
  onClose: () => void;
  onSave: (bookData: Omit<Book, 'id' | 'createdAt'>, existingId?: string) => void;
}

const COMMON_GENRES = [
  'Novela',
  'Realismo Mágico',
  'Desarrollo Personal',
  'Misterio y Novela',
  'Ciencia Ficción Distópica',
  'Clásicos y Filosofía',
  'Thriller Psicológico',
  'Romance',
  'Historia y Ensayo',
  'Fantasía',
  'Infantil y Juvenil',
];

export const PublicationEditorInline: React.FC<PublicationEditorInlineProps> = ({
  bookToEdit,
  currencySymbol,
  bcvRates,
  catalogs,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [price, setPrice] = useState<number>(15);
  const [status, setStatus] = useState<BookStatus>('disponible');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [synopsis, setSynopsis] = useState('');
  const [editorial, setEditorial] = useState('');
  const [pages, setPages] = useState<number | ''>('');
  const [publishedYear, setPublishedYear] = useState<number | ''>('');
  const [isbn, setIsbn] = useState('');

  // Auxiliary state for URL input and live preview carousel
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setGenre(bookToEdit.genre);
      setCurrency(bookToEdit.currency || 'USD');
      setPrice(bookToEdit.price);
      setStatus(bookToEdit.status);
      setFeatured(bookToEdit.featured);
      
      const initialImgs = (Array.isArray(bookToEdit.images) && bookToEdit.images.length > 0)
        ? bookToEdit.images
        : (bookToEdit.coverUrl ? [bookToEdit.coverUrl] : []);
      setImages(initialImgs);
      
      setSynopsis(bookToEdit.synopsis);
      setEditorial(bookToEdit.editorial || '');
      setPages(bookToEdit.pages || '');
      setPublishedYear(bookToEdit.publishedYear || '');
      setIsbn(bookToEdit.isbn || '');
      setShowAdvanced(Boolean(bookToEdit.editorial || bookToEdit.pages || bookToEdit.isbn));
    } else {
      // Defaults for new book
      setTitle('');
      setAuthor('');
      setGenre('Novela');
      setCurrency('USD');
      setPrice(15);
      setStatus('disponible');
      setFeatured(false);
      setImages([]);
      setSynopsis('');
      setEditorial('');
      setPages('');
      setPublishedYear(new Date().getFullYear());
      setIsbn('');
      setShowAdvanced(false);
    }
    setErrorMessage('');
    setActivePreviewIndex(0);
  }, [bookToEdit]);

  // Rotate images in preview every 5 seconds (pauses when admin hovers to inspect)
  useEffect(() => {
    if (images.length <= 1 || isHoveringPreview) return;
    const timer = setInterval(() => {
      setActivePreviewIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, isHoveringPreview]);

  // Handle multiple local image files upload with canvas compression
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Uno o más archivos seleccionados no son imágenes válidas.');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsCompressing(true);
    setErrorMessage('');

    try {
      // Compress all images in parallel down to ~40KB-70KB each to prevent storage quota limits
      const compressedResults = await Promise.all(
        validFiles.map((file) => compressImageFile(file, 1080, 1440, 0.82))
      );

      const validUrls = compressedResults.filter((url): url is string => Boolean(url && url.length > 0));

      if (validUrls.length > 0) {
        setImages((prev) => {
          const combined = [...prev, ...validUrls];
          return combined.slice(0, 12); // up to 12 images
        });
      }
    } catch (err) {
      console.error('Error al optimizar fotos:', err);
      setErrorMessage('Hubo un inconveniente al procesar las imágenes.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrlImage = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image')) {
      setErrorMessage('Ingresa un enlace URL de imagen válido (https://...).');
      return;
    }
    setImages((prev) => [...prev, trimmed].slice(0, 12));
    setUrlInput('');
    setShowUrlInput(false);
    setErrorMessage('');
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
    setActivePreviewIndex(0);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (activePreviewIndex >= images.length - 1) {
      setActivePreviewIndex(0);
    }
  };

  const adjustPrice = (delta: number) => {
    setPrice((prev) => {
      const current = Number(prev) || 0;
      const updated = Math.max(0, current + delta);
      return currency === 'VES' ? Math.round(updated) : Number(updated.toFixed(2));
    });
  };

  const bcvBreakdown = bcvRates ? calculateBcvBreakdown(price, currency, bcvRates) : null;
  const currentSymbol = getCurrencySymbol(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !genre.trim() || price <= 0 || !synopsis.trim()) {
      setErrorMessage('Completa los campos obligatorios: título, autor, género, precio válido y sinopsis.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Por favor sube al menos una foto para la portada de la publicación (se recomienda un mínimo de 6 fotos).');
      return;
    }

    onSave(
      {
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        price: Number(price),
        currency,
        status,
        featured,
        coverUrl: images[0],
        images: images,
        synopsis: synopsis.trim(),
        editorial: editorial.trim() || undefined,
        pages: pages ? Number(pages) : undefined,
        publishedYear: publishedYear ? Number(publishedYear) : undefined,
        isbn: isbn.trim() || undefined,
      },
      bookToEdit?.id
    );
  };

  const statusInfo = getStatusDetails(status);

  return (
    <div
      id="publication-editor-inline"
      className="bg-white rounded-3xl border border-[#E8DFD0] shadow-xs p-5 sm:p-8 space-y-6 animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#EFE8DF] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F4EFEB] text-[#5C3218] flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="font-brand text-xl sm:text-2xl font-bold text-[#3B2213]">
              {bookToEdit ? `Modificar: «${bookToEdit.title}»` : 'Crear Nueva Publicación'}
            </h2>
            <p className="text-xs text-[#735F52]">
              Edición directa en página • Sin ventanas flotantes ni capas emergentes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          id="editor-back-to-publications-btn"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E5DACB] text-[#5C3218] rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Publicaciones</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Grid: Left preview / Right inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Preview Column */}
          <div className="lg:col-span-4 bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#EAE1D4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#735F52] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#8C5E3C]" />
                Vista Previa de la Tarjeta
              </span>
              <span className="text-[10px] text-[#8C7464]">Tiempo real</span>
            </div>

            {/* Publication Card Preview with 5-Second Carousel */}
            <div className="bg-white rounded-2xl border border-[#E8DFD0] overflow-hidden shadow-xs">
              <div
                className="aspect-[3/4] w-full bg-[#EFE8DF] overflow-hidden relative group"
                onMouseEnter={() => setIsHoveringPreview(true)}
                onMouseLeave={() => setIsHoveringPreview(false)}
              >
                {images.length > 0 ? (
                  <>
                    {images.map((imgUrl, idx) => (
                      <img
                        key={`${imgUrl}-${idx}`}
                        src={imgUrl}
                        alt={`Vista previa ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_BOOK_COVER;
                        }}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                          idx === activePreviewIndex
                            ? 'opacity-100 scale-100 z-1'
                            : 'opacity-0 scale-95 pointer-events-none z-0'
                        }`}
                      />
                    ))}

                    {/* Book spine overlay */}
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none z-10" />

                    {/* Carousel navigation & indicators */}
                    {images.length > 1 && (
                      <>
                        {/* Dot indicators */}
                        <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-20 pointer-events-none">
                          {images.map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                dotIdx === activePreviewIndex
                                  ? 'w-3.5 bg-white shadow-xs'
                                  : 'w-1 bg-white/50'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Photo count indicator */}
                        <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/45 text-white backdrop-blur-2xs">
                            <Images className="w-2.5 h-2.5" />
                            <span>{activePreviewIndex + 1}/{images.length} (5s)</span>
                          </span>
                        </div>

                        {/* Manual arrows */}
                        <div className="absolute inset-y-0 inset-x-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-25 pointer-events-none">
                          <button
                            type="button"
                            onClick={() => setActivePreviewIndex((prev) => (prev - 1 + images.length) % images.length)}
                            className="pointer-events-auto w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePreviewIndex((prev) => (prev + 1) % images.length)}
                            className="pointer-events-auto w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7464] p-4 text-center bg-[#F4EFEB]">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-40 text-[#8C7464]" />
                    <span className="text-xs font-bold text-[#5C3218]">Sin fotos aún</span>
                    <span className="text-[10px] text-[#8C7464] mt-1">Sube al menos 6 fotos para rotación</span>
                  </div>
                )}
                {featured && (
                  <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs z-20">
                    <Star className="w-3 h-3 fill-amber-950" />
                    <span>Destacado</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 z-20">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${statusInfo.badgeBg}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <div className="p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E3C] block">
                  {genre || 'Género'}
                </span>
                <h4 className="font-serif-title text-sm font-bold text-[#2D241E] line-clamp-1 mt-0.5">
                  {title || 'Título del libro'}
                </h4>
                <p className="text-xs text-[#735F52] line-clamp-1">
                  {author || 'Nombre del autor'}
                </p>
                <div className="mt-2.5 pt-2 border-t border-[#F2ECE4]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-brand font-bold text-[#5C3218]">
                      {formatPrice(price, currencySymbol, currency)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      WhatsApp Listo
                    </span>
                  </div>
                  {bcvBreakdown && currency !== 'VES' && (
                    <div className="flex items-center gap-1 text-[11px] text-[#735F52] mt-0.5">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      <span>≈ {bcvBreakdown.bolivaresFormatted}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#8C7464] leading-relaxed">
              Los cambios que realices se guardarán de forma permanente en el catálogo de tu librería.
            </p>
          </div>

          {/* Right Inputs Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Título de la Publicación *
                </label>
                <input
                  type="text"
                  required
                  id="inline-input-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. El Principito"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Autor *
                </label>
                <input
                  type="text"
                  required
                  id="inline-input-author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="ej. Antoine de Saint-Exupéry"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Genre & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Género Literario *
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    id="inline-input-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Escribe o selecciona abajo"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
                  />
                  <div className="flex flex-wrap gap-1">
                    {(catalogs && catalogs.length > 0 ? catalogs : COMMON_GENRES).slice(0, 10).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGenre(g)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          genre.toLowerCase() === g.toLowerCase()
                            ? 'bg-[#5C3218] text-white border-[#5C3218] font-bold'
                            : 'bg-white text-[#735F52] hover:bg-[#FAF7F2] border-[#E8DFC8]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218]">
                  Moneda y Precio de Venta *
                </label>

                {/* Currency Selector (USD, EUR, VES) */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E5DACB]">
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      currency === 'USD'
                        ? 'bg-[#5C3218] text-white shadow-xs'
                        : 'text-[#6E5A4E] hover:bg-[#EFE8DF]'
                    }`}
                  >
                    <span>$ Dólares</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('EUR')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      currency === 'EUR'
                        ? 'bg-[#5C3218] text-white shadow-xs'
                        : 'text-[#6E5A4E] hover:bg-[#EFE8DF]'
                    }`}
                  >
                    <span>€ Euros</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('VES')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      currency === 'VES'
                        ? 'bg-[#5C3218] text-white shadow-xs'
                        : 'text-[#6E5A4E] hover:bg-[#EFE8DF]'
                    }`}
                  >
                    <span>Bs. Bolívares</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8C7464]">
                      {currentSymbol}
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={currency === 'VES' ? 10 : 0.5}
                      id="inline-input-price"
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm font-bold text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
                    />
                  </div>

                  {/* Quick delta buttons based on currency */}
                  <div className="flex gap-1.5">
                    {(currency === 'VES' ? [-1000, -500, 500, 1000] : [-5, -1, 1, 5, 10]).map((delta) => (
                      <button
                        type="button"
                        key={delta}
                        onClick={() => adjustPrice(delta)}
                        className="text-[10px] font-bold px-2 py-1 bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E5DACB] rounded-lg text-[#5C3218] cursor-pointer"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>

                  {/* Live BCV official conversion notice */}
                  {bcvBreakdown && (
                    <div className="bg-[#FAF7F2] border border-[#EAE1D4] rounded-xl p-2.5 text-[11px] space-y-1 text-[#735F52]">
                      <div className="flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1 text-[#5C3218] font-bold">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Equivalente BCV:</span>
                        </span>
                        <span className="font-mono font-bold text-[#2D241E]">
                          {currency !== 'VES' ? bcvBreakdown.bolivaresFormatted : `${bcvBreakdown.usdFormatted} / ${bcvBreakdown.eurFormatted}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8C7464]">
                        Tasa oficial Banco Central de Venezuela ({bcvBreakdown.rateAppliedText})
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE1D4]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                  Estado de Disponibilidad
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'disponible', label: 'Disponible', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                    { id: 'bajo_pedido', label: 'Bajo Pedido', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                    { id: 'agotado', label: 'Agotado', color: 'border-stone-400 bg-stone-100 text-stone-700' },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setStatus(s.id as BookStatus)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        status === s.id ? `${s.color} ring-2 ring-[#5C3218]/20 shadow-2xs` : 'bg-white border-[#E5DACB] text-[#735F52] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                  Visibilidad Destacada
                </label>
                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E5DACB] cursor-pointer hover:bg-[#FAF7F2] transition-colors">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#5C3218] rounded focus:ring-[#8C5E3C] cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <Star className={`w-4 h-4 ${featured ? 'fill-amber-400 text-amber-500' : 'text-[#8C7464]'}`} />
                    <span className="text-xs font-bold text-[#2D241E]">
                      Mostrar como Libro Destacado
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Multi-Image Gallery Controls (Minimum 6 recommended, with 5s carousel rotation) */}
            <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE1D4]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5C3218]">
                      Galería de Imágenes de la Publicación *
                    </label>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        images.length >= 6
                          ? 'bg-emerald-100 text-emerald-800'
                          : images.length > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {images.length} / 6 mín. recomendadas
                    </span>
                  </div>
                  <p className="text-[11px] text-[#735F52] mt-0.5">
                    Las imágenes rotan automáticamente cada 5 segundos en el catálogo. La primera imagen es la portada principal.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#F2EAE0] border border-[#E5DACB] text-[#5C3218] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Enlace Web</span>
                  </button>
                  <button
                    type="button"
                    id="inline-btn-upload-multiple-photos"
                    disabled={isCompressing}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#5C3218] hover:bg-[#472611] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isCompressing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Optimizando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Fotos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Hidden file input supporting multiple files */}
              <input
                type="file"
                multiple
                ref={fileInputRef}
                id="inline-file-upload-multiple"
                onChange={handleFilesUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Optional URL addition bar */}
              {showUrlInput && (
                <div className="p-3 bg-white rounded-xl border border-[#E5DACB] flex flex-col sm:flex-row items-center gap-2 animate-in fade-in">
                  <div className="relative flex-1 w-full">
                    <LinkIcon className="w-4 h-4 text-[#8C7464] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="Pega el enlace URL de la foto (https://...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrlImage();
                        }
                      }}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E5DACB] rounded-lg text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleAddUrlImage}
                      className="px-3 py-1.5 bg-[#5C3218] text-white rounded-lg text-xs font-bold hover:bg-[#472611] cursor-pointer"
                    >
                      Añadir
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      className="px-2.5 py-1.5 text-xs text-[#8C7464] hover:text-[#5C3218] cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of uploaded images */}
              {images.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {images.map((imgUrl, idx) => {
                      const isCover = idx === 0;
                      return (
                        <div
                          key={`${imgUrl}-${idx}`}
                          className={`group relative aspect-[3/4] bg-white rounded-xl border overflow-hidden shadow-2xs transition-all ${
                            isCover ? 'border-[#8C5E3C] ring-2 ring-[#8C5E3C]/30' : 'border-[#E8DFD0]'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Top Badge: Cover or Index */}
                          <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none z-10">
                            {isCover ? (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-400 text-amber-950 shadow-xs flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-950" />
                                <span>Portada</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/60 text-white backdrop-blur-2xs">
                                #{idx + 1}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                              }}
                              className="pointer-events-auto w-5 h-5 rounded-md bg-white/90 hover:bg-rose-600 text-stone-700 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                              title="Eliminar foto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Bottom Action Bar */}
                          <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between gap-1 z-10">
                            {!isCover ? (
                              <button
                                type="button"
                                onClick={() => makeCover(idx)}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 hover:bg-white text-[#5C3218] transition-colors cursor-pointer"
                              >
                                Hacer Portada
                              </button>
                            ) : (
                              <span className="text-[9px] font-bold text-white/90">
                                Portada activa
                              </span>
                            )}

                            <div className="flex items-center gap-0.5">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, -1)}
                                  className="w-5 h-5 rounded bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center cursor-pointer"
                                  title="Mover a la izquierda"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}
                              {idx < images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, 1)}
                                  className="w-5 h-5 rounded bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center cursor-pointer"
                                  title="Mover a la derecha"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* "+ Añadir más" slot card */}
                    {images.length < 12 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#D5C7B7] hover:border-[#8C5E3C] bg-white hover:bg-[#FAF7F2] flex flex-col items-center justify-center p-3 text-center transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#FAF7F2] group-hover:bg-[#5C3218] text-[#5C3218] group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-[#5C3218]">
                          Añadir más fotos
                        </span>
                        <span className="text-[9px] text-[#8C7464] mt-0.5">
                          {images.length < 6 ? `(${6 - images.length} más para 6)` : 'Hasta 12 fotos'}
                        </span>
                      </button>
                    )}
                  </div>

                  {images.length < 6 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                      <span>
                        Has subido <strong>{images.length} fotos</strong>. Se recomienda subir al menos <strong>6 imágenes</strong> por libro para enriquecer la experiencia visual del catálogo.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state when no photos have been uploaded yet */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group p-6 sm:p-8 bg-white hover:bg-[#F9F5EE] border-2 border-dashed border-[#D5C7B7] hover:border-[#8C5E3C] rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E5DACB] text-[#5C3218] group-hover:scale-105 flex items-center justify-center mb-3 transition-transform shadow-2xs">
                    <Images className="w-7 h-7 stroke-[2]" />
                  </div>
                  <span className="text-sm font-bold text-[#3B2213] block">
                    Subir Fotos del Libro (Mínimo recomendado: 6 fotos)
                  </span>
                  <span className="text-xs text-[#735F52] mt-1 max-w-md block">
                    Haz clic aquí para seleccionar múltiples fotos desde tu dispositivo (portada, contraportada y páginas)
                  </span>
                  <span className="text-[10px] text-[#8C7464] mt-1 block">
                    Las fotos se rotarán automáticamente cada 5 segundos en el catálogo • Formatos: JPG, PNG, WebP
                  </span>

                  <button
                    type="button"
                    id="inline-btn-upload-photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-4 px-4 py-2 bg-[#5C3218] hover:bg-[#452410] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Seleccionar Archivos</span>
                  </button>
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                Sinopsis o Reseña del Libro *
              </label>
              <textarea
                required
                rows={4}
                id="inline-input-synopsis"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Escribe un resumen cautivador del libro, su trama y motivos para leerlo..."
                className="w-full p-3 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white leading-relaxed"
              />
            </div>

            {/* Advanced Metadata Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C3218] hover:text-[#3B2213] cursor-pointer"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>
                  {showAdvanced ? 'Ocultar datos editoriales adicionales' : 'Ver datos editoriales adicionales (Editorial, Páginas, ISBN)'}
                </span>
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC8] animate-in fade-in">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#735F52] mb-1">
                      Editorial
                    </label>
                    <input
                      type="text"
                      value={editorial}
                      onChange={(e) => setEditorial(e.target.value)}
                      placeholder="ej. Planeta"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5DACB] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#735F52] mb-1">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="ej. 978-84-..."
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5DACB] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#735F52] mb-1">
                      Páginas
                    </label>
                    <input
                      type="number"
                      value={pages}
                      onChange={(e) => setPages(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="ej. 430"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5DACB] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#735F52] mb-1">
                      Año de Publicación
                    </label>
                    <input
                      type="number"
                      value={publishedYear}
                      onChange={(e) => setPublishedYear(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="ej. 2021"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5DACB] rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#EFE8DF] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E5DACB] text-xs font-bold text-[#6E5A4E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            ← Cancelar y Volver a la Lista
          </button>
          <button
            type="submit"
            id="inline-save-publication-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#5C3218] hover:bg-[#472611] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{bookToEdit ? 'Guardar Cambios de la Publicación' : 'Publicar Libro en el Catálogo'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
