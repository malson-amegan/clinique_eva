import { useCallback, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar, type NavDestination } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { ClinicPresentationView } from './views/ClinicPresentationView';
import { SpecialtiesView } from './views/SpecialtiesView';
import { ServicesPreventionView } from './views/ServicesPreventionView';
import { AppointmentView } from './views/AppointmentView';
import { BlogView } from './views/BlogView';
import { FaqView, ReviewsView } from './views/ReviewsAndFaqView';
import { ContactView } from './views/ContactView';
import { PatientPortalView } from './views/PatientPortalView';
import { AdminDashboardView } from './views/AdminDashboardView';
import type { PublicHomeData } from './types';
import { CLINIC_INFO } from './lib/clinicInfo';

function resolvePathToState(pathname: string): {
  page: NavDestination;
  specialtySlug: string | null;
  articleSlug: string | null;
} {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/accueil') {
    return { page: 'accueil', specialtySlug: null, articleSlug: null };
  }
  if (clean === '/clinique') {
    return { page: 'clinique', specialtySlug: null, articleSlug: null };
  }
  if (clean.startsWith('/specialites/')) {
    return {
      page: 'specialites',
      specialtySlug: clean.replace('/specialites/', ''),
      articleSlug: null,
    };
  }
  if (clean === '/specialites') {
    return { page: 'specialites', specialtySlug: null, articleSlug: null };
  }
  if (clean === '/prevention' || clean === '/services') {
    return { page: 'services', specialtySlug: null, articleSlug: null };
  }
  if (clean === '/rendez-vous') {
    return { page: 'rendez-vous', specialtySlug: null, articleSlug: null };
  }
  if (clean.startsWith('/conseils-sante/')) {
    return {
      page: 'conseils',
      specialtySlug: null,
      articleSlug: clean.replace('/conseils-sante/', ''),
    };
  }
  if (clean === '/conseils-sante') {
    return { page: 'conseils', specialtySlug: null, articleSlug: null };
  }
  if (clean === '/avis') {
    return { page: 'avis', specialtySlug: null, articleSlug: null };
  }
  if (clean === '/faq') {
    return { page: 'faq', specialtySlug: null, articleSlug: null };
  }
  if (clean === '/contact') {
    return { page: 'contact', specialtySlug: null, articleSlug: null };
  }
  if (clean === '/espace-patient') {
    return { page: 'espace-patient', specialtySlug: null, articleSlug: null };
  }
  if (clean === '/admin') {
    return { page: 'admin', specialtySlug: null, articleSlug: null };
  }
  return { page: 'accueil', specialtySlug: null, articleSlug: null };
}

