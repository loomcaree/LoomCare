'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDown, ArrowRight, BellRing, Bluetooth, Check, ChevronRight, Cloud,
  Cpu, Database, HeartPulse, Layers3, MemoryStick, Microchip, Radio,
  ShieldCheck, Smartphone, Sparkles, TimerReset, UserRoundCheck, X,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

function Pendant({ large = false, alert = false }: { large?: boolean; alert?: boolean }) {
  return <div className={`fx-pendant ${large ? 'is-large' : ''} ${alert ? 'is-alert' : ''}`}>
    <span className="pendant-loop" />
    <div className="pendant-body"><HeartPulse/><span className="led"/><small>LOOM</small></div>
  </div>;
}

const roadmap = [
  { v:'V1', name:'Care', status:'CURRENT CONCEPT', title:'Safety, without a new routine.', copy:'Fall detection, physical SOS, offline medication reminders, and a secure phone gateway relay.', tags:['Fall detection','Physical SOS','Offline reminders','Phone relay'] },
  { v:'V2', name:'Voice', status:'NEXT HORIZON', title:'A familiar voice, right on time.', copy:'A tiny speaker adds spoken medicine names and recorded reminders from the people they love.', tags:['Integrated speaker','Family voice notes','Medicine names','Adaptive volume'] },
  { v:'V3', name:'Connect', status:'FUTURE HORIZON', title:'Freedom beyond the phone.', copy:'Independent cellular eSIM, precise GPS, and two-way voice calls—no nearby phone required.', tags:['Direct eSIM','GPS tracking','Two-way calls','Phone independent'] },
  { v:'V4', name:'Intelligence', status:'VISION HORIZON', title:'Health signals become a story.', copy:'Ambient sensors and connected BP, oxygen, and glucose monitors reveal useful long-term patterns.', tags:['Ambient sensors','Connected vitals','Health trends','Care insights'] },
];

