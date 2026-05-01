"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bike, Clock, MapPin, Award } from "lucide-react";

const benefits = [
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Flexible Hours",
    description: "Choose when you want to deliver",
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Local Impact",
    description: "Help your community directly",
  },
  {
    icon: <Award className="h-5 w-5" />,
    title: "Recognition",
    description: "Earn badges and certificates",
  },
];

export function VolunteerCTA() {
  return (
    <section id="volunteer" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl rounded-2xl bg-primary p-8 md:p-12 lg:p-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-sm text-primary-foreground">
                <Bike className="h-4 w-4" />
                <span>Join Our Rider Network</span>
              </div>
              
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl text-balance">
                Become a Volunteer Rider
              </h2>
              
              <p className="mt-4 text-lg text-primary-foreground/80 text-pretty">
                Be the bridge that connects surplus food with hungry families. 
                Join our community of volunteer riders making a real difference every day.
              </p>

              <Button
                size="lg"
                variant="secondary"
                asChild
                className="mt-8"
              >
                <Link href="/signup?role=volunteer">
                  Sign Up as Volunteer
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-xl bg-primary-foreground/10 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/20 text-primary-foreground">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-primary-foreground/70">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
