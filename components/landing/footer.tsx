"use client";

import Link from "next/link";
import Image from "next/image";
import { Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Footer() {
  const [year, setYear] = useState<number>(2026); // Default to project year

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-border bg-card py-16">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-12 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden bg-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Image src="/logo.png" alt="AnnSetu Logo" width={48} height={48} className="object-cover" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">अन्नSetu</span>
            </Link>
            <p className="text-muted-foreground max-w-sm text-pretty text-lg leading-relaxed">
              Connecting surplus food with those who need it most. 
              Together, we can eliminate food waste and feed communities.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#impact" className="text-muted-foreground hover:text-primary transition-colors">
                  Impact Dashboard
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/signup?role=volunteer" className="text-muted-foreground hover:text-primary transition-colors">
                  Become a Volunteer
                </Link>
              </li>
              <li>
                <Link href="/signup?role=donor" className="text-muted-foreground hover:text-primary transition-colors">
                  Register as Donor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg">For Organizations</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/signup?role=ngo" className="text-muted-foreground hover:text-primary transition-colors">
                  Register as NGO
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  NGO Login
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Partnership
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <p className="text-sm text-muted-foreground">
            &copy; {year} अन्नSetu. All rights reserved. 
            <span className="hidden md:inline mx-2">|</span>
            Built with ❤️ for a hunger-free world.
          </p>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
