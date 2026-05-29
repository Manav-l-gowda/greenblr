import crypto from 'crypto';
import type { Request } from 'express';

export const COOKIE_NAME = 'admin_session';
const SESSION_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret() {
  if (!process.env.ADMIN_SECRET) throw new Error('ADMIN_SECRET not set');
  return process.env.ADMIN_SECRET;
}

function sign(timestamp: number): string {
  return crypto
    .createHmac('sha256', secret())
    .update(String(timestamp))
    .digest('hex');
}

export function createSessionToken(): string {
  const ts = Date.now();
  return `${ts}.${sign(ts)}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return false;
    const ts = parseInt(token.slice(0, dot), 10);
    const sig = token.slice(dot + 1);
    if (isNaN(ts) || Date.now() - ts > SESSION_MS) return false;
    const expected = sign(ts);
    return (
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
    );
  } catch {
    return false;
  }
}

export function isAdminAuthenticated(req: Request): boolean {
  const token = req.cookies?.[COOKIE_NAME];
  return !!token && verifySessionToken(token);
}
