/**
 * ============================================================================
 * MADINA HALAL SUPER — Customer ID (phone number) + Order Numbers
 * ============================================================================
 * A Google Apps Script web app, BOUND to a spreadsheet in the shop owner's
 * Google account. It is the shop's cross-device memory:
 *
 *   - "Customers" sheet — one row per customer, keyed by PHONE NUMBER.
 *     When a returning customer types their number at checkout, the shop
 *     page asks this script for their saved details and fills the form in.
 *   - "Orders" sheet — one row per order, each with its ORDER NUMBER
 *     (MS-0001, MS-0002, …), assigned here under a lock so numbers are
 *     never duplicated or skipped by two orders at the same moment.
 *   - "Meta" sheet — cell B1 holds the last order sequence number used.
 *     (Do not edit it by hand.)
 *
 * PRIVACY RULE (lookup): the full address + email are returned ONLY when
 * the postal code sent with the lookup matches the one on file. A phone
 * number on its own reveals just the customer's name and their saved
 * fulfilment / branch / payment preferences.
 *
 * ----------------------------------------------------------------------------
 * DEPLOY — one time, in the owner's Google account:
 *   1. Open the spreadsheet that should hold the records (create a new one
 *      if you like, e.g. "Madina Supershop — Orders & Customers"). The two
 *      record sheets are created automatically on first use.
 *   2. In that spreadsheet: Extensions → Apps Script. Delete any sample
 *      code in the editor and paste this WHOLE file in. Save (💾).
 *   3. Deploy → New deployment → choose type "Web app" (gear icon):
 *        Description:    Madina Supershop orders
 *        Execute as:     Me
 *        Who has access: Anyone
 *      → Deploy. (Google asks once to authorise the script — allow it.)
 *   4. Copy the Web app URL (it ends in /exec) and paste it into the shop's
 *      index.html as the ORDER_API_URL constant (top of the main script).
 *      Until that is done the feature stays dormant and the shop behaves
 *      exactly as before (orders recorded via the Google Form instead).
 *   5. If this file is ever changed: paste the new code, then
 *      Deploy → Manage deployments → edit (✎) → Version: New version →
 *      Deploy. (A plain save does NOT update the live web app.)
 * ============================================================================
 */

/* Column layouts — the shop and this script must agree on these. */
var CUSTOMER_HEADERS = ["phone", "name", "email", "zip", "prefecture", "city", "town",
  "street", "building", "fulfilment", "branch", "payment",
  "firstOrderAt", "lastOrderAt", "orderCount"];
var ORDER_HEADERS = ["orderNo", "dateTime", "phone", "name", "itemsText",
  "subtotal", "discount", "tax", "courierFee", "total",
  "fulfilment", "branchOrAddress", "payment", "pointsUse"];

/* ---------------- helpers ---------------- */

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Phone numbers are the customer ID: compare digits only, with the +81
   country code folded back to the domestic leading 0. A 10-digit number
   starting 7/8/9 is a mobile that lost its leading 0 (e.g. when a sheet
   cell was stored as a number) — restore the 0. */
function normalizePhone_(raw) {
  var d = String(raw == null ? "" : raw).replace(/\D/g, "");
  if (d.length > 10 && d.indexOf("81") === 0) d = "0" + d.slice(2);
  if (d.length === 10 && /^[789]/.test(d)) d = "0" + d;
  return d;
}

function zipDigits_(raw) {
  return String(raw == null ? "" : raw).replace(/\D/g, "");
}

function str_(v) { return v == null ? "" : String(v); }

function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (name === "Customers" || name === "Orders") {
      /* keep phone numbers as TEXT so the leading 0 is never lost */
      sh.getRange(name === "Customers" ? "A:A" : "C:C").setNumberFormat("@");
    }
    if (name === "Meta") sh.getRange("A1").setValue("lastOrderSeq — do not edit");
  }
  return sh;
}

function customersSheet_() { return sheet_("Customers", CUSTOMER_HEADERS); }
function ordersSheet_() { return sheet_("Orders", ORDER_HEADERS); }

function findCustomerRow_(sh, phone) {
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (normalizePhone_(values[i][0]) === phone) return { row: i + 1, values: values[i] };
  }
  return null;
}

function nowJst_() {
  return Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");
}

function dateTimeJst_(iso) {
  var d = iso ? new Date(iso) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  return Utilities.formatDate(d, "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");
}

/* ---------------- GET: customer lookup ----------------
   ?action=lookup&phone=09012345678&zip=4460071
   → { found:false }
   → { found:true, verified:false, name, fulfilment, branch, payment }
   → { found:true, verified:true, phone, name, email, zip, prefecture,
       city, town, street, building, fulfilment, branch, payment }      */
