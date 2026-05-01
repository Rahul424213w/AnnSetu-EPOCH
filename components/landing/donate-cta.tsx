"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Truck, Heart } from "lucide-react";

const donationOptions = [
  {
    icon: <Utensils className="h-6 w-6" />,
    title: "Sponsor Meals",
    description: "Fund meals directly for communities in need",
    action: "Sponsor Now",
    href: "/donate?type=meals",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Fund Delivery",
    description: "Cover transportation costs for food deliveries",
    action: "Fund Delivery",
    href: "/donate?type=delivery",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "General Donation",
    description: "Support our mission to eliminate food waste",
    action: "Donate",
    href: "/donate?type=general",
  },
];

export function DonateCTA() {
  return (
    <section id="donate" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Support Our Mission
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Your contribution helps us connect more surplus food with communities in need. 
            Every donation makes a difference.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {donationOptions.map((option, index) => (
            <Card key={index} className="border-border bg-card text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {option.icon}
                </div>
                <CardTitle className="text-foreground">{option.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={option.href}>{option.action}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Are you a restaurant or vendor with surplus food?
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link href="/signup?role=donor">Register as Food Donor</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
