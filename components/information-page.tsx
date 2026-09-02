import type { ReactNode } from 'react';
import { ArrowRight, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { SiteFooter, SiteHeader, type SitePage } from '@/components/site-shell';

type InformationPageProps = { page: Exclude<SitePage, 'home'> };

const Updated = () => <p className="policy-date">Updated 3 September 2026</p>;

const ReviewNote = () => (
  <aside className="policy-review">
    <strong>Draft for review</strong>
    Company identity, contact details, and information-retention arrangements
    still require owner confirmation and legal review before this is a final
    policy.
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
        <p className="section-kicker">Legal</p>
        <h1>Privacy policy</h1>
        <p className="page-lede">
          A plain-language summary of what this website does with information.
        </p>
        <Updated />
      </header>
      <div className="policy-content">
        <ReviewNote />
        <section>
          <h2>The short version</h2>
          <p>
            This is currently an informational website. It does not provide an
            account, sign-in, order, payment, or waitlist form, and Loom Care
            has not added advertising or analytics cookies to it.
          </p>
        </section>
        <section>
          <h2>Information handled when you visit</h2>
          <p>
            The website is delivered through Firebase Hosting. Like most hosting
            services, Firebase Hosting processes incoming request information
            such as IP addresses to serve and protect the site. Google describes
            this processing and its retention in its{' '}
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Firebase privacy and security information
            </a>
            .
          </p>
        </section>
        <section>
          <h2>Fonts and external services</h2>
          <p>
            This site requests the Geist typeface from Google Fonts. That
            request may share technical connection details, including your IP
            address, with Google. You can read the{' '}
            <a
              href="https://fonts.google.com/faq/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Fonts privacy FAQ
            </a>
            . If you follow a social-media link, that service's privacy terms
            apply from that point onward.
          </p>
        </section>
        <section>
          <h2>When you contact us</h2>
          <p>
            If you choose to email Loom Care, the information in your message is
            handled by your email provider and the provider used by Loom Care.
            We use it to read and respond to your enquiry. Please do not send
            medical records or urgent health information by email.
          </p>
        </section>
        <section>
          <h2>Your choices</h2>
          <p>
            You can avoid the external font request by blocking it in your
            browser; the site will use a system font instead. You can also visit
            without following any social links or sending email. The light/dark
            preference is not saved after the page is closed or reloaded.
          </p>
        </section>
        <section>
          <h2>Contact and changes</h2>
          <p>
            For privacy questions, email{' '}
            <a href="mailto:hello@loom.care">hello@loom.care</a>. We may revise
            this notice as the website or Loom Care services evolve, and we will
            update the date shown above.
          </p>
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
            <a href="mailto:hello@loom.care">hello@loom.care</a>. We may revise
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
