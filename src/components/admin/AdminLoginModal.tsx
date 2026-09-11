import React, { useState } from 'react';
import { X, Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (success) {
      setError(false);
      setPassword('');
      setUsername('');
      onClose();
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setError(false);
    setPassword('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#E8DFD0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        id="admin-login-modal"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#8C7464] hover:text-[#3B2213] rounded-full hover:bg-[#FAF7F2] transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#5C3218] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-brand text-xl font-bold text-[#3B2213]">
            Acceso al Panel de Administrador
          </h3>
          <p className="text-xs text-[#735F52] mt-1">
            Gestión privada de publicaciones, catálogo y ajustes de Books EM
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Usuario */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
              Usuario de Administrador
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7464]">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                id="admin-username-input"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Usuario"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7464]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password-input"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7464] hover:text-[#3B2213]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 mt-2 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Credenciales incorrectas. Verifica el usuario y la contraseña.</span>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#E5DACB] text-xs font-semibold text-[#6E5A4E] hover:bg-[#FAF7F2] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="admin-submit-login-btn"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#5C3218] hover:bg-[#472611] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Ingresar al Panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
