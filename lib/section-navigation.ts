const INTERACTIVE =
  'a, button, input, textarea, select, summary, audio, video, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="slider"], [role="spinbutton"], [role="listbox"], [role="combobox"], [role="menu"], [role="tablist"], [role="tree"], [role="grid"], [data-section-navigation-ignore]';

export function nextSectionIndex(
  stops: number[],
  position: number,
  direction: 1 | -1,
): number {
  if (!stops.length) return -1;
  let current = 0;
  for (let index = 0; index < stops.length; index++) {
    if (stops[index] <= position + 2) current = index;
    else break;
  }
  return Math.max(0, Math.min(stops.length - 1, current + direction));
}

/** Home-page enhancement only. Never changes wheel/touch scrolling or URL history. */
export function installSectionNavigation(
  root: HTMLElement,
  win: Window = window,
) {
  let frame = 0;
  let intendedPosition: number | null = null;

  const cancel = () => {
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    intendedPosition = null;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const direction =
      event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (!direction) {
      cancel();
      return;
    }
    const target = event.composedPath()[0] as Element | undefined;
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      target?.closest?.(INTERACTIVE) ||
      win.document.querySelector(
        '.mobile-nav-panel, dialog[open], [aria-modal="true"]',
      )
    ) {
      cancel();
      return;
    }
    const sections = Array.from(
      root.querySelectorAll<HTMLElement>('[data-scroll-section]'),
    );
    const maxScroll = Math.max(
      0,
      win.document.documentElement.scrollHeight - win.innerHeight,
    );
    const positions = sections.map(
      (section) => section.getBoundingClientRect().top + win.scrollY,
    );
    const endsAtBottom =
      sections.at(-1)?.getAttribute('data-scroll-section') === 'end';
    const stops = positions.map((position, index) =>
      endsAtBottom && index === positions.length - 1
        ? maxScroll
        : Math.max(0, Math.min(maxScroll, position)),
    );
    if (!stops.length) return;
    event.preventDefault();
    // A held key must not race through the entire story.
    if (event.repeat) return;
    // Distinct rapid taps advance from the requested destination, not an in-flight frame.
    const currentPosition = intendedPosition ?? win.scrollY;
    // A long mobile footer may be partially scrolled: Up still returns to
    // the preceding section rather than accidentally skipping it.
    const insideFooter =
      endsAtBottom &&
      currentPosition >=
        Math.min(maxScroll, positions[positions.length - 1]) - 2;
    const index =
      direction === -1 && insideFooter
        ? Math.max(0, stops.length - 2)
        : nextSectionIndex(stops, currentPosition, direction);
    const destination = stops[index];
    const start = win.scrollY;
    cancel();
    if (Math.abs(destination - start) < 2) return;
    if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      win.scrollTo({ top: destination, behavior: 'instant' });
      return;
    }
    intendedPosition = destination;
    const startedAt = win.performance.now();
    const duration = 800;
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased =
        progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      win.scrollTo({
        top: start + (destination - start) * eased,
        behavior: 'instant',
      });
      if (progress < 1) frame = win.requestAnimationFrame(step);
      else {
        frame = 0;
        intendedPosition = null;
      }
    };
    frame = win.requestAnimationFrame(step);
  };

  win.addEventListener('keydown', onKeyDown);
  win.addEventListener('wheel', cancel, { passive: true });
  win.addEventListener('touchstart', cancel, { passive: true });
  win.addEventListener('pointerdown', cancel, { passive: true });
  win.addEventListener('resize', cancel);
  return () => {
    cancel();
    win.removeEventListener('keydown', onKeyDown);
    win.removeEventListener('wheel', cancel);
    win.removeEventListener('touchstart', cancel);
    win.removeEventListener('pointerdown', cancel);
    win.removeEventListener('resize', cancel);
  };
}
