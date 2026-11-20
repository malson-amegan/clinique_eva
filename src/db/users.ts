import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { auditLogs, users } from './schema.ts';

function isConfiguredSuperAdmin(email: string, emailVerified: boolean) {
  if (!emailVerified) return false;
  const allowedEmails = new Set(
    (process.env.SUPER_ADMIN_EMAILS || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
  return allowedEmails.has(email.trim().toLowerCase());
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  emailVerified = false
) {
  try {
    const isSuperAdmin = isConfiguredSuperAdmin(email, emailVerified);
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existing.length > 0) {
      if (
        existing[0].email !== email ||
        (isSuperAdmin && existing[0].role !== 'super_admin')
      ) {
        const updated = await db
          .update(users)
          .set({
            email,
            ...(isSuperAdmin ? { role: 'super_admin' } : {}),
            updatedAt: new Date(),
          })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return existing[0];
    }

    const nameParts = (displayName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        firstName,
        lastName,
        role: isSuperAdmin ? 'super_admin' : 'patient',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(isSuperAdmin ? { role: 'super_admin' } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Impossible de synchroniser le profil utilisateur.', {
      cause: error,
    });
  }
}

export async function logAuditAction(entry: {
  actorUid?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
}) {
  try {
    await db.insert(auditLogs).values({
      actorUid: entry.actorUid ?? null,
      actorEmail: entry.actorEmail ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      details: entry.details ?? null,
    });
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
}
