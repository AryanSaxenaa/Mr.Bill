"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  readTourStatus,
  waitForPathname,
  writeTourStatus,
  type TourStatus,
} from "@/lib/tour";
import { buildMrBillTour } from "@/components/tour/build-tour";

interface TourContextValue {
  status: TourStatus;
  tourActive: boolean;
  startTour: (options?: { replay?: boolean }) => Promise<void>;
  skipTour: () => void;
}

const TourContext = createContext<TourContextValue>({
  status: "pending",
  tourActive: false,
  startTour: async () => {},
  skipTour: () => {},
});

export function useTour(): TourContextValue {
  return useContext(TourContext);
}

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const [status, setStatus] = useState<TourStatus>("pending");
  const [tourActive, setTourActive] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  const tourRef = useRef<ReturnType<typeof buildMrBillTour> | null>(null);
  const replacingRef = useRef(false);
  const autoStartedRef = useRef(false);

  const skipPathAdvanceRef = useRef(false);

  const navigate = useCallback(
    async (path: string) => {
      skipPathAdvanceRef.current = true;
      if (pathnameRef.current === path) return;
      router.push(path);
      await waitForPathname(() => pathnameRef.current, path);
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 80);
      });
    },
    [router],
  );

  const teardown = useCallback(() => {
    const existing = tourRef.current;
    if (!existing) return;
    try {
      if (existing.isActive()) {
        replacingRef.current = true;
        existing.cancel();
        replacingRef.current = false;
      }
    } catch {
      replacingRef.current = false;
    }
    tourRef.current = null;
    setTourActive(false);
  }, []);

  const skipTour = useCallback(() => {
    writeTourStatus("skipped");
    setStatus("skipped");
    setBannerOpen(false);
    teardown();
  }, [teardown]);

  const startTour = useCallback(
    async (options?: { replay?: boolean }) => {
      void options;
      setBannerOpen(false);
      try {
        const Shepherd = (await import("shepherd.js")).default;
        teardown();
        const tour = buildMrBillTour(Shepherd, navigate);
        tour.on("complete", () => {
          writeTourStatus("complete");
          setStatus("complete");
          setTourActive(false);
          tourRef.current = null;
        });
        tour.on("cancel", () => {
          if (replacingRef.current) return;
          writeTourStatus("skipped");
          setStatus("skipped");
          setTourActive(false);
          tourRef.current = null;
        });
        tourRef.current = tour;
        await navigate("/");
        setTourActive(true);
        await tour.start();
      } catch (error) {
        console.warn("Mr.Bill tour could not load.", error);
        setTourActive(false);
        tourRef.current = null;
      }
    },
    [navigate, teardown],
  );

  useEffect(() => {
    const stored = readTourStatus();
    setStatus(stored);
    setBannerOpen(stored === "pending");
  }, []);

  useEffect(() => {
    if (status !== "pending" || autoStartedRef.current) return;
    const timer = window.setTimeout(() => {
      if (autoStartedRef.current) return;
      if (readTourStatus() !== "pending") return;
      autoStartedRef.current = true;
      void startTour({ replay: false });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [startTour, status]);

  useEffect(() => {
    if (!tourActive) return;
    if (skipPathAdvanceRef.current) {
      skipPathAdvanceRef.current = false;
      return;
    }
    const tour = tourRef.current;
    const stepId = tour?.getCurrentStep()?.id;
    if (stepId === "landing" && pathname.startsWith("/app")) {
      void tour?.next();
    }
  }, [pathname, tourActive]);

  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

  const value = useMemo(
    () => ({ status, tourActive, startTour, skipTour }),
    [status, tourActive, startTour, skipTour],
  );

  const showBanner =
    bannerOpen && status === "pending" && !tourActive && pathname === "/";

  return (
    <TourContext.Provider value={value}>
      {children}
      {showBanner ? (
        <div
          className="fixed inset-x-0 top-14 z-40 border-b border-stripe-border bg-navy text-white"
          role="region"
          aria-label="Guided tour"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <p className="text-sm">
              First visit? Follow the order desk path before you explore.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-indigo-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-accent/90"
                onClick={() => {
                  autoStartedRef.current = true;
                  void startTour({ replay: false });
                }}
              >
                Take a tour
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/30 px-3 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
                onClick={() => {
                  autoStartedRef.current = true;
                  skipTour();
                }}
              >
                Skip tour
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </TourContext.Provider>
  );
}
