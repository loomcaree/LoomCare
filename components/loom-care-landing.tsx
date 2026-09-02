import { useLayoutEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  MapPin,
  Phone,
  Pill,
  Radio,
  ShieldCheck,
  Users,
  Check,
} from 'lucide-react';
import { LoomMark } from '@/components/loom-logo';

import { SiteHeader, SiteFooter } from '@/components/site-shell';

const ease = [0.22, 1, 0.36, 1] as const;

function Pendant({
  alert = false,
  confirmed = false,
}: {
  alert?: boolean;
  confirmed?: boolean;
}) {
  return (
    <div
      className={`pendant-shell ${alert ? 'pendant-alert' : ''} ${confirmed ? 'pendant-confirmed' : ''}`}
      aria-label="Loom Care pendant illustration"
    >
      <span className="pendant-loop" />
      <div className="pendant-face">
        <LoomMark
          size={22}
          color={alert ? '#fff' : '#2d5cf3'}
          className="drop-shadow-sm"
        />
        <span className="pendant-light" />
      </div>
    </div>
  );
}

function UnboxingScene({ progress }: { progress: MotionValue<number> }) {
  const reducedMotion = useReducedMotion();
  // Start after the chapter settles, then unfold across its pinned scroll track.
  const opening = useTransform(progress, [0.08, 0.35, 0.9], [0, 0.18, 1]);
  const smoothOpening = useSpring(opening, {
    stiffness: 55,
    damping: 26,
    mass: 1.2,
  });
  const lidY = useTransform(smoothOpening, [0, 1], [0, -155]);
  const lidTilt = useTransform(smoothOpening, [0, 1], [0, -52]);

  return (
    <div
      className="unbox-scene"
      role="img"
      aria-label="A Loom Care gift box opens as you scroll, revealing the pendant"
    >
      <div className="box-base">
        <div className="box-inset">
          <Pendant />
        </div>
      </div>
      <motion.div
        className="box-lid"
        style={{
          x: '-50%',
          y: reducedMotion ? -155 : lidY,
          rotateX: reducedMotion ? -52 : lidTilt,
        }}
      >
        <span>LOOM CARE</span>
      </motion.div>
    </div>
  );
}

function EverydayScene({ progress }: { progress: MotionValue<number> }) {
  const [confirmed, setConfirmed] = useState(false);
  const reducedMotion = useReducedMotion();
  const cardY = useTransform(progress, [0, 1], [30, -30]);
  const offlineY = useTransform(progress, [0, 1], [-20, 25]);
  return (
    <div className={`day-scene ${confirmed ? 'day-confirmed' : ''}`}>
      <div className="sun-disc" />
      <motion.div
        className="day-card card-medicine"
        style={{ y: reducedMotion ? 0 : cardY, rotate: -5 }}
      >
        <span className="day-icon">
          {confirmed ? (
            <Check className="size-5" />
          ) : (
            <Pill className="size-5" />
          )}
        </span>
        <p>{confirmed ? 'Reminder acknowledged' : '8:00 PM'}</p>
        <b>{confirmed ? 'One tap. Noted.' : 'Time for medicine.'}</b>
        <small>
          {confirmed ? 'Tap again to replay the demo' : 'Tap the pendant once'}
        </small>
      </motion.div>
      <motion.div
        className="day-card card-offline"
        style={{ y: reducedMotion ? 0 : offlineY, rotate: 5 }}
      >
        <span className="status-dot" />
        <p>Quietly ready</p>
        <b>Ready offline</b>
        <small>Reminders stay on the pendant</small>
      </motion.div>
      <div className="floating-pendant">
        <motion.button
          type="button"
          className="pendant-touch"
          onClick={() => setConfirmed((value) => !value)}
          aria-pressed={confirmed}
          aria-label={
            confirmed
              ? 'Replay medicine reminder demo'
              : 'Acknowledge medicine reminder demo'
          }
          whileHover={reducedMotion ? undefined : { scale: 1.04 }}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        >
          <Pendant confirmed={confirmed} />
        </motion.button>
      </div>
      <span className="scene-feedback" role="status">
        {confirmed
          ? 'Demo: reminder acknowledged · green light'
          : 'Interactive demo · tap the pendant'}
      </span>
    </div>
  );
}

