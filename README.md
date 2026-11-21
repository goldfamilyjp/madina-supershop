# Madina Halal Supershop

A simple online halal grocery shop for Madina Halal Restaurant & Foods (Gold Family Co. Ltd).

- **Shop front:** `index.html` — customers order here; the order is sent to the shop on WhatsApp.
- **Admin panel:** `admin.html` — Ali adds / edits / deletes products here. Big buttons, English only.
- **Product data:** `products.json` — the single list of products. The shop reads it; the admin saves it.

## How saving works (GitHub is the database)

There is no server and no monthly fee. The product list lives in one file, `products.json`,
inside the GitHub repository **goldfamilyjp/madina-supershop** (GitHub Pages hosts the site for free).

- The shop front (`index.html`) simply fetches `products.json` and shows every product with `"on": true`.
- The admin panel (`admin.html`) reads and writes that same file through the **GitHub Contents API**.
  To prove it is really Ali, GitHub asks for a **personal access token** (like a password).
- The token is typed once into the admin page and kept **only in that browser's localStorage, on Ali's own device**.
  It is never written into any file, never committed, and never sent anywhere except to `api.github.com`.
- Every “💾 Save to shop” press commits the new `products.json` to GitHub; GitHub Pages then serves the
  updated shop within about 1–2 minutes.
- Product photos can be a normal image URL, or a photo file chosen in the admin — the file is shrunk in the
  browser (max 480 px wide, JPEG) and stored inside `products.json` as a small data-URI, so no separate
  image hosting is needed. Keep photos small; very large `products.json` files load slowly.

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
- The sheet is **private to the owner's Google account** — it is not shared with anyone.
  The **WhatsApp order remains the immediate alert**; the sheet is the saved record.
- Staff open it from the admin panel's **⑥ Orders** section
  (button → `https://docs.google.com/spreadsheets/d/1NYooZTu01gP6cmp5k8we60Uhz4KKhgU4993zGIgt5Hw/edit`).

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

## Staff reply templates (admin panel)

The bottom of `admin.html` has a **④ Reply templates** section with three
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
  admin panel's **⑤ Points** section through the same GitHub token flow as products.

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
2. Admin → ⑤ Points: enter the customer's phone number + the order amount → “Add points (1%)”.
3. When the customer asks to use points: enter the phone number → “Check balance” shows the
   **available** amount → enter the points → “Use points” (it refuses more than the available balance).
4. Press **“💾 Save points”** after any change, or the change is lost.

**Cancelling / fixing points (admin):** if an order is cancelled or points were added by mistake,
staff can fix the ledger in the same ⑤ Points section:

- **Cancel an earn:** each earn entry in the customer's history has a “Cancel” button. It asks
  for confirmation, then marks the entry `"cancelled": true`. Cancelled entries are **excluded from
  every balance computation** (admin and the shop-front balance check alike). If a cancellation makes
  the available balance negative, a warning is shown but the cancellation still goes through.
- **Manual adjustment:** enter a signed amount (+ or −) **and a reason (required, e.g. 注文キャンセル）**
  → an `{type:"adjust"}` entry is added. Adjustments apply to the available balance **immediately**.
- Balance formula: **available = matured, uncancelled earns − redeems + adjustments**;
  **pending = unmatured, uncancelled earns**.

**Shop front:** the cart has optional points fields (phone number + points to use). If the customer
fills them in, the WhatsApp message, the ticket and the confirmation email carry a
「ポイント利用希望」 line. The site does **not** deduct points from the total — the shop confirms
the real balance in the admin and applies the discount, exactly as the line says.

**Customer balance check (shop front):** the 「ポイント残高確認 Check your points」 section on the shop
page (also linked from the cart's points note) lets a customer type their phone number and see their
own **available** and **pending** totals. The page hashes the number in the browser (same SHA-256
scheme as the ledger) and reads `points.json` from the same directory; only that number's totals are
shown — no other customer's data, no entry details. If there is no record (or `points.json` does not
exist yet), it shows 「ポイント記録が見つかりませんでした / No points record found for this number」.
Points can still only be **spent** via shop confirmation at order time.

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
**Owner's rule: all languages render at the same font size; the 2nd/3rd language is never shrunk**
(the `.en` / `.idn` spans inherit the label's size). The WhatsApp order message, the ticket and the
confirmation email stay JP+EN (they are shop-facing documents). Products may carry an optional
**`idn`** field (Indonesian name — the field is called `idn`, not `id`, because `id` is already the
product's slug); the card shows the Indonesian name line only when present. The admin product form
has an optional “Indonesian name” field. Seeded categories use a trilingual lookup in `index.html`;
a custom category typed in the admin displays exactly as entered.

**Admin panel language:** the admin UI (`admin.html`) is **English only** (owner's instruction, 2026-11-21). Only the admin chrome changed — product data still holds Japanese / Indonesian names (that is data, shown on the shop front), and the three staff reply templates in ④ keep their Japanese message bodies, because those are messages sent to customers; their headings are English labels ("Template 1 — Bank transfer" etc.).

## Customer help (shop front)

- **WhatsApp chat button** (green, floating, stacked above the cart bar): opens a WhatsApp chat with
  the shop (090-6584-2039) with a prefilled JP+EN greeting. This is the real-person route.
- **FAQ assistant** （自動案内）: a 「よくある質問 FAQ / Tanya Jawab」 button opens a panel of question
  chips (delivery fee incl. the COD ¥1,800 rule, payment methods, points, shop hours/addresses,
  halal, how to order, delivery time). Tapping a chip instantly shows the answer in JP+EN+ID —
  rule-based, no external calls. It is honestly labelled an automatic guide, **not** a human live chat.
  A true open-ended AI chat would need an external API / backend, which this free build does not have.

## Promotion (shop front)

- **Social share cards:** Open Graph + Twitter meta tags in `index.html` (title, JP+EN description,
  `og:url` = the live GitHub Pages URL). `og:image` / `twitter:image` point to the Madina logo,
  **`logo.jpg` in the repo root** → `https://goldfamilyjp.github.io/madina-supershop/logo.jpg`
  (the logo also shows as a small round badge in the page header).
- **Share buttons:** a シェア Share / Bagikan row near the top of the shop — LINE, WhatsApp and
  Facebook share links (live URL + a short JP+EN share text) plus a copy-link button.
- **Hero:** the green/gold header carries the full shop name, a trilingual tagline and three offer
  chips — 送料無料（¥10,000以上）/ Free delivery over ¥10,000 · ポイント1%還元 / Points 1% back ·
  全品ハラール / All halal — kept compact so products stay near the top on mobile.
- SEO basics: JP+EN(+ID) meta description and a descriptive `<title>`.

## Setup (one time, done by Manager)

1. Create the public GitHub repo **goldfamilyjp/madina-supershop**.
2. Put `index.html`, `admin.html`, `products.json`, `logo.jpg` in the repo root; enable GitHub Pages (main branch, root).
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
- Products with `"on": false` are hidden in the shop but stay in the admin list.
- If the token ever leaks, delete it in GitHub settings and make a new one — nothing else changes.
