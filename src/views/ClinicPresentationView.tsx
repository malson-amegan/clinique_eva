import { ArrowRight, MapPin, Phone, MessageCircle, Info } from 'lucide-react';
import { AmbientImage } from '../components/AmbientImage';
import { ClinicHours } from '../components/ClinicHours';
import clinicFacade from '../assets/images/clinique-eva-facade.jpeg';
import clinicExterior from '../assets/images/clinique-eva-exterieur.jpeg';
import { CLINIC_INFO } from '../lib/clinicInfo';
import type { GalleryItem, InstitutionalPage } from '../types';

interface ClinicPresentationViewProps {
  institutional: InstitutionalPage[];
  gallery: GalleryItem[];
  onBook: () => void;
  onContact: () => void;
}

export function ClinicPresentationView({
  institutional,
  gallery,
  onBook,
  onContact,
}: ClinicPresentationViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#174B43] mb-2">
          La Clinique EVA · Agoè Démakpoé, Lomé
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
          Présentation institutionnelle & valeurs de soins
        </h1>
        <p className="mt-4 text-base text-[#233B4A]/85 leading-relaxed">
          Une structure de santé de proximité pensée pour l’écoute, la clarté
          des informations et un accompagnement attentif des patients à Lomé.
        </p>
      </div>

      {/* Institutional CMS Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {institutional.map((item, idx) => (
          <article
            key={item.id}
            className="bg-white rounded-2xl border border-[#83A99A]/25 p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 text-xs text-[#233B4A]/65 mb-3">
                <span className="font-mono tabular-nums">
                  0{idx + 1}
                </span>
                <span>
                  {item.isValidated
                    ? 'Contenu validé par la direction'
                    : 'Texte indicatif en attente de validation'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[#174B43]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#233B4A]/85 leading-relaxed">
                {item.body}
              </p>
            </div>
          </article>
        ))}

        {/* Verified Practical Information Card */}
        <article className="bg-[#174B43] text-white rounded-2xl p-7 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#DCEFE7] mb-2">
              Repères vérifiés
            </p>
            <h2 className="text-xl font-semibold text-white">
              Accès et accueil des patients
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[#DCEFE7]/90">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#83A99A]" />
                <span>
                  {CLINIC_INFO.address} (repère : {CLINIC_INFO.landmark})
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-[#83A99A]" />
                <a
                  href={`tel:${CLINIC_INFO.phoneLink}`}
                  className="tabular-nums underline"
                >
                  {CLINIC_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 shrink-0 text-[#83A99A]" />
                <a
                  href={CLINIC_INFO.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  WhatsApp secrétariat
                </a>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#174B43] text-sm font-semibold hover:bg-[#DCEFE7] transition-colors cursor-pointer"
            >
              Prendre rendez-vous
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onContact}
              className="px-5 py-2.5 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
            >
              Nous contacter
            </button>
          </div>
        </article>
        <ClinicHours />
      </div>

      {/* Gallery */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#174B43] tracking-tight">
              La Clinique EVA en images
            </h2>
            <p className="mt-2 text-sm text-[#233B4A]/75 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#174B43] shrink-0" />
              <span>
                Photographies de l’extérieur de la clinique.
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              src: clinicExterior,
              title: 'Vue extérieure de la Clinique EVA',
              alt: 'Façade et entrée extérieure de la Clinique EVA',
            },
            {
              src: clinicFacade,
              title: 'Façade de la Clinique EVA',
              alt: 'Vue de la façade de la Clinique EVA à Agoè Démakpoé',
            },
          ].map((photo) => (
            <figure
              key={photo.title}
              className="overflow-hidden rounded-2xl border border-[#83A99A]/25 bg-white"
            >
              <div className="h-56 w-full">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="p-5 text-sm font-semibold text-[#174B43]">
                {photo.title}
              </figcaption>
            </figure>
          ))}
          {gallery.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#83A99A]/25 overflow-hidden flex flex-col"
            >
              <div className="h-56 w-full">
                <AmbientImage src={item.imageUrl} alt={item.title} />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-[#174B43]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs text-[#233B4A]/75 leading-relaxed">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
