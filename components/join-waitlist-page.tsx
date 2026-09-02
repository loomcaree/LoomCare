'use client';

import { useEffect, useState, type SyntheticEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, LogOut, Sparkles, Share2, User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LoomLogo, LoomMark } from '@/components/loom-logo';

const ease = [0.22, 1, 0.36, 1] as const;

// 60-day target calculation
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export function JoinWaitlistPage() {
  const { user, signInWithGoogle, logOut, authError, clearError } = useAuth();
  const [role, setRole] = useState('Adult Child / Caregiver');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  // 60-Day Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 59,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  // Initialize countdown timestamp when entering success screen
  useEffect(() => {
    if (status === 'success') {
      const target = Date.now() + SIXTY_DAYS_MS;

      const updateTimer = () => {
        const diff = Math.max(0, target - Date.now());
        const totalSec = Math.floor(diff / 1000);
        const days = Math.floor(totalSec / (3600 * 24));
        const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;
        setTimeLeft({ days, hours, minutes, seconds });
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  async function handleGoogleSignIn() {
    setAuthLoading(true);
    clearError();
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser) {
        if (signedInUser.displayName) setName(signedInUser.displayName);
        if (signedInUser.email) setEmail(signedInUser.email);
      }
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const submittedName = (formData.get('name') as string) || name;
    const submittedEmail = (formData.get('email') as string) || email;
    const submittedCity = (formData.get('city') as string) || city;
    const submittedPhone = (formData.get('phone') as string) || phone;
    const isBetaTester = formData.get('isBetaTester') === 'on';

    setRegisteredName(submittedName);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest',
          name: submittedName,
          email: submittedEmail,
          role,
          city: submittedCity,
          phone: submittedPhone,
          isBetaTester,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Loom Care — Let them live freely',
        text: 'A simple pendant that notices falls, remembers medicines, and brings family closer—quietly.',
        url: window.location.origin,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.origin).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {});
    }
  }

  return (
    <main className="join-page-shell">
      {/* Header */}
      <header className="join-topbar">
        <Link href="/" className="brand" aria-label="Loom Care home">
          <LoomLogo size={24} color="#2d5cf3" />
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 py-1.5 px-3 rounded-full">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <UserIcon className="size-3.5 text-slate-500" />
              )}
              <span>{user.displayName || user.email}</span>
              <button
                onClick={() => logOut()}
                className="text-slate-400 hover:text-red-500 ml-1 transition"
                title="Sign out"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          )}
          <Link href="/" className="join-back-link">
            <ArrowLeft className="size-4" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="join-content-wrap">
        <AnimatePresence mode="wait">
          {status !== 'success' ? (
            <motion.div
              key="form-card"
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.96 }}
              transition={{ duration: 0.6, ease }}
              className="join-card"
            >
              <span className="join-badge">
                <Sparkles className="size-3.5" /> Early Access Circle
              </span>

              {!user ? (
                /* MANDATORY STEP 1: Google Authentication Only (No manual bypass) */
                <div className="mt-4 text-center">
                  <h1>
                    Step into peace of mind.<br />
                    <em>Together.</em>
                  </h1>
                  <p className="mt-3 text-slate-600 text-base leading-relaxed max-w-md mx-auto">
                    Please authenticate with your Google account to unlock registration and secure your family’s priority early access pendant.
                  </p>

                  {authError && (
                    <div className="mt-4 mb-2 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                      {authError}
                    </div>
                  )}

                  <div className="mt-7 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={authLoading}
                      className="w-full max-w-md h-14 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border-2 border-slate-200 hover:border-blue-500 shadow-md flex items-center justify-center gap-3 transition"
                    >
                      <svg className="size-5" viewBox="0 0 24 24">
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
                      {authLoading ? 'Connecting Google Account…' : 'Continue with Google'}
                    </button>
                    <span className="text-[11.5px] text-slate-400 mt-1">
                      Protected by Google OAuth · Verified family security
                    </span>
                  </div>
                </div>
              ) : (
                /* STEP 2: Registration Details (Authenticated) */
                <div>
                  <h1>
                    Complete your registration.<br />
                    <em>{user?.displayName ? `Welcome, ${user.displayName}` : 'Welcome.'}</em>
                  </h1>
                  <p className="mt-2 mb-6 text-slate-600 text-sm">
                    Tell us about your family care needs so we can customize your early pendant setup.
                  </p>

                  {/* Authenticated user pill */}
                  <div className="mb-6 p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          width={34}
                          height={34}
                          className="rounded-full border border-blue-300"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          {user.displayName?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <b className="text-xs font-bold text-blue-900 block leading-tight">
                          {user.displayName || 'Google Account'}
                        </b>
                        <small className="text-[11px] text-blue-600">{user.email}</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => logOut()}
                      className="text-xs font-semibold text-blue-600 hover:text-red-500 transition"
                    >
                      Switch account
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="join-form">
                    {/* Name and Email */}
                    <div className="join-form-row">
                      <div>
                        <label htmlFor="join-name">Full Name *</label>
                        <input
                          id="join-name"
                          name="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label htmlFor="join-email">Email Address *</label>
                        <input
                          id="join-email"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* City and Phone */}
                    <div className="join-form-row">
                      <div>
                        <label htmlFor="join-city">City / Region</label>
                        <input
                          id="join-city"
                          name="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Bengaluru, Mumbai, Delhi..."
                        />
                      </div>
                      <div>
                        <label htmlFor="join-phone">Mobile Number (Optional)</label>
                        <input
                          id="join-phone"
                          name="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    {/* Role Selector */}
                    <span className="block mt-4 mb-2 text-[11.5px] font-bold uppercase tracking-wider text-slate-600">
                      Who are you requesting this for?
                    </span>
                    <div className="role-options">
                      {[
                        { id: 'role-caregiver', title: 'Adult Child / Caregiver', desc: 'Looking after aging parents' },
                        { id: 'role-parent', title: 'Elderly Parent', desc: 'Living freely & independently' },
                        { id: 'role-doctor', title: 'Healthcare Professional', desc: 'Doctor, clinic or eldercare specialist' },
                        { id: 'role-family', title: 'Family Member', desc: 'Sibling, grandchild or relative' },
                      ].map((item) => (
                        <label
                          key={item.title}
                          htmlFor={item.id}
                          aria-label={`${item.title} — ${item.desc}`}
                          className={`role-card-opt ${role === item.title ? 'active' : ''}`}
                        >
                          <input
                            id={item.id}
                            type="radio"
                            name="role"
                            value={item.title}
                            checked={role === item.title}
                            onChange={() => setRole(item.title)}
                          />
                          <div>
                            <b>{item.title}</b>
                            <small>{item.desc}</small>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Beta Tester Checkbox */}
                    <label htmlFor="beta-tester-check" className="beta-checkbox-row">
                      <input id="beta-tester-check" name="isBetaTester" type="checkbox" defaultChecked />
                      <span>I’d like to test an early prototype pendant with my family.</span>
                    </label>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="join-submit-btn"
                    >
                      <LoomMark size={14} color="#ffffff" className="opacity-95" />
                      <span>{status === 'loading' ? 'Securing your spot…' : 'Join Circle'}</span>
                      <ArrowRight className="size-4" />
                    </button>

                    {status === 'error' && (
                      <p className="text-red-500 text-xs font-semibold text-center mt-3">
                        Something went wrong. Please check your connection and try again.
                      </p>
                    )}
                  </form>
                </div>
              )}
            </motion.div>
          ) : (
            /* STEP 3: 60-Day Countdown Timer + Ticking Pendant Clock + Lifting Calendar */
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              className="join-card success-screen"
            >
              <span className="join-badge">
                <Check className="size-3.5" /> Spot Reserved · Batch 01 Early Access
              </span>

              <h2>
                You have entered the<br />
                <em>Loom safety circle.</em>
              </h2>

              {/* Visual Centerpieces: Ticking Pendant Clock & Lifting Calendar */}
              <div className="countdown-visual-row">
                {/* Ticking Pendant Clock */}
                <div className="pendant-clock" aria-label="Ticking Loom Pendant Clock">
                  <div className="pendant-clock-loop" />
                  <div className="pendant-clock-body">
                    <div className="clock-dial">
                      {/* Seconds Needle that ticks in sync with real time */}
                      <div
                        className="clock-needle-sec"
                        style={{
                          transform: `translateX(-50%) rotate(${timeLeft.seconds * 6}deg)`,
                        }}
                      />
                      <div className="clock-center-dot" />
                      <LoomMark size={16} color="#2d5cf3" className="opacity-80" />
                    </div>
                    <div className="pendant-clock-pulse" />
                  </div>
                </div>

                {/* Lifting Calendar Sheet */}
                <div className="calendar-lift-wrap" aria-label="Batch 01 Dispatch Milestone Calendar">
                  <div className="calendar-binder">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="calendar-sheet">
                    <small>BATCH 01</small>
                    <b>60</b>
                    <span>DAYS TO DISPATCH</span>
                  </div>
                </div>
              </div>

              {/* 4-Unit Frosted Glass Countdown Timer Grid */}
              <div className="timer-grid" role="timer" aria-live="polite">
                <div className="timer-card">
                  <span className="timer-num">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="timer-unit">Days</span>
                </div>
                <div className="timer-card">
                  <span className="timer-num">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="timer-unit">Hours</span>
                </div>
                <div className="timer-card">
                  <span className="timer-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="timer-unit">Minutes</span>
                </div>
                <div className="timer-card">
                  <span className="timer-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="timer-unit">Seconds</span>
                </div>
              </div>

              {/* Comfort & Reassurance Letter */}
              <div className="success-comfort-note">
                <b>A gentle promise kept, {registeredName || user?.displayName || 'friend'}.</b>
                Your place in Batch 01 is officially confirmed. Our team of biomedical engineers, doctors, and eldercare specialists is crafting each pendant with quiet devotion. No confusing touchscreens, no passwords to remember—just an invisible, watchful safety net for the ones you love.
                <br /><br />
                We will send milestone updates to <b>{user?.email || email}</b> as each stage of production and dispatch approaches.
              </div>

              {/* Actions */}
              <div className="success-actions">
                <Link href="/" className="success-home-btn">
                  <ArrowLeft className="size-4" /> Back to Home
                </Link>
                <button onClick={handleShare} className="success-share-btn">
                  <Share2 className="size-4" /> {copied ? 'Link Copied!' : 'Share with Family'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-brand">
          <LoomLogo size={24} color="#111827" />
          <p>Because independence and safety<br />should never be opposites.</p>
          <div className="footer-social-row">
            <a
              href="https://youtube.com/@loom_care?si=25QaRczVgHuFO8MV"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn youtube"
              aria-label="Loom Care on YouTube"
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a
              href="https://x.com/Loom_Care"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn x"
              aria-label="Loom Care on X (Twitter)"
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a
              href="https://www.instagram.com/loom_care?igsi=MXQwNjZsYjY4aGFleg=="
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn instagram"
              aria-label="Loom Care on Instagram"
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-links">
          <div>
            <b>Explore</b>
            <Link href="/#story">How it cares</Link>
            <Link href="/#details">The pendant</Link>
            <Link href="/#roadmap">Our future</Link>
          </div>
          <div>
            <b>Legal</b>
            <Link href="/">Privacy</Link>
            <Link href="/">Terms</Link>
            <a href="mailto:hello@loom.care">Contact</a>
          </div>
        </div>
        <span className="footer-note">Made with care in India · © 2026</span>
      </footer>
    </main>
  );
}
