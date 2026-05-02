"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Restaurant Owner, Mumbai",
    quote: "अन्नSetu made it incredibly easy for us to donate surplus food from our restaurant every evening. Instead of throwing away perfectly good meals, we now feed 50+ people daily through local NGOs.",
    rating: 5,
    avatar: "PS",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    name: "Rajesh Mehta",
    role: "Hope Foundation NGO",
    quote: "The smart matching system connects us with the right donors instantly. We've reduced our food sourcing time by 70% and can now serve 3x more beneficiaries in our community kitchens.",
    rating: 5,
    avatar: "RM",
    color: "bg-green-500/10 text-green-500",
  },
  {
    name: "Ananya Gupta",
    role: "Volunteer Rider, Bangalore",
    quote: "As a college student, volunteering with अन्नSetu fits my schedule perfectly. The app works just like Swiggy — I pick up food from donors and deliver it to NGOs. It feels amazing to make a difference!",
    rating: 5,
    avatar: "AG",
    color: "bg-orange-500/10 text-orange-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
} satisfies Variants;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    } 
  },
} satisfies Variants;

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
            Stories from Our Community
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Hear from donors, NGOs, and volunteers who are making a real difference every day.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto"
        >
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="h-full border-border bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
                <CardContent className="p-8 space-y-6 flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <Quote className="h-10 w-10 text-primary/20 group-hover:text-primary/40 transition-colors" />
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-foreground text-lg leading-relaxed italic flex-grow">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${t.color} text-base font-bold shadow-inner`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
