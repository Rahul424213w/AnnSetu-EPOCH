"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Truck, Heart, QrCode, Copy, CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const donationOptions = [
  {
    id: "meals",
    icon: <Utensils className="h-7 w-7" />,
    title: "Sponsor a Meal",
    description: "Nourish a soul. For just ₹50, you provide a fresh, warm meal to someone who might otherwise go hungry today.",
    action: "Sponsor Now",
    details: {
      tagline: "Your ₹50 can fill a plate and a heart.",
      message: "Every meal we serve is freshly prepared and nutritionally balanced. Your contribution goes directly towards procuring ingredients and supporting local community kitchens that prepare these meals for the underprivileged.",
      accountName: "अन्नSetu Meals Relief Fund",
      accountNumber: "1234 5678 9012",
      ifsc: "SETU0000123",
      upi: "meals@annsetu"
    }
  },
  {
    id: "delivery",
    icon: <Truck className="h-7 w-7" />,
    title: "Fund a Delivery",
    description: "The final mile matters. Help us cover the costs of transportation, ensuring food stays fresh from donor to plate.",
    action: "Fuel a Delivery",
    details: {
      tagline: "Be the bridge between surplus and hunger.",
      message: "Our logistics network is the backbone of food redistribution. Your donation covers fuel reimbursements for volunteers, electric van charging, and maintaining the cold-chain integrity of sensitive food items.",
      accountName: "अन्नSetu Logistics & Operations",
      accountNumber: "9876 5432 1098",
      ifsc: "SETU0000987",
      upi: "delivery@annsetu"
    }
  },
  {
    id: "general",
    icon: <Heart className="h-7 w-7" />,
    title: "General Donation",
    description: "Fuel the revolution. Support our technology and expansion to move closer to a zero-waste, hunger-free India.",
    action: "Donate Any Amount",
    details: {
      tagline: "Even ₹1 is a step towards zero hunger.",
      message: "General donations empower us to build smarter matching algorithms, scale our platform to new cities, and cover essential administrative costs that keep the अन्नSetu ecosystem running 24/7.",
      accountName: "अन्नSetu Foundation",
      accountNumber: "5566 7788 9900",
      ifsc: "SETU0000555",
      upi: "donate@annsetu"
    }
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
} satisfies Variants;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
} satisfies Variants;

export function DonateCTA() {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <section id="donate" className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-20 left-[10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
            Every Rupee Counts
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Your contribution isn&apos;t just money; it&apos;s a lifeline. Help us sustain the logistics 
            and operations that turn surplus food into a shared blessing.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-10 md:grid-cols-3 max-w-7xl mx-auto"
        >
          {donationOptions.map((option) => (
            <motion.div key={option.id} variants={itemVariants} className="h-full">
              <Card className="h-full group relative border-border/40 bg-card/40 backdrop-blur-md hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all duration-500 flex flex-col p-2 rounded-[2.5rem] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader className="text-center pt-10 pb-6 px-8">
                  <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/5 text-primary group-hover:rotate-6 transition-all duration-500 shadow-sm group-hover:shadow-primary/20">
                    {option.icon}
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">{option.title}</CardTitle>
                  <CardDescription className="text-lg leading-snug min-h-[5rem] px-2">
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="mt-auto px-8 pb-10">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full h-14 text-lg font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/10">
                        {option.action}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] md:max-w-[650px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
                      <div className="bg-gradient-to-br from-primary to-primary/90 p-10 text-primary-foreground text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black rounded-full blur-3xl" />
                        </div>
                        
                        <div className="relative z-10">
                          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-inner">
                            {option.icon}
                          </div>
                          <DialogTitle className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">{option.title}</DialogTitle>
                          <p className="text-lg text-primary-foreground/90 font-medium max-w-sm mx-auto leading-tight italic">&ldquo;{option.details.tagline}&rdquo;</p>
                        </div>
                      </div>
                      
                      <div className="p-10 space-y-8 bg-card">
                        <p className="text-muted-foreground text-center text-lg leading-relaxed font-medium">
                          {option.details.message}
                        </p>

                        <div className="flex flex-col md:flex-row gap-10 items-start justify-center py-2">
                          {/* QR Code Section */}
                          <div className="w-full md:w-auto flex flex-col items-center space-y-4">
                            <div className="relative group">
                              <div className="w-52 h-52 bg-secondary/50 rounded-3xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center p-6 text-center group-hover:border-primary transition-all duration-500 shadow-inner">
                                <QrCode className="h-24 w-24 text-primary/30 mb-3" />
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] leading-tight">Secure Payment<br/>QR Code</span>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[4px] opacity-100 transition-opacity rounded-3xl border border-primary/10">
                                <div className="text-center px-4">
                                  <p className="text-sm font-black text-primary uppercase tracking-widest mb-1">Generating...</p>
                                  <p className="text-[10px] text-muted-foreground font-medium italic">We&apos;re finalizing our<br/>80G tax certificates</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 rounded-full">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">UPI Verified</span>
                            </div>
                          </div>

                          {/* Account Details Section */}
                          <div className="flex-1 space-y-6 w-full">
                            <div className="space-y-3">
                              <h4 className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Direct Bank Transfer</h4>
                              <div className="bg-muted/30 p-6 rounded-3xl space-y-4 border border-border/50">
                                <div className="flex flex-col space-y-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Beneficiary</span>
                                  <span className="text-sm font-bold text-foreground truncate">{option.details.accountName}</span>
                                </div>
                                
                                <div className="h-px bg-border/50 w-full" />
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1 cursor-pointer group" onClick={() => copyToClipboard(option.details.accountNumber, "Account Number")}>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 group-hover:text-primary transition-colors">
                                      Account No. <Copy className="h-2 w-2" />
                                    </span>
                                    <span className="text-sm font-mono font-black tracking-tighter text-foreground">{option.details.accountNumber}</span>
                                  </div>
                                  <div className="space-y-1 cursor-pointer group" onClick={() => copyToClipboard(option.details.ifsc, "IFSC Code")}>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 group-hover:text-primary transition-colors">
                                      IFSC Code <Copy className="h-2 w-2" />
                                    </span>
                                    <span className="text-sm font-mono font-black tracking-tighter text-foreground">{option.details.ifsc}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Quick UPI Pay</h4>
                              <div 
                                className="bg-primary/5 p-5 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-primary/10 transition-all border-2 border-primary/10 active:scale-[0.98]"
                                onClick={() => copyToClipboard(option.details.upi, "UPI ID")}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Heart className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-mono font-black text-primary tracking-tight">{option.details.upi}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase bg-white px-2 py-1 rounded-md shadow-sm">
                                  Copy <Copy className="h-3 w-3" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">100% Transparency Guaranteed</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium text-center md:text-right">
                            For large donations or corporate CSR inquiries, please reach out to <span className="text-primary font-bold">partners@annsetu.org</span>
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-24 text-center max-w-4xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-black tracking-tight">Are you a food vendor or restaurant?</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join our network of <span className="text-foreground font-bold">500+ daily donors</span>. 
                Instead of throwing away good food, let us help you distribute it to those in need. 
                Get real-time tracking, impact reports, and tax benefits.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" asChild className="h-16 px-10 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
                <Link href="/signup?role=donor">Register as Food Donor</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-16 px-10 text-lg font-bold rounded-2xl border-primary/20 hover:bg-primary/5 transition-all active:scale-95">
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em] pt-4">
              Join the movement • 50k+ Meals Saved • 12 Cities
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
