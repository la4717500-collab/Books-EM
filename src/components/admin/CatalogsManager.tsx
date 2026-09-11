import React, { useState } from 'react';
import {
  Tags,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Book } from '../../types';

interface CatalogsManagerProps {
  catalogs: string[];
  books: Book[];
  onAddCatalog: (name: string) => { success: boolean; error?: string };
  onUpdateCatalog: (oldName: string, newName: string, updateBooks?: boolean) => { success: boolean; error?: string };
  onDeleteCatalog: (nameToDelete: string, reassignTo?: string) => { success: boolean };
  onReorderCatalogs: (newOrder: string[]) => void;
  onResetCatalogs: () => void;
  onFilterByCatalog?: (catalogName: string) => void;
}

const POPULAR_SUGGESTIONS = [
  'Fantasía y Aventura',
  'Poesía Contemporánea',
  'Historia y Ensayo',
  'Thriller y Suspenso',
  'Infantil y Juvenil',
  'Autoayuda y Crecimiento',
  'Biografías y Memorias',
  'Filosofía y Pensamiento',
  'Ciencia y Tecnología',
  'Arte y Fotografía',
  'Cocina y Gastronomía',
  'Cómics y Manga',
];

export const CatalogsManager: React.FC<CatalogsManagerProps> = ({
  catalogs,
  books,
  onAddCatalog,
  onUpdateCatalog,
  onDeleteCatalog,
  onReorderCatalogs,
  onResetCatalogs,
  onFilterByCatalog,
}) => {
  const [newCatalogName, setNewCatalogName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Editing state
  const [editingCatalog, setEditingCatalog] = useState<string | null>(null);
  const [editingNewName, setEditingNewName] = useState('');
  const [updateBooksOnEdit, setUpdateBooksOnEdit] = useState(true);

  // Deleting state
  const [deletingCatalog, setDeletingCatalog] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState<string>('');

  // Reset confirmation
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Calculate book count per catalog
  const getBookCount = (catalogName: string) => {
    return books.filter(
      (b) => b.genre && b.genre.trim().toLowerCase() === catalogName.trim().toLowerCase()
    ).length;
  };

  // Find genres present in books that are not in the catalogs list
  const orphanedGenres = Array.from(
    new Set(
      books
        .map((b) => b.genre?.trim())
        .filter((g): g is string => Boolean(g) && !catalogs.some((c) => c.toLowerCase() === g.toLowerCase()))
    )
  );

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => {
      setSuccessMessage((prev) => (prev === msg ? '' : prev));
    }, 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage('');
  };

  const handleAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatalogName.trim()) {
      showError('Por favor escribe el nombre del catálogo a agregar.');
      return;
    }

    const res = onAddCatalog(newCatalogName.trim());
    if (res.success) {
      showSuccess(`¡Catálogo «${newCatalogName.trim()}» agregado con éxito!`);
      setNewCatalogName('');
    } else {
      showError(res.error || 'No se pudo agregar el catálogo.');
    }
  };

  const handleStartEdit = (cat: string) => {
    setEditingCatalog(cat);
    setEditingNewName(cat);
    setUpdateBooksOnEdit(true);
    setErrorMessage('');
  };

  const handleCancelEdit = () => {
    setEditingCatalog(null);
    setEditingNewName('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatalog) return;

    const trimmed = editingNewName.trim();
    if (!trimmed) {
      showError('El nombre del catálogo no puede estar vacío.');
      return;
    }

    const res = onUpdateCatalog(editingCatalog, trimmed, updateBooksOnEdit);
    if (res.success) {
      const affected = getBookCount(editingCatalog);
      showSuccess(
        `Catálogo modificado a «${trimmed}»${
          updateBooksOnEdit && affected > 0 ? ` (${affected} libros actualizados)` : ''
        }`
      );
      setEditingCatalog(null);
    } else {
      showError(res.error || 'Error al modificar el catálogo.');
    }
  };

  const handleStartDelete = (cat: string) => {
    setDeletingCatalog(cat);
    const otherCatalogs = catalogs.filter((c) => c !== cat);
    setReassignTarget(otherCatalogs[0] || '');
    setErrorMessage('');
  };

  const handleConfirmDelete = () => {
    if (!deletingCatalog) return;
    const count = getBookCount(deletingCatalog);
    const target = count > 0 && reassignTarget ? reassignTarget : undefined;
    onDeleteCatalog(deletingCatalog, target);

    showSuccess(
      `Catálogo «${deletingCatalog}» eliminado${
        target && count > 0 ? ` (${count} libros reasignados a «${target}»)` : ''
      }`
    );
    setDeletingCatalog(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...catalogs];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    onReorderCatalogs(copy);
    showSuccess('Orden de catálogos actualizado para la portada');
  };

  const handleMoveDown = (index: number) => {
    if (index === catalogs.length - 1) return;
    const copy = [...catalogs];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    onReorderCatalogs(copy);
    showSuccess('Orden de catálogos actualizado para la portada');
  };

  const handleImportOrphaned = () => {
    let added = 0;
    orphanedGenres.forEach((g) => {
      const r = onAddCatalog(g);
      if (r.success) added++;
    });
    if (added > 0) {
      showSuccess(`¡Se agregaron ${added} géneros encontrados en los libros al catálogo!`);
    }
  };

  const handleReset = () => {
    onResetCatalogs();
    setIsConfirmingReset(false);
    showSuccess('Catálogos restablecidos a los valores recomendados por defecto');
  };

  // Top metric calculations
  const totalBooksInCatalogs = books.filter((b) => Boolean(b.genre?.trim())).length;
  const popularSuggestionsAvailable = POPULAR_SUGGESTIONS.filter(
    (sug) => !catalogs.some((c) => c.toLowerCase() === sug.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Notifications */}
      {successMessage && (
        <div
          id="catalogs-success-toast"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          id="catalogs-error-toast"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFD0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0E8DD]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#5C3218]/10 text-[#5C3218] flex items-center justify-center shrink-0">
              <Tags className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-[#3B2213]">
                Modificación de Catálogos y Géneros
              </h2>
              <p className="text-xs sm:text-sm text-[#735F52]">
                Controla los catálogos que se muestran en «Explorar por género» en la portada, en los filtros y al registrar libros.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsConfirmingReset(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5DACB] bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#6B5547] text-xs font-bold transition-colors cursor-pointer"
              title="Restablecer catálogos a los valores de muestra recomendados"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Informative helper note */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] text-[#6E5A4E] text-xs leading-relaxed">
          <Info className="w-4 h-4 text-[#8C5E3C] shrink-0 mt-0.5" />
          <span>
            Los cambios que hagas aquí se reflejan de inmediato en la sección principal <strong>«Explorar por género»</strong> del inicio. Puedes agregar nuevos catálogos, renombrarlos (actualizando los libros automáticamente), eliminarlos y cambiar su orden de aparición.
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EADFCF]">
            <span className="text-[11px] font-semibold text-[#8C7464] uppercase tracking-wider block">
              Catálogos Activos
            </span>
            <span className="text-2xl font-brand font-bold text-[#3B2213]">
              {catalogs.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EADFCF]">
            <span className="text-[11px] font-semibold text-[#8C7464] uppercase tracking-wider block">
              Libros Catalogados
            </span>
            <span className="text-2xl font-brand font-bold text-[#3B2213]">
              {totalBooksInCatalogs}{' '}
              <span className="text-xs text-[#8C7464] font-normal font-sans">
                / {books.length} total
              </span>
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#FBF9F5] border border-[#EADFCF]">
            <span className="text-[11px] font-semibold text-[#8C7464] uppercase tracking-wider block">
              Visibles en Portada
            </span>
            <span className="text-2xl font-brand font-bold text-emerald-800">
              100%
            </span>
          </div>
        </div>
      </div>

      {/* Warning banner if books have genres not registered in catalogs */}
      {orphanedGenres.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-[#5C3218] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                Se detectaron {orphanedGenres.length} género(s) en tus libros que no están en la lista de catálogos:
              </h4>
              <p className="text-xs text-amber-900/90 mt-0.5">
                {orphanedGenres.join(', ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleImportOrphaned}
            className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            + Registrar estos catálogos
          </button>
        </div>
      )}

      {/* Add New Catalog Section */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8DFD0] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <Plus className="w-4 h-4 text-[#5C3218] stroke-[3]" />
          <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#3B2213]">
            Agregar Nuevo Catálogo
          </h3>
        </div>

        <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              id="input-new-catalog-name"
              value={newCatalogName}
              onChange={(e) => setNewCatalogName(e.target.value)}
              placeholder="Escribe el nombre del catálogo (ej. Novela Romántica, Novela Gráfica, Manga)..."
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white placeholder:text-[#9E8B7E]"
            />
            {newCatalogName && (
              <button
                type="button"
                onClick={() => setNewCatalogName('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7464] hover:text-[#3B2213] cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          <button
            type="submit"
            id="btn-add-catalog-submit"
            className="inline-flex items-center justify-center gap-2 bg-[#5C3218] hover:bg-[#472611] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Agregar Catálogo</span>
          </button>
        </form>

        {/* Quick Suggestions Chips */}
        {popularSuggestionsAvailable.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-[#8C7464] uppercase tracking-wider block mb-2">
              Sugerencias populares (haz clic para agregar rápido):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularSuggestionsAvailable.slice(0, 8).map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => {
                    setNewCatalogName(sug);
                    onAddCatalog(sug);
                    showSuccess(`Catálogo «${sug}» agregado.`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E8DFC8] text-xs font-semibold text-[#5C3218] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#8C5E3C]" />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Catalogs List */}
      <div className="bg-white rounded-3xl border border-[#E8DFD0] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#F0E8DD] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#3B2213]">
              Catálogos Configurados ({catalogs.length})
            </h3>
            <p className="text-xs text-[#735F52]">
              Usa las flechas para ordenar cómo aparecen en la portada de la tienda.
            </p>
          </div>
          <div className="text-xs text-[#8C7464] bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E5DACB]">
            Aparecen en: Portada • Filtros • Publicaciones
          </div>
        </div>

        {catalogs.length === 0 ? (
          <div className="p-12 text-center text-[#8C7464] space-y-3">
            <Tags className="w-12 h-12 mx-auto text-[#8C5E3C]/40" />
            <p className="font-serif-title text-base font-bold text-[#3B2213]">
              No hay catálogos configurados
            </p>
            <p className="text-xs max-w-sm mx-auto">
              Agrega uno usando el formulario arriba o restablece los catálogos por defecto.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 px-4 py-2 bg-[#5C3218] text-white rounded-xl text-xs font-bold"
            >
              Cargar Catálogos Recomendados
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#F2ECE4]">
            {catalogs.map((cat, index) => {
              const count = getBookCount(cat);
              const isEditing = editingCatalog === cat;

              return (
                <div
                  key={cat}
                  id={`catalog-item-${index}`}
                  className={`p-4 sm:p-5 transition-colors ${
                    isEditing ? 'bg-[#FDFBF7]' : 'hover:bg-[#FCFAF7]'
                  }`}
                >
                  {isEditing ? (
                    /* Inline Edit Form */
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#5C3218]">
                        <Edit3 className="w-4 h-4" />
                        <span>Modificar nombre del catálogo</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8">
                          <input
                            type="text"
                            value={editingNewName}
                            onChange={(e) => setEditingNewName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border-2 border-[#8C5E3C] rounded-xl text-sm font-semibold text-[#2D241E] focus:outline-none"
                            autoFocus
                          />
                        </div>

                        <div className="sm:col-span-4 flex items-center gap-2">
                          <button
                            type="submit"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#5C3218] hover:bg-[#472611] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Guardar</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E5DACB] text-[#6B5547] text-xs font-bold transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Checkbox to cascade update on existing books */}
                      {count > 0 && (
                        <label className="flex items-center gap-2 text-xs text-[#5C3218] cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={updateBooksOnEdit}
                            onChange={(e) => setUpdateBooksOnEdit(e.target.checked)}
                            className="w-4 h-4 rounded text-[#5C3218] focus:ring-[#8C5E3C]"
                          />
                          <span>
                            Actualizar automáticamente los <strong>{count} libro(s)</strong> asociados a este catálogo con el nuevo nombre.
                          </span>
                        </label>
                      )}
                    </form>
                  ) : (
                    /* Display Row */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Reorder buttons & Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Up / Down Reorder */}
                        <div className="flex flex-col items-center shrink-0 bg-[#FAF7F2] rounded-lg border border-[#E8DFC8] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            title="Mover arriba en la portada"
                            className={`p-1 rounded hover:bg-white transition-colors cursor-pointer ${
                              index === 0 ? 'opacity-20 cursor-not-allowed' : 'text-[#6B5547] hover:text-[#2D241E]'
                            }`}
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === catalogs.length - 1}
                            title="Mover abajo en la portada"
                            className={`p-1 rounded hover:bg-white transition-colors cursor-pointer ${
                              index === catalogs.length - 1
                                ? 'opacity-20 cursor-not-allowed'
                                : 'text-[#6B5547] hover:text-[#2D241E]'
                            }`}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Position Index Badge */}
                        <span className="text-[10px] font-mono font-bold text-[#8C7464] bg-[#FAF7F2] border border-[#E8DFC8] px-1.5 py-0.5 rounded-md shrink-0">
                          #{index + 1}
                        </span>

                        {/* Catalog Title */}
                        <div className="min-w-0">
                          <h4 className="font-serif-title text-base sm:text-lg font-bold text-[#2D241E] truncate">
                            {cat}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C5E3C]">
                              <BookOpen className="w-3 h-3" />
                              <span>{count} {count === 1 ? 'libro' : 'libros'}</span>
                            </span>
                            <span className="text-[#C4B2A2]">•</span>
                            <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              Visible en «Explorar por género»
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {/* View in inventory shortcut */}
                        {count > 0 && onFilterByCatalog && (
                          <button
                            type="button"
                            onClick={() => onFilterByCatalog(cat)}
                            title="Ver los libros que pertenecen a este catálogo"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E5DACB] text-xs font-semibold text-[#5C3218] transition-colors cursor-pointer"
                          >
                            <span>Ver {count}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        {/* Modify / Edit */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          id={`btn-edit-catalog-${index}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E5DACB] text-xs font-bold text-[#5C3218] transition-colors cursor-pointer"
                          title="Modificar nombre del catálogo"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#8C5E3C]" />
                          <span>Modificar</span>
                        </button>

                        {/* Delete / Remove */}
                        <button
                          type="button"
                          onClick={() => handleStartDelete(cat)}
                          id={`btn-delete-catalog-${index}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                          title="Quitar catálogo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Quitar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingCatalog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DFD0] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3.5 pb-3 border-b border-[#F0E8DD]">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-title text-lg sm:text-xl font-bold text-[#2D241E]">
                  ¿Eliminar el catálogo «{deletingCatalog}»?
                </h3>
                <p className="text-xs text-[#735F52]">
                  Esta acción quitará la categoría de la portada y de los filtros.
                </p>
              </div>
            </div>

            {getBookCount(deletingCatalog) > 0 ? (
              <div className="space-y-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFC8]">
                <div className="flex items-start gap-2 text-xs text-[#5C3218]">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Hay <strong>{getBookCount(deletingCatalog)} libro(s)</strong> clasificados en este catálogo. Selecciona a qué otro catálogo deseas reasignarlos para que no queden sin categoría:
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5C3218] uppercase tracking-wider mb-1">
                    Reasignar libros a:
                  </label>
                  <select
                    value={reassignTarget}
                    onChange={(e) => setReassignTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5DACB] rounded-xl text-xs font-semibold text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
                  >
                    {catalogs
                      .filter((c) => c !== deletingCatalog)
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    <option value="">Dejar sin catálogo asignado</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#6B5547] leading-relaxed">
                Ningún libro está utilizando actualmente este catálogo, por lo que puede eliminarse de forma segura.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCatalog(null)}
                className="px-4 py-2.5 rounded-xl border border-[#E5DACB] bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#6B5547] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Sí, Quitar Catálogo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {isConfirmingReset && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DFD0] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#2D241E]">
                ¿Restablecer catálogos?
              </h3>
            </div>

            <p className="text-xs text-[#6B5547] leading-relaxed">
              Esto restaurará la lista de catálogos recomendados de la librería (Realismo Mágico, Desarrollo Personal, Misterio y Novela, Ciencia Ficción Distópica, Clásicos y Filosofía, Romance y Clásicos).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingReset(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DACB] bg-[#FAF7F2] text-[#6B5547] text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-[#5C3218] hover:bg-[#472611] text-white text-xs font-bold"
              >
                Confirmar y Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
