# MADINA HALAL SUPER

A simple online halal grocery shop for Madina Halal Restaurant & Foods (Gold Family Co. Ltd).
(The shop's own brand name is **MADINA HALAL SUPER** — EN/ID “MADINA HALAL SUPER”, JP 「マディナ ハラルスーパー」.
The restaurant business name “Madina Halal Restaurant & Foods” is unchanged and still appears
where it belongs — branch / pickup names, the logo, contact lines.)

- **Shop front:** `index.html` — customers order here; the order is sent to the shop on WhatsApp.
- **Admin panel:** `admin.html` — Ali adds / edits / deletes products here. Big buttons, English only.
- **Product data:** `products.json` — the single list of products. The shop reads it; the admin saves it.

**Admin panel layout — TABS:** the admin is organised as a sticky tab bar under the
header; exactly one section shows at a time, so anyone in the office can run it without
scrolling through everything. Tabs: **📦 Products** (the Add/Edit
form + the product list) · **🧾 Orders** · **👥 Customers** · **🪙 Points** · **📊 Sales** ·
**📢 News** · **🎟 Coupons & Tax** · **💬 Templates** · **⚙️ Setup** (GitHub token, one-time).
The last-open tab is remembered on the device (`localStorage` key `madina_admin_tab`,
default Products). If no token is saved on the device, the Products tab shows a
“setup needed” notice instead of the product panels (the Setup tab stays reachable, and
the other tabs keep working — they never needed the token).

**Add/Edit form (Products tab) — the ONE add flow:** there is exactly one way to add a
product (an earlier duplicate “⚡ Quick Add” card was removed — it confused the owner).
The visible flow is just: two big photo boxes (**FRONT** / **BACK** — tap a box to pick
that photo; picking two photos at once on FRONT makes the second one the BACK
automatically) → English + Japanese names → Price and Size side by side → category chips
→ one big **Add & Save** button (applies the form AND saves to the shop in a single
press). The rarely-used fields — Indonesian name, stock, photo URL fields, the
new-category box, and the Show-in-shop / ⭐ Popular switches — live in a collapsed
**“More options”** section; it opens automatically when editing a product that already
has a value in one of those fields. Every press of the button ends with a **big
confirmation banner** at the top of the form (it scrolls itself into view): green
“✅ Added — <name> is now live on the shop.” for a new product, “✅ Saved — <name>
updated.” for an edit, or a red banner with the error if the save failed — never
silence. After a successful add (or edit) the form **resets itself** to a blank
“add a new product” state, ready for the next product, and the product is in the list
below. If the save fails, the form keeps everything the owner typed, and a just-added
product switches to edit mode so pressing the button again updates it instead of
adding a duplicate. A manual **↺ Reset form** button is still there too.

## How saving works (GitHub is the database)

There is no server and no monthly fee. The product list lives in one file, `products.json`,
inside the GitHub repository **goldfamilyjp/madina-supershop** (GitHub Pages hosts the site for free).

- The shop front (`index.html`) simply fetches `products.json` and shows every product whose
  `active` field is absent or `true` (see “Show / hide a product” below).
- The admin panel (`admin.html`) reads and writes that same file through the **GitHub Contents API**.
  To prove it is really Ali, GitHub asks for a **personal access token** (like a password).
- The token is typed once into the admin page and kept **only in that browser's localStorage, on Ali's own device**.
  It is never written into any file, never committed, and never sent anywhere except to `api.github.com`.
- Every “💾 Save to shop” press commits the new `products.json` to GitHub; GitHub Pages then serves the
  updated shop within about 1–2 minutes.
- Product photos can be a normal image URL, or a photo file chosen in the admin — the file is shrunk in the
  browser (max 480 px wide, JPEG) and stored inside `products.json` as a small data-URI, so no separate
  image hosting is needed. Keep photos small; very large `products.json` files load slowly.
- **Two photos per product (front + back):** each product has the main `photo` field and an optional
  `photo2` field (the back side — same URL / data-URI format). In the admin, the Add/Edit form
  shows two big photo boxes — **FRONT** and **BACK** — and tapping
  a box picks that photo (the photo URL fields live in the form's “More options” section);
  photo files go through the same resize pipeline (OCR reads Photo 1 only). On the shop front, a product with both photos shows a small “1 / 2” badge on the photo —
  the customer taps the photo — or swipes it sideways — to switch to the back (“2 / 2”) and taps or
  swipes again to return. (A vertical swipe still scrolls the page as usual.) Products with a
  single photo (or none) look and behave exactly as before.
- **Photo zoom (lightbox):** every product card with a photo has a small 🔍 button on the photo. Tapping
  it opens the photo full-screen: pinch to zoom (or double-tap / double-click to toggle between fit and
  2×, then drag to pan; the mouse wheel zooms on desktop). With two photos, ‹ › buttons switch front/back
  inside the overlay with the same “1 / 2” indicator — and so does a sideways swipe while the photo is
  at fit size (when zoomed in, a drag pans instead, never switches). ✕, a tap on the dark backdrop, or the Escape key
  closes it, and the page scrolls again afterwards. Tapping the card photo itself still only switches
  front/back — the 🔍 button is the only way into the zoom view.
- **⭐ Popular flag:** each product has an optional `popular` boolean (absent/false = not popular).
  Starred, visible products appear in the shop's top slideshow — see “⭐ Popular slideshow” below.

## Business rules

- Orders go to WhatsApp **090-6584-2039** (one press on “Confirm Order” shows the ticket and opens WhatsApp).
  The WhatsApp message includes the fulfilment choice, payment method, the delivery address block
  (courier orders), the delivery fee line, and the grand total.
- **Fulfilment — the customer chooses at checkout:**
  1. **Pickup （店頭受取）** at the Anjo or Toyota branch — always free; pay at the shop.
  2. **Courier delivery （宅配便）** to the customer's address (name / address / phone collected at checkout).
     There is **no distance limit**. Courier fee: **FREE at ¥10,000 or more**. Under ¥10,000 the fee depends
     on the payment method: **¥990 for bank / Japan Post transfer**, **¥1,800 for cash on delivery （代引き）**
     (the courier company charges more for COD). Pickup is always ¥0.
- **Payment for courier delivery** (pickup customers simply pay at the shop):
  - ゆうちょ銀行振込 (Japan Post Bank transfer)
  - 銀行振込 (bank transfer)
  - 代引き (cash on delivery — pay the courier on arrival)
  - For both transfer methods the ticket says: pay first, goods are shipped **after the transfer is
    confirmed**, and delivery takes **about 3 days** （振込確認後に発送、到着まで約3日）.
  - Bank account details are **not** hardcoded yet: they live in the clearly-marked `BANK_INFO`
    constants at the top of the checkout script in `index.html`
    (`yucho: "（ゆうちょ：未設定）"`, `bank: "（銀行：未設定）"`), are shown on the ticket only when a
    transfer method is chosen, and must be filled in with the owner's confirmed details (see Remaining steps).

## Order confirmation email (optional, via FormSubmit)

At checkout the customer may enter an email address (optional). If they do, pressing
“Confirm Order” does two things:

1. The normal WhatsApp order (unchanged — always the main channel).
2. The order is also POSTed to **FormSubmit** (`formsubmit.co/ajax/goldfamilyjp@yahoo.com`).
   FormSubmit emails the full order to the shop inbox **goldfamilyjp@yahoo.com**, and sends the
   customer an **automatic confirmation email** (the `_autoresponse`) with their order summary,
   the grand total, and payment instructions for their chosen method — transfer customers get the
   `BANK_INFO` account details plus “we ship after the transfer is confirmed, delivery takes about
   3 days”; COD customers are told to pay the courier; pickup customers are told to pay at the branch.

Notes:

- The POST is fire-and-forget: if it fails (offline, FormSubmit down), the WhatsApp order still
  completes normally. The customer only sees a small “Confirmation email sent” note when it succeeds.
- **Activation (one time):** the **first** real submission triggers a FormSubmit **activation email**
  to goldfamilyjp@yahoo.com. The owner must click the link in that email **once** before any
  confirmation emails flow. Until then, submissions are held by FormSubmit.
- The confirmation email to the customer is sent **by FormSubmit's system** (from a FormSubmit
  address), **not** from the Yahoo address itself — the shop's copy arrives in the Yahoo inbox.

