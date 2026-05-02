"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  } satisfies Variants;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
  } satisfies Variants;

  return (
    <section className="relative overflow-hidden pt-6 pb-12 md:pt-10 md:pb-16 lg:pt-12 lg:pb-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_120%,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto text-center lg:text-left"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Heart className="h-3.5 w-3.5" />
              <span>Reducing food waste, one meal at a time</span>
            </motion.div>

            <div className="relative inline-block w-full">
              <motion.h1 variants={itemVariants} className="text-6xl font-extrabold tracking-tight text-foreground md:text-7xl lg:text-[5rem] text-balance leading-[1.1] relative z-10">
                Connect Surplus Food with{" "}
                <span className="text-primary relative inline-block">
                  Those Who Need It
                  <svg className="absolute -bottom-1.5 left-0 w-full h-2 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                </span>
              </motion.h1>

              {/* Decorative floating logo positioned as requested */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                  className="absolute right-4 lg:-right-8 top-1/2 md:top-auto md:bottom-4 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 hidden sm:block z-10 pointer-events-none"
                >
                <div className="w-full h-full relative rounded-full overflow-hidden shadow-2xl border-4 border-white bg-[#FCFBF8]">
                  <Image src="/logo.png" alt="AnnSetu Decorative Logo" fill className="object-cover" priority />
                </div>
              </motion.div>
            </div>

            <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground md:text-xl text-pretty lg:mx-0 mx-auto max-w-xl leading-relaxed">
              अन्नSetu is an intelligent food redistribution platform that connects restaurants, vendors,
              and donors with NGOs and communities in need — powered by real-time matching and volunteer delivery.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start justify-center">
              <Button size="lg" asChild className="gap-2 px-6 py-5 text-base rounded-xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                <Link href="/signup?role=donor">
                  Donate Food
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 px-6 py-5 text-base rounded-xl border-2 hover:bg-secondary/50 transition-all">
                <Link href="/signup?role=volunteer">
                  <Users className="h-4 w-4" />
                  Become a Volunteer
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-muted-foreground/80 flex-wrap">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Real-time matching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Verified NGOs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Track deliveries</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="relative mx-auto w-full max-w-[400px] lg:max-w-[460px]"
          >
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square">
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[2.5rem] blur-2xl opacity-50 animate-pulse" />

              <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
                <Image
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800"
                  alt="Volunteers organizing food donations"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-6 left-6 right-6">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="rounded-xl bg-white/10 backdrop-blur-md p-4 shadow-2xl border border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Live Impact</p>
                        <p className="text-2xl font-black text-white">2,450 kg <span className="text-xs font-normal text-white/60">today</span></p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating Badge 1 */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                className="absolute -top-4 -right-4 rounded-xl bg-background p-3 shadow-xl border border-border hidden md:block"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <p className="text-xs font-bold">12 Active Deliveries</p>
                </div>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: [0.45, 0, 0.55, 1], delay: 1 }}
                className="absolute top-1/2 -left-8 rounded-xl bg-background p-3 shadow-xl border border-border hidden xl:block"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold">50+ Nearby NGOs</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
