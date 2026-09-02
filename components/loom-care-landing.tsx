'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDown, ArrowRight, BellRing, Check, Heart, HeartPulse, MapPin,
  MessageCircleHeart, Phone, Pill, Radio, ShieldCheck, Sparkles, Users, X,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

function Pendant({ alert = false }: { alert?: boolean }) {
  return (
    <div className={`pendant-shell ${alert ? 'pendant-alert' : ''}`} aria-label="Loom Care pendant illustration">
      <span className="pendant-loop" />
      <div className="pendant-face">
        <HeartPulse className="size-8" strokeWidth={1.5} />
        <span className="pendant-light" />
      </div>
    </div>
  );
}

function Chapter({
  index, eyebrow, title, copy, tone, children,
}: {
  index: string; eyebrow: string; title: string; copy: string; tone: string; children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const visualY = useTransform(scrollYProgress, [0, .5, 1], [72, 0, -54]);
  const visualRotate = useTransform(scrollYProgress, [0, .5, 1], [-3, 0, 3]);
  const copyOpacity = useTransform(scrollYProgress, [.06, .44], [0, 1]);
  const copyY = useTransform(scrollYProgress, [.06, .46], [56, 0]);
  return (
    <section ref={ref} className={`story-chapter ${tone}`}>
      <div className="story-sticky">
        <motion.div style={{ y: visualY, rotate: visualRotate }} className="story-visual">{children}</motion.div>
        <motion.div style={{ opacity: copyOpacity, y: copyY }} className="story-copy">
          <span className="chapter-number">{index}</span>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          <div className="story-rule" />
          <span className="story-description">{copy}</span>
        </motion.div>
      </div>
    </section>
  );
}

export function LoomCareLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activeRoadmap, setActiveRoadmap] = useState(0);
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && (setMenuOpen(false), setAuthOpen(false));
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, isBetaTester: data.isBetaTester === 'on' }),
      });
      if (!response.ok) throw new Error('Unable to join');
      setStatus('success'); event.currentTarget.reset();
    } catch { setStatus('error'); }
  }

  return (
    <main className="site-shell">
      <motion.div className="scroll-progress" style={{ width: progress }} />

      <header className="topbar">
        <a href="#top" className="brand" aria-label="Loom Care home"><span className="brand-mark"><Heart className="size-4" fill="currentColor" /></span>LOOM CARE</a>
        <nav className="desktop-nav" aria-label="Main navigation"><a href="#story">How it cares</a><a href="#details">The pendant</a><a href="#roadmap">Our future</a></nav>
        <div className="nav-actions"><button className="text-button" onClick={() => setAuthOpen(true)}>Sign in</button><a href="#waitlist" className="pill-button">Join the first circle <ArrowRight className="size-4" /></a><button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><span/><span/></button></div>
      </header>

      <section id="top" className="hero">
        <div className="hero-orb hero-orb-blue" /><div className="hero-orb hero-orb-pink" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, ease }} className="hero-copy">
          <div className="soft-badge"><Sparkles className="size-3.5" /> Care that stays quietly close</div>
          <h1>Let them live freely.<br/><em>We’ll keep watch.</em></h1>
          <p>Loom Care is a simple pendant that notices a fall, remembers medicines, and brings family closer—without turning life into a dashboard.</p>
          <div className="hero-buttons"><a href="#story" className="primary-button">See how it cares <ArrowDown className="size-4" /></a><button onClick={() => setAuthOpen(true)} className="secondary-button">I’m a caregiver</button></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.1, delay: .15, ease }} className="hero-photo-wrap">
          <Image src="/loom-family.png" alt="An Indian mother and daughter sharing a warm moment at home" fill priority sizes="(max-width: 900px) 90vw, 46vw" className="hero-photo" />
          <div className="photo-note note-one"><span className="note-icon blue"><ShieldCheck className="size-4" /></span><span><b>All is well</b><small>Home · just now</small></span></div>
          <div className="photo-note note-two"><span className="note-icon pink"><Pill className="size-4" /></span><span><b>Medicine taken</b><small>8:02 PM</small></span></div>
        </motion.div>
        <div className="hero-foot"><span>Built for parents</span><i/><span>Designed with caregivers</span><i/><span>Made in India</span></div>
      </section>

      <section id="story" className="story-intro">
        <p>A small object.<br/>A very human promise.</p>
        <h2>Every ordinary day deserves<br/><em>a quiet safety net.</em></h2>
        <ArrowDown className="story-arrow" />
      </section>

      <Chapter index="01" eyebrow="It arrives like a gift" title="Open the box. Keep the independence." copy="No intimidating kit. No instruction manual the size of a novel. One soft pendant, a charging nest, and a promise you can understand." tone="chapter-blue">
        <div className="unbox-scene"><div className="box-lid"><span>LOOM CARE</span></div><div className="box-base"><div className="box-inset"><Pendant /></div></div><div className="ribbon ribbon-a"/><div className="ribbon ribbon-b"/></div>
      </Chapter>

      <Chapter index="02" eyebrow="Most days, nothing happens" title="Care lives quietly in the background." copy="It nudges for medicine, stores reminders even when the internet disappears, and never asks your parent to learn another screen." tone="chapter-pink">
        <div className="day-scene"><div className="sun-disc"/><div className="day-card card-medicine"><span className="day-icon"><Pill className="size-5" /></span><p>8:00 PM</p><b>Time for the blue tablet</b><small>Tap the pendant once</small></div><div className="day-card card-offline"><span className="status-dot"/><p>Quietly ready</p><b>Works through internet drops</b><small>500 reminders kept safely</small></div><div className="floating-pendant"><Pendant /></div></div>
      </Chapter>

      <Chapter index="03" eyebrow="If a fall happens" title="It asks first. Then it acts." copy="A gentle vibration creates a 20-second grace window. If there’s no response, Loom Care starts the family’s safety chain—calmly, clearly, immediately." tone="chapter-coral">
        <div className="fall-scene"><div className="alert-rings"><span/><span/><span/></div><Pendant alert/><div className="count-card"><small>Are you okay?</small><strong>20</strong><p>Press once to cancel</p></div><div className="signal-path"><span>Detected</span><ArrowRight/><span>Checked</span><ArrowRight/><span>Shared</span></div></div>
      </Chapter>

      <Chapter index="04" eyebrow="Your circle closes in" title="The right people know. In the right order." copy="Children, neighbours, and trusted caregivers receive a clear alert with time and location. Nobody has to guess who is helping." tone="chapter-lilac">
        <div className="circle-scene"><div className="phone-card"><div className="phone-top"><span className="live-dot"/>Loom Care alert<small>now</small></div><div className="parent-row"><span>AS</span><div><b>Asha may need help</b><p>Fall detected at home</p></div></div><div className="map-card"><MapPin className="size-5"/><div><b>Home</b><p>Koramangala · 2 min away</p></div></div><button><Phone className="size-4"/>Call Asha</button></div><div className="person-bubble person-one">P</div><div className="person-bubble person-two">R</div><div className="person-bubble person-three">N</div><svg className="circle-lines" viewBox="0 0 500 500"><path d="M80 90 C200 200 160 250 250 280"/><path d="M440 100 C320 180 340 240 250 280"/><path d="M420 410 C340 350 330 310 250 280"/></svg></div>
      </Chapter>

      <section id="details" className="details-section">
        <div className="details-head"><p>Less technology to manage.<br/>More life to live.</p><h2>Thoughtful in the<br/><em>smallest details.</em></h2></div>
        <div className="feature-grid">
          {[
            { icon: Radio, number: '01', title: 'One button. That’s it.', copy: 'SOS, acknowledge, or cancel. No menus. No passwords. No new habits.' },
            { icon: BellRing, number: '02', title: 'Reminders that feel kind.', copy: 'A chime and a gentle pulse—not another loud, anxious notification.' },
            { icon: ShieldCheck, number: '03', title: 'Offline means still on.', copy: 'Important events stay on the pendant until connection comes back.' },
            { icon: Users, number: '04', title: 'A circle, not a call centre.', copy: 'Help moves through family, neighbours, and trusted caregivers.' },
          ].map(({ icon: Icon, number, title, copy }) => <motion.article key={number} whileHover={{ y: -8 }} className="feature-card"><div><span>{number}</span><Icon className="size-6" /></div><h3>{title}</h3><p>{copy}</p></motion.article>)}
        </div>
      </section>

      <section id="roadmap" className="roadmap-section">
        <div className="roadmap-title"><p>One gentle step at a time</p><h2>The care story<br/><em>keeps growing.</em></h2></div>
        <div className="roadmap-tabs" role="tablist" aria-label="Loom Care roadmap">{['Care','Voice','Connect','Insight'].map((label, i) => <button key={label} role="tab" aria-selected={activeRoadmap === i} onClick={() => setActiveRoadmap(i)}><span>0{i + 1}</span>{label}</button>)}</div>
        <motion.div key={activeRoadmap} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="roadmap-panel">
          <div><small>{['HERE NOW','COMING NEXT','ON THE HORIZON','OUR BIG PICTURE'][activeRoadmap]}</small><h3>{['Safety that asks nothing of them.','Reminders in the voices they love.','Freedom that travels beyond home.','Health patterns that finally make sense.'][activeRoadmap]}</h3><p>{['Fall detection, physical SOS, offline medicine reminders, and the family phone relay.','Spoken medicine names and recorded messages from children and grandchildren.','A direct eSIM, location sharing, and two-way calls without a nearby phone.','Connected blood pressure, oxygen, and glucose signals understood over time.'][activeRoadmap]}</p></div>
          <div className={`roadmap-object object-${activeRoadmap}`}><span className="roadmap-heart"><Heart fill="currentColor" /></span>{activeRoadmap === 0 && <Pendant/>}{activeRoadmap === 1 && <MessageCircleHeart className="roadmap-big-icon"/>}{activeRoadmap === 2 && <MapPin className="roadmap-big-icon"/>}{activeRoadmap === 3 && <HeartPulse className="roadmap-big-icon"/>}</div>
        </motion.div>
      </section>

      <section id="waitlist" className="waitlist-section">
        <div className="envelope-scene"><div className="envelope-back"/><motion.div initial={{ y: 80 }} whileInView={{ y: 0 }} viewport={{ amount: .6 }} transition={{ duration: .8, ease }} className="letter"><Heart className="size-6" fill="currentColor"/><small>AN INVITATION FOR YOUR FAMILY</small><h2>Help us make care<br/>feel more human.</h2><p>Join our first circle for early access, honest product updates, and a chance to shape the hardware beta.</p>
          <form onSubmit={joinWaitlist} className="waitlist-form"><div className="form-row"><label>Full name<input name="name" required placeholder="Your name"/></label><label>Email address<input name="email" type="email" required placeholder="you@example.com"/></label></div><label>Your role<select name="role"><option>Adult Child / Caregiver</option><option>Elderly Parent</option><option>Healthcare Professional</option></select></label><label className="check-row"><input name="isBetaTester" type="checkbox"/>I’d like to test an early pendant with my family.</label><button disabled={status === 'loading'}>{status === 'loading' ? 'Joining…' : 'Join the first circle'}<ArrowRight className="size-4"/></button><div className="form-message" aria-live="polite">{status === 'success' && 'You’re in. Welcome to the circle.'}{status === 'error' && 'That didn’t go through. Please try once more.'}</div></form>
        </motion.div><div className="envelope-front"><span>With care, from Loom.</span></div></div>
      </section>

      <footer><div className="footer-brand"><span className="brand-mark"><Heart className="size-4" fill="currentColor"/></span><b>LOOM CARE</b><p>Because independence and safety<br/>should never be opposites.</p></div><div className="footer-links"><div><b>Explore</b><a href="#story">How it cares</a><a href="#details">The pendant</a><a href="#roadmap">Our future</a></div><div><b>Legal</b><a href="#">Privacy</a><a href="#">Terms</a><a href="mailto:hello@loom.care">Contact</a></div></div><span className="footer-note">Made with care in India · © 2026</span></footer>

      {(menuOpen || authOpen) && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) { setMenuOpen(false); setAuthOpen(false); } }}>
        {menuOpen ? <div className="mobile-menu"><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X/></button><a href="#story" onClick={() => setMenuOpen(false)}>How it cares</a><a href="#details" onClick={() => setMenuOpen(false)}>The pendant</a><a href="#roadmap" onClick={() => setMenuOpen(false)}>Our future</a><a href="#waitlist" onClick={() => setMenuOpen(false)}>Join the first circle</a></div> : <div className="auth-modal"><button className="close-modal" onClick={() => setAuthOpen(false)} aria-label="Close sign in"><X/></button><span className="auth-heart"><Heart fill="currentColor"/></span><small>WELCOME BACK</small><h2>Your care circle,<br/>all in one place.</h2><button className="google-button"><b>G</b>Continue with Google</button><div className="or"><span/>or use a magic link<span/></div><input type="email" placeholder="you@example.com" aria-label="Email address"/><button className="magic-button">Send my magic link</button><p>Sign-in activates when the Firebase keys are connected.</p></div>}
      </div>}
    </main>
  );
}
