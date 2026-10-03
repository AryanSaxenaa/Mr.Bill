# Mr.Bill

Open-source procurement agent for food & beverage SMEs — multi-branch café restock without freight, payments, or customs.

**Persona:** Layla runs **Maison Layla** (Zamalek, Maadi, New Cairo). She describes restock needs in plain language; Mr.Bill structures RFQs, compares supplier quotes in EGP, recommends a split order, and updates branch inventory after approval.

## Environment (live agent)

The chat on `/app/request` calls **`POST /api/agent`** with an OpenAI tool loop (five procurement tools). Copy the example env file and add your key:

```bash
cp .env.example .env.local
# Edit .env.local — set OPENAI_API_KEY=sk-...
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes (for live agent) | OpenAI API key; route returns **503** with a clear message if missing |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |

Supplier quotes and RFQ delivery are **mocked** in `src/lib/mock-data.ts` so hackathon demos stay reliable; `send_rfq` auto-parses canned replies from Cairo Dairy Co. and Bean & Barrel.

## Judge run (2–3 min demo)

```bash
npm install
npm run dev
```

Open **http://localhost:3847**

| Step | Route | Action |
|------|--------|--------|
| Hook | `/` | Landing — procurement on autopilot, 3 cafés |
| Intake | `/app/request` | Send pre-filled Layla message → agent structures line items → **Confirm & send RFQ** |
| RFQ + quotes | same | Agent runs `send_rfq` + auto mock `parse_quote_reply` → compare + recommend in chat |
| Compare | `/app/quotes` | Same comparison table (MOQ / lead time, sage = best unit cost) |
| Decide | chat | **Approve recommendation** (split order + savings summary) |
| Inventory | `/app/inventory` | Rows updated via `update_inventory` (persisted in **localStorage** for demo) |

**Without API key:** chat shows an error banner; set `OPENAI_API_KEY` to run E2E. Tool implementations remain in `src/lib/agent-tools.ts` for tests and fallback data.

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

Live loop: `src/app/api/agent/route.ts` → `src/lib/agent-executor.ts` → `src/lib/agent-tools.ts`.

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
