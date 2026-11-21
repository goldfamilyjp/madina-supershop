# Madina Halal Supershop

A simple online halal grocery shop for Madina Halal Restaurant & Foods (Gold Family Co. Ltd).

- **Shop front:** `index.html` — customers order here; the order is sent to the shop on WhatsApp.
- **Admin panel:** `admin.html` — Ali adds / edits / deletes products here. Big buttons, Japanese + English.
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
     There is **no distance limit**. Courier fee: **¥990 flat when the subtotal is under ¥10,000; FREE at ¥10,000 or more**.
     *(Assumption: the owner stated the ¥10,000 free-shipping threshold explicitly for cash on delivery;
     the same threshold is applied to all delivery payment methods.)*
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

## Staff reply templates (admin panel)

The bottom of `admin.html` has a **「返信テンプレート Reply templates」** section with three
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
  admin panel's **「⑤ ポイント Points」** section through the same GitHub token flow as products.

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
2. Admin → ⑤ ポイント: enter the customer's phone number + the order amount → “Add points (1%)”.
3. When the customer asks to use points: enter the phone number → “Check balance” shows the
   **available** amount → enter the points → “Use points” (it refuses more than the available balance).
4. Press **“💾 ポイントを保存する Save points”** after any change, or the change is lost.

**Shop front:** the cart has optional points fields (phone number + points to use). If the customer
fills them in, the WhatsApp message, the ticket and the confirmation email carry a
「ポイント利用希望」 line. The site does **not** deduct points from the total — the shop confirms
the real balance in the admin and applies the discount, exactly as the line says.

## Setup (one time, done by Manager)

1. Create the public GitHub repo **goldfamilyjp/madina-supershop**.
2. Put `index.html`, `admin.html`, `products.json` in the repo root; enable GitHub Pages (main branch, root).
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
