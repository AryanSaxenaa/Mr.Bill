# Mr.Bill

Open-source procurement agent for food & beverage SMEs — multi-branch café restock without freight, payments, or customs.

**Hackathon:** [Agents at Work](https://agentsatwork.dev) · Professional track  
**Persona:** Layla runs **Maison Layla** (Zamalek, Maadi, New Cairo). She describes restock needs in plain language; Mr.Bill structures RFQs, compares supplier quotes in EGP, recommends a split order, and updates branch inventory after approval.

**Repository:** [github.com/AryanSaxenaa/Mr.Bill](https://github.com/AryanSaxenaa/Mr.Bill)

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
| 1:30 | `/app/quotes` | Comparison table + recommendation from your session (not static orphan data) |
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

## Hackathon submission checklist

- [ ] Record 2–3 min screen capture following the judge table above
- [ ] Submit repo URL: `https://github.com/AryanSaxenaa/Mr.Bill`
- [ ] Impact slides copy: see `docs/impact-slides.md` in the project Context (Untap submission)
- [ ] Note scope: **in** chat intake, RFQ drafts, quote compare, recommendation, inventory ledger · **out** payments, freight, customs, production WhatsApp

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

MIT
