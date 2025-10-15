// src/sections/Navbar.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/context/ContentContext";
import { navConfig } from "@/config/nav.config";

export function Navbar(): JSX.Element {
  const { content } = useContent();
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-accent-cream/95 border-b-2 border-red-600 backdrop-blur supports-[backdrop-filter]:bg-accent-cream/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop */}
        <div className="hidden md:flex justify-between items-center h-20">
          {/* Left: Logo */}
          <div
            className="text-3xl font-extrabold text-red-700 tracking-tight leading-none cursor-pointer"
            onClick={() => scrollTo("hero")}
          >
            {navConfig.brand.name}
          </div>

          {/* Right: Navigation */}
          <nav className="flex items-center space-x-8">
            {navConfig.nav.map((item) => (
              <button
                key={item.label}
                className="text-lg font-medium text-gray-800 hover:text-red-600"
                onClick={() => item.id && scrollTo(item.id)}
              >
                {item.label}
              </button>
            ))}
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => window.open(content.onlineOrder.pickupUrl, "_blank")}
            >
              Order Online
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => window.open(content.onlineOrder.deliveryUrl, "_blank")}
            >
              Delivery
            </Button>
          </nav>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex h-16 items-center justify-between">
          <div
            className="text-2xl font-bold text-red-700 leading-none cursor-pointer"
            onClick={() => scrollTo("hero")}
          >
            {navConfig.brand.name}
          </div>
          <button
            className="text-gray-700 hover:text-red-600"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-accent-cream border-t border-red-100 shadow-lg">
          <div className="flex flex-col items-start px-6 py-4 space-y-4">
            {navConfig.nav.map((item) => (
              <button
                key={item.label}
                className="text-lg font-medium text-gray-800 hover:text-red-600"
                onClick={() => item.id && scrollTo(item.id)}
              >
                {item.label}
              </button>
            ))}
            <Button
              size="sm"
              className="w-full bg-red-600 text-white hover:bg-red-700"
              onClick={() => window.open(content.onlineOrder.pickupUrl, "_blank")}
            >
              Order Online
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
