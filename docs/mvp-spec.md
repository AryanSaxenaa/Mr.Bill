# Mr.Bill MVP Specification

**Product:** Open-source Waybill-style procurement desk for food & beverage SMEs (multi-branch café restock)  
**Hackathon:** [Agents at Work](https://agentsatwork.dev) - Professional track  
**Live:** https://mrbill-production.up.railway.app · **Repo:** https://github.com/AryanSaxenaa/Mr.Bill  

**Inspiration:** Waybill-style agent loop (intake → discover → RFQ → compare → decide → inventory) **without** freight, payments, or customs. The product is an **order desk**, not a generic chatbot.

---

## Impact persona: Layla - 3 cafés, Cairo

Layla runs **Maison Layla**, three specialty coffee shops in Zamalek, Maadi, and New Cairo. She restocks milk, beans, pastries, and disposables weekly across branches with different peak hours.

| Pain | Today | With Mr.Bill |
|------|--------|--------------|
| Chasing suppliers | 6–8 hours/week on WhatsApp and email | Structured RFQs + parsed replies on one order ID |
| Branch stockouts | Maadi runs out of oat milk while Zamalek over-orders | Per-branch intake + consolidated compare |
| Price drift | No time to compare three milk quotes line-by-line | Side-by-side EGP table with landed unit cost |
| Inventory truth | Spreadsheet updated “when someone remembers” | Approve recommendation → branch ledger + audit |

---

## User stories (MVP)

1. Describe restock in plain language → confirm structured line items per branch.  
2. Discover vendors (SerpAPI + catalog) before RFQ.  
3. Send RFQs (AgentMail live or simulated) to selected suppliers.  
4. Paste or sync supplier replies → structured quotes.  
5. Compare quotes and accept a split recommendation with rationale.  
6. Approve → inventory updates per branch with audit trail.

Stretch (post-MVP): quote expiry reminders, CSV export for accounting.

---

## Agent tools (six)

| Tool | Purpose |
|------|---------|
| `find_suppliers` | SerpAPI Google search for Cairo wholesalers (+ catalog merge) |
| `send_rfq` | RFQ to suppliers (AgentMail email or simulated + mock replies) |
| `parse_quote_reply` | Unstructured reply → quote lines (MOQ, lead time, EGP) |
| `compare_quotes` | Normalized matrix + warnings |
| `recommend` | Split order + human-readable rationale |
| `update_inventory` | Branch deltas + audit after approval |

**Loop:** Chat intake → confirm → optional `find_suppliers` → `send_rfq` → parse/compare → `recommend` → user approves → `update_inventory`.

Implementation: `src/lib/agent-tools.ts`, `src/lib/agent-executor.ts`, `POST /api/agent`.

---

## Judge demo script (2–3 minutes)

| Time | Scene | What judges see |
|------|--------|-----------------|
| 0:00 | **Hook** | Landing - five animated steps, Maison Layla |
| 0:30 | **Intake** | `/app/request` - **Run demo script** → confirm Maadi/Zamalek line items |
| 1:00 | **RFQ** | Confirm send - simulated or AgentMail status on order |
| 1:30 | **Compare** | `/app/quotes` - EGP matrix, MOQ flags, paste reply optional |
| 2:00 | **Recommend** | Approve split recommendation in chat or order view |
| 2:30 | **Inventory** | `/app/inventory` - branch rows + audit |
| 3:00 | **Close** | Open source · `npm run dev` on 3847 · scope honesty |

**Fallback:** No API keys → `src/lib/demo-agent.ts` runs the same tool pipeline. Live LLM failure → demo fallback (`llmFallback`).

---

## MVP boundaries

**In scope:** Landing + app shell, six tools, SerpAPI/AgentMail/OpenRouter integrations with fallbacks, localStorage session, Railway deploy, API smoke tests.

**Out of scope:** Payments, freight, customs, voice at dock, production WhatsApp Business API.

**Success metrics (slides):** 6+ hours/week saved (chasing + compare), branch visibility, illustrative 5–15% savings on demo split - see [impact-slides.md](./impact-slides.md).

---

## Technical slice (this repo)

- **UI:** Next.js App Router - `src/components/landing/*`, `/app/*` routes, unified theme ([ui-direction.md](./ui-direction.md)).
- **State:** `src/lib/app-state.tsx` + localStorage (inventory, audit, agent session).
- **API:** `/api/agent`, `/api/suppliers/search`, AgentMail sync + webhook, `/api/health`.
- **Port:** **3847** local; **`PORT`** on Railway.
