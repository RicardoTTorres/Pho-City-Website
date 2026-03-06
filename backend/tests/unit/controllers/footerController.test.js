import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFooter, putFooter } from "../../../src/controllers/footerController.js"

// Mock DB
vi.mock("../../../src/db/connect_db.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from "../../../src/db/connect_db.js";

function mockReqRes({
  body = {},
  params = {},
  user = { email: "admin@test.com" },
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
});

describe("getFooter", () => {
    it("returns footer when database returns footer data as JavaScript object", async () => {
        const footerObj = {
            brand: { logo: "/logo.png", name: "" },
            contact: { phone: "(916) 754-2143", address: "6175 Stockton Blvd #200", cityZip: "Sacramento, CA 95824" },
            navLinks: [{ path: "/menu", label: "Menu", external: false }],
            socialLinks: [{ url: "https://order.toasttab.com/online/pho-city-6175-stockton-boulevard-200", icon: "/instagram_icon.png", platform: "instagram" }]
        };

        pool.query.mockResolvedValueOnce([[{ footer_json: footerObj }]]);

        const { req, res} = mockReqRes();
        await getFooter(req, res);

        expect(res.json).toHaveBeenCalledWith({ footer: footerObj});
    });

    it("returns footer when database returns footer data as JSON string", async () => {
        const footerObj = {
            brand: { logo: "/logo.png", name: ""}
        };

        const footerString = JSON.stringify(footerObj);

        pool.query.mockResolvedValueOnce([[{ footer_json: footerString }]]);

        const { req, res} = mockReqRes();
        await getFooter(req, res);

        expect(res.json).toHaveBeenCalledWith({ footer: footerObj});
    });

    it("returns 404 when footer settings are not found in the database", async () => {
        pool.query.mockResolvedValueOnce([[], []]);

        const { req, res } = mockReqRes();
        await getFooter(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Footer settings not found" });
    });

    it("returns 500 when database fails query", async () => {
        pool.query.mockRejectedValueOnce(new Error("DB failure"))

        const { req, res} = mockReqRes();
        await getFooter(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch footer" });
    });

    it("returns 500 when footer_json contains an invalid JSON string", async () =>  {
      pool.query.mockResolvedValueOnce([[{ footer_json: "{ invalid json }" }]]);

      const { req, res} = mockReqRes();
      await getFooter(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch footer" });
    }); 
});

describe("putFooter", () => {
  it("returns 400 when footer is missing from the body of the request", async () => {
    const { req, res } = mockReqRes({ body: {} });
    await putFooter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing footer in request body" });
  });

  it("updates footer and returns ok true with updated footer data", async () => {
    const footerObj = {
      brand: { logo: "/logo.png", name: "Pho City" },
      contact: {
        phone: "(916) 754-2143",
        address: "6175 Stockton Blvd #200",
        cityZip: "Sacramento, CA 95824"
    }};

    pool.query.mockResolvedValueOnce([{}]);

    const { req, res } = mockReqRes({
      body: { footer: footerObj }
    });

    await putFooter(req, res);

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      footer: footerObj
    });
  });
});