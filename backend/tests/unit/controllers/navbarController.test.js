import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getNavbar,
  updateNavbar,
} from "../../../src/controllers/navbarController.js";

vi.mock("../../../src/services/navbarService.js", () => ({
  fetchNavbar: vi.fn(),
  saveNavbar: vi.fn(),
}));

vi.mock("../../../src/controllers/activityController.js", () => ({
  logActivity: vi.fn(),
}));

import {
  fetchNavbar,
  saveNavbar,
} from "../../../src/services/navbarService.js";
import { logActivity } from "../../../src/controllers/activityController.js";

function mockReqRes({
  body = {},
  params = {},
  user = { id: 7, email: "admin@test.com" },
} = {}) {
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  };

  const req = { body, params, user };
  return { req, res };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-13T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getNavbar", () => {
  it("returns navbar data from the service", async () => {
    const navbar = {
      version: 1,
      brand: { name: "Pho City", logo: "/logo.png" },
      links: [],
      ctas: {
        pickup: { enabled: false, label: { en: "Pickup" }, href: "" },
        delivery: { enabled: false, label: { en: "Delivery" }, href: "" },
      },
    };

    fetchNavbar.mockResolvedValueOnce(navbar);

    const { req, res } = mockReqRes();
    await getNavbar(req, res);

    expect(fetchNavbar).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: navbar,
    });
  });

  it("returns 500 when the service throws", async () => {
    fetchNavbar.mockRejectedValueOnce(new Error("service failure"));

    const { req, res } = mockReqRes();
    await getNavbar(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Server error",
    });
  });
});

describe("updateNavbar", () => {
  it("returns 400 for an invalid payload", async () => {
    const { req, res } = mockReqRes({ body: null });

    await updateNavbar(req, res);

    expect(saveNavbar).not.toHaveBeenCalled();
    expect(logActivity).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid navbar payload",
    });
  });

  it("normalizes navbar data, saves it, and logs activity", async () => {
    saveNavbar.mockImplementationOnce(async (payload) => payload);

    const { req, res } = mockReqRes({
      body: {
        i18n: {
          enabled: true,
          defaultLocale: "en",
          supportedLocales: ["en", "vi"],
        },
        brand: {
          name: "  Pho City Sacramento  ",
          logo: "  /brand.png  ",
        },
        links: [
          {
            id: "2",
            label: " Menu ",
            href: " /menu ",
            type: "internal",
            order: 2,
            enabled: true,
          },
          {
            id: "1",
            label: { en: "Home", vi: "Trang Chu" },
            href: " / ",
            type: "internal",
            order: 1,
            enabled: false,
          },
          {
            id: "",
            label: "Bad",
            href: "/bad",
          },
          {
            id: "3",
            label: "External",
            href: "",
            type: "external",
          },
        ],
        ctas: {
          pickup: {
            enabled: true,
            label: " Order Pickup ",
            href: " https://pickup.test ",
          },
          delivery: {
            enabled: true,
            label: { en: "Delivery" },
            href: " https://delivery.test ",
          },
        },
      },
      user: { id: 42, email: "admin@test.com" },
    });

    await updateNavbar(req, res);

    expect(saveNavbar).toHaveBeenCalledTimes(1);
    expect(saveNavbar).toHaveBeenCalledWith({
      version: 1,
      i18n: {
        enabled: true,
        defaultLocale: "en",
        supportedLocales: ["en", "vi"],
      },
      brand: {
        name: "Pho City Sacramento",
        logo: "/brand.png",
      },
      links: [
        {
          id: "1",
          label: { en: "Home", vi: "Trang Chu" },
          href: "/",
          type: "internal",
          order: 1,
          enabled: false,
        },
        {
          id: "2",
          label: { en: " Menu " },
          href: "/menu",
          type: "internal",
          order: 2,
          enabled: true,
        },
      ],
      ctas: {
        pickup: {
          enabled: true,
          label: { en: " Order Pickup " },
          href: "https://pickup.test",
        },
        delivery: {
          enabled: true,
          label: { en: "Delivery" },
          href: "https://delivery.test",
        },
      },
      updatedAt: "2026-03-13T12:00:00.000Z",
      updatedBy: 42,
    });

    expect(logActivity).toHaveBeenCalledWith(
      "updated",
      "navbar",
      "Updated navbar configuration",
      "admin@test.com",
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.any(Object),
    });
  });

  it("uses defaults when optional navbar fields are missing", async () => {
    saveNavbar.mockImplementationOnce(async (payload) => payload);

    const { req, res } = mockReqRes({
      body: {},
      user: { id: 9, email: "admin@test.com" },
    });

    await updateNavbar(req, res);

    expect(saveNavbar).toHaveBeenCalledWith({
      version: 1,
      i18n: { enabled: false, defaultLocale: "en", supportedLocales: ["en"] },
      brand: { name: "Pho City", logo: "" },
      links: [],
      ctas: {
        pickup: { enabled: false, label: { en: "Pickup" }, href: "" },
        delivery: { enabled: false, label: { en: "Delivery" }, href: "" },
      },
      updatedAt: "2026-03-13T12:00:00.000Z",
      updatedBy: 9,
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 when saveNavbar throws", async () => {
    saveNavbar.mockRejectedValueOnce(new Error("save failed"));

    const { req, res } = mockReqRes({
      body: { links: [] },
    });

    await updateNavbar(req, res);

    expect(logActivity).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Server error",
    });
  });
});
