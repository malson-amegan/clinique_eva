import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

// Sur Vercel : 1 connexion par instance serverless (Neon gère le pooling côté serveur)
// En local : jusqu'à 10 connexions
const MAX_CONNEXIONS = process.env.VERCEL ? 1 : 10;

export const createPool = (): Pool => {
  // Réutilise le pool existant entre deux appels de la même instance
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST, // hôte "-pooler" de Neon
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      // SSL activé avec vérification du certificat (Neon l'exige)
      ssl: process.env.SQL_SSL === 'true' ? { rejectUnauthorized: true } : false,
      max: MAX_CONNEXIONS,
      idleTimeoutMillis: 10_000, // ferme vite les connexions inactives
      connectionTimeoutMillis: 15_000, // laisse le temps à Neon de se réveiller
    });

    global._postgresPool.on('error', (err) => {
      console.error('Erreur inattendue sur une connexion inactive du pool SQL :', err);
    });
  }
  return global._postgresPool;
};

export const db = drizzle(createPool(), { schema });