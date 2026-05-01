"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Restaurant Owner, Mumbai",
    quote: "AnnSetu made it incredibly easy for us to donate surplus food from our restaurant every evening. Instead of throwing away perfectly good meals, we now feed 50+ people daily through local NGOs.",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Rajesh Mehta",
    role: "Hope Foundation NGO",
    quote: "The smart matching system connects us with the right donors instantly. We've reduced our food sourcing time by 70% and can now serve 3x more beneficiaries in our community kitchens.",
    rating: 5,
    avatar: "RM",
  },
  {
    name: "Ananya Gupta",
    role: "Volunteer Rider, Bangalore",
    quote: "As a college student, volunteering with AnnSetu fits my schedule perfectly. The app works just like Swiggy — I pick up food from donors and deliver it to NGOs. It feels amazing to make a difference!",
    rating: 5,
    avatar: "AG",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Stories from Our Community
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Hear from donors, NGOs, and volunteers who are making a real difference every day.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <Card key={i} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <Quote className="h-8 w-8 text-primary/30" />
                <p className="text-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
