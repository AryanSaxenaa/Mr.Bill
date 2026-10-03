# Mr.Bill

**Open-source Waybill-style procurement desk for food & beverage SMEs** - not a generic chatbot. Layla describes a Friday restock in plain language; Mr.Bill structures branch line items, discovers suppliers, sends RFQ email, compares quotes in EGP, recommends a split order, and syncs inventory after she approves. Freight, payments, and customs stay out of scope.

| | |
|---|---|
| **Live app** | [mrbill-production.up.railway.app](https://mrbill-production.up.railway.app) |
| **Source** | [github.com/AryanSaxenaa/Mr.Bill](https://github.com/AryanSaxenaa/Mr.Bill) |
| **Hackathon** | [Agents at Work](https://agentsatwork.dev) · Professional track |
| **Persona** | **Maison Layla** - Zamalek, Maadi, New Cairo |
| **License** | MIT ([LICENSE](./LICENSE)) |

---

## What it does (How it works)

Same five steps as the landing page - one order ID from intake to approval:

| Step | User-facing name | What happens |
|------|------------------|--------------|
| 1 | **Chat / intake** | Plain-language restock → structured line items per branch |
| 2 | **Discover vendors** | Live supplier search (SerpAPI) merged with your trusted catalog |
| 3 | **Email for quotes** | Structured RFQs from your quote inbox; replies attach to the order |
| 4 | **Compare & recommend** | Landed cost in EGP, delivery days, split recommendation |
| 5 | **Approve & sync inventory** | One approval updates branch stock + audit trail |

**Integrations (server-side, with demo fallbacks):**

- **[OpenRouter](https://openrouter.ai)** / **[DeepSeek](https://api.deepseek.com)** / OpenAI - optional live agent on `/app/orders/new` (`src/lib/llm-client.ts`)
- **[SerpAPI](https://serpapi.com)** - Google wholesale discovery (`find_suppliers`, `POST /api/suppliers/search`)
- **[AgentMail](https://agentmail.to)** - real RFQ email + inbound webhook (`send_rfq`, `POST /api/webhooks/agentmail`)

Without API keys, judges still get the full tool pipeline via the scripted demo agent and catalog fallbacks - same UI, same five tools.

---

## Quick start

```bash
git clone https://github.com/AryanSaxenaa/Mr.Bill.git
cd Mr.Bill
npm install
cp .env.example .env.local   # optional - see env table below
npm run dev
```

Open **http://localhost:3847** · Health: `curl -s http://localhost:3847/api/health` → `{"ok":true,"version":"0.1.0"}`

**Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **3847** |
| `npm run build` | Production build |
| `npm run start` | Production server (`PORT` on Railway, else **3847**) |
| `npm run test:api` | Smoke-test routes + `/api/agent` (dev server must be running) |
| `npm run lint` | ESLint |

With `npm run dev` running: `npm run test:api` (or `MR_BILL_BASE_URL=http://127.0.0.1:3847 bash scripts/test-api.sh`).

---

## Environment variables

Copy [`.env.example`](./.env.example) to `.env.local` - **never commit** secrets. Production: Railway **Variables** only.

### LLM (optional live agent)

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_PROVIDER` | No | Force `openrouter`, `deepseek`, or `openai`. Default: first key found (OpenRouter → DeepSeek → OpenAI) |
| `OPENROUTER_API_KEY` | No* | Live chat via OpenRouter (OpenAI-compatible) |
| `OPENROUTER_MODEL` | No | Default `deepseek/deepseek-chat` |
| `OPENROUTER_HTTP_REFERER` | No | Optional attribution URL |
| `OPENROUTER_APP_TITLE` | No | Optional `X-Title` (default `Mr.Bill`) |
| `DEEPSEEK_API_KEY` | No* | Live chat via DeepSeek |
| `DEEPSEEK_MODEL` | No | Default `deepseek-chat` |
| `OPENAI_API_KEY` | No* | Live chat via OpenAI |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini` |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL; used as OpenRouter referer when `OPENROUTER_HTTP_REFERER` unset |

\* At least one provider key enables live mode. `GET /api/agent/config` reports `liveAgent`. On failure, intake falls back to the demo agent (`llmFallback: true`).

### SerpAPI (supplier discovery)

| Variable | Required | Description |
|----------|----------|-------------|
| `SERPAPI_API_KEY` | No | Live Google search for Cairo wholesalers; without it, catalog suppliers + clear message |

### AgentMail (RFQ email)

| Variable | Required | Description |
|----------|----------|-------------|
| `AGENTMAIL_API_KEY` | No | Real RFQ delivery; without it, simulated send + instant mock replies |
| `AGENTMAIL_INBOX_ID` | No | Reuse inbox; else created with `clientId` `mrbill-procurement-v1` |
| `MRBILL_RFQ_TO_EMAIL` | No | Hackathon-safe: all RFQs to one inbox; subject `[Supplier: …]` keeps context |
| `MRBILL_INBOX_SECRET` | No | Shared secret for `GET /api/agentmail/inbox` and the webhook. Send header `x-mrbill-inbox-key`. Without it, both routes return 401. |
| `AGENTMAIL_WEBHOOK_SECRET` | No | Alternate value accepted for the same header. |

Inbound webhook (production): `https://mrbill-production.up.railway.app/api/webhooks/agentmail` (`message.received`). Unsigned posts return 401. On order detail, use **Sync supplier replies** after mail arrives. Configure `x-mrbill-inbox-key` as a custom delivery header on the quote-inbox webhook.

Rotate any key that was pasted in chat or committed.

---

## Architecture

```
Browser (Layla)
    │
    ▼
Next.js App Router - landing + /app/* (orders, new order, quotes, inventory)
    │  shared session: localStorage via src/lib/app-state.tsx
    ▼
API routes
    POST /api/agent              - demo agent OR OpenAI-compatible tool loop
    GET  /api/agent/config       - liveAgent, integration flags
    POST /api/suppliers/search   - SerpAPI (key server-only)
    POST /api/agentmail/sync     - pull inbound replies
    POST /api/webhooks/agentmail - inbound events (header required)
    GET  /api/health
    GET  /api/agentmail/inbox     - requires x-mrbill-inbox-key
    ▼
src/lib/agent-executor.ts → agent-tools.ts
    find_suppliers · send_rfq · parse_quote_reply · compare_quotes · recommend · update_inventory
```

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Lucide (ISC). Marketing landing adapted from [Cruip Simple Light](https://github.com/cruip/tailwind-landing-page-template); MIT SVGs under `public/assets/`.

More detail: [docs/mvp-spec.md](./docs/mvp-spec.md) · UI tokens: [docs/ui-direction.md](./docs/ui-direction.md)

---

## Deploy on Railway

1. [New Project](https://railway.com) → **Deploy from GitHub** → **AryanSaxenaa/Mr.Bill** → **main**
2. [`railway.toml`](./railway.toml): build `npm run build`, start `npm run start` (binds `PORT`)
3. Set **Variables** from the env table (at minimum `NEXT_PUBLIC_APP_URL` = your public HTTPS URL when using OpenRouter)
4. Verify: `curl -s https://mrbill-production.up.railway.app/api/health`

Demo hosting works with **no** API keys. Add keys only for live LLM, SerpAPI, or AgentMail on production.

---

## Judge demo (under 5 minutes)

Full checklist: **[docs/SUBMISSION.md](./docs/SUBMISSION.md)** · Slide copy: **[docs/impact-slides.md](./docs/impact-slides.md)**

| Time | Route | Action |
|------|--------|--------|
| 0:00 | `/` | Landing - five-step story, Maison Layla. **Take a tour** (Shepherd) auto-starts once; **Replay tour** is in the nav and app header |
| 0:30 | `/app/orders/new` | Follow the tour or click **Run demo script** → confirm line items → **Send RFQs** |
| 1:30 | `/app/quotes` | Comparison matrix · **Paste supplier reply** (optional) |
| 2:00 | `/app/orders/ORD-2026-0142` | **Approve & update inventory** |
| 2:30 | `/app/inventory` | Branch stock + audit (localStorage) |
| 3:00 | `/app/orders` | Pipeline status + below-par SKUs |

The guided tour walks landing → order desk → Run demo script → line items / Find suppliers → Send RFQs → quote desk → approve → inventory. **Skip tour** is on every step. After the first visit, use **Replay tour** (landing nav or app header). On small screens the tour is four steps.

**Reset between takes:** **Reset demo data** in the app header (toast confirms).

No API key required for the judge path. Live quote-inbox failure still attaches Cairo Dairy / Bean & Barrel quotes so compare works. `npm run build` and `npm run test:api` pass in CI without keys.

---

## Scope (honest)

**In this repo:** Multi-branch intake, supplier discovery (live or catalog), RFQ email (live or simulated), quote parse/compare/recommend, inventory + audit with browser persistence, keyless demo script.

**Out:** Payment capture, freight booking, customs, voice at dock, production WhatsApp Business API.

---

## Credits

- **Landing template** - [Cruip Simple Light](https://github.com/cruip/tailwind-landing-page-template) · assets under `public/assets/landing/`
- **In-app illustrations** - unDraw (MIT) via `undraw-svg` · see [docs/ui-direction.md](./docs/ui-direction.md)