## Orders auto-save (Google Sheet)

**Every** order — not just ones where the customer entered an email — is also saved to a
spreadsheet, so the shop has a permanent order book:

- On “Confirm Order”, alongside the WhatsApp order (and the optional FormSubmit email), the shop
  page fire-and-forget POSTs the order to a **Google Form** owned by the shop's Google account
  (`goldfamilyjp@yahoo.com`). The form appends each order to its linked **Google Sheet**:
  注文明細 (item lines, plus the 配送料 line for courier orders), 合計金額， お名前， 電話番号，
  メールアドレス, 受取方法 （店頭受取（安城店）/ 店頭受取（豊田店）/ 宅配便）, 支払方法
  （店頭支払い / ゆうちょ銀行振込 / 銀行振込 / 代引き）, 住所・受取店舗， ポイント利用希望.
- The POST uses `mode: "no-cors"` (Google sends no CORS headers) and can never block or delay the
  WhatsApp order — if it fails, the order still completes normally.
- **Exception:** once the customer-ID feature below is switched on, this Form POST is skipped
  for orders the Apps Script records successfully (its “Orders” sheet becomes the record);
  the Form remains the fallback whenever the script cannot be reached.
- The sheet is **private to the owner's Google account** — it is not shared with anyone.
  The **WhatsApp order remains the immediate alert**; the sheet is the saved record.
- Staff open it from the admin panel's **🧾 Orders** tab
  (button → `https://docs.google.com/spreadsheets/d/1NYooZTu01gP6cmp5k8we60Uhz4KKhgU4993zGIgt5Hw/edit`).

## 📱 Customer ID (phone number) + order numbers

The customer's **mobile phone number is their ID**. A small Google Apps Script web app
(`apps-script.gs`, bound to a spreadsheet in the owner's Google account) is the cross-device
store behind it — customers are recognised on any phone or browser, not just the device they
last ordered on. The on-device “remember my details” (below) still runs as the instant first
layer; this feature is the second, permanent layer.

**How it flows**

- **Checkout starts with the phone number** — it is the first field of the checkout form, with a
  trilingual hint: 前回ご注文の方は、番号を入れると住所などが自動で入ります / *If you ordered
  before, enter your number and your details will fill in automatically* / *Jika pernah memesan,
  masukkan nomor Anda dan data akan terisi otomatis*.
- **Lookup:** when the phone field loses focus (or reaches 10–11 digits, debounced) the page
  calls the script with the phone number — and with the postal code too, once one is in the
  form; completing a 7-digit postal code triggers a second lookup. Returned values fill **only
  fields that are still empty** (typed values are never overwritten), plus the saved
  fulfilment / branch / payment preferences. A small trilingual line under the phone field —
  お客様情報を見つけました / *Found your details* / *Data Anda ditemukan* — confirms the fill.
  A new customer simply types number first, then the rest; the order itself saves them.
- **Privacy rule:** the script returns the **full address and email only when the postal code
  matches** the one on file. A phone number on its own reveals just the customer's **name and
  saved preferences** — knowing someone's number is not enough to pull their address.
- **Order numbers:** on Confirm, the order is POSTed to the script first — **two attempts,
  25 seconds each** (Apps Script cold starts routinely exceed the old single 8-second shot,
  which used to drop real orders to the no-number fallback). Both attempts send the identical
  body, including a **`clientOrderId`** generated once per Confirm press, so a duplicate sheet
  row left by a lost-response retry is identifiable by that shared ID. While the POST is in
  flight the Confirm button reads “送信中… / Sending order… / Mengirim…”. The
  script — under a lock, so numbers are never duplicated — assigns the next number
  (**MS-0001, MS-0002, …**), appends the order to its **“Orders”** sheet and upserts the
  customer in **“Customers”** (details refreshed, order count +1; a field is only overwritten
  when the new order carries a value, so a pickup order never wipes a saved address). The
  number comes back and is printed at the **top of the ticket**, as the **first line of the
  WhatsApp order text**, and stored in the Orders row.
- **Fallback — an order is never lost:** only when *both* script attempts fail (offline,
  timeout, bad response) does the shop fall back to the Google Form POST exactly as before,
  with no order number shown. And when the script path succeeds, the Form POST is **skipped** — the
  script's Orders sheet is the record then, so nothing is ever double-recorded. The
  confirmation email and the device-local remember-me run the same either way.
- **Points balance at checkout:** at the same moments (phone blur / 10–11 digits, debounced),
  the checkout also looks the number up in `points.json` — the exact mechanism of the
  points check card (SHA-256 of the digits, `computePointBalances`) — and shows a small
  trilingual **points card** under the phone field: an *Available points* row with
  **X pt (= ¥X)**, and when points are still maturing a *Pending points* row (**Y pt**)
  plus the earliest date they become usable (the smallest `matures` date among the
  pending earn entries — shown only when that date is actually stored, never guessed).
  Both shop points cards (this checkout card and the standalone points check under the
  hero) render the balances as **colourful stat boxes — the same green/amber boxes as
  the admin panel's points summary**: a deep-green *Available* box (white text, big
  number, "(= ¥X)" under it) and, when there are pending points, an amber/gold
  *Pending* box beside it (stacked on narrow phones), with the maturity note under
  the boxes.
  The **Points to use** input sits directly under the card, so balance → use reads as
  one flow. No record or a failed fetch shows nothing. This works **with or without**
  the Apps Script feature, since `points.json` already lives next to the page. The points-phone field is prefilled
  from the main phone field when empty, and asking to use **more points than the available
  balance** triggers the usual soft warning at Confirm — warned once, the customer may
  proceed; the shop still confirms the balance by hand before applying any discount.

