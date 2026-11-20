import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, Info, CheckCircle2 } from 'lucide-react';
import { AmbientImage } from '../components/AmbientImage';
import { getAmbientImage } from '../lib/images';
import type { Article } from '../types';

const CATEGORIES = [
  'Toutes',
  'Santé rénale',
  'Santé féminine',
  'Grossesse et suivi prénatal',
  'Prévention du diabète',
  'Hypertension',
  'Conseils de santé générale',
];

interface BlogViewProps {
  articles: Article[];
  selectedSlug: string | null;
  onSelectSlug: (slug: string | null) => void;
  onBook: () => void;
}

export function BlogView({
  articles,
  selectedSlug,
  onSelectSlug,
  onBook,
}: BlogViewProps) {
  const [category, setCategory] = useState('Toutes');
  const [search, setSearch] = useState('');

  const activeArticle = selectedSlug
    ? articles.find((a) => a.slug === selectedSlug) || null
    : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((art) => {
      if (category !== 'Toutes' && art.category !== category) return false;
      if (q) {
        return (
          art.title.toLowerCase().includes(q) ||
          art.excerpt.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [articles, category, search]);

  if (activeArticle) {
    const img = getAmbientImage(activeArticle.imageKey);
    const formattedDate = new Date(
      activeArticle.publishedAt
    ).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <button
          type="button"
          onClick={() => onSelectSlug(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#174B43] hover:underline mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux conseils santé
        </button>

        <article className="bg-white rounded-3xl border border-[#83A99A]/25 overflow-hidden">
          <div className="h-64 sm:h-80 w-full">
            <AmbientImage src={img.url} alt={activeArticle.title} />
          </div>

          <div className="p-7 sm:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#233B4A]/70 mb-4">
              <span className="font-semibold text-[#174B43]">
                {activeArticle.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>Publié le {formattedDate}</span>
              <span aria-hidden="true">·</span>
              {activeArticle.isMedicalApproved ? (
                <span className="inline-flex items-center gap-1 text-[#174B43] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Validé par un professionnel de santé
                </span>
              ) : (
                <span>En attente de validation médicale</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
              {activeArticle.title}
            </h1>

            {activeArticle.isDemoContent && (
              <div className="mt-5 p-4 rounded-xl bg-[#F5F8F6] border border-[#83A99A]/30 flex items-start gap-2.5 text-xs text-[#233B4A]/85">
                <Info className="w-4 h-4 text-[#174B43] shrink-0 mt-0.5" />
                <span>
                  Article de démonstration — contenu indicatif devant être
                  approuvé par un professionnel de santé de la Clinique EVA.
                </span>
              </div>
            )}

            <div className="mt-8 space-y-5 text-base text-[#233B4A]/90 leading-[1.75] max-w-prose">
              {activeArticle.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-[#83A99A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#233B4A]/70 max-w-md">
                Cet article est purement informatif et ne remplace pas une
                consultation médicale personnalisée.
              </p>
              <button
                type="button"
                onClick={onBook}
                className="px-6 py-3 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Demander une consultation
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-semibold text-[#174B43] mb-2">
          Blog & conseils de prévention
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#174B43] tracking-tight">
          S’informer pour mieux prévenir
        </h1>
        <p className="mt-3 text-base text-[#233B4A]/85 leading-relaxed">
          Retrouvez des fiches pédagogiques dédiées à la santé rénale, à la
          santé féminine, au suivi prénatal et à la prévention des maladies
          chroniques.
        </p>
      </div>

      {/* Search and Category Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#83A99A]/25">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === cat
                  ? 'bg-[#174B43] text-white'
                  : 'text-[#233B4A]/80 hover:bg-[#F5F8F6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#233B4A]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un conseil…"
            aria-label="Rechercher un article"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#83A99A]/30 bg-white text-sm focus:border-[#174B43]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-12 text-center">
          <p className="text-base font-medium text-[#174B43]">
            Aucun article ne correspond à votre recherche.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('Toutes');
              setSearch('');
            }}
            className="mt-4 text-sm font-semibold text-[#174B43] underline cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => {
            const img = getAmbientImage(art.imageKey);
            const dateStr = new Date(art.publishedAt).toLocaleDateString(
              'fr-FR',
              { day: 'numeric', month: 'short', year: 'numeric' }
            );
            return (
              <article
                key={art.id}
                className="bg-white rounded-2xl border border-[#83A99A]/25 overflow-hidden flex flex-col justify-between hover:border-[#174B43]/40 transition-colors"
              >
                <div>
                  <div className="h-44 w-full">
                    <AmbientImage src={img.url} alt={art.title} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-[#233B4A]/65 mb-2.5">
                      <span className="font-semibold text-[#174B43]">
                        {art.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{dateStr}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-[#174B43] leading-snug">
                      {art.title}
                    </h2>
                    <p className="mt-2.5 text-sm text-[#233B4A]/80 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-[#83A99A]/15 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#233B4A]/60">
                    {art.isMedicalApproved
                      ? 'Validé médicalement'
                      : 'Exemple à valider'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectSlug(art.slug)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#174B43] hover:underline cursor-pointer"
                  >
                    Lire l’article
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
