import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const app = read('app.js');
function fn(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  const end = app.indexOf('\nfunction ', start + 1);
  return app.slice(start, end < 0 ? app.length : end);
}

function harness(member = 'mike') {
  const controls = new Map();
  const control = selector => {
    if (!controls.has(selector)) controls.set(selector, { value: '', checked: false, options: [{ value: 'any' }, { value: 'Oasis' }], scrollIntoView() {} });
    return controls.get(selector);
  };
  const html = read('index.html');
  const reset = () => {
    for (const [selector, element] of controls) {
      element.value = '';
      element.checked = false;
      const tag = html.match(new RegExp(`<input[^>]*id="${selector.slice(1)}"[^>]*>`))?.[0];
      element.checked = Boolean(tag && /\schecked(?:\s|>)/.test(tag));
    }
  };
  control('#finder-form').reset = reset;
  const classes = [{ value: 'Oasis', checked: true }];
  const ports = [{ value: 'Fort Lauderdale', checked: true }];
  const context = vm.createContext({
    document: { querySelector: control, querySelectorAll: selector => selector.includes('class') ? classes : ports },
    syncAboardDateControl() {}, setPortScope() {}, syncPortScopeAppearance() {}, updateAvailabilityControls() {}, renderFinder() {},
    selectedPorts: () => ports.filter(p => p.checked).map(p => p.value),
    selectedClasses: () => classes.filter(p => p.checked).map(p => p.value),
    parseLocalDate: value => new Date(`${value}T12:00:00`),
    effectiveFreePlay: offer => offer.fp || 0,
    cabinFirstValue: () => 0,
    bookingConflict: () => ({ type: 'overlap' }), opportunityScore: () => 0,
    orderedRooms: rooms => rooms,
    finderState: { selectedOffer: null }, bookings: [],
    ROOM_RANK: { Interior: 1, 'Ocean View': 2, Balcony: 3 }, SHIP_CLASS: { Oasis: 'Oasis' }, FINDER_PAGE_SIZE: 12
  });
  vm.runInContext(read('data/club-royale-data.js') + read('data/live-sailing-groups.js') + read('data/tully-data.js') + app.split('const FLORIDA_PORTS')[0] + `\nglobalThis.OFFERS=${member === 'tully' ? 'TULLY' : 'MIKE'}_OFFERS;globalThis.SAILINGS=expandRoyalSailingGroups(${member === 'tully' ? 'TULLY' : 'MIKE'}_ROYAL_SAILING_GROUPS);`, context);
  for (const name of ['syncManualFinderToggles', 'handleFinderChange', 'eligibleOfferRows', 'groupSailings', 'filterSailings', 'resetFinder', 'applySavedSearch']) vm.runInContext(fn(name), context);
  context.resetFinder();
  return { context, control, html };
}

test('initial markup and Reset never enable overlap hiding and clear stale date restrictions', () => {
  const { context, control, html } = harness();
  assert.doesNotMatch(html.match(/<input[^>]*id="exclude-conflicts"[^>]*>/)[0], /\schecked/);
  control('#exclude-conflicts').checked = true;
  control('#depart-start').value = '2027-06-18';
  control('#return-end').value = '2027-06-24';
  context.resetFinder();
  assert.equal(control('#exclude-conflicts').checked, false);
  assert.equal(control('#depart-start').value, '');
  assert.equal(control('#return-end').value, '');
});

test('December 4 Oasis 26TCR104 survives overlapping bookings', () => {
  const { context, control } = harness();
  control('#aboard-date').value = '2026-12-04';
  control('#ship-filter').value = 'Oasis';
  const groups = context.filterSailings();
  const match = groups.find(g => g.depart === '2026-12-04' && g.rows.some(r => r.offer === '26TCR104'));
  assert.ok(match);
  assert.equal(match.conflict.type, 'overlap');
  assert.equal(match.return, '2026-12-07');
  // Even stale UI state cannot suppress a better offer for a booked trip.
  control('#exclude-conflicts').checked = true;
  assert.equal(context.filterSailings().length, groups.length);
});

test('legacy saved search cannot restore overlap exclusion', () => {
  const { context, control } = harness();
  context.applySavedSearch({ ports: ['Fort Lauderdale'], classes: ['Oasis'], date: '2026-12-04', ship: 'Oasis', excludeConflicts: true });
  assert.equal(control('#exclude-conflicts').checked, false);
  assert.ok(context.filterSailings().some(g => g.rows.some(r => r.offer === '26TCR104')));
});

test('restrictive cabin filters still work intentionally', () => {
  const { context, control } = harness();
  control('#aboard-date').value = '2026-12-04';
  control('#ship-filter').value = 'Oasis';
  control('#room-filter').value = 'Balcony';
  assert.equal(context.filterSailings().filter(g => g.depart === '2026-12-04').length, 0);
});

for (const member of ['mike', 'tully']) {
  test(`${member}: dates and legacy saved searches cannot silently enable advanced checkboxes`, () => {
    const { context, control } = harness(member);
    const ids = ['weekend-only', 'duplicate-only', 'hide-sailed-ships', 'back-to-back-only'];
    // Simulate stale/browser-restored checkbox state before a date edit.
    ids.forEach(id => { control(`#${id}`).checked = true; });
    context.handleFinderChange({ target: { id: 'aboard-date' } });
    ids.forEach(id => assert.equal(control(`#${id}`).checked, false));
    context.applySavedSearch({ ports: ['Fort Lauderdale'], classes: ['Oasis'], ship: 'Oasis', weekendOnly: true, duplicateOnly: true, hideSailedShips: true, backToBackOnly: true });
    ids.forEach(id => assert.equal(control(`#${id}`).checked, false));
    context.bookings = [{ ship: 'Oasis' }];
    const baseline = context.filterSailings().length;
    assert.ok(baseline > 0);
    control('#hide-sailed-ships').checked = true;
    context.handleFinderChange({ target: { id: 'hide-sailed-ships', checked: true } });
    assert.equal(context.filterSailings().length, 0);
    context.handleFinderChange({ target: { id: 'aboard-date' } });
    assert.equal(control('#hide-sailed-ships').checked, true);
    context.resetFinder();
    ids.forEach(id => assert.equal(control(`#${id}`).checked, false));
    assert.equal(context.filterSailings().length, baseline);
  });
}
