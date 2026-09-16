function addDaysToIso(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function expandRoyalSailingGroups(groups) {
  const monthNumbers = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  const expanded = [];
  const seen = new Set();

  groups.forEach(group => {
    let year = null;
    let month = null;
    const nights = Number((group.itin.match(/(\d+)\s+Night/i) || [])[1]);
    if (!nights || !group.room) return;

    group.dates.forEach(line => {
      if (/^\d{4}$/.test(line)) {
        year = Number(line);
        return;
      }
      if (!year) return;
      line.split(",").forEach(value => {
        const match = value.trim().match(/^(?:([A-Za-z]{3})\s+)?(\d{1,2})$/);
        if (!match) return;
        if (match[1] && monthNumbers[match[1]]) month = monthNumbers[match[1]];
        const day = Number(match[2]);
        if (!month || !day) return;
        const depart = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const ship = group.ship.replace(/\s+of the Seas$/i, "");
        const key = [group.offer, ship, group.port, group.itin, group.room, depart].join("|");
        if (seen.has(key)) return;
        seen.add(key);
        expanded.push({
          offer: group.offer,
          ship,
          port: group.port,
          itin: group.itin,
          nights,
          room: group.room,
          depart,
          return: addDaysToIso(depart, nights),
          link: group.link
        });
      });
    });
  });

  return expanded.sort((a, b) => a.depart.localeCompare(b.depart) || a.ship.localeCompare(b.ship));
}

const FLORIDA_PORTS = ["Miami", "Fort Lauderdale", "Orlando (Port Canaveral)", "Tampa"];
let activeMemberId = DEFAULT_CLUB_ROYALE_MEMBER_ID;
let ACTIVE_MEMBER;
let PROFILE;
let LAST_PORTAL_CHECK;
let OFFERS;
let SAILINGS;
let ALL_ELIGIBLE_PORTS;
let RETURNED_OFFERS;

function activateMemberData(memberId) {
  activeMemberId = CLUB_ROYALE_MEMBERS[memberId] ? memberId : DEFAULT_CLUB_ROYALE_MEMBER_ID;
  ACTIVE_MEMBER = CLUB_ROYALE_MEMBERS[activeMemberId];
  PROFILE = ACTIVE_MEMBER;
  LAST_PORTAL_CHECK = ACTIVE_MEMBER.portalCheck;
  OFFERS = ACTIVE_MEMBER.offers;
  SAILINGS = expandRoyalSailingGroups(ACTIVE_MEMBER.sailingGroups).filter(sailing => OFFERS[sailing.offer]?.comp !== false);
  ALL_ELIGIBLE_PORTS = [...new Set(SAILINGS.map(sailing => sailing.port))].sort();
  RETURNED_OFFERS = new Set(ACTIVE_MEMBER.returnedOffers || []);
}

activateMemberData(activeMemberId);

const ROOM_RANK = { "Interior": 1, "Ocean View": 2, "Balcony": 3 };
const SHIP_CLASS = {
  Oasis: "Oasis", Allure: "Oasis", Harmony: "Oasis", Wonder: "Oasis", Utopia: "Oasis", Symphony: "Oasis",
  Icon: "Icon", Star: "Icon", Legend: "Icon",
  Quantum: "Quantum", Anthem: "Quantum", Ovation: "Quantum", Spectrum: "Quantum", Odyssey: "Quantum",
  Freedom: "Freedom", Liberty: "Freedom", Independence: "Freedom",
  Adventure: "Voyager", Explorer: "Voyager", Voyager: "Voyager", Navigator: "Voyager", Mariner: "Voyager",
  Brilliance: "Radiance", Radiance: "Radiance", Serenade: "Radiance", Jewel: "Radiance",
  Enchantment: "Vision", Grandeur: "Vision", Rhapsody: "Vision", Vision: "Vision"
};
const FINDER_PAGE_SIZE = 12;
const SAVED_SEARCH_STORAGE_KEY = "club-royale-saved-searches-v1";
const OFFER_STATUS_STORAGE_KEY = "club-royale-offer-statuses-v1";
const BOOKING_STORAGE_KEY = "club-royale-bookings-v1";
const OFFER_STATUS_OPTIONS = ["Available", "Planning", "Booked", "Used", "Returned", "Expired"];

const finderState = {
  limit: FINDER_PAGE_SIZE,
  selectedOffer: null,
  groups: [],
  compareKeys: new Set(),
  calendarMonth: "2026-11"
};

function loadJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function memberStorageKey(baseKey) {
  return `${baseKey}-${activeMemberId}`;
}

function loadMemberJson(baseKey, fallback) {
  const memberValue = loadJson(memberStorageKey(baseKey), null);
  if (memberValue !== null) return memberValue;
  return activeMemberId === DEFAULT_CLUB_ROYALE_MEMBER_ID ? loadJson(baseKey, fallback) : fallback;
}

let bookings = loadMemberJson(BOOKING_STORAGE_KEY, ACTIVE_MEMBER.seedBookings.map(cruise => ({ ...cruise, completed: [] })));
let offerStatuses = loadMemberJson(OFFER_STATUS_STORAGE_KEY, {});
let cloudAvailable = false;
let cloudSnapshots = [];

async function cloudRequest(body) {
  try {
    const memberId = activeMemberId;
    const response = await fetch(`/api/state?member=${encodeURIComponent(memberId)}`, body ? {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, memberId })
    } : { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error("Cloud state unavailable");
    cloudAvailable = true;
    return response.json();
  } catch {
    cloudAvailable = false;
    return null;
  }
}

function loadSavedSearches() {
  try {
    const current = localStorage.getItem(memberStorageKey(SAVED_SEARCH_STORAGE_KEY));
    const legacy = activeMemberId === DEFAULT_CLUB_ROYALE_MEMBER_ID ? localStorage.getItem(SAVED_SEARCH_STORAGE_KEY) : null;
    const stored = JSON.parse(current || legacy || "[]");
    return Array.isArray(stored) ? stored.filter(search => search && search.id && search.name && Array.isArray(search.ports) && Array.isArray(search.classes)).slice(0, 12) : [];
  } catch {
    return [];
  }
}

let savedSearches = loadSavedSearches();

function parseLocalDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysUntil(iso) {
  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((parseLocalDate(iso) - current) / 86400000);
}

function formatDate(iso, options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", options).format(parseLocalDate(iso));
}

function formatLongDate(iso) {
  return formatDate(iso, { month: "short", day: "numeric", year: "numeric" });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
  })[character]);
}

function updateMemberPresentation() {
  const checkedDate = formatDate(PROFILE.snapshot, { month: "short", day: "numeric" });
  const longHeadingDate = formatDate(PROFILE.snapshot, { weekday: "long", month: "long", day: "numeric" });
  const slots = Object.values(OFFERS).reduce((total, offer) => total + offer.uses, 0);
  const nonComp = Object.values(OFFERS).filter(offer => offer.comp === false).length;
  document.querySelector("#member-select").value = activeMemberId;
  document.querySelector("#header-member-name").textContent = `${PROFILE.displayName} · Casino tier`;
  document.querySelector("#header-member-tier").textContent = PROFILE.tier;
  document.querySelector("#overview-date").textContent = longHeadingDate;
  document.querySelector("#verified-date").textContent = `Verified ${checkedDate}`;
  document.querySelector("#offers-page-copy").textContent = `All ${slots} ${PROFILE.displayName} account offers appear here. Finder filters never change this list.`;
  document.querySelector("#offer-toolbar-copy").textContent = `${slots} offer ${slots === 1 ? "entry" : "entries"} · ${Object.values(OFFERS).filter(offer => offer.uses > 1).length ? "duplicates are separate redemptions" : "each offer has one redemption"}`;
  document.querySelector("#confirmed-count").textContent = `${bookings.length} confirmed`;
  document.querySelector("#trips-page-copy").textContent = bookings.length ? `${PROFILE.displayName}'s confirmed casino cruises and trip-prep details.` : `No booked cruises have been added for ${PROFILE.displayName} yet.`;
  document.querySelector("#profile-title").textContent = `${PROFILE.displayName} · ${PROFILE.tier} member`;
  document.querySelector("#tier-progress-bar").style.width = `${PROFILE.progressPercent}%`;
  document.querySelector("#tier-credit-count").textContent = `${PROFILE.tierCredits.toLocaleString()} tier credits`;
  document.querySelector("#tier-credit-message").textContent = PROFILE.tierMessage;
  document.querySelector("#masked-number").textContent = `••••••${PROFILE.memberNumber.slice(-3)}`;
  document.querySelector("#reveal-number").textContent = "Show";
  document.querySelector(".sync-status strong").textContent = `Last verified ${formatLongDate(PROFILE.snapshot)}`;
  document.querySelector(".sync-status small").textContent = `${LAST_PORTAL_CHECK.uniqueOffers} unique codes · ${LAST_PORTAL_CHECK.usableSlots} usable offer slots · ${LAST_PORTAL_CHECK.sailingRows.toLocaleString()} dated comp rows${nonComp ? ` · ${nonComp} FreePlay-only offer excluded from Finder` : ""}`;
  document.querySelector(".history-date").textContent = `Since ${formatLongDate(PROFILE.snapshot)}`;
  document.querySelector("#history-title").textContent = `${PROFILE.displayName}'s baseline is saved`;
}

