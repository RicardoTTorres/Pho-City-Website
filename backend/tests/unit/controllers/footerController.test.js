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
    it("returns footer when database returns footer json object", async () => {
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
});