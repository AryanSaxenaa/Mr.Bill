export const TOUR_STORAGE_KEY = "mrbill-tour-v1";

export type TourStatus = "pending" | "complete" | "skipped";

export function readTourStatus(): TourStatus {
  if (typeof window === "undefined") return "pending";
  try {
    const value = window.localStorage.getItem(TOUR_STORAGE_KEY);
    if (value === "complete" || value === "skipped") return value;
  } catch {
    return "pending";
  }
  return "pending";
}

export function writeTourStatus(status: TourStatus): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, status);
  } catch {
    // Private mode or blocked storage should not break the desk.
  }
}

export function isCompactTourViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function waitForPathname(
  getPathname: () => string,
  path: string,
  timeoutMs = 8000,
): Promise<void> {
  return new Promise((resolve) => {
    if (getPathname() === path) {
      resolve();
      return;
    }
    const started = Date.now();
    const tick = () => {
      if (getPathname() === path || Date.now() - started > timeoutMs) {
        resolve();
        return;
      }
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });
}

export function clickTourTarget(selector: string): void {
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) {
    el.click();
  }
}

export function orderDetailPath(): string {
  const current = window.location.pathname;
  const match = /^\/app\/orders\/([^/]+)$/.exec(current);
  if (match && match[1] && match[1] !== "new") {
    return current;
  }
  try {
    const raw = window.localStorage.getItem("mrbill-session-v1");
    if (raw) {
      const parsed = JSON.parse(raw) as { requestId?: string };
      if (parsed.requestId) {
        return `/app/orders/${parsed.requestId}`;
      }
    }
  } catch {
    // Fall through to the demo order id.
  }
  return "/app/orders/ORD-2026-0142";
}
