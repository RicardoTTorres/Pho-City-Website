// src/sections/Footer.tsx
import React, { memo } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { useContent } from "@/app/providers/ContentContext";

export const Footer = memo(function Footer(): ReactElement {
  const { content } = useContent();
  const config = content.footer;

  const year = new Date().getFullYear();
  const { brand, navLinks, socialLinks, contact } = config;
  const instagram = (socialLinks ?? []).find((s) => s.platform === "instagram");

  return (
    <footer className="bg-brand-cream text-[var(--foreground)]">
      {/* Soft gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-red/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-10">

        {/* ── Mobile: centered stack / Desktop: three-column row ── */}
        <div className="flex flex-col items-center gap-7 md:flex-row md:items-start md:justify-between md:gap-10">

          {/* 1. Brand */}
          {brand?.logo ? (
            <Link to="/" aria-label="Home" className="shrink-0">
              <img
                src={brand.logo}
                alt="Pho City"
                className="h-10 w-auto object-contain"
              />
            </Link>
          ) : null}

          {/* 2. Nav — tighter, centered on mobile */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-sm font-medium text-[var(--muted-foreground)]">
              {(navLinks ?? []).map((link) => (
                <li key={`${link.label}-${link.path}`}>
                  {link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-red transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.path} className="hover:text-brand-red transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* 3. Contact + social — one intentional group */}
          <div className="flex flex-col items-center md:items-end gap-1 text-sm text-[var(--muted-foreground)] text-center md:text-right">
            {contact?.address ? <p>{contact.address}</p> : null}
            {contact?.cityZip ? <p>{contact.cityZip}</p> : null}
            {contact?.phone ? (
              <a
                href={`tel:${contact.phone}`}
                className="hover:text-brand-red transition-colors"
              >
                {contact.phone}
              </a>
            ) : null}

            {instagram?.url ? (
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pho City on Instagram"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium hover:text-brand-red transition-colors group"
              >
                {instagram.icon ? (
                  <img
                    src={instagram.icon}
                    alt=""
                    className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                )}
                Follow us on Instagram
              </a>
            ) : null}
          </div>
        </div>

        {/* ── Copyright ── */}
        <div className="mt-10 pt-5 border-t border-brand-gold/20 text-center text-xs text-[var(--muted-foreground)]">
          © {year} Pho City. All rights reserved.
        </div>
      </div>
    </footer>
  );
});
