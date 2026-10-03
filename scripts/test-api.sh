#!/usr/bin/env bash
# Mr.Bill API + page smoke tests. Requires dev server: npm run dev (port 3847).
set -euo pipefail

BASE="${MR_BILL_BASE_URL:-http://127.0.0.1:3847}"
PASS=0
FAIL=0

pass() {
  echo "PASS  $1"
  PASS=$((PASS + 1))
}

fail() {
  echo "FAIL  $1"
  FAIL=$((FAIL + 1))
}

expect_status() {
  local name="$1"
  local method="${2:-GET}"
  local path="$3"
  local want="$4"
  local body="${5:-}"
  local extra_headers="${6:-}"

  local code
  if [ "$method" = "GET" ]; then
    code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  else
    code=$(curl -s -o /tmp/mr-bill-smoke.json -w "%{http_code}" -X "$method" "$BASE$path" \
      -H "Content-Type: application/json" \
      $extra_headers \
      -d "$body")
  fi

  if [ "$code" = "$want" ]; then
    pass "$name (HTTP $code)"
  else
    fail "$name (expected HTTP $want, got $code)"
    if [ -f /tmp/mr-bill-smoke.json ]; then
      head -c 400 /tmp/mr-bill-smoke.json 2>/dev/null | tr '\n' ' '
      echo
    fi
  fi
}

echo "Mr.Bill smoke tests → $BASE"
echo

if ! curl -s -o /dev/null --connect-timeout 2 "$BASE/"; then
  echo "ERROR: Server not reachable at $BASE. Run: npm run dev"
  exit 1
fi

expect_status "GET /" GET "/" "200"
expect_status "GET /app/orders" GET "/app/orders" "200"
expect_status "GET /app/orders/new" GET "/app/orders/new" "200"
expect_status "GET /app/dashboard" GET "/app/dashboard" "307"
expect_status "GET /app/request" GET "/app/request" "307"
expect_status "GET /app/quotes" GET "/app/quotes" "200"
expect_status "GET /app/inventory" GET "/app/inventory" "200"

expect_status "GET /api/health" GET "/api/health" "200"

HEALTH=$(curl -s "$BASE/api/health")
if echo "$HEALTH" | grep -q '"ok":true' && echo "$HEALTH" | grep -q '"version"'; then
  pass "GET /api/health body (ok + version)"
else
  fail "GET /api/health body (expected ok:true and version)"
fi

expect_status "GET /api/agent/config" GET "/api/agent/config" "200"
expect_status "GET /api/agentmail/inbox unauthorized" GET "/api/agentmail/inbox" "401"
expect_status "POST /api/webhooks/agentmail unsigned" POST "/api/webhooks/agentmail" "401" '{"event_type":"message.received","message":{"message_id":"smoke-test-msg","inbox_id":"smoke-inbox","subject":"[Supplier: Cairo Dairy Co.] RFQ RFQ-SMOKE","text":"Oat milk 1L: EGP 42.50/carton"}}'

expect_status "POST /api/agent missing message" POST "/api/agent" "400" '{}'

code=$(curl -s -o /tmp/mr-bill-suppliers.json -w "%{http_code}" -X POST "$BASE/api/suppliers/search" \
  -H "Content-Type: application/json" \
  -d '{"lineItems":[{"sku":"OAT-1L","name":"Oat milk 1L","qty":48,"unit":"carton","branchId":"maadi"}]}')

if [ "$code" = "200" ] && grep -q '"results"' /tmp/mr-bill-suppliers.json && grep -q 'cairo-dairy' /tmp/mr-bill-suppliers.json; then
  if grep -q '"source":"serpapi"' /tmp/mr-bill-suppliers.json || grep -q '"poweredBySerpApi":true' /tmp/mr-bill-suppliers.json; then
    pass "POST /api/suppliers/search (HTTP 200, live source + catalog merge)"
  elif grep -q '"source":"catalog"' /tmp/mr-bill-suppliers.json || grep -q '"poweredBySerpApi":false' /tmp/mr-bill-suppliers.json; then
    pass "POST /api/suppliers/search catalog fallback (no live search key)"
  else
    pass "POST /api/suppliers/search (HTTP 200, catalog rows present)"
  fi
