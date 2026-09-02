'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDown, ArrowRight, BellRing, ChevronLeft, ChevronRight,
  Heart, HeartPulse, LogOut, MapPin, MessageCircleHeart, Phone, Pill,
  Radio, ShieldCheck, User as UserIcon, Users, X,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LoomLogo, LoomMark } from '@/components/loom-logo';

const ease = [0.22, 1, 0.36, 1] as const;

function Pendant({ alert = false }: { alert?: boolean }) {
  return (
    <div className={`pendant-shell ${alert ? 'pendant-alert' : ''}`} aria-label="Loom Care pendant illustration">
      <span className="pendant-loop" />
      <div className="pendant-face">
        <LoomMark size={22} color={alert ? '#fff' : '#2d5cf3'} className="drop-shadow-sm" />
        <span className="pendant-light" />
      </div>
    </div>
  );
}

function StackingSection({
  id,
  zIndex,
  className = '',
  innerClassName = '',
  children,
  isLast = false,
  containerHeight = '130vh',
  shadow = true,
  dark = false,
  rounded = true,
}: {
  id?: string;
  zIndex: number;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
  isLast?: boolean;
  containerHeight?: string;
  shadow?: boolean;
  dark?: boolean;
  rounded?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.91]);
  const opacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0.75, isLast ? 1 : 0.15]);
  const y = useTransform(scrollYProgress, [0, 1], [0, isLast ? 0 : -35]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`stacking-layer ${className} ${shadow ? (dark ? 'stacking-card-shadow-dark' : 'stacking-card-shadow') : ''} ${rounded ? 'stacking-rounded' : ''}`}
      style={{
        zIndex,
        minHeight: isLast ? 'auto' : containerHeight,
      }}
    >
      <motion.div
        style={{
          scale,
          opacity,
          y,
          transformOrigin: 'top center',
        }}
        className={`stacking-sticky-frame ${innerClassName}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ChapterStack({
  id,
  index,
  eyebrow,
  title,
  copy,
  tone,
  zIndex,
  children,
}: {
  id?: string;
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
  tone: string;
  zIndex: number;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.91]);
  const opacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0.75, 0.15]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -35]);

  const visualY = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -40]);
  const visualRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-2, 0, 2]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.3], [0.85, 1]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`stacking-layer ${tone} stacking-card-shadow stacking-rounded`}
      style={{
        zIndex,
        minHeight: '135vh',
      }}
    >
      <motion.div
        style={{
          scale,
          opacity,
          y,
          transformOrigin: 'top center',
        }}
        className="stacking-sticky-frame"
      >
        <div className="story-sticky">
          <motion.div style={{ y: visualY, rotate: visualRotate }} className="story-visual">
            {children}
          </motion.div>
          <motion.div style={{ opacity: copyOpacity }} className="story-copy">
            <span className="chapter-number">{index}</span>
            <p>{eyebrow}</p>
            <h2>{title}</h2>
            <div className="story-rule" />
            <span className="story-description">{copy}</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

const ROADMAP_LABELS = ['Care', 'Voice', 'Connect', 'Insight'] as const;

export function LoomCareLanding() {
  const { user, signInWithGoogle, logOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState(0);
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const wheelCooldown = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const roadmapContainerRef = useRef<HTMLDivElement>(null);

  const moveRoadmap = useCallback((direction: -1 | 1) => {
    setActiveRoadmap((current) => Math.max(0, Math.min(ROADMAP_LABELS.length - 1, current + direction)));
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 35) {
      if (diffX > 35) {
        moveRoadmap(1);
      } else {
        moveRoadmap(-1);
      }
    }
    touchStartX.current = null;
  }

  useEffect(() => {
    const el = roadmapContainerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      // If horizontal trackpad swipe gesture is detected
      if (Math.abs(e.deltaX) > 10 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.4) {
        // PREVENT Chrome/Safari page back/forward history navigation!
        e.preventDefault();

        if (wheelCooldown.current) return;
        wheelCooldown.current = true;
        if (e.deltaX > 12) {
          moveRoadmap(1);
        } else if (e.deltaX < -12) {
          moveRoadmap(-1);
        }
        setTimeout(() => {
          wheelCooldown.current = false;
        }, 320);
      }
    };

    // Native listener with { passive: false } allows e.preventDefault() to block browser history navigation
    el.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onNativeWheel);
    };
  }, [moveRoadmap]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="site-shell">
      <motion.div className="scroll-progress" style={{ width: progress }} />

      <header className="topbar">
        <Link href="#top" className="brand" aria-label="Loom Care home">
          <LoomLogo size={23} color="#2d5cf3" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#story">How it cares</a>
          <a href="#details">The pendant</a>
          <a href="#roadmap">Our future</a>
        </nav>
        <div className="nav-actions">
          {user ? (
            <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-xs font-semibold text-slate-800">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  width={22}
                  height={22}
                  className="rounded-full"
                />
              ) : (
                <UserIcon className="size-3.5 text-slate-600" />
              )}
              <span className="hidden md:inline max-w-[120px] truncate">{user.displayName || user.email}</span>
              <button
                onClick={() => logOut()}
                className="text-slate-400 hover:text-red-500 ml-1 transition"
                title="Sign out"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              className="header-signin-btn"
              onClick={() => signInWithGoogle()}
            >
              Sign in
            </button>
          )}

          <Link href="/join" className="pill-button">
            <LoomMark size={13} color="#ffffff" className="opacity-95" />
            <span>Join Circle</span>
            <ArrowRight className="size-4" />
          </Link>

          <button
            className="menu-button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <span /><span />
          </button>
        </div>
      </header>

      {/* LAYER 1: Full-Opacity Background Hero with Centered White Title */}
      <StackingSection zIndex={10} rounded={false} shadow={false} containerHeight="130vh">
        <section id="top" className="hero-centered">
          <div className="hero-bg-layer">
            <Image
              src="/loom-family.png"
              alt="An Indian mother and daughter sharing a warm, loving moment at home"
              fill
              priority
              sizes="100vw"
              className="hero-bg-image"
            />
            <div className="hero-clean-overlay" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
            className="hero-centered-content"
          >
            <h1 className="hero-white-title">
              Let them live freely.<br />
              <em>We keep the watch.</em>
            </h1>
          </motion.div>
        </section>
      </StackingSection>

      {/* LAYER 2: Story Intro Bridge */}
      <StackingSection id="story" zIndex={15} containerHeight="115vh">
        <section className="story-intro">
          <p>A small object.<br />A very human promise.</p>
          <h2>Every ordinary day deserves<br /><em>a quiet safety net.</em></h2>
          <ArrowDown className="story-arrow" />
        </section>
      </StackingSection>

      {/* LAYER 3: Chapter 01 - Unbox */}
      <ChapterStack index="01" eyebrow="It arrives like a gift" title="Open the box. Keep the independence." copy="No intimidating kit. No instruction manual the size of a novel. One soft pendant, a charging nest, and a promise you can understand." tone="chapter-blue" zIndex={20}>
        <div className="unbox-scene">
          <div className="box-lid"><span>LOOM CARE</span></div>
          <div className="box-base"><div className="box-inset"><Pendant /></div></div>
          <div className="ribbon ribbon-a" />
          <div className="ribbon ribbon-b" />
        </div>
      </ChapterStack>

      {/* LAYER 4: Chapter 02 - Everyday Care */}
      <ChapterStack index="02" eyebrow="Most days, nothing happens" title="Care lives quietly in the background." copy="It nudges for medicine, stores reminders even when the internet disappears, and never asks your parent to learn another screen." tone="chapter-pink" zIndex={30}>
        <div className="day-scene">
          <div className="sun-disc" />
          <div className="day-card card-medicine">
            <span className="day-icon"><Pill className="size-5" /></span>
            <p>8:00 PM</p>
            <b>Time for the blue tablet</b>
            <small>Tap the pendant once</small>
          </div>
          <div className="day-card card-offline">
            <span className="status-dot" />
            <p>Quietly ready</p>
            <b>Works through internet drops</b>
            <small>500 reminders kept safely</small>
          </div>
          <div className="floating-pendant"><Pendant /></div>
        </div>
      </ChapterStack>

      {/* LAYER 5: Chapter 03 - Fall Detection */}
      <ChapterStack index="03" eyebrow="If a fall happens" title="It asks first. Then it acts." copy="A gentle vibration creates a 20-second grace window. If there’s no response, Loom Care starts the family’s safety chain—calmly, clearly, immediately." tone="chapter-coral" zIndex={40}>
        <div className="fall-scene">
          <div className="alert-rings"><span /><span /><span /></div>
          <Pendant alert />
          <div className="count-card">
            <small>Are you okay?</small>
            <strong>20</strong>
            <p>Press once to cancel</p>
          </div>
          <div className="signal-path">
            <span>Detected</span><ArrowRight /><span>Checked</span><ArrowRight /><span>Shared</span>
          </div>
        </div>
      </ChapterStack>

      {/* LAYER 6: Chapter 04 - Circle Relay */}
      <ChapterStack index="04" eyebrow="Your circle closes in" title="The right people know. In the right order." copy="Children, neighbours, and trusted caregivers receive a clear alert with time and location. Nobody has to guess who is helping." tone="chapter-lilac" zIndex={50}>
        <div className="circle-scene">
          <div className="phone-card">
            <div className="phone-top"><span className="live-dot" />Loom Care alert<small>now</small></div>
            <div className="parent-row">
              <span>AS</span>
              <div><b>Asha may need help</b><p>Fall detected at home</p></div>
            </div>
            <div className="map-card">
              <MapPin className="size-5" />
              <div><b>Home</b><p>Koramangala · 2 min away</p></div>
            </div>
            <button><Phone className="size-4" />Call Asha</button>
          </div>
          <div className="person-bubble person-one">P</div>
          <div className="person-bubble person-two">R</div>
          <div className="person-bubble person-three">N</div>
          <svg className="circle-lines" viewBox="0 0 500 500">
            <path d="M80 90 C200 200 160 250 250 280" />
            <path d="M440 100 C320 180 340 240 250 280" />
            <path d="M420 410 C340 350 330 310 250 280" />
          </svg>
        </div>
      </ChapterStack>

      {/* LAYER 7: Details Section */}
      <StackingSection id="details" zIndex={60} containerHeight="130vh">
        <section className="details-section">
          <div className="details-head">
            <p>Less technology to manage.<br />More life to live.</p>
            <h2>Thoughtful in the<br /><em>smallest details.</em></h2>
          </div>
          <div className="feature-grid">
            {[
              { icon: Radio, number: '01', title: 'One button. That’s it.', copy: 'SOS, acknowledge, or cancel. No menus. No passwords. No new habits.' },
              { icon: BellRing, number: '02', title: 'Reminders that feel kind.', copy: 'A chime and a gentle pulse—not another loud, anxious notification.' },
              { icon: ShieldCheck, number: '03', title: 'Offline means still on.', copy: 'Important events stay on the pendant until connection comes back.' },
              { icon: Users, number: '04', title: 'A circle, not a call centre.', copy: 'Help moves through family, neighbours, and trusted caregivers.' },
            ].map(({ icon: Icon, number, title, copy }) => (
              <motion.article key={number} whileHover={{ y: -8 }} className="feature-card">
                <div><span>{number}</span><Icon className="size-6" /></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>
      </StackingSection>

      {/* LAYER 8: The Care Roadmap */}
      <StackingSection id="roadmap" zIndex={70} dark containerHeight="135vh" className="roadmap-section">
        <div
          ref={roadmapContainerRef}
          className="w-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="roadmap-title">
            <p>One gentle step at a time</p>
            <h2>The care story<br /><em>keeps growing.</em></h2>
          </div>
          <div className="roadmap-swipe-head">
            <div className="roadmap-tabs" aria-label="Roadmap progress">
              {ROADMAP_LABELS.map((label, i) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setActiveRoadmap(i)}
                  className={`roadmap-step ${activeRoadmap === i ? 'active' : ''}`}
                  aria-current={activeRoadmap === i ? 'step' : undefined}
                >
                  <span>0{i + 1}</span>{label}
                </button>
              ))}
            </div>
            <div className="roadmap-controls">
              <button
                type="button"
                onClick={() => moveRoadmap(-1)}
                disabled={activeRoadmap === 0}
                aria-label="Previous roadmap version"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => moveRoadmap(1)}
                disabled={activeRoadmap === ROADMAP_LABELS.length - 1}
                aria-label="Next roadmap version"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
          <motion.div
            key={activeRoadmap}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              if (info.offset.x < -45 || info.velocity.x < -350) moveRoadmap(1);
              if (info.offset.x > 45 || info.velocity.x > 350) moveRoadmap(-1);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') moveRoadmap(-1);
              if (event.key === 'ArrowRight') moveRoadmap(1);
            }}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label={`${ROADMAP_LABELS[activeRoadmap]}, roadmap version ${activeRoadmap + 1} of ${ROADMAP_LABELS.length}. Swipe, scroll with trackpad, or use arrow keys.`}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease }}
            className="roadmap-panel"
          >
            <div>
              <small>{['HERE NOW', 'COMING NEXT', 'ON THE HORIZON', 'OUR BIG PICTURE'][activeRoadmap]}</small>
              <h3>{['Safety that asks nothing of them.', 'Reminders in the voices they love.', 'Freedom that travels beyond home.', 'Health patterns that finally make sense.'][activeRoadmap]}</h3>
              <p>{['Fall detection, physical SOS, offline medicine reminders, and the family phone relay.', 'Spoken medicine names and recorded messages from children and grandchildren.', 'A direct eSIM, location sharing, and two-way calls without a nearby phone.', 'Connected blood pressure, oxygen, and glucose signals understood over time.'][activeRoadmap]}</p>
            </div>
            <div className={`roadmap-object object-${activeRoadmap}`}>
              <span className="roadmap-heart"><Heart fill="currentColor" /></span>
              {activeRoadmap === 0 && <Pendant />}
              {activeRoadmap === 1 && <MessageCircleHeart className="roadmap-big-icon" />}
              {activeRoadmap === 2 && <MapPin className="roadmap-big-icon" />}
              {activeRoadmap === 3 && <HeartPulse className="roadmap-big-icon" />}
            </div>
          </motion.div>
          <div className="swipe-hint"><span /><p>Two-finger trackpad swipe or drag to explore</p><span /></div>
        </div>
      </StackingSection>

      {/* LAYER 9: Bottom Invitation Card & Footer */}
      <StackingSection id="waitlist" zIndex={80} isLast containerHeight="auto">
        <section className="invitation-section">
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ amount: 0.4 }}
            transition={{ duration: 0.8, ease }}
            className="invitation-card"
          >
            <span className="invitation-heart"><LoomMark size={28} color="#ffffff" /></span>
            <small>AN INVITATION FOR YOUR FAMILY</small>
            <h2>Help us make care<br /><em>feel more human.</em></h2>
            <p>
              Join our early circle for priority hardware access, honest product updates, and a direct chance to shape the pendant with your family.
            </p>
            <Link href="/join" className="invitation-cta">
              <LoomMark size={16} color="#ffffff" className="opacity-95" />
              <span>Join Circle</span>
              <ArrowRight className="size-5" />
            </Link>
          </motion.div>
        </section>

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
              <a href="#story">How it cares</a>
              <a href="#details">The pendant</a>
              <a href="#roadmap">Our future</a>
            </div>
            <div>
              <b>Legal</b>
              <a href="#top">Privacy</a>
              <a href="#top">Terms</a>
              <a href="mailto:hello@loom.care">Contact</a>
            </div>
          </div>
          <span className="footer-note">Made with care in India · © 2026</span>
        </footer>
      </StackingSection>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <div
          role="presentation"
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setMenuOpen(false);
            }
          }}
        >
          <div className="mobile-menu">
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
            <a href="#story" onClick={() => setMenuOpen(false)}>How it cares</a>
            <a href="#details" onClick={() => setMenuOpen(false)}>The pendant</a>
            <a href="#roadmap" onClick={() => setMenuOpen(false)}>Our future</a>
            <Link href="/join" onClick={() => setMenuOpen(false)}>Join Circle</Link>
            {user ? (
              <button
                onClick={() => {
                  void logOut();
                  setMenuOpen(false);
                }}
                className="mt-4 text-left text-sm font-bold text-red-600 py-2"
              >
                Sign out ({user.displayName || user.email})
              </button>
            ) : (
              <button
                onClick={() => {
                  void signInWithGoogle();
                  setMenuOpen(false);
                }}
                className="mt-4 text-left text-sm font-bold text-blue-600 py-2"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
