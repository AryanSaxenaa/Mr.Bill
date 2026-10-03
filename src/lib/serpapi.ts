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
  source: "serpapi" | "catalog";
  message?: string;
  query: string;
}

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";
const MAX_WEB_RESULTS = 8;

const DIRECTORY_JUNK =
  /kompass|search companies|company directory|yellow.?pages|europages|industrystock|zoominfo|dnb\.com|thomasnet|alibaba|made-in-china|tradeindia|indiamart|21food|exporters on|from egypt suppliers|amazon\.|wikipedia|facebook\.com|instagram\.com|globalspec|youtube\.com|tiktok\.com|pinterest\.|reddit\.com/i;

function isDirectoryJunk(row: {
  name: string;
  url: string;
  snippet: string;
}): boolean {
  return DIRECTORY_JUNK.test(`${row.name} ${row.url} ${row.snippet}`);
}

function isGoogleListingUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("google.")) return false;
    return !parsed.pathname.includes("/maps");
  } catch {
    return /google\.[^/]+\/search/i.test(url);
  }
}

function isUsableWebHit(row: {
  name: string;
  url: string;
  snippet: string;
  phone?: string;
}): boolean {
  if (isDirectoryJunk(row)) return false;
  const url = row.url.trim();
  if (isGoogleListingUrl(url) && !row.phone) return false;
  if (isGoogleListingUrl(url) && row.phone) {
    return true;
  }
  return Boolean(url || row.phone);
}

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
          .join(" ")
      : "dairy coffee disposables";
  const categoryBit = category?.trim() ? `${category.trim()} ` : "";
  return `Cairo Egypt cafe restaurant F&B wholesale distributor ${categoryBit}${itemPhrase}`
    .replace(/\s+/g, " ")
    .trim();
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
    source: "catalog",
    message:
      "Live search key is not set. Showing Maison Layla catalog suppliers for demo RFQ selection.",
    results: SUPPLIERS.map((s) => ({
      id: s.id,
      name: s.name,
      url: `https://${s.contact.split("@")[1] ?? "example.com"}`,
      snippet: `${s.name} - local Cairo F&B supplier (${s.contact}).`,
      source: "mock" as const,
      phone: undefined,
    })).slice(0, 3),
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
    if (!row.name || out.length >= MAX_WEB_RESULTS) return;
    if (!isUsableWebHit(row)) return;
    const key = `${row.name}|${row.url}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      id: slugId(row.name, out.length),
      name: row.name,
      url:
        row.url ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${row.name} Cairo`,
        )}`,
      snippet: row.snippet,
      phone: row.phone,
      source: "serpapi",
    });
  };

  const local = data.local_results as { places?: SerpLocalPlace[] } | undefined;
  if (local?.places && Array.isArray(local.places)) {
    for (const place of local.places) {
      if (!place.title) continue;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${place.title} Cairo`,
      )}`;
      push({
        name: place.title,
        url:
          place.link && !isGoogleListingUrl(place.link) ? place.link : mapsUrl,
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

function mergeCatalogAndLive(
  catalog: DiscoveredSupplier[],
  live: DiscoveredSupplier[],
): DiscoveredSupplier[] {
  const seen = new Set(catalog.map((row) => row.name.toLowerCase()));
  const web: DiscoveredSupplier[] = [];
  for (const row of live) {
    const key = row.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    web.push(row);
  }
  return [...catalog, ...web];
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
    num: String(MAX_WEB_RESULTS),
    hl: "en",
    gl: "eg",
    google_domain: "google.com.eg",
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
        source: "catalog",
        message: `Live search request failed (HTTP ${response.status}). Using catalog suppliers.`,
      };
    }

    const data = (await response.json()) as Record<string, unknown>;
    const live = parseSerpPayload(data, query).filter((row) =>
      isUsableWebHit(row),
    );
    const catalog = mockCatalogResults(query).results;
    const results = mergeCatalogAndLive(catalog, live);

    if (live.length === 0) {
      return {
        query,
        poweredBySerpApi: true,
        source: "serpapi",
        message:
          "Live search had no usable Cairo wholesalers after filtering directory pages. Catalog suppliers remain selectable.",
        results,
      };
    }

    return {
      query,
      poweredBySerpApi: true,
      source: "serpapi",
      results,
    };
  } catch (err) {
    console.error(
      "SerpAPI fetch failed:",
      err instanceof Error ? err.message : "unknown",
    );
    return {
      ...mockCatalogResults(query),
      source: "catalog",
      message: "Live search unreachable. Using catalog suppliers.",
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
