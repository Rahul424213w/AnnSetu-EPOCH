"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Utensils,
  LayoutDashboard,
  PlusCircle,
  Package,
  History,
  Search,
  CheckCircle,
  Truck,
  MapPin,
  BarChart3,
  Settings,
} from "lucide-react";
import type { UserRole } from "@/lib/auth-context";

interface SidebarProps {
  role: UserRole;
}

const donorLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/donate", label: "Add Donation", icon: PlusCircle },
  { href: "/dashboard/active", label: "Active Donations", icon: Package },
  { href: "/dashboard/history", label: "History", icon: History },
];

const ngoLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/request", label: "Add Request", icon: PlusCircle },
  { href: "/dashboard/matches", label: "View Matches", icon: Search },
  { href: "/dashboard/history", label: "History", icon: History },
];

const volunteerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/available", label: "Available Deliveries", icon: MapPin },
  { href: "/dashboard/active", label: "Active Deliveries", icon: Truck },
  { href: "/dashboard/completed", label: "Completed", icon: CheckCircle },
];

const adminLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/stats", label: "Statistics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const links =
    role === "donor"
      ? donorLinks
      : role === "ngo"
      ? ngoLinks
      : role === "volunteer"
      ? volunteerLinks
      : adminLinks;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
                <Utensils className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span className="text-lg brand-name text-sidebar-foreground">AnnSetu</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              {role === "donor"
                ? "Donor Menu"
                : role === "ngo"
                ? "NGO Menu"
                : role === "volunteer"
                ? "Volunteer Menu"
                : "Admin Menu"}
            </p>
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              <Utensils className="h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background lg:hidden">
        <div className="flex items-center justify-around py-2">
          {links.slice(0, 4).map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
