import { useState, useEffect } from 'react';
import { Book, BookStatus, StoreSettings } from '../types';
import { INITIAL_BOOKS, DEFAULT_STORE_SETTINGS } from '../data/initialData';
import { BcvRates, getStoredBcvRates, syncBcvRates } from '../services/bcvRates';

const BOOKS_STORAGE_KEY = 'books_em_catalog_v1';
const SETTINGS_STORAGE_KEY = 'books_em_settings_v1';
const WISHLIST_STORAGE_KEY = 'books_em_wishlist_v1';
const ADMIN_SESSION_KEY = 'books_em_admin_session_v1';
const CATALOGS_STORAGE_KEY = 'books_em_catalogs_v1';

export const DEFAULT_CATALOGS: string[] = [
  'Realismo Mágico',
  'Desarrollo Personal',
  'Misterio y Novela',
  'Ciencia Ficción Distópica',
  'Clásicos y Filosofía',
  'Romance y Clásicos',
];

export function useBooksStore() {
  const [bcvRates, setBcvRates] = useState<BcvRates>(getStoredBcvRates);

  useEffect(() => {
    let isMounted = true;
    syncBcvRates().then((rates) => {
      if (isMounted) setBcvRates(rates);
    }).catch((err) => {
      console.warn('Initial BCV rates sync failed:', err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize existing books to have currency and sane dollar/euro prices if they had old large values
          return parsed.map((b: Book) => {
            const cur = b.currency || 'USD';
            let p = b.price;
            if (p > 1000 && cur !== 'VES') {
              p = Math.round(p / 3500) || 15;
            }
            // Ensure images array exists and has at least coverUrl, and sync with initial data if available
            let imgs = Array.isArray(b.images) && b.images.length > 0 ? b.images.filter(Boolean) : [];
            if (imgs.length === 0 && b.coverUrl) {
              imgs = [b.coverUrl];
            }
            // Check if initial book has gallery images
            const initialMatch = INITIAL_BOOKS.find(ib => ib.id === b.id);
            if (imgs.length <= 1 && initialMatch?.images && initialMatch.images.length > 1) {
              imgs = initialMatch.images;
            }
            const primaryCover = imgs[0] || b.coverUrl || '';
            return {
              ...b,
              currency: cur,
              price: p,
              coverUrl: primaryCover,
              images: imgs.length > 0 ? imgs : [primaryCover],
            };
          });
        }
      }
    } catch (e) {
      console.error('Error reading books from localStorage:', e);
    }
    return INITIAL_BOOKS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.adminUsername) {
          parsed.adminUsername = DEFAULT_STORE_SETTINGS.adminUsername;
        }
        if (!parsed.adminPassword) {
          parsed.adminPassword = DEFAULT_STORE_SETTINGS.adminPassword;
        }
        return { ...DEFAULT_STORE_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Error reading settings from localStorage:', e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading wishlist from localStorage:', e);
    }
    return [];
  });

  const [catalogs, setCatalogs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CATALOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: unknown) => String(c).trim()).filter(Boolean);
        }
      }
    } catch (e) {
      console.error('Error reading catalogs from localStorage:', e);
    }
    return DEFAULT_CATALOGS;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Sync to localStorage with resilience against QuotaExceededError
  useEffect(() => {
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (e: unknown) {
      console.error('Error saving books to localStorage:', e);
      const isQuotaError =
        e instanceof DOMException &&
        (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
      if (isQuotaError) {
        console.warn('Almacenamiento local lleno. Optimizando catálogo para conservar datos esenciales...');
        try {
          // Keep essential fields and trim oversized data strings to preserve user inventory
          const lightweight = books.map((b) => ({
            ...b,
            images: (b.images || []).map((img) =>
              img.startsWith('data:image') && img.length > 150000 ? (b.coverUrl?.startsWith('http') ? b.coverUrl : '') : img
            ).filter(Boolean),
          }));
          localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(lightweight));
        } catch (innerErr) {
          console.error('No se pudo guardar el catálogo optimizado:', innerErr);
        }
      }
    }
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify(catalogs));
    } catch (e) {
      console.error('Error saving catalogs to localStorage:', e);
    }
  }, [catalogs]);

  useEffect(() => {
    try {
      if (isAdminLoggedIn) {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } else {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    } catch (e) {
      console.error('Error saving admin session:', e);
    }
  }, [isAdminLoggedIn]);

  // Handle URL hash '#admin' for quick route access
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')) {
        setIsAdminOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const addBook = (newBookData: Omit<Book, 'id' | 'createdAt'>) => {
    const images = Array.isArray(newBookData.images) && newBookData.images.length > 0
      ? newBookData.images.filter(Boolean)
      : (newBookData.coverUrl ? [newBookData.coverUrl] : []);
    const coverUrl = images[0] || newBookData.coverUrl || '';

    const newBook: Book = {
      ...newBookData,
      id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
      coverUrl,
      images: images.length > 0 ? images : [coverUrl],
    };
    setBooks(prev => [newBook, ...prev]);
    return newBook;
  };

  const updateBook = (updated: Book) => {
    const images = Array.isArray(updated.images) && updated.images.length > 0
      ? updated.images.filter(Boolean)
      : (updated.coverUrl ? [updated.coverUrl] : []);
    const coverUrl = images[0] || updated.coverUrl || '';

    const sanitizedBook: Book = {
      ...updated,
      coverUrl,
      images: images.length > 0 ? images : [coverUrl],
    };

    setBooks(prev => prev.map(b => (b.id === sanitizedBook.id ? sanitizedBook : b)));
    if (selectedBook?.id === sanitizedBook.id) {
      setSelectedBook(sanitizedBook);
    }
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    setWishlistIds(prev => prev.filter(wId => wId !== id));
    if (selectedBook?.id === id) {
      setSelectedBook(null);
    }
  };

  const toggleFeatured = (id: string) => {
    setBooks(prev =>
      prev.map(b => (b.id === id ? { ...b, featured: !b.featured } : b))
    );
  };

  const updateBookStatus = (id: string, status: BookStatus) => {
    setBooks(prev =>
      prev.map(b => (b.id === id ? { ...b, status } : b))
    );
  };

  const updateSettings = (newFields: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newFields }));
  };

  const resetToDefaults = () => {
    setBooks(INITIAL_BOOKS);
    setSettings(DEFAULT_STORE_SETTINGS);
    setWishlistIds([]);
    setCatalogs(DEFAULT_CATALOGS);
    localStorage.removeItem(BOOKS_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    localStorage.removeItem(CATALOGS_STORAGE_KEY);
  };

  const addCatalog = (name: string): { success: boolean; error?: string } => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: 'El nombre del catálogo no puede estar vacío.' };
    }
    if (catalogs.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, error: 'Ya existe un catálogo con este nombre.' };
    }
    setCatalogs((prev) => [...prev, trimmed]);
    return { success: true };
  };

  const updateCatalog = (
    oldName: string,
    newName: string,
    updateBooks = true
  ): { success: boolean; error?: string } => {
    const trimmedNew = newName.trim();
    if (!trimmedNew) {
      return { success: false, error: 'El nombre del catálogo no puede estar vacío.' };
    }
    if (
      oldName.toLowerCase() !== trimmedNew.toLowerCase() &&
      catalogs.some((c) => c.toLowerCase() === trimmedNew.toLowerCase())
    ) {
      return { success: false, error: 'Ya existe otro catálogo con este nombre.' };
    }

    setCatalogs((prev) => prev.map((c) => (c === oldName ? trimmedNew : c)));

    if (updateBooks) {
      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.genre?.trim().toLowerCase() === oldName.trim().toLowerCase()
            ? { ...b, genre: trimmedNew }
            : b
        )
      );
    }
    return { success: true };
  };

  const deleteCatalog = (
    nameToDelete: string,
    reassignTo?: string
  ): { success: boolean } => {
    setCatalogs((prev) => prev.filter((c) => c !== nameToDelete));
    if (reassignTo) {
      const target = reassignTo.trim();
      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.genre?.trim().toLowerCase() === nameToDelete.trim().toLowerCase()
            ? { ...b, genre: target }
            : b
        )
      );
    }
    return { success: true };
  };

  const reorderCatalogs = (newOrder: string[]) => {
    setCatalogs(newOrder);
  };

  const resetCatalogs = () => {
    setCatalogs(DEFAULT_CATALOGS);
    try {
      localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify(DEFAULT_CATALOGS));
    } catch (e) {
      console.warn('Error resetting catalogs:', e);
    }
  };

  const importCatalog = (importedBooks: Book[]) => {
    if (Array.isArray(importedBooks) && importedBooks.length > 0) {
      setBooks(importedBooks);
    }
  };

  const toggleWishlist = (bookId: string) => {
    setWishlistIds(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const loginAdmin = (username: string, password: string): boolean => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const expectedUser = (settings.adminUsername || DEFAULT_STORE_SETTINGS.adminUsername || '').trim().toLowerCase();
    const expectedPass = (settings.adminPassword || DEFAULT_STORE_SETTINGS.adminPassword || '').trim();

    const isUserValid = cleanUser === expectedUser;
    const isPassValid = cleanPass === expectedPass;

    if (isUserValid && isPassValid) {
      setIsAdminLoggedIn(true);
      setIsAdminOpen(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setIsAdminOpen(false);
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const updateBcvRates = (newRates: BcvRates) => {
    setBcvRates(newRates);
    try {
      localStorage.setItem('books_em_bcv_rates', JSON.stringify(newRates));
    } catch (e) {
      console.warn('Error saving custom BCV rates:', e);
    }
  };

  return {
    books,
    settings,
    bcvRates,
    refreshBcvRates: () => syncBcvRates(true).then((rates) => {
      setBcvRates(rates);
      return rates;
    }),
    updateBcvRates,
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
    catalogs,
    addCatalog,
    updateCatalog,
    deleteCatalog,
    reorderCatalogs,
    resetCatalogs,
    loginAdmin,
    logoutAdmin,
  };
}
