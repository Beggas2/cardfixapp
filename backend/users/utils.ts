import { secret } from "encore.dev/config";

const jwtSecret = secret("JWTSecret");

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function hashPassword(password: string): Promise<string> {
  // Simple hash - in production, use bcrypt or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(password + jwtSecret());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

export function generateToken(payload: any): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
  const tokenPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/[+/=]/g, (m) => ({'+': '-', '/': '_', '=': ''}[m] || m));
  const encodedPayload = btoa(JSON.stringify(tokenPayload)).replace(/[+/=]/g, (m) => ({'+': '-', '/': '_', '=': ''}[m] || m));
  
  // Simple signature - in production, use proper HMAC
  const signature = btoa(encodedHeader + "." + encodedPayload + jwtSecret()).replace(/[+/=]/g, (m) => ({'+': '-', '/': '_', '=': ''}[m] || m));
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
