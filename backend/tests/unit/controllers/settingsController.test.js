import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleGetPublicSettings, handleGetSettings, handleSaveSettings, handleMarkRead, handleGetInbox } from "../../../src/controllers/settingsController.js";

vi.mock("../../../src/db/connect_db.js", () => ({
    pool: {
      query: vi.fn(),
    },
}));
import { pool } from "../../../src/db/connect_db.js";

const DEFAULT_SETTINGS = {
    site: {
      siteName: "Pho City",
      tagline: "Authentic Vietnamese Cuisine",
      seoDescription:
        "Experience authentic Vietnamese flavors in Sacramento. Traditional pho, fresh rolls, and modern Vietnamese fusion crafted with passion.",
      googleAnalyticsId: "",
    },
    contact: {
      notificationEmail: "",
      emailNotificationsEnabled: false,
      storeSubmissions: true,
    },
    pdf: {
      menuLabel: "Download Menu",
      cacheTtlMinutes: 60,
    },
};

function mockReqRes({ req } = {}) {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    }
    const next = vi.fn();
    return { req, res };
}

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("handleGetSettings", () => {
    it("returns 500 when database query made an error", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB fail"));
      const { req, res } = mockReqRes({});
      await handleGetSettings(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: "Failed to load settings" });
    });

    it("returns json with default settings when database query returns empty", async () => {
      const settings = DEFAULT_SETTINGS;
      pool.query.mockResolvedValueOnce([[]]);
      const { req, res } = mockReqRes({});
      await handleGetSettings(req, res);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, settings } );
    });

    it("returns json with updated settings when database has different settings value than default", async () => {
      const testSiteValue = { tagline: "entry" };
      pool.query.mockResolvedValueOnce([
          [
            {
              settings_json: { site: testSiteValue, }
            }
          ]
      ]);
      const settings = {
          site: { ...DEFAULT_SETTINGS.site, ...testSiteValue },
          contact: { ...DEFAULT_SETTINGS.contact},
          pdf: { ...DEFAULT_SETTINGS.pdf}
      };
      const { req, res } = mockReqRes({});
      await handleGetSettings(req, res);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, settings } );
    });
});

describe("handleSaveSettings", () => {
    it("returns 500 when database query made an error", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB fail"));
      const { req, res } = mockReqRes({});
      await handleSaveSettings(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: "Failed to save settings" });
    });

    it("returns json with updated settings when database query works", async () => {
      pool.query.mockResolvedValueOnce();
      const { req, res } = mockReqRes({ req: { body: "testValue" } });
      await handleSaveSettings(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, settings: "testValue" });
    });
});

describe("handleGetPublicSettings", () => {
  it("returns json with menuLabel value from database", async () => {
    const testPdfValue = { menuLabel: "entry" };
    pool.query.mockResolvedValueOnce([
        [
          {
            settings_json: { pdf: testPdfValue, }
          }
        ]
    ]);
    const { req, res } = mockReqRes({});
    await handleGetPublicSettings(req, res);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ pdfLabel: testPdfValue.menuLabel } );
  });

  it("returns json with default menu label when database made an error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB fail"));
    const { req, res } = mockReqRes({});
    await handleGetPublicSettings(req, res);
    expect(res.json).toHaveBeenCalledWith({ pdfLabel: "Download Menu" });
  });
});

describe("handleGetInbox", () => {
  it("returns json with submissions if database query worked", async () => {
    const submissions = "entry";
    pool.query.mockResolvedValueOnce([submissions]);
    const { req, res } = mockReqRes({});
    await handleGetInbox(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, submissions });
  });

  it("returns 500 when database query made an error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB fail"));
    const { req, res } = mockReqRes({});
    await handleGetInbox(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Failed to load inbox" });
  });
});

describe("handleMarkRead", () => {
  it("returns json with success if the id is valid and json with invalid id error otherwise", async () => {
    const idVals = ["23", {}, "test"];
    for (let i = 0; i < 3; i++)
    {
      pool.query.mockResolvedValueOnce();
      const { req, res } = mockReqRes({ req: { params: { id: idVals[i] } } });
      await handleMarkRead(req, res);
      if (i == 0)
      {
        expect(res.json).toHaveBeenCalledWith({ success: true });
      }
      else
      {
        expect(res.json).toHaveBeenCalledWith({ success: false, error: "Invalid id" });
      }
    }
  });

  it("returns 500 when there is no params field in req", async () => {
    const reqVals = [
      { req: "" },
      { req: { value: "params" } },
      {}
    ];
    for (let i = 0; i < reqVals.length; i++)
    {
      pool.query.mockResolvedValueOnce();
      const { req, res } = mockReqRes(reqVals[i]);
      await handleMarkRead(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: "Failed to update" });
    }
  });

  it("returns 500 when database query made an error", async () => {
    pool.query.mockRejectedValueOnce();
    const { req, res } = mockReqRes({});
    handleMarkRead(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Failed to update" });
  });
});