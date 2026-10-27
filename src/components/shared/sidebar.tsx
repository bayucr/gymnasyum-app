"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  Calendar,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Data Customer",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Jadwal Kelas",
    href: "/schedules",
    icon: Calendar,
  },
  {
    title: "Log Pengingat",
    href: "/reminders",
    icon: BellRing,
  },
];

interface SidebarProps {
  className?: string;
  onNavClick?: () => void;
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 shrink-0",
        className,
      )}
    >
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-emerald-500 p-2 rounded-lg text-slate-950">
          <Dumbbell className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-wide">
            Gymnasyum
          </h1>
          <p className="text-xs text-slate-400">Admin Operations</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Gymnasyum v1.0 &bull; Capstone
      </div>
    </aside>
  );
}