**Status: SWITCHED ON (2026-11-21).** The script is deployed in the owner's Google account
and `ORDER_API_URL` in `index.html` now holds the live **/exec URL**, so the feature is
active in production: lookups fill returning customers' details and every order gets its
MS-number from the script (the Google Form is now only the failure fallback). Setting the
constant back to empty would return the shop to the dormant, Form-only behaviour.

**The live contract (what the shop sends / expects)**

- **Order POST** — the JSON body carries `action: "order"`, the items text **twice** —
  as `items` and as `itemsText` (the same string) — and the points request **twice** —
  as `pointsUsed` and as `pointsUse` (the same number) — alongside all the other order
  fields (phone, name, address parts, totals, …). The script answers
  `{ ok: true, orderNo: "MS-0001" }`.
- **Lookup GET** — `?action=lookup&phone=…&zip=…`. The answer is
  `{ ok: true, found: true, name, fulfilment, branch, payment }`, and **only when the
  postal code matched** it additionally carries `email, zip, prefecture, city, town,
  street, building`. There is **no `verified` flag**: the shop treats the answer as
  zip-verified when `verified === true` **or** the address keys (`email` + `zip`) are
  present, and only then fills the address fields.

**Deployed script vs `apps-script.gs` in this folder**

The script actually running in the owner's account is a **functionally equivalent
variant** of the `apps-script.gs` kept here (the local file is the original variant; the
two differ in the contract details above, which is why the shop sends the duplicated
fields — they satisfy both variants). One fix exists **only in the deployed script
(its Version 2)**: when writing the “Customers” sheet, the street cell/row is formatted
as **plain text before** the value is written, so a 番地 like `1-11-13` is stored as
text instead of being auto-converted by Sheets into a date. If the script is ever
re-deployed from the local file, that text-format fix must be re-applied and the
contract re-checked. (Script changes need Deploy → Manage deployments → New version
to go live; a plain save does not update the web app.)

## 📊 Sales report (admin 📊 Sales tab)

The admin's **📊 Sales** tab shows how the shop is doing, worked out
from the orders recorded in the spreadsheet's **“Orders”** tab (the records
written by the customer-ID / order-number feature above):

- **Today / This week / This month** — sales ¥, order count and average
  order value for each period (plus yesterday's figures for reference).
  Weeks start on Monday; all periods are Asia/Tokyo (JST) calendar periods.
- **Growth** — this week vs last week and this month vs last month, as a
  percentage with a ▲ / ▼ arrow (shown as “—” when the earlier period had
  no sales to compare with).
- **Top 5 products** — by quantity sold, parsed from the orders' item
  lines, with the ¥ total for each.
- **Customers** — how many different phone numbers have ordered, and how
  many of them are repeat customers (2 or more orders).

Pressing **“📊 Load sales report”** POSTs `{ "action": "stats" }` to the
same Apps Script endpoint the admin already uses for the online photo
reader (the `ORDERS_API_URL` constant), and the script answers with the
figures as JSON. Loading the report is read-only — it never changes any
record.

**One-time setup (Manager):** the deployed Apps Script does not know the
`stats` action until the code in **`apps-script-stats-snippet.txt`** (in
this folder) is pasted into it — one route line inside `doPost`, next to
the `order` / `lookup` routes, plus the `handleStats_()` functions at the
end of the file — **and a New version is deployed** (Deploy → Manage
deployments → edit → Version: New version → Deploy; a plain save does not
update the live web app). Until that is done, the panel's Load button shows
a “could not load” error; the rest of the admin is unaffected. An empty
Orders sheet (no orders yet) reports all zeros.

## 👥 Customers (admin 👥 Customers tab)

The admin's **👥 Customers** tab lists everyone who has ordered — **Name ·
Phone · Orders · Total spent (¥) · Points · Last order** — sorted by total
spent, biggest spender first, with a count line (“N customers”). The records
come from the spreadsheet's **“Customers”** tab (written by the customer-ID /
order-number feature). A **“📋 Open the full sheet”** button links to the
same spreadsheet as the Orders tab.

The **Points** column shows each customer's available points (“120 pt”),
with pending points added compactly when any exist (“120 pt (+30
pending)”); a customer with no points record shows “0 pt”. Points are read
from the public `points.json` next to the admin page — the same file the
shop front reads, so **no GitHub token is needed** — matched by SHA-256 of
the phone digits and totalled with the ledger's own `pointBalances` rule
(earns available 1 month after their date, adjusts at once). If
`points.json` cannot be loaded, the customer list still renders with
“0 pt” everywhere — points never block the list.

A big search box sits over the list — **phone box full width on top, the
“🔍 Find customer” button full width below it** (the same stacked layout
as the Points tab's phone lookup; a side-by-side row squeezed the phone
box too narrow to type in). Typing filters the list live by phone
number (or name), and the **“🔍 Find customer”** button loads the list
first if needed, applies the search, then scrolls to the first match and
opens its detail. Tapping a customer opens that detail: their points as
two summary boxes (**Available** / **Pending**) over a colourful history
**table** (Date · What · Points · Status chip), plus an add-points form —
the same renderer as the Points tab's card.

Pressing **“👥 Load customers”** POSTs `{ "action": "customers" }` to the
same Apps Script endpoint as the sales report, and the script answers:
`{ ok: true, customers: [ { phone, name, orders, totalSpent, lastOrder } ] }`
(numbers as numbers; `lastOrder` a display string). An empty Customers
sheet answers an empty list and the tab says “No customers yet — they
appear here after their first order.” Loading is read-only.

**One-time setup (Manager):** the deployed Apps Script does not know the
`customers` action until the code in **`apps-script-customers-snippet.txt`**
(in this folder) is pasted into it — one route line inside `doPost`, next
to the other routes, plus the `handleCustomers_()` functions at the end of
the file — **and a New version is deployed** (a plain save does not update
the live web app). The snippet finds the sheet's columns by header text
(fuzzy: phone / name / order / total / last), so column order and exact
wording do not matter. Until that is done, the tab's Load button shows
“Customer list is not switched on yet”; the rest of the admin is
unaffected.

