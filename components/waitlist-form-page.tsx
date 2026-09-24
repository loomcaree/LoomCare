import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getLoomAuth, markSignedIn } from '@/lib/firebase-auth';
import { getWaitlistDoc, saveWaitlistDetails } from '@/lib/firestore';
import { getWaitlistEndpoint, submitWaitlist, WAITLIST_CONSENT_VERSION } from '@/lib/waitlist';
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';

const endpoint = getWaitlistEndpoint(import.meta.env.VITE_WAITLIST_ENDPOINT);

function LoomLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="var(--blue)" opacity="0.1" />
      <circle cx="16" cy="16" r="9" fill="var(--blue)" opacity="0.25" />
      <circle cx="16" cy="16" r="4.5" fill="var(--blue)" />
    </svg>
  );
}

type PageState = 'loading' | 'ready' | 'submitting' | 'redirecting';

export function WaitlistFormPage() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form values
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [timeAlone, setTimeAlone] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [error, setError] = useState('');

  // Route protection + auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(getLoomAuth(), async (user) => {
      if (!user) {
        window.location.replace('/join/');
        return;
      }
      setCurrentUser(user);
      markSignedIn(user.email);

      // Already completed waitlist?
      try {
        const existing = await getWaitlistDoc(user.uid);
        if (existing) {
          window.location.replace('/dashboard/');
          return;
        }
      } catch {
        // If Firestore fails, still show the form
      }

      // Pre-fill name from Firebase profile
      if (user.displayName) {
        setFullName(user.displayName);
      }

      setPageState('ready');
    });
    return unsub;
  }, []);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!currentUser || !endpoint) return;
    setError('');
    setPageState('submitting');

    const requestId = `wl-${currentUser.uid.slice(0, 8)}-${Date.now()}`;

    try {
      // 1. Save to Firestore (source of truth for route protection)
      await saveWaitlistDetails(currentUser.uid, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        timeAlone,
        marketingConsent,
        requestId,
      });

      // 2. Sync to Google Sheets (best-effort — don't block on failure)
      try {
        const idToken = await currentUser.getIdToken();
        await submitWaitlist(endpoint, {
          name: fullName.trim(),
          email: currentUser.email!,
          city: city.trim(),
          phone: phone.trim(),
          timeAlone,
          website: '', // honeypot — always empty
          requestId,
          marketingConsent,
          idToken,
        });
      } catch {
        // Sheets sync failure is non-blocking; Firestore is the source of truth
      }

      window.location.href = '/dashboard/';
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
      setPageState('ready');
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (pageState === 'loading' || pageState === 'redirecting') {
    return (
      <div className="waitlist-form-page">
        <div className="auth-loading">
          <LoaderCircle size={24} className="auth-spinner" aria-label="Loading…" />
        </div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="waitlist-form-page">
      {/* Minimal header */}
      <header className="wf-header">
        <a href="/" className="auth-logo-link" aria-label="Loom Care home">
          <LoomLogo />
          <span>Loom Care</span>
        </a>
      </header>

      <main className="wf-main">
        <div className="wf-card">
          <AnimatePresence mode="wait">
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="wf-badge">
                <CheckCircle2 size={16} />
                Account created ✓
              </div>

              <h1 className="wf-title">Tell us about yourself</h1>
              <p className="wf-subtitle">
                Hi {currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'there'} 👋 — one quick form and your
                spot is locked in.
              </p>

              {error && <p className="auth-error-msg">{error}</p>}

              <form className="wf-form" onSubmit={handleSubmit}>
                {/* Full name */}
                <div className="auth-input-group">
                  <label htmlFor="wf-name">Full name *</label>
                  <div className="auth-input-wrap">
                    <input
                      id="wf-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="auth-input-group">
                  <label htmlFor="wf-phone">
                    Phone number <span className="wf-optional">(optional)</span>
                  </label>
                  <div className="auth-input-wrap">
                    <input
                      id="wf-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="auth-input-group">
                  <label htmlFor="wf-city">
                    City <span className="wf-optional">(optional)</span>
                  </label>
                  <div className="auth-input-wrap">
                    <input
                      id="wf-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Delhi, Bangalore"
                      autoComplete="address-level2"
                    />
                  </div>
                </div>

                {/* Time alone */}
                <div className="wf-radio-group">
                  <p className="wf-radio-label">
                    Does your elderly family member spend time at home alone?
                  </p>
                  <div className="wf-radio-options">
                    {[
                      { value: 'yes', label: 'Yes, regularly' },
                      { value: 'sometimes', label: 'Sometimes' },
                      { value: 'no', label: 'No, rarely' },
                    ].map((opt) => (
                      <label key={opt.value} className="wf-radio-item">
                        <input
                          type="radio"
                          name="timeAlone"
                          value={opt.value}
                          checked={timeAlone === opt.value}
                          onChange={() => setTimeAlone(opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Marketing consent */}
                <label className="wf-checkbox-item">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    id="wf-marketing"
                  />
                  <span>
                    I'm happy to receive product updates and early access news from
                    Loom Care.
                  </span>
                </label>

                {/* Submit */}
                <button
                  id="wf-submit-btn"
                  className="auth-submit-btn"
                  type="submit"
                  disabled={pageState === 'submitting' || !fullName.trim()}
                >
                  {pageState === 'submitting' ? (
                    <LoaderCircle size={16} className="auth-spinner" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  {pageState === 'submitting' ? 'Saving your spot…' : 'Join the waitlist →'}
                </button>

                <p className="auth-note">
                  By joining, you consent to us storing your details to reserve your
                  waitlist spot. See our{' '}
                  <a href="/privacy/" target="_blank" rel="noreferrer">
                    Privacy Policy
                  </a>
                  . You can withdraw consent at any time by emailing{' '}
                  <a href="mailto:loomcaree@gmail.com">loomcaree@gmail.com</a>.
                </p>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
