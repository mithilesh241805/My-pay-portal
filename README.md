# UPI QR Generator

A dark-themed, single-page tool to generate scannable UPI payment QR codes, with saved UPI IDs, presets, WhatsApp sharing, and PNG download.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure and markup |
| `style.css` | All styling (theme, layout, responsive rules) |
| `script.js` | All behavior (UPI ID selection, passcode lock, QR generation, WhatsApp/Pay actions) |

Open `index.html` in a browser — it links to `style.css` and `script.js` in the same folder, so keep all three files together. It also loads two things from the internet: Google Fonts and the `qrcodejs` library (via CDN), so an internet connection is needed the first time.

## Features

- **Saved UPI IDs** — pick from preset UPI IDs instead of typing them every time.
- **Passcode-locked UPI IDs** — some saved UPI IDs are locked behind a passcode so they can't be selected accidentally or by anyone else using the device:
  - `UPI ID · SBIN5159` and `UPI ID · PhonePe Wallet` → passcode `1******5`
  - `UPI ID · RT1812` → passcode `1**2`
  - `UPI ID · UBIN1254` and `Custom UPI ID` are not locked.
- **Custom UPI ID** — type any UPI ID (`name@bank`) directly, no lock.
- **Amount + quick presets** — ₹100 / ₹200 / ₹500 / ₹1000 / ₹5000 / ₹10000 / ₹100000 buttons, or enter any amount.
- **Optional note** — shown on the receipt and included in the UPI link.
- **Generate QR** — builds a `upi://pay` deep link and renders it as a scannable QR code, shown on a receipt-style card.
- **Download QR** — save the generated QR as a PNG.
- **Pay button** — opens the UPI link directly (works without a mobile number).
- **Send via WhatsApp** — sends the payment link as a WhatsApp message to a phone number (this is the only action that needs a mobile number + country code).

## Editing UPI IDs / passcodes

In `index.html`, each saved UPI ID is one `.id-option` block, e.g.:

```html
<div class="id-option" data-vpa="rajariventh-4@okaxis" data-label="UPI ID · RT1812" data-locked="true" data-passcode="1812">
  ...
</div>
```

- `data-vpa` — the actual UPI ID used to build the payment link.
- `data-label` — text shown above the QR code when this ID is selected.
- `data-locked="true"` — add this to require a passcode before the ID can be selected (omit to leave it open).
- `data-passcode="..."` — the passcode for that specific ID. If omitted, it falls back to the default passcode set in `script.js` (`const PASSCODE = '16241805';`).

## Notes

- All data (selected UPI ID, amount, unlocked state, etc.) lives only in the browser tab — nothing is saved or sent anywhere except when you explicitly tap Pay, Generate, or WhatsApp.
- Unlocking a locked UPI ID only lasts for the current page load; refreshing the page re-locks it.
