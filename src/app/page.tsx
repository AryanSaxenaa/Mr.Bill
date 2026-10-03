import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingStats } from "@/components/landing/stats";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingFeatures } from "@/components/landing/features";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-surface font-sans">
      <LandingNavbar />
      <main className="grow">
        <LandingHero />
        <LandingStats />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
