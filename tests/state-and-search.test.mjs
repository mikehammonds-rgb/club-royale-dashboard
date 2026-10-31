import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
function sourceFunction(source, name) {
  const start = source.search(new RegExp(`(?:async )?function ${name}\\(`));
  assert.ok(start >= 0, name);
  const tail = source.slice(start);
  const next = tail.slice(1).search(/\n(?:async )?function /);
  return next < 0 ? tail : tail.slice(0, next + 1);
}

const serverState = (extra = {}) => ({ memberId: 'mike', bookings: [{ id: 'trip', notes: 'server note' }], savedSearches: [], offerStatuses: [], snapshots: [], ...extra });
const response = state => ({ ok: true, json: async () => state });
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

function stateHarness(fetch) {
  const stored = new Map();
  const renders = ['renderOfferLibrary', 'renderSavedSearches', 'renderTrips', 'renderOverviewPlanning', 'renderFinder', 'renderChangeCenter', 'updateMemberPresentation'];
  const c = vm.createContext({
    fetch, activeMemberId: 'mike', cloudAvailable: false, cloudSnapshots: [],
    bookings: [{ id: 'trip', notes: 'local note' }], savedSearches: [{ id: 'saved', name: 'Mine' }],
    offerStatuses: { 'A-1': { status: 'Used' } }, memberStateRevisions: new Map(), hydrationRequestSequence: 0,
    localStorage: { setItem: (key, value) => stored.set(key, value) },
    memberStorageKey: key => `${key}-${c.activeMemberId}`,
    BOOKING_STORAGE_KEY: 'bookings', SAVED_SEARCH_STORAGE_KEY: 'searches', OFFER_STATUS_STORAGE_KEY: 'statuses',
    ...Object.fromEntries(renders.map(name => [name, () => {}]))
  });
  for (const name of ['stateRevisions', 'cloudRequest', 'hydrateCloudState']) vm.runInContext(sourceFunction(app, name), c);
  return { c, stored };
}

test('database fallback is marked local-only and preserves all local state', async () => {
  const route = readFileSync(new URL('../app/api/state/route.ts', import.meta.url), 'utf8');
  const localState = sourceFunction(route, 'localState').replace('memberId: string, request: Request', 'memberId, request');
  const api = vm.createContext({ Response, seedProfiles: [], seedBookings: [{ id: 'trip', notes: 'seed note' }] });
  vm.runInContext(localState, api);
  const state = await api.localState('mike', new Request('https://example.test/api/state')).json();
  assert.equal(state.localOnly, true);
  const { c, stored } = stateHarness(async () => response(state));
  await c.hydrateCloudState();
  assert.equal(c.bookings[0].notes, 'local note');
  assert.equal(c.savedSearches[0].id, 'saved');
  assert.equal(c.offerStatuses['A-1'].status, 'Used');
  assert.equal(c.cloudAvailable, false);
  assert.equal(stored.size, 0);
});

for (const [action, section, field, localValue] of [
  ['save_booking', 'bookings', 'notes', 'edited note'],
  ['save_searches', 'savedSearches', 'name', 'new search'],
  ['save_status', 'offerStatuses', 'status', 'Booked']
]) {
  test(`delayed hydration preserves ${section} edited during loading`, async () => {
    const get = deferred();
    const { c, stored } = stateHarness(async (_url, options) => options.method === 'POST' ? response({ ok: true }) : get.promise);
    const hydration = c.hydrateCloudState();
    if (section === 'offerStatuses') c.offerStatuses['A-1'][field] = localValue;
    else c[section][0][field] = localValue;
    await c.cloudRequest({ action });
    get.resolve(response(serverState()));
    await hydration;
    assert.equal(section === 'offerStatuses' ? c.offerStatuses['A-1'][field] : c[section][0][field], localValue);
    assert.ok(stored.get(`${section === 'savedSearches' ? 'searches' : section === 'offerStatuses' ? 'statuses' : 'bookings'}-mike`).includes(localValue));
    if (section !== 'bookings') assert.equal(c.bookings[0].notes, 'server note');
  });
}

