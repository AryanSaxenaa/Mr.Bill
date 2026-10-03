import type { StepOptionsButton } from "shepherd.js";
import type Shepherd from "shepherd.js";
import {
  clickTourTarget,
  isCompactTourViewport,
  orderDetailPath,
} from "@/lib/tour";

type ShepherdApi = typeof Shepherd;
type TourInstance = InstanceType<ShepherdApi["Tour"]>;

export type TourNavigate = (path: string) => Promise<void>;

interface StepDef {
  id: string;
  route: string | (() => string);
  attach: string;
  extraHighlights?: string[];
  title: string;
  text: string;
  on?: "top" | "bottom" | "left" | "right" | "bottom-start" | "top-start";
  prepare?: () => void;
}

function resolveRoute(route: string | (() => string)): string {
  return typeof route === "function" ? route() : route;
}

function isVisible(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

function firstElement(selectors: string): HTMLElement | string | null {
  const list = selectors
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const matches: HTMLElement[] = [];
  for (const selector of list) {
    document.querySelectorAll(selector).forEach((node) => {
      if (node instanceof HTMLElement) matches.push(node);
    });
  }
  return matches.find(isVisible) ?? matches[0] ?? list[0] ?? null;
}

function desktopSteps(): StepDef[] {
  return [
    {
      id: "landing",
      route: "/",
      attach: '[data-tour="open-desk"]',
      title: "Welcome to Mr.Bill",
      text: "Follow this path first. Mr.Bill is the order desk for Maison Layla's Cairo branches: restock, RFQ, compare EGP, then approve.",
      on: "bottom",
    },
    {
      id: "orders-desk",
      route: "/app/orders",
      attach: '[data-tour="orders-desk"]',
      extraHighlights: ['[data-tour="nav-orders"]', '[data-tour="new-order"]'],
      title: "This is the desk",
      text: "Orders is the operational desk, not a chatbot. Every restock from intake to approval lives here.",
      on: "bottom",
    },
    {
      id: "new-order",
      route: "/app/orders/new",
      attach: '[data-tour="run-demo"]',
      extraHighlights: [
        '[data-tour="ask-mrbill"]',
        '[data-tour="nav-new-order"]',
      ],
      title: "Start a Friday restock",
      text: "Run demo script fills a Maison Layla note into the line table for Maadi and Zamalek. Or type in Ask Mr.Bill and parse it yourself.",
      on: "left",
    },
    {
      id: "lines-suppliers",
      route: "/app/orders/new",
      attach: '[data-tour="line-items"]',
      extraHighlights: [
        '[data-tour="suppliers"]',
        '[data-tour="discover-vendors"]',
      ],
      title: "Lines and catalog suppliers",
      text: "Review SKUs, quantities, and branches. Catalog suppliers sit below. Find suppliers if you want a wider set, then tick who should receive the RFQ.",
      on: "top",
      prepare: () => {
        const hasLine = document.querySelector(
          '[data-tour="line-items"] input',
        );
        if (!hasLine) {
          clickTourTarget('[data-tour="run-demo"]');
        }
      },
    },
    {
      id: "send-rfq",
      route: "/app/orders/new",
      attach: '[data-tour="send-rfq"]',
      extraHighlights: ['[data-tour="discover-vendors"]'],
      title: "Send RFQs",
      text: "Send RFQs when the lines look right. Selected suppliers get the request, and the thread stays on this order.",
      on: "top",
    },
    {
      id: "quote-desk",
      route: "/app/quotes",
      attach: '[data-tour="quotes-table"], [data-tour="quote-desk"]',
      extraHighlights: ['[data-tour="nav-quotes"]'],
      title: "Compare in EGP",
      text: "Quote desk is where landed cost shows up. Compare Cairo Dairy and Bean & Barrel side by side before you pick a split.",
      on: "bottom",
    },
    {
      id: "approve",
      route: orderDetailPath,
      attach:
        '[data-tour="approve"], [data-tour="sent-mail"], [data-tour="order-detail"]',
      extraHighlights: ['[data-tour="sent-mail"]'],
      title: "Approve the order",
      text: "On the order, Approve updates inventory for Maadi, Zamalek, and New Cairo. Outbound RFQs appear here after you send them.",
      on: "top",
    },
    {
      id: "inventory",
      route: "/app/inventory",
      attach: '[data-tour="inventory"]',
      extraHighlights: [
        '[data-tour="audit"]',
        '[data-tour="nav-inventory"]',
        '[data-tour="reset-demo"]',
      ],
      title: "Stock and audit",
      text: "Inventory shows on-hand vs par, plus the audit trail after approval. You can explore freely now. Use Reset demo data if you want a clean Friday restock.",
      on: "bottom",
    },
  ];
}

function mobileSteps(): StepDef[] {
  return [
    {
      id: "landing",
      route: "/",
      attach: '[data-tour="open-desk"]',
      title: "Welcome to Mr.Bill",
      text: "Follow this short path first. Mr.Bill is the order desk for Maison Layla's Cairo branches.",
      on: "bottom",
    },
    {
      id: "orders-desk",
      route: "/app/orders",
      attach: '[data-tour="orders-desk"]',
      extraHighlights: ['[data-tour="new-order"]'],
      title: "This is the desk",
      text: "Orders is the desk, not a chatbot. Open New order when you are ready to restock.",
      on: "bottom",
    },
    {
      id: "new-order",
      route: "/app/orders/new",
      attach: '[data-tour="ask-mrbill"], [data-tour="run-demo"]',
      extraHighlights: ['[data-tour="send-rfq"]', '[data-tour="line-items"]'],
      title: "Run the restock",
      text: "Run demo script, review lines for Maadi and Zamalek, then Send RFQs. Find suppliers if you need more than the catalog.",
      on: "top",
      prepare: () => {
        const hasLine = document.querySelector(
          '[data-tour="line-items"] input',
        );
        if (!hasLine) {
          clickTourTarget('[data-tour="run-demo"]');
        }
      },
    },
    {
      id: "inventory",
      route: "/app/inventory",
      attach: '[data-tour="inventory"]',
      extraHighlights: ['[data-tour="audit"]'],
      title: "Then explore",
      text: "Quote desk compares landed cost in EGP. Approve on the order, then check stock and the audit log here. You can explore freely now. Reset demo data if you need a clean Friday restock.",
      on: "bottom",
    },
  ];
}

function stepButtons(
  tour: TourInstance,
  steps: StepDef[],
  index: number,
  navigate: TourNavigate,
): StepOptionsButton[] {
  const first = index === 0;
  const last = index === steps.length - 1;

  const skip: StepOptionsButton = {
    text: "Skip tour",
    secondary: true,
    classes: "mrbill-tour-skip",
    label: "Skip tour",
    action() {
      tour.cancel();
    },
  };

  const back: StepOptionsButton = {
    text: "Back",
    secondary: true,
    label: "Back",
    action() {
      const prev = steps[index - 1];
      if (!prev) {
        tour.back();
        return;
      }
      void (async () => {
        await navigate(resolveRoute(prev.route));
        prev.prepare?.();
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 150);
        });
        tour.back();
      })();
    },
  };

  const next: StepOptionsButton = {
    text: last ? "Finish" : "Next",
    label: last ? "Finish tour" : "Next step",
    action() {
      if (last) {
        tour.complete();
        return;
      }
      const upcoming = steps[index + 1];
      if (!upcoming) {
        tour.next();
        return;
      }
      void (async () => {
        await navigate(resolveRoute(upcoming.route));
        upcoming.prepare?.();
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 150);
        });
        tour.next();
      })();
    },
  };

  return first ? [skip, next] : [skip, back, next];
}

