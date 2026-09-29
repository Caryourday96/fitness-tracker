import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the shipped base wiring against mounted Today and hidden History
// cards. Browser verification covers the subsequent focus/timer/recap wrappers.
const source = readFileSync(new URL('./public/app.js', import.meta.url), 'utf8');
const wiring = source.slice(source.indexOf('function wireToday(){'), source.indexOf('\nfunction onboarding(){'));
function element() {
  return { children: [], append(...children) { this.children.push(...children); } };
}
function fixture(state, today) {
  const history = element();
  const document = {
    createElement: element,
    querySelectorAll(selector) {
      if (selector.endsWith('.exercise')) return selector.startsWith('#view-today ') ? today : [...today, history];
      return [];
    },
  };
  const wire = runInNewContext(`${wiring}\nwireToday`, { document, state, $: () => null });
  return { wire, history };
}

test('Today wiring ignores mounted History cards across repeated returns with saved strength and cardio', () => {
  const state = {
    profile: { units: 'lb' },
    plan: { exercises: [{ pattern: 'strength' }, { pattern: 'cardio' }] },
    workout: { exercises: [
      { sets: [{ id: 'strength', weight: 20, unit: 'lb', reps: 8 }] },
      { sets: [{ id: 'cardio', duration: 15, distance: 0.8, distanceUnit: 'mi' }] },
    ] },
  };
  const saved = JSON.stringify(state);
  for (let visit = 0; visit < 3; visit++) {
    const today = [element(), element()];
    const { wire, history } = fixture(state, today);
    assert.doesNotThrow(wire);
    assert.equal(history.children.length, 0, 'History is read-only to Today wiring');
    assert.match(today[0].children[1].children[0].textContent, /20 lb × 8/);
    assert.match(today[1].children[1].children[0].textContent, /15 min.*0.8 mi/);
    assert.equal(today[0].children[1].children[0].children[0].textContent, 'Edit');
    assert.equal(JSON.stringify(state), saved, 'Rendering never rewrites saved records');
  }
});

test('Today with no plan does not read a hidden History card as a planned exercise', () => {
  const { wire, history } = fixture({ profile: { units: 'kg' }, plan: null, workout: null }, []);
  assert.doesNotThrow(wire);
  assert.equal(history.children.length, 0);
});
