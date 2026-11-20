import React, { useEffect, useState } from 'react';
import {
  Calendar,
  LogOut,
  Save,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppointmentStatusLabel } from '../components/StatusLabel';
import type { Appointment } from '../types';

interface PatientPortalViewProps {
  onBook: () => void;
  onGoAdmin: () => void;
}

export function PatientPortalView({
  onBook,
  onGoAdmin,
}: PatientPortalViewProps) {
  const {
    firebaseUser,
    profile,
    loading,
    authError,
    signInWithGoogle,
    signOut,
    refreshProfile,
    apiFetch,
  } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [appointmentsReload, setAppointmentsReload] = useState(0);
  const [retryingProfile, setRetryingProfile] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!firebaseUser) {
      setAppointments([]);
      setAppointmentsError(null);
      return;
    }
    let cancelled = false;
    setLoadingAppts(true);
    setAppointmentsError(null);
    apiFetch<{ appointments: Appointment[] }>('/api/patient/appointments')
      .then((res) => {
        if (!cancelled) setAppointments(res.appointments);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setAppointmentsError(
            err instanceof Error
              ? err.message
              : 'Impossible de charger vos demandes.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAppts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [firebaseUser, apiFetch, appointmentsReload]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaved(false);
    setProfileError(null);
    try {
      await apiFetch('/api/patient/me', {
        method: 'PATCH',
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      await refreshProfile();
      setProfileSaved(true);
    } catch (err: unknown) {
      setProfileError(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-[#233B4A]/70">
        Chargement de votre espace sécurisé…
      </div>
    );
  }

  if (firebaseUser && !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="bg-white rounded-3xl border border-[#83A99A]/25 p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#174B43]">
            Espace patient temporairement indisponible
          </h1>
          <p className="mt-3 text-sm text-[#233B4A]/80 leading-relaxed">
            Votre connexion Google est active, mais le profil ne peut pas être
            chargé depuis le serveur. Réessayez ou contactez le secrétariat.
          </p>
          {authError && (
            <p className="mt-4 text-sm text-rose-700" role="alert">
              {authError}
            </p>
          )}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              disabled={retryingProfile}
              onClick={async () => {
                setRetryingProfile(true);
                await refreshProfile();
                setRetryingProfile(false);
              }}
              className="px-5 py-3 rounded-full bg-[#174B43] text-white text-sm font-medium disabled:opacity-60 cursor-pointer"
            >
              {retryingProfile ? 'Vérification…' : 'Réessayer'}
            </button>
            <button
              type="button"
              onClick={signOut}
              className="px-5 py-3 rounded-full border border-[#83A99A]/40 text-[#174B43] text-sm font-medium cursor-pointer"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!firebaseUser || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="bg-white rounded-3xl border border-[#83A99A]/25 p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#174B43]">
            Espace Patient Sécurisé
          </h1>
          <p className="mt-3 text-sm text-[#233B4A]/80 leading-relaxed">
            Connectez-vous ou créez votre espace personnel en un clic avec
            Google pour suivre le statut de vos demandes de rendez-vous et
            mettre à jour vos coordonnées administratives.
          </p>

          <p className="mt-3 text-xs text-[#233B4A]/65">
            Pour votre sécurité, aucun dossier médical électronique ni résultat
            d’examen n’est stocké sur cet espace.
          </p>

          {authError && (
            <p className="mt-4 text-xs font-medium text-rose-700">
              {authError}
            </p>
          )}

          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-7 w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            Continuer avec Google
          </button>
        </div>
      </div>
    );
  }

  const isStaff = ['staff', 'admin', 'super_admin'].includes(profile.role);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#83A99A]/25">
        <div>
          <p className="text-xs font-semibold text-[#174B43] mb-1">
            Espace patient · {profile.email}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#174B43]">
            Bonjour
            {profile.firstName ? `, ${profile.firstName}` : ''}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isStaff && (
            <button
              type="button"
              onClick={onGoAdmin}
              className="px-4 py-2 rounded-full bg-[#DCEFE7] text-[#174B43] text-xs font-semibold hover:bg-[#cde6dc] transition-colors cursor-pointer"
            >
              Ouvrir le Back-Office
            </button>
          )}
          <button
            type="button"
            onClick={onBook}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#174B43] text-white text-xs font-medium hover:bg-[#123c35] transition-colors cursor-pointer"
          >
            Nouvelle demande de RDV
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#83A99A]/40 text-xs font-medium text-[#233B4A] hover:bg-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#83A99A]/25 p-6">
          <h2 className="text-lg font-semibold text-[#174B43]">
            Mes coordonnées
          </h2>
          <p className="mt-1 text-xs text-[#233B4A]/70">
            Informations administratives utilisées pour pré-remplir vos
            demandes.
          </p>

          <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#233B4A] mb-1">
                Adresse email
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3.5 py-2 rounded-xl border border-[#83A99A]/25 bg-[#F5F8F6] text-sm text-[#233B4A]/65"
              />
            </div>

            <div>
              <label
                htmlFor="prof-lastname"
                className="block text-xs font-semibold text-[#233B4A] mb-1"
              >
                Nom
              </label>
              <input
                id="prof-lastname"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/50 text-sm focus:bg-white focus:border-[#174B43]"
              />
            </div>

            <div>
              <label
                htmlFor="prof-firstname"
                className="block text-xs font-semibold text-[#233B4A] mb-1"
              >
                Prénom
              </label>
              <input
                id="prof-firstname"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/50 text-sm focus:bg-white focus:border-[#174B43]"
              />
            </div>

            <div>
              <label
                htmlFor="prof-phone"
                className="block text-xs font-semibold text-[#233B4A] mb-1"
              >
                Téléphone
              </label>
              <input
                id="prof-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+228 90 00 00 00"
                className="w-full px-3.5 py-2 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/50 text-sm focus:bg-white focus:border-[#174B43]"
              />
            </div>

            {profileError && (
              <p className="text-xs text-rose-700">{profileError}</p>
            )}
            {profileSaved && (
              <p className="text-xs text-[#174B43] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Coordonnées enregistrées.
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Enregistrement…' : 'Mettre à jour'}
            </button>
          </form>
        </div>

        {/* Appointment Requests History */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#83A99A]/25 p-6">
          <h2 className="text-lg font-semibold text-[#174B43]">
            Historique de mes demandes de rendez-vous
          </h2>
          <p className="mt-1 text-xs text-[#233B4A]/70">
            Suivez l’avancement de vos demandes et les éventuelles propositions
            de créneaux du secrétariat.
          </p>

          {appointmentsError ? (
            <div className="py-8 text-center" role="alert">
              <p className="text-sm text-rose-700">{appointmentsError}</p>
              <button
                type="button"
                onClick={() => setAppointmentsReload((value) => value + 1)}
                className="mt-3 px-5 py-2.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-xs font-semibold cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          ) : loadingAppts ? (
            <div className="py-12 text-center text-sm text-[#233B4A]/65">
              Chargement de vos demandes…
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="w-8 h-8 text-[#83A99A] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#174B43]">
                Aucune demande enregistrée depuis ce compte
              </p>
              <p className="mt-1 text-xs text-[#233B4A]/70">
                Soumettez une nouvelle demande pour la suivre ici en temps réel.
              </p>
              <button
                type="button"
                onClick={onBook}
                className="mt-4 px-5 py-2.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-xs font-semibold hover:bg-[#cde6dc] transition-colors cursor-pointer"
              >
                Demander un rendez-vous
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-5 rounded-2xl bg-[#F5F8F6] border border-[#83A99A]/25 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-[#174B43] tabular-nums">
                        {appt.referenceCode}
                      </span>
                      <span className="text-xs text-[#233B4A]/60">
                        {new Date(appt.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <AppointmentStatusLabel status={appt.status} />
                  </div>

                  <p className="text-base font-semibold text-[#174B43]">
                    {appt.specialtyName}
                  </p>

                  <p className="text-xs text-[#233B4A]/80 tabular-nums">
                    Date souhaitée : {appt.preferredDate} · {appt.preferredSlot}
                  </p>

                  {appt.proposedDate && (
                    <p className="text-xs font-semibold text-amber-800 tabular-nums">
                      Nouvelle date proposée par la clinique :{' '}
                      {appt.proposedDate}{' '}
                      {appt.proposedSlot ? `(${appt.proposedSlot})` : ''}
                    </p>
                  )}

                  {appt.adminNote && (
                    <p className="text-xs text-[#233B4A]/80 pt-2 border-t border-[#83A99A]/20">
                      Note administrative : {appt.adminNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
