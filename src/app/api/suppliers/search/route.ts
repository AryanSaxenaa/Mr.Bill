import { NextResponse } from "next/server";
import { buildSupplierSearchQuery, searchSuppliers } from "@/lib/serpapi";
import type { LineItem } from "@/lib/mock-data";

interface SearchBody {
  query?: string;
  location?: string;
  category?: string;
  lineItems?: LineItem[];
}

function parseLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const o = item as Record<string, unknown>;
      if (
        typeof o.sku !== "string" ||
        typeof o.name !== "string" ||
        typeof o.qty !== "number" ||
        typeof o.unit !== "string" ||
        typeof o.branchId !== "string"
      ) {
        return null;
      }
      return {
        sku: o.sku,
        name: o.name,
        qty: o.qty,
        unit: o.unit,
        branchId: o.branchId as LineItem["branchId"],
      };
    })
    .filter((x): x is LineItem => x !== null);
}

export async function POST(req: Request) {
  let body: SearchBody;
  try {
    body = (await req.json()) as SearchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const lineItems = parseLineItems(body.lineItems);
  const location = body.location?.trim() || "Cairo, Egypt";
  const query =
    body.query?.trim() ||
    buildSupplierSearchQuery(lineItems, body.category, location);

  const result = await searchSuppliers({
    query,
    location,
    category: body.category,
    lineItems,
  });

  return NextResponse.json(result, { status: 200 });
}