export function buildMrBillTour(
  Shepherd: ShepherdApi,
  navigate: TourNavigate,
): TourInstance {
  const compact = isCompactTourViewport();
  const steps = compact ? mobileSteps() : desktopSteps();
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tour = new Shepherd.Tour({
    id: "mrbill-desk-v1",
    tourName: "mrbill",
    useModalOverlay: true,
    exitOnEsc: true,
    keyboardNavigation: true,
    defaultStepOptions: {
      classes: "mrbill-tour",
      scrollTo: reduceMotion
        ? false
        : { behavior: "smooth", block: "center" },
      cancelIcon: { enabled: true, label: "Skip tour" },
      canClickTarget: true,
      modalOverlayOpeningPadding: 8,
      modalOverlayOpeningRadius: 8,
      waitForElement: 5000,
      skipMissingElement: false,
      arrow: true,
    },
  });

  steps.forEach((step, index) => {
    tour.addStep({
      id: step.id,
      title: step.title,
      text: step.text,
      attachTo: {
        element: () => firstElement(step.attach),
        on: step.on ?? "bottom",
      },
      extraHighlights: step.extraHighlights,
      buttons: stepButtons(tour, steps, index, navigate),
      when: {
        show() {
          step.prepare?.();
        },
      },
    });
  });

  return tour;
}
