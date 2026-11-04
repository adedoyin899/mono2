# Monologg — Figma Screen & Component Generator

A custom, native Figma Plugin that generates pixel-perfect web app screens and design tokens in Figma.

## What It Generates
1. **Design Tokens & Color Palette**: Complete `leye/Grey alpha` spectrum (`#0E0E0E`, `#1A1A1A`, `#333333`, `#F13030`, `#7B00FE`, `#1A7544`).
2. **Product Page 7-Step Showcase**: Exact Figma Frame 11 parity (borderless `#0E0E0E` active card, 5-card constant height window, right stage preview mockup).
3. **Performer Bio Storefront (Mobile 390px)**: Verified identity, video reel player, audio metrics, and bookable rate cards.
4. **Order Room & Escrow Management Screen**: Milestone progress bar, deliverable preview with watermark, fee breakdown, and Paystack payout release.

---

## How to Run It in Figma (Under 30 Seconds)

### Option 1: Import via Manifest (Recommended)
1. In Figma Desktop, open your project file (e.g., `Doyin x Monologg (Copy)`).
2. Go to the menu: **Plugins → Development → Import plugin from manifest...**
3. Navigate to and select this file:
   ```
   monologg/tools/figma-plugin/manifest.json
   ```
4. Right-click anywhere on the Figma canvas or go to **Plugins → Development → Monologg — Screen & Component Generator** to run it!
5. In the modal, choose which screens you want, keep **"Create on new page (Web App — Live Screens)"** checked, and click **Generate Selected Screens**.

### Option 2: Run directly in the Figma Console
If you don't want to import the manifest, you can open Figma's Console (**Plugins → Development → Open Console**) and execute the contents of `code.js`.
