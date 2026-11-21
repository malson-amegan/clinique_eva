import { motion } from 'motion/react';
import { ArrowRight, MapPin, Phone, MessageCircle, Info } from 'lucide-react';
import { AmbientImage } from '../components/AmbientImage';
import { ClinicHours } from '../components/ClinicHours';
import clinicFacade from '../assets/images/clinique-eva-facade.jpeg';
import clinicExterior from '../assets/images/clinique-eva-exterieur.jpeg';
import { CLINIC_INFO } from '../lib/clinicInfo';
import type { GalleryItem, InstitutionalPage } from '../types';

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.12 } as const;

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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="max-w-3xl"
      >
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
      </motion.div>

      {/* Institutional CMS Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {institutional.map((item, idx) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{
              duration: 0.45,
              delay: Math.min(idx * 0.06, 0.25),
              ease: EASE,
            }}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl border border-[#83A99A]/25 p-7 flex flex-col justify-between transition-shadow hover:shadow-[0_12px_30px_rgba(23,75,67,0.06)]"
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
          </motion.article>
        ))}

        {/* Verified Practical Information Card */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, ease: EASE }}
          className="bg-[#174B43] text-white rounded-2xl p-7 flex flex-col justify-between shadow-[0_16px_40px_rgba(23,75,67,0.12)]"
        >
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
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBook}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#174B43] text-sm font-semibold hover:bg-[#DCEFE7] transition-colors cursor-pointer"
            >
              Prendre rendez-vous
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onContact}
              className="px-5 py-2.5 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
            >
              Nous contacter
            </motion.button>
          </div>
        </motion.article>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
        >
          <ClinicHours />
        </motion.div>
      </div>

      {/* Gallery */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.45, ease: EASE }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
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
        </motion.div>

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
          ].map((photo, idx) => (
            <motion.figure
              key={photo.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.45, delay: idx * 0.07, ease: EASE }}
              whileHover={{ y: -4 }}
              className="group overflow-hidden rounded-2xl border border-[#83A99A]/25 bg-white transition-shadow hover:shadow-[0_14px_32px_rgba(23,75,67,0.08)]"
            >
              <div className="h-56 w-full overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="p-5 text-sm font-semibold text-[#174B43]">
                {photo.title}
              </figcaption>
            </motion.figure>
          ))}
          {gallery.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{
                duration: 0.45,
                delay: Math.min((idx + 2) * 0.06, 0.3),
                ease: EASE,
              }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-2xl border border-[#83A99A]/25 overflow-hidden flex flex-col transition-shadow hover:shadow-[0_14px_32px_rgba(23,75,67,0.08)]"
            >
              <div className="h-56 w-full overflow-hidden">
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
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}