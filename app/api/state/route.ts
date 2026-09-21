/// <reference types="@cloudflare/workers-types" />
import { env } from "cloudflare:workers";
import { schemaStatements } from "../../../db/schema";

export const dynamic = "force-dynamic";

type DatabaseEnv = { DB?: D1Database };

const allowedMemberIds = new Set(["mike", "tully"]);
const seedProfiles = [
  { id: "mike", display_name: "Mike", portal_name: "Michael", tier: "Prime", tier_credits: 1082, member_number_last4: "3429", snapshot_date: "2026-09-16" },
  { id: "tully", display_name: "Tully", portal_name: "Christine", tier: "Choice", tier_credits: 0, member_number_last4: "6861", snapshot_date: "2026-08-27" }
];
const seedBookings = [
  { id: "wonder-2026-11-27", ship: "Wonder", port: "Miami", depart: "2026-11-27", return: "2026-11-30", nights: 3, itinerary: "3 Night Bahamas & Perfect Day Cruise", itineraryStops: ["Miami", "Perfect Day at CocoCay", "Nassau", "Miami"], offer: "2602C05", cabin: "Ocean View Balcony Guarantee", cabinCode: "XB GTY", stateroom: "Guarantee assignment pending", obstructedView: "Pending", reservation: "9951558", crownAnchor: "385823429", companionCrownAnchor: "380366709", companionReservation: "5160477", issueDate: "2026-03-04", guestNames: ["Michael Hammonds", "Michael Hott"], fare: 379, fareLabel: "Net cruise fare after casino discounts", taxesFees: 271.48, total: 761.48, amountPaid: 761.48, balanceDue: 0, paymentStatus: "Paid in full", protection: "Declined", gratuities: "Prepaid — $111.00 included", cruiseGratuitiesStatus: "Paid — $111.00 prepaid and included", departureTime: "4:00 PM", diningSeating: "My Time dining", dining: "Unlimited Dining Package for two — $251.94 subtotal + $45.30 prepaid gratuities = $297.24, paid in full", diningPackage: "Unlimited Dining Package", diningPackageQuantity: 2, diningPackageSubtotal: 251.94, diningPackageGratuities: 45.30, diningPackageTotal: 297.24, diningPackagePaymentStatus: "Paid in full", diningPackageStatus: "Purchased — paid in full", diningGratuitiesStatus: "Paid — $45.30 prepaid and included in total", diningReservations: ["The Mason Jar brunch — Day 1 at 12:00 PM", "Chops Grille — Day 1 at 6:30 PM", "Giovanni's Italian Kitchen & Wine Bar — Day 2 at 6:30 PM", "Izumi Hibachi Experience lunch — Day 3 at 12:00 PM", "Chops Grille — Day 3 at 6:30 PM"], drinks: "Deluxe Beverage Package for two — $431.94 subtotal + $77.70 prepaid gratuities = $509.64, paid in full", drinkPackage: "Deluxe Beverage Package", drinkPackageQuantity: 2, drinkPackageSubtotal: 431.94, drinkPackageGratuities: 77.70, drinkPackageTotal: 509.64, drinkPackagePaymentStatus: "Paid in full", drinkPackageStatus: "Purchased — paid in full", drinkGratuitiesStatus: "Paid — $77.70 prepaid and included in total", freePlay: 150, companions: ["Michael Hott", "Spring & Jon"], maybes: ["Ryan & David", "Britney & Eoghan"], notes: "Two 100-minute massages booked for 3:00 PM on Day 1; massage gratuities prepaid.", checklist: ["Confirm terminal and arrival time", "Review dining reservations", "Download boarding passes"], completed: [] },
  { id: "wonder-2026-12-24", ship: "Wonder", port: "Miami", depart: "2026-12-24", return: "2026-12-28", nights: 4, itinerary: "4 Night Bahamas & Perfect Day Holiday", itineraryStops: ["Miami", "Nassau", "Cruising", "Perfect Day at CocoCay", "Miami"], offer: "26PAS603", cabin: "Interior", cabinCode: "4V", stateroom: "7275", obstructedView: "0%", reservation: "9473667", crownAnchor: "385823429", companionCrownAnchor: "392016861", issueDate: "2026-08-29", fare: 0, fareLabel: "Cruise fare after Club Royale discounts", taxesFees: 280.80, total: 280.80, amountPaid: 280.80, balanceDue: 0, paymentStatus: "Paid in full", gratuities: "Not prepaid", cruiseGratuitiesStatus: "Not paid — not prepaid", dining: "5:00 PM dining waitlist", diningPackageStatus: "Not purchased — traditional dining waitlist only", diningGratuitiesStatus: "Not applicable", drinks: "Deluxe Beverage Package for Michael and Christine (quantity 2) — $527.92 subtotal + $94.96 gratuities = $622.88, paid in full", drinkPackage: "Deluxe Beverage Package", drinkPackageQuantity: 2, drinkPackageSubtotal: 527.92, drinkPackageGratuities: 94.96, drinkPackageTotal: 622.88, drinkPackagePaymentStatus: "Paid in full", drinkPackageStatus: "Purchased — paid in full", drinkGratuitiesStatus: "Paid — $94.96", totalPaid: 903.68, freePlay: 75, companions: ["Christine Tully"], maybes: [], protection: "Declined", checkInWindow: "12:00 PM–3:00 PM", departureTime: "4:30 PM", notes: "No cabin upgrade purchased yet. Interior stateroom 7275 is category 4V with a 0% obstructed view. Vacation protection was declined.", checklist: ["Decide whether to upgrade the cabin", "Decide whether to prepay gratuities", "Confirm the 5:00 PM dining waitlist", "Complete online check-in and download boarding passes"], completed: [] },
  { id: "wonder-2027-01-15", ship: "Wonder", port: "Miami", depart: "2027-01-15", return: "2027-01-19", nights: 4, offer: "26MIX404", cabin: "Junior Suite", reservation: "8305296", crownAnchor: "385823429", total: 457.58, gratuities: "Not prepaid", cruiseGratuitiesStatus: "Not paid — not prepaid", dining: "Not purchased", diningPackageStatus: "Not purchased", diningGratuitiesStatus: "Not applicable", drinks: "Not purchased", drinkPackageStatus: "Not purchased", drinkGratuitiesStatus: "Not applicable", freePlay: 0, companions: [], maybes: [], notes: "", checklist: ["Decide on dining package", "Decide on drink package", "Review gratuity options"], completed: [] },
  { id: "harmony-2027-02-25", ship: "Harmony", port: "Orlando (Port Canaveral)", depart: "2027-02-25", return: "2027-03-02", nights: 5, offer: "Annual Cruise 26Tier3", cabin: "Balcony", reservation: "2046831", companionReservation: "4725996", crownAnchor: "385823429", total: 733.96, gratuities: "Prepaid", cruiseGratuitiesStatus: "Paid — prepaid", dining: "Not purchased", diningPackageStatus: "Not purchased", diningGratuitiesStatus: "Not applicable", drinks: "Not purchased", drinkPackageStatus: "Not purchased", drinkGratuitiesStatus: "Not applicable", freePlay: 0, companions: ["Mom & Dad"], maybes: [], notes: "Mom & Dad are booked on their own reservation.", checklist: ["Coordinate arrival with Mom & Dad", "Decide on dining package", "Decide on drink package"], completed: [] }
];

