# Mr.Bill

Open-source procurement agent for food & beverage SMEs — multi-branch café restock without freight, payments, or customs.

**Persona:** Layla runs **Maison Layla** (Zamalek, Maadi, New Cairo). She describes restock needs in plain language; Mr.Bill structures RFQs, compares supplier quotes in EGP, recommends a split order, and updates branch inventory after approval.

## Judge run (2–3 min demo)

```bash
npm install
npm run dev
```

Open **http://localhost:3847**

| Step | Route | Action |
|------|--------|--------|
| Hook | `/` | Landing — procurement on autopilot, 3 cafés |
| Intake | `/app/request` | Send pre-filled message → confirm line items → **Confirm & send RFQ** |
| RFQ | same | **Paste supplier replies (demo)** |
| Compare | `/app/quotes` | Side-by-side table, MOQ / lead time, sage highlight on best unit cost |
| Decide | chat or Quotes | **Approve recommendation** (~EGP 840 savings vs single supplier) |
| Inventory | `/app/inventory` | Maadi oat milk + cups, Zamalek blend updated; audit “Approved by Layla” |

**Fallback:** Pre-seeded mock data in `src/lib/mock-data.ts` and tools in `src/lib/agent-tools.ts` — the UI works without a live LLM.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Lucide icons (ISC)
- Original MIT SVGs under `public/assets/`

## Agent tools (MVP)

| Tool | Module |
|------|--------|
| `send_rfq` | `src/lib/agent-tools.ts` |
| `parse_quote_reply` | same |
| `compare_quotes` | same |
| `recommend` | same |
| `update_inventory` | same |

Ready to wire to Convex / LLM post-hackathon.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **3847** |
| `npm run build` | Production build |
| `npm run start` | Start production server on 3847 |
| `npm run lint` | ESLint |

## Push to GitHub

If you cloned without write access:

```bash
git remote set-url origin https://github.com/AryanSaxenaa/Mr.Bill.git
git push -u origin main
```

## License

MIT
