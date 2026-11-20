import React, { useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

interface ContactFormCardProps {
  defaultTopic?: 'general' | 'depistage_hta' | 'depistage_diabete' | 'autre';
  title?: string;
  subtitle?: string;
}

const TOPIC_LABELS: Record<string, string> = {
  general: 'Renseignement général',
  depistage_hta: 'Information sur le dépistage de l’hypertension',
  depistage_diabete: 'Information sur le dépistage du diabète',
  autre: 'Autre demande administrative',
};

export function ContactFormCard({
  defaultTopic = 'general',
  title = 'Envoyer un message au secrétariat',
  subtitle = 'Posez une question pratique ou demandez des informations sur nos services. Merci de ne pas transmettre de données médicales confidentielles.',
}: ContactFormCardProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(defaultTopic);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setTopic(defaultTopic);
  }, [defaultTopic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          topic,
          message,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Envoi impossible.');
      }
      setSuccessMsg(data.message);
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’envoi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6 sm:p-8">
      <h3 className="text-xl font-semibold text-[#174B43]">{title}</h3>
      <p className="mt-1.5 text-sm text-[#233B4A]/75 leading-relaxed">
        {subtitle}
      </p>

      {successMsg ? (
        <div className="mt-6 p-5 rounded-xl bg-[#DCEFE7]/60 border border-[#83A99A]/40 text-[#174B43]">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Message transmis</p>
              <p className="text-sm mt-1 leading-relaxed">{successMsg}</p>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="mt-4 text-xs font-semibold underline cursor-pointer"
              >
                Envoyer un autre message
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-fullname"
                className="block text-xs font-semibold text-[#233B4A] mb-1.5"
              >
                Nom et prénom *
              </label>
              <input
                id="contact-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex. : Kossi Mensah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm text-[#233B4A] focus:bg-white focus:border-[#174B43]"
              />
            </div>

            <div>
              <label
                htmlFor="contact-phone"
                className="block text-xs font-semibold text-[#233B4A] mb-1.5"
              >
                Téléphone *
              </label>
              <input
                id="contact-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+228 90 00 00 00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm text-[#233B4A] focus:bg-white focus:border-[#174B43]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs font-semibold text-[#233B4A] mb-1.5"
              >
                Email (facultatif)
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm text-[#233B4A] focus:bg-white focus:border-[#174B43]"
              />
            </div>

            <div>
              <label
                htmlFor="contact-topic"
                className="block text-xs font-semibold text-[#233B4A] mb-1.5"
              >
                Objet de la demande *
              </label>
              <select
                id="contact-topic"
                value={topic}
                onChange={(e) =>
                  setTopic(
                    e.target.value as
                      | 'general'
                      | 'depistage_hta'
                      | 'depistage_diabete'
                      | 'autre'
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm text-[#233B4A] focus:bg-white focus:border-[#174B43]"
              >
                {Object.entries(TOPIC_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs font-semibold text-[#233B4A] mb-1.5"
            >
              Votre message (non médical) *
            </label>
            <textarea
              id="contact-message"
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Indiquez simplement l’information pratique ou le renseignement souhaité…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm text-[#233B4A] focus:bg-white focus:border-[#174B43]"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] disabled:opacity-60 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
          </button>
        </form>
      )}
    </div>
  );
}
