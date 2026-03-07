import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleContactForm } from "../../../src/controllers/contactController.js";

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(),
    })),
  },
}));

vi.mock("../../../src/services/settingsService.js", () => ({
  getSettings: vi.fn(),
  storeSubmission: vi.fn(),
}));

import { getSettings, storeSubmission } from "../../../src/services/settingsService.js";

function mockReqRes({
  body = {},
  params = {},
  user = {},
  ip = "127.0.0.1"
} = {}) {
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  };

  const req = { body, params, user, ip };

  return { req, res };
}

describe("handleContactForm", () => {

  it("returns 400 when required fields are missing", async () => {
    const { req, res } = mockReqRes({
      body: { name: "John" }
    });

    await handleContactForm(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "All fields are required"
    });
  });

  it("returns success when honeypot field is filled", async () => {
    const { req, res } = mockReqRes({
      body: {
        name: "John",
        email: "john@test.com",
        message: "Hello",
        _honeypot: "bot"
      }
    });

    await handleContactForm(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Message received"
    });
  });

  it("stores submission and returns success", async () => {
    getSettings.mockResolvedValue({
      contact: {
        storeSubmissions: true,
        emailNotificationsEnabled: false
      }
    });

    storeSubmission.mockResolvedValue({});

    const { req, res } = mockReqRes({
      body: {
        name: "John",
        email: "john@test.com",
        message: "Hello"
      }
    });

    await handleContactForm(req, res);

    expect(storeSubmission).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 when an error happens", async () => {
    getSettings.mockRejectedValue(new Error("fail"));

    const { req, res } = mockReqRes({
      body: {
        name: "John",
        email: "john@test.com",
        message: "Hello"
      }
    });

    await handleContactForm(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Failed to process message"
    });
  });

  it("returns 429 when rate limit is exceeded", async () => {
  getSettings.mockResolvedValue({
    contact: {
      storeSubmissions: false,
      emailNotificationsEnabled: false
    }
  });

  const body = {
    name: "John",
    email: "john@test.com",
    message: "Hello"
  };

  let res;

  for (let i = 0; i < 6; i++) {
    const mock = mockReqRes({ body });
    res = mock.res;
    await handleContactForm(mock.req, mock.res);
  }

  expect(res.status).toHaveBeenCalledWith(429);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    error: "Too many requests. Please wait a few minutes."
  });
});

});