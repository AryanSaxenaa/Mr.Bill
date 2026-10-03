# Mr.Bill: Hackathon submission guide

**Event:** [Agents at Work](https://agentsatwork.dev) · Professional track  
**Repository:** https://github.com/AryanSaxenaa/Mr.Bill  
**Live demo:** https://mrbill-production.up.railway.app  
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

Optional live integrations (LLM, SerpAPI, AgentMail):

```bash
cp .env.example .env.local
# Add keys - see README.md env table
```

Never commit `.env.local` or any API keys. Set production secrets only in **Railway Variables**.

---

## 2. Run locally

```bash
npm run dev
```

Open **http://localhost:3847**

**Health check:**

```bash
curl -s http://localhost:3847/api/health
# → {"ok":true,"version":"0.1.0"}
```

---

## 3. API smoke tests

With the dev server on port **3847**:

```bash
npm run test:api
```

Exercises app routes, `GET /api/health`, `GET /api/agent/config`, agent validation, intake, and `confirmAction: send_rfq`. Missing or invalid LLM keys fall back to the demo agent so tests still pass.

Production build:

```bash
npm run build
```

---

## 4. Demo path (under 5 minutes)

| Time | Route | Action |
|------|--------|--------|
| 0:00 | `/` | Landing - five-step procurement story, three Cairo cafés |
| 0:30 | `/app/request` | **Run demo script** → **Confirm & send RFQ** |
| 1:30 | `/app/quotes` | Comparison table · **Paste supplier reply** (optional) |
| 2:00 | `/app/request` or `/app/orders/ORD-2026-0142` | **Approve recommendation** |
| 2:30 | `/app/inventory` | Branch stock + audit log (localStorage) |
| 3:00 | `/app/dashboard` | Request status + stock alerts |

**Reset between takes:** **Reset demo data** in the app header.

`GET /api/agent/config` - `liveAgent: false` = keyless demo; with keys, live chat uses the same six tools with demo fallback on failure.

---

## 4b. Optional live integrations

### SerpAPI (discover vendors)

1. Set `SERPAPI_API_KEY` in `.env.local` or Railway.
2. On intake or **New request**, agent/UI can search live wholesalers near Cairo; without a key, catalog suppliers are used.

### AgentMail (RFQ email)

1. Set `AGENTMAIL_API_KEY` in `.env.local` - **never commit**.
2. Optional `MRBILL_RFQ_TO_EMAIL=you@example.com` for judge-safe inbox routing.
3. RFQ panel shows send status with message id when live.
4. Reply by email or paste on `/app/quotes` → **Sync supplier replies** on order detail.
5. Production webhook: `https://mrbill-production.up.railway.app/api/webhooks/agentmail` (`message.received`).

Rotate AgentMail or SerpAPI keys if they were exposed.

---

## 5. Deploy on Railway

1. **New Project** → **Deploy from GitHub** → **AryanSaxenaa/Mr.Bill** → **main**.
2. Build/start in [`railway.toml`](../railway.toml): `npm run build`, `npm run start` (Next.js uses Railway **`PORT`**).
3. Add **Variables** from [`.env.example`](../.env.example) as needed (demo works with none).
4. Set `NEXT_PUBLIC_APP_URL` to your public HTTPS URL when using OpenRouter attribution.
5. Redeploy after env changes. Check `GET /api/health` on the public URL.

**Optional CLI:** `railway login` → `railway link` → `railway up`.

---

## 6. Impact deck copy

**[docs/impact-slides.md](./impact-slides.md)**

---

## 7. Upload to Untap (Agents at Work)

| Item | What to submit |
|------|----------------|
| Repository URL | `https://github.com/AryanSaxenaa/Mr.Bill` |
| Demo video | 2–3 min screen capture following §4 |
| Track | Professional |
| Impact narrative | Bullets from `docs/impact-slides.md` |
| Scope honesty | **In:** intake, discovery, RFQ, compare, recommend, inventory · **Out:** payments, freight, customs, WhatsApp API |

---

## 8. Pre-submit verification

- [ ] `npm run build` succeeds
- [ ] `npm run test:api` passes (dev server on 3847)
- [ ] `curl` `/api/health` returns `ok: true`
- [ ] Demo rehearsed with **Reset demo data** between runs
- [ ] No secrets in git
- [ ] Repository URL and MIT license on Untap

---

## Related docs

- [README.md](../README.md) - pitch, architecture, env vars
- [docs/mvp-spec.md](./mvp-spec.md) - persona, tools, demo script
- [docs/ui-direction.md](./ui-direction.md) - unified theme (no vendor names in UI)
