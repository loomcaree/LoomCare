import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const js = ts.transpileModule(
  readFileSync('lib/section-navigation.ts', 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const { nextSectionIndex, installSectionNavigation } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
);

assert.equal(nextSectionIndex([], 0, 1), -1);
assert.equal(nextSectionIndex([0, 800, 2880, 3680], 800, 1), 2);
assert.equal(nextSectionIndex([0, 800, 2880, 3680], 1500, -1), 0);
assert.equal(nextSectionIndex([0, 800], 0, -1), 0);
assert.equal(nextSectionIndex([0, 800], 800, 1), 1);

function fixture({ reduced = false, modal = false, footerHeight = null } = {}) {
  let now = 0;
  let sequence = 0;
  const frames = new Map();
  const listeners = new Map();
  const offsets = [0, 800, 1600, 3680, 4480];
  const win = {
    scrollY: 0,
    innerHeight: 800,
    document: {
      documentElement: {
        scrollHeight: footerHeight === null ? 5280 : 4480 + footerHeight,
      },
      querySelector: () => (modal ? {} : null),
    },
    performance: { now: () => now },
    matchMedia: () => ({ matches: reduced }),
    scrollTo: ({ top }) => {
      win.scrollY = top;
    },
    requestAnimationFrame: (fn) => {
      frames.set(++sequence, fn);
      return sequence;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  const root = {
    querySelectorAll: () =>
      offsets.map((top, index) => ({
        getBoundingClientRect: () => ({ top: top - win.scrollY }),
        getAttribute: () =>
          footerHeight !== null && index === offsets.length - 1 ? 'end' : '',
      })),
  };
  const dispose = installSectionNavigation(root, win);
  return {
    win,
    frames,
    listeners,
    dispose,
    key(key, overrides = {}, interactive = false) {
      let prevented = false;
      const event = {
        key,
        repeat: false,
        defaultPrevented: false,
        composedPath: () => [{ closest: () => (interactive ? {} : null) }],
        preventDefault: () => {
          prevented = true;
        },
        ...overrides,
      };
      listeners.get('keydown')(event);
      return prevented;
    },
    tick(ms = 900) {
      now += ms;
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((fn) => fn(now));
    },
  };
}

const normal = fixture();
assert(normal.key('ArrowDown'));
normal.tick();
assert.equal(normal.win.scrollY, 800);
normal.key('ArrowDown');
normal.tick();
assert.equal(normal.win.scrollY, 1600);
normal.key('ArrowDown');
normal.tick();
assert.equal(
  normal.win.scrollY,
  3680,
  'Skip to the next section, not a fixed pixel step',
);
normal.key('ArrowUp');
normal.tick();
assert.equal(normal.win.scrollY, 1600);
normal.win.scrollY = 2200;
normal.key('ArrowUp');
normal.tick();
assert.equal(
  normal.win.scrollY,
  800,
  'Manual scrolling resets the current section',
);

const rapid = fixture();
rapid.key('ArrowDown');
rapid.key('ArrowDown');
rapid.tick();
assert.equal(rapid.win.scrollY, 1600, 'Two discrete taps advance two sections');
rapid.key('ArrowDown');
rapid.key('ArrowUp');
rapid.tick();
assert.equal(
  rapid.win.scrollY,
  1600,
  'Reversing during animation cancels the previous destination',
);

const held = fixture();
held.key('ArrowDown');
held.key('ArrowDown', { repeat: true });
held.tick();
assert.equal(held.win.scrollY, 800, 'Held keys do not race through chapters');

for (const name of ['wheel', 'touchstart', 'pointerdown', 'resize']) {
  const test = fixture();
  test.key('ArrowDown');
  test.tick(300);
  const interrupted = test.win.scrollY;
  test.listeners.get(name)();
  test.tick();
  assert.equal(test.win.scrollY, interrupted, `${name} cancels animation`);
}
for (const flags of [
  { ctrlKey: true },
  { altKey: true },
  { metaKey: true },
  { shiftKey: true },
  { defaultPrevented: true },
]) {
  const test = fixture();
  assert.equal(test.key('ArrowDown', flags), false);
  assert.equal(test.frames.size, 0);
}
const controls = fixture();
assert.equal(controls.key('ArrowDown', {}, true), false);
assert.equal(controls.key('PageDown'), false);
assert.equal(fixture({ modal: true }).key('ArrowDown'), false);
const accessible = fixture({ reduced: true });
accessible.key('ArrowDown');
assert.equal(accessible.win.scrollY, 800);
assert.equal(accessible.frames.size, 0);
const cleanup = fixture();
cleanup.key('ArrowDown');
cleanup.dispose();
assert.equal(cleanup.frames.size, 0);
assert.equal(cleanup.listeners.size, 0);

for (const footerHeight of [380, 1200]) {
  const page = fixture({ footerHeight });
  page.win.scrollY = 3680;
  page.key('ArrowDown');
  page.tick();
  const bottom =
    page.win.document.documentElement.scrollHeight - page.win.innerHeight;
  assert.equal(
    page.win.scrollY,
    bottom,
    'Final Down must touch the document bottom',
  );
  page.key('ArrowDown');
  page.tick();
  assert.equal(
    page.win.scrollY,
    bottom,
    'Repeated Down at the end must not overscroll',
  );
  page.key('ArrowUp');
  page.tick();
  assert.equal(
    page.win.scrollY,
    3680,
    'Up from the footer returns to the company section',
  );
  if (footerHeight > page.win.innerHeight) {
    page.win.scrollY = 4540;
    page.key('ArrowUp');
    page.tick();
    assert.equal(
      page.win.scrollY,
      3680,
      'Partially scrolling a tall footer must not skip the company section',
    );
  }
  page.win.innerHeight = 600;
  page.key('ArrowDown');
  page.tick();
  assert.equal(
    page.win.scrollY,
    page.win.document.documentElement.scrollHeight - 600,
    'Bottom destination follows viewport resize',
  );
}
console.log(
  'Section destinations, compact/tall footer bottom edges, reverse/rapid/held keys, controls, modal guards, reduced motion, interruption and cleanup passed.',
);
