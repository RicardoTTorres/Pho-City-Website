// src/sections/Footer.tsx
import React, { memo } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { useContent } from "@/context/ContentContext";

export const Footer = memo(function Footer(): ReactElement {
  const { content } = useContent();
  const config = content.footer;

  const year = new Date().getFullYear();
  const { brand, navLinks, instagram, contact } = config;

  return (
    <footer className="bg-brand-cream/70 border-t-2 border-brand-red text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-6 md:gap-8">
          {/* Left: Logo */}
          <div className="flex flex-col items-center">
            {brand?.logo ? (
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
              {(navLinks ?? [])
                .filter((link) => link.visible !== false)
                .map((link) => (
                  <li key={`${link.label}-${link.path}`}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-redHover transition"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="hover:text-brand-redHover transition"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
            </ul>
          </nav>

          {/* Instagram + Address/Phone */}
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            {instagram?.url ? (
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pho City Instagram"
                className="hover:opacity-80 transition"
              >
                {instagram?.icon ? (
                  <img
                    src={instagram.icon}
                    alt="Instagram"
                    className="w-8 h-8"
                  />
                ) : null}
              </a>
            ) : null}

            <div className="mt-2 text-sm text-[var(--muted-foreground)] leading-tight">
              {contact?.address ? <p>{contact.address}</p> : null}
              {contact?.cityZip ? <p>{contact.cityZip}</p> : null}
              {contact?.phone ? <p>{contact.phone}</p> : null}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          © {year} {brand?.name ?? ""}. All rights reserved.
        </div>
      </div>
    </footer>
  );
});