function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (!params.action) {
      return json_({ ok: true, service: "Madina Supershop — customer ID + order numbers" });
    }
    if (params.action !== "lookup") return json_({ ok: false, error: "unknown action" });

    var phone = normalizePhone_(params.phone || "");
    if (!phone) return json_({ found: false });

    var found = findCustomerRow_(customersSheet_(), phone);
    if (!found) return json_({ found: false });

    var v = found.values;
    var rec = {
      phone: str_(v[0]), name: str_(v[1]), email: str_(v[2]), zip: str_(v[3]),
      prefecture: str_(v[4]), city: str_(v[5]), town: str_(v[6]),
      street: str_(v[7]), building: str_(v[8]), fulfilment: str_(v[9]),
      branch: str_(v[10]), payment: str_(v[11])
    };
    var zipReq = zipDigits_(params.zip || "");
    var zipStored = zipDigits_(rec.zip);
    if (zipReq && zipStored && zipReq === zipStored) {
      var full = { found: true, verified: true };
      for (var k in rec) full[k] = rec[k];
      return json_(full);
    }
    /* Phone alone: name + preferences only — never the address or email. */
    return json_({
      found: true, verified: false,
      name: rec.name, fulfilment: rec.fulfilment,
      branch: rec.branch, payment: rec.payment
    });
  } catch (err) {
    return json_({ found: false, error: String(err && err.message ? err.message : err) });
  }
}

/* ---------------- POST: record an order ----------------
   Body: the order as JSON (phone, name, email, address fields, fulfilment,
   branch, payment, itemsText, subtotal, discount, tax, courierFee, total,
   pointsUse, dateTime). Assigns the next order number, appends the Orders
   row and upserts the customer — all under a lock.
   → { ok:true, orderNo:"MS-0001" }                                    */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var lock = LockService.getDocumentLock() || LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var orderNo = recordOrder_(payload);
      return json_({ ok: true, orderNo: orderNo });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function nextOrderNo_() {
  var cell = sheet_("Meta", null).getRange("B1");
  var n = Number(cell.getValue()) || 0;
  n += 1;
  cell.setValue(n);
  var s = String(n);
  while (s.length < 4) s = "0" + s;
  return "MS-" + s;
}

function recordOrder_(payload) {
  var phone = normalizePhone_(payload.phone || "");
  var orderNo = nextOrderNo_();
  var when = dateTimeJst_(payload.dateTime);

  var branchOrAddress = payload.fulfilment === "pickup"
    ? str_(payload.branch)
    : str_(payload.address);
  ordersSheet_().appendRow([
    orderNo, when, phone, str_(payload.name), str_(payload.itemsText),
    Number(payload.subtotal) || 0, Number(payload.discount) || 0,
    Number(payload.tax) || 0, Number(payload.courierFee) || 0,
    Number(payload.total) || 0, str_(payload.fulfilment), branchOrAddress,
    str_(payload.payment), Number(payload.pointsUse) || 0
  ]);

  upsertCustomer_(payload, phone, when);
  return orderNo;
}

/* Insert the customer, or refresh their saved details. A field is only
   overwritten when the new order actually carries a value for it, so a
   pickup order (no address) never wipes a saved courier address. */
function upsertCustomer_(payload, phone, when) {
  if (!phone) return;
  var sh = customersSheet_();
  var incoming = {
    name: payload.name, email: payload.email, zip: payload.zip,
    prefecture: payload.prefecture, city: payload.city, town: payload.town,
    street: payload.street, building: payload.building,
    fulfilment: payload.fulfilment, branch: payload.branch, payment: payload.payment
  };
  var found = findCustomerRow_(sh, phone);
  if (found) {
    var vals = found.values;
    for (var i = 1; i <= 11; i++) {
      var key = CUSTOMER_HEADERS[i];
      if (incoming[key] != null && String(incoming[key]) !== "") vals[i] = incoming[key];
    }
    vals[13] = when;                                   /* lastOrderAt */
    vals[14] = (Number(vals[14]) || 0) + 1;            /* orderCount */
    sh.getRange(found.row, 1, 1, CUSTOMER_HEADERS.length).setValues([vals]);
    sh.getRange(found.row, 1).setNumberFormat("@");
  } else {
    var row = [phone];
    for (var j = 1; j <= 11; j++) row.push(str_(incoming[CUSTOMER_HEADERS[j]]));
    row.push(when, when, 1);                           /* first, last, count */
    sh.appendRow(row);
    sh.getRange(sh.getLastRow(), 1).setNumberFormat("@");
  }
}