function effectiveFreePlay(offer) {
  if (offer.fp) return offer.fp;
  const match = offer.perk && offer.perk.match(/\$([\d,]+)\s*FreePlay/i);
  return match ? Number(match[1].replace(",", "")) : 0;
}

function offerSailings(code) {
  return SAILINGS.filter(sailing => sailing.offer === code);
}

function orderedRooms(rooms) {
  return [...new Set(rooms.filter(Boolean))]
    .sort((a, b) => (ROOM_RANK[b] || 0) - (ROOM_RANK[a] || 0));
}

function offerRooms(code) {
  return orderedRooms([
    ...(OFFERS[code]?.cabinOptions || []),
    ...offerSailings(code).map(sailing => sailing.room)
  ]);
}

function bestRoom(code) {
  return offerRooms(code)[0] || null;
}

function cabinFirstValue(room, offer) {
  return (ROOM_RANK[room] || 0) * 10000 + effectiveFreePlay(offer);
}

function allOffers() {
  return Object.entries(OFFERS).map(([code, offer]) => {
    const sailings = offerSailings(code);
    const rooms = offerRooms(code);
    const room = rooms[0] || null;
    return {
      code,
      ...offer,
      sailings,
      room,
      rooms,
      freePlay: effectiveFreePlay(offer),
      days: daysUntil(offer.redeemBy),
      matching: sailings.length > 0,
      value: cabinFirstValue(room, offer)
    };
  });
}

function allOfferSlots() {
  return allOffers().flatMap(offer => Array.from({ length: offer.uses }, (_, index) => ({
    ...offer,
    useIndex: index + 1,
    totalUses: offer.uses,
    slotKey: `${offer.code}-${index + 1}`
  })));
}

function slotStatus(slotKey, fallback = "Available") {
  const savedStatus = offerStatuses[slotKey]?.status;
  if (savedStatus) return savedStatus;
  const match = slotKey.match(/^(.*)-(\d+)$/);
  if (match) {
    const bookedUses = bookings.filter(booking => booking.offer === match[1]).length;
    if (bookedUses >= Number(match[2])) return "Booked";
  }
  return fallback;
}

function isSlotAvailable(slotKey) {
  return !["Booked", "Used", "Expired"].includes(slotStatus(slotKey));
}

function availableUses(code) {
  const total = OFFERS[code]?.uses || 0;
  return Array.from({ length: total }, (_, index) => `${code}-${index + 1}`).filter(isSlotAvailable).length;
}

function renderChangeCenter() {
  const latest = cloudSnapshots[0];
  const checkedAt = latest?.snapshot_date || PROFILE.snapshot;
  const sameCount = LAST_PORTAL_CHECK.usableSlots === allOfferSlots().length;
  document.querySelector("#change-summary").innerHTML = `<span class="reconcile-light ${sameCount ? "is-clear" : "is-warning"}"></span><div><strong>${sameCount ? "Everything matches." : "Review needed."}</strong><p>Royal Caribbean portal ${LAST_PORTAL_CHECK.usableSlots} · dashboard ${allOfferSlots().length} · checked ${formatLongDate(checkedAt)}</p></div><b>${sameCount ? "No changes" : "Count mismatch"}</b>`;
  const changes = [
    ["New offers", LAST_PORTAL_CHECK.newCodes.length, LAST_PORTAL_CHECK.newCodes.length ? LAST_PORTAL_CHECK.newCodes.join(", ") : "None since the prior check", "✦"],
    ["Additional copies", LAST_PORTAL_CHECK.duplicateCodes.length, LAST_PORTAL_CHECK.duplicateCodes.length ? `${LAST_PORTAL_CHECK.duplicateCodes.length} offer code${LAST_PORTAL_CHECK.duplicateCodes.length === 1 ? " has" : "s have"} multiple uses` : "No duplicated offer codes in this profile", "Ⅱ"],
    ["Changed offers", LAST_PORTAL_CHECK.changedCodes.length, LAST_PORTAL_CHECK.changedCodes.length ? LAST_PORTAL_CHECK.changedCodes.join(", ") : "No deadline or benefit changes", "↻"],
    ["Removed offers", LAST_PORTAL_CHECK.removedCodes.length, LAST_PORTAL_CHECK.removedCodes.length ? LAST_PORTAL_CHECK.removedCodes.join(", ") : "Nothing disappeared", "−"]
  ];
  document.querySelector("#change-grid").innerHTML = changes.map(([label, count, note, icon]) => `<article><span>${icon}</span><div><strong>${count}</strong><small>${label}</small><p>${escapeHtml(note)}</p></div></article>`).join("");
}

function renderSlotLedger() {
  const statuses = allOfferSlots().reduce((totals, slot) => {
    const status = slotStatus(slot.slotKey, slot.days < 0 ? "Expired" : "Available");
    totals[status] = (totals[status] || 0) + 1;
    return totals;
  }, {});
  const available = allOfferSlots().filter(slot => isSlotAvailable(slot.slotKey) && slot.days >= 0).length;
  document.querySelector("#slot-ledger-grid").innerHTML = [
    [available, "Available now", "Ready to redeem"],
    [statuses.Planning || 0, "Planning", "Cruises under consideration"],
    [statuses.Booked || 0, "Booked", "Redemption copies committed"],
    [(statuses.Used || 0) + (statuses.Expired || 0), "Closed", "Used or expired copies"]
  ].map(([value, label, note]) => `<article><strong>${value}</strong><span>${label}</span><small>${note}</small></article>`).join("");
}

function deadlineText(offer) {
  if (offer.days < 0) return "Expired";
  if (offer.days === 0) return "Redeem today";
  if (offer.days <= 14) return `${offer.days} day${offer.days === 1 ? "" : "s"} left`;
  return `By ${formatDate(offer.redeemBy)}`;
}

function renderPriority() {
  const priority = allOffers()
    .filter(offer => offer.days >= 0 && offer.matching)
    .sort((a, b) => a.days - b.days || b.value - a.value)[0];
  const ships = new Set(priority.sailings.map(sailing => sailing.ship)).size;

  document.querySelector("#priority-code").textContent = `${priority.code} · ${priority.name}`;
  document.querySelector("#priority-title").textContent = priority.rooms.length > 1
    ? `${priority.rooms.length} cabin categories across this offer`
    : priority.room ? `${priority.room} opportunity` : "A time-sensitive escape";
  document.querySelector("#priority-benefit").textContent = priority.benefit;
  document.querySelector("#priority-countdown").textContent = deadlineText(priority);
  document.querySelector("#priority-stats").innerHTML = `
    <div><strong>${priority.sailings.length}</strong><span>Sailings</span></div>
    <div><strong>${ships}</strong><span>Ships</span></div>
    <div><strong>${priority.freePlay ? `$${priority.freePlay}` : "Included"}</strong><span>${priority.freePlay ? "Free Play" : "Room"}</span></div>`;
}

function renderMetrics() {
  const offers = allOffers();
  const offerSlots = offers.reduce((total, offer) => total + offer.uses, 0);
  const soon = offers.filter(offer => offer.days >= 0 && offer.days <= 14).length;
  document.querySelector("#offer-count").textContent = offerSlots;
  document.querySelector("#unique-offer-count").textContent = `${offers.length} unique codes · ${offers.filter(offer => offer.uses > 1).length} usable twice`;
  document.querySelector("#sailing-count").textContent = SAILINGS.length;
  document.querySelector("#expiring-count").textContent = soon;
}

function renderOfferPreview() {
  const offers = allOffers()
    .filter(offer => offer.matching)
    .sort((a, b) => b.value - a.value || a.redeemBy.localeCompare(b.redeemBy))
    .slice(0, 3);

  document.querySelector("#offer-preview-grid").innerHTML = offers.map(offer => `
    <article class="offer-preview">
      <div class="offer-preview-top">
        <div><h3>${escapeHtml(offer.name)}</h3><span class="code">${offer.code}</span></div>
        <span class="deadline">${deadlineText(offer)}</span>
      </div>
      <p>${escapeHtml(offer.benefit)}</p>
      <div class="mini-tags">
        ${offer.rooms.map(room => `<span class="mini-tag">${room}</span>`).join("")}
        <span class="mini-tag">${offer.sailings.length} sailings</span>
        ${offer.freePlay ? `<span class="mini-tag">+$${offer.freePlay} Free Play</span>` : ""}
      </div>
    </article>`).join("");
}

function renderUrgentRibbon() {
  const urgent = allOffers().filter(offer => offer.days >= 0 && offer.days <= 7);
  document.querySelector("#urgent-ribbon").innerHTML = `
    <span class="urgent-icon" aria-hidden="true">⌛</span>
    <div><strong>${urgent.length} offer${urgent.length === 1 ? "" : "s"} need attention this week.</strong><br>
    ${urgent.length ? urgent.map(offer => `${offer.code} ${deadlineText(offer).toLowerCase()}`).join(" · ") : "No redemption deadlines fall within the next seven days."}</div>`;
}

