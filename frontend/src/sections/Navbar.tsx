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
    <header className="sticky top-0 z-50 bg-[#fef8f4]/90 border-b border-red-100 backdrop-blur-md supports-[backdrop-filter]:bg-[#fef8f4]/80 transition-all duration-300">
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
            <a href="about" className="hover:text-red-600 transition-colors">About</a>
            <a href="contact" className="hover:text-red-600 transition-colors">Contact</a>
            <a href="menu" className="hover:text-red-600 transition-colors">Menu</a>
          </nav>

          {/*Right: CTA*/}
          <div className="flex items-center gap-3">
            <a href="/order" className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition">
              Order Online
            </a>
            <a href="/delivery" className="border border-red-600 text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition">
              Delivery
            </a>
          </div>
        </div>

        {/*Mobile navbar*/}
        <div className="md:hidden flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollTo("hero")}>
            {navConfig.brand.logo ? (
              <img src={navConfig.brand.logo} alt="Pho City logo" className="h-10 w-10 object-contain" />
            ) : null}
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

      {/*Mobile dropdown*/}
      {open && (
        <div className="md:hidden bg-[#fef8f4] border-t border-red-100 shadow-lg">
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