function database() {
  return (env as unknown as DatabaseEnv).DB;
}

function localState(memberId: string, request: Request) {
  return Response.json({
    memberId,
    profiles: seedProfiles,
    viewer: { email: request.headers.get("oai-authenticated-user-email") || null },
    bookings: memberId === "mike" ? seedBookings : [],
    savedSearches: [],
    offerStatuses: [],
    snapshots: []
  }, { headers: { "Cache-Control": "no-store" } });
}

function requestedMember(request: Request, body?: Record<string, unknown>) {
  const memberId = String(body?.memberId || new URL(request.url).searchParams.get("member") || "mike").toLowerCase();
  return allowedMemberIds.has(memberId) ? memberId : null;
}

async function initialize(db: D1Database) {
  await db.batch(schemaStatements.map(statement => db.prepare(statement)));
  const now = new Date().toISOString();
  await db.batch([
    db.prepare("INSERT OR IGNORE INTO member_profiles (id, display_name, portal_name, tier, tier_credits, member_number_last4, snapshot_date, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind("mike", "Mike", "Michael", "Prime", 1082, "3429", "2026-09-12", now),
    db.prepare("INSERT OR IGNORE INTO member_profiles (id, display_name, portal_name, tier, tier_credits, member_number_last4, snapshot_date, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind("tully", "Tully", "Christine", "Choice", 0, "6861", "2026-08-27", now),
    ...seedBookings.map(booking => db.prepare("INSERT OR IGNORE INTO member_bookings (member_id, id, data_json, updated_at) VALUES (?, ?, ?, ?)").bind("mike", booking.id, JSON.stringify(booking), now)),
    db.prepare("UPDATE member_bookings SET data_json = json_set(data_json, '$.drinks', ?, '$.drinkPackage', ?, '$.drinkPackageQuantity', ?, '$.drinkPackageSubtotal', ?, '$.drinkPackageGratuities', ?, '$.drinkPackageTotal', ?, '$.drinkPackagePaymentStatus', ?, '$.totalPaid', ?), updated_at = ? WHERE member_id = 'mike' AND id = 'wonder-2026-12-24' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'christmas_drinks_v1')")
      .bind("Deluxe Beverage Package for Michael and Christine (quantity 2) — $527.92 subtotal + $94.96 gratuities = $622.88, paid in full", "Deluxe Beverage Package", 2, 527.92, 94.96, 622.88, "Paid in full", 903.68, now),
    db.prepare("INSERT OR IGNORE INTO app_metadata (key, value) VALUES ('christmas_drinks_v1', ?)").bind(now),
    db.prepare("UPDATE member_bookings SET data_json = json_set(data_json, '$.cruiseGratuitiesStatus', 'Paid — prepaid and included', '$.diningPackageStatus', 'Purchased', '$.diningGratuitiesStatus', 'Not recorded', '$.drinkPackageStatus', 'Purchased', '$.drinkGratuitiesStatus', 'Not recorded'), updated_at = ? WHERE member_id = 'mike' AND id = 'wonder-2026-11-27' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'booking_cost_sections_v1')").bind(now),
    db.prepare("UPDATE member_bookings SET data_json = json_set(data_json, '$.cruiseGratuitiesStatus', 'Not paid — not prepaid', '$.diningPackageStatus', 'Not purchased — traditional dining waitlist only', '$.diningGratuitiesStatus', 'Not applicable', '$.drinkPackageStatus', 'Purchased — paid in full', '$.drinkGratuitiesStatus', 'Paid — $94.96'), updated_at = ? WHERE member_id = 'mike' AND id = 'wonder-2026-12-24' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'booking_cost_sections_v1')").bind(now),
    db.prepare("UPDATE member_bookings SET data_json = json_set(data_json, '$.cruiseGratuitiesStatus', 'Not paid — not prepaid', '$.diningPackageStatus', 'Not purchased', '$.diningGratuitiesStatus', 'Not applicable', '$.drinkPackageStatus', 'Not purchased', '$.drinkGratuitiesStatus', 'Not applicable'), updated_at = ? WHERE member_id = 'mike' AND id = 'wonder-2027-01-15' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'booking_cost_sections_v1')").bind(now),
    db.prepare("UPDATE member_bookings SET data_json = json_set(data_json, '$.cruiseGratuitiesStatus', 'Paid — prepaid', '$.diningPackageStatus', 'Not purchased', '$.diningGratuitiesStatus', 'Not applicable', '$.drinkPackageStatus', 'Not purchased', '$.drinkGratuitiesStatus', 'Not applicable'), updated_at = ? WHERE member_id = 'mike' AND id = 'harmony-2027-02-25' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'booking_cost_sections_v1')").bind(now),
    db.prepare("INSERT OR IGNORE INTO app_metadata (key, value) VALUES ('booking_cost_sections_v1', ?)").bind(now),
    db.prepare("UPDATE member_bookings SET data_json = json_set(data_json, '$.paymentStatus', 'Paid in full', '$.dining', 'Specialty dining package — $297.24 total, paid in full with gratuities prepaid', '$.diningPackage', 'Specialty dining package', '$.diningPackageTotal', 297.24, '$.diningPackagePaymentStatus', 'Paid in full', '$.diningPackageStatus', 'Purchased — paid in full', '$.diningGratuitiesStatus', 'Paid — prepaid and included in total', '$.drinks', 'Drink package — $509.64 total, paid in full with gratuities prepaid', '$.drinkPackage', 'Drink package', '$.drinkPackageTotal', 509.64, '$.drinkPackagePaymentStatus', 'Paid in full', '$.drinkPackageStatus', 'Purchased — paid in full', '$.drinkGratuitiesStatus', 'Paid — prepaid and included in total'), updated_at = ? WHERE member_id = 'mike' AND id = 'wonder-2026-11-27' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'november_packages_v1')").bind(now),
    db.prepare("UPDATE member_bookings SET data_json = json_remove(data_json, '$.companionTotal'), updated_at = ? WHERE member_id = 'mike' AND id = 'harmony-2027-02-25' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'november_packages_v1')").bind(now),
    db.prepare("INSERT OR IGNORE INTO app_metadata (key, value) VALUES ('november_packages_v1', ?)").bind(now),
    db.prepare("UPDATE member_bookings SET data_json = json_set(data_json, '$.itinerary', '3 Night Bahamas & Perfect Day Cruise', '$.itineraryStops', json('[\"Miami\",\"Perfect Day at CocoCay\",\"Nassau\",\"Miami\"]'), '$.cabin', 'Ocean View Balcony Guarantee', '$.cabinCode', 'XB GTY', '$.stateroom', 'Guarantee assignment pending', '$.obstructedView', 'Pending', '$.companionCrownAnchor', '380366709', '$.issueDate', '2026-03-04', '$.guestNames', json('[\"Michael Hammonds\",\"Michael Hott\"]'), '$.fareLabel', 'Net cruise fare after casino discounts', '$.taxesFees', 271.48, '$.amountPaid', 761.48, '$.balanceDue', 0, '$.protection', 'Declined', '$.gratuities', 'Prepaid — $111.00 included', '$.cruiseGratuitiesStatus', 'Paid — $111.00 prepaid and included', '$.departureTime', '4:00 PM', '$.diningSeating', 'My Time dining', '$.companions', json('[\"Michael Hott\",\"Spring & Jon\"]'), '$.dining', 'Unlimited Dining Package for two — $251.94 subtotal + $45.30 prepaid gratuities = $297.24, paid in full', '$.diningPackage', 'Unlimited Dining Package', '$.diningPackageQuantity', 2, '$.diningPackageSubtotal', 251.94, '$.diningPackageGratuities', 45.30, '$.diningPackageTotal', 297.24, '$.diningGratuitiesStatus', 'Paid — $45.30 prepaid and included in total', '$.diningReservations', json('[\"The Mason Jar brunch — Day 1 at 12:00 PM\",\"Chops Grille — Day 1 at 6:30 PM\",\"Giovanni''s Italian Kitchen & Wine Bar — Day 2 at 6:30 PM\",\"Izumi Hibachi Experience lunch — Day 3 at 12:00 PM\",\"Chops Grille — Day 3 at 6:30 PM\"]'), '$.drinks', 'Deluxe Beverage Package for two — $431.94 subtotal + $77.70 prepaid gratuities = $509.64, paid in full', '$.drinkPackage', 'Deluxe Beverage Package', '$.drinkPackageQuantity', 2, '$.drinkPackageSubtotal', 431.94, '$.drinkPackageGratuities', 77.70, '$.drinkPackageTotal', 509.64, '$.drinkGratuitiesStatus', 'Paid — $77.70 prepaid and included in total'), updated_at = ? WHERE member_id = 'mike' AND id = 'wonder-2026-11-27' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'november_receipt_details_v1')").bind(now),
    db.prepare("INSERT OR IGNORE INTO app_metadata (key, value) VALUES ('november_receipt_details_v1', ?)").bind(now),
    db.prepare("UPDATE member_profiles SET snapshot_date = '2026-09-10', updated_at = ? WHERE id = 'mike' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'mike_snapshot_2026_09_10')").bind(now),
    db.prepare("INSERT OR IGNORE INTO member_offer_snapshots (member_id, id, snapshot_date, unique_offers, usable_slots, sailing_rows, data_json) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind("mike", "refresh-2026-09-10", "2026-09-10", 6, 7, 892, JSON.stringify({
        note: "September Monthly Mix was added since the last published snapshot. Six prior codes are no longer active; booked offer 26PAS603 remains on the Christmas trip.",
        newCodes: ["26RCL904"],
        removedCodes: ["26TOR504", "26RCL804", "26TOR404", "26PAS603", "26OCT105", "26BAF306"],
        changedCodes: [],
        duplicateCodes: ["26TOR604"],
        christmasMatch: false
      })),
    db.prepare("INSERT OR IGNORE INTO app_metadata (key, value) VALUES ('mike_snapshot_2026_09_10', ?)").bind(now),
    db.prepare("UPDATE member_profiles SET snapshot_date = '2026-09-12', updated_at = ? WHERE id = 'mike' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'mike_snapshot_2026_09_12')").bind(now),
    db.prepare("INSERT OR IGNORE INTO member_offer_snapshots (member_id, id, snapshot_date, unique_offers, usable_slots, sailing_rows, data_json) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind("mike", "refresh-2026-09-12", "2026-09-12", 4, 6, 897, JSON.stringify({
        note: "Super Spins was added and appears twice. Three expired codes were retired from the active listing.",
        newCodes: ["26TOR704"],
        removedCodes: ["26VAR504", "26MIX504", "26EST204"],
        changedCodes: [],
        duplicateCodes: ["26TOR704", "26TOR604"],
        christmasMatch: false
      })),
    db.prepare("INSERT OR IGNORE INTO app_metadata (key, value) VALUES ('mike_snapshot_2026_09_12', ?)").bind(now),
    db.prepare("UPDATE member_profiles SET snapshot_date = '2026-09-16', updated_at = ? WHERE id = 'mike' AND NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'mike_snapshot_2026_09_16')").bind(now),
    db.prepare("INSERT OR IGNORE INTO member_offer_snapshots (member_id, id, snapshot_date, unique_offers, usable_slots, sailing_rows, data_json) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind("mike", "refresh-2026-09-16", "2026-09-16", 3, 4, 459, JSON.stringify({
        note: "Play Your Way (26TOR604) expired on schedule Sep 15 and dropped off the account. Super Spins (26TOR704) now carries $100 bonus FreePlay (previously none); redeem-by, uses, and cabin terms unchanged. September Monthly Mix and Autumn Showdown unchanged. Autumn Showdown redeems by Sep 16, 2026 (same day as this check).",
        newCodes: [],
        removedCodes: ["26TOR604"],
        changedCodes: ["26TOR704"],
        duplicateCodes: ["26TOR704"],
        christmasMatch: false
      })),
    db.prepare("INSERT OR IGNORE INTO app_metadata (key, value) VALUES ('mike_snapshot_2026_09_16', ?)").bind(now),
    db.prepare("INSERT OR IGNORE INTO member_bookings (member_id, id, data_json, updated_at) SELECT 'mike', id, data_json, updated_at FROM bookings WHERE NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'multi_member_v1')"),
    db.prepare("INSERT OR IGNORE INTO member_saved_searches (member_id, id, name, criteria_json, created_at, updated_at) SELECT 'mike', id, name, criteria_json, created_at, updated_at FROM saved_searches WHERE NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'multi_member_v1')"),
    db.prepare("INSERT OR IGNORE INTO member_offer_statuses (member_id, slot_key, status, notes, updated_at) SELECT 'mike', slot_key, status, notes, updated_at FROM offer_statuses WHERE NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'multi_member_v1')"),
    db.prepare("INSERT OR IGNORE INTO member_offer_snapshots (member_id, id, snapshot_date, unique_offers, usable_slots, sailing_rows, data_json) SELECT 'mike', id, snapshot_date, unique_offers, usable_slots, sailing_rows, data_json FROM offer_snapshots WHERE NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'multi_member_v1')"),
    db.prepare("INSERT OR IGNORE INTO member_offer_snapshots (member_id, id, snapshot_date, unique_offers, usable_slots, sailing_rows, data_json) VALUES (?, ?, ?, ?, ?, ?, ?)").bind("tully", "baseline-2026-08-27", "2026-08-27", 12, 12, 1207, JSON.stringify({ note: "Initial verified Tully baseline; one FreePlay-only offer excluded from Finder" })),
    db.prepare("INSERT OR IGNORE INTO app_metadata (key, value) VALUES ('multi_member_v1', ?)").bind(now)
  ]);
}

