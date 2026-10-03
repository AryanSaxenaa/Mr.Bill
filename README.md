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
| 0:30 | `/app/orders/new` | Fill line items (or **Parse into line items** in Ask Mr.Bill) → **Send RFQs** |
| 1:30 | `/app/quotes` | Quote desk comparison + **Paste supplier reply** |
| 2:00 | `/app/orders/ORD-2026-0142` | Review recommendation → **Approve & update inventory** |
| 2:30 | `/app/inventory` | Branch rows + audit log updated (persisted in **localStorage**) |
| 3:00 | `/app/orders` | Pipeline status + open orders list |

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

**Live mode (with key):** The agent uses an OpenAI-compatible chat completions + tools loop in `src/lib/llm-client.ts` (provider from env). Tools run through `src/lib/agent-executor.ts`.

### AgentMail (real RFQ email)

| Variable | Required | Description |
|----------|----------|-------------|
| `AGENTMAIL_API_KEY` | No | When set, `send_rfq` delivers real email via [AgentMail](https://agentmail.to). Without it, RFQs stay simulated with instant mock replies. |
| `AGENTMAIL_INBOX_ID` | No | Reuse an inbox; otherwise one is created with `clientId` `mrbill-procurement-v1` on first send. |
| `MRBILL_RFQ_TO_EMAIL` | No | **Hackathon-safe:** all RFQs go to this address; subject prefix `[Supplier: …]` keeps supplier context. |

### SerpAPI (supplier discovery)

| Variable | Required | Description |
|----------|----------|-------------|
| `SERPAPI_API_KEY` | No | When set, `find_suppliers` and `POST /api/suppliers/search` call [SerpAPI](https://serpapi.com/) Google search for wholesale vendors near Cairo. Without it, the app returns the mock `SUPPLIERS` catalog with a clear message (demo-safe). |

**Local setup** (`.env.local` only — never commit):

```bash
SERPAPI_API_KEY=your_key_from_serpapi_dashboard
```

**Railway:** add `SERPAPI_API_KEY` under **Variables** only when you want live Google discovery on production. Demo judging works without it.

Server calls live in `src/lib/serpapi.ts`; the browser uses `POST /api/suppliers/search` so the key never ships to the client.


`https://mrbill-production.up.railway.app/api/webhooks/agentmail`

On the order desk (`/app/orders/ORD-2026-0142`), use **Sync supplier replies** after suppliers email back. Inbound messages are also accepted at `POST /api/webhooks/agentmail` (`message.received`).

If an API key was ever pasted in chat or committed, **rotate it** in the AgentMail console and update Railway Variables / `.env.local`.

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
                  find_suppliers · send_rfq · parse_quote_reply · compare_quotes · recommend · update_inventory
```

Shared app state lives in `src/lib/app-state.tsx` so **Dashboard**, **Quotes**, **Inventory**, and **New request** read the same session after an agent run.

## Agent tools

| Tool | Module |
|------|--------|
| `find_suppliers` | `src/lib/serpapi.ts` + `src/lib/agent-tools.ts` |
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
| `npm run start` | Production server (port **3847** locally; **`PORT`** on Railway) |
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

From your machine (GitHub auth is **yours**, not the cloud agent VM):

```bash
git remote set-url origin https://github.com/AryanSaxenaa/Mr.Bill.git
git push -u origin main
```

If push fails, confirm GitHub auth (SSH key, personal access token, or `gh auth login`) and that the remote matches your fork.

**Secrets:** Never commit `.env.local`. Copy keys only into Railway **Variables** (or local `.env.local` for dev).

## Deploy on Railway

Railway sets **`PORT`** at runtime; `npm run start` runs `next start -p ${PORT:-3847}` so production listens on Railway’s port (3847 when `PORT` is unset locally).

1. Push the repo to GitHub (see above).
2. In [Railway](https://railway.com) (logged in on **your** machine): **New Project** → **Deploy from GitHub** → select **AryanSaxenaa/Mr.Bill** → branch **main**.
3. Railway uses Nixpacks (see [`railway.toml`](./railway.toml)): **build** `npm run build`, **start** `npm run start`.
4. After the first deploy, open the generated **public URL** and set **Variables** (Project → Service → Variables), matching [`.env.example`](./.env.example):

   | Variable | Value |
   |----------|--------|
   | `OPENROUTER_API_KEY` | Your OpenRouter key (optional for demo-only hosting) |
   | `LLM_PROVIDER` | `openrouter` (if using OpenRouter) |
   | `OPENROUTER_MODEL` | e.g. `deepseek/deepseek-chat` |
   | `NEXT_PUBLIC_APP_URL` | Your Railway HTTPS URL (e.g. `https://mr-bill-production.up.railway.app`) |
   | `OPENROUTER_HTTP_REFERER` | Same as `NEXT_PUBLIC_APP_URL` (recommended for OpenRouter) |
   | `SERPAPI_API_KEY` | Optional — live supplier discovery; omit for demo catalog fallback |

   Redeploy after changing variables. Demo mode works without API keys; live chat needs at least one provider key. **Do not set `SERPAPI_API_KEY` on Railway unless you intend to use live Google search** (local `.env.local` is enough for development).

5. **Optional CLI** (if [Railway CLI](https://docs.railway.com/guides/cli) is installed locally):

   ```bash
   railway login
   railway link    # pick the Mr.Bill service
   railway up      # deploy from current directory
   ```

Verify: `curl -s https://YOUR-RAILWAY-URL/api/health` → `{"ok":true,"version":"0.1.0"}`.

## Scope boundaries (honest)

**Shipped:** Multi-branch intake UI, simulated RFQ + mock Cairo supplier replies, EGP comparison matrix, split-order recommendation, inventory + audit with browser persistence, demo script for keyless judging.

**Not in this repo:** Payment capture, freight booking, customs, voice at dock, real WhatsApp Business API, production email send (roadmap items).

## Credits

- **Marketing landing** — Adapted from [Cruip Simple Light](https://github.com/cruip/tailwind-landing-page-template) (free Tailwind landing template). Planet, stripes, avatars, and logo orbit assets ship under `public/assets/landing/`.
- **In-app illustrations** — unDraw (MIT) via `undraw-svg`, listed in project UI direction docs.

## License

MIT — see [LICENSE](./LICENSE).
