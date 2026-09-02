import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react';
import { LoomLogo } from '@/components/loom-logo';

export type SitePage = 'home' | 'about' | 'privacy' | 'terms';

const navigation = [
  { label: 'Home', href: '/#top', page: 'home' },
  { label: 'About us', href: '/about/', page: 'about' },
  { label: 'Our care', href: '/#story' },
  { label: 'Contact', href: '#contact' },
];

export function SiteHeader({ page = 'home' }: { page?: SitePage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const reducedMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', darkMode ? '#11151e' : '#fbfaf7');
  }, [darkMode]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('pointerdown', closeOutside);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('pointerdown', closeOutside);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [menuOpen]);

  const themeButton = (
    <button
      type="button"
      className="theme-toggle"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setDarkMode((value) => !value)}
    >
      <motion.span
        key={darkMode ? 'sun' : 'moon'}
        initial={{ opacity: 0, rotate: -35, scale: 0.85 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
      >
        {darkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </motion.span>
    </button>
  );

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header
        ref={headerRef}
        className="topbar"
        onBlur={(event) => {
          if (
            event.relatedTarget &&
            !event.currentTarget.contains(event.relatedTarget as Node)
          )
            setMenuOpen(false);
        }}
      >
        <a href="/#top" className="brand" aria-label="Loom Care home">
          <LoomLogo size={26} color="var(--blue)" />
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.page === page ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <div className="desktop-theme-control">{themeButton}</div>
          <button
            ref={menuButtonRef}
            type="button"
            className="menu-button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="mobile-navigation"
              className="mobile-nav-panel"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={item.page === page ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                  <ArrowRight aria-hidden="true" />
                </a>
              ))}
              <div className="mobile-appearance">
                <div>
                  <span>Appearance</span>
                  <small>{darkMode ? 'Dark mode' : 'Light mode'}</small>
                </div>
                {themeButton}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact">
      <div className="footer-brand">
        <LoomLogo size={24} color="var(--ink)" />
        <p>
          Because independence and safety
          <br />
          should never be opposites.
        </p>
        <div className="footer-social-row">
          <a
            href="https://youtube.com/@loom_care?si=25QaRczVgHuFO8MV"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn youtube"
            aria-label="Loom Care on YouTube"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          <a
            href="https://x.com/Loom_Care"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn x"
            aria-label="Loom Care on X (Twitter)"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/loom_care?igsi=MXQwNjZsYjY4aGFleg=="
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn instagram"
            aria-label="Loom Care on Instagram"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <div>
          <b>Explore</b>
          <a href="/#top">Home</a>
          <a href="/#story">Our care</a>
          <a href="/#details">The pendant</a>
        </div>
        <div>
          <b>Company</b>
          <a href="/about/">About us</a>
          <a href="mailto:hello@loom.care">Contact</a>
        </div>
        <div>
          <b>Legal</b>
          <a href="/privacy/">Privacy policy</a>
          <a href="/terms/">Terms &amp; conditions</a>
        </div>
      </nav>
      <span className="footer-note">Made with care in India · © 2026</span>
    </footer>
  );
}