export function LoomCareLanding() {
  const heroRef = useRef<HTMLElement>(null);
  const blueprintRef = useRef<HTMLElement>(null);
  const [roadmapIndex, setRoadmapIndex] = useState(0);
  const [countdown, setCountdown] = useState(20);
  const [counting, setCounting] = useState(false);
  const [ticket, setTicket] = useState<{ name:string; code:string; position:number } | null>(null);
  const [formStatus, setFormStatus] = useState<'idle'|'loading'|'error'>('idle');
  const [authOpen, setAuthOpen] = useState(false);
  const { scrollYProgress: heroProgress } = useScroll({ target:heroRef, offset:['start start','end end'] });
  const { scrollYProgress: blueprintProgress } = useScroll({ target:blueprintRef, offset:['start start','end end'] });
  const lidRotate = useTransform(heroProgress,[0,.16,.72],[0,-12,-112]);
  const pendantY = useTransform(heroProgress,[0,.14,.68,.96],[88,75,-120,-170]);
  const pendantScale = useTransform(heroProgress,[0,.42,.96],[.74,1,1.18]);
  const heroTextOpacity = useTransform(heroProgress,[0,.24,.5],[1,1,0]);
  const boxOpacity = useTransform(heroProgress,[0,.68,.94],[1,1,0]);
  const flipRotate = useTransform(blueprintProgress,[.015,.985],[0,360]);
  const flipScale = useTransform(blueprintProgress,[0,.46,1],[.94,1,.94]);
  const global = useScroll();
  const progressWidth = useTransform(global.scrollYProgress,[0,1],['0%','100%']);

  useEffect(() => {
    if (!counting || countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [counting,countdown]);

  async function submitWaitlist(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFormStatus('loading');
    const form = event.currentTarget; const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,isBetaTester:values.isBetaTester==='on'})});
      const result = await response.json(); if(!response.ok) throw new Error();
      const code = `LOOM-${String(result.id || Date.now()).slice(-6).toUpperCase()}`;
      setTicket({name:String(values.name).split(' ')[0] || 'Friend',code,position:184 + Math.floor(Math.random()*70)});
      form.reset(); setFormStatus('idle');
    } catch { setFormStatus('error'); }
  }

  return <main className="dark-site">
    <motion.div className="page-progress" style={{width:progressWidth}} />
    <div className="ambient-grid"/><div className="noise-layer"/>

    <header className="glass-nav">
      <a href="#concept" className="wordmark"><span className="brand-led"/>Loom Care <small>PHASE 1 · R&amp;D ACTIVE</small></a>
      <nav><a href="#concept">Concept</a><a href="#shield">Safety Shield</a><a href="#blueprint">Blueprint</a><a href="#roadmap">Roadmap</a></nav>
      <div><button onClick={()=>setAuthOpen(true)} className="signin">Sign in</button><a href="#waitlist" className="waitlist-cta">Join Waitlist <ArrowRight/></a></div>
    </header>

    <section ref={heroRef} id="concept" className="hero-scroll">
      <div className="hero-sticky">
        <div className="hero-light one"/><div className="hero-light two"/>
        <motion.div style={{opacity:heroTextOpacity}} className="hero-message">
          <p><Sparkles/> Household-first elder safety</p>
          <h1>Independence for Them.<br/><span>Complete Peace of Mind</span> for You.</h1>
          <div className="hero-lower"><span>A discreet fall-detection pendant with zero tech burden—built to protect the life they already love.</span><a href="#shield">Discover the shield <ArrowDown/></a></div>
        </motion.div>
        <div className="unbox-stage">
          <motion.div style={{opacity:boxOpacity}} className="luxury-box">
            <motion.div style={{rotateX:lidRotate}} className="luxury-lid"><div className="lid-inner"/><span>LOOM CARE</span></motion.div>
            <div className="luxury-base"><div className="box-bed"/></div>
          </motion.div>
          <motion.div style={{y:pendantY,scale:pendantScale}} className="hero-pendant"><Pendant large/></motion.div>
          <div className="telemetry chip-one"><span>BLE 5.3</span><b>CONNECTED</b></div><div className="telemetry chip-two"><span>BATTERY</span><b>07 DAYS</b></div>
        </div>
        <div className="scroll-cue"><span>SCROLL TO UNBOX</span><ArrowDown/></div>
      </div>
    </section>

    <section className="product-world" aria-label="Loom Care product ecosystem">
      <div className="product-world-copy">
        <p>01 · THE REAL-WORLD KIT</p>
        <h2>One calm object.<br/><span>A complete family connection.</span></h2>
        <small>The pendant stays physical and simple. Charging, schedules, alerts, and the Care Circle live around it—never on top of the wearer.</small>
      </div>
      <div className="product-scene">
        <div className="scene-paper scene-blue"/><div className="scene-paper scene-pink"/>
        <img src="/loom-care-ecosystem.png" alt="Loom Care pendant, charging dock and caregiver phone arranged as a real product kit" />
        <div className="product-float float-sos"><ShieldCheck/><span><b>Physical SOS</b>Pressable by touch</span></div>
        <div className="product-float float-offline"><Database/><span><b>Works offline</b>Reminders stay stored</span></div>
        <div className="product-float float-circle"><UserRoundCheck/><span><b>Care Circle</b>Family receives context</span></div>
      </div>
      <div className="kit-strip"><span><b>7 day</b>battery target</span><span><b>BLE 5.3</b>phone gateway</span><span><b>1 button</b>SOS · cancel · confirm</span><span><b>38 g</b>wearable concept</span></div>
    </section>

    <section ref={blueprintRef} id="blueprint" className="blueprint-scroll">
      <div className="blueprint-sticky">
        <div className="section-label"><span>02</span> HARDWARE BLUEPRINT</div>
        <motion.div style={{rotateY:flipRotate,scale:flipScale}} className="flip-card">
          <div className="flip-face flip-front"><Pendant large/><p>THE PENDANT</p><small>64 × 48 × 12 MM · 38 G</small></div>
          <div className="flip-face flip-back">
            <div className="exploded-part part-shell">SHELL</div><div className="exploded-part part-board"><Microchip/><span>PCB</span></div><div className="exploded-part part-battery">LiPo</div><div className="exploded-part part-back">BACK</div>
            <div className="blueprint-callout callout-a"><i/><span><b>Nordic nRF52</b>Ultra-low power BLE MCU</span></div>
            <div className="blueprint-callout callout-b"><i/><span><b>6-Axis IMU</b>Fall motion array</span></div>
            <div className="blueprint-callout callout-c"><i/><span><b>Tactile Button</b>SOS · Cancel · ACK</span></div>
            <div className="blueprint-callout callout-d"><i/><span><b>SPI Flash</b>500 offline event logs</span></div>
          </div>
        </motion.div>
        <div className="flip-copy"><p>ONE OBJECT. FOUR CRITICAL LAYERS.</p><h2>Precision hardware.<br/><span>Quietly human.</span></h2></div>
      </div>
    </section>

    <section id="shield" className="shield-intro"><p>03 · THE SAFETY SHIELD</p><h2>When a fall happens,<br/><span>every second has a job.</span></h2></section>
    <section className="card-deck">
      <article className="deck-card card-impact">
        <div className="deck-copy"><span>01 / IMPACT</span><h3>The pendant notices what the room cannot.</h3><p>Freefall, impact, angular shift, and stillness create one clear motion signature.</p><div className="metric-row"><b>6-AXIS</b><span>motion sensing</span><b>&lt; 180MS</b><span>impact analysis</span></div></div>
        <div className="impact-visual"><div className="vector-field"><i/><i/><i/><i/><i/></div><Pendant alert/><div className="impact-wave"/><div className="imu-readout"><span>ACCEL Z</span><svg viewBox="0 0 280 80"><path d="M0 45 L45 44 L85 41 L112 5 L124 73 L140 20 L154 45 L280 45"/></svg><b>IMPACT SIGNATURE MATCHED</b></div></div>
      </article>
      <article className="deck-card card-grace">
        <div className="deck-copy"><span>02 / LOCAL GRACE</span><h3>It asks before it calls for help.</h3><p>A vibration and audible chime give the wearer a calm, local false-alarm window.</p><button onClick={()=>{setCountdown(20);setCounting(true)}} className="demo-button"><TimerReset/> Restart demo</button></div>
        <div className="grace-visual"><div className="count-ring" style={{'--count':countdown} as React.CSSProperties}><strong>{String(countdown).padStart(2,'0')}</strong><span>SECONDS</span></div><div className="grace-device"><Pendant large alert/><span className="vibration v1">)))</span><span className="vibration v2">(((</span></div><button onClick={()=>{setCounting(false);setCountdown(20)}}>PRESS TO CANCEL</button></div>
      </article>
      <article className="deck-card card-relay">
        <div className="deck-copy"><span>03 / SIGNAL RELAY</span><h3>The alert finds the fastest path to family.</h3><p>Four encrypted handoffs turn one local event into a clear caregiver action.</p></div>
        <div className="relay-visual">{[
          {I:Bluetooth,t:'Pendant',s:'BLE 5.3'}, {I:Smartphone,t:'Parent Phone',s:'Kotlin Relay'}, {I:Cloud,t:'Loom Cloud',s:'Encrypted API'}, {I:BellRing,t:'Caregiver',s:'Priority Push'},
        ].map(({I,t,s},i)=><div className="relay-unit" key={t}><div className="relay-node"><I/></div><b>{t}</b><small>{s}</small>{i<3&&<span className="relay-beam"><i/></span>}</div>)}</div>
      </article>
      <article className="deck-card card-override">
        <div className="deck-copy"><span>04 / SHIELD ACTIVE</span><h3>Silent mode no longer means missed.</h3><p>A high-priority emergency screen carries the time, person, and incident context.</p><div className="active-badge"><span/> CARE CIRCLE NOTIFIED</div></div>
        <div className="phone-stage"><div className="phone-model"><div className="phone-screen"><div className="dynamic-island"/><span className="alert-label">LOOM CARE · EMERGENCY</span><div className="alert-icon"><HeartPulse/></div><h4>Asha may need help</h4><p>Fall detected at home</p><div className="alert-log"><span>20:42:08</span><b>Impact detected</b><span>20:42:28</span><b>No cancellation</b><span>20:42:29</span><b>Care Circle alerted</b></div><button>Call Asha</button><button className="outline">I’m responding</button></div></div><div className="override-ring r1"/><div className="override-ring r2"/></div>
      </article>
    </section>

    <section id="roadmap" className="roadmap-dark">
      <div className="roadmap-heading"><div><p>04 · VISION HORIZON</p><h2>Built in chapters.<br/><span>Designed for a lifetime.</span></h2></div><small>SCRUB THE TIMELINE<br/>TO EXPLORE THE SYSTEM</small></div>
      <div className="version-track">{roadmap.map((item,i)=><button onClick={()=>setRoadmapIndex(i)} className={i<=roadmapIndex?'active':''} key={item.v}><span>{item.v}</span><b>{item.name}</b></button>)}</div>
      <input aria-label="Roadmap version" className="roadmap-slider" type="range" min="0" max="3" step="1" value={roadmapIndex} onChange={e=>setRoadmapIndex(Number(e.target.value))}/>
      <motion.div key={roadmapIndex} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.45,ease}} className="version-panel"><div><small>{roadmap[roadmapIndex].status}</small><h3>{roadmap[roadmapIndex].title}</h3><p>{roadmap[roadmapIndex].copy}</p><div className="tag-grid">{roadmap[roadmapIndex].tags.map(tag=><span key={tag}><Check/>{tag}</span>)}</div></div><div className={`horizon-visual horizon-${roadmapIndex}`}><div className="horizon-core">{roadmapIndex===0&&<Pendant large/>}{roadmapIndex===1&&<Radio/>}{roadmapIndex===2&&<Smartphone/>}{roadmapIndex===3&&<Cpu/>}</div><span className="orbit o1"/><span className="orbit o2"/><span className="orbit o3"/></div></motion.div>
    </section>

    <section id="waitlist" className="waitlist-zone">
      <div className="portal-glow"/>
      <div className={`waitlist-flipper ${ticket?'flipped':''}`}>
        <div className="waitlist-side waitlist-front"><div className="portal-copy"><p><Sparkles/> EARLY ACCESS PORTAL</p><h2>Help build the<br/><span>first safety circle.</span></h2><small>Join for product updates, founding-family access, and a chance to test Loom Care hardware at home.</small><div className="trust-line"><UserRoundCheck/> Privacy first <i/> Limited beta places</div></div>
          <form onSubmit={submitWaitlist}><div className="form-grid"><label>FULL NAME<input name="name" required placeholder="Aarav Mehta"/></label><label>EMAIL ADDRESS<input name="email" type="email" required placeholder="aarav@example.com"/></label></div><label>YOUR ROLE<select name="role"><option>Adult Child / Caregiver</option><option>Elderly Parent</option><option>Healthcare Professional</option></select></label><label className="beta-toggle"><input name="isBetaTester" type="checkbox"/><span/><div><b>Apply for hardware beta</b><small>Test an early pendant and share feedback</small></div></label><button disabled={formStatus==='loading'}>{formStatus==='loading'?'SECURING YOUR PLACE…':'JOIN THE VIP WAITLIST'}<ArrowRight/></button>{formStatus==='error'&&<p className="form-error">Unable to register yet. Connect Firebase or try again.</p>}</form>
        </div>
        <div className="waitlist-side waitlist-back"><div className="ticket-top"><span className="brand-led"/>LOOM CARE · FOUNDING CIRCLE</div><div className="ticket-body"><div className="ticket-check"><Check/></div><p>WELCOME, {ticket?.name?.toUpperCase()}</p><h2>You’re inside<br/>the first circle.</h2><div className="ticket-data"><span>QUEUE POSITION<b>#{ticket?.position}</b></span><span>REFERRAL CODE<b>{ticket?.code}</b></span></div><small>We’ll email you when a hardware beta place becomes available.</small><button onClick={()=>setTicket(null)}>Add another family <ArrowRight/></button></div><div className="ticket-bars">|||| ||| || ||||| ||| |||||| ||</div></div>
      </div>
    </section>

    <footer className="dark-footer"><a href="#concept" className="wordmark"><span className="brand-led"/>Loom Care</a><p>Independence and safety should never be opposites.</p><div><a href="#blueprint">Hardware Vision</a><a href="#">Privacy</a><a href="#">Terms</a></div><small>© 2026 LOOM CARE · CONCEPT &amp; R&amp;D</small></footer>

    {authOpen&&<div className="modal-veil" onMouseDown={e=>e.target===e.currentTarget&&setAuthOpen(false)}><div className="auth-glass"><button onClick={()=>setAuthOpen(false)} aria-label="Close"><X/></button><span className="brand-led"/><p>CAREGIVER PORTAL</p><h2>Your circle,<br/>always connected.</h2><button className="google-signin"><b>G</b> Continue with Google</button><div className="auth-rule"><span/>OR MAGIC LINK<span/></div><input type="email" placeholder="you@example.com"/><button className="magic-link">Send secure link</button><small>Authentication activates when Firebase keys are connected.</small></div></div>}
  </main>;
}
