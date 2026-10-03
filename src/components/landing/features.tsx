import {
  Mail,
  Scale,
  Search,
  ClipboardList,
  Package,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const VALUE_PROPS: {
  title: string;
  body: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Discover suppliers",
    body:
      "Find wholesalers near each Cairo branch and merge them with your catalog before the RFQ goes out.",
    icon: Search,
  },
  {
    title: "RFQ by email",
    body:
      "Send structured line items and need-by dates; supplier replies attach to the same order on your desk.",
    icon: Mail,
  },
  {
    title: "Compare & approve",
    body:
      "Landed cost matrix in EGP with delivery days, split recommendations, and inventory sync after sign-off.",
    icon: Scale,
  },
];

const MORE_FEATURES: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Ask Mr.Bill",
    body:
      "Turn messy restock notes into line items and draft RFQs — demo mode or live assistant when you are ready.",
    icon: Sparkles,
  },
  {
    title: "Branch inventory",
    body:
      "Approved splits update per-branch stock with an audit trail your GM can replay before month-end.",
    icon: Package,
  },
  {
    title: "One order ID",
    body:
      "From intake through quote compare to approval — every step stays on the same procurement record.",
    icon: ClipboardList,
  },
];

function FeatureCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-2xl border border-stripe-border bg-surface p-6 card-shadow">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-indigo-accent/10 text-indigo-accent">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="mb-2 font-display text-lg font-semibold text-navy">{title}</h3>
      <p className="text-[15px] leading-relaxed text-cocoa">{body}</p>
    </article>
  );
}

export function LandingFeatures() {
  return (
    <section
      id="product"
      className="scroll-mt-20 border-t border-stripe-border bg-linen"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
            <h2 className="font-display text-3xl font-semibold text-navy md:text-4xl">
              Everything your GM needs on one desk
            </h2>
            <p className="mt-4 text-lg text-cocoa">
              AI order desk, live supplier search, and quote inbox — tuned for
              Cairo multi-branch cafés, not another generic chatbot shell.
            </p>
          </div>

          <div className="mb-12 grid gap-4 md:grid-cols-3 md:gap-5">
            {VALUE_PROPS.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
            {MORE_FEATURES.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