## Address & phone check (checkout)

The courier address is entered as the **full Japanese structure in separate fields**:
郵便番号 (postal code) → 都道府県 (prefecture) → 市区町村 (city/ward) → 町名 (town) →
番地 (street number, **required**) → 建物名・部屋番号 (building/room, optional).
Everywhere else (ticket, confirmation email, order sheet) the address is one composed string:
`〒zip 都道府県 市区町村 町名 番地 建物名・部屋番号`.

- **Postal-code auto-fill:** when the customer types a 7-digit postal code (hyphen optional), the
  page calls the **free zipcloud API** (`zipcloud.ibsnet.co.jp`, no key) and fills 都道府県 /
  市区町村 / 町名 from its `address1` / `address2` / `address3`. All three stay editable.
  If the code is not in the database, an inline trilingual note says so (warning only — typing is
  never blocked); if the network call fails, nothing is shown and the customer just types manually.
- **Instant completeness check on Confirm (courier only):** empty postal code, prefecture/city/town,
  or 番地 is a hard stop (the usual required-field error). A **soft check** then looks at the
  composed address: if the 番地 contains no digit, or the whole address is under 12 characters, a red
  trilingual warning appears under the address block and the customer presses Confirm **once more**
  to proceed with that address. Editing any address field re-arms the warning.
- **Map check link:** a 「地図で確認 Check on map / Lihat di peta」 link under the address fields opens
  Google Maps with the address as currently entered. The same Maps link is appended to the
  **WhatsApp order message** (📍 line after the address) and to the **order sheet's 住所・受取店舗**
  entry, so staff can tap straight to the location. (The printed ticket does not carry it.)
- **Phone check:** the checkout phone is validated instantly — spaces/hyphens are stripped, a `+81`
  prefix is normalised to `0…`, and a valid number is 10 or 11 digits starting with 0 (mobiles
  070/080/090 must be 11 digits). A number that looks wrong gets the same warn-then-press-Confirm-again
  treatment as the address soft check — never a silent pass, never a dead-end block. The points phone
  field gets the same check as a **warning only** (it never blocks an order).
- **Honesty note:** a full Google Address Validation API check would need a **paid** Google API key,
  which this free build does not use. Instead it combines the free postal-code database, the
  completeness checks above, and the map link so the customer (and staff) can eyeball the location.

## Remember my details (checkout)

Repeat customers do not re-type their details on every order:

- When an order is confirmed, the shop saves the checkout details — name, phone, email,
  fulfilment choice, pickup branch, the full courier address block and the payment-method
  preference — to **`localStorage` on the customer's own device** (key `madina_super_details`).
  Nothing else is stored; this checkout has no payment credentials of any kind.
- On the next visit the form is **pre-filled** from that saved data (the points-balance check
  also starts from the saved phone number). All the normal checks still run on the pre-filled
  values — phone format, address completeness, warn-then-confirm — exactly as if typed fresh.
- While pre-filled details are in use, the checkout shows a small trilingual note —
  「前回の情報を保存しています / Your details are saved on this device / Data Anda tersimpan di
  perangkat ini」 — with a **クリア / Clear / Hapus** button that wipes the stored data and
  empties the form.
- **Privacy:** the saved details never leave the device except through the normal order flow
  itself (the WhatsApp message / order sheet the customer already sends today). There is no
  account, no server copy, and clearing the browser's site data removes them.

## Staff reply templates (admin panel)

The admin's **💬 Templates** tab has three
copy-and-send Japanese templates for replying to customers on WhatsApp / LINE / email:
(a) transfer payment (shows the `BANK_INFO` account details), (b) cash on delivery,
(c) shop pickup. Staff fill in the 【お名前】 / 【合計】 / 【受取店舗】 blanks after copying.
The bank details in these templates come from a `BANK_INFO` constant at the top of `admin.html`'s
script — **it must match `BANK_INFO` in `index.html`; when the real details are filled in, update both files.**

## Points system (points.json)

Customers earn points and spend them on later orders:

- **Earn:** 1% of each purchase, rounded down (floor) — a ¥7,580 order earns 75 pt.
- **Value:** 1 pt = ¥1.
- **Maturity:** points become usable **1 month after the purchase date** (each earn entry has a
  `matures` date = purchase date + 1 month). Until then they are “pending”.
- The ledger is a second data file, **`points.json`**, in the same repo, managed only from the
  admin panel's **🪙 Points** tab through the same GitHub token flow as products.

**Privacy design (important):** the repo is **public**, so raw phone numbers are **never** stored.
Each customer record is keyed by the **SHA-256 hex hash of the digits-only phone number**
(hyphens/spaces removed). Record shape:
`{ hash, entries: [ { type: "earn"|"redeem", points, date: "YYYY-MM-DD", matures: "YYYY-MM-DD" (earn only), note } ] }`.
Staff type the phone number into the admin; the page hashes it in the browser and finds the record.
Balances are computed from the entries: **available = matured earns − redeems**,
**pending = earns not yet matured**. (Hashing is not encryption — it stops casual reading of the
public file; treat the file as a points ledger, not a customer database.)

**Staff workflow:**

1. Customer orders (WhatsApp). Shop confirms the order **and the payment** on WhatsApp first.
2. Admin → 🪙 Points tab: enter the customer's phone number + the order amount → “Add points (1%)”.
3. When the customer asks to use points: enter the phone number → “Check balance” shows the
   **available** amount → enter the points → “Use points” (it refuses more than the available balance).
4. Every change **saves at once** — one press writes the entry and saves it, then a green banner
   confirms it with the amount and the new balance (the “💾 Save points” button remains as a
   manual fallback). The add banner carries an **“↩ Undo”** button that cancels exactly the
   entry just added. The customer's history shows as two summary boxes (**Available** /
   **Pending**) over a colourful table (Date · What · Points · Status chip) — the same
   renderer in the Points tab card and in the Customers tab's expanded row.

**Cancelling / fixing points (admin):** if an order is cancelled or points were added by mistake,
staff can fix the ledger in the same 🪙 Points tab:

- **Cancel an entry:** each **earn** and **hand-added (adjust)** entry in the history table has a
  “Cancel” button (“Used”/redeem entries have none). It asks for confirmation, marks the entry
  `"cancelled": true` and saves at once. Cancelled entries are **excluded from every balance
  computation** (admin and the shop-front balance check alike) and show greyed with a
  “Cancelled” chip. If a cancellation makes the available balance negative, a warning is shown
  but the cancellation still goes through.
