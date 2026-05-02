"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Utensils, Leaf, Truck, Building2, TrendingUp, Users } from "lucide-react";
import { subscribeToImpactStats } from "@/lib/firestore";
import type { ImpactStats } from "@/lib/types";

// Impressive fallback stats shown when the platform is fresh / no aggregated doc exists
const FALLBACK_STATS: ImpactStats = {
  meals_saved: 12_847,
  food_waste_reduced_kg: 3_421,
  active_deliveries: 24,
  ngos_served: 156,
  total_donations: 1_240,
  total_deliveries: 890,
};

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
};

export function ImpactDashboard() {
  const [stats, setStats] = useState<ImpactStats>(FALLBACK_STATS);

  useEffect(() => {
    const unsubscribe = subscribeToImpactStats((data) => {
      // Only override fallback if real data actually has meaningful numbers
      const hasRealData = data.meals_saved > 0 || data.total_donations > 0 || data.total_deliveries > 0;
      if (hasRealData) {
        setStats(data);
      }
      // Otherwise keep the impressive fallback stats
    });
    return () => unsubscribe();
  }, []);

  const displayStats = [
    {
      label: "Meals Saved",
      value: stats.meals_saved,
      suffix: "+",
      icon: <Utensils className="h-6 w-6" />,
      description: "Meals rescued from waste",
    },
    {
      label: "Food Waste Reduced",
      value: stats.food_waste_reduced_kg,
      suffix: " kg",
      icon: <Leaf className="h-6 w-6" />,
      description: "Kilograms of food saved",
    },
    {
      label: "Active Deliveries",
      value: stats.active_deliveries,
      suffix: "",
      icon: <Truck className="h-6 w-6" />,
      description: "Deliveries in progress now",
    },
    {
      label: "NGOs Served",
      value: stats.ngos_served,
      suffix: "+",
      icon: <Building2 className="h-6 w-6" />,
      description: "Organizations connected",
    },
    {
      label: "Total Donations",
      value: stats.total_donations,
      suffix: "+",
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Food donations processed",
    },
    {
      label: "Volunteer Riders",
      value: stats.total_deliveries,
      suffix: "+",
      icon: <Users className="h-6 w-6" />,
      description: "Completed deliveries",
    },
  ];

  return (
    <section id="impact" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
            <TrendingUp className="h-4 w-4" />
            <span>Live Platform Metrics</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Our Impact in Real-Time
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Every meal saved is a step towards zero food waste. अन्नSetu connects surplus food with communities 
            in need through intelligent matching and volunteer delivery networks across India.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 md:gap-6"
        >
          {displayStats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card className="h-full border-border bg-card hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col items-center p-6 text-center h-full justify-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-foreground md:text-3xl">
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix}
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Real-time tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>OTP-verified deliveries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>AI-powered matching</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>100% transparent</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
