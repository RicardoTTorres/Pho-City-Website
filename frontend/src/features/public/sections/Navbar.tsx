// src/sections/Navbar.tsx
import React, { useState } from "react";
import type { ReactElement } from "react";
import { Button } from "@/shared/components/ui/button";
import { useContent } from "@/app/providers/ContentContext";
import { navConfig } from "@/shared/config/nav.config";
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
    <header className="sticky top-0 z-50 bg-brand-cream/70  border-b-2 border-brand-red/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/*Desktop navbar*/}
        <div className="hidden md:flex items-center justify-between h-16 lg:h-20">
          {/*Left: Logo*/}
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

          {/*Center: Links*/}
          <nav className="flex items-center gap-8 text-gray-800 font-medium">
            <a href="/" className="hover:text-brand-red transition-colors">
              Home
            </a>
            <a href="about" className="hover:text-brand-red transition-colors">
              About
            </a>
            <a
              href="contact"
              className="hover:text-brand-red transition-colors"
            >
              Contact
            </a>
            <a href="menu" className="hover:text-brand-red transition-colors">
              Menu
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={content.onlineOrder.pickupUrl}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full
             bg-brand-red text-white hover:bg-brand-red-hover
             shadow-md shadow-black/15 ring-1 ring-black/5
             focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40
             transition"
             target="_blank"
             rel="noopener noreferrer"
            >
              Order Online
            </a>

            <a
              href={content.onlineOrder.deliveryUrl}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full
             border border-brand-charcoal/80 text-brand-charcoal
             hover:bg-brand-cream ring-1 ring-black/5 shadow-sm
             focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/30
             transition"
             target="_blank"
             rel="noopener noreferrer"
            >
              Delivery
            </a>
          </div>
        </div>

        {/*Mobile navbar*/}
        <div className="md:hidden flex h-16 items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => scrollTo("hero")}
          >
            {navConfig.brand.logo ? (
              <img
                src={navConfig.brand.logo}
                alt="Pho City logo"
                className="h-10 w-10 object-contain"
              />
            ) : null}
          </div>
          <button
            className="text-gray-700 hover:text-brand-red"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/*Mobile dropdown*/}
      {open && (
        <div className="md:hidden bg-brand-cream border-t border-brand-cream shadow-lg">
          <div className="flex flex-col items-start px-6 py-4 space-y-4">
            {navConfig.nav.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="text-lg font-medium text-gray-800 hover:text-brand-red"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              size="sm"
              className="w-full bg-brand-red text-white hover:bg-brand-redHover"
              onClick={() =>
                window.open(content.onlineOrder.pickupUrl, "_blank")
              }
            >
              Order Online
            </Button>
            <Button
              size="sm"
              className="w-full bg-brand-cream border-brand-charcoal text-brand-charcoal
             hover:bg-brand-cream ring-1 ring-black/10 shadow-sm"
              onClick={() =>
                window.open(content.onlineOrder.deliveryUrl, "_blank")
              }
            >
              Delivery
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
