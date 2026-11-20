import type { NextFunction, Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';

export interface DbUser {
  id: number;
  uid: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
}

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: DbUser;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(
      decoded.uid,
      decoded.email || '',
      decoded.name,
      decoded.email_verified
    );

    if (!dbUser.isActive) {
      return res
        .status(403)
        .json({ error: 'Ce compte a été désactivé par l’administration.' });
    }

    req.user = decoded;
    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res
      .status(401)
      .json({ error: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(
      decoded.uid,
      decoded.email || '',
      decoded.name,
      decoded.email_verified
    );
    if (dbUser.isActive) {
      req.user = decoded;
      req.dbUser = dbUser;
    }
  } catch {
    // Proceed cleanly as unauthenticated guest
  }
  next();
};

export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }
    if (!allowedRoles.includes(req.dbUser.role)) {
      return res.status(403).json({
        error: 'Accès réservé au personnel autorisé de la Clinique EVA.',
      });
    }
    next();
  };
};
