"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Bike, Clock, MapPin, Award } from "lucide-react";
import { motion } from "framer-motion";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export function VolunteerCTA() {
  return (
    <section id="volunteer" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl rounded-3xl bg-primary p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-2xl"
        >
          {/* Decorative background circle */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-sm text-primary-foreground">
                <Bike className="h-4 w-4" />
                <span>Join Our Rider Network</span>
              </div>
              
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl text-balance">
                Become a Volunteer Rider
              </h2>
              
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 text-pretty max-w-md">
                Be the bridge that connects surplus food with hungry families. 
                Join our community of volunteer riders making a real difference every day.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/signup?role=volunteer">
                    Sign Up as Volunteer
                  </Link>
                </Button>
                <div className="flex -space-x-3 items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-muted overflow-hidden">
                      <Image 
                        src={`https://i.pravatar.cc/150?u=${i + 10}`} 
                        alt="Volunteer" 
                        width={40} 
                        height={40} 
                      />
                    </div>
                  ))}
                  <div className="pl-5 text-sm font-medium text-primary-foreground">
                    +500 riders active
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-4"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground text-primary shadow-lg">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-primary-foreground/70 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
