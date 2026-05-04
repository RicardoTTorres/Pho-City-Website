import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getHero,
  updateHero,

} from "../../../src/controllers/heroController.js";

vi.mock("../../../src/db/connect_db.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock("../../../src/controllers/activityController.js", () => ({
  logActivity: vi.fn(),
}));

import { pool } from "../../../src/db/connect_db.js";
import { logActivity } from "../../../src/controllers/activityController.js";

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

describe("getHero", () => {
  it("returns 200 when hero found", async () => {
    pool.query.mockResolvedValueOnce([
      [
        {
          hero_id: 1,
          hero_main_title: "Authentic Viet Cuisine",
          hero_subtitle: "come try our tasty food",
          hero_button_text: "View menu",
          hero_secondary_button_text: null,
          hero_image_url: null,
        },
      ],
    ]);

    const { req, res } = mockReqRes();
    await getHero(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      title: "Authentic Viet Cuisine",
      subtitle: "come try our tasty food",
      ctaText: "View menu",
      secondaryCtaText: null,
      imageUrl: null,
    });
  });

  it("returns 404 when Hero not found or when no rows", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const { req, res } = mockReqRes();
    await getHero(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Hero not found" });
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB fail"));

    const { req, res } = mockReqRes();
    await getHero(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

describe("updateHero", () => {
  it("returns 400 for invalid payload", async () => {
    const { req, res } = mockReqRes({
      body: {
        title: "Main",
        subtitle: "Sub",
        ctaText: "CTA",
        secondaryCtaText: 123,
        imageUrl: "img.jpg",
      },
    });

    await updateHero(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid payload" });
    expect(pool.query).not.toHaveBeenCalled();
    expect(logActivity).not.toHaveBeenCalled();
  });

  it("returns null imageURL when updated image is null", async () => {
    pool.query.mockResolvedValueOnce([{affectedRows: 1}]);
    pool.query.mockResolvedValueOnce([
      [
        {hero_id: 1,
          hero_main_title: "Updated Title",
          hero_subtitle: "Updated Subtitle",
          hero_button_text: "Updated CTA",
          hero_secondary_button_text: "Updated Secondary CTA",
          hero_image_url: null,
        }, 
      ],
    ]);

    const {req, res} = mockReqRes({
      body: {
        title: "Updated Title",
        subtitle: "Updated Subtitle",
        ctaText: "Updated CTA",
        secondaryCtaText: "Updated Secondary CTA",
        imageUrl: null,
      },
      user: { email: "admin@test.com" },
    });

    await updateHero(req, res);

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("UPDATE hero_section"),
      [
        "Updated Title",
        "Updated Subtitle",
        "Updated CTA",
        "Updated Secondary CTA",
        null,
      ]
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      title: "Updated Title",
      subtitle: "Updated Subtitle",
      ctaText: "Updated CTA",
      secondaryCtaText: "Updated Secondary CTA",
      imageUrl: null,
    });

    expect(logActivity).toHaveBeenCalledWith(
      "updated",
      "hero",
      "Updated hero section",
      "admin@test.com"
    );
  });

  it("returns 200 updates hero, logs activity, and returns updated hero", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    pool.query.mockResolvedValueOnce([
      [
        {
          hero_id: 1,
          hero_main_title: "New Viet Cuisine",
          hero_subtitle: "New Pho so tasty description",
          hero_button_text: "New View Menu",
          hero_secondary_button_text: "New Download Menu",
          hero_image_url: "img.jpg",
        },
      ],
    ]);

    const { req, res } = mockReqRes({
      body: {
        title: "New Main",
        subtitle: "New Sub",
        ctaText: "New CTA",
        secondaryCtaText: "New Secondary",
        imageUrl: null,
      },
      user: { email: "admin@test.com" },
    });

    await updateHero(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      title: "New Viet Cuisine",
      subtitle: "New Pho so tasty description",
      ctaText: "New View Menu",
      secondaryCtaText: "New Download Menu",
      imageUrl: "img.jpg",
    });

    expect(pool.query).toHaveBeenCalledTimes(2);

    expect(logActivity).toHaveBeenCalledWith(
      "updated",
      "hero",
      "Updated hero section",
      "admin@test.com",
    );
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB fail"));

    const { req, res } = mockReqRes({
      body: {
        title: "Main",
        subtitle: "Sub",
        ctaText: "CTA",
        secondaryCtaText: "Secondary",
        imageUrl: "img.jpg",
      },
    });

    await updateHero(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});