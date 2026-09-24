import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { CalendarDays, CheckCircle2, LogOut, Sparkles } from 'lucide-react';
import { getLoomAuth, loomSignOut, markSignedIn } from '@/lib/firebase-auth';
import { getWaitlistDoc, type WaitlistDoc } from '@/lib/firestore';

export const TARGET_LAUNCH_TIMESTAMP = new Date('2026-11-14T12:00:00Z').getTime();

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, TARGET_LAUNCH_TIMESTAMP - now);
  const total = Math.floor(remaining / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    remaining,
  };
}

function CountdownTimer() {
  const { days, hours, minutes, seconds } = useCountdown();
  return (
    <div className="clean-countdown" aria-live="polite" aria-label="Countdown to launch">
      <div className="countdown-date-badge">
        <CalendarDays size={14} aria-hidden="true" />
        <span>Official Reveal · November 14, 2026</span>
      </div>
      <div className="countdown-cards-row">
        {[
          { val: days, lbl: 'Days' },
          { val: hours, lbl: 'Hours' },
          { val: minutes, lbl: 'Minutes' },
          { val: seconds, lbl: 'Seconds' },
        ].map((item, i) => (
          <div key={item.lbl} style={{ display: 'contents' }}>
            {i > 0 && (
              <span className="time-colon" aria-hidden="true">
                :
              </span>
            )}
            <div className="time-card">
              <span className="time-val">{String(item.val).padStart(2, '0')}</span>
              <span className="time-lbl">{item.lbl}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type PageState = 'loading' | 'ready';

export function DashboardPage() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistDoc | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const unsub = onAuthStateChanged(getLoomAuth(), async (user) => {
      if (!user) {
        window.location.replace('/join/');
        return;
      }
      setCurrentUser(user);
      markSignedIn(user.email);

      try {
        const doc = await getWaitlistDoc(user.uid);
        if (!doc) {
          // Not yet submitted — send back to the form
          window.location.replace('/waitlist-form/');
          return;
        }
        setWaitlist(doc);
      } catch {
        // Firestore error — still show dashboard (best effort)
      }

      setPageState('ready');
    });
    return unsub;
  }, []);

  async function handleLogOut() {
    setSigningOut(true);
    try {
      await loomSignOut();
      window.location.href = '/join/';
    } catch {
      setSigningOut(false);
    }
  }

  const displayName =
    waitlist?.fullName ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'there';

  const firstName = displayName.split(' ')[0];

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <div className="countdown-screen">
        <div className="auth-loading" style={{ minHeight: '100svh' }}>
          <div className="auth-spinner-ring" aria-label="Loading dashboard…" />
        </div>
      </div>
    );
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────
  return (
    <div className="countdown-screen">
      {/* Decorative orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      {/* Log out button */}
      <div className="dashboard-topbar">
        <button
          id="dashboard-logout-btn"
          className="dashboard-logout-btn"
          onClick={handleLogOut}
          disabled={signingOut}
          aria-label="Log out"
        >
          <LogOut size={15} />
          {signingOut ? 'Signing out…' : 'Log out'}
        </button>
      </div>

      <AnimatePresence>
        <motion.div
          className="success-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.div
            className="success-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.5,
              delay: 0.1,
              type: 'spring',
              stiffness: 240,
              damping: 18,
            }}
          >
            <CheckCircle2 aria-hidden="true" />
            <div className="badge-pulse" aria-hidden="true" />
          </motion.div>

          {/* Kicker */}
          <motion.p
            className="success-kicker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.2 }}
          >
            <Sparkles size={14} aria-hidden="true" />
            Your waitlist spot is confirmed
          </motion.p>

          {/* Headline */}
          <motion.h1
            className="success-headline"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.3 }}
          >
            <em>{firstName}, until the reveal.</em>
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="success-sub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.4 }}
          >
            Your spot is registered under{' '}
            <strong>{currentUser?.email}</strong>. We will reach out before
            public orders open.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.5 }}
          >
            <CountdownTimer />
          </motion.div>

          {/* Waitlist details summary */}
          {waitlist && (
            <motion.div
              className="dashboard-detail-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.65 }}
            >
              <p className="dashboard-detail-label">Your registration</p>
              <dl className="dashboard-detail-list">
                <div>
                  <dt>Name</dt>
                  <dd>{waitlist.fullName}</dd>
                </div>
                {waitlist.city && (
                  <div>
                    <dt>City</dt>
                    <dd>{waitlist.city}</dd>
                  </div>
                )}
                {waitlist.phone && (
                  <div>
                    <dt>Phone</dt>
                    <dd>{waitlist.phone}</dd>
                  </div>
                )}
              </dl>
              <p className="dashboard-update-note">
                Need to update your details?{' '}
                <a href="mailto:loomcaree@gmail.com">Email us</a>.
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
