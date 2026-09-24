import type { ReactNode } from 'react';
import { ArrowRight, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { SiteFooter, SiteHeader, type SitePage } from '@/components/site-shell';
import { getWaitlistEndpoint } from '@/lib/waitlist';

const waitlistOpen = Boolean(
  getWaitlistEndpoint(import.meta.env.VITE_WAITLIST_ENDPOINT),
);

type InformationPageProps = { page: Exclude<SitePage, 'home' | 'join'> };

const Updated = () => <p className="policy-date">Last updated 22 September 2026</p>;

const ReviewNote = () => (
  <aside className="policy-review">
    <strong>Landing-site policy only</strong>
    This notice describes the Loom Care website and waitlist as they work today.
    It is not legal advice. Have it reviewed before a commercial product launch.
    A future caregiver app and pendant will need a separate, more detailed policy.
  </aside>
);

function AboutPage() {
  return (
    <>
      <section className="page-hero page-hero-about">
        <p className="section-kicker">About Loom Care</p>
        <h1>
          A quieter kind of
          <br />
          <em>closeness.</em>
        </h1>
        <p className="page-lede">
          We imagine care that protects everyday independence without making
          life feel clinical.
        </p>
      </section>
      <section
        className="about-story content-band"
        aria-labelledby="about-belief"
      >
        <div>
          <p className="section-kicker">What we believe</p>
          <h2 id="about-belief">
            Freedom and safety
            <br />
            <em>belong together.</em>
          </h2>
        </div>
        <div className="long-copy">
          <p>
            Our starting point is a human question: how can families stay close
            without making an older parent feel watched?
          </p>
          <p>
            Our answer is a care experience designed to be calm, simple, and
            respectful—something that fits into an ordinary day rather than
            taking it over.
          </p>
        </div>
      </section>
      <section
        className="principles-section"
        aria-labelledby="principles-heading"
      >
        <p className="section-kicker">How we think</p>
        <h2 id="principles-heading">Three things guide us.</h2>
        <div className="principle-grid">
          <article>
            <Heart aria-hidden="true" />
            <h3>Human first</h3>
            <p>Care should feel warm, familiar, and dignified.</p>
          </article>
          <article>
            <Sparkles aria-hidden="true" />
            <h3>Quiet by design</h3>
            <p>Less noise, fewer steps, and no unnecessary complexity.</p>
          </article>
          <article>
            <ShieldCheck aria-hidden="true" />
            <h3>Trust is earned</h3>
            <p>
              We communicate clearly about what the experience can—and
              cannot—do.
            </p>
          </article>
        </div>
      </section>
      <section className="page-cta">
        <p className="section-kicker">Explore the idea</p>
        <h2>
          See how care could
          <br />
          <em>live in the background.</em>
        </h2>
        <a className="pill-button" href="/#story">
          Follow the care story <ArrowRight aria-hidden="true" />
        </a>
      </section>
    </>
  );
}

function PrivacyPage() {
  return (
    <article className="policy-page">
      <header className="policy-header">
        <p className="section-kicker">Digital Personal Data Protection Notice</p>
        <h1>Privacy policy</h1>
        <p className="page-lede">
          How the Loom Care informational website and early waitlist handle your personal data.
        </p>
        <Updated />
      </header>
      <div className="policy-content">
        <ReviewNote />

        <section>
          <h2>1. About Us</h2>
          <p>
            This website and early waitlist are operated by <strong>Loom Care</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), an initiative building unobtrusive, dignity-first eldercare hardware and software solutions in India.
          </p>
          <p>
            For privacy inquiries, questions regarding this notice, or to exercise any data principal rights, contact our privacy and grievance desk at:{' '}
            <a href="mailto:loomcaree@gmail.com">loomcaree@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>
            At this pre-launch waitlist stage, we adhere strictly to the principle of data minimisation. We collect only what is reasonably necessary to coordinate early access:
          </p>
          <ul>
            <li><strong>Full Name</strong> and <strong>Email Address</strong> (required to reserve your place on the priority list and reach you).</li>
            <li><strong>Phone Number</strong> (optional, if you choose to receive direct SMS or WhatsApp launch notifications).</li>
            <li><strong>City / Location</strong> (optional, to help us plan regional fulfillment and product availability).</li>
            <li><strong>Product validation answer</strong> (optional survey question: whether your parents or grandparents spend significant time alone).</li>
            <li><strong>Account authentication details</strong>: Basic credentials created if you sign in with Google or create an email/password account secured by Firebase Authentication.</li>
            <li><strong>Basic technical telemetry</strong>: Standard HTTP request metadata (IP address, browser type, device characteristics) processed automatically by our hosting infrastructure (Firebase Hosting) solely to deliver and protect the web pages.</li>
          </ul>
          <p className="policy-note">
            <strong>What we do NOT collect:</strong> We do not collect health records, medical histories, diagnoses, prescriptions, fall sensor logs, GPS coordinates, or emergency records on this website. Future wearable pendant and caregiver application features will be governed by a separate, dedicated clinical-grade privacy policy prior to commercial release.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We process waitlist information solely for specified, explicit, and legitimate purposes:</p>
          <ul>
            <li>Administering and managing the priority waitlist (including preventing duplicate entries).</li>
            <li>Contacting you with early access invitations, beta previews, and product launch milestones.</li>
            <li>Conducting high-level product interest validation based on optional survey responses.</li>
            <li>Responding to user-initiated queries, feedback, or support requests.</li>
            <li>Protecting the website and waitlist against bot spam, abuse, and technical disruptions.</li>
          </ul>
          <p>
            Creating an account or signing in on this site does not automatically place you on the waitlist. You join the waitlist only after affirmative submission of the waitlist form with explicit consent.
          </p>
        </section>

        <section>
          <h2>4. Cookies and Analytics</h2>
          <p>
            We respect your digital privacy and do not deploy third-party advertising trackers or behavioral profiling pixels:
          </p>
          <ul>
            <li>We do <strong>not</strong> use Google Analytics, Meta Pixel, Vercel Analytics, or cross-site tracking cookies on this site.</li>
            <li><strong>Firebase Authentication</strong> utilizes essential browser local storage / session cookies to maintain your signed-in state safely across page visits.</li>
            <li>Typography is rendered using the Geist font family loaded from Google Fonts; Google may log basic network connection metadata as outlined in the <a href="https://fonts.google.com/faq/privacy" target="_blank" rel="noopener noreferrer">Google Fonts Privacy FAQ</a>.</li>
          </ul>
        </section>

        <section>
          <h2>5. How We Share Information</h2>
          <p>
            <strong>No Sale of Personal Data:</strong> We explicitly state that we do not sell, rent, monetize, or trade waitlist personal data with data brokers or third parties for marketing purposes.
          </p>
          <p>
            To deliver this website and manage the waitlist securely, information is processed on our behalf by trusted technical infrastructure providers under strict contractual safeguards:
          </p>
          <ul>
            <li><strong>Firebase Hosting &amp; Authentication (Google LLC):</strong> To host the static web assets and provide secure user authentication. See <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Firebase Privacy and Security</a>.</li>
            <li><strong>Google Apps Script &amp; Google Sheets:</strong> To securely record and store waitlist submissions in a private, access-restricted spreadsheet managed exclusively by authorized Loom Care operators. Authentication tokens are verified and never recorded in the spreadsheet.</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We do not retain waitlist data indefinitely. Your personal data is retained only for the duration of the waitlist and beta testing phase, and up to a maximum of 24 months following our commercial product launch.
          </p>
          <p>
            If you request removal or withdraw your consent before that time, your record is promptly erased from our waitlist records within 30 days of receiving your request.
          </p>
        </section>

        <section>
          <h2>7. Data Security</h2>
          <p>
            In alignment with the Digital Personal Data Protection Rules, 2025, we implement appropriate technical and organisational safeguards:
          </p>
          <ul>
            <li>All data in transit is encrypted using modern Transport Layer Security (HTTPS / TLS 1.3).</li>
            <li>Authentication is delegated to Google Firebase's industry-standard identity infrastructure.</li>
            <li>Waitlist storage spreadsheets are private and protected with multi-factor authentication, with access strictly restricted to designated project administrators.</li>
          </ul>
        </section>

        <section>
          <h2>8. Your Choices and Rights</h2>
          <p>
            Under India&rsquo;s Digital Personal Data Protection Act (DPDP), you are recognized as a Data Principal and have full control over your personal data:
          </p>
          <ul>
            <li><strong>Right to Access:</strong> You may request a summary of the personal data we hold about you.</li>
            <li><strong>Right to Correction &amp; Updating:</strong> You may request correction of inaccurate, incomplete, or outdated information.</li>
            <li><strong>Right to Erasure &amp; Withdrawal of Consent:</strong> You may withdraw your consent and request complete deletion of your waitlist information at any time. Withdrawal is made as easy as giving consent.</li>
          </ul>
          <p>
            To exercise any of these rights, simply email us at{' '}
            <a href="mailto:loomcaree@gmail.com">loomcaree@gmail.com</a> with the subject line &ldquo;Privacy Request&rdquo;. We will acknowledge and process your request within 7 business days without charge.
          </p>
        </section>

        <section>
          <h2>9. International Data Processing</h2>
          <p>
            Our core team operates in India. However, the technical infrastructure provided by Google (Firebase and Google Workspace) may host or process data across secure distributed data centers located outside India, subject to rigorous data protection standards and applicable laws.
          </p>
        </section>

        <section>
          <h2>10. Children&rsquo;s Privacy</h2>
          <p>
            This waitlist is exclusively intended for adults aged 18 and older. In accordance with the DPDP framework, an individual under 18 years of age is defined as a child. We do not knowingly solicit or collect personal data from anyone under 18. If you believe a minor has submitted information, please alert us at{' '}
            <a href="mailto:loomcaree@gmail.com">loomcaree@gmail.com</a> and we will erase it immediately.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Policy</h2>
          <p>
            We may occasionally update this Privacy Policy as our website and early access program evolve. When modifications are published, the &ldquo;Last updated&rdquo; date at the top of this page will be revised accordingly. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2>12. Contact Us &amp; Grievance Redressal</h2>
          <p>
            For questions, feedback, or grievance redressal regarding your personal data and privacy, please reach out directly to:
          </p>
          <div className="policy-contact-box">
            <p><strong>Loom Care Privacy &amp; Grievance Contact</strong></p>
            <p>Email: <a href="mailto:loomcaree@gmail.com">loomcaree@gmail.com</a></p>
            <p>Subject: Attention: Grievance Officer / Privacy Inquiry</p>
            <p>Response Timeline: Within 30 days as prescribed under the DPDP framework (typically within 48&ndash;72 hours).</p>
          </div>
        </section>
      </div>
    </article>
  );
}

