// src/features/public/sections/Navbar.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Button } from "@/shared/components/ui/button";
import { useContent } from "@/app/providers/ContentContext";
import { navConfig } from "@/shared/config/nav.config";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getNavbar } from "@/shared/api/navbar";
import type { NavbarData, NavbarLink } from "@/shared/content/content.types";

function labelToString(label: NavbarLink["label"]) {
  return typeof label === "string" ? label : (label.en ?? "");
}

function ctaLabelToString(label: any) {
  return typeof label === "string" ? label : (label?.en ?? "");
}

export function Navbar(): ReactElement {
  const { content } = useContent();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // CMS navbar state
  const [navbar, setNavbar] = useState<NavbarData | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await getNavbar();
        if (!alive) return;
        setNavbar(data);
      } catch {
        if (!alive) return;
        setNavbar(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

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

  const logoSrc = (navbar as any)?.brand?.logo || navConfig.brand.logo || null;

  const cmsLinks = useMemo(() => {
    const raw = Array.isArray(navbar?.links) ? navbar!.links : [];
    return raw
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .filter((l) => l.enabled !== false)
      .map((l) => ({
        id: l.id,
        label: labelToString(l.label),
        href: l.href,
        type: l.type,
      }));
  }, [navbar]);

  const fallbackLinks = useMemo(() => {
    return (navConfig.nav ?? []).map((item: any) => ({
      id: item.label,
      label: item.label,
      href: item.path,
      type: item.external ? "external" : "internal",
    }));
  }, []);

  const linksToRender = cmsLinks.length > 0 ? cmsLinks : fallbackLinks;

  // CTAs
  const pickupEnabled = (navbar as any)?.ctas?.pickup?.enabled ?? true;
  const pickupHref =
    (navbar as any)?.ctas?.pickup?.href || content.onlineOrder.pickupUrl || "";
  const pickupLabel =
    ctaLabelToString((navbar as any)?.ctas?.pickup?.label) || "Order Online";

  const deliveryEnabled = (navbar as any)?.ctas?.delivery?.enabled ?? true;
  const deliveryHref =
    (navbar as any)?.ctas?.delivery?.href ||
    content.onlineOrder.deliveryUrl ||
    "";
  const deliveryLabel =
    ctaLabelToString((navbar as any)?.ctas?.delivery?.label) || "Delivery";

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/70 border-b-2 border-brand-red/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop navbar */}
        <div className="hidden md:flex items-center justify-between h-16 lg:h-20">
          {/* Left: Logo */}
          <div
            className="flex items-center h-full cursor-pointer"
            onClick={handleLogoClick}
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Pho City logo"
                className="h-50 w-auto object-contain shrink-0"
              />
            ) : null}
          </div>

          {/* Center: Links */}
          <nav className="flex items-center gap-8 text-gray-800 font-medium">
            {linksToRender.map((item) => {
              const isExternal =
                item.type === "external" || /^https?:\/\//i.test(item.href);

              return isExternal ? (
                <a
                  key={item.id}
                  href={item.href}
                  className="hover:text-brand-red transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.id}
                  to={item.href}
                  className="hover:text-brand-red transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: CTAs */}
          <div className="flex items-center gap-3">
            {pickupEnabled && pickupHref ? (
              <a
                href={pickupHref}
                className="inline-flex items-center justify-center px-4 py-2 rounded-full
                  bg-brand-red text-white hover:bg-brand-red-hover
                  shadow-md shadow-black/15 ring-1 ring-black/5
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40
                  transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                {pickupLabel}
              </a>
            ) : null}

            {deliveryEnabled && deliveryHref ? (
              <a
                href={deliveryHref}
                className="inline-flex items-center justify-center px-4 py-2 rounded-full
                  border border-brand-charcoal/80 text-brand-charcoal
                  hover:bg-brand-cream ring-1 ring-black/5 shadow-sm
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/30
                  transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                {deliveryLabel}
              </a>
            ) : null}
          </div>
        </div>

        {/* Mobile navbar */}
        <div className="md:hidden flex h-16 items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => scrollTo("hero")}
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Pho City logo"
                className="h-50 w-auto object-contain shrink-0"
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

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-brand-cream border-t border-brand-cream shadow-lg">
          <div className="flex flex-col items-start px-6 py-4 space-y-4">
            {linksToRender.map((item) => {
              const isExternal =
                item.type === "external" || /^https?:\/\//i.test(item.href);

              return isExternal ? (
                <a
                  key={item.id}
                  href={item.href}
                  className="text-lg font-medium text-gray-800 hover:text-brand-red"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.id}
                  to={item.href}
                  className="text-lg font-medium text-gray-800 hover:text-brand-red"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            {pickupEnabled && pickupHref ? (
              <Button
                size="sm"
                className="w-full bg-brand-red text-white hover:bg-brand-redHover"
                onClick={() => window.open(pickupHref, "_blank")}
              >
                {pickupLabel}
              </Button>
            ) : null}

            {deliveryEnabled && deliveryHref ? (
              <Button
                size="sm"
                className="w-full bg-brand-cream border-brand-charcoal text-brand-charcoal
                  hover:bg-brand-cream ring-1 ring-black/10 shadow-sm"
                onClick={() => window.open(deliveryHref, "_blank")}
              >
                {deliveryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
