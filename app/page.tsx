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
    <div className="min-h-screen flex flex-col relative selection:bg-primary/20">
      {/* Decorative Global Background */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-background/80 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
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
    </div>
  );
}
