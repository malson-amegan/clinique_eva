import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Search,
  ShieldAlert,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppointmentStatusLabel } from '../components/StatusLabel';
import { CLINIC_INFO } from '../lib/clinicInfo';
import type { Specialty } from '../types';

interface AppointmentViewProps {
  specialties: Specialty[];
  preselectedSpecialty?: string | null;
}

interface CreatedReceipt {
  referenceCode: string;
  specialtyName: string;
  preferredDate: string;
  preferredSlot: string;
  status: string;
}

interface LookupResult {
  referenceCode: string;
  firstName: string;
  lastName: string;
  specialtyName: string;
  preferredDate: string;
  preferredSlot: string;
  status: string;
  proposedDate: string | null;
  proposedSlot: string | null;
  adminNote: string | null;
}

export function AppointmentView({
  specialties,
  preselectedSpecialty,
}: AppointmentViewProps) {
  const { profile, apiFetch } = useAuth();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialtySlug, setSpecialtySlug] = useState(
    preselectedSpecialty || specialties[0]?.slug || 'medecine-generale'
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState<
    'Matin' | 'Après-midi' | 'Fin de journée'
  >('Matin');
  const [nonMedicalNote, setNonMedicalNote] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<CreatedReceipt | null>(null);

  // Reference lookup
  const [lookupRef, setLookupRef] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);

  useEffect(() => {
    if (preselectedSpecialty) {
      setSpecialtySlug(preselectedSpecialty);
    }
  }, [preselectedSpecialty]);

  useEffect(() => {
    if (profile) {
      if (!firstName && profile.firstName) setFirstName(profile.firstName);
      if (!lastName && profile.lastName) setLastName(profile.lastName);
      if (!phone && profile.phone) setPhone(profile.phone);
      if (!email && profile.email) setEmail(profile.email);
    }
  }, [profile]);

  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_INFO.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const selectedDateDay = preferredDate
    ? new Date(`${preferredDate}T12:00:00.000Z`).getUTCDay()
    : null;
  const clinicClosedOnSelectedDate = selectedDateDay === 0;
  const availableSlots =
    selectedDateDay === 6
      ? (['Matin'] as const)
      : (['Matin', 'Après-midi', 'Fin de journée'] as const);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await apiFetch<{ appointment: CreatedReceipt }>(
        '/api/appointments',
        {
          method: 'POST',
          body: JSON.stringify({
            lastName,
            firstName,
            phone,
            email,
            specialtySlug,
            preferredDate,
            preferredSlot,
            nonMedicalNote,
            website,
          }),
        }
      );
      setReceipt(data.appointment);
      setNonMedicalNote('');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la soumission de votre demande.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);
    setLookupLoading(true);
    try {
      const params = new URLSearchParams({
        reference: lookupRef.trim(),
        phone: lookupPhone.trim(),
      });
      const res = await fetch(`/api/appointments/lookup?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Demande introuvable.');
      }
      setLookupResult(data.appointment);
    } catch (err: unknown) {
      setLookupError(
        err instanceof Error ? err.message : 'Erreur de recherche.'
      );
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-semibold text-[#174B43] mb-2">
          Demande de rendez-vous en ligne
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
          Demander un rendez-vous à la Clinique EVA
        </h1>
        <p className="mt-3 text-base text-[#233B4A]/85 leading-relaxed">
          Remplissez ce formulaire simplifié. Toute demande génère un numéro de
          référence et reste en attente jusqu’à validation officielle par notre
          secrétariat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          {receipt ? (
            <div className="bg-white rounded-3xl border border-[#83A99A]/35 p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#174B43]">
                    Demande enregistrée (en attente de confirmation)
                  </h2>
                  <p className="mt-1.5 text-sm text-[#233B4A]/80 leading-relaxed">
                    Votre demande a bien été reçue par l’administration. Elle
                    n’est pas encore confirmée : le secrétariat vous contactera
                    pour valider le créneau définitif.
                  </p>
                </div>
              </div>

              <div className="bg-[#F5F8F6] rounded-2xl border border-[#83A99A]/25 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#233B4A]/65">
                    Référence de suivi
                  </p>
                  <p className="mt-1 font-mono font-semibold text-base text-[#174B43] tabular-nums">
                    {receipt.referenceCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#233B4A]/65">Statut actuel</p>
                  <div className="mt-1">
                    <AppointmentStatusLabel status={receipt.status} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#233B4A]/65">
                    Spécialité demandée
                  </p>
                  <p className="mt-1 font-medium text-[#233B4A]">
                    {receipt.specialtyName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#233B4A]/65">
                    Date & créneau souhaités
                  </p>
                  <p className="mt-1 font-medium text-[#233B4A] tabular-nums">
                    {receipt.preferredDate} · {receipt.preferredSlot}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReceipt(null)}
                  className="px-5 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors cursor-pointer"
                >
                  Faire une nouvelle demande
                </button>
                <a
                  href={`${CLINIC_INFO.whatsappLink}?text=${encodeURIComponent(
                    `Bonjour Clinique EVA, je viens d'enregistrer la demande de rendez-vous ${receipt.referenceCode} (${receipt.specialtyName}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-sm font-medium hover:bg-[#cde6dc] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contacter le secrétariat sur WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-[#83A99A]/25 p-6 sm:p-8 space-y-5"
            >
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="p-4 rounded-xl bg-[#DCEFE7]/55 border border-[#83A99A]/30 flex items-start gap-3 text-xs text-[#174B43]">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Par respect pour votre confidentialité, merci de ne pas
                  indiquer de symptômes détaillés, de diagnostic ou
                  d’informations médicales sensibles dans ce formulaire public.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rdv-lastname"
                    className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                  >
                    Nom *
                  </label>
                  <input
                    id="rdv-lastname"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rdv-firstname"
                    className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                  >
                    Prénom *
                  </label>
                  <input
                    id="rdv-firstname"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rdv-phone"
                    className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                  >
                    Téléphone *
                  </label>
                  <input
                    id="rdv-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+228 90 00 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rdv-email"
                    className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                  >
                    Email (facultatif)
                  </label>
                  <input
                    id="rdv-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rdv-specialty"
                  className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                >
                  Spécialité souhaitée *
                </label>
                <select
                  id="rdv-specialty"
                  value={specialtySlug}
                  onChange={(e) => setSpecialtySlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
                >
                  {specialties.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rdv-date"
                    className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                  >
                    Date souhaitée *
                  </label>
                  <input
                    id="rdv-date"
                    type="date"
                    required
                    min={todayIso}
                    value={preferredDate}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      setPreferredDate(nextDate);
                      if (
                        nextDate &&
                        new Date(`${nextDate}T12:00:00.000Z`).getUTCDay() === 6
                      ) {
                        setPreferredSlot('Matin');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm tabular-nums focus:bg-white focus:border-[#174B43]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="rdv-slot"
                    className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                  >
                    Créneau souhaité *
                  </label>
                  <select
                    id="rdv-slot"
                    value={preferredSlot}
                    onChange={(e) =>
                      setPreferredSlot(
                        e.target.value as
                          | 'Matin'
                          | 'Après-midi'
                          | 'Fin de journée'
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
                  >
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {selectedDateDay === 6 && (
                    <p className="mt-1.5 text-xs text-[#233B4A]/70">
                      Le samedi, la clinique ferme à 13 h 30 : seul le créneau
                      du matin peut être demandé.
                    </p>
                  )}
                  {clinicClosedOnSelectedDate && (
                    <p className="mt-1.5 text-xs font-medium text-rose-700" role="alert">
                      La clinique est fermée le dimanche. Choisissez un autre jour.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="rdv-note"
                  className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                >
                  Commentaire facultatif (non médical uniquement)
                </label>
                <textarea
                  id="rdv-note"
                  rows={3}
                  value={nonMedicalNote}
                  onChange={(e) => setNonMedicalNote(e.target.value)}
                  placeholder="Ex. : préférence de rappel par téléphone ou WhatsApp, première visite…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
                />
              </div>

              {error && (
                <p className="text-xs font-medium text-rose-700" role="alert">
                  {error}
                </p>
              )}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#233B4A]/70">
                  <Clock className="w-3.5 h-3.5" />
                  Demande à confirmer par le secrétariat
                </span>
                <button
                  type="submit"
                  disabled={submitting || clinicClosedOnSelectedDate}
                  className="px-7 py-3.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {submitting
                    ? 'Enregistrement…'
                    : 'Envoyer la demande de rendez-vous'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Side Column: Lookup & Direct Contact */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6">
            <h2 className="text-lg font-semibold text-[#174B43]">
              Suivre une demande existante
            </h2>
            <p className="mt-1.5 text-xs text-[#233B4A]/75 leading-relaxed">
              Vérifiez le statut de votre demande avec votre référence (ex. :
              EVA-20261113-XXXX) et votre numéro de téléphone.
            </p>

            <form onSubmit={handleLookup} className="mt-4 space-y-3">
              <input
                type="text"
                required
                value={lookupRef}
                onChange={(e) => setLookupRef(e.target.value)}
                placeholder="Référence (EVA-...)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm font-mono uppercase focus:bg-white focus:border-[#174B43]"
              />
              <input
                type="tel"
                required
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                placeholder="Numéro de téléphone utilisé"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-sm font-medium hover:bg-[#cde6dc] transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                {lookupLoading ? 'Recherche…' : 'Vérifier le statut'}
              </button>
            </form>

            {lookupError && (
              <p className="mt-3 text-xs text-rose-700 font-medium">
                {lookupError}
              </p>
            )}

            {lookupResult && (
              <div className="mt-4 p-4 rounded-xl bg-[#F5F8F6] border border-[#83A99A]/25 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-[#174B43]">
                    {lookupResult.referenceCode}
                  </span>
                  <AppointmentStatusLabel status={lookupResult.status} />
                </div>
                <p className="font-medium text-[#233B4A]">
                  {lookupResult.specialtyName}
                </p>
                <p className="text-xs text-[#233B4A]/75 tabular-nums">
                  Souhait initial : {lookupResult.preferredDate} ·{' '}
                  {lookupResult.preferredSlot}
                </p>
                {lookupResult.proposedDate && (
                  <p className="text-xs font-semibold text-amber-800 tabular-nums">
                    Créneau proposé par la clinique :{' '}
                    {lookupResult.proposedDate}{' '}
                    {lookupResult.proposedSlot
                      ? `(${lookupResult.proposedSlot})`
                      : ''}
                  </p>
                )}
                {lookupResult.adminNote && (
                  <p className="text-xs text-[#233B4A]/80 pt-1 border-t border-[#83A99A]/20">
                    Note du secrétariat : {lookupResult.adminNote}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#174B43] text-white rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold">
              Besoin d’échanger directement ?
            </h3>
            <p className="text-xs text-[#DCEFE7]/85 leading-relaxed">
              Le secrétariat de la Clinique EVA à Agoè Démakpoé répond à vos
              appels et messages WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${CLINIC_INFO.phoneLink}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#174B43] text-xs font-semibold"
              >
                <Phone className="w-3.5 h-3.5" />
                +228 90 72 20 01
              </a>
              <a
                href={CLINIC_INFO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-xs font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
