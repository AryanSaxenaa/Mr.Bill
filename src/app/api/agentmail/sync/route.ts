import { NextResponse } from "next/server";
import { DEFAULT_SESSION, type AgentSession } from "@/lib/agent-session";
import { syncSupplierReplies } from "@/lib/agentmail-sync";

interface SyncBody {
  session?: AgentSession;
  inventory?: { branchId: string; sku: string; qty: number }[];
}

export async function POST(req: Request) {
  let body: SyncBody;
  try {
    body = (await req.json()) as SyncBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const session = body.session ?? { ...DEFAULT_SESSION };
  const inventory = body.inventory ?? [];

  try {
    const result = await syncSupplierReplies(session, inventory);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
