import React, { useState } from 'react';
import { ChevronDown, MessageSquarePlus, Star, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { FaqItem, PublicReview } from '../types';

interface ReviewsViewProps {
  reviews: PublicReview[];
}

export function ReviewsView({ reviews }: ReviewsViewProps) {
  const { profile, apiFetch } = useAuth();
  const [authorName, setAuthorName] = useState(
    profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : ''
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const data = await apiFetch<{ message: string }>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ authorName, rating, comment, website }),
      });
      setSuccessMsg(data.message);
      setComment('');
      setRating(5);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de l’envoi de l’avis.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold text-[#174B43] mb-2">
          Avis et témoignages modérés
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
          Retours d’expérience de nos patients
        </h1>
        <p className="mt-3 text-base text-[#233B4A]/85 leading-relaxed">
          Conformément à notre charte de transparence, aucun témoignage n’est
          fabriqué : seuls les avis authentiques soumis par nos patients et
          validés par l’équipe de modération sont publiés ici.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#83A99A]/25 p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mx-auto mb-4">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-[#174B43]">
                Aucun avis validé publié pour le moment
              </h2>
              <p className="mt-2.5 text-sm text-[#233B4A]/75 max-w-md mx-auto leading-relaxed">
                Soyez le premier patient à partager votre retour sur l’accueil et
                l’accompagnement à la Clinique EVA. Votre avis apparaîtra dès sa
                validation par notre équipe.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="bg-white rounded-2xl border border-[#83A99A]/25 p-6"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-[#174B43]">
                        {rev.authorName}
                      </p>
                      <p className="text-xs text-[#233B4A]/60">
                        {new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-0.5 text-amber-500"
                      aria-label={`Note : ${rev.rating} sur 5`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#233B4A]/85 leading-relaxed">
                    {rev.comment}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-[#83A99A]/25 p-7">
            <h2 className="text-xl font-semibold text-[#174B43]">
              Partager votre avis
            </h2>
            <p className="mt-1.5 text-xs text-[#233B4A]/75 leading-relaxed">
              Votre témoignage est relu par l’équipe avant mise en ligne. Merci
              de ne mentionner aucune donnée médicale confidentielle.
            </p>

            {successMsg ? (
              <div className="mt-5 p-5 rounded-xl bg-[#DCEFE7]/60 border border-[#83A99A]/35 text-[#174B43]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Avis reçu</p>
                    <p className="text-xs mt-1 leading-relaxed">{successMsg}</p>
                    <button
                      type="button"
                      onClick={() => setSuccessMsg(null)}
                      className="mt-3 text-xs font-semibold underline cursor-pointer"
                    >
                      Rédiger un autre avis
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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

                <div>
                  <label
                    htmlFor="rev-author"
                    className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                  >
                    Nom ou pseudonyme *
                  </label>
                  <input
                    id="rev-author"
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ex. : Ama K."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
                  />
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#233B4A] mb-1.5">
                    Note *
                  </span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                        className="p-1.5 rounded-lg hover:bg-[#F5F8F6] cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-medium text-[#233B4A]/70 ml-1 tabular-nums">
                      {rating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rev-comment"
                    className="block text-xs font-semibold text-[#233B4A] mb-1.5"
                  >
                    Votre commentaire *
                  </label>
                  <textarea
                    id="rev-comment"
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre appréciation sur l’accueil, l’écoute ou l’organisation…"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6]/60 text-sm focus:bg-white focus:border-[#174B43]"
                  />
                </div>

                {error && (
                  <p className="text-xs font-medium text-rose-700">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {submitting ? 'Envoi…' : 'Soumettre mon avis'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqView({
  faqs,
  onContact,
}: {
  faqs: FaqItem[];
  onContact: () => void;
}) {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-[#174B43] mb-2">
          Foire aux questions
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
          Toutes les réponses à vos questions pratiques
        </h1>
        <p className="mt-3 text-base text-[#233B4A]/85 leading-relaxed">
          Informations vérifiées et administrées par l’établissement pour
          faciliter votre venue à Agoè Démakpoé.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#83A99A]/25 divide-y divide-[#83A99A]/20">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="p-6">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div>
                  <span className="block text-xs text-[#233B4A]/60 mb-1">
                    {faq.category}
                  </span>
                  <span className="text-base sm:text-lg font-semibold text-[#174B43]">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[#174B43] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-3 text-sm sm:text-base text-[#233B4A]/85 leading-relaxed pr-8">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-[#DCEFE7]/60 rounded-2xl border border-[#83A99A]/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-[#174B43] font-medium">
          Vous n’avez pas trouvé l’information souhaitée ?
        </p>
        <button
          type="button"
          onClick={onContact}
          className="px-5 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Contacter la clinique
        </button>
      </div>
    </div>
  );
}
