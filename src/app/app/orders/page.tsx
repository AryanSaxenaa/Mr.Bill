"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEMO_ORDERS,
  branchName,
  supplierName,
  ACTIVE_ORDER_ID,
  type OrderRecord,
} from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";
import { sessionToOrderStage } from "@/lib/order-mapper";
import { OrderStatusPill } from "@/components/order-status-pill";
import { ArrowRight, PackagePlus } from "lucide-react";

function buildActiveOrder(
  requestId: string,
  stage: ReturnType<typeof sessionToOrderStage>,
  lineCount: number,
  rfqId?: string,
): OrderRecord {
  return {
    id: requestId,
    title: "Active restock — multi-branch",
    branchId: "maadi",
    neededBy: "Friday",
    createdAt: new Date().toISOString(),
    stage,
    lineItemCount: lineCount,
    primarySupplierId: "cairo-dairy",
    fallbackSupplierId: "bean-barrel",
    rfqId,
  };
}

export default function OrdersPage() {
  const { agentSession, requestStatus, inventory, branchFilter } = useAppState();

  const lowStockCount =
    (branchFilter === "all"
      ? inventory
      : inventory.filter((r) => r.branchId === branchFilter)
    ).filter((r) => r.qty < r.parLevel).length;

  const activeStage = sessionToOrderStage(requestStatus, agentSession);
  const activeId = agentSession.requestId || ACTIVE_ORDER_ID;

  const orders = useMemo(() => {
    const active = buildActiveOrder(
      activeId,
      activeStage,
      agentSession.lineItems.length || 3,
      agentSession.rfqId,
    );
    const withoutDup = DEMO_ORDERS.filter((o) => o.id !== active.id);
    return [active, ...withoutDup];
  }, [activeId, activeStage, agentSession.lineItems.length, agentSession.rfqId]);

  return (
    <div className="mx-auto max-w-5xl min-w-0 space-y-8 overflow-x-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">
            Orders
          </h1>
          <p className="mt-1 text-cocoa">
            Cairo branches on one desk — intake, RFQ, landed cost in EGP, approve
          </p>
        </div>
        <Link
          href="/app/orders/new"
          className={buttonVariants()}
        >
          <PackagePlus className="mr-2 size-4" />
          New order
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-stripe-border bg-linen card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cocoa">
              Open pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-semibold text-espresso">
              {orders.filter((o) => o.stage !== "approved").length}
            </p>
            <p className="text-xs text-cocoa">Including active desk order</p>
          </CardContent>
        </Card>
        <Card className="border-stripe-border bg-linen card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cocoa">
              Below par SKUs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-semibold text-terracotta">
              {lowStockCount}
            </p>
            <p className="text-xs text-cocoa">Filtered by branch switcher</p>
          </CardContent>
        </Card>
        <Card className="border-stripe-border bg-linen card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cocoa">
              Active order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm font-medium text-espresso">
              {activeId}
            </p>
            <OrderStatusPill stage={activeStage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/app/orders/${order.id}`}
            className="block rounded-xl border border-stripe-border bg-linen p-4 transition-shadow duration-200 hover:card-shadow"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-cocoa">{order.id}</p>
                <p className="font-display text-lg font-semibold text-espresso">
                  {order.title}
                </p>
                <p className="mt-1 text-sm text-cocoa">
                  {branchName(order.branchId)} · Need by {order.neededBy} ·{" "}
                  {order.lineItemCount} line
                  {order.lineItemCount === 1 ? "" : "s"}
                </p>
                {order.primarySupplierId && (
                  <p className="mt-1 text-xs text-cocoa">
                    Primary {supplierName(order.primarySupplierId)}
                    {order.fallbackSupplierId &&
                      ` · Reserve ${supplierName(order.fallbackSupplierId)}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusPill stage={order.stage} />
                <ArrowRight className="size-4 text-cocoa" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
