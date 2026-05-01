"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Utensils, Menu, X, Play, Gift, Building2, Bike } from "lucide-react";
import { useState } from "react";
import { useAuth, type UserRole } from "@/lib/auth-context";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { demoLogin } = useAuth();
  const router = useRouter();

  const handleDemoLogin = (role: UserRole) => {
    demoLogin(role);
    router.push("/dashboard");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Utensils className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl brand-name text-foreground">AnnSetu</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#impact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Impact
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="#volunteer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Volunteer
          </Link>
          <Link href="#donate" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Donate
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Demo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDemoLogin("donor")} className="gap-2 cursor-pointer">
                <Gift className="h-4 w-4" />
                Try as Donor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDemoLogin("ngo")} className="gap-2 cursor-pointer">
                <Building2 className="h-4 w-4" />
                Try as NGO
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDemoLogin("volunteer")} className="gap-2 cursor-pointer">
                <Bike className="h-4 w-4" />
                Try as Volunteer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <Link
              href="#impact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Impact
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#volunteer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Volunteer
            </Link>
            <Link
              href="#donate"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Donate
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Quick Demo</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 gap-1"
                  onClick={() => { handleDemoLogin("donor"); setMobileMenuOpen(false); }}
                >
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-xs">Donor</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 gap-1"
                  onClick={() => { handleDemoLogin("ngo"); setMobileMenuOpen(false); }}
                >
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-xs">NGO</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 gap-1"
                  onClick={() => { handleDemoLogin("volunteer"); setMobileMenuOpen(false); }}
                >
                  <Bike className="h-4 w-4 text-primary" />
                  <span className="text-xs">Volunteer</span>
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" asChild className="flex-1">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
