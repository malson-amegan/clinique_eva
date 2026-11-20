export type UserRole = 'patient' | 'staff' | 'admin' | 'super_admin';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

export interface Specialty {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  practicalInfo: string;
  imageKey: string;
  iconName: string;
  displayOrder: number;
  isValidated: boolean;
  isPublished: boolean;
}

export type AppointmentStatus = 'en_attente' | 'confirme' | 'reporte' | 'annule';

export interface Appointment {
  id: number;
  referenceCode: string;
  userId: number | null;
  lastName: string;
  firstName: string;
  phone: string;
  email: string | null;
  specialtySlug: string;
  specialtyName: string;
  preferredDate: string;
  preferredSlot: string;
  nonMedicalNote: string | null;
  status: AppointmentStatus;
  proposedDate: string | null;
  proposedSlot: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicReview {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminReview extends PublicReview {
  status: 'en_attente' | 'valide' | 'rejete';
  moderatedBy: string | null;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  imageKey: string;
  isMedicalApproved: boolean;
  isDemoContent: boolean;
  isPublished: boolean;
  publishedAt: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isValidated: boolean;
  isPublished: boolean;
}

export interface GalleryItem {
  id: number;
  title: string;
  caption: string;
  imageUrl: string;
  isAmbientIllustration: boolean;
  displayOrder: number;
  isPublished: boolean;
}

export interface InstitutionalPage {
  id: number;
  slug: string;
  title: string;
  body: string;
  isValidated: boolean;
}

export interface ContactMessage {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  topic: string;
  message: string;
  status: 'nouveau' | 'traite';
  createdAt: string;
}

export interface AuditLog {
  id: number;
  actorUid: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

export interface PublicHomeData {
  specialties: Specialty[];
  articles: Article[];
  faqs: FaqItem[];
  gallery: GalleryItem[];
  institutional: InstitutionalPage[];
  reviews: PublicReview[];
}
