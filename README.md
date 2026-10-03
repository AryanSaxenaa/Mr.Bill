# Mr.Bill

Open-source procurement agent for food & beverage SMEs — multi-branch café restock without freight, payments, or customs.

**Hackathon:** [Agents at Work](https://agentsatwork.dev) · Professional track  
**Persona:** Layla runs **Maison Layla** (Zamalek, Maadi, New Cairo). She describes restock needs in plain language; Mr.Bill structures RFQs, compares supplier quotes in EGP, recommends a split order, and updates branch inventory after approval.

**Repository:** [github.com/AryanSaxenaa/Mr.Bill](https://github.com/AryanSaxenaa/Mr.Bill)

## Hackathon submission

**Repo:** [github.com/AryanSaxenaa/Mr.Bill](https://github.com/AryanSaxenaa/Mr.Bill) · **License:** MIT (`LICENSE`)

| Deliverable | Notes |
|-------------|--------|
| Demo video | 2–3 min screen capture using the judge table below |
| Untap / Agents at Work | Professional track · impact copy in project Context `docs/impact-slides.md` |
| Live vs demo | `GET /api/agent/config` — OpenRouter with DeepSeek fallback on chat failure; keyless demo script still works |
| Scope | In: intake, RFQ drafts, paste-parse quotes, compare, recommend, inventory · Out: payments, freight, WhatsApp API |

### Submission checklist

Full Untap / judge guide: **[docs/SUBMISSION.md](./docs/SUBMISSION.md)**

- [ ] Record judge run (table below) including **Paste supplier reply** on `/app/quotes`
- [ ] Submit repository URL on Untap (Professional track)
- [x] `npm run build` and `npm run test:api` (CI + local; no API key required)
- [x] `GET /api/health` → `{ ok: true, version }` for ops
- [x] **Reset demo data** in the app shell (clears localStorage + reload)
- [x] Impact copy in [docs/impact-slides.md](./docs/impact-slides.md)
- [ ] Do not commit `.env.local` or API keys

## Judge run (under 5 minutes)

```bash
git clone https://github.com/AryanSaxenaa/Mr.Bill.git
cd Mr.Bill
npm install
npm run dev
```

Open **http://localhost:3847** and follow the demo script below. No API key required — demo mode uses the same tool pipeline as the live agent.

| Time | Route | What to do |
|------|--------|------------|
| 0:00 | `/` | Hook — procurement on autopilot, 3 Cairo cafés |
| 0:30 | `/app/request` | Click **Run demo script** (or Send the pre-filled Layla message → **Confirm & send RFQ**) |
| 1:30 | `/app/quotes` | Comparison table + **Paste supplier reply** (or use auto-parsed mock replies) |
| 2:00 | `/app/request` | **Approve recommendation** |
| 2:30 | `/app/inventory` | Branch rows + audit log updated (persisted in **localStorage**) |
| 3:00 | `/app/dashboard` | Active request status + stock alerts reflect the same session |

## Environment variables

Copy the example file for live LLM mode:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_PROVIDER` | No | Force `openrouter`, `deepseek`, or `openai`. If unset, the first configured key wins: OpenRouter → DeepSeek → OpenAI |
| `OPENROUTER_API_KEY` | No* | Live agent via [OpenRouter](https://openrouter.ai/api/v1) (OpenAI-compatible) |
| `OPENROUTER_MODEL` | No | Default `deepseek/deepseek-chat` (any OpenRouter model id) |
| `OPENROUTER_HTTP_REFERER` | No | Optional attribution header for OpenRouter |
| `OPENROUTER_APP_TITLE` | No | Optional `X-Title` header (default `Mr.Bill`) |
| `DEEPSEEK_API_KEY` | No* | Live agent via [DeepSeek](https://api.deepseek.com) |
| `DEEPSEEK_MODEL` | No | Default `deepseek-chat` |
| `OPENAI_API_KEY` | No* | Live agent via OpenAI |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini` |

\* At least one provider API key is required for live mode; judge demo needs none.

**OpenRouter only** (`.env.local`):

```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=deepseek/deepseek-chat
OPENROUTER_HTTP_REFERER=http://localhost:3847
OPENROUTER_APP_TITLE=Mr.Bill
```

**DeepSeek only** (`.env.local`):

```bash
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
```

**Demo mode (no key):** `GET /api/agent/config` reports `liveAgent: false`. Chat runs the scripted Layla intake → confirm → RFQ → compare → recommend path via `src/lib/demo-agent.ts` and the same five tools in `src/lib/agent-tools.ts`.

**Live mode (with key):** The agent uses an OpenAI-compatible chat completions + tools loop in `src/lib/llm-client.ts` (provider from env). Tools run through `src/lib/agent-executor.ts`. Supplier delivery stays mocked in `src/lib/mock-data.ts` for reliable demos.

## Architecture

```
Layla (browser)
    │
    ▼
Next.js UI ── localStorage ── inventory, audit, agent session, request status
    │
    ▼
POST /api/agent ──┬── demo-agent.ts (no LLM API key)
                  └── llm-client.ts tool loop (OpenRouter / DeepSeek / OpenAI)
                            │
                            ▼
                  agent-executor.ts → agent-tools.ts
                  send_rfq · parse_quote_reply · compare_quotes · recommend · update_inventory
```

Shared app state lives in `src/lib/app-state.tsx` so **Dashboard**, **Quotes**, **Inventory**, and **New request** read the same session after an agent run.

## Agent tools

| Tool | Module |
|------|--------|
| `send_rfq` | `src/lib/agent-tools.ts` |
| `parse_quote_reply` | same |
| `compare_quotes` | same |
| `recommend` | same |
| `update_inventory` | same |

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Lucide icons (ISC)
- Original MIT SVGs under `public/assets/`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **3847** |
| `npm run build` | Production build |
| `npm run start` | Production server on 3847 |
| `npm run lint` | ESLint |
| `npm run test:api` | Smoke-test pages + `/api/health` + `/api/agent` (server on 3847) |

### API smoke tests

With `npm run dev` running:

```bash
npm run test:api
# or: MR_BILL_BASE_URL=http://127.0.0.1:3847 bash scripts/test-api.sh
```

Checks HTTP status for all app routes, `GET /api/agent/config`, agent error cases (400), intake message, and `confirmAction: send_rfq`. When OpenRouter returns an auth error, the API retries DeepSeek when `DEEPSEEK_API_KEY` is set; if both fail, intake falls back to the demo agent (`llmFallback: true`) so the API still returns 200.

## Push to GitHub

```bash
git remote set-url origin https://github.com/AryanSaxenaa/Mr.Bill.git
git push -u origin main
```

If push fails, confirm GitHub auth (SSH key or `gh auth login`) and that the remote matches your fork.

## Scope boundaries (honest)

**Shipped:** Multi-branch intake UI, simulated RFQ + mock Cairo supplier replies, EGP comparison matrix, split-order recommendation, inventory + audit with browser persistence, demo script for keyless judging.

**Not in this repo:** Payment capture, freight booking, customs, voice at dock, real WhatsApp Business API, production email send (roadmap items).

## License

MIT — see [LICENSE](./LICENSE).