test('only the latest hydration for a member can apply its response', async () => {
  const first = deferred(); const second = deferred(); let calls = 0;
  const { c } = stateHarness(() => ++calls === 1 ? first.promise : second.promise);
  const oldLoad = c.hydrateCloudState(); const newLoad = c.hydrateCloudState();
  second.resolve(response(serverState({ bookings: [{ id: 'trip', notes: 'newest' }] })));
  await newLoad;
  first.resolve(response(serverState())); await oldLoad;
  assert.equal(c.bookings[0].notes, 'newest');
});

test('member switch prevents a late response from changing another member', async () => {
  const get = deferred(); const { c, stored } = stateHarness(() => get.promise);
  const hydration = c.hydrateCloudState(); c.activeMemberId = 'tully';
  c.bookings = []; get.resolve(response(serverState())); await hydration;
  assert.equal(c.bookings.length, 0); assert.equal(stored.size, 0);
});

test('invalid JSON, HTTP errors and error payloads return null and clear availability', async () => {
  for (const result of [
    { ok: true, json: async () => { throw new SyntaxError('bad JSON'); } },
    { ok: false }, response(null), response([]), response({ ok: false })
  ]) {
    const { c } = stateHarness(async () => result); c.cloudAvailable = true;
    assert.equal(await c.cloudRequest(), null); assert.equal(c.cloudAvailable, false);
  }
});

test('successful cloud hydration still populates state and local cache', async () => {
  const { c, stored } = stateHarness(async () => response(serverState()));
  await c.hydrateCloudState();
  assert.equal(c.bookings[0].notes, 'server note'); assert.equal(c.savedSearches.length, 0);
  assert.equal(c.cloudAvailable, true); assert.equal(stored.size, 3);
});

function searchHarness() {
  const row = { offer: 'A', ship: 'Oasis', port: 'Miami', itin: '3 Night Bahamas', nights: 3, room: 'Balcony', depart: '2026-12-07', return: '2026-12-10' };
  const c = vm.createContext({
    SAILINGS: [row], OFFERS: { A: { uses: 1, fp: 50 }, B: { uses: 2, fp: 0 } },
    bookings: [], SHIP_CLASS: { Oasis: 'Oasis' }, ROOM_RANK: { Interior: 1, 'Ocean View': 2, Balcony: 3 },
    effectiveFreePlay: offer => offer.fp
  });
  for (const name of ['parseLocalDate', 'rangesOverlap', 'bookingConflict', 'searchMatchesRow', 'savedSearchMatchCount']) vm.runInContext(sourceFunction(app, name), c);
  return { c, row };
}

test('saved-search counts enforce weekend, duplicate, booked-ship and offer filters', () => {
  const { c, row } = searchHarness();
  assert.equal(c.savedSearchMatchCount({}), 1);
  assert.equal(c.savedSearchMatchCount({ weekendOnly: true }), 0);
  assert.equal(c.savedSearchMatchCount({ duplicateOnly: true }), 0);
  assert.equal(c.savedSearchMatchCount({ offer: 'B' }), 0);
  c.bookings = [{ ship: 'Oasis', depart: '2026-11-01', return: '2026-11-04' }];
  assert.equal(c.savedSearchMatchCount({ hideSailedShips: true }), 0);
  row.depart = '2026-12-04'; row.return = '2026-12-07'; row.offer = 'B';
  assert.equal(c.savedSearchMatchCount({ weekendOnly: true, duplicateOnly: true, offer: 'B' }), 1);
});

test('back-to-back counts use actual booking conflicts and deduplicate like Finder', () => {
  const { c, row } = searchHarness();
  assert.equal(c.savedSearchMatchCount({ backToBackOnly: true }), 0);
  c.bookings = [{ ship: 'Wonder', depart: '2026-12-04', return: '2026-12-07' }];
  assert.equal(c.savedSearchMatchCount({ backToBackOnly: true }), 1);
  c.SAILINGS.push({ ...row, offer: 'B' }); assert.equal(c.savedSearchMatchCount({}), 1);
  c.SAILINGS.push({ ...row, port: 'Tampa' }); assert.equal(c.savedSearchMatchCount({}), 2);
  c.bookings[0].return = '2026-12-09'; assert.equal(c.savedSearchMatchCount({ backToBackOnly: true }), 0);
});
