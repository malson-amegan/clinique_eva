import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { ClinicMap } from '../components/ClinicMap';
import { ContactFormCard } from '../components/ContactFormCard';
import { ClinicHours } from '../components/ClinicHours';
import { CLINIC_INFO } from '../lib/clinicInfo';

export function ContactView({ mapsApiKey }: { mapsApiKey: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold text-[#174B43] mb-2">
          Contact & accès
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
          Joindre la Clinique EVA à Agoè Démakpoé
        </h1>
        <p className="mt-3 text-base text-[#233B4A]/85 leading-relaxed">
          Consultez nos coordonnées et horaires, appelez directement l’accueil
          ou envoyez un message au secrétariat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#83A99A]/25 p-7 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#174B43]">
                Coordonnées de l’établissement
              </h2>
              <div className="mt-4 space-y-4 text-sm text-[#233B4A]/85">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#174B43] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#174B43]">
                      {CLINIC_INFO.name}
                    </p>
                    <p>{CLINIC_INFO.address}</p>
                    <p className="text-[#233B4A]/70">
                      Repère : {CLINIC_INFO.landmark}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#174B43] shrink-0" />
                  <div>
                    <p className="text-xs text-[#233B4A]/65">
                      Téléphone direct
                    </p>
                    <a
                      href={`tel:${CLINIC_INFO.phoneLink}`}
                      className="font-semibold text-[#174B43] tabular-nums hover:underline"
                    >
                      {CLINIC_INFO.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-[#83A99A]/20 flex flex-wrap gap-3">
              <a
                href={`tel:${CLINIC_INFO.phoneLink}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Appel direct
              </a>
              <a
                href={CLINIC_INFO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-sm font-medium hover:bg-[#cde6dc] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          <ClinicMap apiKey={mapsApiKey} />
          <a
            href={CLINIC_INFO.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#174B43] underline underline-offset-2"
          >
            Ouvrir l’itinéraire vers la clinique
          </a>
          <ClinicHours />
        </div>

        <div className="lg:col-span-7">
          <ContactFormCard />
        </div>
      </div>
    </div>
  );
}
