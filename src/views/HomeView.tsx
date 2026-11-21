import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  HeartPulse,
  Droplets,
  ArrowUpRight,
} from 'lucide-react';
import { AmbientImage } from '../components/AmbientImage';
import { ClinicMap } from '../components/ClinicMap';
import { ContactFormCard } from '../components/ContactFormCard';
import { SpecialtyIcon } from '../components/SpecialtyIcon';
import { getAmbientImage } from '../lib/images';
import clinicExterior from '../assets/images/clinique-eva-exterieur.jpeg';
import clinicFacade from '../assets/images/clinique-eva-facade.jpeg';
import clinicLogo from '../assets/images/logo-clinique-eva.jpeg';
import { CLINIC_INFO, CLINIC_HOURS_SUMMARY } from '../lib/clinicInfo';
import type { NavDestination } from '../components/Navbar';
import type { PublicHomeData } from '../types';

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.12 } as const;

interface HomeViewProps {
  data: PublicHomeData;
  mapsApiKey: string;
  onNavigate: (page: NavDestination) => void;
  onSelectSpecialty: (slug: string) => void;
  onBookSpecialty: (slug?: string) => void;
  onRequestPreventionInfo: (
    topic: 'depistage_hta' | 'depistage_diabete'
  ) => void;
}

export function HomeView({
  data,
  mapsApiKey,
  onNavigate,
  onSelectSpecialty,
  onBookSpecialty,
  onRequestPreventionInfo,
}: HomeViewProps) {
  const [openFaqId, setOpenFaqId] = useState<number | null>(
    data.faqs[0]?.id ?? null
  );

  const nephroImg = getAmbientImage('nephrology');
  const womensImg = getAmbientImage('womens');
  const preventionImg = getAmbientImage('prevention');

  const nephrology = data.specialties.find((s) => s.slug === 'nephrologie');

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#F4F1E8]">
        <motion.div
          aria-hidden="true"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-40 -top-44 h-[34rem] w-[34rem] rounded-full border border-[#174B43]/10"
        />
        <motion.div
          aria-hidden="true"
          animate={{ scale: [1, 0.96, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-24 -top-28 h-[25rem] w-[25rem] rounded-full border border-[#174B43]/10"
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-4 lg:px-8 lg:py-16">
          <div className="relative z-10 lg:col-span-6 lg:row-start-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-[#174B43]/15 bg-white/70 px-3.5 py-2 text-xs font-semibold tracking-wide text-[#174B43] shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-[#B87957]" />
              CLINIQUE DE PROXIMITÉ · LOMÉ, TOGO
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
              className="mt-7 max-w-2xl text-[clamp(3.35rem,8vw,6.2rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-[#174B43]"
            >
              La santé,
              <br />
              <span className="font-normal italic text-[#A65F48]">
                avec attention.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: EASE }}
              className="mt-6 max-w-xl text-base leading-7 text-[#233B4A]/80 sm:text-lg sm:leading-8"
            >
              À Agoè Démakpoé, la Clinique EVA vous accueille avec une offre de
              soins de proximité et une équipe attentive à votre parcours.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.14, ease: EASE }}
            className="relative mx-auto w-full max-w-xl lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:max-w-none"
          >
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-[#D9A17F]/35 blur-2xl"
            />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-3 top-8 z-10 hidden rounded-full border border-white/70 bg-[#F8F6EF]/90 px-4 py-2.5 text-xs font-semibold text-[#174B43] shadow-lg backdrop-blur sm:block lg:-right-5"
            >
              Votre repère santé à Lomé
            </motion.div>

            <div className="relative aspect-[1.7] overflow-hidden rounded-[2rem] border-[6px] border-white shadow-[0_28px_70px_rgba(35,59,74,0.18)] sm:aspect-[1.8] lg:aspect-[0.88] lg:rounded-[48%_48%_2rem_2rem]">
              <picture className="block h-full w-full">
                <source
                  media="(max-width: 1023px)"
                  srcSet={clinicExterior}
                />
                <img
                  src={clinicFacade}
                  alt="Façade de la Clinique EVA à Agoè Démakpoé"
                  className="h-full w-full object-cover object-[center_48%]"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-[#102d29]/65 via-transparent to-[#102d29]/5" />
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
                className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-[#FBF9F3]/95 p-3 shadow-xl backdrop-blur-md sm:gap-4 sm:p-4">
                  <img
                    src={clinicLogo}
                    alt=""
                    className="h-12 w-14 shrink-0 rounded-xl bg-white object-contain p-1 sm:h-14 sm:w-16"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A65F48]">
                      Clinique EVA
                    </p>
                    <p className="mt-0.5 text-sm font-semibold leading-snug text-[#174B43] sm:text-base">
                      Agoè Démakpoé, Lomé
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[#233B4A]/65">
                      Derrière le Bar Le Sourire
                    </p>
                  </div>
                  <motion.a
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.94 }}
                    href={CLINIC_INFO.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ouvrir l’itinéraire Google Maps"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#174B43] text-white transition-colors hover:bg-[#A65F48]"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </motion.a>
                </div>
              </motion.div>
            </div>

            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute -bottom-5 right-5 hidden rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-medium text-[#174B43] shadow-lg backdrop-blur sm:block lg:right-0"
            >
              Accueil · Soins de proximité
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24, ease: EASE }}
            className="relative z-10 lg:col-span-6 lg:row-start-2"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onBookSpecialty()}
                className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#174B43] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(23,75,67,0.18)] transition-colors hover:bg-[#123c35] hover:shadow-[0_16px_34px_rgba(23,75,67,0.24)] cursor-pointer"
              >
                Demander un rendez-vous
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href={`tel:${CLINIC_INFO.phoneLink}`}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[#174B43]/20 bg-white/60 px-5 py-3.5 text-sm font-semibold text-[#174B43] transition-colors hover:border-[#174B43]/50 hover:bg-white"
              >
                <Phone className="h-4 w-4" />
                {CLINIC_INFO.phone}
              </motion.a>
            </div>

            <div className="mt-6 grid max-w-xl grid-cols-1 gap-4 border-t border-[#174B43]/15 pt-5 sm:grid-cols-2 sm:gap-6 lg:mt-7">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A65F48]" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#233B4A]/55">
                    Nous trouver
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#174B43]">
                    {CLINIC_INFO.address}
                  </p>
                  <p className="text-xs text-[#233B4A]/65">
                    {CLINIC_INFO.landmark}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-[1.5px] border-[#A65F48] p-[3px]">
                  <span className="block h-full w-full rounded-full bg-[#A65F48]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#233B4A]/55">
                    Horaires d’accueil
                  </p>
                  <p className="mt-1 text-sm font-medium leading-5 text-[#174B43]">
                    {CLINIC_HOURS_SUMMARY}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BANDEAU DOMAINES */}
      <section
        aria-label="Spécialités et services de la Clinique EVA"
        className="bg-[#174B43] text-white"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-5 sm:px-6 lg:px-8">
          <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9A17F]">
            Nos domaines
          </p>
          <div className="flex min-w-max items-center gap-3 sm:gap-5">
            {[
              'Néphrologie',
              'Gynécologie',
              'Consultations prénatales',
              'Médecine générale',
              'Analyses biomédicales',
              'Imagerie médicale',
            ].map((service, idx) => (
              <motion.span
                key={service}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05, ease: EASE }}
                className="inline-flex items-center gap-3 whitespace-nowrap text-xs font-medium text-white/90 sm:text-sm"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[#D9A17F]"
                />
                {service}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* 1. PRÉSENTATION DE LA CLINIQUE */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.5, ease: EASE }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold text-[#174B43] mb-2">
              01. La Clinique EVA
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#174B43] tracking-tight">
              Une clinique de proximité humaine, claire et structurée.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <p className="text-base text-[#233B4A]/85 leading-relaxed">
              Implantée à Agoè Démakpoé, Lomé, la Clinique EVA accueille chaque
              patient dans un environnement pensé pour inspirer calme et
              confiance. Notre organisation privilégie la qualité de l’écoute,
              la simplicité des démarches et une orientation adaptée à vos
              besoins médicaux.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('clinique')}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#174B43] hover:underline cursor-pointer"
              >
                Découvrir la présentation complète de la clinique
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. NOS PRINCIPALES SPÉCIALITÉS */}
      <section className="bg-white border-y border-[#83A99A]/20 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
          >
            <div>
              <p className="text-xs font-semibold text-[#174B43] mb-2">
                02. Domaines de soins
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#174B43] tracking-tight">
                Nos principales spécialités et services
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('specialites')}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#174B43] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Voir tout le catalogue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.specialties.map((spec, index) => (
              <motion.article
                key={spec.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index * 0.06, 0.3),
                  ease: EASE,
                }}
                whileHover={{ y: -4 }}
                className="bg-[#F5F8F6] rounded-2xl border border-[#83A99A]/25 p-6 flex flex-col justify-between transition-colors hover:border-[#174B43]/40 hover:shadow-[0_14px_32px_rgba(23,75,67,0.08)]"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mb-5">
                    <SpecialtyIcon name={spec.iconName} className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#174B43]">
                    {spec.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-[#233B4A]/80 leading-relaxed">
                    {spec.shortDescription}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#83A99A]/20 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectSpecialty(spec.slug)}
                    className="group text-sm font-semibold text-[#174B43] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Consulter la fiche
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onBookSpecialty(spec.slug)}
                    className="text-xs font-medium text-[#233B4A]/75 hover:text-[#174B43] cursor-pointer"
                  >
                    Demander un RDV
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FOCUS SUR LA NÉPHROLOGIE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE }}
          className="bg-[#174B43] text-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-[0_20px_50px_rgba(23,75,67,0.14)]"
        >
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <p className="text-xs font-semibold text-[#DCEFE7] mb-3">
              03. Focus spécialité
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Néphrologie : prévenir et suivre la santé rénale avec rigueur
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#DCEFE7]/90 leading-relaxed max-w-2xl">
              {nephrology?.isValidated
                ? nephrology.fullDescription
                : 'La Clinique EVA propose un service de néphrologie. Contactez le secrétariat pour confirmer les modalités et disponibilités.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onBookSpecialty('nephrologie')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#174B43] text-sm font-semibold hover:bg-[#DCEFE7] transition-colors cursor-pointer"
              >
                Demander un rendez-vous en néphrologie
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button
                type="button"
                onClick={() => onSelectSpecialty('nephrologie')}
                className="text-sm font-medium text-[#DCEFE7] hover:text-white underline underline-offset-4 cursor-pointer"
              >
                En savoir plus
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 min-h-[260px] relative">
            <AmbientImage src={nephroImg.url} alt={nephroImg.alt} />
          </div>
        </motion.div>
      </section>

      {/* 4. SUIVI DE LA SANTÉ FÉMININE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE }}
          className="bg-white rounded-3xl border border-[#83A99A]/25 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
        >
          <div className="lg:col-span-5 min-h-[280px] order-2 lg:order-1">
            <AmbientImage src={womensImg.url} alt={womensImg.alt} />
          </div>
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center order-1 lg:order-2">
            <p className="text-xs font-semibold text-[#174B43] mb-3">
              04. Gynécologie & suivi prénatal
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#174B43] tracking-tight">
              Un accompagnement attentif pour la santé féminine et la grossesse
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#233B4A]/85 leading-relaxed">
              La Clinique EVA propose des consultations de gynécologie et un
              suivi prénatal. Contactez le secrétariat pour connaître les
              modalités et disponibilités.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectSpecialty('gynecologie')}
                className="px-5 py-2.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-sm font-medium hover:bg-[#cde6dc] transition-colors cursor-pointer"
              >
                Gynécologie
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectSpecialty('consultations-prenatales')}
                className="px-5 py-2.5 rounded-full bg-[#F5F8F6] border border-[#83A99A]/35 text-[#233B4A] text-sm font-medium hover:border-[#174B43] transition-colors cursor-pointer"
              >
                Consultations prénatales
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. PRÉVENTION ET DÉPISTAGE */}
      <section className="bg-[#DCEFE7]/45 border-y border-[#83A99A]/25 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.45, ease: EASE }}
            className="max-w-2xl mb-10"
          >
            <p className="text-xs font-semibold text-[#174B43] mb-2">
              05. Prévention et dépistage
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#174B43] tracking-tight">
              S’informer tôt face aux maladies chroniques
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#233B4A]/80 leading-relaxed">
              Contenus pédagogiques informatifs. Aucun diagnostic automatique ni
              recommandation thérapeutique personnalisée n’est réalisé en ligne.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.45, ease: EASE }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border border-[#83A99A]/25 p-7 flex flex-col justify-between transition-shadow hover:shadow-[0_14px_32px_rgba(23,75,67,0.07)]"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mb-4">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#174B43]">
                  Comprendre l’intérêt du dépistage de l’hypertension
                </h3>
                <p className="mt-3 text-sm text-[#233B4A]/80 leading-relaxed">
                  Contactez le secrétariat pour connaître les modalités de
                  dépistage de l’hypertension artérielle proposées par la
                  Clinique EVA.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-[#83A99A]/20 flex items-center justify-between gap-4">
                <span className="text-xs text-[#233B4A]/65">
                  Sous réserve de validation médicale
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onRequestPreventionInfo('depistage_hta')}
                  className="px-5 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Demander des informations
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border border-[#83A99A]/25 p-7 flex flex-col justify-between transition-shadow hover:shadow-[0_14px_32px_rgba(23,75,67,0.07)]"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mb-4">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#174B43]">
                  Comprendre l’intérêt du dépistage du diabète
                </h3>
                <p className="mt-3 text-sm text-[#233B4A]/80 leading-relaxed">
                  Contactez le secrétariat pour connaître les modalités de
                  dépistage du diabète et les services disponibles.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-[#83A99A]/20 flex items-center justify-between gap-4">
                <span className="text-xs text-[#233B4A]/65">
                  Sous réserve de validation médicale
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onRequestPreventionInfo('depistage_diabete')}
                  className="px-5 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Demander des informations
                </motion.button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className="mt-8 rounded-2xl overflow-hidden border border-[#83A99A]/25 bg-white grid grid-cols-1 md:grid-cols-12 items-center"
          >
            <div className="md:col-span-5 h-52 md:h-60">
              <AmbientImage src={preventionImg.url} alt={preventionImg.alt} />
            </div>
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <h3 className="text-lg font-semibold text-[#174B43]">
                  Explorer nos fiches conseils et prévention
                </h3>
                <p className="mt-1.5 text-sm text-[#233B4A]/80 leading-relaxed">
                  Retrouvez nos articles d’information sur la santé rénale, le
                  suivi prénatal, l’hypertension et le diabète.
                </p>
              </div>
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('conseils')}
                className="px-5 py-2.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-sm font-semibold hover:bg-[#cde6dc] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Lire les conseils santé
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. NOS ENGAGEMENTS & 7. PARCOURS DE PRISE DE RENDEZ-VOUS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <p className="text-xs font-semibold text-[#174B43] mb-2">
                06. Nos engagements
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#174B43] tracking-tight">
                Des repères simples pour votre sérénité
              </h2>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  title: 'Écoute attentive',
                  desc: 'Un accueil humain et respectueux à chaque étape de votre passage.',
                },
                {
                  title: 'Validation transparente',
                  desc: 'Chaque demande en ligne est vérifiée et confirmée par le secrétariat.',
                },
                {
                  title: 'Minimisation des données',
                  desc: 'Aucune information médicale sensible n’est demandée dans les formulaires publics.',
                },
                {
                  title: 'Orientation claire',
                  desc: 'Coordination simple entre médecine générale, spécialités, analyses et imagerie.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.45, delay: idx * 0.07, ease: EASE }}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-2xl border border-[#83A99A]/25 p-5 transition-shadow hover:shadow-[0_12px_28px_rgba(23,75,67,0.06)]"
                >
                  <ShieldCheck className="w-5 h-5 text-[#174B43] mb-3" />
                  <h3 className="text-base font-semibold text-[#174B43]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#233B4A]/80 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE }}
            className="lg:col-span-6 bg-white rounded-3xl border border-[#83A99A]/25 p-7 sm:p-10 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-[#174B43] mb-2">
                07. Parcours de prise de rendez-vous
              </p>
              <h2 className="text-2xl font-bold text-[#174B43] tracking-tight">
                Comment fonctionne votre demande ?
              </h2>
              <ol className="mt-6 space-y-5">
                {[
                  {
                    step: '01',
                    title: 'Formulaire simplifié et confidentiel',
                    desc: 'Choisissez votre spécialité, la date et le créneau souhaité sans transmettre de détails médicaux sensibles.',
                  },
                  {
                    step: '02',
                    title: 'Réception immédiate d’une référence',
                    desc: 'Un code de suivi unique est généré. Votre demande est alors enregistrée au statut « En attente ».',
                  },
                  {
                    step: '03',
                    title: 'Confirmation par la Clinique EVA',
                    desc: 'Notre secrétariat valide votre créneau ou vous propose une nouvelle date adaptée. Aucun rendez-vous n’est définitif avant cette validation.',
                  },
                ].map((etape, idx) => (
                  <motion.li
                    key={etape.step}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.4, delay: idx * 0.1, ease: EASE }}
                    className="flex gap-4"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#DCEFE7] text-[#174B43] text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                      {etape.step}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#174B43]">
                        {etape.title}
                      </h3>
                      <p className="text-sm text-[#233B4A]/80 mt-1">
                        {etape.desc}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
            <div className="mt-8 pt-6 border-t border-[#83A99A]/20">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onBookSpecialty()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors cursor-pointer"
              >
                Faire une demande de rendez-vous
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="bg-white border-y border-[#83A99A]/20 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
          >
            <div>
              <p className="text-xs font-semibold text-[#174B43] mb-2">
                08. Questions fréquentes
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#174B43] tracking-tight">
                Réponses aux questions courantes
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('avis')}
              className="text-sm font-semibold text-[#174B43] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Voir les avis patients
            </button>
          </motion.div>

          <div className="divide-y divide-[#83A99A]/20 border border-[#83A99A]/25 rounded-2xl bg-[#F5F8F6]/50">
            {data.faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="p-5 sm:p-6">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="text-base font-semibold text-[#174B43]">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="shrink-0 text-[#174B43]"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-sm text-[#233B4A]/85 leading-relaxed pr-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. CONTACT ET LOCALISATION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.5, ease: EASE }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20"
      >
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#174B43] mb-2">
            09. Contact et localisation
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#174B43] tracking-tight">
            Nous situer et nous contacter à Agoè Démakpoé
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-[#233B4A]/60">
                  Adresse & repère
                </p>
                <p className="mt-1 text-base font-semibold text-[#174B43]">
                  Clinique EVA
                </p>
                <p className="text-sm text-[#233B4A]/85 mt-0.5">
                  {CLINIC_INFO.address}
                  <br />
                  Repère : {CLINIC_INFO.landmark}
                </p>
              </div>

              <div className="pt-4 border-t border-[#83A99A]/20 flex flex-wrap gap-3">
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href={`tel:${CLINIC_INFO.phoneLink}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="tabular-nums">{CLINIC_INFO.phone}</span>
                </motion.a>
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href={CLINIC_INFO.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-sm font-medium hover:bg-[#cde6dc] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </motion.a>
              </div>
            </div>

            <ClinicMap apiKey={mapsApiKey} />
          </div>

          <div className="lg:col-span-7">
            <ContactFormCard />
          </div>
        </div>
      </motion.section>
    </div>
  );
}