else
  fail "POST /api/suppliers/search (expected HTTP 200 + catalog ids, got $code)"
fi

expect_status "POST /api/agent invalid JSON" POST "/api/agent" "400" 'not json'

code=$(curl -s -o /tmp/mr-bill-intake.json -w "%{http_code}" -X POST "$BASE/api/agent" \
  -H "Content-Type: application/json" \
  -d '{"message":"Need oat milk and cups for Maadi by Friday"}')

if [ "$code" = "200" ] && grep -q 'assistantMessage' /tmp/mr-bill-intake.json; then
  if grep -q '"llmFallback":true' /tmp/mr-bill-intake.json; then
    pass "POST /api/agent live intake (HTTP 200, demo fallback - check OpenRouter key for true live)"
  else
    pass "POST /api/agent live intake (HTTP 200, assistant reply)"
  fi
else
  fail "POST /api/agent live intake (expected HTTP 200 + assistantMessage, got $code)"
fi

SEND_RFQ_BODY='{"message":"","confirmAction":"send_rfq","session":{"requestId":"req-smoke","lineItems":[],"status":"draft","neededBy":"Friday","deliveryBranch":"Maadi","quoteIds":[],"comparisonId":null,"selectedRfqSupplierIds":["cairo-dairy","bean-barrel"]}}'
code=$(curl -s -o /tmp/mr-bill-rfq.json -w "%{http_code}" -X POST "$BASE/api/agent" \
  -H "Content-Type: application/json" \
  -d "$SEND_RFQ_BODY")

if [ "$code" = "200" ] && grep -q 'toolTrace' /tmp/mr-bill-rfq.json && grep -q 'send_rfq' /tmp/mr-bill-rfq.json && grep -q '"rfqId"' /tmp/mr-bill-rfq.json; then
  if grep -q '"deliveryMode"' /tmp/mr-bill-rfq.json && grep -q '"emailDeliveries"' /tmp/mr-bill-rfq.json; then
    pass "POST /api/agent confirmAction send_rfq (HTTP 200, pipeline + deliveryMode)"
  else
    pass "POST /api/agent confirmAction send_rfq (HTTP 200, pipeline + rfqId)"
  fi
else
  fail "POST /api/agent confirmAction send_rfq (expected HTTP 200 + toolTrace + rfqId, got $code)"
fi

expect_status "POST /api/agentmail/thread missing rfqId" POST "/api/agentmail/thread" "400" '{}'
THREAD_BODY='{"rfqId":"RFQ-SMOKE","requestId":"req-smoke"}'
code=$(curl -s -o /tmp/mr-bill-thread.json -w "%{http_code}" -X POST "$BASE/api/agentmail/thread" \
  -H "Content-Type: application/json" \
  -d "$THREAD_BODY")
if [ "$code" = "200" ] && grep -q '"inbound"' /tmp/mr-bill-thread.json; then
  pass "POST /api/agentmail/thread session-scoped (HTTP 200, inbound array)"
else
  fail "POST /api/agentmail/thread (expected HTTP 200 + inbound, got $code)"
fi

CONFIG=$(curl -s "$BASE/api/agent/config")
if echo "$CONFIG" | grep -q '"liveAgent":false'; then
  code=$(curl -s -o /tmp/mr-bill-demo.json -w "%{http_code}" -X POST "$BASE/api/agent" \
    -H "Content-Type: application/json" \
    -d '{"message":"Need oat milk for Maadi by Friday"}')
  if [ "$code" = "200" ] && grep -q '"mode":"demo"' /tmp/mr-bill-demo.json; then
    pass "POST /api/agent demo intake (liveAgent false)"
  else
    fail "POST /api/agent demo intake"
  fi
else
  echo "SKIP  demo-only intake (liveAgent true; demo path runs when no API keys)"
fi

echo
echo "Results: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
