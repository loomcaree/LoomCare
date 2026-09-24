import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged, signInWithPopup, type User } from 'firebase/auth';
import {
  authErrorMessage,
  getAdditionalUserInfo,
  getLoomAuth,
  googleProvider,
  linkPasswordToGoogle,
  markSignedIn,
  sendWaitlistPasswordReset,
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/firebase-auth';
import { createUserDoc, getWaitlistDoc } from '@/lib/firestore';
import { Eye, EyeOff, LoaderCircle, LogIn, ShieldCheck, UserPlus } from 'lucide-react';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function LoomLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="var(--blue)" opacity="0.1" />
      <circle cx="16" cy="16" r="9" fill="var(--blue)" opacity="0.25" />
      <circle cx="16" cy="16" r="4.5" fill="var(--blue)" />
    </svg>
  );
}

type Tab = 'signup' | 'signin';
type Step = 'main' | 'google-set-password';
type PageState = 'loading' | 'ready' | 'redirecting';

async function resolveRedirect(uid: string) {
  try {
    const w = await getWaitlistDoc(uid);
    return w ? '/dashboard/' : '/waitlist-form/';
  } catch {
    return '/waitlist-form/';
  }
}

export function AuthPage() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [tab, setTab] = useState<Tab>('signup');
  const [step, setStep] = useState<Step>('main');

  // Pending Google user (waiting for password set)
  const [pendingGUser, setPendingGUser] = useState<User | null>(null);

  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  // Check existing session on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(getLoomAuth(), async (user) => {
      if (user) {
        const dest = await resolveRedirect(user.uid);
        window.location.replace(dest);
      } else {
        setPageState('ready');
      }
    });
    return unsub;
  }, []);

  function changeTab(t: Tab) {
    setTab(t);
    setError('');
    setResetSent(false);
    setPassword('');
  }

  // ─── Email sign-up ────────────────────────────────────────────────────────
  async function handleEmailSignUp(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signUpWithEmail(name, email, password);
      await createUserDoc(user.uid, user.email!, 'email', name.trim());
      markSignedIn(user.email);
      window.location.href = '/waitlist-form/';
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ─── Email sign-in ────────────────────────────────────────────────────────
  async function handleEmailSignIn(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      markSignedIn(user.email);
      const dest = await resolveRedirect(user.uid);
      window.location.href = dest;
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ─── Google auth ──────────────────────────────────────────────────────────
  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(getLoomAuth(), googleProvider());
      const user = result.user;
      const info = getAdditionalUserInfo(result);
      markSignedIn(user.email);

      if (info?.isNewUser) {
        // New user — must set a password before proceeding
        setPendingGUser(user);
        setPassword('');
        setShowPwd(false);
        setStep('google-set-password');
        setLoading(false);
      } else {
        // Returning user — check waitlist status
        const dest = await resolveRedirect(user.uid);
        window.location.href = dest;
      }
    } catch (err) {
      setError(authErrorMessage(err));
      setLoading(false);
    }
  }

  // ─── Set password (Google new user) ──────────────────────────────────────
  async function handleSetGooglePassword(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!pendingGUser) return;
    setError('');
    setLoading(true);
    try {
      await linkPasswordToGoogle(pendingGUser, password);
      await createUserDoc(
        pendingGUser.uid,
        pendingGUser.email!,
        'google+email',
        pendingGUser.displayName ?? '',
      );
      window.location.href = '/waitlist-form/';
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ─── Password reset ───────────────────────────────────────────────────────
  async function handleReset() {
    if (!email.trim()) {
      setError('Enter your email address above, then click "Forgot password?".');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendWaitlistPasswordReset(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ─── Loading / redirecting ────────────────────────────────────────────────
  if (pageState !== 'ready') {
    return (
      <div className="standalone-auth-page">
        <div className="auth-loading">
          <LoaderCircle size={24} className="auth-spinner" aria-label="Loading…" />
        </div>
      </div>
    );
  }

  // ─── Google "Set password" step ───────────────────────────────────────────
  if (step === 'google-set-password' && pendingGUser) {
    return (
      <div className="standalone-auth-page">
        <a href="/" className="auth-logo-link" aria-label="Loom Care home">
          <LoomLogo />
          <span>Loom Care</span>
        </a>

        <div className="standalone-auth-card">
          <div className="auth-gate">
            <div className="auth-gate-icon">
              <ShieldCheck size={22} />
            </div>
            <h2>Set your password</h2>
            <p>
              One more step. Add a password to{' '}
              <strong>{pendingGUser.email}</strong> so you can also sign in with
              email when you need to.
            </p>

            {error && <p className="auth-error-msg">{error}</p>}

            <form className="auth-email-form" onSubmit={handleSetGooglePassword}>
              <div className="auth-input-group">
                <label htmlFor="gset-pwd">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="gset-pwd"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    autoFocus
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id="gset-submit-btn"
                className="auth-submit-btn"
                type="submit"
                disabled={loading || password.length < 6}
              >
                {loading ? (
                  <LoaderCircle size={16} className="auth-spinner" />
                ) : (
                  <ShieldCheck size={16} />
                )}
                {loading ? 'Setting up…' : 'Complete sign-up →'}
              </button>
            </form>

            <p className="auth-jwt-meta">
              <ShieldCheck size={12} />
              Your password is hashed and stored securely by Firebase
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main auth page ───────────────────────────────────────────────────────
  return (
    <div className="standalone-auth-page">
      <a href="/" className="auth-logo-link" aria-label="Loom Care home">
        <LoomLogo />
        <span>Loom Care</span>
      </a>

      <div className="standalone-auth-card">
        <div className="auth-gate">
          <div className="auth-gate-icon">
            {tab === 'signup' ? <UserPlus size={22} /> : <LogIn size={22} />}
          </div>
          <h2>{tab === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
          <p>
            {tab === 'signup'
              ? 'Join the Loom Care waitlist. Reserved for family caregivers.'
              : 'Sign in to access your waitlist spot.'}
          </p>

          {/* Segmented tabs */}
          <div className="auth-tab-bar" role="tablist">
            <button
              id="tab-signup"
              className={`auth-tab-btn${tab === 'signup' ? ' active' : ''}`}
              role="tab"
              aria-selected={tab === 'signup'}
              onClick={() => changeTab('signup')}
            >
              Sign Up
            </button>
            <button
              id="tab-signin"
              className={`auth-tab-btn${tab === 'signin' ? ' active' : ''}`}
              role="tab"
              aria-selected={tab === 'signin'}
              onClick={() => changeTab('signin')}
            >
              Sign In
            </button>
          </div>

          {/* Error message */}
          {error && <p className="auth-error-msg">{error}</p>}

          {/* Password reset confirmation */}
          {resetSent && (
            <div className="auth-redirect-banner">
              <ShieldCheck size={16} />
              <div>
                <strong>Reset email sent</strong>
                <p>Check your inbox and follow the link to reset your password.</p>
              </div>
            </div>
          )}

          {/* Google button */}
          <button
            id="auth-google-btn"
            className="auth-google-btn"
            type="button"
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle size={16} className="auth-spinner" />
            ) : (
              <GoogleLogo />
            )}
            {tab === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
          </button>

          <div className="auth-divider" role="separator">
            or
          </div>

          {/* Email form — animated tab switch */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.form
              key={tab}
              className="auth-email-form"
              onSubmit={tab === 'signup' ? handleEmailSignUp : handleEmailSignIn}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {tab === 'signup' && (
                <div className="auth-input-group">
                  <label htmlFor="auth-name">Full name</label>
                  <div className="auth-input-wrap">
                    <input
                      id="auth-name"
                      ref={nameRef}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-input-group">
                <label htmlFor="auth-email">Email address</label>
                <div className="auth-input-wrap">
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="auth-password">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="auth-password"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === 'signup' ? 'Min. 6 characters' : 'Your password'}
                    required
                    minLength={tab === 'signup' ? 6 : 1}
                    autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {tab === 'signin' && !resetSent && (
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              )}

              <button
                id="auth-submit-btn"
                className="auth-submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <LoaderCircle size={16} className="auth-spinner" />
                ) : tab === 'signup' ? (
                  <UserPlus size={16} />
                ) : (
                  <LogIn size={16} />
                )}
                {loading
                  ? 'Please wait…'
                  : tab === 'signup'
                    ? 'Create account'
                    : 'Sign in'}
              </button>
            </motion.form>
          </AnimatePresence>

          <p className="auth-jwt-meta">
            <ShieldCheck size={12} />
            Secured by Firebase · No card required
          </p>
        </div>
      </div>

      <p className="auth-legal-note">
        By continuing, you agree to our{' '}
        <a href="/privacy/">Privacy Policy</a> and{' '}
        <a href="/terms/">Terms of Service</a>.
      </p>
    </div>
  );
}
