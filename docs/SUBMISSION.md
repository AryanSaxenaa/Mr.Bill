# Mr.Bill — Hackathon submission guide

**Event:** [Agents at Work](https://agentsatwork.dev) · Professional track  
**Repository:** https://github.com/AryanSaxenaa/Mr.Bill  
**License:** MIT

Use this checklist before you submit to Untap or record the judge demo.

---

## 1. Environment

No API key is required for the judge path.

```bash
git clone https://github.com/AryanSaxenaa/Mr.Bill.git
cd Mr.Bill
npm install
```

Optional live LLM (OpenRouter / DeepSeek / OpenAI):

```bash
cp .env.example .env.local
# Add one provider key — see README.md
```

Never commit `.env.local` or any API keys. Set production secrets only in **Railway Variables** (or your host’s secret store), not in git.

---

## 1b. Push code (your machine)

GitHub authentication happens on **your** laptop or CI — not on the agent VM.

```bash
git remote set-url origin https://github.com/AryanSaxenaa/Mr.Bill.git
git push -u origin main
```

Use SSH or HTTPS with a personal access token / `gh auth login` if push is rejected.

---

## 1c. Deploy on Railway (your machine)

1. **New Project** → **Deploy from GitHub** → **AryanSaxenaa/Mr.Bill** → **main**.
2. Build/start (also in [`railway.toml`](../railway.toml)): `npm run build` then `npm run start` (Next.js binds to Railway’s **`PORT`**).
3. Copy the service **public URL**, then add **Variables** from [`.env.example`](../.env.example):

   - `OPENROUTER_API_KEY` — optional for judge/demo hosting; required for live LLM
   - `LLM_PROVIDER=openrouter` — when using OpenRouter
   - `OPENROUTER_MODEL=deepseek/deepseek-chat` — or another model id
   - `NEXT_PUBLIC_APP_URL` — your Railway HTTPS URL
   - `OPENROUTER_HTTP_REFERER` — same URL (OpenRouter attribution)

4. Redeploy after env changes. Check `GET /api/health` on the public URL.

**Optional:** with Railway CLI installed locally: `railway login` → `railway link` → `railway up`.

---

## 2. Run locally

```bash
npm run dev
```

Open **http://localhost:3847**

**Health check (ops / judges):**

```bash
curl -s http://localhost:3847/api/health
# → {"ok":true,"version":"0.1.0"}
```

---

## 3. API smoke tests

With the dev server running on port **3847**:

```bash
npm run test:api
```

This exercises app routes, `GET /api/health`, `GET /api/agent/config`, agent validation, intake, and `confirmAction: send_rfq`. If live LLM keys are missing or invalid, intake falls back to the demo agent so tests still pass.

Production build check:

```bash
npm run build
```

---

## 4. Demo path (under 5 minutes)

| Time | Route | Action |
|------|--------|--------|
| 0:00 | `/` | Landing — procurement on autopilot, three Cairo cafés |
| 0:30 | `/app/request` | **Run demo script** → **Confirm & send RFQ** |
| 1:30 | `/app/quotes` | Comparison table · **Paste supplier reply** (optional) |
| 2:00 | `/app/request` | **Approve recommendation** |
| 2:30 | `/app/inventory` | Branch stock + audit log (localStorage) |
| 3:00 | `/app/dashboard` | Request status + stock alerts |

**Reset between takes:** use **Reset demo data** in the app header (clears browser session and reloads).

`GET /api/agent/config` — `liveAgent: false` means keyless demo mode; with keys, live chat uses the same five tools with demo fallback on failure.

---

## 5. Impact deck copy

Slide text for Untap / pitch deck: **[docs/impact-slides.md](./impact-slides.md)**

---

## 6. Upload to Untap (Agents at Work)

| Item | What to submit |
|------|----------------|
| Repository URL | `https://github.com/AryanSaxenaa/Mr.Bill` |
| Demo video | 2–3 min screen capture following the table in §4 |
| Track | Professional |
| Impact narrative | Bullets from `docs/impact-slides.md` (persona Layla, as-is vs with Mr.Bill, agent loop) |
| Scope honesty | **In:** intake, RFQ drafts, quote compare, recommendation, inventory ledger · **Out:** payments, freight, customs, production WhatsApp |

---

## 7. Pre-submit verification

- [ ] `npm run build` succeeds
- [ ] `npm run test:api` passes (dev server on 3847)
- [ ] `curl` `/api/health` returns `ok: true` and app version
- [ ] Demo recorded or rehearsed with **Reset demo data** between runs
- [ ] No secrets in git (`.env.local` stays local; use Railway Variables in production)
- [ ] Repository URL and MIT license noted on Untap

---

## Related docs

- [README.md](../README.md) — architecture, env vars, judge table
- [docs/impact-slides.md](./impact-slides.md) — Untap slide copy
