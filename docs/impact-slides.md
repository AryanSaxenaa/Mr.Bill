# Mr.Bill — Untap impact deck copy

**Track:** Agents at Work · Professional  
**Product:** Open-source procurement agent for F&B SMEs  
**Repo:** https://github.com/AryanSaxenaa/Mr.Bill

Use one slide per section below. Replace screenshot placeholders before final export.

---

## Slide 1 — Title

**Headline:** Mr.Bill — procurement on autopilot for food & beverage SMEs  

**Subhead:** Open-source agent loop: intake → RFQ → compare → decide → update inventory  

**Footer:** Agents at Work · Maison Layla demo · Cairo, EGP  

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

**Visual:** Simple funnel diagram — messages → inbox chaos → stale spreadsheet  

---

## Slide 4 — Mr.Bill solution

**Headline:** One agent loop, five tools, human approval at the decision  

**Flow:**
1. **Chat intake** — plain-language restock per branch  
2. **Confirm** structured line items  
3. **`send_rfq`** — drafts to saved suppliers (demo: simulated send + mock replies)  
4. **`parse_quote_reply`** · **`compare_quotes`** — EGP unit economics, MOQ flags  
5. **`recommend`** — split order with rationale  
6. **Approve** → **`update_inventory`** — branch ledger + audit  

**Differentiator:** Waybill-style reliability for **procurement records**, not freight or payments.

---

## Slide 5 — Metrics (illustrative, demo-backed)

**Headline:** Operator impact — time, cost, revenue protection  

| Metric | Before | With Mr.Bill (target / demo) |
|--------|--------|------------------------------|
| Time chasing + comparing | 6–8 h / week | ~1 h / week (agent drafts + one compare view) |
| Stockout risk (branch visibility) | Low visibility | Per-branch intake + post-approval inventory |
| Material savings on compared categories | Rarely compared | **5–15% illustrative** on demo split (e.g. ~EGP 840 vs single supplier in Layla script) |
| Decision latency | Hours–days | Under **1 minute** on comparison table |

**Note for judges:** Savings figure comes from the demo recommendation engine, not a live pilot — honest scope for hackathon.

---

## Slide 6 — Product screenshot placeholders

**Headline:** What judges see in 3 minutes  

| Placeholder | Caption |
|-------------|---------|
| `[Screenshot: Landing — Agents at Work / open source]` | Hook — F&B procurement, 3 cafés |
| `[Screenshot: New request chat — line items confirm]` | Layla intake → structured SKUs |
| `[Screenshot: Quotes — comparison matrix]` | Side-by-side EGP, MOQ, lead time |
| `[Screenshot: Inventory — Maadi oat milk updated]` | Approved order → branch ledger |

**Live URL (local):** http://localhost:3847 · **Run demo script** works without API key  

---

## Slide 7 — Open source & roadmap

**Headline:** MIT · extensible · production path  

**Shipped in repo:**
- Next.js UI + shared session (localStorage)  
- Five TypeScript tools + OpenAI loop (optional)  
- Demo script for keyless judging  

**Roadmap (post-hackathon):**
- WhatsApp / email connector for real RFQ delivery  
- Convex or similar backend for multi-user auth and persistence  
- Quote expiry reminders · CSV export for accounting  

**CTA:** Star & fork — https://github.com/AryanSaxenaa/Mr.Bill  

---

## Slide 8 — Close

**Headline:** Less chasing. Fewer stockouts. Better unit economics.  

**Subhead:** Mr.Bill — open-source procurement agents for operators like Layla.  

**Contact / links:** GitHub repo · Agents at Work submission · `npm install && npm run dev` on port 3847  

---

## Speaker notes (2–3 min)

1. Introduce Layla and the three-branch pain (30 s).  
2. Show **Run demo script** on `/app/request` — confirm, RFQ, compare in chat (60 s).  
3. **Quotes** tab — same session data (30 s).  
4. Approve → **Inventory** + **Dashboard** (45 s).  
5. Close with scope honesty: no payments/freight; open source and roadmap (15 s).  
