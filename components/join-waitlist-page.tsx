import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
  LogIn,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/site-shell';
import { getWaitlistEndpoint, submitWaitlist } from '@/lib/waitlist';
import {
  authErrorMessage,
  getAdditionalUserInfo,
  getLoomAuth,
  getPreviousEmail,
  googleProvider,
  isPreviouslySignedIn,
  markSignedIn,
  markSignedOut,
  sendWaitlistPasswordReset,
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/firebase-auth';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';

const endpoint = getWaitlistEndpoint(import.meta.env.VITE_WAITLIST_ENDPOINT);

export const TARGET_LAUNCH_TIMESTAMP = new Date('2026-11-14T12:00:00Z').getTime();

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, TARGET_LAUNCH_TIMESTAMP - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, remaining };
}

function CountdownTimer() {
  const { days, hours, minutes, seconds } = useCountdown();

  return (
    <div className="clean-countdown" aria-live="polite" aria-label="Countdown to launch">
      <div className="countdown-date-badge">
        <CalendarDays size={15} aria-hidden="true" />
        <span>Official Reveal • November 14, 2026</span>
      </div>

      <div className="countdown-cards-row">
        <div className="time-card">
          <span className="time-val">{String(days).padStart(2, '0')}</span>
          <span className="time-lbl">Days</span>
        </div>
        <span className="time-colon" aria-hidden="true">:</span>
        <div className="time-card">
          <span className="time-val">{String(hours).padStart(2, '0')}</span>
          <span className="time-lbl">Hours</span>
        </div>
        <span className="time-colon" aria-hidden="true">:</span>
        <div className="time-card">
          <span className="time-val">{String(minutes).padStart(2, '0')}</span>
          <span className="time-lbl">Minutes</span>
        </div>
        <span className="time-colon" aria-hidden="true">:</span>
        <div className="time-card">
          <span className="time-val">{String(seconds).padStart(2, '0')}</span>
          <span className="time-lbl">Seconds</span>
        </div>
      </div>
    </div>
  );
}

const teasers = [
  {
    title: 'Discreet Form',
    text: 'A pendant so gentle it wears like subtle jewelry, never medical equipment.',
  },
  {
    title: 'Invisible Safeguard',
    text: 'Zero cameras, zero intrusive audio. Pure passive peace of mind for the whole family.',
  },
  {
    title: 'Warm Connection',
    text: 'Immediate gentle alerts that connect loved ones without causing alarm.',
  },
];

