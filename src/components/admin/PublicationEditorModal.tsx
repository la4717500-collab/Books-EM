import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  DollarSign,
  Star,
  BookOpen,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Book, BookStatus } from '../../types';
import { PRESET_COVER_SUGGESTIONS } from '../../data/initialData';
import { formatPrice, getStatusDetails } from '../../utils/helpers';

interface PublicationEditorModalProps {
  isOpen: boolean;
  bookToEdit: Book | null;
  currencySymbol: string;
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

export const PublicationEditorModal: React.FC<PublicationEditorModalProps> = ({
  isOpen,
  bookToEdit,
  currencySymbol,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState<number>(45000);
  const [status, setStatus] = useState<BookStatus>('disponible');
  const [featured, setFeatured] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [editorial, setEditorial] = useState('');
  const [pages, setPages] = useState<number | ''>('');
  const [publishedYear, setPublishedYear] = useState<number | ''>('');
  const [isbn, setIsbn] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPresetCovers, setShowPresetCovers] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setGenre(bookToEdit.genre);
      setPrice(bookToEdit.price);
      setStatus(bookToEdit.status);
      setFeatured(bookToEdit.featured);
      setCoverUrl(bookToEdit.coverUrl);
      setSynopsis(bookToEdit.synopsis);
      setEditorial(bookToEdit.editorial || '');
      setPages(bookToEdit.pages || '');
      setPublishedYear(bookToEdit.publishedYear || '');
      setIsbn(bookToEdit.isbn || '');
      setShowAdvanced(Boolean(bookToEdit.editorial || bookToEdit.pages || bookToEdit.isbn));
    } else {
      // New publication defaults
      setTitle('');
      setAuthor('');
      setGenre('Novela');
      setPrice(45000);
      setStatus('disponible');
      setFeatured(false);
      setCoverUrl(PRESET_COVER_SUGGESTIONS[0].url);
      setSynopsis('');
      setEditorial('');
      setPages('');
      setPublishedYear(new Date().getFullYear());
      setIsbn('');
      setShowAdvanced(false);
    }
    setErrorMessage('');
    setShowPresetCovers(false);
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle local image file upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 3.5 * 1024 * 1024) {
      setErrorMessage('La imagen es demasiado pesada. Elige una de menos de 3.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverUrl(reader.result);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick price adjustment helper
  const adjustPrice = (delta: number) => {
    setPrice((prev) => Math.max(0, (Number(prev) || 0) + delta));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !genre.trim() || price <= 0 || !synopsis.trim()) {
      setErrorMessage('Completa los campos obligatorios: título, autor, género, precio válido y sinopsis.');
      return;
    }

    const finalCover = coverUrl.trim() || PRESET_COVER_SUGGESTIONS[0].url;

    onSave(
      {
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        price: Number(price),
        status,
        featured,
        coverUrl: finalCover,
        synopsis: synopsis.trim(),
        editorial: editorial.trim() || undefined,
        pages: pages ? Number(pages) : undefined,
        publishedYear: publishedYear ? Number(publishedYear) : undefined,
        isbn: isbn.trim() || undefined,
      },
      bookToEdit?.id
    );
    onClose();
  };

  const statusInfo = getStatusDetails(status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-[#E8DFD0] shadow-2xl p-5 sm:p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
        id="publication-editor-modal"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#EFE8DF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFEB] text-[#5C3218] flex items-center justify-center">
              <BookOpen className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-[#3B2213]">
                {bookToEdit ? 'Modificar Publicación' : 'Crear Nueva Publicación'}
              </h2>
              <p className="text-xs text-[#735F52]">
                Ajusta los detalles visuales, precio y disponibilidad de manera cómoda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C7464] hover:text-[#3B2213] rounded-full hover:bg-[#FAF7F2] transition-colors"
            title="Cerrar editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Grid: Left preview / Right inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Preview Column: Exact appearance of the publication */}
            <div className="lg:col-span-4 bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE1D4] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#735F52] block flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#8C5E3C]" />
                Vista Previa de la Publicación
              </span>

              {/* Publication Card Preview */}
              <div className="bg-white rounded-xl border border-[#E8DFD0] overflow-hidden shadow-xs">
                <div className="aspect-[2/3] w-full bg-[#EFE8DF] overflow-hidden relative">
                  <img
                    src={coverUrl || PRESET_COVER_SUGGESTIONS[0].url}
                    alt="Vista previa de portada"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PRESET_COVER_SUGGESTIONS[0].url;
                    }}
                  />
                  {featured && (
                    <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-950" />
                      <span>Destacado</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-xs ${statusInfo.badgeBg}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C5E3C] block">
                    {genre || 'Género'}
                  </span>
                  <h4 className="font-serif-title text-sm font-bold text-[#2D241E] line-clamp-1 mt-0.5">
                    {title || 'Título del libro'}
                  </h4>
                  <p className="text-[11px] text-[#735F52] line-clamp-1">
                    {author || 'Nombre del autor'}
                  </p>
                  <p className="text-xs font-bold text-[#5C3218] mt-2">
                    {formatPrice(price, currencySymbol)}
                  </p>
                </div>
              </div>

              {/* Cover options - Solo subida de fotos */}
              <div className="space-y-2 pt-2 border-t border-[#EAE1D4]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#5C3218]">Foto de Portada</span>
                  <span className="text-[11px] text-[#8C7464]">Sube la foto del libro</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#FAF7F2] hover:bg-[#F2ECE4] border-2 border-dashed border-[#CBB8A6] hover:border-[#8C5E3C] rounded-xl text-xs font-bold text-[#5C3218] transition-colors cursor-pointer shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-[#8C5E3C]" />
                  <span>Subir foto desde este dispositivo</span>
                </button>
              </div>
            </div>

            {/* Right Editing Form Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Row 1: Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                    Título de la Publicación *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ej. Cien Años de Soledad"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                    Autor *
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="ej. Gabriel García Márquez"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Price with Quick Steppers */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE1D4]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218]">
                    Precio de Venta *
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#8C7464] font-medium">Ajuste rápido:</span>
                    <button
                      type="button"
                      onClick={() => adjustPrice(-5000)}
                      className="px-2 py-0.5 bg-white hover:bg-[#EFE8DF] border border-[#E8DFC8] rounded text-[11px] text-[#5C3218] font-bold"
                    >
                      -$5.000
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustPrice(1000)}
                      className="px-2 py-0.5 bg-white hover:bg-[#EFE8DF] border border-[#E8DFC8] rounded text-[11px] text-[#5C3218] font-bold"
                    >
                      +$1.000
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustPrice(5000)}
                      className="px-2 py-0.5 bg-white hover:bg-[#EFE8DF] border border-[#E8DFC8] rounded text-[11px] text-[#5C3218] font-bold"
                    >
                      +$5.000
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustPrice(10000)}
                      className="px-2 py-0.5 bg-white hover:bg-[#EFE8DF] border border-[#E8DFC8] rounded text-[11px] text-[#5C3218] font-bold"
                    >
                      +$10.000
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#8C5E3C]">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 bg-white border border-[#E5DACB] rounded-xl text-base font-bold text-[#3B2213] focus:outline-none focus:border-[#8C5E3C]"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Availability Status with 3 tactile buttons & Featured toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218]">
                  Disponibilidad y Estado *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('disponible')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      status === 'disponible'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white hover:bg-emerald-50 text-emerald-800 border-[#E5DACB]'
                    }`}
                  >
                    <span>🟢</span>
                    <span>Disponible</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('bajo_pedido')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      status === 'bajo_pedido'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white hover:bg-amber-50 text-amber-800 border-[#E5DACB]'
                    }`}
                  >
                    <span>🟡</span>
                    <span>Bajo Pedido</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('agotado')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      status === 'agotado'
                        ? 'bg-stone-600 text-white border-stone-700 shadow-xs'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-[#E5DACB]'
                    }`}
                  >
                    <span>⚪</span>
                    <span>Agotado</span>
                  </button>
                </div>
              </div>

              {/* Featured toggle banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${featured ? 'fill-amber-500 text-amber-600' : 'text-amber-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      Destacar esta publicación
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Aparecerá en los primeros lugares del catálogo de la tienda
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded text-[#5C3218] focus:ring-[#5C3218] border-amber-300 cursor-pointer"
                />
              </div>

              {/* Genre Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Género Literario *
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="ej. Novela, Romance, Ensayo..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white mb-2"
                  required
                />
                <div className="flex flex-wrap gap-1">
                  {COMMON_GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenre(g)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                        genre === g
                          ? 'bg-[#5C3218] text-white border-[#5C3218]'
                          : 'bg-[#FAF7F2] hover:bg-[#EFE8DF] border-[#E8DFC8] text-[#6E5A4E]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Sinopsis / Reseña *
                </label>
                <textarea
                  rows={4}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Describe de qué trata la obra para atraer al lector..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-xs sm:text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white leading-relaxed"
                  required
                />
              </div>

              {/* Collapsible Advanced Info (Editorial, ISBN, Páginas, Año) */}
              <div className="border-t border-[#F0E8DD] pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C5E3C] hover:text-[#5C3218]"
                >
                  <span>{showAdvanced ? 'Ocultar datos editoriales adicionales' : '+ Agregar datos editoriales (ISBN, páginas, editorial)'}</span>
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE1D4] animate-in fade-in">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#735F52] mb-1">
                        Editorial
                      </label>
                      <input
                        type="text"
                        value={editorial}
                        onChange={(e) => setEditorial(e.target.value)}
                        placeholder="ej. Planeta, Alfaguara..."
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

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-[#EFE8DF] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E5DACB] text-xs font-bold text-[#6E5A4E] hover:bg-[#FAF7F2] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-publication"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5C3218] hover:bg-[#472611] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{bookToEdit ? 'Guardar Correcciones' : 'Publicar Libro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
