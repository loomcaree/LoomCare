import { NextResponse } from 'next/server';

type WaitlistPayload = {
  name?: string;
  email?: string;
  role?: string;
  city?: string;
  phone?: string;
  isBetaTester?: boolean;
  userId?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set([
  'Adult Child / Caregiver',
  'Elderly Parent',
  'Healthcare Professional',
  'Family Member',
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WaitlistPayload;
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim().slice(0, 120) || 'Anonymous';
    const role = ALLOWED_ROLES.has(body.role ?? '') ? body.role! : 'Adult Child / Caregiver';
    const city = body.city?.trim().slice(0, 80) || '';
    const phone = body.phone?.trim().slice(0, 30) || '';

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    let docId = 'lead_' + Math.random().toString(36).substring(2, 11);

    // Save to Firestore via REST API (Edge & Cloudflare Workers 100% compatible)
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (projectId && apiKey && !projectId.includes('demo')) {
      try {
        const firestoreEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/waitlist_leads?key=${apiKey}`;
        const firestoreRes = await fetch(firestoreEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              userId: { stringValue: body.userId || 'guest' },
              name: { stringValue: name },
              email: { stringValue: email },
              role: { stringValue: role },
              city: { stringValue: city },
              phone: { stringValue: phone },
              isBetaTester: { booleanValue: Boolean(body.isBetaTester) },
              createdAt: { timestampValue: new Date().toISOString() },
            },
          }),
          signal: AbortSignal.timeout(6000),
        });
        if (firestoreRes.ok) {
          const resData = (await firestoreRes.json()) as { name?: string };
          if (resData.name) {
            docId = resData.name.split('/').pop() || docId;
          }
        }
      } catch (dbError) {
        console.warn('Firestore REST write skipped:', dbError);
      }
    }

    const webhookUrl = process.env.EXCEL_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Timestamp: new Date().toISOString(),
            FirestoreID: docId,
            UserID: body.userId || 'N/A',
            Name: name,
            Email: email,
            Role: role,
            City: city,
            Phone: phone,
            BetaTester: body.isBetaTester ? 'Yes' : 'No',
          }),
          signal: AbortSignal.timeout(8_000),
        });
        if (!webhookResponse.ok) console.error('Excel webhook rejected waitlist lead', webhookResponse.status);
      } catch (webhookErr) {
        console.warn('Excel webhook dispatch failed:', webhookErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Lead registered successfully', id: docId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    console.error('Waitlist registration failed', message);
    return NextResponse.json({ error: 'Unable to register right now.' }, { status: 500 });
  }
}