- **Manual adjustment:** enter a signed amount (+ or −) **and a reason (required, e.g. 注文キャンセル）**
  → an `{type:"adjust"}` entry is added. Adjustments apply to the available balance **immediately**.
- Balance formula: **available = matured, uncancelled earns − redeems + adjustments**;
  **pending = unmatured, uncancelled earns**.

**Shop front:** the cart has optional points fields (phone number + points to use). If the customer
fills them in, the WhatsApp message, the ticket and the confirmation email carry a
「ポイント利用希望」 line. The site does **not** deduct points from the total — the shop confirms
the real balance in the admin and applies the discount, exactly as the line says.

**Customer balance check (shop front):** the balance check sits in a **gold card right under the
hero**, labelled 「ポイント確認 / Check your points / Cek poin saya」, so customers find it without
scrolling (it is also linked from the cart's points note). The customer types their phone number and sees their
own **available** and **pending** totals. The page hashes the number in the browser (same SHA-256
scheme as the ledger) and reads `points.json` from the same directory; only that number's totals are
shown — no other customer's data, no entry details. If there is no record (or `points.json` does not
exist yet), it shows 「ポイント記録が見つかりませんでした / No points record found for this number」.
Points can still only be **spent** via shop confirmation at order time.

## Show / hide a product (`active`)

Each product carries an **`active`** field in `products.json`:

- **`active` absent or `true`** = the product is shown in the shop (all 9 seeded products work this way).
- **`active: false`** = the product is **not rendered in the shop at all** — it is not a “sold out”
  state, the product simply does not appear. It stays in the admin list, greyed out and marked
  “Hidden (OFF)”, ready to be switched back on.

**How the owner uses it:** every row of the admin product list has a **Show/Hide switch**, and the
Add/Edit form has the same “Show in shop” switch. Flipping a switch only marks the list dirty, like
every other edit — the existing “💾 Save to shop” publishes it. This is separate from stock control:
a product can be visible but sold out (`stock: 0`), or hidden entirely (`active: false`).

**Legacy note:** older product files used an `on` field for the same switch. The shop front still
honours `on: false` (hides the product), and the admin folds `on` into `active` when it loads a
file and saves only `active` from then on — no manual migration is needed.

## Photo auto-fill (OCR) in the admin panel

When the owner picks a product photo in the Add/Edit form, the panel reads the packet's printed
text and pre-fills the form, so the owner only has to type the **price**. Two readers, in order:

1. **Online reader (preferred)** — the photo (a ~1000 px version) is POSTed to the shop's own
   Google Apps Script endpoint (`ORDERS_API_URL` in `admin.html` — the same public endpoint the
   shop uses for orders) with `{"action":"ocr", …}`. The script reads it server-side with
   OCR.space; **the OCR.space API key lives only in the script's properties** — there is no key
   in the admin page, nothing key-like is stored in the browser, and the owner never handles a
   key. Any failure or a ~20 s timeout falls back silently to the built-in reader. When the
   deployed script returns printed-line sizes (`lines: [{t, h}, …]`, where `h` is a line's
   printed height in pixels), the admin uses them to identify the packet title.
2. **Built-in reader (fallback)** — **Tesseract.js** (jsDelivr CDN; **English + Japanese**) in
   the browser, run on a pre-processed copy of the photo (upscaled 2×, grayscale, contrast
   boost, light sharpen, mild threshold at the extremes), which reads packet print far better
   than the raw photo. Works offline. When Tesseract supplies line bounding boxes, their
   heights are converted to the same `{t, h}` line-size contract.

**Script update for line sizes:** replace the deployed script's whole old `handleOcr_`
function with `apps-script-ocr2-snippet.txt` (it requests OCR.space overlay data and returns
`ParsedText` plus `TextOverlay.Lines` as `{t, h}` entries), then deploy a **New version**.
Until that script update is deployed, the online reader simply returns text without line
sizes and the admin keeps using the fallback name heuristic below.

The status line always says which reader produced the result (“Read by online reader” /
“Read by built-in reader”). What gets filled:

- **Product name (English)** — when line sizes are available, the name is taken from the
  **largest printed Latin line — the packet title** — with weight text removed. A directly
  adjacent clean Latin line printed at at least 70% of the title's height is joined in
  reading order when the combined name is at most 42 characters (a title often wraps over
  two large lines). Junk lines (barcodes, prices, symbol noise, long digit runs) are never
  candidates, and no separate brand-line rule is applied to a size-based pick. When no line
  sizes are available, the older fallback applies: the printed line with the most Latin
  letters wins; an ALL-CAPS brand line printed just above it (e.g. `SHAN`) is kept **in caps**
  in front of the name, and a lone brand word is joined with the next clean line.
- **Japanese name** — the first mostly-Japanese printed line, if the field is empty.
- **Size / weight** — `450g`, `NET WT 450g`, `450 g`, `1.5kg`, `5kg`, `500ml`, `1L`,
  `100g x 20`, `500ml×12`, `100枚`, `20 bags` and similar go into the Size field.
- **Category** — a keyword map (basmati/rice → Rice & Grains, dal/lentil/chana → Dal & Lentils,
  tea → Tea, fish → Fish, masala/spice/chilli → Spices, etc.), set only on a confident match.
  The guessed category becomes the **primary** ticked category; categories the owner already
  ticked by hand are kept (see “Multiple categories” below).

Safety rules: OCR fills **empty fields only** — it never overwrites anything the owner typed.
After reading, a note lists exactly what was auto-filled (“Auto-filled from photo: name, size,
category — please check before saving”). If no text can be read, a friendly note says so and
the form stays fully manual; OCR never blocks saving, and if the CDN library cannot load, the
photo still uploads as before.

**Honest note:** OCR reads **printed packet text** — clear, flat, well-lit photos of the front
of the packet work best. Handwriting, curved/foil packaging, glare and small print can be
misread or missed, so the auto-filled fields must always be checked before saving.

## Reset & recovery (admin panel)

- **↺ Reset form** (in the Add/Edit form): clears every form field — names, price, size,
  category ticks, stock, both photo URL/file inputs and previews, the Popular/Show
  switches — and exits edit mode back to “add new”. If the form holds un-applied input it
  asks for confirmation first. (A successful Add & Save also resets the form
  automatically — see “Add/Edit form” near the top.)
- **↺ Reload from shop — discard unsaved changes** (📦 Products tab, next to “💾 Save to shop”):
  re-downloads `products.json` and throws away every unsaved local change (with a confirmation
  when there are any), so a bad edit/save session can be abandoned cleanly. The small
  “↺ Reload” button in the search row does the same reload without clearing the form.

## Adding a product (admin panel)

There is **one** add flow — the Add/Edit form at the top of the 📦 Products tab (a
separate “⚡ Quick Add” card used to duplicate it; it was removed because two add
options for the same thing confused the owner):

1. Tap the **FRONT** photo box and choose the packet photo (the **BACK** box takes the
   optional back-side photo; picking two photos at once on FRONT makes the second the
   BACK). The photo goes through the resize + OCR auto-fill pipeline (see above), so the
   name, size and category fill in automatically.
2. Type the **price** (the one thing OCR never reads) and check the filled-in fields.
3. Press the one big **Add & Save** button. That press applies the form and saves to
   GitHub, so the product is live in the shop immediately — no separate “Save to shop”
   press needed. The result is always announced in the **big banner at the top of the
   form**: green “✅ Added — <name> is now live on the shop.” on success (the form then
   resets itself blank, ready for the next product), or a red banner with the error if
   anything failed — a missing name/price, no token yet (do the one-time ⚙️ Setup
   first), or a failed save (the form keeps the typed values, so nothing is lost).

**New categories:** type the new category's name in the **“New category name (only if you
need a new one)”** box in the form's “More options” section, and it is created when the
product is added/saved, and ticked for that product (as its main category). It then
appears in the form's category chips and as a filter chip on the shop front
automatically (the shop builds its chips from the `categories` array in
`products.json`). Leave the box empty to use existing categories.

