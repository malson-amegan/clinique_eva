import { useId } from 'react';
import { Clock } from 'lucide-react';
import { CLINIC_HOURS } from '../lib/clinicInfo';

export function ClinicHours() {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-2xl border border-[#83A99A]/25 bg-white p-5"
    >
      <h2
        id={titleId}
        className="flex items-center gap-2 text-base font-semibold text-[#174B43]"
      >
        <Clock className="h-4 w-4" aria-hidden="true" />
        Horaires d’ouverture
      </h2>
      <dl className="mt-4 space-y-2 text-sm">
        {CLINIC_HOURS.map(({ day, hours }) => (
          <div
            key={day}
            className="flex items-center justify-between gap-4 text-[#233B4A]/80"
          >
            <dt>{day}</dt>
            <dd className={hours === 'Fermé' ? 'font-medium' : 'tabular-nums'}>
              {hours}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-[#83A99A]/20 pt-3 text-xs text-[#233B4A]/65">
        Horaires d’accueil de la clinique. La disponibilité des consultations
        et services est confirmée par le secrétariat.
      </p>
    </section>
  );
}
