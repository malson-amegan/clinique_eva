import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clinicLogo from '../assets/images/logo-clinique-eva.jpeg';

const EASE = [0.22, 1, 0.36, 1] as const;

export type NavDestination =
  | 'accueil'
  | 'clinique'
  | 'specialites'
  | 'services'
  | 'conseils'
  | 'contact'
  | 'rendez-vous'
  | 'avis'
  | 'faq'
  | 'espace-patient'
  | 'admin';

interface NavbarProps {
  currentPage: NavDestination;
  onNavigate: (page: NavDestination) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAuth();
  const isStaff =
    profile && ['staff', 'admin', 'super_admin'].includes(profile.role);

  const navItems: { id: NavDestination; label: string }[] = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'clinique', label: 'La clinique' },
    { id: 'specialites', label: 'Nos spécialités' },
    { id: 'services', label: 'Nos services' },
    { id: 'conseils', label: 'Conseils santé' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNav = (id: NavDestination) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const isAccountActive =
    currentPage === 'espace-patient' || currentPage === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#83A99A]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNav('accueil')}
          aria-label="Clinique EVA — accueil"
          className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <img
            src={clinicLogo}
            alt=""
            className="h-10 w-14 rounded-md object-contain"
          />
          <span
            className="text-lg font-bold tracking-tight text-[#174B43]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Clinique EVA
          </span>
        </motion.button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#233B4A]"
        >
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative whitespace-nowrap shrink-0 py-1.5 transition-colors cursor-pointer ${
                  active
                    ? 'text-[#174B43] font-semibold'
                    : 'text-[#233B4A]/80 hover:text-[#174B43]'
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="navbar-active-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#174B43]"
                  />
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleNav(isStaff ? 'admin' : 'espace-patient')}
            className={`relative whitespace-nowrap shrink-0 py-1.5 transition-colors cursor-pointer ${
              isAccountActive
                ? 'text-[#174B43] font-semibold'
                : 'text-[#233B4A]/80 hover:text-[#174B43]'
            }`}
          >
            {isStaff ? 'Administration' : 'Espace patient'}
            {isAccountActive && (
              <motion.span
                layoutId="navbar-active-underline"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#174B43]"
              />
            )}
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleNav('rendez-vous')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Prendre rendez-vous
          </motion.button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-[#174B43] hover:bg-[#DCEFE7]/60 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="lg:hidden overflow-hidden border-t border-[#83A99A]/20 bg-white"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-[#DCEFE7] text-[#174B43] font-semibold'
                      : 'text-[#233B4A] hover:bg-[#F5F8F6]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleNav('espace-patient')}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#233B4A] hover:bg-[#F5F8F6]"
              >
                Espace patient
              </button>
              {isStaff && (
                <button
                  type="button"
                  onClick={() => handleNav('admin')}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#174B43] hover:bg-[#F5F8F6]"
                >
                  Espace administrateur
                </button>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNav('rendez-vous')}
                  className="w-full py-3 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors"
                >
                  Prendre rendez-vous
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}