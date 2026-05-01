"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Search, Truck, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <Upload className="h-8 w-8" />,
    title: "Donor Lists Food",
    description: "Restaurants and vendors upload surplus food with details like type, quantity, and expiry time.",
  },
  {
    icon: <Search className="h-8 w-8" />,
    title: "Smart Matching",
    description: "Our algorithm matches donations with NGO requests based on urgency, proximity, and food type.",
  },
  {
    icon: <Truck className="h-8 w-8" />,
    title: "Volunteer Delivers",
    description: "Nearby volunteer riders accept delivery tasks and pick up food from donors.",
  },
  {
    icon: <CheckCircle className="h-8 w-8" />,
    title: "Impact Created",
    description: "Food reaches those in need, reducing waste and feeding communities.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            How <span className="brand-name">AnnSetu</span> Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A simple, efficient process to connect surplus food with those who need it most.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-border bg-card">
              <CardHeader>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {step.icon}
                </div>
                <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {index + 1}
                </div>
                <CardTitle className="text-foreground">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
