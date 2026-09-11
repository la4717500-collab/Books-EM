import React from 'react';
import { Phone, Mail, MapPin, Download } from 'lucide-react';
import { StoreSettings } from '../types';
import { BooksEmLogo } from './BotanicalElements';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface FooterProps {
  settings: StoreSettings;
  onOpenInstallPrompt?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenInstallPrompt }) => {
  const { isInstalled } = usePWAInstall();
  return (
    <footer className="bg-[#2C211A] text-[#D8C7B9] border-t border-[#443328] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#3E2F25]">
          {/* Column 1: Brand & Philosophy */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-start">
              <BooksEmLogo size="sm" showSubtitle={false} showSlogan={false} theme="dark" className="items-start text-left" />
            </div>
            <p className="text-xs sm:text-sm text-[#BBA595] leading-relaxed max-w-md">
              {settings.tagline}. Seleccionamos títulos que despiertan la imaginación, enriquecen el pensamiento crítico y acompañan tus momentos de lectura.
            </p>
            <div className="pt-2">
              <p className="font-serif-title italic text-xs text-[#9E8777]">
                «Un libro es un sueño que tienes en tus manos.» — Neil Gaiman
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF7F2]">
              Navegación Rápida
            </h4>
            <ul className="space-y-2 text-xs text-[#BBA595]">
              <li>
                <a href="#catalog-section" className="hover:text-white transition-colors">
                  Catálogo General
                </a>
              </li>
              <li>
                <a href="#how-to-buy-section" className="hover:text-white transition-colors">
                  ¿Cómo solicitar por WhatsApp?
                </a>
              </li>
              {!isInstalled && onOpenInstallPrompt && (
                <li>
                  <button
                    onClick={onOpenInstallPrompt}
                    id="footer-install-app-btn"
                    className="hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C49B76]" />
                    <span>Instalar app en tu dispositivo</span>
                  </button>
                </li>
              )}
              <li>
                <span className="text-[#8C7464]">Pedidos especiales bajo encargo</span>
              </li>
              <li>
                <span className="text-[#8C7464]">Envíos protegidos a todo el país</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Direct Purchase */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF7F2]">
              Atención y Envíos
            </h4>
            <ul className="space-y-2.5 text-xs text-[#BBA595]">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C49B76]" />
                <span>WhatsApp: +{settings.whatsappNumber || 'No configurado'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C49B76]" />
                <span>{settings.contactEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C49B76]" />
                <span>{settings.storeLocation}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright (No admin access here) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8F796B]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.</span>
          </div>
          <div className="text-[11px] text-[#8F796B]">
            <span>Cotizaciones con equivalencia oficial BCV del Banco Central de Venezuela</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