function MobileActionBar({
  onBook,
}: {
  onBook: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-3 border-t border-[#83A99A]/25 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(23,75,67,0.08)] backdrop-blur lg:hidden">
      <a
        href={`tel:${CLINIC_INFO.phoneLink}`}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#174B43] px-4 text-sm font-semibold text-[#174B43]"
      >
        Appeler
      </a>
      <button
        type="button"
        onClick={onBook}
        className="min-h-11 rounded-full bg-[#174B43] px-4 text-sm font-semibold text-white"
      >
        Demander un rendez-vous
      </button>
    </div>
  );
}

function CliniqueEvaShell() {
  const initialRoute = resolvePathToState(window.location.pathname);

  const [currentPage, setCurrentPage] = useState<NavDestination>(
    initialRoute.page
  );
  const [selectedSpecialtySlug, setSelectedSpecialtySlug] = useState<
    string | null
  >(initialRoute.specialtySlug);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(
    initialRoute.articleSlug
  );
  const [bookingSpecialtySlug, setBookingSpecialtySlug] = useState<
    string | null
  >(null);
  const [preventionTopic, setPreventionTopic] = useState<
    'depistage_hta' | 'depistage_diabete'
  >('depistage_hta');

  const [publicData, setPublicData] = useState<PublicHomeData | null>(null);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const fetchPublicData = useCallback(async () => {
    try {
      const [homeRes, cfgRes] = await Promise.all([
        fetch('/api/public/home'),
        fetch('/api/public/config'),
      ]);
      if (!homeRes.ok) {
        throw new Error('Impossible de charger les données de la clinique.');
      }
      const homeJson: PublicHomeData = await homeRes.json();
      setPublicData(homeJson);

      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        if (cfg.mapsApiKey) {
          setMapsApiKey(cfg.mapsApiKey);
        }
      }
      setLoadError(null);
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error ? err.message : 'Erreur de chargement.'
      );
    } finally {
      setLoadingPublic(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  useEffect(() => {
    const onQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const next = resolvePathToState(window.location.pathname);
      setCurrentPage(next.page);
      setSelectedSpecialtySlug(next.specialtySlug);
      setSelectedArticleSlug(next.articleSlug);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback(
    (
      page: NavDestination,
      opts?: { specialtySlug?: string | null; articleSlug?: string | null }
    ) => {
      setCurrentPage(page);
      setSelectedSpecialtySlug(opts?.specialtySlug ?? null);
      setSelectedArticleSlug(opts?.articleSlug ?? null);

      let targetUrl = '/';
      if (page === 'clinique') targetUrl = '/clinique';
      else if (page === 'specialites') {
        targetUrl = opts?.specialtySlug
          ? `/specialites/${opts.specialtySlug}`
          : '/specialites';
      } else if (page === 'services') targetUrl = '/prevention';
      else if (page === 'rendez-vous') targetUrl = '/rendez-vous';
      else if (page === 'conseils') {
        targetUrl = opts?.articleSlug
          ? `/conseils-sante/${opts.articleSlug}`
          : '/conseils-sante';
      } else if (page === 'avis') targetUrl = '/avis';
      else if (page === 'faq') targetUrl = '/faq';
      else if (page === 'contact') targetUrl = '/contact';
      else if (page === 'espace-patient') targetUrl = '/espace-patient';
      else if (page === 'admin') targetUrl = '/admin';

      if (window.location.pathname !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const handleBookSpecialty = (slug?: string) => {
    setBookingSpecialtySlug(slug ?? null);
    navigate('rendez-vous');
  };

  const handleRequestPreventionInfo = (
    topic: 'depistage_hta' | 'depistage_diabete'
  ) => {
    setPreventionTopic(topic);
    navigate('services');
    setTimeout(() => {
      document
        .getElementById('prevention-info-form')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8F6] text-[#233B4A]">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar currentPage={currentPage} onNavigate={(p) => navigate(p)} />

      <main className="flex-1 pb-20 lg:pb-0">
        {loadingPublic ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <p className="text-sm font-medium text-[#174B43]">
              Chargement de la plateforme Clinique EVA…
            </p>
          </div>
        ) : loadError || !publicData ? (
          <div className="max-w-xl mx-auto px-4 py-20 text-center">
            <div className="bg-white rounded-2xl border border-[#83A99A]/30 p-8">
              <p className="text-base font-semibold text-[#174B43]">
                Service momentanément indisponible
              </p>
              <p className="mt-2 text-sm text-[#233B4A]/75">{loadError}</p>
              <button
                type="button"
                onClick={fetchPublicData}
                className="mt-5 px-5 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentPage === 'accueil' && (
              <HomeView
                data={publicData}
                mapsApiKey={mapsApiKey}
                onNavigate={(p) => navigate(p)}
                onSelectSpecialty={(slug) =>
                  navigate('specialites', { specialtySlug: slug })
                }
                onBookSpecialty={handleBookSpecialty}
                onRequestPreventionInfo={handleRequestPreventionInfo}
              />
            )}

            {currentPage === 'clinique' && (
              <ClinicPresentationView
                institutional={publicData.institutional}
                gallery={publicData.gallery}
                onBook={() => handleBookSpecialty()}
                onContact={() => navigate('contact')}
              />
            )}

            {currentPage === 'specialites' && (
              <SpecialtiesView
                specialties={publicData.specialties}
                selectedSlug={selectedSpecialtySlug}
                onSelectSlug={(slug) =>
                  navigate('specialites', { specialtySlug: slug })
                }
                onBookSpecialty={(slug) => handleBookSpecialty(slug)}
              />
            )}

            {currentPage === 'services' && (
              <ServicesPreventionView
                initialTopic={preventionTopic}
                onBookGeneral={() => handleBookSpecialty('medecine-generale')}
              />
            )}

            {currentPage === 'rendez-vous' && (
              <AppointmentView
                specialties={publicData.specialties}
                preselectedSpecialty={bookingSpecialtySlug}
              />
            )}

            {currentPage === 'conseils' && (
              <BlogView
                articles={publicData.articles}
                selectedSlug={selectedArticleSlug}
                onSelectSlug={(slug) =>
                  navigate('conseils', { articleSlug: slug })
                }
                onBook={() => handleBookSpecialty()}
              />
            )}

            {currentPage === 'avis' && (
              <ReviewsView reviews={publicData.reviews} />
            )}

            {currentPage === 'faq' && (
              <FaqView
                faqs={publicData.faqs}
                onContact={() => navigate('contact')}
              />
            )}

            {currentPage === 'contact' && (
              <ContactView mapsApiKey={mapsApiKey} />
            )}

            {currentPage === 'espace-patient' && (
              <PatientPortalView
                onBook={() => handleBookSpecialty()}
                onGoAdmin={() => navigate('admin')}
              />
            )}

            {currentPage === 'admin' && (
              <AdminDashboardView onPublicDataChanged={fetchPublicData} />
            )}
          </>
        )}
      </main>

      {currentPage !== 'admin' && currentPage !== 'rendez-vous' && (
        <MobileActionBar onBook={() => handleBookSpecialty()} />
      )}
      <Footer onNavigate={(p) => navigate(p)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CliniqueEvaShell />
    </AuthProvider>
  );
}
