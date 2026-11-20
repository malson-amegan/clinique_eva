import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './src/db/index.ts';
import {
  appointments,
  articles,
  auditLogs,
  contactMessages,
  faqs,
  galleryItems,
  institutionalPages,
  reviews,
  specialties,
  users,
} from './src/db/schema.ts';
import { ensureSeedData } from './src/db/seed.ts';
import { logAuditAction } from './src/db/users.ts';
import {
  AuthRequest,
  optionalAuth,
  requireAuth,
  requireRoles,
} from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    xFrameOptions: false,
  })
);
app.use(express.json({ limit: '1mb' }));

// Simple in-memory rate limiter for public write routes (anti-spam)
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, maxRequests = 15, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateBuckets.get(ip);
  if (!entry || now > entry.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

function generateReferenceCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `EVA-${y}${m}${d}-${suffix}`;
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Validation schemas
const appointmentCreateSchema = z.object({
  lastName: z.string().trim().min(2, 'Le nom est requis.').max(80),
  firstName: z.string().trim().min(2, 'Le prénom est requis.').max(80),
  phone: z
    .string()
    .trim()
    .min(8, 'Numéro de téléphone invalide.')
    .max(30),
  email: z
    .string()
    .trim()
    .email('Adresse email invalide.')
    .optional()
    .or(z.literal('')),
  specialtySlug: z.string().trim().min(2, 'Veuillez choisir une spécialité.'),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date souhaitée invalide.')
    .refine((value) => {
      const date = new Date(`${value}T12:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, 'Date souhaitée invalide.'),
  preferredSlot: z.enum(['Matin', 'Après-midi', 'Fin de journée']),
  nonMedicalNote: z.string().trim().max(400).optional().or(z.literal('')),
  website: z.string().max(0).optional(), // Anti-spam honeypot
});

const contactCreateSchema = z.object({
  fullName: z.string().trim().min(2, 'Nom complet requis.').max(100),
  phone: z.string().trim().min(8, 'Numéro de téléphone requis.').max(30),
  email: z
    .string()
    .trim()
    .email('Adresse email invalide.')
    .optional()
    .or(z.literal('')),
  topic: z.enum(['general', 'depistage_hta', 'depistage_diabete', 'autre']),
  message: z.string().trim().min(5, 'Message trop court.').max(1000),
  website: z.string().max(0).optional(),
});

const reviewCreateSchema = z.object({
  authorName: z.string().trim().min(2, 'Nom ou pseudonyme requis.').max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(8, 'Votre avis est trop court.').max(600),
  website: z.string().max(0).optional(),
});

// SEO: Robots.txt & Sitemap.xml
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain');
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /api/admin/\nSitemap: ${baseUrl}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    await ensureSeedData();
    const baseUrl =
      process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const specs = await db
      .select({ slug: specialties.slug })
      .from(specialties)
      .where(
        and(eq(specialties.isPublished, true), eq(specialties.isValidated, true))
      );
    const arts = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(
        and(
          eq(articles.isPublished, true),
          eq(articles.isMedicalApproved, true),
          eq(articles.isDemoContent, false)
        )
      );

    const staticPaths = [
      '',
      '/clinique',
      '/specialites',
      '/prevention',
      '/rendez-vous',
      '/conseils-sante',
      '/avis',
      '/faq',
      '/contact',
    ];

    const urls = [
      ...staticPaths.map((p) => `${baseUrl}${p}`),
      ...specs.map((s) => `${baseUrl}/specialites/${s.slug}`),
      ...arts.map((a) => `${baseUrl}/conseils-sante/${a.slug}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u}</loc>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Public Config
app.get('/api/public/config', (_req, res) => {
  res.json({
    mapsApiKey:
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '',
  });
});

// Public Bootstrap Bundle
app.get('/api/public/home', async (_req, res) => {
  try {
    await ensureSeedData();
    const [specList, artList, faqList, galList, instList, revList] =
      await Promise.all([
        db
          .select()
          .from(specialties)
          .where(eq(specialties.isPublished, true))
          .orderBy(asc(specialties.displayOrder), asc(specialties.id)),
        db
          .select()
          .from(articles)
          .where(
            and(
              eq(articles.isPublished, true),
              eq(articles.isMedicalApproved, true),
              eq(articles.isDemoContent, false)
            )
          )
          .orderBy(desc(articles.publishedAt)),
        db
          .select()
          .from(faqs)
          .where(
            and(eq(faqs.isPublished, true), eq(faqs.isValidated, true))
          )
          .orderBy(asc(faqs.displayOrder), asc(faqs.id)),
        db
          .select()
          .from(galleryItems)
          .where(
            and(
              eq(galleryItems.isPublished, true),
              eq(galleryItems.isAmbientIllustration, false)
            )
          )
          .orderBy(asc(galleryItems.displayOrder), asc(galleryItems.id)),
        db
          .select()
          .from(institutionalPages)
          .where(eq(institutionalPages.isValidated, true))
          .orderBy(asc(institutionalPages.id)),
        db
          .select({
            id: reviews.id,
            authorName: reviews.authorName,
            rating: reviews.rating,
            comment: reviews.comment,
            createdAt: reviews.createdAt,
          })
          .from(reviews)
          .where(eq(reviews.status, 'valide'))
          .orderBy(desc(reviews.createdAt)),
      ]);

    res.json({
      specialties: specList.map((specialty) =>
        specialty.isValidated
          ? specialty
          : {
              ...specialty,
              shortDescription: `La Clinique EVA propose le service « ${specialty.title} ». Contactez le secrétariat pour confirmer les modalités.`,
              fullDescription: '',
              practicalInfo:
                'Les modalités et disponibilités de ce service sont à confirmer auprès du secrétariat.',
            }
      ),
      articles: artList,
      faqs: faqList,
      gallery: galList,
      institutional: instList,
      reviews: revList,
    });
  } catch (error) {
    console.error('Failed to load public home data:', error);
    res.status(500).json({ error: 'Impossible de charger les données publiques.' });
  }
});

// Public: Create appointment request (never confirmed until validated by clinic)
app.post('/api/appointments', optionalAuth, async (req: AuthRequest, res) => {
  const clientIp = req.ip || 'unknown';
  if (!checkRateLimit(`appt:${clientIp}`, 12, 60_000)) {
    return res
      .status(429)
      .json({ error: 'Trop de demandes envoyées. Veuillez patienter un instant.' });
  }

  const parsed = appointmentCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Données du formulaire invalides.',
    });
  }

  const requestedDay = new Date(
    `${parsed.data.preferredDate}T12:00:00.000Z`
  ).getUTCDay();
  const todayAtLome = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  if (parsed.data.preferredDate < todayAtLome) {
    return res.status(400).json({ error: 'La date souhaitée doit être aujourd’hui ou ultérieure.' });
  }
  if (requestedDay === 0) {
    return res.status(400).json({ error: 'La clinique est fermée le dimanche. Veuillez choisir un autre jour.' });
  }
  if (requestedDay === 6 && parsed.data.preferredSlot !== 'Matin') {
    return res.status(400).json({ error: 'Le samedi, la clinique ferme à 13 h 30. Choisissez le créneau du matin.' });
  }

  try {
    await ensureSeedData();
    const specRows = await db
      .select()
      .from(specialties)
      .where(
        and(
          eq(specialties.slug, parsed.data.specialtySlug),
          eq(specialties.isPublished, true)
        )
      )
      .limit(1);

    if (specRows.length === 0) {
      return res.status(400).json({ error: 'Cette spécialité n’est pas disponible pour les demandes en ligne.' });
    }
    const specTitle = specRows[0].title;
    const referenceCode = generateReferenceCode();

    const inserted = await db
      .insert(appointments)
      .values({
        referenceCode,
        userId: req.dbUser?.id ?? null,
        lastName: parsed.data.lastName,
        firstName: parsed.data.firstName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        specialtySlug: parsed.data.specialtySlug,
        specialtyName: specTitle,
        preferredDate: parsed.data.preferredDate,
        preferredSlot: parsed.data.preferredSlot,
        nonMedicalNote: parsed.data.nonMedicalNote || null,
        status: 'en_attente',
      })
      .returning();

    await logAuditAction({
      actorUid: req.dbUser?.uid ?? null,
      actorEmail: req.dbUser?.email ?? parsed.data.email ?? null,
      action: 'APPOINTMENT_REQUEST_CREATED',
      entityType: 'appointment',
      entityId: String(inserted[0].id),
      details: `Demande ${referenceCode} pour ${specTitle} (${parsed.data.preferredDate})`,
    });

    res.status(201).json({
      appointment: {
        id: inserted[0].id,
        referenceCode: inserted[0].referenceCode,
        specialtyName: inserted[0].specialtyName,
        preferredDate: inserted[0].preferredDate,
        preferredSlot: inserted[0].preferredSlot,
        status: inserted[0].status,
        createdAt: inserted[0].createdAt,
      },
      message:
        'Votre demande de rendez-vous a bien été enregistrée. Elle reste en attente de validation par notre secrétariat.',
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res
      .status(500)
      .json({ error: 'Erreur lors de l’enregistrement de votre demande.' });
  }
});

// Public: Check appointment status by reference code & phone
app.get('/api/appointments/lookup', async (req, res) => {
  const ref = String(req.query.reference || '').trim().toUpperCase();
  const phone = String(req.query.phone || '').replace(/\s+/g, '').trim();

  if (!checkRateLimit(`lookup:${req.ip || 'unknown'}`, 8, 60_000)) {
    return res.status(429).json({
      error: 'Trop de tentatives de vérification. Veuillez réessayer plus tard.',
    });
  }
  if (!/^EVA-\d{8}-[A-Z2-9]{4}$/.test(ref) || phone.replace(/\D/g, '').length < 8) {
    return res.status(400).json({
      error: 'Veuillez saisir la référence et le numéro de téléphone.',
    });
  }

  try {
    const rows = await db
      .select()
      .from(appointments)
      .where(eq(appointments.referenceCode, ref))
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aucune demande trouvée avec cette référence.' });
    }

    const row = rows[0];
    const normalizePhone = (value: string) => {
      const digits = value.replace(/\D/g, '').replace(/^00/, '');
      return digits.startsWith('228') ? digits.slice(3) : digits;
    };
    const normalizedRowPhone = normalizePhone(row.phone);
    const normalizedQueryPhone = normalizePhone(phone);
    if (!normalizedQueryPhone || normalizedRowPhone !== normalizedQueryPhone) {
      return res.status(403).json({
        error: 'Le numéro de téléphone ne correspond pas à cette référence.',
      });
    }

    res.json({
      appointment: {
        referenceCode: row.referenceCode,
        firstName: row.firstName,
        lastName: row.lastName,
        specialtyName: row.specialtyName,
        preferredDate: row.preferredDate,
        preferredSlot: row.preferredSlot,
        status: row.status,
        proposedDate: row.proposedDate,
        proposedSlot: row.proposedSlot,
        adminNote: row.adminNote,
        createdAt: row.createdAt,
      },
    });
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({ error: 'Impossible de vérifier cette référence.' });
  }
});

// Public: Contact & Prevention info request
app.post('/api/contact', async (req, res) => {
  const clientIp = req.ip || 'unknown';
  if (!checkRateLimit(`contact:${clientIp}`, 10, 60_000)) {
    return res
      .status(429)
      .json({ error: 'Trop de messages envoyés. Veuillez patienter.' });
  }

  const parsed = contactCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Champs invalides.',
    });
  }

  try {
    const inserted = await db
      .insert(contactMessages)
      .values({
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        topic: parsed.data.topic,
        message: parsed.data.message,
      })
      .returning();

    res.status(201).json({
      id: inserted[0].id,
      message:
        'Votre demande d’information a bien été transmise au secrétariat de la Clinique EVA.',
    });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Erreur lors de l’envoi du message.' });
  }
});