function offerCard(offer) {
  const status = offerStatuses[offer.slotKey]?.status || (offer.days < 0 ? "Expired" : "Available");
  const remaining = availableUses(offer.code);
  return `<article class="offer-card ${offer.days <= 7 && offer.days >= 0 ? "is-urgent" : ""}">
    <div class="offer-card-header">
      <div><h2>${escapeHtml(offer.name)}</h2><span class="offer-id">${offer.code}</span></div>
      <span class="offer-deadline ${offer.days <= 7 ? "is-urgent" : ""}">${deadlineText(offer)}</span>
    </div>
    ${(offer.totalUses > 1 || RETURNED_OFFERS.has(offer.code)) ? `<div class="offer-status-row">
      ${offer.totalUses > 1 ? `<span class="use-badge">Redemption ${offer.useIndex} of ${offer.totalUses}</span><span class="remaining-badge">${remaining} of ${offer.totalUses} still available</span>` : `<span class="use-badge">One redemption copy</span>`}
      ${RETURNED_OFFERS.has(offer.code) ? `<span class="returned-badge">↩ Returned today</span>` : ""}
    </div>` : ""}
    <p class="offer-benefit">${escapeHtml(offer.benefit)}</p>
    <div class="offer-value-line">
      ${offer.rooms.map(room => `<span class="value-tag is-cabin">${room}</span>`).join("")}
      ${offer.freePlay ? `<span class="value-tag is-fp">+$${offer.freePlay} Free Play</span>` : ""}
    </div>
    ${offer.rooms.length > 1 ? `<p class="cabin-variation-note">Cabin categories vary by sailing. Open the Finder to see the exact choices for each cruise.</p>` : ""}
    <div class="offer-card-footer">
      <p>${offer.matching ? `${offer.sailings.length} casino-comp dates indexed in the Finder` : offer.comp === false ? "FreePlay only · cruise fare is not included" : "Comp details available in your Royal Caribbean account"}</p>
      ${offer.matching ? `<button class="card-action" type="button" data-offer-code="${offer.code}">View casino comps →</button>` : ""}
    </div>
    <label class="offer-tracker"><span>Redemption status</span><select data-offer-status="${offer.slotKey}">${OFFER_STATUS_OPTIONS.map(option => `<option${option === status ? " selected" : ""}>${option}</option>`).join("")}</select></label>
  </article>`;
}

function renderOfferLibrary() {
  const sort = document.querySelector("#offer-sort").value;
  const offers = allOfferSlots();

  offers.sort((a, b) => {
    if (sort === "value") return b.value - a.value || a.redeemBy.localeCompare(b.redeemBy);
    if (sort === "name") return a.name.localeCompare(b.name) || a.useIndex - b.useIndex;
    return a.redeemBy.localeCompare(b.redeemBy) || b.value - a.value || a.useIndex - b.useIndex;
  });

  document.querySelector("#offer-results-meta").textContent = `${offers.length} offers shown · ${Object.keys(OFFERS).length} unique codes · ${Object.values(OFFERS).filter(offer => offer.uses > 1).length} codes issued twice`;
  document.querySelector("#offer-library").innerHTML = offers.map(offerCard).join("");
  renderSlotLedger();
}

function populateShipFilter() {
  const select = document.querySelector("#ship-filter");
  const lastDate = SAILINGS.map(sailing => sailing.return).sort().at(-1);
  document.querySelector("#aboard-date").max = lastDate;
  document.querySelector("#depart-start").max = lastDate;
  document.querySelector("#return-end").max = lastDate;
  const months = [...new Set(SAILINGS.map(sailing => sailing.depart.slice(0, 7)))].sort();
  document.querySelector("#sailing-month").innerHTML = `<option value="any">Any month</option>${months.map(month => `<option value="${month}">${new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`))}</option>`).join("")}`;
  updateAvailabilityControls();
}

function syncAboardDateControl(editing = false) {
  const dateInput = document.querySelector("#aboard-date");
  const inputRow = dateInput.closest(".date-input-row");
  const emptyState = document.querySelector("#aboard-date-empty");
  const clearButton = document.querySelector("#clear-aboard-date");
  const hasDate = Boolean(dateInput.value);
  inputRow.hidden = !hasDate && !editing;
  emptyState.hidden = hasDate || editing;
  clearButton.hidden = !hasDate && !editing;
  clearButton.textContent = hasDate ? "Clear date" : "Cancel";
}

function selectedPorts() {
  return [...document.querySelectorAll("#port-filters input:checked")].map(input => input.value);
}

function selectedClasses() {
  return [...document.querySelectorAll("#class-filters input:checked")].map(input => input.value);
}

function syncPortScopeAppearance(ports) {
  const allSelected = ports.length === ALL_ELIGIBLE_PORTS.length && ALL_ELIGIBLE_PORTS.every(port => ports.includes(port));
  const floridaSelected = ports.length === FLORIDA_PORTS.length && FLORIDA_PORTS.every(port => ports.includes(port));
  const includesNonFlorida = ports.some(port => !FLORIDA_PORTS.includes(port));
  document.querySelector("#additional-port-filters").hidden = !includesNonFlorida;
  document.querySelectorAll("[data-port-scope]").forEach(button => {
    const active = button.dataset.portScope === "all" ? allSelected : floridaSelected;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#port-scope-note").textContent = allSelected
    ? `Showing all ${ALL_ELIGIBLE_PORTS.length} departure ports in your current offers.`
    : floridaSelected
      ? "Showing all four Florida departure ports."
      : `Showing ${ports.length} selected departure port${ports.length === 1 ? "" : "s"}.`;
}

function setPortScope(scope) {
  const useAllPorts = scope === "all";
  document.querySelectorAll("#port-filters input").forEach(input => {
    input.checked = useAllPorts || FLORIDA_PORTS.includes(input.value);
  });
  syncPortScopeAppearance(selectedPorts());
  updateAvailabilityControls();
}

function captureCurrentSearch(name) {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    date: document.querySelector("#aboard-date").value,
    departStart: document.querySelector("#depart-start").value,
    returnEnd: document.querySelector("#return-end").value,
    weekendOnly: document.querySelector("#weekend-only").checked,
    excludeConflicts: document.querySelector("#exclude-conflicts").checked,
    ports: selectedPorts(),
    classes: selectedClasses(),
    nights: document.querySelector("#nights-filter").value,
    room: document.querySelector("#room-filter").value,
    month: document.querySelector("#sailing-month").value,
    minFreePlay: document.querySelector("#min-freeplay").value,
    duplicateOnly: document.querySelector("#duplicate-only").checked,
    hideSailedShips: document.querySelector("#hide-sailed-ships").checked,
    backToBackOnly: document.querySelector("#back-to-back-only").checked,
    ship: document.querySelector("#ship-filter").value,
    sort: document.querySelector("#sailing-sort").value,
    offer: finderState.selectedOffer,
    savedAt: new Date().toISOString()
  };
}

function searchNameSuggestion() {
  const date = document.querySelector("#aboard-date").value;
  const departStart = document.querySelector("#depart-start").value;
  const returnEnd = document.querySelector("#return-end").value;
  const ship = document.querySelector("#ship-filter").value;
  const classes = selectedClasses();
  const ports = selectedPorts();
  const place = ports.length === ALL_ELIGIBLE_PORTS.length ? "All ports" : FLORIDA_PORTS.every(port => ports.includes(port)) && ports.length === FLORIDA_PORTS.length ? "Florida" : `${ports.length} ports`;
  const vessel = ship !== "any" ? ship : classes.length === 1 ? `${classes[0]} class` : "casino comps";
  return date ? `${formatDate(date)} · ${place}` : `${place} · ${vessel}`;
}

function savedSearchDescription(search) {
  const date = search.date ? formatLongDate(search.date) : search.departStart || search.returnEnd ? `${search.departStart ? formatDate(search.departStart) : "Any"}–${search.returnEnd ? formatDate(search.returnEnd) : "Any"}` : "Any date";
  const ports = search.ports.length === ALL_ELIGIBLE_PORTS.length ? "All ports" : search.ports.length === FLORIDA_PORTS.length && FLORIDA_PORTS.every(port => search.ports.includes(port)) ? "Florida" : `${search.ports.length} ports`;
  const vessel = search.ship && search.ship !== "any" ? search.ship : search.classes?.length ? `${search.classes.join(" + ")} class` : "Any ship";
  const room = search.room && search.room !== "any" ? search.room : "Any cabin";
  return `${date} · ${ports} · ${vessel} · ${room}`;
}

function persistSavedSearches() {
  try {
    localStorage.setItem(memberStorageKey(SAVED_SEARCH_STORAGE_KEY), JSON.stringify(savedSearches));
  } catch {
    // The Finder remains usable if browser storage is unavailable.
  }
  cloudRequest({ action: "save_searches", items: savedSearches });
}

function renderSavedSearches() {
  const list = document.querySelector("#saved-search-list");
  if (!savedSearches.length) {
    list.innerHTML = `<p class="saved-search-empty">No personal searches saved yet.</p>`;
    return;
  }
  list.innerHTML = savedSearches.map(search => `
    <div class="saved-search-item">
      <button class="saved-search-apply" type="button" data-apply-saved-search="${search.id}"><strong>${escapeHtml(search.name)}</strong><small>${escapeHtml(savedSearchDescription(search))} · ${savedSearchMatchLabel(search)}</small></button>
      <button class="saved-search-delete" type="button" data-delete-saved-search="${search.id}" aria-label="Delete ${escapeHtml(search.name)}">×</button>
    </div>`).join("");
}

function applySavedSearch(search) {
  document.querySelector("#finder-form").reset();
  document.querySelectorAll("#port-filters input").forEach(input => {
    input.checked = search.ports.includes(input.value);
  });
  syncPortScopeAppearance(selectedPorts());
  updateAvailabilityControls();
  document.querySelectorAll("#class-filters input").forEach(input => {
    input.checked = !input.disabled && (search.classes || []).includes(input.value);
  });
  document.querySelector("#aboard-date").value = search.date || "";
  syncAboardDateControl();
  document.querySelector("#depart-start").value = search.departStart || "";
  document.querySelector("#return-end").value = search.returnEnd || "";
  document.querySelector("#weekend-only").checked = Boolean(search.weekendOnly);
  document.querySelector("#exclude-conflicts").checked = search.excludeConflicts !== false;
  document.querySelector("#nights-filter").value = search.nights || "any";
  document.querySelector("#room-filter").value = search.room || "any";
  document.querySelector("#sailing-month").value = search.month || "any";
  document.querySelector("#min-freeplay").value = search.minFreePlay || "0";
  document.querySelector("#duplicate-only").checked = Boolean(search.duplicateOnly);
  document.querySelector("#hide-sailed-ships").checked = Boolean(search.hideSailedShips);
  document.querySelector("#back-to-back-only").checked = Boolean(search.backToBackOnly);
  document.querySelector("#sailing-sort").value = search.sort || "score";
  const shipSelect = document.querySelector("#ship-filter");
  shipSelect.value = [...shipSelect.options].some(option => option.value === search.ship) ? search.ship : "any";
  finderState.selectedOffer = search.offer && OFFERS[search.offer] ? search.offer : null;
  renderFinder();
  document.querySelector("#finder-results-title").scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateAvailabilityControls() {
  const ports = selectedPorts();
  const available = SAILINGS.filter(sailing => ports.includes(sailing.port));
  const classCounts = {};
  const shipCounts = {};
  available.forEach(sailing => {
    const shipClass = SHIP_CLASS[sailing.ship];
    classCounts[shipClass] = (classCounts[shipClass] || 0) + 1;
    shipCounts[sailing.ship] = (shipCounts[sailing.ship] || 0) + 1;
  });

  document.querySelectorAll("[data-class-count]").forEach(count => {
    const shipClass = count.dataset.classCount;
    const total = classCounts[shipClass] || 0;
    const input = count.closest("label").querySelector("input");
    count.textContent = total || "none";
    input.disabled = total === 0;
    if (!total) input.checked = false;
  });

  const select = document.querySelector("#ship-filter");
  const previous = select.value;
  const ships = Object.keys(shipCounts).sort();
  select.innerHTML = `<option value="any">Any ship</option>${ships.map(ship => `<option value="${escapeHtml(ship)}">${escapeHtml(ship)} of the Seas (${shipCounts[ship]})</option>`).join("")}`;
  select.value = ships.includes(previous) ? previous : "any";
}

function eligibleOfferRows(group) {
  const seen = new Set();
  return group.rows
    .map(row => ({ ...row, meta: OFFERS[row.offer] }))
    .filter(row => {
      const key = `${row.offer}:${row.room}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => cabinFirstValue(b.room, b.meta) - cabinFirstValue(a.room, a.meta) || a.meta.redeemBy.localeCompare(b.meta.redeemBy));
}

