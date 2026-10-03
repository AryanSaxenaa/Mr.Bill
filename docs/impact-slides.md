# Mr.Bill — Untap impact deck copy

**Track:** Agents at Work · Professional  
**Product:** Open-source Waybill-style procurement desk for F&B SMEs  
**Repo:** https://github.com/AryanSaxenaa/Mr.Bill  
**Live:** https://mrbill-production.up.railway.app  

Use one slide per section below. Replace screenshot placeholders before final export.

---

## Slide 1 — Title

**Headline:** Mr.Bill — procurement on autopilot for food & beverage SMEs  

**Subhead:** Order desk loop: chat intake → discover vendors → email RFQs → compare → approve → inventory  

**Footer:** Agents at Work · Maison Layla · Cairo, EGP · MIT open source  

---

## Slide 2 — Impact persona: Layla

**Headline:** Layla runs three specialty cafés — and still chases suppliers by hand  

**Body bullets:**
- **Maison Layla** — Zamalek, Maadi, New Cairo  
- Weekly restock: milk, beans, pastries, disposables across branches with different peak hours  
- Pain: 6–8 hours/week on WhatsApp and email, branch stockouts, no time to compare quotes line-by-line  

**Quote (optional):** *“Maadi runs out of oat milk while Zamalek over-orders — I need one place to see what to buy, from whom, before the lunch rush.”*

---

## Slide 3 — As-is workflow

**Headline:** Today: fragmented, manual, error-prone  

| Step | Operator time | Risk |
|------|----------------|------|
| Branch managers text needs | Ad hoc | Wrong SKU / branch |
| Copy-paste RFQs to suppliers | 1–2 h / cycle | Inconsistent terms |
| Parse replies in inbox | 2–3 h / cycle | Missed MOQ / lead time |
| Spreadsheet compare | Often skipped | Price drift |
| Update stock “when someone remembers” | Delayed | Stockouts |

---

## Slide 4 — Mr.Bill solution

**Headline:** One desk, six tools, human approval at the decision  

**Flow (matches landing “How it works”):**
1. **Chat / intake** — plain-language restock per branch  
2. **Discover vendors** — live search + trusted catalog  
3. **Email for quotes** — RFQs on one order ID (AgentMail when configured)  
4. **Compare & recommend** — EGP landed cost, split plan  
5. **Approve & sync inventory** — branch ledger + audit  

**Differentiator:** Waybill-style **procurement records**, not freight or payments — and not “just a chatbot.”

---

## Slide 5 — Metrics (illustrative, demo-backed)

**Headline:** Operator impact — time, cost, revenue protection  

| Metric | Before | With Mr.Bill (target / demo) |
|--------|--------|------------------------------|
| Time chasing + comparing | 6–8 h / week | ~1 h / week (drafts + one compare view) |
| Stockout risk | Low visibility | Per-branch intake + post-approval inventory |
| Material savings (compared categories) | Rarely compared | **5–15% illustrative** on demo split |
| Decision latency | Hours–days | Under **1 minute** on comparison table |

**Note for judges:** Savings from the demo recommendation engine — honest hackathon scope.

---

## Slide 6 — Product screenshots

**Headline:** What judges see in 3 minutes  

| Placeholder | Caption |
|-------------|---------|
| Landing — five-step animation | Hook — F&B procurement desk |
| `/app/request` — demo script | Intake → confirm → RFQ |
| `/app/quotes` — matrix | EGP compare + paste reply |
| `/app/inventory` | Approved order → branch ledger |

**URLs:** https://mrbill-production.up.railway.app · local http://localhost:3847 · keyless **Run demo script**

---

## Slide 7 — Open source & roadmap

**Headline:** MIT · extensible · production path  

**Shipped in repo:**
- Next.js UI + shared session (localStorage)  
- Six TypeScript tools + optional OpenRouter/DeepSeek/OpenAI loop  
- SerpAPI + AgentMail integrations with demo fallbacks  
- Railway deploy + `npm run test:api`  

**Roadmap (post-hackathon):**
- WhatsApp connector · multi-user backend (e.g. Convex)  
- Quote expiry reminders · CSV export for accounting  

**CTA:** https://github.com/AryanSaxenaa/Mr.Bill  

---

## Slide 8 — Close

**Headline:** Less chasing. Fewer stockouts. Better unit economics.  

**Subhead:** Mr.Bill — open-source procurement desk for operators like Layla.  

**Links:** GitHub · Agents at Work submission · `npm install && npm run dev` (port 3847)

---

## Speaker notes (2–3 min)

1. Introduce Layla and three-branch pain (30 s).  
2. **Run demo script** on `/app/request` — confirm, RFQ, compare (60 s).  
3. **Quotes** — same session (30 s).  
4. Approve → **Inventory** + **Dashboard** (45 s).  
5. Close: scope honesty (no payments/freight); live integrations optional; MIT repo (15 s).
