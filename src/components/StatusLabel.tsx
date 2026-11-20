import { CheckCircle2, Clock, CalendarClock, XCircle } from 'lucide-react';
import type { AppointmentStatus } from '../types';

export function AppointmentStatusLabel({
  status,
}: {
  status: AppointmentStatus | string;
}) {
  switch (status) {
    case 'confirme':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#174B43]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Confirmé par la clinique
        </span>
      );
    case 'reporte':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800">
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          Nouvelle date proposée
        </span>
      );
    case 'annule':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          Annulé
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#233B4A]">
          <Clock className="w-3.5 h-3.5 shrink-0 text-[#83A99A]" />
          En attente de validation
        </span>
      );
  }
}