function DraggableLoop({ index }: { index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className="loop-position"
      initial={{ x: 0, y: 0, opacity: index === 1 ? 1 : 0 }}
      whileInView={{
        x: (index - 1) * 82,
        y: index === 1 ? -12 : 10,
        opacity: 1,
      }}
      viewport={{ amount: 0.6 }}
      transition={{
        duration: reducedMotion ? 0 : 1.2,
        delay: reducedMotion ? 0 : index * 0.12,
        ease,
      }}
    >
      <motion.button
        type="button"
        className={`draggable-loop loop-${index}`}
        drag
        dragMomentum={false}
        dragConstraints={{ left: -36, right: 36, top: -28, bottom: 28 }}
        dragElastic={0.12}
        style={{ x, y }}
        aria-label={`Care loop ${index + 1}. Drag or use arrow keys to move; press Escape to reset.`}
        onKeyDown={(event) => {
          const delta = {
            ArrowLeft: [-8, 0],
            ArrowRight: [8, 0],
            ArrowUp: [0, -8],
            ArrowDown: [0, 8],
          }[event.key];
          if (delta) {
            event.preventDefault();
            x.set(Math.max(-36, Math.min(36, x.get() + delta[0])));
            y.set(Math.max(-28, Math.min(28, y.get() + delta[1])));
          }
          if (event.key === 'Escape') {
            x.set(0);
            y.set(0);
          }
        }}
        whileDrag={{ scale: 1.12, cursor: 'grabbing' }}
      >
        <LoomMark size={30} aria-hidden="true" />
      </motion.button>
    </motion.div>
  );
}

