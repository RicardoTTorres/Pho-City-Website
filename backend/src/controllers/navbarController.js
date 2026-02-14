import { fetchNavbar, saveNavbar } from "../services/navbarService.js";

function defaultI18n() {
  return { enabled: false, defaultLocale: "en", supportedLocales: ["en"] };
}

function toLabelObj(label) {
  if (!label) return { en: "" };
  if (typeof label === "string") return { en: label };
  if (typeof label === "object") return label;
  return { en: "" };
}

function defaultBrand() {
  return {
    name: "Pho City",
    logo: "",
  };
}

function defaultCtas() {
  return {
    pickup: { enabled: false, label: { en: "Pickup" }, href: "" },
    delivery: { enabled: false, label: { en: "Delivery" }, href: "" },
  };
}

export async function getNavbar(req, res) {
  try {
    const navbar = await fetchNavbar();
    return res.status(200).json({ success: true, data: navbar });
  } catch (err) {
    console.error("getNavbar error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export async function updateNavbar(req, res) {
  try {
    const input = req.body;

    if (!input || typeof input !== "object") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid navbar payload" });
    }

    const links = Array.isArray(input.links) ? input.links : [];
    const normalizedLinks = links
      .map((l, idx) => ({
        id: String(l.id ?? ""),
        label: toLabelObj(l.label),
        href: typeof l.href === "string" ? l.href.trim() : "",
        type: l.type === "external" ? "external" : "internal",
        order: Number.isInteger(l.order) ? l.order : idx + 1,
        enabled: typeof l.enabled === "boolean" ? l.enabled : true,
      }))
      .filter((l) => l.id && l.href)
      .sort((a, b) => a.order - b.order);

    const incomingCtas =
      input.ctas && typeof input.ctas === "object" ? input.ctas : {};
    const baseCtas = defaultCtas();

    const normalizedCtas = {
      pickup: {
        enabled:
          typeof incomingCtas.pickup?.enabled === "boolean"
            ? incomingCtas.pickup.enabled
            : baseCtas.pickup.enabled,
        label: toLabelObj(incomingCtas.pickup?.label ?? baseCtas.pickup.label),
        href:
          typeof incomingCtas.pickup?.href === "string"
            ? incomingCtas.pickup.href.trim()
            : "",
      },
      delivery: {
        enabled:
          typeof incomingCtas.delivery?.enabled === "boolean"
            ? incomingCtas.delivery.enabled
            : baseCtas.delivery.enabled,
        label: toLabelObj(
          incomingCtas.delivery?.label ?? baseCtas.delivery.label,
        ),
        href:
          typeof incomingCtas.delivery?.href === "string"
            ? incomingCtas.delivery.href.trim()
            : "",
      },
    };
    const incomingBrand =
      input.brand && typeof input.brand === "object" ? input.brand : {};

    const normalizedBrand = {
      name:
        typeof incomingBrand.name === "string"
          ? incomingBrand.name.trim()
          : defaultBrand().name,
      logo:
        typeof incomingBrand.logo === "string"
          ? incomingBrand.logo.trim()
          : defaultBrand().logo,
    };

    const updatedNavbar = {
      version: 1,
      i18n: input.i18n ?? defaultI18n(),
      brand: normalizedBrand,
      links: normalizedLinks,
      ctas: normalizedCtas,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id,
    };

    const saved = await saveNavbar(updatedNavbar);

    return res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error("updateNavbar error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
