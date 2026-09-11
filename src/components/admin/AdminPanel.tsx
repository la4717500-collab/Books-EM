import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Settings,
  MessageCircle,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle,
  Key,
  ShieldAlert,
  ShieldCheck,
  LayoutGrid,
  List,
  Store as StoreIcon,
  ExternalLink,
  Eye,
  Check,
  DollarSign,
  X,
  TrendingUp,
  Tags,
} from 'lucide-react';
import { Book, BookStatus, StoreSettings } from '../../types';
import { formatPrice, getStatusDetails, buildWhatsAppMessage, cleanPhoneNumber } from '../../utils/helpers';
import { BcvRates, calculateBcvBreakdown } from '../../services/bcvRates';
import { PublicationCard } from './PublicationCard';
import { PublicationEditorInline } from './PublicationEditorInline';
import { AdminBottomDock, AdminTab, ViewMode } from './AdminBottomDock';
import { AdminRatesMonitor } from './AdminRatesMonitor';
import { CatalogsManager } from './CatalogsManager';

interface AdminPanelProps {
  books: Book[];
  settings: StoreSettings;
  bcvRates?: BcvRates;
  onRefreshRates?: () => Promise<void | BcvRates>;
  onUpdateRates?: (rates: BcvRates) => void;
  catalogs?: string[];
  onAddCatalog?: (name: string) => { success: boolean; error?: string };
  onUpdateCatalog?: (oldName: string, newName: string, updateBooks?: boolean) => { success: boolean; error?: string };
  onDeleteCatalog?: (nameToDelete: string, reassignTo?: string) => { success: boolean };
  onReorderCatalogs?: (newOrder: string[]) => void;
  onResetCatalogs?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  onClose: () => void;
  onLogout: () => void;
  onAddBook: (book: Omit<Book, 'id' | 'createdAt'>) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onUpdateBookStatus: (id: string, status: BookStatus) => void;
  onUpdateSettings: (newSettings: Partial<StoreSettings>) => void;
  onResetDefaults: () => void;
  onImportCatalog: (books: Book[]) => void;
  externalSelectedBookId?: string | null;
  onSelectBook?: (book: Book | null) => void;
  directEditBook?: Book | null;
  onClearDirectEditBook?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  books,
  settings,
  bcvRates,
  onRefreshRates,
  onUpdateRates,
  catalogs = [],
  onAddCatalog,
  onUpdateCatalog,
  onDeleteCatalog,
  onReorderCatalogs,
  onResetCatalogs,
  onClose,
  onLogout,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onToggleFeatured,
  onUpdateBookStatus,
  onUpdateSettings,
  onResetDefaults,
  onImportCatalog,
  externalSelectedBookId,
  onSelectBook,
  directEditBook,
  onClearDirectEditBook,
}) => {
  // 4 Bottom Bar Tabs: 'publications' | 'whatsapp' | 'store' | 'backup'
  const [activeTab, setActiveTab] = useState<AdminTab>('publications');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Selected publication state for direct modification
  const [selectedBookId, setSelectedBookId] = useState<string | null>(externalSelectedBookId || null);

  useEffect(() => {
    if (externalSelectedBookId !== undefined) {
      setSelectedBookId(externalSelectedBookId);
    }
  }, [externalSelectedBookId]);

  // Handle direct edit request from parent or store
  useEffect(() => {
    if (directEditBook) {
      setEditingBook(directEditBook);
      setSelectedBookId(directEditBook.id);
      setIsEditorModalOpen(true);
      onClearDirectEditBook?.();
    }
  }, [directEditBook, onClearDirectEditBook]);

  // Inventory search & filter
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStatus, setInventoryStatus] = useState<string>('all');

  // Publication Editor modal state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Delete confirmation state
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Settings form state (WhatsApp & Store)
  const [tempSettings, setTempSettings] = useState<StoreSettings>(settings);
  const [whatsappSavedMessage, setWhatsappSavedMessage] = useState(false);
  const [storeSavedMessage, setStoreSavedMessage] = useState(false);
  const [newUsername, setNewUsername] = useState(settings.adminUsername || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Floating feedback toast
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => {
      setFeedbackToast((current) => (current === message ? null : current));
    }, 3500);
  };

  // Selected book object reference
  const selectedBook = books.find((b) => b.id === selectedBookId) || null;

  // Sample book for previewing WhatsApp messages
  const sampleBook: Book = books[0] || {
    id: 'sample',
    title: 'Cien Años de Soledad',
    author: 'Gabriel García Márquez',
    genre: 'Realismo Mágico',
    price: 68000,
    status: 'disponible',
    featured: true,
    coverUrl: '',
    synopsis: '',
    createdAt: Date.now(),
  };

  // Filtered books in inventory
  const filteredInventory = books.filter((b) => {
    if (inventoryStatus === 'destacados') {
      if (!b.featured) return false;
    } else if (inventoryStatus !== 'all' && b.status !== inventoryStatus) {
      return false;
    }

    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Inventory stats
  const availableCount = books.filter((b) => b.status === 'disponible').length;
  const backorderCount = books.filter((b) => b.status === 'bajo_pedido').length;
  const outOfStockCount = books.filter((b) => b.status === 'agotado').length;
  const featuredCount = books.filter((b) => b.featured).length;
  const totalValue = books.reduce((acc, b) => acc + (Number(b.price) || 0), 0);

  // Open editor for a new book
  const handleOpenAddModal = () => {
    setEditingBook(null);
    setIsEditorModalOpen(true);
  };

  // Open editor to modify a publication
  const handleOpenEditModal = (book: Book) => {
    setSelectedBookId(book.id);
    setEditingBook(book);
    setIsEditorModalOpen(true);
  };

  // Handle saving book data
  const handleSaveBook = (bookData: Omit<Book, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      const existing = books.find((b) => b.id === existingId);
      if (existing) {
        const updated = { ...existing, ...bookData };
        onUpdateBook(updated);
        showToast(`Publicación «${updated.title}» modificada con éxito`);
      }
    } else {
      onAddBook(bookData);
      showToast(`Nueva publicación «${bookData.title}» agregada al catálogo`);
    }
  };

  // Delete confirmed
  const handleConfirmDelete = () => {
    if (bookToDelete) {
      if (selectedBookId === bookToDelete.id) {
        setSelectedBookId(null);
      }
      onDeleteBook(bookToDelete.id);
      showToast(`Publicación «${bookToDelete.title}» eliminada`);
      setBookToDelete(null);
    }
  };

  // Cycle status for selected book
  const handleCycleStatusSelected = () => {
    if (!selectedBook) return;
    const sequence: BookStatus[] = ['disponible', 'bajo_pedido', 'agotado'];
    const nextIndex = (sequence.indexOf(selectedBook.status) + 1) % sequence.length;
    const nextStatus = sequence[nextIndex];
    onUpdateBookStatus(selectedBook.id, nextStatus);
    const label = getStatusDetails(nextStatus).label;
    showToast(`Estado cambiado a: ${label}`);
  };

  const handleInsertVariable = (variable: string) => {
    setTempSettings((prev) => ({
      ...prev,
      whatsappTemplate: `${prev.whatsappTemplate} ${variable}`,
    }));
  };

  // Save WhatsApp settings
  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: StoreSettings = {
      ...settings,
      whatsappNumber: tempSettings.whatsappNumber,
      whatsappTemplate: tempSettings.whatsappTemplate,
    };
    onUpdateSettings(updatedSettings);
    setTempSettings(updatedSettings);
    setWhatsappSavedMessage(true);
    showToast('Configuración de WhatsApp guardada');
    setTimeout(() => setWhatsappSavedMessage(false), 3000);
  };

  // Save Store settings & Credentials
  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    let updatedUsername = tempSettings.adminUsername;
    if (newUsername.trim()) {
      updatedUsername = newUsername.trim();
    }

    let updatedPassword = tempSettings.adminPassword;
    if (newPassword.trim()) {
      if (newPassword.length < 4) {
        setPasswordError('La nueva contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden.');
        return;
      }
      updatedPassword = newPassword.trim();
    }

    const updatedSettings: StoreSettings = {
      ...tempSettings,
      adminUsername: updatedUsername,
      adminPassword: updatedPassword,
    };

    onUpdateSettings(updatedSettings);
    setTempSettings(updatedSettings);
    setNewPassword('');
    setConfirmPassword('');
    setStoreSavedMessage(true);
    showToast('Ajustes de la tienda guardados con éxito');
    setTimeout(() => setStoreSavedMessage(false), 3000);
  };

  // WhatsApp test link
  const sampleWhatsAppClean = cleanPhoneNumber(tempSettings.whatsappNumber);
  const sampleWhatsAppText = encodeURIComponent(buildWhatsAppMessage(sampleBook, tempSettings));
  const sampleWhatsAppUrl = sampleWhatsAppClean
    ? `https://wa.me/${sampleWhatsAppClean}?text=${sampleWhatsAppText}`
    : '#';

  return (
    <div
      id="admin-fullscreen-page"
      className="min-h-screen bg-[#FAF7F2] text-[#2C2420] flex flex-col selection:bg-[#E8DCCF]"
    >
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-60 bg-[#3B2213] text-[#FAF7F2] px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border border-[#8C5E3C] animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* TOP BAR: Header of the Fullscreen Admin Page */}
      <header className="px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-[#E8DFD0] shadow-xs flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Replaced title with Add action, shifted Eye button, and shifted Exit button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Button: Añadir Publicación */}
          <button
            onClick={handleOpenAddModal}
            id="admin-top-add-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer hover:shadow"
            title="Añadir nueva publicación o libro"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="font-bold">Añadir Publicación</span>
          </button>

          {/* Button: Eye - Ver Tienda para ver y modificar la aplicación */}
          <button
            onClick={onClose}
            id="admin-return-store-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#5C3218] border border-[#E8DFC8] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="Ver la tienda y modificaciones en tiempo real"
          >
            <Eye className="w-4 h-4 text-[#5C3218]" />
            <span>Ver Tienda</span>
          </button>

          {/* Button: Exit / Logout */}
          <button
            onClick={onLogout}
            id="admin-top-logout-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="Cerrar sesión de administración y salir"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Salir</span>
          </button>

          {/* Button: Tasas BCV (Monitor de Tasas del Día) */}
          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            id="admin-top-rates-btn"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              activeTab === 'rates'
                ? 'bg-[#5C3218] text-white shadow-xs'
                : 'bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#5C3218] border border-[#E8DFC8]'
            }`}
            title="Monitorear y supervisar tasas oficiales del día (BCV)"
          >
            <TrendingUp
              className={`w-4 h-4 ${
                activeTab === 'rates' ? 'text-emerald-300' : 'text-emerald-600'
              }`}
            />
            <span>Tasas BCV</span>
          </button>
        </div>

        {/* Right: Current Section Indicator (Aroma de BCV removed from header as requested) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Section Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl text-xs font-bold text-[#5C3218]">
            {activeTab === 'publications' && (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Publicaciones ({books.length})</span>
              </>
            )}
            {activeTab === 'catalogs' && (
              <>
                <Tags className="w-3.5 h-3.5 text-[#8C5E3C]" />
                <span>Catálogos ({catalogs.length})</span>
              </>
            )}
            {activeTab === 'rates' && (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monitor Tasas BCV</span>
              </>
            )}
            {activeTab === 'whatsapp' && (
              <>
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </>
            )}
            {activeTab === 'store' && (
              <>
                <StoreIcon className="w-3.5 h-3.5" />
                <span>Ajustes</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN SCROLLABLE CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 sm:pb-28">
        {/* ========================================================================= */}
        {/* SECCIÓN 1: PUBLICACIONES */}
        {/* ========================================================================= */}
        {activeTab === 'publications' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {isEditorModalOpen ? (
              <PublicationEditorInline
                bookToEdit={editingBook}
                currencySymbol={settings.currencySymbol}
                bcvRates={bcvRates}
                catalogs={catalogs}
                onClose={() => {
                  setIsEditorModalOpen(false);
                  setEditingBook(null);
                  onClearDirectEditBook?.();
                }}
                onSave={(bookData, existingId) => {
                  handleSaveBook(bookData, existingId);
                  setIsEditorModalOpen(false);
                  setEditingBook(null);
                  onClearDirectEditBook?.();
                }}
              />
            ) : (
              <>
                {/* Inline Delete Confirmation banner */}
                {bookToDelete && (
                  <div
                    id="inline-delete-confirmation-banner"
                    className="p-5 sm:p-6 rounded-2xl bg-rose-50 border-2 border-rose-300 text-[#2D241E] shadow-xs animate-in fade-in duration-150"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-serif-title text-base sm:text-lg font-bold text-rose-950">
                            ¿Confirmas que deseas eliminar esta publicación?
                          </h4>
                          <p className="text-xs sm:text-sm text-rose-800 mt-0.5">
                            Estás a punto de borrar <strong>«{bookToDelete.title}»</strong> ({bookToDelete.author}) del catálogo de Books EM.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setBookToDelete(null)}
                          className="px-4 py-2.5 rounded-xl border border-[#E5DACB] bg-white hover:bg-[#FAF7F2] text-xs font-bold text-[#6E5A4E] transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmDelete}
                          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Sí, Eliminar Publicación
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div
                onClick={() => setInventoryStatus('all')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  inventoryStatus === 'all'
                    ? 'bg-[#F4ECE3] border-[#8C5E3C] ring-2 ring-[#8C5E3C]/20'
                    : 'bg-white border-[#E8DFD0] hover:border-[#D4C3B3]'
                }`}
              >
                <span className="text-[11px] text-[#8C7464] font-semibold uppercase tracking-wider block">
                  Total Publicaciones
                </span>
                <span className="text-2xl font-brand font-bold text-[#3B2213]">
                  {books.length}
                </span>
              </div>

              <div
                onClick={() => setInventoryStatus('disponible')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  inventoryStatus === 'disponible'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-[#E8DFD0] hover:border-emerald-300'
                }`}
              >
                <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider block">
                  🟢 Disponibles
                </span>
                <span className="text-2xl font-brand font-bold text-emerald-800">
                  {availableCount}
                </span>
              </div>

              <div
                onClick={() => setInventoryStatus('bajo_pedido')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  inventoryStatus === 'bajo_pedido'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-white border-[#E8DFD0] hover:border-amber-300'
                }`}
              >
                <span className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider block">
                  🟡 Bajo Pedido
                </span>
                <span className="text-2xl font-brand font-bold text-amber-800">
                  {backorderCount}
                </span>
              </div>

              <div
                onClick={() => setInventoryStatus('destacados')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  inventoryStatus === 'destacados'
                    ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-white border-[#E8DFD0] hover:border-amber-300'
                }`}
              >
                <span className="text-[11px] text-[#5C3218] font-semibold uppercase tracking-wider block">
                  ⭐ Destacados
                </span>
                <span className="text-2xl font-brand font-bold text-[#5C3218]">
                  {featuredCount}{' '}
                  <span className="text-xs text-[#8C7464] font-normal">
                    ({outOfStockCount} agotados)
                  </span>
                </span>
              </div>
            </div>

            {/* Inventory Search and Filter Toolbar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD0] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:max-w-md">
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Buscar por título, autor o género..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-xs sm:text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
                  />
                  <Search className="w-4 h-4 text-[#8C7464] absolute left-3 top-1/2 -translate-y-1/2" />
                  {inventorySearch && (
                    <button
                      onClick={() => setInventorySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7464] hover:text-[#3B2213] cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* View Switcher & Add Button */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center bg-[#FAF7F2] p-0.5 rounded-xl border border-[#E5DACB]">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-white text-[#5C3218] shadow-xs'
                          : 'text-[#8C7464] hover:text-[#3B2213]'
                      }`}
                      title="Vista de publicaciones como tarjetas"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-xs">Tarjetas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewMode === 'table'
                          ? 'bg-white text-[#5C3218] shadow-xs'
                          : 'text-[#8C7464] hover:text-[#3B2213]'
                      }`}
                      title="Vista de lista / tabla compacta"
                    >
                      <List className="w-4 h-4" />
                      <span className="text-xs">Tabla</span>
                    </button>
                  </div>

                  <button
                    onClick={handleOpenAddModal}
                    id="admin-publications-add-btn"
                    className="inline-flex items-center justify-center gap-1.5 bg-[#5C3218] hover:bg-[#472611] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>+ Nueva Publicación</span>
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F2ECE4]">
                <span className="text-xs text-[#735F52] font-medium mr-1">Filtrar:</span>
                {[
                  { id: 'all', label: `Todos (${books.length})` },
                  { id: 'disponible', label: `🟢 Disponibles (${availableCount})` },
                  { id: 'bajo_pedido', label: `🟡 Bajo Pedido (${backorderCount})` },
                  { id: 'agotado', label: `⚪ Agotados (${outOfStockCount})` },
                  { id: 'destacados', label: `⭐ Destacados (${featuredCount})` },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setInventoryStatus(chip.id)}
                    className={`text-xs px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                      inventoryStatus === chip.id
                        ? 'bg-[#5C3218] text-white border-[#5C3218] font-bold'
                        : 'bg-[#FAF7F2] text-[#6E5A4E] hover:bg-[#EFE8DF] border-[#E8DFC8]'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Helper guidance */}
            <div className="flex items-center justify-between px-1 text-xs text-[#735F52]">
              <p>
                {selectedBook ? (
                  <span>
                    Seleccionado: <strong className="text-[#5C3218]">«{selectedBook.title}»</strong>. Puedes modificarlo o cambiar su estado directamente.
                  </span>
                ) : (
                  <span>
                    💡 Haz clic sobre cualquier publicación para seleccionarla y modificarla con un clic.
                  </span>
                )}
              </p>
              <span className="text-[11px] text-[#8C7464]">
                Mostrando {filteredInventory.length} de {books.length} publicaciones
              </span>
            </div>

            {/* Content: Mode 1 = Publication Cards Grid */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((book) => (
                    <PublicationCard
                      key={book.id}
                      book={book}
                      isSelected={selectedBookId === book.id}
                      currencySymbol={settings.currencySymbol}
                      bcvRates={bcvRates}
                      onSelect={(b) => setSelectedBookId(b.id)}
                      onEdit={handleOpenEditModal}
                      onDelete={(b) => setBookToDelete(b)}
                      onToggleFeatured={onToggleFeatured}
                      onUpdateStatus={onUpdateBookStatus}
                    />
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-2xl border border-[#E8DFD0] p-10 text-center space-y-3">
                    <p className="text-[#8C7464] text-sm">
                      No se encontraron publicaciones con los filtros seleccionados.
                    </p>
                    <button
                      onClick={() => {
                        setInventorySearch('');
                        setInventoryStatus('all');
                      }}
                      className="px-4 py-2 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-xs font-bold text-[#5C3218] hover:bg-[#EFE8DF] cursor-pointer"
                    >
                      Restablecer filtros
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Content: Mode 2 = Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#E8DFD0] text-[#735F52] uppercase text-[11px] font-bold tracking-wider">
                        <th className="py-3.5 px-4">Publicación</th>
                        <th className="py-3.5 px-4">Género</th>
                        <th className="py-3.5 px-4">Precio</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4 text-center">Destacado</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE4]">
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map((book) => {
                          const statusDetails = getStatusDetails(book.status);
                          const isSelected = selectedBookId === book.id;
                          return (
                            <tr
                              key={book.id}
                              onClick={() => setSelectedBookId(book.id)}
                              className={`transition-colors cursor-pointer ${
                                isSelected ? 'bg-[#F7F2EB] font-medium' : 'hover:bg-[#FCFAF7]'
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={book.coverUrl}
                                    alt={book.title}
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-12 object-cover rounded shadow-xs shrink-0 bg-[#EFE8DF]"
                                  />
                                  <div>
                                    <span className="font-serif-title font-bold text-[#2D241E] block line-clamp-1">
                                      {book.title}
                                    </span>
                                    <span className="text-xs text-[#735F52] block line-clamp-1">
                                      {book.author}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-[#5A483E]">
                                <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DFC8] text-xs">
                                  {book.genre}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-[#5C3218]">
                                <div className="font-bold">
                                  {formatPrice(book.price, settings.currencySymbol, book.currency || 'USD')}
                                </div>
                                {bcvRates && (book.currency || 'USD') !== 'VES' && (
                                  <div className="text-[10px] text-[#735F52] font-medium">
                                    ≈ {calculateBcvBreakdown(book.price, book.currency || 'USD', bcvRates).bolivaresFormatted}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={book.status}
                                  onChange={(e) =>
                                    onUpdateBookStatus(book.id, e.target.value as BookStatus)
                                  }
                                  className={`text-xs font-semibold py-1 px-2 rounded-lg border focus:outline-none cursor-pointer ${statusDetails.badgeBg}`}
                                >
                                  <option value="disponible">🟢 Disponible</option>
                                  <option value="bajo_pedido">🟡 Bajo Pedido</option>
                                  <option value="agotado">⚪ Agotado</option>
                                </select>
                              </td>

                              <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => onToggleFeatured(book.id)}
                                  title={book.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                                  className="p-1 rounded-lg hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      book.featured
                                        ? 'fill-amber-400 text-amber-500'
                                        : 'text-[#D4C3B3]'
                                    }`}
                                  />
                                </button>
                              </td>

                              <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditModal(book)}
                                    className="px-2.5 py-1 text-xs font-bold text-[#5C3218] bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E8DFC8] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    title="Modificar publicación"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Modificar</span>
                                  </button>
                                  <button
                                    onClick={() => setBookToDelete(book)}
                                    className="p-1 text-[#A89484] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar publicación"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#8C7464]">
                            No se encontraron libros con los filtros actuales.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECCIÓN 2: CATÁLOGOS Y GÉNEROS (Explorar género en portada) */}
        {/* ========================================================================= */}
        {activeTab === 'catalogs' && (
          <div className="max-w-6xl mx-auto">
            <CatalogsManager
              catalogs={catalogs}
              books={books}
              onAddCatalog={onAddCatalog || (() => ({ success: false, error: 'No disponible' }))}
              onUpdateCatalog={onUpdateCatalog || (() => ({ success: false, error: 'No disponible' }))}
              onDeleteCatalog={onDeleteCatalog || (() => ({ success: false }))}
              onReorderCatalogs={onReorderCatalogs || (() => {})}
              onResetCatalogs={onResetCatalogs || (() => {})}
              onFilterByCatalog={(catalogName) => {
                setInventorySearch(catalogName);
                setInventoryStatus('all');
                setActiveTab('publications');
              }}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECCIÓN 3: WHATSAPP */}
        {/* ========================================================================= */}
        {activeTab === 'whatsapp' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {whatsappSavedMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>¡Configuración de WhatsApp guardada con éxito!</span>
              </div>
            )}

            <form onSubmit={handleSaveWhatsApp} className="space-y-6">
              {/* WhatsApp Main Settings Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD0] shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#F0E8DD]">
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 text-[#128C7E] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 fill-[#25D366]" />
                  </div>
                  <div>
                    <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#3B2213]">
                      Configuración de Pedidos por WhatsApp
                    </h2>
                    <p className="text-xs text-[#735F52]">
                      Configura el número oficial de atención y la plantilla del mensaje de compra
                    </p>
                  </div>
                </div>

                {/* WhatsApp Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                    Número de WhatsApp Receptor (con código de país sin símbolos + ni espacios) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="admin-whatsapp-number-input"
                      value={tempSettings.whatsappNumber}
                      onChange={(e) =>
                        setTempSettings((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                      }
                      placeholder="ej. 573158901234 (57 Colombia, 52 México, 54 Argentina, etc.)"
                      className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm font-mono text-[#2D241E] focus:outline-none focus:border-[#8C5E3C]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-[#8C7464] mt-1.5">
                    A este número se enviarán los mensajes automáticos cada vez que un cliente pulse "Comprar por WhatsApp".
                  </p>
                </div>

                {/* WhatsApp Message Template */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                    Plantilla del Mensaje de Compra Directa *
                  </label>
                  <textarea
                    rows={5}
                    id="admin-whatsapp-template-input"
                    value={tempSettings.whatsappTemplate}
                    onChange={(e) =>
                      setTempSettings((prev) => ({ ...prev, whatsappTemplate: e.target.value }))
                    }
                    placeholder="Escribe la plantilla de mensaje..."
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] leading-relaxed"
                    required
                  />

                  {/* Dynamic Variables Chips */}
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-[#5A483E] block mb-2">
                      Haz clic para insertar variables dinámicas en el mensaje:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '{titulo}', desc: 'Título del libro' },
                        { label: '{autor}', desc: 'Nombre del autor' },
                        { label: '{precio}', desc: 'Precio formateado' },
                        { label: '{estado}', desc: 'Disponibilidad' },
                        { label: '{tienda}', desc: 'Nombre de la librería' },
                        { label: '{genero}', desc: 'Género' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleInsertVariable(item.label)}
                          className="px-3 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E8DFC8] text-xs font-mono font-bold text-[#5C3218] transition-colors cursor-pointer"
                          title={item.desc}
                        >
                          + {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Preview of WhatsApp Chat Bubble */}
                <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EAE2D5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5C3218] flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      Vista Previa en Tiempo Real del Mensaje
                    </span>
                    {sampleWhatsAppClean && (
                      <a
                        href={sampleWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Probar en WhatsApp Web</span>
                      </a>
                    )}
                  </div>

                  {/* WhatsApp Simulation bubble */}
                  <div className="bg-[#E7FFDB] p-4 rounded-2xl rounded-tl-xs border border-[#C5E8B7] text-xs text-[#1E3F18] whitespace-pre-line leading-relaxed shadow-xs font-sans">
                    {buildWhatsAppMessage(sampleBook, tempSettings)}
                    <div className="text-[10px] text-right text-[#5A7C54] mt-2 font-medium">
                      10:45 AM • ✓✓
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="admin-save-whatsapp-btn"
                    className="inline-flex items-center gap-2 bg-[#128C7E] hover:bg-[#0d6e63] text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Configuración de WhatsApp</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECCIÓN 3: TIENDA */}
        {/* ========================================================================= */}
        {activeTab === 'store' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {storeSavedMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>¡Ajustes comerciales y de seguridad actualizados con éxito!</span>
              </div>
            )}

            <form onSubmit={handleSaveStore} className="space-y-6">
              {/* Store Commercial Information Section */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD0] shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#F0E8DD]">
                  <div className="w-12 h-12 rounded-2xl bg-[#5C3218]/10 text-[#5C3218] flex items-center justify-center shrink-0">
                    <StoreIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#3B2213]">
                      Información Comercial de la Tienda
                    </h2>
                    <p className="text-xs text-[#735F52]">
                      Personaliza el nombre de la librería, símbolo de moneda, medios de pago y ubicación
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                      Nombre de la Librería *
                    </label>
                    <input
                      type="text"
                      value={tempSettings.storeName}
                      onChange={(e) =>
                        setTempSettings((prev) => ({ ...prev, storeName: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm focus:outline-none focus:border-[#8C5E3C]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                      Símbolo de Moneda *
                    </label>
                    <input
                      type="text"
                      value={tempSettings.currencySymbol}
                      onChange={(e) =>
                        setTempSettings((prev) => ({ ...prev, currencySymbol: e.target.value }))
                      }
                      placeholder="ej. $ o COP"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm focus:outline-none focus:border-[#8C5E3C]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                      Eslogan o Frase de Presentación
                    </label>
                    <input
                      type="text"
                      value={tempSettings.tagline}
                      onChange={(e) =>
                        setTempSettings((prev) => ({ ...prev, tagline: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm focus:outline-none focus:border-[#8C5E3C]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                      Métodos de Pago Informados al Cliente
                    </label>
                    <input
                      type="text"
                      value={tempSettings.paymentMethods}
                      onChange={(e) =>
                        setTempSettings((prev) => ({ ...prev, paymentMethods: e.target.value }))
                      }
                      placeholder="ej. Transferencia Bancaria, Nequi, Daviplata, Efectivo contra entrega"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm focus:outline-none focus:border-[#8C5E3C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                      Ubicación / Cobertura de Envíos
                    </label>
                    <input
                      type="text"
                      value={tempSettings.storeLocation}
                      onChange={(e) =>
                        setTempSettings((prev) => ({ ...prev, storeLocation: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm focus:outline-none focus:border-[#8C5E3C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                      Correo de Contacto
                    </label>
                    <input
                      type="email"
                      value={tempSettings.contactEmail}
                      onChange={(e) =>
                        setTempSettings((prev) => ({ ...prev, contactEmail: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm focus:outline-none focus:border-[#8C5E3C]"
                    />
                  </div>
                </div>
              </div>

              {/* Security & Admin Credentials Section */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD0] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0E8DD]">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-[#5C3218]" />
                    <h3 className="font-serif-title text-xl font-bold text-[#3B2213]">
                      Seguridad y Credenciales de Administrador
                    </h3>
                  </div>
                  <span className="text-xs text-[#735F52] bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#E5DACB]">
                    Acceso Protegido
                  </span>
                </div>

                <p className="text-xs text-[#735F52] leading-relaxed">
                  Actualiza el nombre de usuario o define una nueva contraseña para acceder al panel. Deja los campos de contraseña vacíos si deseas conservar la actual.
                </p>

                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                      Usuario de Administrador
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Nombre de usuario"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm focus:outline-none focus:border-[#8C5E3C] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva clave (opcional)"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm focus:outline-none focus:border-[#8C5E3C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva clave"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm focus:outline-none focus:border-[#8C5E3C]"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div>
                <button
                  type="submit"
                  id="admin-save-store-btn"
                  className="inline-flex items-center gap-2 bg-[#5C3218] hover:bg-[#472611] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Ajustes de la Tienda</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECCIÓN 4: MONITOR DE TASAS DEL DÍA (BCV & EURO) */}
        {/* ========================================================================= */}
        {activeTab === 'rates' && (
          <div className="max-w-6xl mx-auto">
            <AdminRatesMonitor
              bcvRates={
                bcvRates || {
                  usd: 400.0,
                  eur: 460.0,
                  lastUpdated: new Date().toLocaleDateString('es-VE'),
                  lastFetchedTimestamp: Date.now(),
                  isLive: false,
                  source: 'Banco Central de Venezuela (BCV)',
                }
              }
              books={books}
              onRefreshRates={onRefreshRates || (async () => {})}
              onUpdateRates={onUpdateRates || (() => {})}
            />
          </div>
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION DOCK (Barra Inferior con 3 Partes: Publicaciones, WhatsApp, Tienda) */}
      {!isEditorModalOpen && (
        <AdminBottomDock
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedBook={selectedBook}
          currencySymbol={settings.currencySymbol}
          bcvRates={bcvRates}
          totalBooksCount={books.length}
          catalogsCount={catalogs.length}
          onOpenAddModal={handleOpenAddModal}
          onEditSelected={() => {
            if (selectedBook) {
              handleOpenEditModal(selectedBook);
            }
          }}
          onDeselect={() => {
            setSelectedBookId(null);
            onSelectBook?.(null);
          }}
          onDeleteSelected={() => {
            if (selectedBook) {
              setBookToDelete(selectedBook);
            }
          }}
          onToggleFeaturedSelected={() => {
            if (selectedBook) {
              onToggleFeatured(selectedBook.id);
            }
          }}
          onCycleStatusSelected={handleCycleStatusSelected}
        />
      )}
    </div>
  );
};
