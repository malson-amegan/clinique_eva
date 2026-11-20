import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  CalendarCheck2,
  Check,
  FileText,
  Inbox,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppointmentStatusLabel } from '../components/StatusLabel';
import type {
  AdminReview,
  Appointment,
  AppointmentStatus,
  Article,
  AuditLog,
  ContactMessage,
  FaqItem,
  GalleryItem,
  InstitutionalPage,
  Specialty,
  UserProfile,
  UserRole,
} from '../types';

type AdminTab =
  | 'overview'
  | 'appointments'
  | 'messages'
  | 'reviews'
  | 'cms'
  | 'users';

type CmsSubTab =
  | 'specialties'
  | 'institutional'
  | 'faqs'
  | 'articles'
  | 'gallery';

interface DashboardResponse {
  stats: {
    total: number;
    en_attente: number;
    confirme: number;
    reporte: number;
    annule: number;
    unreadContacts: number;
    pendingReviews: number;
  };
  bySpecialty: { name: string; count: number }[];
  recentAuditLogs: AuditLog[];
}

export function AdminDashboardView({
  onPublicDataChanged,
}: {
  onPublicDataChanged: () => void;
}) {
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

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [cmsTab, setCmsTab] = useState<CmsSubTab>('specialties');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dashboard state
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptStatusFilter, setApptStatusFilter] = useState('all');
  const [apptDateFilter, setApptDateFilter] = useState('');
  const [apptSearch, setApptSearch] = useState('');
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [editStatus, setEditStatus] = useState<AppointmentStatus>('en_attente');
  const [editProposedDate, setEditProposedDate] = useState('');
  const [editProposedSlot, setEditProposedSlot] = useState('Matin');
  const [editAdminNote, setEditAdminNote] = useState('');

  // Messages & Reviews
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);

  // CMS state
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [institutional, setInstitutional] = useState<InstitutionalPage[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // New FAQ / Article / Gallery forms
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newFaqCat, setNewFaqCat] = useState('Informations générales');

  const [newArtTitle, setNewArtTitle] = useState('');
  const [newArtCat, setNewArtCat] = useState('Santé rénale');
  const [newArtExcerpt, setNewArtExcerpt] = useState('');
  const [newArtContent, setNewArtContent] = useState('');
  const [newArtApproved, setNewArtApproved] = useState(false);

  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCaption, setNewGalCaption] = useState('');
  const [newGalUrl, setNewGalUrl] = useState(
    '/src/assets/images/hero_clinique_ambiance_1794565298582.jpg'
  );

  // Users & Audit
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const isStaff =
    profile && ['staff', 'admin', 'super_admin'].includes(profile.role);
  const isAdmin = profile && ['admin', 'super_admin'].includes(profile.role);

  const notifySuccess = (msg: string) => {
    setErrorMsg(null);
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 4000);
  };

  const loadDashboard = useCallback(async () => {
    const data = await apiFetch<DashboardResponse>('/api/admin/dashboard');
    setDashboard(data);
  }, [apiFetch]);

  const loadAppointments = useCallback(async () => {
    const params = new URLSearchParams();
    if (apptStatusFilter !== 'all') params.set('status', apptStatusFilter);
    if (apptDateFilter) params.set('date', apptDateFilter);
    if (apptSearch.trim()) params.set('search', apptSearch.trim());
    const data = await apiFetch<{ appointments: Appointment[] }>(
      `/api/admin/appointments?${params.toString()}`
    );
    setAppointments(data.appointments);
  }, [apiFetch, apptStatusFilter, apptDateFilter, apptSearch]);

  const loadMessages = useCallback(async () => {
    const data = await apiFetch<{ contacts: ContactMessage[] }>(
      '/api/admin/contacts'
    );
    setContacts(data.contacts);
  }, [apiFetch]);

  const loadReviews = useCallback(async () => {
    const data = await apiFetch<{ reviews: AdminReview[] }>(
      '/api/admin/reviews'
    );
    setReviews(data.reviews);
  }, [apiFetch]);

  const loadCms = useCallback(async () => {
    const data = await apiFetch<{
      specialties: Specialty[];
      institutional: InstitutionalPage[];
      faqs: FaqItem[];
      articles: Article[];
      gallery: GalleryItem[];
    }>('/api/admin/cms');
    setSpecialties(data.specialties);
    setInstitutional(data.institutional);
    setFaqs(data.faqs);
    setArticles(data.articles);
    setGallery(data.gallery);
  }, [apiFetch]);

  const loadUsersAndLogs = useCallback(async () => {
    if (!isAdmin) return;
    const [uData, lData] = await Promise.all([
      apiFetch<{ users: UserProfile[] }>('/api/admin/users'),
      apiFetch<{ logs: AuditLog[] }>('/api/admin/audit-logs'),
    ]);
    setUsersList(uData.users);
    setAuditLogs(lData.logs);
  }, [apiFetch, isAdmin]);

  useEffect(() => {
    if (!isStaff) return;
    setErrorMsg(null);
    if (activeTab === 'overview') loadDashboard().catch((e) => setErrorMsg(e.message));
    if (activeTab === 'appointments')
      loadAppointments().catch((e) => setErrorMsg(e.message));
    if (activeTab === 'messages')
      loadMessages().catch((e) => setErrorMsg(e.message));
    if (activeTab === 'reviews')
      loadReviews().catch((e) => setErrorMsg(e.message));
    if (activeTab === 'cms') loadCms().catch((e) => setErrorMsg(e.message));
    if (activeTab === 'users')
      loadUsersAndLogs().catch((e) => setErrorMsg(e.message));
  }, [
    isStaff,
    activeTab,
    loadDashboard,
    loadAppointments,
    loadMessages,
    loadReviews,
    loadCms,
    loadUsersAndLogs,
  ]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-[#233B4A]/70">
        Vérification des droits d’accès…
      </div>
    );
  }

  if (firebaseUser && !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl border border-[#83A99A]/25 p-8 text-center">
          <h1 className="text-2xl font-bold text-[#174B43]">
            Profil indisponible
          </h1>
          <p className="mt-3 text-sm text-[#233B4A]/80">
            Votre compte Google est connecté, mais le serveur n’a pas pu
            charger vos droits d’accès.
          </p>
          {authError && (
            <p className="mt-4 text-sm text-rose-700" role="alert">
              {authError}
            </p>
          )}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={refreshProfile}
              className="px-5 py-3 rounded-full bg-[#174B43] text-white text-sm font-medium cursor-pointer"
            >
              Réessayer
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
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl border border-[#83A99A]/25 p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#174B43]">
            Espace Administrateur Clinique EVA
          </h1>
          <p className="mt-3 text-sm text-[#233B4A]/80 leading-relaxed">
            Connectez-vous avec votre compte Google autorisé pour accéder au
            back-office de gestion des rendez-vous, des contenus et de la
            modération.
          </p>
          {authError && (
            <p className="mt-4 text-sm text-rose-700" role="alert">
              {authError}
            </p>
          )}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            Connexion personnel autorisé
          </button>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl border border-[#83A99A]/25 p-8 text-center">
          <Shield className="w-10 h-10 text-[#174B43] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#174B43]">
            Accès réservé à l’administration
          </h1>
          <p className="mt-2 text-sm text-[#233B4A]/80 leading-relaxed">
            Votre compte ({profile.email}) dispose actuellement du rôle{' '}
            <strong>{profile.role}</strong>. Demandez à un administrateur de
            la Clinique EVA de vérifier vos autorisations si vous devez
            accéder au back-office.
          </p>
        </div>
      </div>
    );
  }

  const openApptEditor = (appt: Appointment) => {
    setEditingAppt(appt);
    setEditStatus(appt.status);
    setEditProposedDate(appt.proposedDate || appt.preferredDate);
    setEditProposedSlot(appt.proposedSlot || appt.preferredSlot);
    setEditAdminNote(appt.adminNote || '');
  };

  const handleSaveAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppt) return;
    try {
      await apiFetch(`/api/admin/appointments/${editingAppt.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: editStatus,
          proposedDate: editStatus === 'reporte' ? editProposedDate : null,
          proposedSlot: editStatus === 'reporte' ? editProposedSlot : null,
          adminNote: editAdminNote,
        }),
      });
      setEditingAppt(null);
      await loadAppointments();
      await loadDashboard();
      notifySuccess('Demande de rendez-vous mise à jour.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur de mise à jour.');
    }
  };

  const handleToggleContact = async (c: ContactMessage) => {
    const nextStatus = c.status === 'traite' ? 'nouveau' : 'traite';
    await apiFetch(`/api/admin/contacts/${c.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });
    await loadMessages();
    notifySuccess('Statut du message mis à jour.');
  };

  const handleModerateReview = async (
    id: number,
    status: 'valide' | 'rejete'
  ) => {
    await apiFetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadReviews();
    onPublicDataChanged();
    notifySuccess(
      status === 'valide' ? 'Avis validé et publié.' : 'Avis rejeté.'
    );
  };

  const handleSaveSpecialty = async (s: Specialty) => {
    try {
      await apiFetch(`/api/admin/specialties/${s.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: s.title,
          shortDescription: s.shortDescription,
          fullDescription: s.fullDescription,
          practicalInfo: s.practicalInfo,
          isValidated: s.isValidated,
          isPublished: s.isPublished,
        }),
      });
      onPublicDataChanged();
      notifySuccess(`Spécialité « ${s.title} » enregistrée.`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur CMS.');
    }
  };

  const handleSaveInstitutional = async (page: InstitutionalPage) => {
    try {
      await apiFetch(`/api/admin/institutional/${page.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: page.title,
          body: page.body,
          isValidated: page.isValidated,
        }),
      });
      onPublicDataChanged();
      notifySuccess(`Section « ${page.title} » mise à jour.`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur CMS.');
    }
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/faqs', {
        method: 'POST',
        body: JSON.stringify({
          question: newFaqQ,
          answer: newFaqA,
          category: newFaqCat,
          isValidated: true,
          isPublished: true,
        }),
      });
      setNewFaqQ('');
      setNewFaqA('');
      await loadCms();
      onPublicDataChanged();
      notifySuccess('Question ajoutée à la FAQ.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur FAQ.');
    }
  };

  const handleDeleteFaq = async (id: number) => {
    await apiFetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    await loadCms();
    onPublicDataChanged();
    notifySuccess('Question supprimée.');
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/articles', {
        method: 'POST',
        body: JSON.stringify({
          title: newArtTitle,
          category: newArtCat,
          excerpt: newArtExcerpt,
          content: newArtContent,
          imageKey: 'prevention',
          isMedicalApproved: newArtApproved,
          isDemoContent: false,
          isPublished: true,
        }),
      });
      setNewArtTitle('');
      setNewArtExcerpt('');
      setNewArtContent('');
      setNewArtApproved(false);
      await loadCms();
      onPublicDataChanged();
      notifySuccess('Article publié dans Conseils santé.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur article.');
    }
  };

  const handleToggleArticleApproval = async (art: Article) => {
    await apiFetch(`/api/admin/articles/${art.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: art.title,
        category: art.category,
        excerpt: art.excerpt,
        content: art.content,
        imageKey: art.imageKey,
        isMedicalApproved: !art.isMedicalApproved,
        isDemoContent: art.isDemoContent,
        isPublished: art.isPublished,
      }),
    });
    await loadCms();
    onPublicDataChanged();
    notifySuccess('Statut de validation médicale mis à jour.');
  };

  const handleDeleteArticle = async (id: number) => {
    await apiFetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    await loadCms();
    onPublicDataChanged();
    notifySuccess('Article supprimé.');
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify({
        title: newGalTitle,
        caption: newGalCaption,
        imageUrl: newGalUrl,
        isAmbientIllustration: false,
        isPublished: true,
      }),
    });
    setNewGalTitle('');
    setNewGalCaption('');
    await loadCms();
    onPublicDataChanged();
    notifySuccess('Élément ajouté à la galerie.');
  };

  const handleDeleteGalleryItem = async (id: number) => {
    await apiFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    await loadCms();
    onPublicDataChanged();
    notifySuccess('Élément retiré de la galerie.');
  };

  const handleUpdateUserRole = async (
    u: UserProfile,
    role: UserRole,
    isActive: boolean
  ) => {
    try {
      await apiFetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role, isActive }),
      });
      await loadUsersAndLogs();
      notifySuccess(`Compte ${u.email} mis à jour.`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur compte.');
    }
  };

  const navTabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Tableau de bord',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'appointments',
      label: 'Rendez-vous',
      icon: <CalendarCheck2 className="w-4 h-4" />,
    },
    {
      id: 'messages',
      label: 'Demandes & contacts',
      icon: <Inbox className="w-4 h-4" />,
    },
    {
      id: 'reviews',
      label: 'Modération avis',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'cms',
      label: 'Contenu (CMS)',
      icon: <FileText className="w-4 h-4" />,
    },
    ...(isAdmin
      ? [
          {
            id: 'users' as AdminTab,
            label: 'Comptes & rôles',
            icon: <Users className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  const maxSpecCount = Math.max(
    1,
    ...(dashboard?.bySpecialty.map((s) => s.count) || [1])
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#83A99A]/25">
        <div>
          <p className="text-xs font-semibold text-[#174B43]">
            Back-office administratif · Rôle : {profile.role}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#174B43]">
            Gestion Clinique EVA
          </h1>
        </div>
        <div className="text-xs text-[#233B4A]/70">{profile.email}</div>
      </div>

      {/* Notifications */}
      {bannerMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-[#DCEFE7] text-[#174B43] text-sm font-medium">
          {bannerMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Workspace Grid: Sidebar + Main Viewport */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-[#83A99A]/25 p-3 space-y-1">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#174B43] text-white'
                  : 'text-[#233B4A] hover:bg-[#F5F8F6]'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </aside>

        <div className="lg:col-span-9 space-y-6">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && dashboard && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total demandes RDV',
                    value: dashboard.stats.total,
                  },
                  {
                    label: 'En attente de validation',
                    value: dashboard.stats.en_attente,
                  },
                  {
                    label: 'Rendez-vous confirmés',
                    value: dashboard.stats.confirme,
                  },
                  {
                    label: 'Avis / Messages à traiter',
                    value:
                      dashboard.stats.pendingReviews +
                      dashboard.stats.unreadContacts,
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white rounded-2xl border border-[#83A99A]/25 p-5"
                  >
                    <p className="text-xs text-[#233B4A]/70">{kpi.label}</p>
                    <p className="mt-2 text-3xl font-bold text-[#174B43] tabular-nums">
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-[#174B43]" />
                    <h2 className="text-base font-semibold text-[#174B43]">
                      Répartition par spécialité
                    </h2>
                  </div>
                  {dashboard.bySpecialty.length === 0 ? (
                    <p className="text-sm text-[#233B4A]/65 py-6">
                      Aucune demande enregistrée pour le moment.
                    </p>
                  ) : (
                    <div className="space-y-3.5">
                      {dashboard.bySpecialty.map((item) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#233B4A]">
                              {item.name}
                            </span>
                            <span className="font-mono font-semibold text-[#174B43] tabular-nums">
                              {item.count}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#F5F8F6] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#174B43]"
                              style={{
                                width: `${Math.round(
                                  (item.count / maxSpecCount) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6">
                  <h2 className="text-base font-semibold text-[#174B43] mb-4">
                    Journal des actions récentes
                  </h2>
                  {dashboard.recentAuditLogs.length === 0 ? (
                    <p className="text-sm text-[#233B4A]/65 py-6">
                      Aucune activité journalisée.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {dashboard.recentAuditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="pb-2.5 border-b border-[#83A99A]/15 last:border-0 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2 text-[#233B4A]/60">
                            <span className="font-mono">{log.action}</span>
                            <span className="tabular-nums">
                              {new Date(log.createdAt).toLocaleString('fr-FR')}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[#233B4A]">
                            {log.details || log.entityType}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#174B43]">
                  Gestion des demandes de rendez-vous
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#233B4A]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={apptSearch}
                      onChange={(e) => setApptSearch(e.target.value)}
                      placeholder="Nom, tél. ou référence…"
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-[#83A99A]/35 text-xs bg-[#F5F8F6]/60"
                    />
                  </div>
                  <input
                    type="date"
                    value={apptDateFilter}
                    onChange={(e) => setApptDateFilter(e.target.value)}
                    aria-label="Filtrer par date"
                    className="px-3 py-1.5 rounded-xl border border-[#83A99A]/35 text-xs bg-[#F5F8F6]/60 tabular-nums"
                  />
                  <select
                    value={apptStatusFilter}
                    onChange={(e) => setApptStatusFilter(e.target.value)}
                    aria-label="Filtrer par statut"
                    className="px-3 py-1.5 rounded-xl border border-[#83A99A]/35 text-xs bg-[#F5F8F6]/60"
                  >
                    <option value="all">Tous statuts</option>
                    <option value="en_attente">En attente</option>
                    <option value="confirme">Confirmés</option>
                    <option value="reporte">Reportés</option>
                    <option value="annule">Annulés</option>
                  </select>
                </div>
              </div>

              {appointments.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#233B4A]/65">
                  Aucune demande ne correspond à ces critères.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#83A99A]/25 text-[#233B4A]/65">
                        <th className="py-2.5 pr-3 font-semibold">Référence</th>
                        <th className="py-2.5 pr-3 font-semibold">Patient</th>
                        <th className="py-2.5 pr-3 font-semibold">
                          Spécialité
                        </th>
                        <th className="py-2.5 pr-3 font-semibold">
                          Date souhaitée
                        </th>
                        <th className="py-2.5 pr-3 font-semibold">Statut</th>
                        <th className="py-2.5 text-right font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#83A99A]/15">
                      {appointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-[#F5F8F6]/60">
                          <td className="py-3 pr-3 font-mono font-semibold text-[#174B43] tabular-nums whitespace-nowrap">
                            {appt.referenceCode}
                          </td>
                          <td className="py-3 pr-3">
                            <p className="font-semibold text-[#233B4A]">
                              {appt.firstName} {appt.lastName}
                            </p>
                            <p className="text-[#233B4A]/65 tabular-nums">
                              {appt.phone}
                            </p>
                          </td>
                          <td className="py-3 pr-3 text-[#233B4A]">
                            {appt.specialtyName}
                          </td>
                          <td className="py-3 pr-3 tabular-nums whitespace-nowrap">
                            {appt.preferredDate} · {appt.preferredSlot}
                          </td>
                          <td className="py-3 pr-3 whitespace-nowrap">
                            <AppointmentStatusLabel status={appt.status} />
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => openApptEditor(appt)}
                              className="px-3 py-1.5 rounded-full bg-[#DCEFE7] text-[#174B43] font-medium hover:bg-[#cde6dc] cursor-pointer"
                            >
                              Gérer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Edit Appointment Modal */}
              {editingAppt && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#83A99A]/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-xs text-[#174B43] font-semibold">
                          {editingAppt.referenceCode}
                        </p>
                        <h3 className="text-lg font-bold text-[#174B43]">
                          {editingAppt.firstName} {editingAppt.lastName}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingAppt(null)}
                        className="p-2 rounded-lg hover:bg-[#F5F8F6] cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F5F8F6] text-xs space-y-1 text-[#233B4A]">
                      <p>
                        <strong>Spécialité :</strong>{' '}
                        {editingAppt.specialtyName}
                      </p>
                      <p>
                        <strong>Téléphone :</strong> {editingAppt.phone}
                      </p>
                      <p>
                        <strong>Souhait :</strong> {editingAppt.preferredDate} (
                        {editingAppt.preferredSlot})
                      </p>
                      {editingAppt.nonMedicalNote && (
                        <p>
                          <strong>Commentaire patient :</strong>{' '}
                          {editingAppt.nonMedicalNote}
                        </p>
                      )}
                    </div>

                    <form onSubmit={handleSaveAppt} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#233B4A] mb-1">
                          Décision / Statut
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) =>
                            setEditStatus(e.target.value as AppointmentStatus)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#83A99A]/35 text-sm"
                        >
                          <option value="en_attente">En attente</option>
                          <option value="confirme">Confirmer le créneau</option>
                          <option value="reporte">
                            Reporter / Proposer une nouvelle date
                          </option>
                          <option value="annule">Annuler la demande</option>
                        </select>
                      </div>

                      {editStatus === 'reporte' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#233B4A] mb-1">
                              Nouvelle date proposée
                            </label>
                            <input
                              type="date"
                              required
                              value={editProposedDate}
                              onChange={(e) =>
                                setEditProposedDate(e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl border border-[#83A99A]/35 text-sm tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#233B4A] mb-1">
                              Créneau proposé
                            </label>
                            <select
                              value={editProposedSlot}
                              onChange={(e) =>
                                setEditProposedSlot(e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl border border-[#83A99A]/35 text-sm"
                            >
                              <option value="Matin">Matin</option>
                              <option value="Après-midi">Après-midi</option>
                              <option value="Fin de journée">
                                Fin de journée
                              </option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-[#233B4A] mb-1">
                          Note administrative (non médicale)
                        </label>
                        <textarea
                          rows={2}
                          value={editAdminNote}
                          onChange={(e) => setEditAdminNote(e.target.value)}
                          placeholder="Ex. : Patient contacté par téléphone, accueil prévu à 9h30…"
                          className="w-full px-3.5 py-2 rounded-xl border border-[#83A99A]/35 text-sm"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingAppt(null)}
                          className="px-4 py-2 rounded-full border border-[#83A99A]/40 text-xs font-medium cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-full bg-[#174B43] text-white text-xs font-medium hover:bg-[#123c35] cursor-pointer"
                        >
                          Enregistrer la décision
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. MESSAGES & SCREENING REQUESTS */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#174B43]">
                Demandes d’informations & contacts
              </h2>
              {contacts.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#233B4A]/65">
                  Aucun message reçu pour le moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-[#F5F8F6] border border-[#83A99A]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-[#233B4A]/65">
                          <span className="font-semibold text-[#174B43]">
                            {c.fullName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{c.phone}</span>
                          <span aria-hidden="true">·</span>
                          <span>{c.topic}</span>
                        </div>
                        <p className="text-sm text-[#233B4A]">{c.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleContact(c)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                          c.status === 'traite'
                            ? 'bg-[#DCEFE7] text-[#174B43]'
                            : 'bg-[#174B43] text-white'
                        }`}
                      >
                        {c.status === 'traite' ? 'Traité' : 'Marquer traité'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#174B43]">
                Modération des avis patients
              </h2>
              {reviews.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#233B4A]/65">
                  Aucun avis soumis par les patients pour le moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-[#F5F8F6] border border-[#83A99A]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#233B4A]/70">
                          <strong className="text-[#174B43]">
                            {rev.authorName}
                          </strong>
                          <span>·</span>
                          <span className="tabular-nums">{rev.rating}/5</span>
                          <span>·</span>
                          <span>Statut : {rev.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-[#233B4A]">
                          {rev.comment}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleModerateReview(rev.id, 'valide')}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#174B43] text-white text-xs font-medium cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Valider
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModerateReview(rev.id, 'rejete')}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-rose-300 text-rose-700 text-xs font-medium cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Rejeter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. CMS */}
          {activeTab === 'cms' && (
            <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F8F6] rounded-xl">
                {(
                  [
                    ['specialties', 'Spécialités'],
                    ['institutional', 'Pages cliniques'],
                    ['faqs', 'FAQ'],
                    ['articles', 'Articles santé'],
                    ['gallery', 'Galerie'],
                  ] as [CmsSubTab, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCmsTab(id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      cmsTab === id
                        ? 'bg-white text-[#174B43] shadow-sm'
                        : 'text-[#233B4A]/75 hover:text-[#174B43]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {cmsTab === 'specialties' && (
                <div className="space-y-5">
                  {specialties.map((s) => (
                    <div
                      key={s.id}
                      className="p-5 rounded-2xl bg-[#F5F8F6] border border-[#83A99A]/25 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-[#174B43]">
                          {s.title}
                        </h3>
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-[#233B4A] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={s.isValidated}
                            onChange={(e) =>
                              setSpecialties((prev) =>
                                prev.map((item) =>
                                  item.id === s.id
                                    ? { ...item, isValidated: e.target.checked }
                                    : item
                                )
                              )
                            }
                          />
                          Contenu validé par la clinique
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        value={s.fullDescription}
                        onChange={(e) =>
                          setSpecialties((prev) =>
                            prev.map((item) =>
                              item.id === s.id
                                ? { ...item, fullDescription: e.target.value }
                                : item
                            )
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                      />
                      <textarea
                        rows={2}
                        value={s.practicalInfo}
                        onChange={(e) =>
                          setSpecialties((prev) =>
                            prev.map((item) =>
                              item.id === s.id
                                ? { ...item, practicalInfo: e.target.value }
                                : item
                            )
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                      />
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleSaveSpecialty(s)}
                          className="px-4 py-2 rounded-full bg-[#174B43] text-white text-xs font-medium cursor-pointer"
                        >
                          Enregistrer cette spécialité
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {cmsTab === 'institutional' && (
                <div className="space-y-5">
                  {institutional.map((page) => (
                    <div
                      key={page.id}
                      className="p-5 rounded-2xl bg-[#F5F8F6] border border-[#83A99A]/25 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <input
                          type="text"
                          value={page.title}
                          onChange={(e) =>
                            setInstitutional((prev) =>
                              prev.map((p) =>
                                p.id === page.id
                                  ? { ...p, title: e.target.value }
                                  : p
                              )
                            )
                          }
                          className="font-semibold text-sm text-[#174B43] bg-white px-3 py-1.5 rounded-lg border border-[#83A99A]/30"
                        />
                        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={page.isValidated}
                            onChange={(e) =>
                              setInstitutional((prev) =>
                                prev.map((p) =>
                                  p.id === page.id
                                    ? { ...p, isValidated: e.target.checked }
                                    : p
                                )
                              )
                            }
                          />
                          Validé par la direction
                        </label>
                      </div>
                      <textarea
                        rows={3}
                        value={page.body}
                        onChange={(e) =>
                          setInstitutional((prev) =>
                            prev.map((p) =>
                              p.id === page.id
                                ? { ...p, body: e.target.value }
                                : p
                            )
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                      />
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleSaveInstitutional(page)}
                          className="px-4 py-2 rounded-full bg-[#174B43] text-white text-xs font-medium cursor-pointer"
                        >
                          Enregistrer la section
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {cmsTab === 'faqs' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleCreateFaq}
                    className="p-5 rounded-2xl bg-[#F5F8F6] border border-[#83A99A]/25 space-y-3"
                  >
                    <h3 className="text-sm font-semibold text-[#174B43] flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Ajouter une question à la FAQ
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        value={newFaqQ}
                        onChange={(e) => setNewFaqQ(e.target.value)}
                        placeholder="Question…"
                        className="sm:col-span-2 px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                      />
                      <input
                        type="text"
                        required
                        value={newFaqCat}
                        onChange={(e) => setNewFaqCat(e.target.value)}
                        placeholder="Catégorie"
                        className="px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                      />
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      placeholder="Réponse validée par l’établissement…"
                      className="w-full px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-[#174B43] text-white text-xs font-medium cursor-pointer"
                    >
                      Ajouter à la FAQ
                    </button>
                  </form>

                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="p-4 rounded-xl border border-[#83A99A]/25 flex items-start justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#174B43]">
                            {faq.question}
                          </p>
                          <p className="text-xs text-[#233B4A]/80 mt-1">
                            {faq.answer}
                          </p>
                        </div>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFaq(faq.id)}
                            aria-label="Supprimer cette FAQ"
                            className="p-2 text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cmsTab === 'articles' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleCreateArticle}
                    className="p-5 rounded-2xl bg-[#F5F8F6] border border-[#83A99A]/25 space-y-3"
                  >
                    <h3 className="text-sm font-semibold text-[#174B43] flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Rédiger un nouvel article de prévention
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={newArtTitle}
                        onChange={(e) => setNewArtTitle(e.target.value)}
                        placeholder="Titre de l’article"
                        className="px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                      />
                      <select
                        value={newArtCat}
                        onChange={(e) => setNewArtCat(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                      >
                        <option value="Santé rénale">Santé rénale</option>
                        <option value="Santé féminine">Santé féminine</option>
                        <option value="Grossesse et suivi prénatal">
                          Grossesse et suivi prénatal
                        </option>
                        <option value="Prévention du diabète">
                          Prévention du diabète
                        </option>
                        <option value="Hypertension">Hypertension</option>
                        <option value="Conseils de santé générale">
                          Conseils de santé générale
                        </option>
                      </select>
                    </div>
                    <input
                      type="text"
                      required
                      value={newArtExcerpt}
                      onChange={(e) => setNewArtExcerpt(e.target.value)}
                      placeholder="Résumé court…"
                      className="w-full px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                    />
                    <textarea
                      rows={4}
                      required
                      value={newArtContent}
                      onChange={(e) => setNewArtContent(e.target.value)}
                      placeholder="Contenu complet de l’article…"
                      className="w-full px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                    />
                    <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newArtApproved}
                        onChange={(e) => setNewArtApproved(e.target.checked)}
                      />
                      Approuvé par un professionnel de santé
                    </label>
                    <div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-[#174B43] text-white text-xs font-medium cursor-pointer"
                      >
                        Publier l’article
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    {articles.map((art) => (
                      <div
                        key={art.id}
                        className="p-4 rounded-xl border border-[#83A99A]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-xs text-[#233B4A]/65">
                            {art.category} ·{' '}
                            {art.isMedicalApproved
                              ? 'Validé médicalement'
                              : 'En attente de validation'}
                          </p>
                          <p className="text-sm font-semibold text-[#174B43]">
                            {art.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleArticleApproval(art)}
                            className="px-3 py-1.5 rounded-full bg-[#DCEFE7] text-[#174B43] text-xs font-medium cursor-pointer"
                          >
                            {art.isMedicalApproved
                              ? 'Retirer validation'
                              : 'Approuver'}
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art.id)}
                              className="p-2 text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cmsTab === 'gallery' && (
                <div className="space-y-6">
                  {isAdmin && (
                    <form
                      onSubmit={handleCreateGalleryItem}
                      className="p-5 rounded-2xl bg-[#F5F8F6] border border-[#83A99A]/25 space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-[#174B43]">
                        Ajouter un visuel à la galerie
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={newGalTitle}
                          onChange={(e) => setNewGalTitle(e.target.value)}
                          placeholder="Titre du visuel"
                          className="px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                        />
                        <input
                          type="text"
                          required
                          value={newGalUrl}
                          onChange={(e) => setNewGalUrl(e.target.value)}
                          placeholder="URL de l’image"
                          className="px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={newGalCaption}
                        onChange={(e) => setNewGalCaption(e.target.value)}
                        placeholder="Légende descriptive…"
                        className="w-full px-3 py-2 rounded-xl border border-[#83A99A]/30 bg-white text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-[#174B43] text-white text-xs font-medium cursor-pointer"
                      >
                        Ajouter à la galerie
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gallery.map((g) => (
                      <div
                        key={g.id}
                        className="p-4 rounded-xl border border-[#83A99A]/25 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#174B43]">
                            {g.title}
                          </p>
                          <p className="text-xs text-[#233B4A]/70 line-clamp-2">
                            {g.caption}
                          </p>
                        </div>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryItem(g.id)}
                            className="p-2 text-rose-700 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. USERS & PERMISSIONS */}
          {activeTab === 'users' && isAdmin && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-[#174B43]">
                  Gestion des comptes & permissions
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#83A99A]/25 text-[#233B4A]/65">
                        <th className="py-2 pr-3 font-semibold">Utilisateur</th>
                        <th className="py-2 pr-3 font-semibold">Rôle</th>
                        <th className="py-2 pr-3 font-semibold">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#83A99A]/15">
                      {usersList.map((u) => (
                        <tr key={u.id}>
                          <td className="py-3 pr-3">
                            <p className="font-semibold text-[#233B4A]">
                              {u.email}
                            </p>
                            <p className="text-[#233B4A]/60">
                              {u.firstName} {u.lastName}
                            </p>
                          </td>
                          <td className="py-3 pr-3">
                            <select
                              value={u.role}
                              disabled={u.id === profile.id}
                              onChange={(e) =>
                                handleUpdateUserRole(
                                  u,
                                  e.target.value as UserRole,
                                  u.isActive
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-[#83A99A]/35 bg-[#F5F8F6]"
                            >
                              <option value="patient">Patient</option>
                              <option value="staff">Personnel autorisé</option>
                              <option value="admin">Administrateur</option>
                              {profile.role === 'super_admin' && (
                                <option value="super_admin">
                                  Super Administrateur
                                </option>
                              )}
                            </select>
                          </td>
                          <td className="py-3 pr-3">
                            <button
                              type="button"
                              disabled={u.id === profile.id}
                              onClick={() =>
                                handleUpdateUserRole(
                                  u,
                                  u.role,
                                  !u.isActive
                                )
                              }
                              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer disabled:opacity-50 ${
                                u.isActive
                                  ? 'bg-[#DCEFE7] text-[#174B43]'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {u.isActive ? 'Actif' : 'Désactivé'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#83A99A]/25 p-6">
                <h3 className="text-base font-semibold text-[#174B43] mb-3">
                  Journal d’audit complet
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                  {auditLogs.map((l) => (
                    <div
                      key={l.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[#83A99A]/15"
                    >
                      <span>
                        <strong className="font-mono text-[#174B43]">
                          {l.action}
                        </strong>{' '}
                        — {l.details} ({l.actorEmail || 'visiteur'})
                      </span>
                      <span className="text-[#233B4A]/60 tabular-nums">
                        {new Date(l.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
