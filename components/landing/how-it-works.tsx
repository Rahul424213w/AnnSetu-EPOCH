"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
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
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            How <span className="brand-name text-primary">AnnSetu</span> Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A simple, efficient process to connect surplus food with those who need it most.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card className="relative border-border bg-card h-full hover:-translate-y-1 transition-transform duration-300">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                  <CardTitle className="text-foreground">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
