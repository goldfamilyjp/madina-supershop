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

## Setup (one time, done by Manager)

1. Create the public GitHub repo **goldfamilyjp/madina-supershop**.
2. Put `index.html`, `admin.html`, `products.json` in the repo root; enable GitHub Pages (main branch, root).
   Shop URL becomes `https://goldfamilyjp.github.io/madina-supershop/`,
   admin URL is the same + `admin.html`.
3. Create a **fine-grained personal access token** on GitHub for this repo only:
   GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token →
   Repository access: only `madina-supershop` → Permissions: **Contents: Read and write** → Generate.
4. On Ali's phone/tablet, open the admin URL, paste the token once, press “Save token & load products”.
   Done — from then on he just adds products and presses “💾 Save to shop”.

## Remaining steps (before launch)

- **Fill in the bank details:** in `index.html`, replace the `BANK_INFO` placeholders
  (`（ゆうちょ：未設定）` / `（銀行：未設定）`) with the owner's confirmed ゆうちょ and bank account details
  (bank name, branch, account type/number, account holder name). Until then, transfer customers see the
  “未設定 (not set)” placeholder on their ticket.
- Create the repo + token and do the first admin login (Setup steps 1–4 above).

## Notes

- The shop renders products in batches of 60 with a “Show more” button, with category chips and live search,
  so 1,000+ products stay fast.
- Products with `"on": false` are hidden in the shop but stay in the admin list.
- If the token ever leaks, delete it in GitHub settings and make a new one — nothing else changes.
