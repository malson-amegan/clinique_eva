import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  firstName: text('first_name').default(''),
  lastName: text('last_name').default(''),
  phone: text('phone').default(''),
  role: text('role').notNull().default('patient'), // patient | staff | admin | super_admin
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const specialties = pgTable('specialties', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  shortDescription: text('short_description').notNull(),
  fullDescription: text('full_description').notNull(),
  practicalInfo: text('practical_info').notNull(),
  imageKey: text('image_key').notNull(),
  iconName: text('icon_name').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isValidated: boolean('is_validated').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  referenceCode: text('reference_code').notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  lastName: text('last_name').notNull(),
  firstName: text('first_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  specialtySlug: text('specialty_slug').notNull(),
  specialtyName: text('specialty_name').notNull(),
  preferredDate: text('preferred_date').notNull(), // YYYY-MM-DD
  preferredSlot: text('preferred_slot').notNull(), // Matin | Après-midi | Fin de journée
  nonMedicalNote: text('non_medical_note'),
  status: text('status').notNull().default('en_attente'), // en_attente | confirme | reporte | annule
  proposedDate: text('proposed_date'),
  proposedSlot: text('proposed_slot'),
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  topic: text('topic').notNull().default('general'), // general | depistage_hta | depistage_diabete | autre
  message: text('message').notNull(),
  status: text('status').notNull().default('nouveau'), // nouveau | traite
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: text('author_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  status: text('status').notNull().default('en_attente'), // en_attente | valide | rejete
  moderatedBy: text('moderated_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  imageKey: text('image_key').notNull(),
  isMedicalApproved: boolean('is_medical_approved').notNull().default(false),
  isDemoContent: boolean('is_demo_content').notNull().default(true),
  isPublished: boolean('is_published').notNull().default(true),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').notNull().default('Informations générales'),
  displayOrder: integer('display_order').notNull().default(0),
  isValidated: boolean('is_validated').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const galleryItems = pgTable('gallery_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  caption: text('caption').notNull(),
  imageUrl: text('image_url').notNull(),
  isAmbientIllustration: boolean('is_ambient_illustration').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
});

export const institutionalPages = pgTable('institutional_pages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  isValidated: boolean('is_validated').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorUid: text('actor_uid'),
  actorEmail: text('actor_email'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  reviews: many(reviews),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));
