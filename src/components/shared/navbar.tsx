"use client";

import { useState } from "react";
import { Menu, X, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/shared/sidebar";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Tombol Hamburger (Mobile Only) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 hover:bg-slate-100"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2 md:hidden">
            <div className="bg-emerald-500 p-1.5 rounded-md text-slate-950">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Gymnasyum</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            System Online
          </span>
        </div>
      </header>

      {/* Overlay & Drawer Menu untuk Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Transparan */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Panel Menu Mobile */}
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 z-10 flex flex-col">
            <div className="absolute top-4 right-4 z-20">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Sidebar
              className="w-full min-h-full border-r-0"
              onNavClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