// Public: Submit review (enters moderation queue)
app.post('/api/reviews', optionalAuth, async (req: AuthRequest, res) => {
  const clientIp = req.ip || 'unknown';
  if (!checkRateLimit(`review:${clientIp}`, 6, 60_000)) {
    return res
      .status(429)
      .json({ error: 'Veuillez patienter avant de soumettre un autre avis.' });
  }

  const parsed = reviewCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Avis invalide.',
    });
  }

  try {
    const inserted = await db
      .insert(reviews)
      .values({
        userId: req.dbUser?.id ?? null,
        authorName: parsed.data.authorName,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        status: 'en_attente',
      })
      .returning();

    res.status(201).json({
      id: inserted[0].id,
      message:
        'Merci pour votre témoignage. Il sera visible publiquement après validation par notre équipe de modération.',
    });
  } catch (error) {
    console.error('Review submit error:', error);
    res.status(500).json({ error: 'Impossible d’enregistrer votre avis.' });
  }
});

// Patient Portal Routes (authenticated)
app.get('/api/patient/me', requireAuth, async (req: AuthRequest, res) => {
  res.json({ user: req.dbUser });
});

app.patch('/api/patient/me', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    firstName: z.string().trim().max(80),
    lastName: z.string().trim().max(80),
    phone: z.string().trim().max(30),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success || !req.dbUser) {
    return res.status(400).json({ error: 'Coordonnées invalides.' });
  }

  try {
    const updated = await db
      .update(users)
      .set({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.dbUser.id))
      .returning();

    res.json({ user: updated[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil.' });
  }
});

app.get(
  '/api/patient/appointments',
  requireAuth,
  async (req: AuthRequest, res) => {
    if (!req.dbUser) return res.status(401).json({ error: 'Non autorisé.' });
    try {
      const list = await db
        .select()
        .from(appointments)
        .where(eq(appointments.userId, req.dbUser.id))
        .orderBy(desc(appointments.createdAt));

      res.json({ appointments: list });
    } catch (error) {
      console.error('Fetch patient appointments error:', error);
      res
        .status(500)
        .json({ error: 'Impossible de récupérer vos demandes de rendez-vous.' });
    }
  }
);

// Admin & Staff Back-Office Routes
const staffGuard = [
  requireAuth,
  requireRoles(['staff', 'admin', 'super_admin']),
];
const adminGuard = [requireAuth, requireRoles(['admin', 'super_admin'])];

function isMedicalReviewer(req: AuthRequest) {
  if (!req.user?.email_verified || !req.dbUser?.email) return false;
  const allowedEmails = new Set(
    (process.env.MEDICAL_REVIEWER_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
  return allowedEmails.has(req.dbUser.email.trim().toLowerCase());
}

app.get('/api/admin/dashboard', ...staffGuard, async (_req, res) => {
  try {
    await ensureSeedData();
    const [allAppts, allContacts, allReviews, logs] = await Promise.all([
      db.select().from(appointments).orderBy(desc(appointments.createdAt)),
      db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)),
      db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(25),
    ]);

    const statusCounts = {
      total: allAppts.length,
      en_attente: allAppts.filter((a) => a.status === 'en_attente').length,
      confirme: allAppts.filter((a) => a.status === 'confirme').length,
      reporte: allAppts.filter((a) => a.status === 'reporte').length,
      annule: allAppts.filter((a) => a.status === 'annule').length,
    };

    const bySpecialtyMap: Record<string, number> = {};
    for (const a of allAppts) {
      bySpecialtyMap[a.specialtyName] =
        (bySpecialtyMap[a.specialtyName] || 0) + 1;
    }
    const bySpecialty = Object.entries(bySpecialtyMap).map(([name, count]) => ({
      name,
      count,
    }));

    res.json({
      stats: {
        ...statusCounts,
        unreadContacts: allContacts.filter((c) => c.status === 'nouveau').length,
        pendingReviews: allReviews.filter((r) => r.status === 'en_attente')
          .length,
      },
      bySpecialty,
      recentAuditLogs: logs,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du tableau de bord.' });
  }
});

app.get('/api/admin/appointments', ...staffGuard, async (req, res) => {
  try {
    const statusFilter = String(req.query.status || '').trim();
    const dateFilter = String(req.query.date || '').trim();
    const search = String(req.query.search || '').trim().toLowerCase();

    const rows = await db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.createdAt));

    const filtered = rows.filter((row) => {
      if (statusFilter && statusFilter !== 'all' && row.status !== statusFilter)
        return false;
      if (dateFilter && row.preferredDate !== dateFilter) return false;
      if (search) {
        const hay =
          `${row.referenceCode} ${row.firstName} ${row.lastName} ${row.phone} ${row.specialtyName}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    res.json({ appointments: filtered });
  } catch (error) {
    console.error('Admin appointments fetch error:', error);
    res.status(500).json({ error: 'Erreur de chargement des rendez-vous.' });
  }
});

app.patch(
  '/api/admin/appointments/:id',
  ...staffGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const schema = z.object({
      status: z.enum(['en_attente', 'confirme', 'reporte', 'annule']),
      proposedDate: z.string().optional().nullable(),
      proposedSlot: z.string().optional().nullable(),
      adminNote: z.string().max(500).optional().nullable(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Données de mise à jour invalides.' });
    }

    try {
      const updated = await db
        .update(appointments)
        .set({
          status: parsed.data.status,
          proposedDate: parsed.data.proposedDate ?? null,
          proposedSlot: parsed.data.proposedSlot ?? null,
          adminNote: parsed.data.adminNote ?? null,
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: 'Demande introuvable.' });
      }

      await logAuditAction({
        actorUid: req.dbUser?.uid,
        actorEmail: req.dbUser?.email,
        action: 'APPOINTMENT_STATUS_UPDATED',
        entityType: 'appointment',
        entityId: String(id),
        details: `Statut → ${parsed.data.status} (${updated[0].referenceCode})`,
      });

      res.json({ appointment: updated[0] });
    } catch (error) {
      console.error('Appointment update error:', error);
      res.status(500).json({ error: 'Impossible de mettre à jour la demande.' });
    }
  }
);

app.get('/api/admin/contacts', ...staffGuard, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    res.json({ contacts: rows });
  } catch (error) {
    console.error('Admin contacts error:', error);
    res.status(500).json({ error: 'Erreur de chargement des messages.' });
  }
});

app.patch(
  '/api/admin/contacts/:id',
  ...staffGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const status = req.body?.status === 'traite' ? 'traite' : 'nouveau';
    try {
      const updated = await db
        .update(contactMessages)
        .set({ status })
        .where(eq(contactMessages.id, id))
        .returning();
      await logAuditAction({
        actorUid: req.dbUser?.uid,
        actorEmail: req.dbUser?.email,
        action: 'CONTACT_STATUS_UPDATED',
        entityType: 'contact_message',
        entityId: String(id),
        details: `Statut → ${status}`,
      });
      res.json({ contact: updated[0] });
    } catch (error) {
      console.error('Contact update error:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
    }
  }
);

app.get('/api/admin/reviews', ...staffGuard, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt));
    res.json({ reviews: rows });
  } catch (error) {
    console.error('Admin reviews error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des avis.' });
  }
});

app.patch(
  '/api/admin/reviews/:id',
  ...staffGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const status = req.body?.status;
    if (!['en_attente', 'valide', 'rejete'].includes(status) || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Statut de modération invalide.' });
    }

    try {
      const updated = await db
        .update(reviews)
        .set({
          status,
          moderatedBy: req.dbUser?.email || 'staff',
        })
        .where(eq(reviews.id, id))
        .returning();

      await logAuditAction({
        actorUid: req.dbUser?.uid,
        actorEmail: req.dbUser?.email,
        action: 'REVIEW_MODERATED',
        entityType: 'review',
        entityId: String(id),
        details: `Avis modéré → ${status}`,
      });

      res.json({ review: updated[0] });
    } catch (error) {
      console.error('Review moderation error:', error);
      res.status(500).json({ error: 'Erreur lors de la modération.' });
    }
  }
);

// CMS Routes (Specialties, Institutional, FAQs, Articles, Gallery)
app.get('/api/admin/cms', ...staffGuard, async (_req, res) => {
  try {
    await ensureSeedData();
    const [specList, instList, faqList, artList, galList] = await Promise.all([
      db.select().from(specialties).orderBy(asc(specialties.displayOrder)),
      db.select().from(institutionalPages).orderBy(asc(institutionalPages.id)),
      db.select().from(faqs).orderBy(asc(faqs.displayOrder)),
      db.select().from(articles).orderBy(desc(articles.publishedAt)),
      db.select().from(galleryItems).orderBy(asc(galleryItems.displayOrder)),
    ]);
    res.json({
      specialties: specList,
      institutional: instList,
      faqs: faqList,
      articles: artList,
      gallery: galList,
    });
  } catch (error) {
    console.error('CMS fetch error:', error);
    res.status(500).json({ error: 'Erreur de chargement du contenu CMS.' });
  }
});

app.put(
  '/api/admin/specialties/:id',
  ...adminGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const schema = z.object({
      title: z.string().trim().min(2),
      shortDescription: z.string().trim().min(5),
      fullDescription: z.string().trim().min(10),
      practicalInfo: z.string().trim().min(5),
      isValidated: z.boolean(),
      isPublished: z.boolean(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Contenu de spécialité invalide.' });
    }
    if (parsed.data.isValidated && !isMedicalReviewer(req)) {
      return res.status(403).json({
        error: 'Seul un relecteur médical autorisé peut valider une fiche de spécialité.',
      });
    }

    try {
      const updated = await db
        .update(specialties)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(specialties.id, id))
        .returning();

      await logAuditAction({
        actorUid: req.dbUser?.uid,
        actorEmail: req.dbUser?.email,
        action: 'SPECIALTY_UPDATED',
        entityType: 'specialty',
        entityId: String(id),
        details: `${parsed.data.title} (validé: ${parsed.data.isValidated})`,
      });
      res.json({ specialty: updated[0] });
    } catch (error) {
      console.error('Specialty update error:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
    }
  }
);

app.put(
  '/api/admin/institutional/:id',
  ...adminGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const schema = z.object({
      title: z.string().trim().min(2),
      body: z.string().trim().min(10),
      isValidated: z.boolean(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Contenu institutionnel invalide.' });
    }

    try {
      const updated = await db
        .update(institutionalPages)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(institutionalPages.id, id))
        .returning();

      await logAuditAction({
        actorUid: req.dbUser?.uid,
        actorEmail: req.dbUser?.email,
        action: 'INSTITUTIONAL_UPDATED',
        entityType: 'institutional_page',
        entityId: String(id),
        details: `${parsed.data.title}`,
      });
      res.json({ page: updated[0] });
    } catch (error) {
      console.error('Institutional update error:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
    }
  }
);

app.post('/api/admin/faqs', ...staffGuard, async (req: AuthRequest, res) => {
  const schema = z.object({
    question: z.string().trim().min(5),
    answer: z.string().trim().min(5),
    category: z.string().trim().min(2),
    isValidated: z.boolean().default(true),
    isPublished: z.boolean().default(true),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Champs FAQ invalides.' });
  }
  try {
    const inserted = await db
      .insert(faqs)
      .values({ ...parsed.data, displayOrder: 99 })
      .returning();
    await logAuditAction({
      actorUid: req.dbUser?.uid,
      actorEmail: req.dbUser?.email,
      action: 'FAQ_CREATED',
      entityType: 'faq',
      entityId: String(inserted[0].id),
      details: parsed.data.question,
    });
    res.status(201).json({ faq: inserted[0] });
  } catch (error) {
    console.error('FAQ create error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la FAQ.' });
  }
});

app.put('/api/admin/faqs/:id', ...staffGuard, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const schema = z.object({
    question: z.string().trim().min(5),
    answer: z.string().trim().min(5),
    category: z.string().trim().min(2),
    isValidated: z.boolean(),
    isPublished: z.boolean(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    return res.status(400).json({ error: 'Champs FAQ invalides.' });
  }
  try {
    const updated = await db
      .update(faqs)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(faqs.id, id))
      .returning();
    res.json({ faq: updated[0] });
  } catch (error) {
    console.error('FAQ update error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la FAQ.' });
  }
});

app.delete(
  '/api/admin/faqs/:id',
  ...adminGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    try {
      await db.delete(faqs).where(eq(faqs.id, id));
      await logAuditAction({
        actorUid: req.dbUser?.uid,
        actorEmail: req.dbUser?.email,
        action: 'FAQ_DELETED',
        entityType: 'faq',
        entityId: String(id),
      });
      res.json({ ok: true });
    } catch (error) {
      console.error('FAQ delete error:', error);
      res.status(500).json({ error: 'Erreur de suppression.' });
    }
  }
);

app.post('/api/admin/articles', ...staffGuard, async (req: AuthRequest, res) => {
  const schema = z.object({
    title: z.string().trim().min(4),
    category: z.string().trim().min(2),
    excerpt: z.string().trim().min(10),
    content: z.string().trim().min(20),
    imageKey: z.string().trim().default('prevention'),
    isMedicalApproved: z.boolean().default(false),
    isDemoContent: z.boolean().default(false),
    isPublished: z.boolean().default(true),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Contenu d’article invalide.' });
  }
  if (parsed.data.isMedicalApproved && !isMedicalReviewer(req)) {
    return res.status(403).json({
      error: 'Seul un relecteur médical autorisé peut approuver un article.',
    });
  }
  try {
    const slug = `${slugify(parsed.data.title)}-${Date.now().toString(36).slice(-4)}`;
    const inserted = await db
      .insert(articles)
      .values({ ...parsed.data, slug })
      .returning();
    await logAuditAction({
      actorUid: req.dbUser?.uid,
      actorEmail: req.dbUser?.email,
      action: 'ARTICLE_CREATED',
      entityType: 'article',
      entityId: String(inserted[0].id),
      details: parsed.data.title,
    });
    res.status(201).json({ article: inserted[0] });
  } catch (error) {
    console.error('Article create error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l’article.' });
  }
});

app.put(
  '/api/admin/articles/:id',
  ...staffGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const schema = z.object({
      title: z.string().trim().min(4),
      category: z.string().trim().min(2),
      excerpt: z.string().trim().min(10),
      content: z.string().trim().min(20),
      imageKey: z.string().trim(),
      isMedicalApproved: z.boolean(),
      isDemoContent: z.boolean(),
      isPublished: z.boolean(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Champs d’article invalides.' });
    }
    if (parsed.data.isMedicalApproved && !isMedicalReviewer(req)) {
      return res.status(403).json({
        error: 'Seul un relecteur médical autorisé peut approuver un article.',
      });
    }
    try {
      const updated = await db
        .update(articles)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(articles.id, id))
        .returning();
      await logAuditAction({
        actorUid: req.dbUser?.uid,
        actorEmail: req.dbUser?.email,
        action: 'ARTICLE_UPDATED',
        entityType: 'article',
        entityId: String(id),
        details: `${parsed.data.title} (validation médicale: ${parsed.data.isMedicalApproved})`,
      });
      res.json({ article: updated[0] });
    } catch (error) {
      console.error('Article update error:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
    }
  }
);

app.delete(
  '/api/admin/articles/:id',
  ...adminGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    try {
      await db.delete(articles).where(eq(articles.id, id));
      await logAuditAction({
        actorUid: req.dbUser?.uid,
        actorEmail: req.dbUser?.email,
        action: 'ARTICLE_DELETED',
        entityType: 'article',
        entityId: String(id),
      });
      res.json({ ok: true });
    } catch (error) {
      console.error('Article delete error:', error);
      res.status(500).json({ error: 'Erreur de suppression.' });
    }
  }
);

app.post('/api/admin/gallery', ...adminGuard, async (req: AuthRequest, res) => {
  const schema = z.object({
    title: z.string().trim().min(2),
    caption: z.string().trim().min(5),
    imageUrl: z.string().trim().min(5),
    isAmbientIllustration: z.boolean().default(false),
    isPublished: z.boolean().default(true),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Données de galerie invalides.' });
  }
  try {
    const inserted = await db
      .insert(galleryItems)
      .values({ ...parsed.data, displayOrder: 99 })
      .returning();
    res.status(201).json({ item: inserted[0] });
  } catch (error) {
    console.error('Gallery create error:', error);
    res.status(500).json({ error: 'Erreur lors de l’ajout à la galerie.' });
  }
});

app.delete(
  '/api/admin/gallery/:id',
  ...adminGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    try {
      await db.delete(galleryItems).where(eq(galleryItems.id, id));
      res.json({ ok: true });
    } catch (error) {
      console.error('Gallery delete error:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
  }
);

// Accounts & Roles Management
app.get('/api/admin/users', ...adminGuard, async (_req, res) => {
  try {
    const list = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json({ users: list });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Impossible de charger les comptes.' });
  }
});

app.patch(
  '/api/admin/users/:id',
  ...adminGuard,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const schema = z.object({
      role: z.enum(['patient', 'staff', 'admin', 'super_admin']),
      isActive: z.boolean(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Paramètres utilisateur invalides.' });
    }
    if (req.dbUser?.id === id && parsed.data.role !== req.dbUser.role) {
      return res.status(400).json({
        error: 'Vous ne pouvez pas modifier votre propre rôle actif.',
      });
    }
    if (
      parsed.data.role === 'super_admin' &&
      req.dbUser?.role !== 'super_admin'
    ) {
      return res.status(403).json({
        error: 'Seul un super-administrateur peut attribuer le rôle Super Admin.',
      });
    }

    try {
      const updated = await db
        .update(users)
        .set({
          role: parsed.data.role,
          isActive: parsed.data.isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      await logAuditAction({
        actorUid: req.dbUser?.uid,
        actorEmail: req.dbUser?.email,
        action: 'USER_ROLE_UPDATED',
        entityType: 'user',
        entityId: String(id),
        details: `Rôle → ${parsed.data.role}, Actif → ${parsed.data.isActive}`,
      });

      res.json({ user: updated[0] });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du compte.' });
    }
  }
);

app.get('/api/admin/audit-logs', ...adminGuard, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);
    res.json({ logs: rows });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du journal.' });
  }
});

// Healthcheck (lightweight, no DB probe at startup)
app.get('/api/health', async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Healthcheck error:', error);
    res.status(503).json({ status: 'error' });
  }
});

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: { server: httpServer },
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Clinique EVA server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