function groupSailings(rows) {
  const grouped = new Map();
  rows.forEach(row => {
    const key = [row.ship, row.port, row.itin, row.nights, row.depart, row.return].join("|");
    if (!grouped.has(key)) grouped.set(key, { key, ...row, rows: [] });
    grouped.get(key).rows.push(row);
  });
  return [...grouped.values()].map(group => {
    group.eligible = eligibleOfferRows(group);
    group.rooms = orderedRooms(group.eligible.map(row => row.room));
    group.best = group.eligible[0];
    group.conflict = bookingConflict(group);
    group.score = opportunityScore(group);
    return group;
  });
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function bookingConflict(group) {
  const overlap = bookings.find(booking => rangesOverlap(group.depart, group.return, booking.depart, booking.return));
  if (overlap) return { type: "overlap", booking: overlap };
  const near = bookings.find(booking => Math.abs((parseLocalDate(group.depart) - parseLocalDate(booking.return)) / 86400000) <= 1 || Math.abs((parseLocalDate(booking.depart) - parseLocalDate(group.return)) / 86400000) <= 1);
  return near ? { type: "back-to-back", booking: near } : null;
}

function opportunityScore(group) {
  const roomScore = { Interior: 16, "Ocean View": 24, Balcony: 32 }[group.best.room] || 10;
  const freePlayScore = Math.min(14, effectiveFreePlay(group.best.meta) / 10);
  const nightScore = Math.min(20, group.nights * 3);
  const classScore = SHIP_CLASS[group.ship] === "Oasis" ? 12 : SHIP_CLASS[group.ship] === "Freedom" ? 8 : 5;
  const portScore = FLORIDA_PORTS.includes(group.port) ? 8 : 3;
  const redeemDays = daysUntil(group.best.meta.redeemBy);
  const urgencyScore = redeemDays >= 0 && redeemDays <= 14 ? 8 : 4;
  const conflictPenalty = group.conflict?.type === "overlap" ? 25 : 0;
  return Math.max(1, Math.min(100, Math.round(roomScore + freePlayScore + nightScore + classScore + portScore + urgencyScore - conflictPenalty)));
}

function searchMatchesRow(sailing, search) {
  if (search.ports?.length && !search.ports.includes(sailing.port)) return false;
  if (search.date && !(sailing.depart <= search.date && search.date <= sailing.return)) return false;
  if (search.departStart && sailing.depart < search.departStart) return false;
  if (search.returnEnd && sailing.return > search.returnEnd) return false;
  if (search.month && search.month !== "any" && !sailing.depart.startsWith(search.month)) return false;
  if (search.weekendOnly && ![5, 6].includes(parseLocalDate(sailing.depart).getDay())) return false;
  if (search.ship && search.ship !== "any" && sailing.ship !== search.ship) return false;
  if ((!search.ship || search.ship === "any") && search.classes?.length && !search.classes.includes(SHIP_CLASS[sailing.ship])) return false;
  if (search.room && search.room !== "any" && ROOM_RANK[sailing.room] < ROOM_RANK[search.room]) return false;
  if (Number(search.minFreePlay || 0) > effectiveFreePlay(OFFERS[sailing.offer])) return false;
  if (search.duplicateOnly && OFFERS[sailing.offer]?.uses < 2) return false;
  if (search.hideSailedShips && bookings.some(booking => booking.ship === sailing.ship)) return false;
  if (search.backToBackOnly && bookingConflict(sailing)?.type !== "back-to-back") return false;
  if (search.nights === "2-3" && sailing.nights > 3) return false;
  if (search.nights === "4-5" && (sailing.nights < 4 || sailing.nights > 5)) return false;
  if (search.nights === "6+" && sailing.nights < 6) return false;
  return true;
}

function savedSearchMatchCount(search) {
  const keys = new Set(SAILINGS.filter(sailing => searchMatchesRow(sailing, search)).map(sailing => [sailing.ship, sailing.depart, sailing.return].join("|")));
  return keys.size;
}

function savedSearchMatchLabel(search) {
  const current = savedSearchMatchCount(search);
  const baseline = Number.isFinite(search.matchCountAtSave) ? search.matchCountAtSave : current;
  const fresh = Math.max(0, current - baseline);
  return fresh ? `${current} matches · +${fresh} new` : `${current} current matches`;
}

function filterSailings() {
  const date = document.querySelector("#aboard-date").value;
  const departStart = document.querySelector("#depart-start").value;
  const returnEnd = document.querySelector("#return-end").value;
  const weekendOnly = document.querySelector("#weekend-only").checked;
  const excludeConflicts = document.querySelector("#exclude-conflicts").checked;
  const nights = document.querySelector("#nights-filter").value;
  const room = document.querySelector("#room-filter").value;
  const ship = document.querySelector("#ship-filter").value;
  const month = document.querySelector("#sailing-month").value;
  const minFreePlay = Number(document.querySelector("#min-freeplay").value);
  const duplicateOnly = document.querySelector("#duplicate-only").checked;
  const hideSailedShips = document.querySelector("#hide-sailed-ships").checked;
  const backToBackOnly = document.querySelector("#back-to-back-only").checked;
  const ports = selectedPorts();
  const classes = selectedClasses();

  const rows = SAILINGS.filter(sailing => {
    if (!OFFERS[sailing.offer]) return false;
    if (!ports.includes(sailing.port)) return false;
    if (finderState.selectedOffer && sailing.offer !== finderState.selectedOffer) return false;
    if (date && !(sailing.depart <= date && date <= sailing.return)) return false;
    if (departStart && sailing.depart < departStart) return false;
    if (returnEnd && sailing.return > returnEnd) return false;
    if (month !== "any" && !sailing.depart.startsWith(month)) return false;
    if (weekendOnly && ![5, 6].includes(parseLocalDate(sailing.depart).getDay())) return false;
    if (ship !== "any" && sailing.ship !== ship) return false;
    if (ship === "any" && !classes.includes(SHIP_CLASS[sailing.ship])) return false;
    if (room !== "any" && ROOM_RANK[sailing.room] < ROOM_RANK[room]) return false;
    if (minFreePlay > effectiveFreePlay(OFFERS[sailing.offer])) return false;
    if (duplicateOnly && OFFERS[sailing.offer]?.uses < 2) return false;
    if (hideSailedShips && bookings.some(booking => booking.ship === sailing.ship)) return false;
    if (nights === "2-3" && sailing.nights > 3) return false;
    if (nights === "4-5" && (sailing.nights < 4 || sailing.nights > 5)) return false;
    if (nights === "6+" && sailing.nights < 6) return false;
    return true;
  });

  const groups = groupSailings(rows);
  const visibleGroups = groups.filter(group => {
    if (excludeConflicts && group.conflict?.type === "overlap") return false;
    if (backToBackOnly && group.conflict?.type !== "back-to-back") return false;
    return true;
  });
  const sort = document.querySelector("#sailing-sort").value;
  visibleGroups.sort((a, b) => {
    if (sort === "score") return b.score - a.score || a.depart.localeCompare(b.depart);
    if (sort === "date") return a.depart.localeCompare(b.depart) || cabinFirstValue(b.best.room, b.best.meta) - cabinFirstValue(a.best.room, a.best.meta);
    if (sort === "nights") return b.nights - a.nights || a.depart.localeCompare(b.depart);
    if (sort === "expiry") return a.best.meta.redeemBy.localeCompare(b.best.meta.redeemBy) || a.depart.localeCompare(b.depart);
    return cabinFirstValue(b.best.room, b.best.meta) - cabinFirstValue(a.best.room, a.best.meta) || a.depart.localeCompare(b.depart);
  });
  return visibleGroups;
}

function activeFilterLabels() {
  const labels = [];
  const date = document.querySelector("#aboard-date").value;
  const departStart = document.querySelector("#depart-start").value;
  const returnEnd = document.querySelector("#return-end").value;
  const nights = document.querySelector("#nights-filter");
  const room = document.querySelector("#room-filter");
  const ship = document.querySelector("#ship-filter");
  const month = document.querySelector("#sailing-month");
  const minFreePlay = Number(document.querySelector("#min-freeplay").value);
  if (date) labels.push(`Aboard ${formatLongDate(date)}`);
  if (!date && (departStart || returnEnd)) labels.push(`${departStart ? `From ${formatLongDate(departStart)}` : "Any departure"} · ${returnEnd ? `Back by ${formatLongDate(returnEnd)}` : "Any return"}`);
  if (document.querySelector("#weekend-only").checked) labels.push("Weekend departures");
  if (document.querySelector("#exclude-conflicts").checked) labels.push("Booked-trip conflicts hidden");
  const ports = selectedPorts();
  if (ports.length === ALL_ELIGIBLE_PORTS.length) labels.push(`All ${ALL_ELIGIBLE_PORTS.length} eligible ports`);
  else if (FLORIDA_PORTS.every(port => ports.includes(port)) && ports.length === FLORIDA_PORTS.length) labels.push("All Florida ports");
  else labels.push(`${ports.length} selected port${ports.length === 1 ? "" : "s"}`);
  if (nights.value !== "any") labels.push(nights.options[nights.selectedIndex].text);
  if (room.value !== "any") labels.push(room.value);
  if (month.value !== "any") labels.push(month.options[month.selectedIndex].text);
  if (minFreePlay) labels.push(`$${minFreePlay}+ FreePlay`);
  if (document.querySelector("#duplicate-only").checked) labels.push("Multiple-use offers");
  if (document.querySelector("#hide-sailed-ships").checked) labels.push("Booked ships hidden");
  if (document.querySelector("#back-to-back-only").checked) labels.push("Back-to-back only");
  if (ship.value !== "any") labels.push(`${ship.value} of the Seas`);
  else if (selectedClasses().length) labels.push(`${selectedClasses().join(" + ")}-class`);
  if (finderState.selectedOffer) labels.push(`Offer ${finderState.selectedOffer}`);
  return labels;
}

function whyThisMatch(group) {
  const reasons = [];
  if (FLORIDA_PORTS.includes(group.port)) reasons.push("Florida departure");
  if (SHIP_CLASS[group.ship] === "Oasis") reasons.push("Oasis class");
  if (group.rooms.includes("Balcony")) reasons.push("balcony available");
  if (effectiveFreePlay(group.best.meta)) reasons.push(`$${effectiveFreePlay(group.best.meta)} FreePlay`);
  if (group.nights >= 6) reasons.push(`${group.nights}-night sailing`);
  if (availableUses(group.best.offer) > 1) reasons.push(`${availableUses(group.best.offer)} offer copies available`);
  if (group.conflict?.type === "back-to-back") reasons.push("back-to-back fit");
  return reasons.slice(0, 3).join(" · ") || "Eligible Club Royale comp with no booked-trip overlap";
}

function sailingCard(group, searchedDate) {
  const best = group.best;
  const bestOffer = best.meta;
  const eligibleOfferCount = new Set(group.eligible.map(row => row.offer)).size;
  const returnNote = searchedDate && searchedDate === group.return ? " · docks that morning" : "";
  const compared = finderState.compareKeys.has(group.key);
  const conflict = group.conflict ? `<div class="conflict-badge ${group.conflict.type}">${group.conflict.type === "overlap" ? "Overlaps" : "Back-to-back with"} ${escapeHtml(group.conflict.booking.ship)} · ${formatDate(group.conflict.booking.depart)}</div>` : "";
  return `<article class="sailing-card">
    <div class="sailing-main">
      <div class="sailing-label-row"><span class="casino-comp-label">♠ Club Royale comp</span><span class="score-badge"><strong>${group.score}</strong>/100</span></div>
      <div class="sailing-date"><span class="date-range">${formatDate(group.depart)} – ${formatLongDate(group.return)}${returnNote}</span><span class="nights-pill">${group.nights} nights</span></div>
      <h3>${escapeHtml(group.ship)} of the Seas</h3>
      <p class="sailing-route">From ${escapeHtml(group.port)}</p>
      <p class="itinerary-name">${escapeHtml(group.itin)}</p>
      <p class="match-reason"><span>Why it matches</span>${escapeHtml(whyThisMatch(group))}</p>
      ${conflict}
      <div class="best-offer-strip">
        <div><small>Best-value casino offer · ${availableUses(best.offer)} use${availableUses(best.offer) === 1 ? "" : "s"} available</small><strong>${best.offer} · ${escapeHtml(bestOffer.name)}</strong>${effectiveFreePlay(bestOffer) ? `<span class="best-offer-fp">+$${effectiveFreePlay(bestOffer)} FreePlay</span>` : ""}</div>
        <div class="cabin-options"><small>Cabins on this sailing</small><div>${group.rooms.map(room => `<span>${room}</span>`).join("")}</div></div>
      </div>
      <button class="compare-button ${compared ? "is-selected" : ""}" type="button" data-compare-key="${encodeURIComponent(group.key)}">${compared ? "✓ Selected for comparison" : "+ Compare this cruise"}</button>
    </div>
    <details>
      <summary>${eligibleOfferCount} eligible offer${eligibleOfferCount === 1 ? "" : "s"} · ${group.rooms.length} cabin option${group.rooms.length === 1 ? "" : "s"}</summary>
      <div class="eligible-offers">
        ${group.eligible.map(row => `<div class="eligible-row"><div><strong>${row.offer} · ${escapeHtml(row.meta.name)}</strong><span>Redeem by ${formatLongDate(row.meta.redeemBy)}</span></div><span>${row.room}${effectiveFreePlay(row.meta) ? `<br>+$${effectiveFreePlay(row.meta)} FP` : ""}</span></div>`).join("")}
      </div>
    </details>
  </article>`;
}

function renderFinder(resetLimit = true) {
  if (resetLimit) finderState.limit = FINDER_PAGE_SIZE;
  finderState.groups = filterSailings();
  const date = document.querySelector("#aboard-date").value;
  const shown = finderState.groups.slice(0, finderState.limit);
  const list = document.querySelector("#sailing-list");

  const selectedShip = document.querySelector("#ship-filter").value;
  const allPortsSelected = selectedPorts().length === ALL_ELIGIBLE_PORTS.length;
  const floridaSelected = FLORIDA_PORTS.every(port => selectedPorts().includes(port)) && selectedPorts().length === FLORIDA_PORTS.length;
  const shipLabel = selectedShip !== "any" ? `${selectedShip} sailings` : selectedClasses().length === 1 ? `${selectedClasses()[0]}-class sailings` : "matching sailings";
  document.querySelector("#finder-result-kicker").textContent = date ? `Casino comps aboard ${formatLongDate(date)}` : "Casino comps · No date required";
  document.querySelector("#finder-results-title").textContent = date
    ? "Club Royale comps that cover your date"
    : `${allPortsSelected ? "All-port" : floridaSelected ? "Florida" : "Selected-port"} ${shipLabel.replace("sailings", "casino comps")}`;
  document.querySelector("#finder-result-total").textContent = `${finderState.groups.length} comp result${finderState.groups.length === 1 ? "" : "s"}`;
  document.querySelector("#live-match-count").textContent = `${finderState.groups.length} casino comp${finderState.groups.length === 1 ? "" : "s"}`;
  document.querySelector("#active-filter-summary").innerHTML = activeFilterLabels().map(label => `<span>${escapeHtml(label)}</span>`).join("");

  const urgentCodes = [...new Set(finderState.groups.flatMap(group => group.eligible)
    .filter(row => {
      const days = daysUntil(row.meta.redeemBy);
      return days >= 0 && days <= 7;
    })
    .map(row => row.offer))];
  const alert = document.querySelector("#finder-alert");
  alert.hidden = urgentCodes.length === 0;
  if (urgentCodes.length) alert.innerHTML = `<span aria-hidden="true">⌛</span><div><strong>Time-sensitive results.</strong> ${urgentCodes.join(", ")} ${urgentCodes.length === 1 ? "expires" : "expire"} within seven days, and offers can disappear before their stated deadline.</div>`;

  if (!finderState.groups.length) {
    list.innerHTML = `<div class="empty-state"><strong>No Club Royale comp matches yet.</strong>Try widening the ports or reset the ship, cabin, and length filters.</div>`;
  } else {
    list.innerHTML = shown.map(group => sailingCard(group, date)).join("");
  }

  const loadMore = document.querySelector("#load-more");
  loadMore.hidden = finderState.limit >= finderState.groups.length;
  if (!loadMore.hidden) loadMore.textContent = `Show ${Math.min(FINDER_PAGE_SIZE, finderState.groups.length - finderState.limit)} more sailings`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

function maskReservation(value) {
  const text = String(value || "");
  return text ? `•••${text.slice(-4)}` : "Not recorded";
}

function renderOverviewPlanning() {
  const next = bookings.filter(booking => booking.return >= PROFILE.snapshot).sort((a, b) => a.depart.localeCompare(b.depart))[0];
  const nextCard = document.querySelector("#next-trip-card");
  if (next) {
    const remaining = Math.max(0, next.checklist.length - (next.completed || []).length);
    nextCard.innerHTML = `<div class="next-trip-top"><span class="eyebrow">Next booked cruise</span><span class="countdown-pill">${daysUntil(next.depart)} days</span></div><h2>${escapeHtml(next.ship)} of the Seas</h2><p>${formatLongDate(next.depart)} – ${formatLongDate(next.return)} · ${next.nights} nights from ${escapeHtml(next.port)}</p><div class="next-trip-facts"><span>${next.cabin}</span><span>${next.offer}</span><span>${remaining} prep item${remaining === 1 ? "" : "s"}</span></div><button class="text-button" type="button" data-view-target="trips">Open my trip workspace →</button>`;
  } else {
    nextCard.innerHTML = `<div class="next-trip-top"><span class="eyebrow">Booked cruise workspace</span></div><h2>No trips added for ${escapeHtml(PROFILE.displayName)}</h2><p>Offer comparisons still work; booked-trip conflicts will appear after a cruise is added.</p>`;
  }
  const expiring = allOffers().filter(offer => offer.days >= 0 && offer.days <= 14).length;
  const alertMatches = savedSearches.reduce((total, search) => total + savedSearchMatchCount(search), 0);
  const planning = Object.values(offerStatuses).filter(item => item.status === "Planning").length;
  document.querySelector("#action-list").innerHTML = [
    ["⌛", `${expiring} offers expiring soon`, "Review redemption deadlines", "offers"],
    ["✦", `${alertMatches} saved-search matches`, savedSearches.length ? "Fresh matches across your saved searches" : "Save a Finder search to start watching", "finder"],
    ["▦", `${bookings.length} cruises booked`, `${planning} offer slot${planning === 1 ? "" : "s"} currently in planning`, "trips"]
  ].map(item => `<button type="button" data-view-target="${item[3]}"><span>${item[0]}</span><div><strong>${item[1]}</strong><small>${item[2]}</small></div><b>→</b></button>`).join("");
}

function tripCard(booking) {
  const complete = (booking.completed || []).length;
  const total = booking.checklist.length;
  return `<article class="trip-card">
    <div class="trip-card-date"><strong>${formatDate(booking.depart, { month: "short" })}</strong><span>${parseLocalDate(booking.depart).getDate()}</span></div>
    <div class="trip-card-main"><div class="trip-card-top"><span class="booked-badge">✓ Booked</span><span>${daysUntil(booking.depart)} days away</span></div><h2>${escapeHtml(booking.ship)} of the Seas</h2><p>${formatLongDate(booking.depart)} – ${formatLongDate(booking.return)} · ${booking.nights} nights</p><div class="trip-tags"><span>${escapeHtml(booking.port)}</span><span>${escapeHtml(booking.cabin)}</span><span>${escapeHtml(booking.offer)}</span>${booking.freePlay ? `<span>+$${booking.freePlay} FreePlay</span>` : ""}${booking.drinkPackage ? `<span>${escapeHtml(booking.drinkPackage)} ✓</span>` : ""}</div><div class="trip-progress"><span style="width:${total ? complete / total * 100 : 100}%"></span></div><small>${complete} of ${total} prep items complete · Reservation ${maskReservation(booking.reservation)}</small></div>
    <button class="trip-open" type="button" data-trip-id="${booking.id}">Open trip →</button>
  </article>`;
}

function renderTrips() {
  bookings.sort((a, b) => a.depart.localeCompare(b.depart));
  document.querySelector("#trip-list").innerHTML = bookings.length ? bookings.map(tripCard).join("") : `<div class="empty-state"><strong>No booked cruises recorded for ${escapeHtml(PROFILE.displayName)}.</strong>Switch accounts above to view another member's trips.</div>`;
  document.querySelector("#trip-timeline").innerHTML = bookings.map((booking, index) => `<div class="timeline-stop"><span>${index + 1}</span><div><strong>${formatDate(booking.depart, { month: "short", year: "numeric" })}</strong><small>${escapeHtml(booking.ship)} · ${booking.nights} nights</small></div></div>`).join("");
  const statuses = Object.values(offerStatuses).reduce((counts, item) => ({ ...counts, [item.status]: (counts[item.status] || 0) + 1 }), {});
  document.querySelector("#history-card").innerHTML = `<div><strong>${LAST_PORTAL_CHECK.uniqueOffers}</strong><span>Unique offer codes</span></div><div><strong>${LAST_PORTAL_CHECK.usableSlots}</strong><span>Usable slots</span></div><div><strong>${LAST_PORTAL_CHECK.sailingRows.toLocaleString()}</strong><span>Dated comp rows</span></div><p>${escapeHtml(LAST_PORTAL_CHECK.note)} ${statuses.Booked ? `${statuses.Booked} current slot${statuses.Booked === 1 ? " is" : "s are"} marked booked.` : ""}</p>`;
  renderCalendar();
}

function renderCalendar() {
  const [year, month] = finderState.calendarMonth.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leading = first.getDay();
  document.querySelector("#calendar-month-label").textContent = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(first);
  const cells = Array.from({ length: leading }, () => `<div class="calendar-day is-empty" aria-hidden="true"></div>`);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const compGroups = new Set(SAILINGS.filter(sailing => sailing.depart === iso).map(sailing => [sailing.ship, sailing.port, sailing.depart, sailing.return].join("|")));
    const booked = bookings.filter(booking => booking.depart <= iso && iso < booking.return);
    const deadlines = allOffers().filter(offer => offer.redeemBy === iso);
    const isToday = iso === new Date().toLocaleDateString("en-CA");
    cells.push(`<button class="calendar-day ${isToday ? "is-today" : ""}" type="button" data-calendar-date="${iso}" ${compGroups.size ? "" : "disabled"}><span>${day}</span><div>${booked.length ? `<b class="calendar-event is-booked">${escapeHtml(booked[0].ship)} booked</b>` : ""}${compGroups.size ? `<b class="calendar-event is-comp">${compGroups.size} comp${compGroups.size === 1 ? "" : "s"}</b>` : ""}${deadlines.length ? `<b class="calendar-event is-deadline">${deadlines.length} deadline${deadlines.length === 1 ? "" : "s"}</b>` : ""}</div></button>`);
  }
  document.querySelector("#cruise-calendar").innerHTML = cells.join("");
}

function bookingStatusTone(value) {
  const status = String(value || "").toLowerCase();
  if (status.startsWith("paid") || status.startsWith("purchased")) return "is-paid";
  if (status.startsWith("not paid") || status.startsWith("not purchased")) return "is-unpaid";
  return "is-neutral";
}

function bookingCostSections(booking) {
  const cruiseFare = Number.isFinite(booking.fare) ? formatMoney(booking.fare) : "Not itemized";
  const taxesFees = Number.isFinite(booking.taxesFees) ? formatMoney(booking.taxesFees) : "Not itemized";
  const cruiseTotal = Number.isFinite(booking.total) ? formatMoney(booking.total) : "Not recorded";
  const cruisePayment = booking.paymentStatus || "Not recorded";
  const cruiseGratuities = booking.cruiseGratuitiesStatus || booking.gratuities || "Not recorded";
  const diningPackage = booking.diningPackage || booking.dining || "Not recorded";
  const diningStatus = booking.diningPackageStatus || (/not purchased/i.test(diningPackage) ? "Not purchased" : "Not recorded");
  const diningGratuities = booking.diningGratuitiesStatus || "Not recorded";
  const diningTotal = Number.isFinite(booking.diningPackageTotal) ? formatMoney(booking.diningPackageTotal) : "Not recorded";
  const drinkPackage = booking.drinkPackage || booking.drinks || "Not recorded";
  const drinkStatus = booking.drinkPackageStatus || (/not purchased/i.test(drinkPackage) ? "Not purchased" : "Not recorded");
  const drinkGratuities = booking.drinkGratuitiesStatus || (Number.isFinite(booking.drinkPackageGratuities) ? `Paid — ${formatMoney(booking.drinkPackageGratuities)}` : "Not recorded");
  const drinkTotal = Number.isFinite(booking.drinkPackageTotal) ? formatMoney(booking.drinkPackageTotal) : "Not recorded";

  const row = (label, value, tone = "") => `<div><dt>${label}</dt><dd class="${tone}">${escapeHtml(value)}</dd></div>`;
  return `<div class="trip-cost-sections">
    <section class="trip-cost-section"><div class="trip-cost-heading"><span>04</span><h3>Cruise fare & gratuities</h3></div><dl>${row("Cruise fare", cruiseFare)}${row("Taxes & fees", taxesFees)}${row("Cruise total", cruiseTotal)}${row("Payment", cruisePayment, bookingStatusTone(cruisePayment))}${row("Gratuities", cruiseGratuities, bookingStatusTone(cruiseGratuities))}</dl></section>
    <section class="trip-cost-section"><div class="trip-cost-heading"><span>05</span><h3>Dining package</h3></div><dl>${row("Purchase", diningStatus, bookingStatusTone(diningStatus))}${row("Package / plan", diningPackage)}${row("Gratuities", diningGratuities, bookingStatusTone(diningGratuities))}${row("Package total", diningTotal)}</dl></section>
    <section class="trip-cost-section"><div class="trip-cost-heading"><span>06</span><h3>Drink package</h3></div><dl>${row("Purchase", drinkStatus, bookingStatusTone(drinkStatus))}${row("Package / plan", drinkPackage)}${row("Gratuities", drinkGratuities, bookingStatusTone(drinkGratuities))}${row("Package total", drinkTotal)}</dl></section>
  </div>`;
}

function bookingOverviewSections(booking) {
  const row = (label, value) => `<div><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`;
  const cabinDetails = [booking.cabin || "Not recorded", booking.cabinCode, booking.stateroom ? `Stateroom ${booking.stateroom}` : ""].filter(Boolean).join(" · ");
  const itinerary = booking.itinerary || (booking.itineraryStops?.length ? booking.itineraryStops.join(" → ") : "Not recorded");
  const companionText = booking.companions?.length ? booking.companions.join(", ") : "None recorded";
  const maybeText = booking.maybes?.length ? booking.maybes.join(", ") : "None recorded";

  return `<div class="trip-standard-sections">
    <section class="trip-standard-section"><div class="trip-standard-heading"><span>01</span><h3>Cruise details</h3></div><div class="trip-detail-grid">${row("Sailing dates", `${formatLongDate(booking.depart)} – ${formatLongDate(booking.return)}`)}${row("Length", `${booking.nights} nights`)}${row("Departure port", booking.port || "Not recorded")}${row("Itinerary", itinerary)}${row("Offer code", booking.offer || "Not recorded")}${row("Casino FreePlay", booking.freePlay ? formatMoney(booking.freePlay) : "None listed")}</div></section>
    <section class="trip-standard-section"><div class="trip-standard-heading"><span>02</span><h3>Reservation & stateroom</h3></div><div class="trip-detail-grid">${row("Reservation", booking.reservation || "Not recorded")}${row("Crown & Anchor", booking.crownAnchor || "Not recorded")}${row("Cabin", cabinDetails)}${row("Obstructed view", booking.obstructedView || "Not recorded")}${row("Travel protection", booking.protection || "Not recorded")}${row("Check-in window", booking.checkInWindow || "Not recorded")}</div></section>
    <section class="trip-standard-section"><div class="trip-standard-heading"><span>03</span><h3>Plans & people</h3></div><div class="trip-detail-grid">${row("Traveling with", companionText)}${row("Maybe joining", maybeText)}${row("Departure time", booking.departureTime || "Not recorded")}${row("Dining seating", booking.diningSeating || (/waitlist/i.test(booking.dining || "") ? booking.dining : "Not recorded"))}</div></section>
  </div>`;
}

function shiftCalendar(delta) {
  const [year, month] = finderState.calendarMonth.split("-").map(Number);
  const next = new Date(year, month - 1 + delta, 1);
  finderState.calendarMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  renderCalendar();
}

function openCalendarDate(date) {
  resetFinder();
  document.querySelector("#aboard-date").value = date;
  syncAboardDateControl();
  setPortScope("all");
  document.querySelectorAll("#class-filters input:not(:disabled)").forEach(input => { input.checked = true; });
  renderFinder();
  switchView("finder");
}

function openTrip(id) {
  const booking = bookings.find(item => item.id === id);
  if (!booking) return;
  const checklist = booking.checklist || [];
  document.querySelector("#trip-dialog-content").innerHTML = `<p class="eyebrow">Booked casino cruise</p><h2>${escapeHtml(booking.ship)} of the Seas</h2><p class="trip-dialog-dates">${formatLongDate(booking.depart)} – ${formatLongDate(booking.return)} · ${booking.nights} nights from ${escapeHtml(booking.port)}</p>${bookingOverviewSections(booking)}${bookingCostSections(booking)}<section class="trip-workspace"><h3>Trip prep</h3>${checklist.length ? checklist.map((item, index) => `<label><input type="checkbox" data-trip-check="${booking.id}" data-check-index="${index}" ${(booking.completed || []).includes(index) ? "checked" : ""}><span>${escapeHtml(item)}</span></label>`).join("") : `<p class="trip-empty-detail">No prep items recorded.</p>`}</section><section class="trip-notes"><h3>Private notes</h3><label>Notes<textarea data-trip-notes="${booking.id}" rows="4">${escapeHtml(booking.notes || "")}</textarea></label></section>`;
  document.querySelector("#trip-dialog").showModal();
}

function persistBookings(booking) {
  localStorage.setItem(memberStorageKey(BOOKING_STORAGE_KEY), JSON.stringify(bookings));
  if (booking) cloudRequest({ action: "save_booking", booking });
  renderTrips();
  renderOverviewPlanning();
}

function renderCompareTray() {
  const tray = document.querySelector("#compare-tray");
  const count = finderState.compareKeys.size;
  tray.hidden = count === 0;
  document.querySelector("#compare-count").textContent = `${count} selected`;
  document.querySelector("#open-compare").disabled = count < 2;
}

function selectedComparisonGroups() {
  const current = new Map(finderState.groups.map(group => [group.key, group]));
  if ([...finderState.compareKeys].some(key => !current.has(key))) {
    groupSailings(SAILINGS).forEach(group => current.set(group.key, group));
  }
  return [...finderState.compareKeys].map(key => current.get(key)).filter(Boolean);
}

function openComparison() {
  const groups = selectedComparisonGroups();
  document.querySelector("#comparison-grid").innerHTML = groups.map(group => `<article><span class="score-badge"><strong>${group.score}</strong>/100</span><h3>${escapeHtml(group.ship)} of the Seas</h3><p>${formatLongDate(group.depart)} – ${formatLongDate(group.return)}</p><div class="comparison-why"><span>Why it matches</span>${escapeHtml(whyThisMatch(group))}</div><dl><div><dt>From</dt><dd>${escapeHtml(group.port)}</dd></div><div><dt>Length</dt><dd>${group.nights} nights</dd></div><div><dt>Cabins</dt><dd>${group.rooms.join(" · ")}</dd></div><div><dt>Best offer</dt><dd>${group.best.offer}</dd></div><div><dt>Uses remaining</dt><dd>${availableUses(group.best.offer)} of ${group.best.meta.uses}</dd></div><div><dt>Eligible options</dt><dd>${group.eligible.length}</dd></div><div><dt>FreePlay</dt><dd>${effectiveFreePlay(group.best.meta) ? `$${effectiveFreePlay(group.best.meta)}` : "—"}</dd></div><div><dt>Redeem by</dt><dd>${formatLongDate(group.best.meta.redeemBy)}</dd></div><div><dt>Calendar</dt><dd>${group.conflict ? `${group.conflict.type === "overlap" ? "Conflict" : "Back-to-back"} · ${group.conflict.booking.ship}` : "Clear"}</dd></div></dl><a href="${group.link}" target="_blank" rel="noreferrer">View in Royal Caribbean →</a></article>`).join("");
  document.querySelector("#compare-dialog").showModal();
}

async function hydrateCloudState(requestedMemberId = activeMemberId) {
  const state = await cloudRequest();
  if (!state || activeMemberId !== requestedMemberId || state.memberId !== requestedMemberId) return;
  if (Array.isArray(state.bookings)) bookings = state.bookings;
  if (Array.isArray(state.savedSearches)) savedSearches = state.savedSearches;
  if (Array.isArray(state.offerStatuses)) offerStatuses = Object.fromEntries(state.offerStatuses.map(item => [item.slot_key, item]));
  if (Array.isArray(state.snapshots)) cloudSnapshots = state.snapshots;
  localStorage.setItem(memberStorageKey(BOOKING_STORAGE_KEY), JSON.stringify(bookings));
  localStorage.setItem(memberStorageKey(SAVED_SEARCH_STORAGE_KEY), JSON.stringify(savedSearches));
  localStorage.setItem(memberStorageKey(OFFER_STATUS_STORAGE_KEY), JSON.stringify(offerStatuses));
  renderOfferLibrary();
  renderSavedSearches();
  renderTrips();
  renderOverviewPlanning();
  renderFinder();
  renderChangeCenter();
  updateMemberPresentation();
}

function renderActiveMember() {
  updateMemberPresentation();
  populateShipFilter();
  syncAboardDateControl();
  renderPriority();
  renderMetrics();
  renderOfferPreview();
  renderUrgentRibbon();
  renderOfferLibrary();
  renderChangeCenter();
  renderSavedSearches();
  resetFinder();
  renderTrips();
  renderOverviewPlanning();
  renderCompareTray();
}

function switchActiveMember(memberId) {
  activateMemberData(memberId);
  bookings = loadMemberJson(BOOKING_STORAGE_KEY, ACTIVE_MEMBER.seedBookings.map(cruise => ({ ...cruise, completed: [] })));
  offerStatuses = loadMemberJson(OFFER_STATUS_STORAGE_KEY, {});
  savedSearches = loadSavedSearches();
  cloudSnapshots = [];
  finderState.selectedOffer = null;
  finderState.compareKeys.clear();
  renderActiveMember();
  hydrateCloudState(activeMemberId);
}

function resetFinder() {
  document.querySelector("#finder-form").reset();
  syncAboardDateControl();
  setPortScope("florida");
  document.querySelector("#nights-filter").value = "any";
  document.querySelector("#room-filter").value = "any";
  document.querySelector("#sailing-month").value = "any";
  document.querySelector("#min-freeplay").value = "0";
  document.querySelector("#duplicate-only").checked = false;
  document.querySelector("#hide-sailed-ships").checked = false;
  document.querySelector("#back-to-back-only").checked = false;
  document.querySelector("#ship-filter").value = "any";
  document.querySelector("#sailing-sort").value = "score";
  document.querySelectorAll("#class-filters input").forEach(input => {
    input.checked = input.value === "Oasis";
  });
  finderState.selectedOffer = null;
  updateAvailabilityControls();
  renderFinder();
}

function runChristmasSearch() {
  resetFinder();
  document.querySelector("#aboard-date").value = "2026-12-25";
  syncAboardDateControl();
  setPortScope("all");
  document.querySelectorAll("#class-filters input:not(:disabled)").forEach(input => { input.checked = true; });
  renderFinder();
  document.querySelector("#finder-results-title").scrollIntoView({ behavior: "smooth", block: "start" });
}

function switchView(id) {
  document.querySelectorAll(".view").forEach(view => {
    const active = view.id === id;
    view.hidden = !active;
    view.classList.toggle("is-active", active);
  });
  document.querySelectorAll(".nav-item").forEach(button => {
    const active = button.dataset.viewTarget === id;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  history.replaceState(null, "", `#${id}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const viewTarget = event.target.closest("[data-view-target]");
  if (viewTarget) switchView(viewTarget.dataset.viewTarget);

  const offerButton = event.target.closest("[data-offer-code]");
  if (offerButton) {
    resetFinder();
    setPortScope("all");
    finderState.selectedOffer = offerButton.dataset.offerCode;
    switchView("finder");
    renderFinder();
  }

  const compareButton = event.target.closest("[data-compare-key]");
  if (compareButton) {
    const key = decodeURIComponent(compareButton.dataset.compareKey);
    if (finderState.compareKeys.has(key)) finderState.compareKeys.delete(key);
    else if (finderState.compareKeys.size < 4) finderState.compareKeys.add(key);
    renderFinder(false);
    renderCompareTray();
  }

  const tripButton = event.target.closest("[data-trip-id]");
  if (tripButton) openTrip(tripButton.dataset.tripId);

  const calendarDate = event.target.closest("[data-calendar-date]");
  if (calendarDate) openCalendarDate(calendarDate.dataset.calendarDate);
});

document.addEventListener("change", event => {
  const statusSelect = event.target.closest("[data-offer-status]");
  if (statusSelect) {
    offerStatuses[statusSelect.dataset.offerStatus] = { status: statusSelect.value, notes: "", updated_at: new Date().toISOString() };
    localStorage.setItem(memberStorageKey(OFFER_STATUS_STORAGE_KEY), JSON.stringify(offerStatuses));
    cloudRequest({ action: "save_status", slotKey: statusSelect.dataset.offerStatus, status: statusSelect.value });
    renderOfferLibrary();
    renderOverviewPlanning();
    renderTrips();
  }
  const tripCheck = event.target.closest("[data-trip-check]");
  if (tripCheck) {
    const booking = bookings.find(item => item.id === tripCheck.dataset.tripCheck);
    const index = Number(tripCheck.dataset.checkIndex);
    if (booking) {
      const completed = new Set(booking.completed || []);
      if (tripCheck.checked) completed.add(index); else completed.delete(index);
      booking.completed = [...completed].sort((a, b) => a - b);
      persistBookings(booking);
    }
  }
  const tripNotes = event.target.closest("[data-trip-notes]");
  if (tripNotes) {
    const booking = bookings.find(item => item.id === tripNotes.dataset.tripNotes);
    if (booking) { booking.notes = tripNotes.value; persistBookings(booking); }
  }
});

document.querySelector("#offer-sort").addEventListener("change", renderOfferLibrary);
document.querySelector("#finder-form").addEventListener("submit", event => {
  event.preventDefault();
  finderState.selectedOffer = null;
  renderFinder();
  document.querySelector("#finder-results-title").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#finder-form").addEventListener("change", event => {
  if (event.target.id === "aboard-date") syncAboardDateControl();
  renderFinder();
});
document.querySelector("#finder-reset").addEventListener("click", resetFinder);
document.querySelector("#clear-aboard-date").addEventListener("click", () => {
  const dateInput = document.querySelector("#aboard-date");
  dateInput.value = "";
  dateInput.blur();
  finderState.selectedOffer = null;
  syncAboardDateControl();
  renderFinder();
});
document.querySelector("#choose-aboard-date").addEventListener("click", () => {
  const dateInput = document.querySelector("#aboard-date");
  syncAboardDateControl(true);
  try {
    if (typeof dateInput.showPicker === "function") dateInput.showPicker();
    else dateInput.focus();
  } catch {
    dateInput.focus();
  }
});
document.querySelector("#aboard-date").addEventListener("change", () => syncAboardDateControl());
document.querySelector("#christmas-search").addEventListener("click", runChristmasSearch);
document.querySelector("#port-filters").addEventListener("change", () => {
  syncPortScopeAppearance(selectedPorts());
  updateAvailabilityControls();
});
document.querySelectorAll("[data-port-scope]").forEach(button => {
  button.addEventListener("click", () => {
    setPortScope(button.dataset.portScope);
    renderFinder();
  });
});
document.querySelectorAll("[data-finder-preset]").forEach(button => {
  button.addEventListener("click", () => {
    resetFinder();
    const preset = button.dataset.finderPreset;
    if (preset === "expiry") document.querySelector("#sailing-sort").value = "expiry";
    if (preset === "balcony") document.querySelector("#room-filter").value = "Balcony";
    renderFinder();
    document.querySelector("#finder-results-title").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
document.querySelector("#load-more").addEventListener("click", () => {
  finderState.limit += FINDER_PAGE_SIZE;
  renderFinder(false);
});
document.querySelector("#clear-compare").addEventListener("click", () => {
  finderState.compareKeys.clear();
  renderCompareTray();
  renderFinder(false);
});
document.querySelector("#open-compare").addEventListener("click", openComparison);
document.querySelector("#open-sync").addEventListener("click", () => document.querySelector("#sync-dialog").showModal());
document.querySelector("#open-sync-secondary").addEventListener("click", () => document.querySelector("#sync-dialog").showModal());
document.querySelector("#calendar-prev").addEventListener("click", () => shiftCalendar(-1));
document.querySelector("#calendar-next").addEventListener("click", () => shiftCalendar(1));

const saveSearchDialog = document.querySelector("#save-search-dialog");
const savedSearchName = document.querySelector("#saved-search-name");
document.querySelector("#save-current-search").addEventListener("click", () => {
  savedSearchName.value = searchNameSuggestion();
  saveSearchDialog.showModal();
  savedSearchName.focus();
  savedSearchName.select();
});
document.querySelector("#save-search-form").addEventListener("submit", event => {
  event.preventDefault();
  const name = savedSearchName.value.trim();
  if (!name) return;
  const search = captureCurrentSearch(name);
  search.matchCountAtSave = savedSearchMatchCount(search);
  savedSearches = [search, ...savedSearches].slice(0, 12);
  persistSavedSearches();
  renderSavedSearches();
  saveSearchDialog.close();
});
document.querySelector("#close-save-search").addEventListener("click", () => saveSearchDialog.close());
document.querySelector("#cancel-save-search").addEventListener("click", () => saveSearchDialog.close());
document.querySelector("#saved-search-list").addEventListener("click", event => {
  const applyButton = event.target.closest("[data-apply-saved-search]");
  if (applyButton) {
    const search = savedSearches.find(item => item.id === applyButton.dataset.applySavedSearch);
    if (search) applySavedSearch(search);
    return;
  }
  const deleteButton = event.target.closest("[data-delete-saved-search]");
  if (deleteButton) {
    savedSearches = savedSearches.filter(item => item.id !== deleteButton.dataset.deleteSavedSearch);
    persistSavedSearches();
    renderSavedSearches();
  }
});

const profileDialog = document.querySelector("#profile-dialog");
document.querySelector("[data-profile-open]").addEventListener("click", () => profileDialog.showModal());
document.querySelector("#reveal-number").addEventListener("click", event => {
  const number = document.querySelector("#masked-number");
  const hidden = number.textContent.includes("•");
  number.textContent = hidden ? PROFILE.memberNumber : `••••••${PROFILE.memberNumber.slice(-3)}`;
  event.currentTarget.textContent = hidden ? "Hide" : "Show";
});

document.querySelector("#member-select").addEventListener("change", event => {
  switchActiveMember(event.target.value);
});

switchActiveMember(DEFAULT_CLUB_ROYALE_MEMBER_ID);

const initialView = ["overview", "offers", "finder", "trips"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "overview";
switchView(initialView);