function parsedRows<T>(rows: Array<Record<string, unknown>>, field: string) {
  return rows.map(row => JSON.parse(String(row[field])) as T);
}

export async function GET(request: Request) {
  const memberId = requestedMember(request);
  if (!memberId) return Response.json({ ok: false, error: "Unknown member" }, { status: 400 });
  const db = database();
  if (!db) return localState(memberId, request);
  await initialize(db);
  const [profileRows, bookingRows, searchRows, statusRows, snapshotRows] = await Promise.all([
    db.prepare("SELECT id, display_name, portal_name, tier, tier_credits, member_number_last4, snapshot_date FROM member_profiles ORDER BY CASE id WHEN 'mike' THEN 0 ELSE 1 END").all(),
    db.prepare("SELECT data_json FROM member_bookings WHERE member_id = ? ORDER BY json_extract(data_json, '$.depart')").bind(memberId).all(),
    db.prepare("SELECT criteria_json FROM member_saved_searches WHERE member_id = ? ORDER BY updated_at DESC LIMIT 20").bind(memberId).all(),
    db.prepare("SELECT slot_key, status, notes, updated_at FROM member_offer_statuses WHERE member_id = ?").bind(memberId).all(),
    db.prepare("SELECT id, snapshot_date, unique_offers, usable_slots, sailing_rows, data_json FROM member_offer_snapshots WHERE member_id = ? ORDER BY snapshot_date DESC").bind(memberId).all()
  ]);
  return Response.json({
    memberId,
    profiles: profileRows.results,
    viewer: { email: request.headers.get("oai-authenticated-user-email") || null },
    bookings: parsedRows(bookingRows.results as Array<Record<string, unknown>>, "data_json"),
    savedSearches: parsedRows(searchRows.results as Array<Record<string, unknown>>, "criteria_json"),
    offerStatuses: statusRows.results,
    snapshots: snapshotRows.results
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const memberId = requestedMember(request, body);
  if (!memberId) return Response.json({ ok: false, error: "Unknown member" }, { status: 400 });
  const db = database();
  if (!db) return Response.json({ ok: true, memberId, localOnly: true });
  await initialize(db);
  const now = new Date().toISOString();

  if (body.action === "save_searches" && Array.isArray(body.items)) {
    const items = body.items.slice(0, 20) as Array<Record<string, unknown>>;
    await db.batch([
      db.prepare("DELETE FROM member_saved_searches WHERE member_id = ?").bind(memberId),
      ...items.map(item => db.prepare("INSERT INTO member_saved_searches (member_id, id, name, criteria_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(memberId, String(item.id), String(item.name), JSON.stringify(item), String(item.savedAt || now), now))
    ]);
  } else if (body.action === "save_status") {
    await db.prepare("INSERT INTO member_offer_statuses (member_id, slot_key, status, notes, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(member_id, slot_key) DO UPDATE SET status = excluded.status, notes = excluded.notes, updated_at = excluded.updated_at")
      .bind(memberId, String(body.slotKey), String(body.status), String(body.notes || ""), now).run();
  } else if (body.action === "save_booking" && body.booking && typeof body.booking === "object") {
    const booking = body.booking as Record<string, unknown>;
    const standardizedBooking = {
      cruiseGratuitiesStatus: "Not recorded",
      diningPackageStatus: "Not recorded",
      diningGratuitiesStatus: "Not recorded",
      drinkPackageStatus: "Not recorded",
      drinkGratuitiesStatus: "Not recorded",
      ...booking
    };
    await db.prepare("INSERT INTO member_bookings (member_id, id, data_json, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(member_id, id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at")
      .bind(memberId, String(booking.id), JSON.stringify(standardizedBooking), now).run();
  } else {
    return Response.json({ ok: false, error: "Unsupported action" }, { status: 400 });
  }
  return Response.json({ ok: true, memberId });
}
