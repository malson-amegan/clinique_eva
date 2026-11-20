import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { AmbientImage } from '../components/AmbientImage';
import { SpecialtyIcon } from '../components/SpecialtyIcon';
import { getAmbientImage } from '../lib/images';
import { CLINIC_INFO } from '../lib/clinicInfo';
import type { Specialty } from '../types';

interface SpecialtiesViewProps {
  specialties: Specialty[];
  selectedSlug: string | null;
  onSelectSlug: (slug: string | null) => void;
  onBookSpecialty: (slug: string) => void;
}

export function SpecialtiesView({
  specialties,
  selectedSlug,
  onSelectSlug,
  onBookSpecialty,
}: SpecialtiesViewProps) {
  const activeSpecialty = selectedSlug
    ? specialties.find((s) => s.slug === selectedSlug) || null
    : null;

  if (activeSpecialty) {
    const img = getAmbientImage(activeSpecialty.imageKey);
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <button
          type="button"
          onClick={() => onSelectSlug(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#174B43] hover:underline mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue des spécialités
        </button>

        <div className="bg-white rounded-3xl border border-[#83A99A]/25 overflow-hidden">
          <div className="h-64 sm:h-80 w-full relative">
            <AmbientImage src={img.url} alt={activeSpecialty.title} />
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] text-[#233B4A]/80">
              {img.creditNote}
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#233B4A]/70 mb-4">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#174B43]">
                <SpecialtyIcon
                  name={activeSpecialty.iconName}
                  className="w-4 h-4"
                />
                Spécialité clinique
              </span>
              <span aria-hidden="true">·</span>
              {activeSpecialty.isValidated ? (
                <span className="inline-flex items-center gap-1 text-[#174B43] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Contenu validé par la Clinique EVA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#233B4A]/70">
                  <Clock className="w-3.5 h-3.5" />
                  Sous réserve de validation médicale par la clinique
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
              {activeSpecialty.title}
            </h1>

            <p className="mt-5 text-base text-[#233B4A]/90 leading-relaxed max-w-3xl">
              {activeSpecialty.fullDescription}
            </p>

            <div className="mt-8 p-6 rounded-2xl bg-[#F5F8F6] border border-[#83A99A]/25">
              <h2 className="text-sm font-semibold text-[#174B43]">
                {activeSpecialty.isValidated
                  ? 'Informations pratiques confirmées par la clinique'
                  : 'Modalités à confirmer auprès du secrétariat'}
              </h2>
              <p className="mt-2 text-sm text-[#233B4A]/85 leading-relaxed">
                {activeSpecialty.practicalInfo}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onBookSpecialty(activeSpecialty.slug)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors cursor-pointer"
              >
                Prendre rendez-vous en {activeSpecialty.title.toLowerCase()}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={`tel:${CLINIC_INFO.phoneLink}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-sm font-medium hover:bg-[#cde6dc] transition-colors"
              >
                Appeler le {CLINIC_INFO.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold text-[#174B43] mb-2">
          Catalogue des spécialités médicales
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
          Des domaines de soins dédiés à votre parcours de santé
        </h1>
        <p className="mt-4 text-base text-[#233B4A]/85 leading-relaxed">
          Consultez chaque fiche spécialité pour connaître les modalités de
          prise en charge et soumettre une demande de rendez-vous adaptée.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialties.map((spec) => {
          const img = getAmbientImage(spec.imageKey);
          return (
            <article
              key={spec.id}
              className="bg-white rounded-2xl border border-[#83A99A]/25 overflow-hidden flex flex-col justify-between hover:border-[#174B43]/40 transition-colors"
            >
              <div>
                <div className="h-44 w-full">
                  <AmbientImage src={img.url} alt={spec.title} />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center">
                      <SpecialtyIcon
                        name={spec.iconName}
                        className="w-5 h-5"
                      />
                    </div>
                    <span className="text-[11px] text-[#233B4A]/60">
                      {spec.isValidated ? 'Fiche validée' : 'À valider'}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#174B43]">
                    {spec.title}
                  </h2>
                  <p className="mt-2.5 text-sm text-[#233B4A]/80 leading-relaxed">
                    {spec.shortDescription}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-[#83A99A]/15 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectSlug(spec.slug)}
                  className="text-sm font-semibold text-[#174B43] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Découvrir la spécialité
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onBookSpecialty(spec.slug)}
                  className="px-4 py-2 rounded-full bg-[#174B43] text-white text-xs font-medium hover:bg-[#123c35] transition-colors cursor-pointer"
                >
                  Rendez-vous
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
