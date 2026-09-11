import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Book, BookStatus } from '../../types';
import { PRESET_COVER_SUGGESTIONS } from '../../data/initialData';

interface BookFormModalProps {
  isOpen: boolean;
  bookToEdit: Book | null;
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
  'Poesía',
  'Fantasía',
  'Infantil y Juvenil',
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  bookToEdit,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [status, setStatus] = useState<BookStatus>('disponible');
  const [featured, setFeatured] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [editorial, setEditorial] = useState('');
  const [pages, setPages] = useState<number | ''>('');
  const [publishedYear, setPublishedYear] = useState<number | ''>('');
  const [isbn, setIsbn] = useState('');

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
    } else {
      // Reset form
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
    }
    setErrorMessage('');
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle local file upload via FileReader -> Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    // Limit to ~3MB to avoid excessive localStorage bloat
    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('La imagen es demasiado pesada. Elige una de menos de 3MB.');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !genre.trim() || !price || !synopsis.trim()) {
      setErrorMessage('Por favor completa todos los campos obligatorios: título, autor, género, precio y sinopsis.');
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#E8DFD0] shadow-2xl p-6 sm:p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
        id="book-form-modal"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8C7464] hover:text-[#3B2213] rounded-full hover:bg-[#FAF7F2] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 pb-4 border-b border-[#EFE8DF]">
          <h3 className="font-brand text-2xl font-bold text-[#3B2213]">
            {bookToEdit ? 'Editar Libro' : 'Agregar Nuevo Libro al Catálogo'}
          </h3>
          <p className="text-xs text-[#735F52] mt-1">
            Los datos se guardarán inmediatamente en el catálogo persistente de la tienda
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main info row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                Título del Libro *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej. Cien Años de Soledad"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
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
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Row 2: Genre & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                Género Literario *
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="ej. Novela, Realismo Mágico..."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white mb-1.5"
                required
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_GENRES.slice(0, 5).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className="text-[10px] bg-[#FAF7F2] hover:bg-[#EFE8DF] px-2 py-0.5 rounded border border-[#E8DFC8] text-[#6E5A4E]"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                Precio de Venta ($) *
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="45000"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white font-semibold"
                required
              />
            </div>
          </div>

          {/* Row 3: Availability Status & Featured Flag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                Estado de Disponibilidad
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="w-full px-3 py-2 bg-white border border-[#E5DACB] rounded-xl text-xs sm:text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] font-medium"
              >
                <option value="disponible">🟢 Disponible para entrega inmediata</option>
                <option value="bajo_pedido">🟡 Bajo Pedido (Encargo 3-5 días)</option>
                <option value="agotado">⚪ Agotado temporalmente</option>
              </select>
            </div>

            <div className="flex items-center sm:justify-center pt-2 sm:pt-0">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5C3218] focus:ring-[#5C3218] border-[#D4C3B3]"
                />
                <div>
                  <span className="text-xs font-bold text-[#3B2213] block">
                    ⭐ Marcar como Destacado
                  </span>
                  <span className="text-[11px] text-[#735F52]">
                    Se resaltará en el catálogo y aparecerá primero
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Row 4: Cover Image (URL, File Upload, or Presets) */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218]">
                Imagen de Portada
              </label>
              <span className="text-[11px] text-[#8C7464]">Solo carga de archivo de foto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-8 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#5C3218] rounded-xl border border-[#E8DFC8] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-[#8C5E3C]" />
                  <span>Subir foto desde este equipo</span>
                </button>
                <p className="text-[11px] text-[#8C7464]">
                  Formatos admitidos: JPG, PNG, WebP
                </p>
              </div>

              {/* Cover Preview */}
              <div className="sm:col-span-4 flex justify-center">
                <div className="relative aspect-[3/4] w-20 rounded-lg overflow-hidden bg-white border border-[#E5DACB] shadow-xs">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Vista previa portada"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={() => setCoverUrl(PRESET_COVER_SUGGESTIONS[0].url)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9E8E81]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Synopsis */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
              Sinopsis del Libro *
            </label>
            <textarea
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Describe de qué trata la obra, su tono, temas principales y por qué vale la pena leerla..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
              required
            />
          </div>

          {/* Row 6: Additional details (Editorial, Pages, Year, ISBN) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#735F52] mb-1">
                Editorial
              </label>
              <input
                type="text"
                value={editorial}
                onChange={(e) => setEditorial(e.target.value)}
                placeholder="ej. Planeta"
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#735F52] mb-1">
                Páginas
              </label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="ej. 320"
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#735F52] mb-1">
                Año
              </label>
              <input
                type="number"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="ej. 2024"
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#735F52] mb-1">
                ISBN
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-..."
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-[#EFE8DF] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[#E5DACB] text-xs font-semibold text-[#6E5A4E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="save-book-btn"
              className="flex-1 py-3 px-4 rounded-xl bg-[#5C3218] hover:bg-[#472611] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              {bookToEdit ? 'Guardar Cambios' : 'Publicar Libro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
