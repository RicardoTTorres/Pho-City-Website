// src/sections/Footer.tsx
import React, { memo } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { footerConfig } from "@/config/footer.config";

export const Footer = memo(function Footer({ config = footerConfig }: { config?: typeof footerConfig }): ReactElement {
  const year = new Date().getFullYear();
  const { brand, navLinks, instagram, contact } = config;

  return (
  <footer className="bg-brand-gold/15 border-t-2 border-brand-red text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Top row: logo | nav | instagram+contact */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-6 md:gap-8">
          {/* Left: Logo */}
          <div className="flex flex-col items-center">
            {brand.logo ? (
              <Link to="/" aria-label="Home">
                <div className="h-10 md:h-12 w-full flex items-center justify-center">
                  <img
                    src={brand.logo}
                    alt=""
                    className="h-50 w-50 object-contain shrink-0"
                  />
                </div>
              </Link>
            ) : null}
          </div>

          {/* Center: Nav */}
          <nav aria-label="Footer navigation" className="flex justify-center">
            <ul className="flex flex-wrap justify-center gap-x-3 md:gap-x-5 gap-y-2 text-sm md:text-base font-medium">
              {navLinks.map((link) => (
                <li key={link.label}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-redHover transition"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.path} className="hover:text-brand-redHover transition">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>  

          {/* Instagram + Address/Phone */}
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <a
              href={instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pho City Instagram"
              className="text-sm md:text-base font-medium text-brand-redHover hover:underline underline-offset-4"
            >
              Follow us on Instagram
            </a>
            <div className="mt-2 text-sm text-[var(--muted-foreground)] leading-tight">
              <p>{contact.address}</p>
              <p>{contact.cityZip}</p>
              <p>{contact.phone}</p>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          © {year} {brand.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
});
