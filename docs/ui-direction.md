# Mr.Bill UI direction

Creative, premium fintech polish for **F&B procurement** — Stripe-inspired surfaces with Maison Layla warmth in copy and success states. Post-unified-theme (`67dd955`): landing and in-app share the same token set (navy, linen, indigo accent, sage success).

**Copy rule:** Do **not** show third-party vendor names in the product UI (no “SerpAPI”, “AgentMail”, “OpenRouter” in labels). Docs and README may name integrations.

---

## Design thesis

- **Light canvas** (`surface` / `#F6F9FC`) with **deep navy** (`navy` / `#0A2540`) and indigo→cyan gradients for emphasis.
- **Editorial clarity** for numbers (quotes, MOQ, lead times) — Inter, not spreadsheet gray.
- **Motion:** purposeful (150–250ms ease-out); landing **How it works** cycles steps every ~4.5s; respect `prefers-reduced-motion`.

---

## Palette

| Role | Token | Hex | Usage |
|------|--------|-----|--------|
| Navy | `navy`, `espresso` (alias) | `#0A2540` | Headlines, dark sections |
| Surface | `surface`, `cream` (alias) | `#F6F9FC` | Page canvas |
| Elevated | `linen` | `#FFFFFF` | Cards, sidebar |
| Primary | `indigo-accent`, `terracotta` (alias) | `#635BFF` | CTAs, active nav |
| Gradient end | `cyan-accent` | `#00D4FF` | Badges, progress |
| Muted | `cocoa` | `#425466` | Body secondary |
| Border | `stripe-border`, `oat` (alias) | `#E6EBF1` | Dividers |
| Success | `sage` | `#0D9488` | Approved, best quote cell |

**Avoid:** Default SaaS blue-only palette; Stripe wordmarks; hotlinked Stripe CDN assets.

---

## Typography

- **Inter** via `next/font` — `--font-display` and body both Inter (`globals.css`).
- Display: 600–700, tight tracking on headlines.
- Dense tables: ~13px; base body ~15px.

---

## Layout

- **App shell:** Left sidebar; linen cards; active nav `indigo-accent/10`.
- **Landing:** Cruip Simple Light structure in `src/components/landing/` — navbar, hero + quote mock, stats, **How it works** (5 columns), features, CTA, footer.
- **Status pills:** Indigo (RFQ), cyan tint (quotes in), sage (approved).

---

## Tone & copy

- Calm operator voice — “Here’s what I heard”, “Ready to RFQ these suppliers?”
- Branch names, EGP, realistic SKUs (oat milk 1L, cup 8oz, espresso blend 1kg).

---

## Open assets

| Location | Source | License |
|----------|--------|---------|
| `public/assets/landing/*` | [Cruip Simple Light](https://github.com/cruip/tailwind-landing-page-template) | Free Cruip template |
| `public/assets/undraw-*.svg` | [unDraw](https://undraw.co) via undraw-svg | MIT |
| `public/assets/*.svg` (non-landing) | Original repo art | MIT |
| UI icons | Lucide React | ISC |

Implementation: `src/app/globals.css` (`@theme inline`), Tailwind v4, shadcn/ui.
