import { SUPPLIERS } from "./mock-data";
import type { LineItem } from "./mock-data";

export interface DiscoveredSupplier {
  name: string;
  url: string;
  snippet: string;
  phone?: string;
  source: "serpapi" | "mock";
  id: string;
}

export interface SupplierSearchResult {
  results: DiscoveredSupplier[];
  poweredBySerpApi: boolean;
  message?: string;
  query: string;
}

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";
const MAX_RESULTS = 8;

export function getSerpApiKey(): string | undefined {
  return process.env.SERPAPI_API_KEY?.trim() || undefined;
}

export function hasSerpApiConfig(): boolean {
  return Boolean(getSerpApiKey());
}

export function buildSupplierSearchQuery(
  lineItems: LineItem[],
  category?: string,
  location = "Cairo, Egypt",
): string {
  const itemPhrase =
    lineItems.length > 0
      ? lineItems
          .slice(0, 3)
          .map((l) => l.name)
          .join(", ")
      : "food and beverage wholesale";
  const categoryBit = category?.trim() ? `${category.trim()} ` : "wholesale ";
  const locBit = location.includes("Cairo") ? "Cairo Egypt" : location;
  return `${categoryBit}supplier ${itemPhrase} ${locBit}`.replace(/\s+/g, " ").trim();
}

function slugId(name: string, index: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
  return `disc-${slug || "supplier"}-${index}`;
}

function mockCatalogResults(query: string): SupplierSearchResult {
  return {
    query,
    poweredBySerpApi: false,
    message:
      "SERPAPI_API_KEY is not set. Showing Maison Layla catalog suppliers for demo RFQ selection.",
    results: SUPPLIERS.map((s) => ({
      id: s.id,
      name: s.name,
      url: `https://${s.contact.split("@")[1] ?? "example.com"}`,
      snippet: `${s.name} — local Cairo F&B supplier (${s.contact}).`,
      source: "mock" as const,
      phone: undefined,
    })).slice(0, MAX_RESULTS),
  };
}

interface SerpOrganicRow {
  title?: string;
  link?: string;
  snippet?: string;
}

interface SerpLocalPlace {
  title?: string;
  link?: string;
  phone?: string;
  snippet?: string;
  address?: string;
}

function parseSerpPayload(
  data: Record<string, unknown>,
  query: string,
): DiscoveredSupplier[] {
  const out: DiscoveredSupplier[] = [];
  const seen = new Set<string>();

  const push = (row: {
    name: string;
    url: string;
    snippet: string;
    phone?: string;
  }) => {
    if (!row.name || out.length >= MAX_RESULTS) return;
    const key = `${row.name}|${row.url}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      id: slugId(row.name, out.length),
      name: row.name,
      url: row.url || "https://google.com/search?q=" + encodeURIComponent(row.name),
      snippet: row.snippet,
      phone: row.phone,
      source: "serpapi",
    });
  };

  const local = data.local_results as { places?: SerpLocalPlace[] } | undefined;
  if (local?.places && Array.isArray(local.places)) {
    for (const place of local.places) {
      if (!place.title) continue;
      push({
        name: place.title,
        url: place.link ?? "",
        snippet:
          [place.snippet, place.address].filter(Boolean).join(" · ") ||
          "Local supplier listing",
        phone: place.phone,
      });
    }
  }

  const organic = data.organic_results as SerpOrganicRow[] | undefined;
  if (organic && Array.isArray(organic)) {
    for (const row of organic) {
      if (!row.title) continue;
      push({
        name: row.title,
        url: row.link ?? "",
        snippet: row.snippet ?? "Web result",
      });
    }
  }

  return out;
}

export async function searchSuppliers(options: {
  query?: string;
  location?: string;
  category?: string;
  lineItems?: LineItem[];
}): Promise<SupplierSearchResult> {
  const location = options.location?.trim() || "Cairo, Egypt";
  const query =
    options.query?.trim() ||
    buildSupplierSearchQuery(options.lineItems ?? [], options.category, location);

  const apiKey = getSerpApiKey();
  if (!apiKey) {
    return mockCatalogResults(query);
  }

  const params = new URLSearchParams({
    engine: "google",
    q: query,
    location,
    api_key: apiKey,
    num: String(MAX_RESULTS),
  });

  try {
    const response = await fetch(`${SERPAPI_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("SerpAPI HTTP error:", response.status, text.slice(0, 200));
      return {
        ...mockCatalogResults(query),
        message: `SerpAPI request failed (HTTP ${response.status}). Using catalog suppliers.`,
      };
    }

    const data = (await response.json()) as Record<string, unknown>;
    const results = parseSerpPayload(data, query);

    if (results.length === 0) {
      return {
        query,
        poweredBySerpApi: true,
        message: "No SerpAPI results for this query; try broader keywords.",
        results: [],
      };
    }

    return {
      query,
      poweredBySerpApi: true,
      results,
    };
  } catch (err) {
    console.error(
      "SerpAPI fetch failed:",
      err instanceof Error ? err.message : "unknown",
    );
    return {
      ...mockCatalogResults(query),
      message: "SerpAPI unreachable. Using catalog suppliers.",
    };
  }
}

export function resolveSupplierDisplayName(
  supplierId: string,
  discovered: DiscoveredSupplier[] = [],
): string {
  const catalog = SUPPLIERS.find((s) => s.id === supplierId);
  if (catalog) return catalog.name;
  const ext = discovered.find((d) => d.id === supplierId);
  return ext?.name ?? supplierId;
}