function SuccessScreen({
  name,
  email,
  isReturning,
  onEdit,
}: {
  name: string;
  email?: string;
  isReturning?: boolean;
  onEdit?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const { days } = useCountdown();

  return (
    <div className="countdown-screen">
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <motion.div
        className="success-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
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

        <motion.p
          className="success-kicker"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.2 }}
        >
          <Sparkles size={14} aria-hidden="true" />
          {isReturning ? 'Welcome back — your waitlist spot is saved' : 'You are on the priority list'}
        </motion.p>

        <motion.h1
          className="success-headline"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.3 }}
        >
          {days === 1 ? '1 day left' : `${days} days left`}
          <br />
          <em>{name ? `${name.split(' ')[0]}, until the reveal.` : 'until the reveal.'}</em>
        </motion.h1>

        <motion.p
          className="success-sub"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.4 }}
        >
          {email ? (
            <>
              Your spot is registered under <strong>{email}</strong>. We will reach out
              before public orders open.
            </>
          ) : (
            'We will reach out before anyone else. Until then — the countdown is live.'
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.5 }}
        >
          <CountdownTimer />
        </motion.div>

        <motion.div
          className="teaser-grid"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.65 }}
        >
          <p className="teaser-heading">
            <span>A quiet glimpse of what we are creating…</span>
          </p>
          <div className="teaser-cards">
            {teasers.map((t, i) => (
              <div key={i} className="teaser-card">
                <span className="teaser-tag">{t.title}</span>
                <p className="teaser-blurred">{t.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="success-footer-actions">
          {onEdit && (
            <button
              type="button"
              className="text-link edit-waitlist-btn"
              onClick={onEdit}
            >
              Update your details
            </button>
          )}
          <a href="/" className="text-link success-home-link">
            Back to home <ArrowRight aria-hidden="true" size={16} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}

type AuthView = 'signin' | 'signup' | 'reset';

function initialAuthView(): AuthView {
  if (typeof window === 'undefined') return 'signin';
  const mode = new URLSearchParams(window.location.search).get('mode');
  if (mode === 'signup' && !isPreviouslySignedIn()) return 'signup';
  if (mode === 'reset') return 'reset';
  return 'signin';
}

function AuthGate({
  onAuth,
}: {
  onAuth: (user: User, isExistingUser?: boolean) => void;
}) {
  const [activeMode, setActiveMode] = useState<AuthView>(initialAuthView);
  const [email, setEmail] = useState(() => getPreviousEmail());
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [jwtBusy, setJwtBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');
  const [allowPasswordReset, setAllowPasswordReset] = useState(true);
  const reducedMotion = useReducedMotion();

  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const wasRedirected = searchParams?.get('redirected_from_signup') === 'true';
  const previousEmail = getPreviousEmail();

  const [redirectNotice, setRedirectNotice] = useState<string>(() => {
    if (wasRedirected || (searchParams?.get('mode') === 'signup' && isPreviouslySignedIn())) {
      return previousEmail
        ? `An account already exists for ${previousEmail}. Please enter your password to sign in.`
        : 'An account already exists for this email. Please enter your password to sign in.';
    }
    return '';
  });

  function setAuthView(mode: AuthView) {
    setError('');
    setResetSent(false);
    if (mode === 'signup' && isPreviouslySignedIn()) {
      const pEmail = getPreviousEmail();
      setRedirectNotice(
        pEmail
          ? `An account already exists for ${pEmail}. Please enter your password to sign in.`
          : 'An account already exists for this email. Please enter your password to sign in.',
      );
      setAllowPasswordReset(true);
      setActiveMode('signin');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', 'signin');
        url.searchParams.set('redirected_from_signup', 'true');
        window.history.replaceState({}, '', url.toString());
      }
      return;
    }
    if (mode !== 'signin' && mode !== 'reset') setRedirectNotice('');
    setActiveMode(mode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', mode);
      url.searchParams.delete('redirected_from_signup');
      window.history.replaceState({}, '', url.toString());
    }
  }

  function moveToSignIn(notice: string, canReset: boolean) {
    setRedirectNotice(notice);
    setAllowPasswordReset(canReset);
    setPassword('');
    setActiveMode('signin');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'signin');
      url.searchParams.set('redirected_from_signup', 'true');
      window.history.replaceState({}, '', url.toString());
    }
  }

  async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (activeMode === 'signup') {
      setJwtBusy(true);
      try {
        const user = await signUpWithEmail(name, email, password);
        onAuth(user, false);
      } catch (err: unknown) {
        const errWithCode = err as { code?: string };
        if (errWithCode.code === 'auth/google-account-exists') {
          moveToSignIn(
            'This email is registered with Google. Click "Continue with Google" above to sign in.',
            false,
          );
        } else if (errWithCode.code === 'auth/email-already-in-use') {
          moveToSignIn(
            `An account already exists for ${email}. Please enter your password to sign in, or reset your password below.`,
            true,
          );
        } else {
          setError(authErrorMessage(err));
        }
      } finally {
        setJwtBusy(false);
      }
      return;
    }

    setJwtBusy(true);
    try {
      const user = await signInWithEmail(email, password);
      // User signing in with email/password is an existing user
      onAuth(user, true);
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setJwtBusy(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    setJwtBusy(true);
    try {
      await sendWaitlistPasswordReset(email);
      setResetSent(true);
    } catch (err: unknown) {
      const errWithCode = err as { code?: string };
      if (errWithCode.code === 'auth/google-account-exists') {
        moveToSignIn(
          'This email is registered with Google. Use Continue with Google instead of a password reset.',
          false,
        );
      } else {
        setError(authErrorMessage(err));
      }
    } finally {
      setJwtBusy(false);
    }
  }

  async function handleGoogleAuth() {
    setGoogleBusy(true);
    setError('');
    try {
      const auth = getLoomAuth();
      const provider = googleProvider();
      const result = await signInWithPopup(auth, provider);
      const additionalInfo = getAdditionalUserInfo(result);
      markSignedIn(result.user?.email);
      const isExistingUser = Boolean(
        (additionalInfo && !additionalInfo.isNewUser) ||
        isPreviouslySignedIn() ||
        (result.user?.email && localStorage.getItem(`loom_waitlist_${result.user.email.toLowerCase()}`))
      );
      onAuth(result.user, isExistingUser);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <motion.div
      className="auth-gate"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="auth-gate-icon">
        <Sparkles size={28} aria-hidden="true" />
      </div>

      <h2>Welcome to Loom Care</h2>
      <p>Continue with Google, or enter your email and password — just like Amazon or Flipkart.</p>

      {/* Google 1-Click Auth */}
      <button
        type="button"
        className="auth-google-btn"
        disabled={googleBusy || jwtBusy}
        onClick={handleGoogleAuth}
      >
        {googleBusy ? (
          <LoaderCircle className="submit-spinner" size={18} />
        ) : (
          <span className="dropdown-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </span>
        )}
        <span>Continue with Google</span>
      </button>

      <div className="auth-divider" aria-hidden="true">
        <span>or with email and password</span>
      </div>

      {/* Segmented Tabs like Amazon / Flipkart */}
      <div className="auth-tab-bar" role="tablist" aria-label="Sign in or Create Account">
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'signin'}
          className={`auth-tab-btn ${activeMode === 'signin' ? 'active' : ''}`}
          onClick={() => setAuthView('signin')}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'signup'}
          className={`auth-tab-btn ${activeMode === 'signup' ? 'active' : ''}`}
          onClick={() => setAuthView('signup')}
        >
          Create Account
        </button>
      </div>

      {redirectNotice && (
        <div className="auth-redirect-banner" role="status">
          <Info size={16} aria-hidden="true" />
          <div>
            <strong>Account already exists</strong>
            <p>{redirectNotice}</p>
            {allowPasswordReset && (
              <button
                type="button"
                className="text-link"
                style={{ marginTop: 6, display: 'inline-block', fontSize: 13 }}
                onClick={() => setAuthView('reset')}
              >
                Forgot password? Reset password by email &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {activeMode === 'reset' && (
        <form onSubmit={handlePasswordReset} className="auth-email-form">
          <div className="auth-input-group">
            <label htmlFor="auth-reset-email">Email address *</label>
            <div className="auth-input-wrap">
              <input
                id="auth-reset-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
              />
            </div>
          </div>
          {resetSent && (
            <p className="auth-note" role="status">
              If an account with this email uses a password login, a reset link is on its way. Check your inbox.
            </p>
          )}
          <button type="submit" className="auth-submit-btn" disabled={jwtBusy || googleBusy}>
            {jwtBusy ? (
              <>
                <LoaderCircle className="submit-spinner" size={16} />
                Sending link…
              </>
            ) : (
              'Send reset link'
            )}
          </button>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              type="button"
              className="text-link"
              onClick={() => setAuthView('signin')}
            >
              &larr; Back to Sign In
            </button>
          </div>
        </form>
      )}

      {activeMode === 'signin' && (
        <form onSubmit={handleEmailAuth} className="auth-email-form">
          <div className="auth-input-group">
            <label htmlFor="auth-gate-email">Email address *</label>
            <div className="auth-input-wrap">
              <input
                id="auth-gate-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="auth-gate-password">Password *</label>
              {allowPasswordReset && (
                <button
                  type="button"
                  className="text-link"
                  style={{ fontSize: 12.5 }}
                  onClick={() => setAuthView('reset')}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="auth-input-wrap">
              <input
                id="auth-gate-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-toggle-pwd"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={jwtBusy || googleBusy}
          >
            {jwtBusy ? (
              <>
                <LoaderCircle className="submit-spinner" size={16} />
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign in
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--muted)' }}>
            New to Loom Care?{' '}
            <button
              type="button"
              className="text-link"
              style={{ fontWeight: 600 }}
              onClick={() => setAuthView('signup')}
            >
              Create your account &rarr;
            </button>
          </p>
        </form>
      )}

      {activeMode === 'signup' && (
        <form onSubmit={handleEmailAuth} className="auth-email-form">
          <div className="auth-input-group">
            <label htmlFor="auth-gate-name">Full name *</label>
            <div className="auth-input-wrap">
              <input
                id="auth-gate-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Maya Roy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="auth-gate-email">Email address *</label>
            <div className="auth-input-wrap">
              <input
                id="auth-gate-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="auth-gate-password">Password *</label>
            <div className="auth-input-wrap">
              <input
                id="auth-gate-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-toggle-pwd"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={jwtBusy || googleBusy}
          >
            {jwtBusy ? (
              <>
                <LoaderCircle className="submit-spinner" size={16} />
                Creating account…
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Create your account
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--muted)' }}>
            Already have an account?{' '}
            <button
              type="button"
              className="text-link"
              style={{ fontWeight: 600 }}
              onClick={() => setAuthView('signin')}
            >
              Sign in &rarr;
            </button>
          </p>
        </form>
      )}

      <div className="auth-jwt-meta">
        <ShieldCheck size={13} aria-hidden="true" />
        <span>Google or email and password · secured by Firebase Authentication</span>
      </div>
    </motion.div>
  );
}

export function JoinWaitlistPage() {
  const [user, setUser] = useState<User | null | 'loading'>(() =>
    typeof window === 'undefined' ? null : 'loading',
  );
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [successName, setSuccessName] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [welcomeNotice, setWelcomeNotice] = useState('');
  const [timeAlone, setTimeAlone] = useState('');

  const requestId = useRef('');
  const submitting = useRef(false);
  const confirmationRef = useRef<HTMLDivElement>(null);

  function applyStoredWaitlist(authedUser: User) {
    if (!authedUser.email) return false;
    try {
      const stored = localStorage.getItem(`loom_waitlist_${authedUser.email.toLowerCase()}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSuccessName(parsed.name || authedUser.displayName || authedUser.email.split('@')[0] || 'Friend');
        setIsReturningUser(true);
        setStatus('success');
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  function handleAuthSuccess(authedUser: User, isExistingUser?: boolean) {
    setUser(authedUser);
    markSignedIn(authedUser.email);
    if (applyStoredWaitlist(authedUser)) return;

    // If existing database user signs in, immediately show them the days left countdown
    if (isExistingUser) {
      setSuccessName(authedUser.displayName || authedUser.email?.split('@')[0] || 'Friend');
      setIsReturningUser(true);
      setStatus('success');
      return;
    }

    setWelcomeNotice(
      'Welcome to Loom Care. Please complete the quick waitlist form below to secure your priority spot.',
    );
  }

  useEffect(() => {
    const auth = getLoomAuth();
    return onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        markSignedIn(u.email);
        const hasStored = applyStoredWaitlist(u);
        if (!hasStored && isPreviouslySignedIn()) {
          setSuccessName(u.displayName || u.email?.split('@')[0] || 'Friend');
          setIsReturningUser(true);
          setStatus('success');
        }
      } else {
        setUser(null);
      }
    });
  }, []);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint || submitting.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const text = (key: string) => {
      const value = data.get(key);
      return typeof value === 'string' ? value : '';
    };

    const name = text('name').trim();
    const email = text('email').trim();
    const phone = text('phone').trim();
    const city = text('city').trim();
    const marketingConsent = data.get('marketingConsent') === 'yes';

    if (!name || !email || data.get('consent') !== 'yes') {
      setStatus('error');
      setMessage('Please enter your name and email, and tick the privacy consent box.');
      return;
    }

    requestId.current ||= crypto.randomUUID();
    submitting.current = true;
    setStatus('sending');
    setMessage('');

    try {
      const idToken =
        user && user !== 'loading' && typeof user.getIdToken === 'function'
          ? await user.getIdToken()
          : '';

      await submitWaitlist(endpoint, {
        name,
        email,
        phone,
        city,
        timeAlone,
        marketingConsent,
        website: text('website'),
        requestId: requestId.current,
        idToken,
      });

      try {
        localStorage.setItem(
          `loom_waitlist_${email.toLowerCase()}`,
          JSON.stringify({
            name,
            email,
            phone,
            city,
            timeAlone,
            marketingConsent,
            submittedAt: Date.now(),
          }),
        );
        localStorage.setItem('loom_waitlist_registered', email.toLowerCase());
      } catch {
        // ignore
      }

      form.reset();
      setSuccessName(name);
      setIsReturningUser(false);
      setStatus('success');
      requestAnimationFrame(() => confirmationRef.current?.focus());
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error && error.message === 'auth-required'
          ? 'Please sign in to confirm your spot on the waitlist.'
          : error instanceof Error && error.message === 'busy'
            ? 'The waitlist is busy right now. Please try again in a minute.'
            : "We couldn't confirm your signup. Please try again. Using the same email won't add you twice.",
      );
    } finally {
      submitting.current = false;
    }
  }

  if (status === 'success') {
    return (
      <div className="site-shell inner-site">
        <SiteHeader page="join" />
        <main id="main-content" tabIndex={-1}>
          <SuccessScreen
            name={successName}
            email={typeof user === 'object' && user ? user.email || undefined : undefined}
            isReturning={isReturningUser}
            onEdit={() => setStatus('idle')}
          />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const resolvedUser = user === 'loading' ? null : user;
  const authed = resolvedUser !== null;
  const prefillEmail = resolvedUser?.email ?? '';
  const prefillName = resolvedUser?.displayName ?? '';

  return (
    <div className="site-shell inner-site">
      <SiteHeader page="join" />
      <main id="main-content" className="waitlist-layout" tabIndex={-1}>
        <section className="waitlist-intro" aria-labelledby="waitlist-heading">
          <p className="section-kicker">The Loom Care waitlist</p>
          <h1 id="waitlist-heading">
            A little closer.
            <br />
            <em>A little calmer.</em>
          </h1>
          <p>Be the first to hear when Loom Care is ready for your family.</p>
          <span className="waitlist-small-note">
            Just thoughtful updates. No payment or commitment.
          </span>
        </section>

        <section className="waitlist-card" aria-label="Join the waitlist">
          <AnimatePresence mode="wait">
            {user === 'loading' ? (
              <motion.div
                key="loading"
                className="auth-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoaderCircle className="submit-spinner" size={28} />
              </motion.div>
            ) : !authed ? (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AuthGate onAuth={handleAuthSuccess} />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="waitlist-auth">
                  <p>
                    <UserCheck size={16} aria-hidden="true" /> Signed in as{' '}
                    <strong>{resolvedUser.email}</strong>
                  </p>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => {
                      markSignedOut();
                      void signOut(getLoomAuth());
                      setUser(null);
                      setWelcomeNotice('');
                    }}
                  >
                    Switch account
                  </button>
                </div>

                {welcomeNotice && (
                  <div className="auth-redirect-banner" style={{ marginBottom: 18 }}>
                    <Info size={16} aria-hidden="true" />
                    <div>
                      <strong>Account ready</strong>
                      <p>{welcomeNotice}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} aria-busy={status === 'sending'}>
                  <div className="form-header-row">
                    <h2>Join the waitlist</h2>
                    <button
                      type="button"
                      className="text-link already-registered-link"
                      onClick={() => setStatus('success')}
                      title="View launch countdown"
                    >
                      Already on the list? View countdown →
                    </button>
                  </div>

                  <p className="waitlist-form-intro">
                    We only ask for what we need to manage the waitlist and contact you about launch.
                  </p>

                  {!endpoint && (
                    <p className="waitlist-notice" role="status">
                      The waitlist is being connected. Signups will open soon.
                    </p>
                  )}

                  <fieldset disabled={!endpoint || status === 'sending'}>
                    <div className="form-field">
                      <label htmlFor="waitlist-name">Full name *</label>
                      <input
                        id="waitlist-name"
                        name="name"
                        autoComplete="name"
                        required
                        maxLength={80}
                        placeholder="e.g. Maya Roy"
                        defaultValue={prefillName}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="waitlist-email">Email address *</label>
                      <input
                        id="waitlist-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        placeholder="you@example.com"
                        defaultValue={prefillEmail}
                        readOnly={Boolean(prefillEmail)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="waitlist-phone">Phone number (optional)</label>
                      <input
                        id="waitlist-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        maxLength={20}
                        placeholder="Include country code if you like"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="waitlist-city">City (optional)</label>
                      <input
                        id="waitlist-city"
                        name="city"
                        autoComplete="address-level2"
                        maxLength={80}
                        placeholder="e.g. Bengaluru"
                      />
                    </div>

                    <fieldset className="form-field waitlist-survey">
                      <legend>Do your parents or grandparents spend significant time alone?</legend>
                      <label className="consent-field">
                        <input
                          type="radio"
                          name="timeAlone"
                          value="yes"
                          checked={timeAlone === 'yes'}
                          onChange={() => setTimeAlone('yes')}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="consent-field">
                        <input
                          type="radio"
                          name="timeAlone"
                          value="no"
                          checked={timeAlone === 'no'}
                          onChange={() => setTimeAlone('no')}
                        />
                        <span>No</span>
                      </label>
                    </fieldset>

                    <div className="form-trap" aria-hidden="true">
                      <label htmlFor="waitlist-website">Leave this empty</label>
                      <input
                        id="waitlist-website"
                        name="website"
                        autoComplete="off"
                        tabIndex={-1}
                      />
                    </div>

                    <label className="consent-field">
                      <input name="consent" type="checkbox" value="yes" required />
                      <span>
                        I agree to the{' '}
                        <a href="/privacy/">Privacy Policy</a> and consent to Loom Care
                        using my information to manage the waitlist and contact me
                        regarding early access and product launch updates.
                      </span>
                    </label>

                    <label className="consent-field" style={{ marginTop: 8 }}>
                      <input name="marketingConsent" type="checkbox" value="yes" />
                      <span>
                        Send me occasional news and product updates.
                      </span>
                    </label>

                    {status === 'error' && (
                      <p className="form-error" role="alert">
                        {message}
                      </p>
                    )}

                    <button className="pill-button waitlist-submit" type="submit">
                      {status === 'sending' ? (
                        <>
                          <LoaderCircle
                            className="submit-spinner"
                            aria-hidden="true"
                          />{' '}
                          Locking in your spot…
                        </>
                      ) : (
                        <>
                          Join the waitlist <ArrowRight aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </fieldset>

                  <p className="waitlist-form-note">
                    <ShieldCheck size={14} aria-hidden="true" /> We do not sell waitlist
                    information. You may withdraw your consent or request deletion of your
                    waitlist information at any time by emailing{' '}
                    <a href="mailto:loomcaree@gmail.com">loomcaree@gmail.com</a>. Read our{' '}
                    <a href="/privacy/">Privacy Policy</a>.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

