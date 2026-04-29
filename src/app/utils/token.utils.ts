export interface TokenPayload {
  sub?: string;
  email?: string;
  name?: string;
  userId?: string;
  userName?: string;
  jti?: string;
  iat?: number;
  exp: number;
  [key: string]: unknown;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      '=',
    );
    const decoded = atob(padded);
    return normalizePayload(JSON.parse(decoded) as TokenPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowInSeconds;
}

export function getTokenExpirationDate(token: string): Date | null {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return null;
  }
  return new Date(payload.exp * 1000);
}

export function getTimeUntilExpiration(token: string): number {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return 0;
  }
  const nowMs = Date.now();
  const expMs = payload.exp * 1000;
  return Math.max(0, expMs - nowMs);
}

function normalizePayload(payload: TokenPayload): TokenPayload {
  const claim = (key: string): string | undefined => {
    const value = payload[key];
    return typeof value === 'string' && value.trim() ? value : undefined;
  };

  const userId =
    payload.userId ??
    payload.sub ??
    claim('nameid') ??
    claim('uid') ??
    claim('id') ??
    claim('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier');

  const email =
    payload.email ??
    claim('unique_name') ??
    claim('upn') ??
    claim('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress');

  const name =
    payload.name ??
    claim('given_name') ??
    claim('preferred_username') ??
    claim('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name') ??
    email;

  return {
    ...payload,
    sub: payload.sub ?? userId,
    userId,
    email,
    name,
    userName: payload.userName ?? name,
  };
}