function TermsPage() {
  return (
    <article className="policy-page">
      <header className="policy-header">
        <p className="section-kicker">Legal</p>
        <h1>Terms &amp; conditions</h1>
        <p className="page-lede">
          The ground rules for using the Loom Care website.
        </p>
        <Updated />
      </header>
      <div className="policy-content">
        <ReviewNote />
        <section>
          <h2>About this website</h2>
          <p>
            This site presents the Loom Care concept and design direction.
            Product scenes, notifications, controls, and care-circle
            interactions shown here are illustrative demonstrations; they are
            not live monitoring, emergency-response, or medical services.
          </p>
        </section>
        <section>
          <h2>Not medical or emergency advice</h2>
          <p>
            Website content is general information only. It is not a substitute
            for advice from a qualified healthcare professional. Do not rely on
            this website to detect or respond to an emergency. Contact your
            local emergency service when immediate help is needed.
          </p>
        </section>
        <section>
          <h2>Using the site</h2>
          <p>
            You may browse and share links to the site for lawful, personal use.
            Do not interfere with its operation, attempt unauthorized access,
            introduce malicious code, or present Loom Care content in a
            misleading way.
          </p>
        </section>
        <section>
          <h2>Joining the waitlist</h2>
          <p>
            You may sign in with Google or with email and password. Signing in
            alone does not subscribe you; you must agree to the Privacy Policy
            and submit the waitlist form. Joining expresses interest in Loom Care
            and permission to receive waitlist and launch updates. It is not a
            purchase, a device reservation, or a promise of availability on a
            particular date. You can ask to leave the list through{' '}
            <a href="mailto:loomcaree@gmail.com">loomcaree@gmail.com</a>.
          </p>
        </section>
        <section>
          <h2>Content and intellectual property</h2>
          <p>
            The Loom Care name, visual identity, copy, and original website
            content are protected by applicable intellectual-property laws.
            These terms do not transfer ownership or grant permission to reuse
            brand assets commercially.
          </p>
        </section>
        <section>
          <h2>External links</h2>
          <p>
            Links to social networks and third-party policies are provided for
            convenience. Loom Care does not control those services and their own
            terms and privacy practices apply.
          </p>
        </section>
        <section>
          <h2>Availability and changes</h2>
          <p>
            We may change, pause, or remove parts of this informational website.
            We do not promise that it will always be available or error-free.
            Nothing here limits rights that cannot lawfully be limited.
          </p>
        </section>
        <section>
          <h2>Questions</h2>
          <p>
            Questions about these terms can be sent to{' '}
            <a href="mailto:loomcaree@gmail.com">loomcaree@gmail.com</a>. We may revise
            these terms as the website and Loom Care offering develop; the
            updated date will appear above.
          </p>
        </section>
      </div>
    </article>
  );
}

export function InformationPage({ page }: InformationPageProps) {
  let content: ReactNode;
  if (page === 'about') content = <AboutPage />;
  else if (page === 'privacy') content = <PrivacyPage />;
  else content = <TermsPage />;

  return (
    <div className="site-shell inner-site">
      <SiteHeader page={page} />
      <main id="main-content" tabIndex={-1}>
        {content}
      </main>
      <SiteFooter />
    </div>
  );
}
