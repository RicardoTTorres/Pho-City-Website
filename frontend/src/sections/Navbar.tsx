// src/sections/Navbar.tsx
import React, { useState } from "react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/context/ContentContext";
import { navConfig } from "@/config/nav.config";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Navbar(): ReactElement {
  const { content } = useContent();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      scrollTo("hero");
    } else {
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-accent-cream/95 border-b-2 border-red-600 backdrop-blur supports-[backdrop-filter]:bg-accent-cream/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between h-16 lg:h-20">
          {/* Left: Logo */}
          <div
            className="flex items-center h-full cursor-pointer"
            onClick={handleLogoClick}
          >
            {navConfig.brand.logo ? (
              <img
                src={navConfig.brand.logo}
                alt=""
                className="h-50 w-auto object-contain shrink-0"
              />
            ) : null}
          </div>

          {/* Right: Nav + Actions */}
          <div className="flex items-center gap-4 lg:gap-6">
            <nav className="flex items-center gap-4 lg:gap-6">
              {navConfig.nav.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="text-base lg:text-lg font-medium text-gray-800 hover:text-red-600"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 lg:gap-3">
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
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex h-16 items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => scrollTo("hero")}
          >
            {navConfig.brand.logo ? (
              <img src={navConfig.brand.logo} alt="" className="h-10 w-10 object-contain" />
            ) : null}
            <div> </div>
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
              <Link
                key={item.label}
                to={item.path}
                className="text-lg font-medium text-gray-800 hover:text-red-600"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
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
