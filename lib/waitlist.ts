export const WAITLIST_CONSENT_VERSION = '2026-09-22';

export function getWaitlistEndpoint(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'script.google.com' ||
      !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

export interface WaitlistSubmissionValues {
  name: string;
  email: string;
  city: string;
  website: string;
  requestId: string;
  phone?: string;
  timeAlone?: string;
  marketingConsent?: boolean;
  idToken?: string;
}

export async function submitWaitlist(
  endpoint: string,
  values: WaitlistSubmissionValues,
  fetcher: typeof fetch = fetch,
) {
  if (!values.idToken || !values.idToken.trim()) {
    throw new Error('auth-required');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const payload = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: (values.phone || '').trim(),
      city: (values.city || '').trim(),
      timeAlone: (values.timeAlone || '').trim(),
      website: values.website || '',
      requestId: values.requestId,
      idToken: values.idToken,
      consent: 'yes',
      consentVersion: WAITLIST_CONSENT_VERSION,
      marketingConsent: values.marketingConsent ? 'yes' : 'no',
      timestamp: new Date().toISOString(),
    };

    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
      credentials: 'omit',
      signal: controller.signal,
    });

    if (!response.ok) throw new Error('unconfirmed');
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object') throw new Error('unconfirmed');

    const res = result as Record<string, unknown>;
    if (res.code === 'BUSY') throw new Error('busy');
    if (res.code === 'AUTH_REQUIRED') throw new Error('auth-required');
    if (res.status === 'error' || res.ok === false) {
      throw new Error(typeof res.message === 'string' ? res.message : 'unconfirmed');
    }
    if (typeof res.requestId === 'string' && res.requestId !== values.requestId) {
      throw new Error('unconfirmed');
    }

    const isSuccess =
      res.status === 'success' ||
      res.ok === true ||
      res.result === 'success' ||
      res.duplicate === true;

    if (!isSuccess) {
      throw new Error('unconfirmed');
    }

  } finally {
    clearTimeout(timeout);
  }
}

