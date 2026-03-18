import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getContactInfo,
  updateContactInfo
} from "../../../src/controllers/adminContactController.js";

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
  user = { email: "admin@phocity.com" },
} = {}) {
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
  };

  const req = { body, params, user };
  return { req, res };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getContactInfo", () => {
  it("returns 200 with contact info and hours", async () => {
    pool.query
      .mockResolvedValueOnce([
        [{
          contact_phone: "(916)-754-2143",
          contact_email: "phocitysac@gmail.com",
          contact_address: "6175 Stockton Blvd",
          contact_city: "Sacramento",
          contact_state: "CA",
          contact_zipcode: "95824"
        }]
      ])
      .mockResolvedValueOnce([
        [
          {
            day_of_week: "Monday",
            open_time: "09:00",
            close_time: "20:00",
            restaurant_is_closed: 0
          }
        ]
      ]);
    const { req, res } = mockReqRes();

    await getContactInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      phone: "(916)-754-2143",
      email: "phocitysac@gmail.com",
      address: "6175 Stockton Blvd",
      city: "Sacramento",
      state: "CA",
      zipcode: "95824",
      onlineOrdering: "",
      fullAddress: "6175 Stockton Blvd, Sacramento, CA 95824",
      businessHours: [
        {
          day: "Monday",
          open: "09:00",
          close: "20:00",
          closed: false
        }
      ]
    });

  });

  it("returns 404 when contact info not found", async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]]);
    const { req, res } = mockReqRes();

    await getContactInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No contact info found"
    });
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB fail"));
    const { req, res } = mockReqRes();

    await getContactInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to load contact info"
    });
  });
});

describe("updateContactInfo", () => {
  it("returns 400 when payload is invalid", async () => {
    const { req, res } = mockReqRes({
      body: {
        phone: "123",
        email: "test@test.com"
      }
    });
    await updateContactInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "All contact fields are required."
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns 200 when contact info and hours are updated successfully", async () => {
    pool.query.mockResolvedValue({});
    const { req, res } = mockReqRes({
      body: {
        phone: "(916)-754-2143",
        email: "phocitysac@gmail.com",
        address: "6175 Stockton Blvd",
        city: "Sacramento",
        state: "CA",
        zipcode: "95824",
        businessHours: [
          {
            day: "Monday",
            open: "09:00",
            close: "20:00",
            closed: false
          }
        ]
      },
      user: { email: "admin@phocity.com" }
    });
    await updateContactInfo(req, res);

    expect(pool.query).toHaveBeenCalled();
    expect(logActivity).toHaveBeenCalledWith(
      "updated",
      "contact",
      "Updated contact info & hours",
      "admin@phocity.com"
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Contact information updated successfully."
    });
  });

  it("handles closed business hours correctly", async () => {
    pool.query.mockResolvedValue({});
    const { req, res } = mockReqRes({
      body: {
        phone: "(916)-754-2143",
        email: "phocitysac@gmail.com",
        address: "6175 Stockton Blvd",
        city: "Sacramento",
        state: "CA",
        zipcode: "95824",
        businessHours: [
          {
            day: "Tuesday",
            open: "09:00",
            close: "20:00",
            closed: true
          }
        ]
      },
      user: { email: "admin@phocity.com" }
    });
    await updateContactInfo(req, res);

    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on database failure", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB fail"));
    const { req, res } = mockReqRes({
      body: {
        phone: "(916)-754-2143",
        email: "phocitysac@gmail.com",
        address: "6175 Stockton Blvd",
        city: "Sacramento",
        state: "CA",
        zipcode: "95824",
        businessHours: [
          {
            day: "Monday",
            open: "09:00",
            close: "20:00",
            closed: false
          }
        ]
      }
    });
    await updateContactInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to update contact info"
    });
  });
});