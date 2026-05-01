import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { ImpactDashboard } from "@/components/landing/impact-dashboard";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { Testimonials } from "@/components/landing/testimonials";
import { VolunteerCTA } from "@/components/landing/volunteer-cta";
import { DonateCTA } from "@/components/landing/donate-cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ImpactDashboard />
        <HowItWorks />
        <FeaturesGrid />
        <Testimonials />
        <VolunteerCTA />
        <DonateCTA />
      </main>
      <Footer />
    </div>
  );
}
