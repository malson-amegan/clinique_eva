// api/index.ts
import app from '../server.ts';

export default function handler(req: any, res: any) {
  const url = new URL(req.url || '/', 'http://localhost');
  const originalPath = url.searchParams.get('__vercel_path');

  if (originalPath) {
    url.searchParams.delete('__vercel_path');
    const qs = url.searchParams.toString();
    req.url = originalPath + (qs ? `?${qs}` : '');
  }

  return app(req, res);
}