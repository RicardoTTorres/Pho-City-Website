// src/sections/Footer.tsx
import React, { memo } from "react";
import type { ReactElement } from "react";
import { footerConfig } from "@/config/footer.config";

export const Footer = memo(function Footer({ config = footerConfig }: { config?: typeof footerConfig }): ReactElement {
  const year = new Date().getFullYear();
  const { brand, navLinks, instagram, contact } = config;

  return (
    <footer className="bg-accent-cream border-t-2 border-red-600 text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top row: logo | nav | instagram + contact */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          {/* Left: Logo + name */}
          <div className="flex flex-col items-center md:items-start">
            {brand.logo ? (
              <a href="#home" aria-label="Home">
                <img src={brand.logo} alt="" className="h-50 w-50 object-contain mb-2" />
              </a>
            ) : null}
            
          </div>

          {/* Center: Nav */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-base font-medium">
              {navLinks.map((link) => {
                if ("href" in link) {
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(('external' in link && link.external) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="hover:text-red-700 transition"
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={link.label}>
                    <a href={`#${(link as any).id}`} className="hover:text-red-700 transition">
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: Instagram + address/phone */}
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <a
              href={instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pho City Instagram"
              className="text-base font-medium text-red-700 hover:underline underline-offset-4"
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
        <div className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
          © {year} {brand.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
});
