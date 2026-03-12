import {describe, it, expect, vi, beforeEach} from "vitest";
import {getAbout, updateAbout} from "../../../src/controllers/aboutController.js";
import { pool } from "../../../src/db/connect_db.js";
import { logActivity } from "../../../src/controllers/activityController.js";

vi.mock("../../../src/db/connect_db.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock("../../../src/controllers/activityController.js", () => ({
  logActivity: vi.fn(),
}));

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

describe("getAbout", () => {
    it("returns database information for the about us section", async () =>{
        pool.query.mockResolvedValueOnce([
            [
                {
                        hero_title: "About Pho City",
                        hero_intro: "Welcome to Pho City!",
                        hero_image_url: "img.jpg",
                        beginning_title: "How It All Began",
                        beginning_body: "Pho City was founded with a simple mission.",
                        beginning_image_url: null,
                        food_title: "Our Food",
                        food_body: "Every dish on our menu is good.",
                        food_image_url: null,
                        commitment_title: "Our Commitment",
                        commitment_body: "We celebrate culture, inclusivity, and community",
                        commitment_image_url: null,
                        closing_text: "",
                        preview_heading: "Our Story",
                        preview_body: "For more than 10 years",
                        preview_button_label: "Learn More",
                },
            ],
        ]);

        const { req, res } = mockReqRes();
        await getAbout(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
                about: {
                        heroTitle: "About Pho City",
                        heroIntro: "Welcome to Pho City!",
                        heroImage: "img.jpg",
                        beginningTitle: "How It All Began",
                        beginningBody: "Pho City was founded with a simple mission.",
                        beginningImage: null,
                        foodTitle: "Our Food",
                        foodBody: "Every dish on our menu is good.",
                        foodImage: null,
                        commitmentTitle: "Our Commitment",
                        commitmentBody: "We celebrate culture, inclusivity, and community",
                        commitmentImage: null,
                        closingText: "",
                        previewHeading: "Our Story",
                        previewBody: "For more than 10 years",
                        previewButtonLabel: "Learn More",
                    }
        });
    });

    it("returns 500 on db error", async () => {
        pool.query.mockRejectedValueOnce(new Error("DB fail"));

        const { req, res } = mockReqRes();
        await getAbout(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error"});

    });
});

describe("updateAbout", () => {
    it("returns 400 for missing hero title", async () => {
        const {req, res} = mockReqRes({
            body: {
                heroTitle: null,
                heroIntro: "Welcome to Pho City!",
                heroImage: "img.jpg",
                beginningTitle: "How It All Began",
                beginningBody: "Pho City was founded with a simple mission.",
                foodTitle: "Our Food",
                foodBody: "Every dish on our menu is good.",
                commitmentTitle: "Our Commitment",
                commitmentBody: "We celebrate culture, inclusivity, and community",
                closingText: "",
                previewHeading: "Our Story",
                previewBody: "For more than 10 years",
                previewButtonLabel: "Learn More",
            }
        });

        await updateAbout(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Hero title is required." });
    });

    it("returns 200 on successful update and logs activity", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1}]);

        const {req, res} = mockReqRes({
            body: {
                heroTitle: "New Hero Title",
                heroIntro: "New Welcome to Pho City!",
                heroImage: "img.jpg",
                beginningTitle: "New How It All Began",
                beginningBody: "New Pho City was founded with a simple mission.",
                foodTitle: "New Our Food",
                foodBody: "New Every dish on our menu is good.",
                commitmentTitle: "New Our Commitment",
                commitmentBody: "New We celebrate culture, inclusivity, and community",
                closingText: "",
                previewHeading: "New Our Story",
                previewBody: "New For more than 10 years",
                previewButtonLabel: "New Learn More",
            },
        });

        await updateAbout(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "About section updated successfully!" });

        expect(logActivity).toHaveBeenCalledWith(
            "updated", 
            "about", 
            "Updated about section", 
            "admin@test.com",
        );
    });

    it ("returns 500 on db error", async () =>  {
        pool.query.mockRejectedValueOnce(new Error("DB fail"));

        const {req, res} = mockReqRes({
            body: {
                heroTitle: "New Hero Title",
                heroIntro: "New Welcome to Pho City!",
                heroImage: "img.jpg",
                beginningTitle: "New How It All Began",
                beginningBody: "New Pho City was founded with a simple mission.",
                foodTitle: "New Our Food",
                foodBody: "New Every dish on our menu is good.",
                commitmentTitle: "New Our Commitment",
                commitmentBody: "New We celebrate culture, inclusivity, and community",
                closingText: "",
                previewHeading: "New Our Story",
                previewBody: "New For more than 10 years",
                previewButtonLabel: "New Learn More",
            },
        });

        await updateAbout(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({message: "Internal Server Error"});
    });
});