import { useState } from 'react';
import { motion } from 'motion/react';
import { Droplets, HeartPulse, Info, ArrowRight } from 'lucide-react';
import { ContactFormCard } from '../components/ContactFormCard';
import { AmbientImage } from '../components/AmbientImage';
import { getAmbientImage } from '../lib/images';

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.12 } as const;

interface ServicesPreventionViewProps {
  initialTopic?: 'depistage_hta' | 'depistage_diabete';
  onBookGeneral: () => void;
}

export function ServicesPreventionView({
  initialTopic = 'depistage_hta',
  onBookGeneral,
}: ServicesPreventionViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<
    'depistage_hta' | 'depistage_diabete'
  >(initialTopic);
  const preventionImg = getAmbientImage('prevention');

  const scrollToForm = (topic: 'depistage_hta' | 'depistage_diabete') => {
    setSelectedTopic(topic);
    const el = document.getElementById('prevention-info-form');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-14">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="lg:col-span-7"
        >
          <p className="text-xs font-semibold text-[#174B43] mb-2">
            Nos services · Prévention et dépistage
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
            Prévention et dépistage
          </h1>
          <p className="mt-4 text-base text-[#233B4A]/85 leading-relaxed max-w-2xl">
            La Clinique EVA propose des informations sur les dépistages de
            l’hypertension artérielle, du diabète et d’autres maladies
            chroniques. Contactez le secrétariat pour confirmer les examens et
            modalités disponibles.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-[#DCEFE7]/60 border border-[#83A99A]/30 flex items-start gap-3 text-xs sm:text-sm text-[#174B43]">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Cette page ne fournit pas de diagnostic ni de conseil médical.
              Les informations sur les examens doivent être confirmées auprès
              du secrétariat.
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="lg:col-span-5 h-64 rounded-2xl overflow-hidden border border-[#83A99A]/25"
        >
          <AmbientImage src={preventionImg.url} alt={preventionImg.alt} />
        </motion.div>
      </div>

      {/* Dépistage services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.45, ease: EASE }}
          whileHover={{ y: -3 }}
          className="bg-white rounded-3xl border border-[#83A99A]/25 p-8 flex flex-col justify-between transition-shadow hover:shadow-[0_14px_34px_rgba(23,75,67,0.07)]"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mb-5">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#174B43]">
              Dépistage de l’hypertension artérielle
            </h2>
            <div className="mt-4 space-y-3 text-sm sm:text-base text-[#233B4A]/85 leading-relaxed">
              <p>
                Contactez la Clinique EVA pour vérifier la disponibilité du
                dépistage et connaître les conditions d’accueil.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#83A99A]/20 flex flex-wrap items-center justify-between gap-4">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToForm('depistage_hta')}
              className="px-6 py-3 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors cursor-pointer"
            >
              Demander des informations
            </motion.button>
            <button
              type="button"
              onClick={onBookGeneral}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#174B43] hover:underline cursor-pointer"
            >
              Prendre rendez-vous
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
          whileHover={{ y: -3 }}
          className="bg-white rounded-3xl border border-[#83A99A]/25 p-8 flex flex-col justify-between transition-shadow hover:shadow-[0_14px_34px_rgba(23,75,67,0.07)]"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mb-5">
              <Droplets className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#174B43]">
              Dépistage du diabète
            </h2>
            <div className="mt-4 space-y-3 text-sm sm:text-base text-[#233B4A]/85 leading-relaxed">
              <p>
                Contactez la Clinique EVA pour vérifier les examens disponibles
                et connaître les modalités de prise en charge.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#83A99A]/20 flex flex-wrap items-center justify-between gap-4">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToForm('depistage_diabete')}
              className="px-6 py-3 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors cursor-pointer"
            >
              Demander des informations
            </motion.button>
            <button
              type="button"
              onClick={onBookGeneral}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#174B43] hover:underline cursor-pointer"
            >
              Prendre rendez-vous
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.article>
      </div>

      {/* Info Request Form */}
      <motion.div
        id="prevention-info-form"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.5, ease: EASE }}
        className="max-w-3xl mx-auto"
      >
        <ContactFormCard
          defaultTopic={selectedTopic}
          title="Demander des informations sur le dépistage"
          subtitle="Notre secrétariat vous recontacte pour vous communiquer les modalités pratiques d’accueil à la Clinique EVA."
        />
      </motion.div>
    </div>
  );
}