## Multiple categories per product

A product can belong to **several categories** (e.g. a frozen spice mix: Spices + Frozen):

- **Data:** the optional **`cats`** array in `products.json` holds all category ids. The
  legacy single **`cat`** is the **primary** category — always the first entry of `cats` —
  and every save writes **both** fields (`cat = cats[0]`), so older data and other tools keep
  working. A product stored without `cats` is treated as `[cat]`.
- **Admin form:** the category picker is a row of **checkbox chips**, one per category; tick
  as many as apply. The first ticked chip is badged **MAIN**. If nothing is ticked when the
  product is added, the first category in the list is used. Editing a product pre-ticks its
  categories. The admin product list shows **all** of a product's category names.
- **Photo OCR** ticks its guessed category as the primary one and never unticks categories
  the owner picked by hand.
- **Shop front:** the category filter matches a product when the tapped chip is in the
  product's effective category list (`cats`, falling back to `[cat]`), so a multi-category
  product appears under **each** of its categories as well as under “All”. Chip counts count
  a product under every category it belongs to.

## Stock control (products)

Each product may carry an optional **`stock`** field in `products.json`:

- **`stock` absent or `null`** = no stock tracking — the product is always orderable.
- **`stock` = a number** = units in stock. `0` shows a 「売り切れ Sold out / Habis」 badge on the shop
  and disables the Add button; **1–5** shows a small 「残りわずか Only a few left / Sisa sedikit」 note;
  above 5 nothing extra is shown. The cart never lets a customer add more units than the tracked
  stock (the quantity is clamped and a short note is shown).

**Stock is adjusted manually, never automatically.** The admin product form has a stock field
(blank = no tracking), and each row of the admin product list shows the stock with **−1 / +1**
stepper buttons (never below 0); like every other edit, steppers only mark the list dirty — the
existing “💾 Save to shop” publishes them. Stock is deliberately **not** cut when a customer
places an order: orders are confirmed later on WhatsApp, and cancelled or unpaid orders would
otherwise corrupt the count. Staff adjust the stock when an order is confirmed.

## Languages (shop front)

