import { MapPin, Phone, MessageCircle } from 'lucide-react';
import type { NavDestination } from './Navbar';
import { ClinicHours } from './ClinicHours';
import { CLINIC_INFO } from '../lib/clinicInfo';

interface FooterProps {
  onNavigate: (page: NavDestination) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#174B43] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-24 lg:pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-10">
          <div>
            <p className="text-xl font-bold tracking-tight text-white">
              {CLINIC_INFO.name}
            </p>
            <p className="mt-3 text-sm text-[#DCEFE7]/90 leading-relaxed max-w-xs">
              Établissement de soins de proximité à Agoè Démakpoé. Une écoute
              attentive et un accompagnement clair pour votre parcours de santé.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-sm text-[#DCEFE7]/85">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('accueil')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('clinique')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  La clinique & galerie
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('specialites')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Nos spécialités
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Prévention & dépistage
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('conseils')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Conseils santé
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Parcours patient
            </h3>
            <ul className="space-y-2.5 text-sm text-[#DCEFE7]/85">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('rendez-vous')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Demander un rendez-vous
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('espace-patient')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Espace patient
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('avis')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Avis patients modérés
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Questions fréquentes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accès administration
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Coordonnées vérifiées
            </h3>
            <ul className="space-y-3 text-sm text-[#DCEFE7]/90">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#83A99A]" />
                <span>
                  {CLINIC_INFO.address}
                  <br />
                  Repère : {CLINIC_INFO.landmark}
                </span>
              </li>
              <li>
                <a
                  href={`tel:${CLINIC_INFO.phoneLink}`}
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-[#83A99A]" />
                  <span className="tabular-nums">{CLINIC_INFO.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={CLINIC_INFO.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-[#83A99A]" />
                  <span>Écrire sur WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <ClinicHours />
            <a
              href={CLINIC_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-xs font-semibold text-[#DCEFE7] underline underline-offset-2"
            >
              Itinéraire Google Maps
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#DCEFE7]/75">
          <p>
            © {new Date().getFullYear()} {CLINIC_INFO.name} — Agoè Démakpoé, Lomé. Tous
            droits réservés.
          </p>
          <p>
            Les contenus d’information santé publiés sur cette plateforme ne
            remplacent pas une consultation médicale.
          </p>
        </div>
      </div>
    </footer>
  );
}
