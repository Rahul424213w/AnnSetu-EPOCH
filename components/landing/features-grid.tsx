"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Shield,
  Zap,
  MapPin,
  Bell,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI-Powered Matching",
    description:
      "Our intelligent algorithm scores donations against NGO requests using urgency, proximity, food type, and expiry time to find the optimal match.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "OTP-Verified Handoffs",
    description:
      "Every pickup and delivery is secured with a unique 6-digit OTP, ensuring food reaches the right hands with full accountability.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Real-Time Tracking",
    description:
      "Track your donation from kitchen to community — see live status updates as volunteers pick up and deliver food across the city.",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Route Navigation",
    description:
      "Volunteers get turn-by-turn Google Maps navigation to pickup and delivery locations, just like popular food delivery apps.",
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Instant Notifications",
    description:
      "Get notified the moment your donation is matched, picked up, and delivered. NGOs receive alerts for new available food.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Impact Analytics",
    description:
      "Dashboard with real-time metrics — meals saved, food waste reduced, distance covered, and communities served.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Built for Impact
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Every feature is designed to make food redistribution faster, safer, and more transparent.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <Card key={i} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
