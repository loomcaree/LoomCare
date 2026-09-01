import { NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type WaitlistPayload = {
  name?: string;
  email?: string;
  role?: string;
  isBetaTester?: boolean;
  userId?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set(['Adult Child / Caregiver', 'Elderly Parent', 'Healthcare Professional']);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WaitlistPayload;
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim().slice(0, 120) || 'Anonymous';
    const role = ALLOWED_ROLES.has(body.role ?? '') ? body.role! : 'Adult Child / Caregiver';

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'waitlist_leads'), {
      userId: body.userId || 'guest',
      name,
      email,
      role,
      isBetaTester: Boolean(body.isBetaTester),
      createdAt: serverTimestamp(),
    });

    const webhookUrl = process.env.EXCEL_WEBHOOK_URL;
    if (webhookUrl) {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Timestamp: new Date().toISOString(), FirestoreID: docRef.id,
          UserID: body.userId || 'N/A', Name: name, Email: email, Role: role,
          BetaTester: body.isBetaTester ? 'Yes' : 'No',
        }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!webhookResponse.ok) console.error('Excel webhook rejected waitlist lead', webhookResponse.status);
    }

    return NextResponse.json({ success: true, message: 'Lead registered successfully', id: docRef.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    console.error('Waitlist registration failed', message);
    return NextResponse.json({ error: 'Unable to register right now.' }, { status: 500 });
  }
}