The shop front is **trilingual — Japanese, English and Indonesian — shown together** on labels.
**Owner's rule (2026-11-22, replacing the earlier equal-font-size rule): every trilingual unit
renders as a VERTICAL stack — English first, bold, full size (the main line); Japanese below it
at ~0.85em, normal weight; Indonesian below that at ~0.85em, normal weight and muted** — never
side-by-side (the `.en` / `.jp` / `.idn` spans + the `stack3()` helper in `index.html` carry the
hierarchy). The WhatsApp order message, the ticket and the
confirmation email stay JP+EN (they are shop-facing documents). Products may carry an optional
**`idn`** field (Indonesian name — the field is called `idn`, not `id`, because `id` is already the
product's slug); the card shows the Indonesian name line only when present. The admin product form
has an optional “Indonesian name” field. Seeded categories use a trilingual lookup in `index.html`;
a custom category typed in the admin displays exactly as entered.

**Admin panel language:** the admin UI (`admin.html`) is **English only** (owner's instruction, 2026-11-21). Only the admin chrome changed — product data still holds Japanese / Indonesian names (that is data, shown on the shop front), and the three staff reply templates in the 💬 Templates tab keep their Japanese message bodies, because those are messages sent to customers; their headings are English labels ("Template 1 — Bank transfer" etc.).

## Customer help (shop front)

- **WhatsApp chat button** (green, floating, stacked above the cart bar): opens a WhatsApp chat with
  the shop (090-6584-2039) with a prefilled JP+EN greeting. This is the real-person route.
- **FAQ assistant** （自動案内）: deliberately kept out of the way — the only trace on the page is a
  **small round 💬 button (48 px)** fixed in the top-right corner. It never pops up by itself.
  Tapping it opens a compact panel of question chips (delivery fee incl. the COD ¥1,800 rule,
  payment methods, points, shop hours/addresses, halal, how to order, delivery time); tapping a chip
  instantly shows the answer in JP+EN+ID — rule-based, no external calls. The panel closes with its
  ✕ or by tapping outside it. It is honestly labelled an automatic guide, **not** a human live chat.
  A true open-ended AI chat would need an external API / backend, which this free build does not have.

## Promotion (shop front)

- **Social share cards:** Open Graph + Twitter meta tags in `index.html` (title, JP+EN description,
  `og:url` = the live GitHub Pages URL). `og:image` / `twitter:image` point to the Madina logo,
  **`logo.jpg` in the repo root** → `https://goldfamilyjp.github.io/madina-supershop/logo.jpg`
  (the logo also shows as a small round badge in the page header).
- **Share buttons:** a シェア Share / Bagikan row near the top of the shop — LINE, WhatsApp and
  Facebook share links (live URL + a short JP+EN share text) plus a copy-link button.
- **Hero:** the green/gold header sits on the real shop photo (see “Hero banner photo” below) and
  carries the shop name **MADINA HALAL SUPER** in gold-gradient display type (pure CSS — no font
  downloads), a trilingual tagline and three offer chips —
  送料無料（¥10,000以上）/ Free delivery over ¥10,000 · ポイント1%還元 / Points 1% back ·
  全品ハラール / All halal — kept compact so products stay near the top on mobile.
- SEO basics: JP+EN(+ID) meta description and a descriptive `<title>`.

## Hero banner photo

- The hero is a **solid Madina-green band** holding only the logo, the shop name — set on **two
  fixed lines, “MADINA” / “HALAL SUPER”**, with an explicit line break and the gold-gradient
  styling running across both lines — the Japanese name (マディナ ハラルスーパー, one line) and
  the tagline.
- Directly under the band sits the **full Anjo shop front** as a normal `<img>`:
  **`shop-banner-full.jpg`** in the repo root (1400×1029, colour/sharpness enhanced), styled
  `width:100%; height:auto; display:block` — the **whole shop is always visible at its natural
  aspect, never cropped**. (The owner specifically asked for the Anjo shop only — no Toyota
  photo in the online shop.) The older cropped `shop-banner.jpg` is no longer referenced by the
  page; the file is simply left in the repo.
- The offer chips (free delivery / points / all halal) sit **under the photo** on the page
  background, keeping their gold-bordered pill styling (now with a solid green fill so the white
  text stays readable off the photo); the courier-fee strip follows under them as before.
- The social-share image (`og:image`) is unchanged — it still uses `logo.jpg`.
- **Hero slideshow (owner, 2026-11-22):** the photo strip under the name band is now a
  **slideshow** — slide 1 is the Anjo shop front, followed by the owner's own interior photos
  (dining area, partition seating, grocery shelves, freezer aisle, buffet corner). The slides
  are separate files in the repo root, **`hero-slide-1.jpg` … `hero-slide-7.jpg`**, all
  prepared at **1400×1050** (≤350 KB each) so the strip's fixed 4:3 box never changes height.
  `hero-slide-1.jpg` is the same Anjo front as `shop-banner-full.jpg`, re-exported at the
  slideshow size; `shop-banner-full.jpg` itself is still in the repo, unreferenced by the
  strip. The show crossfades every ~5 s and pauses on touch/hover and while the tab is
  hidden; ‹ › arrows, dots and a horizontal swipe move it by hand (same pattern as the
  ⭐ Popular slideshow). Slide 1 loads eagerly, the rest are `loading="lazy"`. To change a
  photo, replace the matching `hero-slide-N.jpg` file (keep it 1400×1050); to add or remove
  a slide, edit the `<img class="hero-slide">` list in the `#heroShow` block in `index.html`.

## 📢 News board (owner announcements)

The owner can post announcements — a rice special offer, a courier-delay warning, holiday hours —
from the admin, and customers see them in two prominent places on the shop front.

- **Data:** an optional `notices` array at the root of `products.json`:
  `[{ "id", "date": "2026-11-21", "jp", "en", "idn", "active" }]`. The three message fields are
  free text; any one language may be left empty, but at least one must be filled. The admin's
  load/save flow carries `notices` (and any other unknown root fields) through untouched, so a
  product-only save never loses the announcements.
- **Posting (admin → 📢 News tab):** write the message in Japanese / English / Indonesian
  (any of them), check the date (it defaults to today, JST), press “Add notice” (or Edit an
  existing one and press “Update notice”), then “💾 Save to shop”. Each listed notice has a
  Show/Hide switch, Edit and Delete — same patterns as the product list. Hidden notices stay in
  the file but are never shown to customers.
- **Top banner (shop front):** a gold bar at the very top of the page with a gently **pulsing 📢
  badge**. It shows the visible notices **one at a time, rotating every ~5 seconds** with a
  fade/slide; it pauses while the customer hovers or touches it and while the tab is hidden.
  With only one visible notice it stays still (badge pulse only). With none, the bar is not
  rendered at all.
- **Board section:** directly under the hero, a “📢 お知らせ / News / Berita” section lists
  **all** visible notices, newest date first, each with its date — at most 5. Hidden when empty.
- **Language:** the shop shows all three languages together everywhere, so each notice renders as
  the trilingual stack — every language the owner filled in, English first (main/bold), then
  Japanese, then Indonesian; a notice written in a single language shows that text as the main
  line.
- **Performance & accessibility:** notices ride inside `products.json` (no extra downloads, no
  libraries, CSS-only animation). Customers who prefer reduced motion get **no rotation and no
  pulsing** (`prefers-reduced-motion`).

## 🎟️ Coupons & gift vouchers

The owner can create discount codes in the admin; customers type one code at checkout and the
discount comes off the order. A **gift voucher** is not a separate system — it is simply a
¥-off coupon with a gift-style code (e.g. `GIFT1000` for ¥1,000 off).

- **Data:** an optional `coupons` array at the root of `products.json`:
  `[{ "code", "kind": "yen"|"pct", "value", "min", "expiry": "YYYY-MM-DD"|"", "active" }]`.
  `min` is the minimum **product subtotal** (0 = no minimum); `expiry` blank = never expires.
  Like notices, coupons ride through the admin's load/save flow untouched by other saves, so a
  product-only save never loses them.
- **Creating codes (admin → 🎟 Coupons & Tax tab):** type the code (it is stored
  upper-cased), choose ¥ off or % off, the value, an optional minimum subtotal and an optional
  expiry date, press “Add coupon” (or Edit an existing one), then “💾 Save to shop”. Codes must
  be **unique** (case-insensitive), the value must be above 0, and a % coupon is capped at 90%.
  Each listed coupon shows its summary (e.g. “¥500 off, min ¥5,000, until 2026-12-31”), a
  Show/Hide switch, Edit and Delete.
- **Checkout (shop front):** the cart/checkout sheet has a “クーポンコード / Coupon code /
  Kode kupon” field with an Apply button. Unknown, hidden, or expired codes (expiry before
  today, JST) and codes whose minimum is not met are rejected with a trilingual error. **One
  code per order.** A ¥ coupon takes `min(value, subtotal)` off; a % coupon takes
  `floor(subtotal × value ÷ 100)` off. The green “割引 / Discount / Diskon −¥X” line appears in
  the totals, and an applied code shows as a chip with a ✕ to remove it.
- **Totals rule:** grand total = **subtotal − discount + consumption tax + courier fee** (see
  the Tax section below). The free-courier threshold (¥10,000) is judged on the **pre-discount**
  subtotal, and the courier fee itself is never discounted — a ¥10,500 order with a ¥500 coupon
  still ships free (at the default 8% tax it totals ¥10,800).
- **Changing the cart:** if the subtotal drops below the applied coupon's minimum, the discount
  **pauses** (a trilingual note says so) and resumes by itself if the subtotal recovers —
  the same behaviour as the restaurant menu site.
- **Order records:** the discount appears on the on-screen ticket, in the WhatsApp order text,
  and in the Google Form / Sheet order details (a line like “クーポン COUPON500: −¥500”), and
  the confirmation email's totals include it too — every record shows the same grand total.

## 🧾 Tax (consumption tax)

Checkout adds consumption tax on top of the discounted product subtotal.

- **Data:** an optional `taxRate` number (percent) at the root of `products.json`. **Absent =
  default 8.** Like coupons and notices, it is handled explicitly by the admin's data layer, so
  every save writes it back and no other save can drop it.
- **Changing it (admin → 🎟 Coupons & Tax tab):** the “Consumption tax rate %” field at the
  top of the panel is prefilled with the current rate (0–30, decimals like 8.5 allowed). Type
  the new rate and press any “💾 Save to shop” — the value rides along with every save. **Set 0
  for no tax** (a saved 0 is kept as 0, not treated as absent).
- **Math:** taxable = product subtotal − coupon discount (never below 0);
  tax = `floor(taxable × taxRate ÷ 100)`; grand total = **taxable + tax + courier fee**. The
  **courier fee is not taxed**, and the ¥10,000 free-courier threshold is still judged on the
  pre-discount subtotal, unchanged.
- **Display:** when the computed tax is above 0, a “消費税（8%） / Tax (8%) / Pajak (8%)” line
  (with the current rate interpolated) appears in the checkout totals, and the cart bar total
  includes the tax. The same tax line and the corrected grand total appear on the on-screen
  ticket, in the WhatsApp order text, in the Google Form / Sheet order details and its total,
  and in the confirmation email. When the tax computes to 0, no tax line is shown anywhere.

## Responsive design (phones, tablets, desktops)

Both pages are built phone-first and checked at **360 / 390 px (phones), 768 px (tablet) and
1280 px (desktop)** — the automated tests assert there is **no horizontal scrolling at any width**
and that the key elements stay visible and usable.

- **Product grid:** 2 columns on phones, 3 on tablets, 4+ on desktops (cards stretch to fill the
  row), with comfortable gaps; long product names wrap instead of pushing the card wider.
- **Tap targets:** the main controls are ~44 px or bigger — Add buttons, quantity steppers,
  category chips, slideshow dots (the visible dot is small but the tap area is 26 px+, inside a
  44 px-tall control row), cart bar button, and the admin's buttons and Show/Hide switches.
- **No iOS zoom:** form inputs (checkout, admin, search) use a 16 px font on small screens, so
  iOS Safari does not auto-zoom when a field is tapped.
- **Sticky pieces:** the cart bar and the floating buttons never cover the content — the page
  keeps bottom padding for the cart bar, the FAQ 💬 button sits in the top-right corner (clear of
  the bottom cart bar), and the news banner, Popular slideshow, cart sheet, checkout sheet, FAQ
  panel and points box all fit a 360 px screen.
- **Admin on phones:** panels go single-column with tighter padding; product rows wrap so the
  name, ⭐, Show/Hide switch, stock stepper, Edit and Delete stay tappable without overlap at
  390 px; long point-history lines wrap inside their panel instead of stretching the page.

## ⭐ Popular slideshow (shop front)

- **How to star a product:** in the admin, tap the ⭐ button on a product row in the 📦 Products tab, or use
  the “⭐ Popular — show in the top slideshow” switch in the Add/Edit form. This sets the
  product's `popular` field; Save publishes it like any other change.
- **Where it shows:** directly under the shop's search bar, above the category chips, with the
  trilingual heading “⭐ 人気商品 / Popular / Populer”. One product at a time — large photo, name,
  size, price and a working Add button (same cart, stock and sold-out rules as the grid cards).
  Tapping the slide photo opens the photo zoom lightbox. On a product with two photos, the slide
  photo also carries the “1 / 2” badge, and swiping it sideways switches between the front and back
  photo (the tap still opens the lightbox).
- **Behaviour:** auto-advances every ~4 seconds with a fade; dots and ‹ › arrows jump between
  slides; it pauses while the customer touches or hovers it and while the browser tab is hidden.
- **How many:** about **10** starred products is best. Only starred **and** visible products appear
  (a hidden product never shows). If **no** product is starred, the whole section is hidden — there
  is no empty box.
- **Performance:** plain JS/CSS, no libraries. Slide markup is built only for the starred products
  and reuses their existing photo data — no extra downloads; the product grid below keeps its
  60-at-a-time batching.

## Setup (one time, done by Manager)

1. Create the public GitHub repo **goldfamilyjp/madina-supershop**.
2. Put `index.html`, `admin.html`, `products.json`, `logo.jpg`, `shop-banner-full.jpg` in the repo root; enable GitHub Pages (main branch, root).
   (`points.json` does not need to be created by hand — the admin panel creates it on the first “Save points”.)
   Shop URL becomes `https://goldfamilyjp.github.io/madina-supershop/`,
   admin URL is the same + `admin.html`.
3. Create a **fine-grained personal access token** on GitHub for this repo only:
   GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token →
   Repository access: only `madina-supershop` → Permissions: **Contents: Read and write** → Generate.
4. On Ali's phone/tablet, open the admin URL, paste the token once, press “Save token & load products”.
   Done — from then on he just adds products and presses “💾 Save to shop”.

## Remaining steps (before launch)

- **Fill in the bank details:** replace the `BANK_INFO` placeholders
  (`（ゆうちょ：未設定）` / `（銀行：未設定）`) with the owner's confirmed ゆうちょ and bank account details
  (bank name, branch, account type/number, account holder name) in **both** `index.html` and
  `admin.html` (each file has its own copy of the constant; the ticket, the confirmation email and
  the staff reply templates all read from it). Until then, transfer customers see the
  “未設定 (not set)” placeholder on their ticket and in the confirmation email.
- **Activate FormSubmit (one click):** after the first real order placed with a customer email,
  open the activation email FormSubmit sends to goldfamilyjp@yahoo.com and click its link once.
  Confirmation emails only start flowing after this click.
- Create the repo + token and do the first admin login (Setup steps 1–4 above).

## Notes

- The shop renders products in batches of 60 with a “Show more” button, with category chips and live search,
  so 1,000+ products stay fast.
- Products with `"active": false` are hidden in the shop but stay in the admin list (legacy `"on": false` is honoured too — see “Show / hide a product”).
- If the token ever leaks, delete it in GitHub settings and make a new one — nothing else changes.

## 📈 Visitor stats (Google Analytics 4)

- GA4 property created 2026-11-22 via Firebase (the direct Analytics wizard was broken for this account — its country/timezone dropdowns never loaded; the Firebase project-creation flow created the property from its side).
- Firebase project: `madina-halal-super` (Spark, free). GA4 Property ID: 565406123. Web stream: "Madina Halal Super Web".
- **Measurement ID: G-VRHLH0YXC6** — the gtag snippet sits in the shop's index.html <head>. Counting starts 2026-11-22; no earlier visitor data exists.
- View stats: Admin 📊 Sales tab → "Visitor stats (Google Analytics)" link, or analytics.google.com (property 565406123).