// Reserve the scaled artwork's actual size so it never intrudes into copy.
function SceneFrame({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const resize = () =>
      setScale(Math.min(1, element.clientWidth / (width + 64)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);
  return (
    <div
      ref={ref}
      className="scene-viewport"
      style={{
        maxWidth: width + 64,
        aspectRatio: `${width + 64} / ${height + 64}`,
      }}
    >
      <div
        className="scene-artboard"
        style={{
          width,
          height,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ChapterStack({
  index,
  eyebrow,
  title,
  copy,
  tone,
  children,
  deepScroll = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
  tone: string;
  children:
    | React.ReactNode
    | ((progress: MotionValue<number>) => React.ReactNode);
  deepScroll?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress: entryProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const { scrollYProgress: pinnedProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const visualY = useTransform(entryProgress, [0, 0.5, 1], [18, 0, -18]);
  const [width, height] =
    index === '01' ? [460, 450] : index === '04' ? [580, 600] : [570, 590];
  return (
    <section
      ref={containerRef}
      className={`chapter-section ${tone} ${deepScroll && !reducedMotion ? 'chapter-deep' : ''}`}
      aria-labelledby={`chapter-title-${index}`}
    >
      <div className="chapter-frame">
        <div className="story-layout">
          <motion.div
            className="story-visual"
            style={{ y: reducedMotion ? 0 : visualY }}
          >
            <SceneFrame width={width} height={height}>
              {typeof children === 'function'
                ? children(deepScroll ? pinnedProgress : entryProgress)
                : children}
            </SceneFrame>
          </motion.div>
          <div className="story-copy">
            <p className="chapter-eyebrow">
              <span>{index}</span>
              {eyebrow}
            </p>
            <h2 id={`chapter-title-${index}`}>{title}</h2>
            <p className="story-description">{copy}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LoomCareLanding() {
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '10%']);
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="site-shell">
      <motion.div className="scroll-progress" style={{ width: progress }} />

      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        {/* LAYER 1: Full-Opacity Background Hero with Centered White Title */}
        <div className="hero-section">
          <section ref={heroRef} id="top" className="hero-centered">
            <motion.div
              className="hero-bg-layer"
              style={{ y: reducedMotion ? 0 : heroY }}
            >
              <img
                src="/loom-family.png"
                alt="An Indian mother and daughter sharing a warm, loving moment at home"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                }}
                fetchPriority="high"
                sizes="100vw"
                className="hero-bg-image"
              />
            </motion.div>
            <div className="hero-contrast-overlay" aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease }}
              className="hero-centered-content"
            >
              <h1 className="hero-white-title">
                Let them live freely.
                <br />
                <em>We keep the watch.</em>
              </h1>
            </motion.div>
          </section>
        </div>

        {/* LAYER 2: Story Intro Bridge */}
        <section id="story" className="story-intro">
          <p>A very human promise</p>
          <h2>
            Every ordinary day deserves
            <br />
            <em>a quiet safety net.</em>
          </h2>
          <div className="care-loops" aria-label="Draggable care loops">
            {[0, 1, 2].map((index) => (
              <DraggableLoop key={index} index={index} />
            ))}
          </div>
          <span className="care-loops-hint">
            Drag a loop. Share a little care.
          </span>
          <ArrowDown className="story-arrow" />
        </section>

        {/* LAYER 3: Chapter 01 - Unbox */}
        <ChapterStack
          deepScroll
          index="01"
          eyebrow="It arrives like a gift"
          title="Open the box. Keep the independence."
          copy="One pendant. One charging nest. Ready for everyday life."
          tone="chapter-blue"
        >
          {(progress) => <UnboxingScene progress={progress} />}
        </ChapterStack>

        {/* LAYER 4: Chapter 02 - Everyday Care */}
        <ChapterStack
          index="02"
          eyebrow="Most days, nothing happens"
          title="Care, quietly there."
          copy="Gentle medicine reminders, even without the internet."
          tone="chapter-pink"
        >
          {(progress) => <EverydayScene progress={progress} />}
        </ChapterStack>

        {/* LAYER 5: Chapter 03 - Fall Detection */}
        <ChapterStack
          index="03"
          eyebrow="If a fall happens"
          title="It asks first. Then it acts."
          copy="A gentle check-in. Twenty seconds to respond. Then an alert to family."
          tone="chapter-coral"
        >
          <div className="fall-scene">
            <div className="alert-rings">
              <span />
              <span />
              <span />
            </div>
            <Pendant alert />
            <div className="count-card">
              <small>Are you okay?</small>
              <strong>20</strong>
              <p>Press once to cancel</p>
            </div>
            <div className="signal-path">
              <span>Detected</span>
              <ArrowRight />
              <span>Checked</span>
              <ArrowRight />
              <span>Shared</span>
            </div>
          </div>
        </ChapterStack>

        {/* LAYER 6: Chapter 04 - Circle Relay */}
        <ChapterStack
          index="04"
          eyebrow="Your circle closes in"
          title="Your people. Close by."
          copy="A clear alert brings family, neighbours, and caregivers together."
          tone="chapter-lilac"
        >
          <div className="circle-scene">
            <div className="phone-card">
              <div className="phone-top">
                <span className="live-dot" />
                Loom Care alert<small>now</small>
              </div>
              <div className="parent-row">
                <span>AS</span>
                <div>
                  <b>Asha may need help</b>
                  <p>Fall detected at home</p>
                </div>
              </div>
              <div className="map-card">
                <MapPin className="size-5" />
                <div>
                  <b>Home</b>
                  <p>Koramangala · 2 min away</p>
                </div>
              </div>
              <div className="phone-demo-action">
                <Phone className="size-4" />
                Call Asha <small>Demo</small>
              </div>
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
        <section id="details" className="details-section">
          <div className="details-head">
            <p>Less to manage. More to live.</p>
            <h2>
              Thoughtful in the
              <br />
              <em>smallest details.</em>
            </h2>
          </div>
          <div className="feature-grid">
            {[
              {
                icon: Radio,
                number: '01',
                title: 'One button. That’s it.',
                copy: 'SOS and reminders. No menus to learn.',
              },
              {
                icon: BellRing,
                number: '02',
                title: 'A kinder reminder.',
                copy: 'A soft chime. A gentle pulse.',
              },
              {
                icon: ShieldCheck,
                number: '03',
                title: 'Offline means still on.',
                copy: 'Reminders stay ready without a connection.',
              },
              {
                icon: Users,
                number: '04',
                title: 'Their own care circle.',
                copy: 'Help from the people they know.',
              },
            ].map(({ icon: Icon, number, title, copy }) => (
              <motion.article
                key={number}
                whileHover={{ y: -8 }}
                className="feature-card"
              >
                <div>
                  <span>{number}</span>
                  <Icon className="size-6" />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section
          id="company"
          className="company-section"
          aria-labelledby="company-heading"
        >
          <div>
            <p className="section-kicker">A little about us</p>
            <h2 id="company-heading">
              Care should feel
              <br />
              <em>like being close.</em>
            </h2>
          </div>
          <div className="company-intro">
            <p>
              Loom Care begins with a simple belief: growing older shouldn't
              mean giving up your everyday freedom.
            </p>
            <p>
              We're exploring quieter ways for families to stay connected—with
              thoughtful design and people at the heart of it.
            </p>
            <a className="text-link" href="/about/">
              Meet Loom Care <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
