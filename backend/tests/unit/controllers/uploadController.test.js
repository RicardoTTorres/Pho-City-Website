import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleUpload,
  handleList,
  handleDelete,
} from "../../../src/controllers/uploadController.js";

vi.mock("../../../src/services/s3Service.js", () => ({
  uploadToS3: vi.fn(),
  listFromS3: vi.fn(),
  deleteFromS3: vi.fn(),
}));

import {
  uploadToS3,
  listFromS3,
  deleteFromS3,
} from "../../../src/services/s3Service.js";

function mockReqRes({ body = {}, query = {}, file = undefined } = {}) {
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
  };
  const req = { body, query, file };
  return { req, res };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("handleUpload", () => {
  const validFile = {
    originalname: "pho.jpg",
    mimetype: "image/jpeg",
    size: 1024 * 1024, // 1 MB
    buffer: Buffer.from("fake-image"),
  };

  it("returns 400 when section is missing", async () => {
    const { req, res } = mockReqRes({ query: {}, file: validFile });
    await handleUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "section must be one of: menu, hero, about, brand",
    });
    expect(uploadToS3).not.toHaveBeenCalled();
  });

  it("returns 400 when section is invalid", async () => {
    const { req, res } = mockReqRes({
      query: { section: "invalid" },
      file: validFile,
    });
    await handleUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "section must be one of: menu, hero, about, brand",
    });
  });

  it("returns 400 when no file provided", async () => {
    const { req, res } = mockReqRes({ query: { section: "hero" } });
    await handleUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No file provided" });
  });

  it("returns 400 when file type is not allowed", async () => {
    const { req, res } = mockReqRes({
      query: { section: "hero" },
      file: { ...validFile, mimetype: "image/gif" },
    });
    await handleUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "File type not allowed. Accepted: jpeg, png, webp",
    });
  });

  it("returns 400 when file exceeds 5 MB", async () => {
    const { req, res } = mockReqRes({
      query: { section: "hero" },
      file: { ...validFile, size: 6 * 1024 * 1024 },
    });
    await handleUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "File too large. Maximum size is 5 MB",
    });
  });

  it("returns url on successful upload", async () => {
    const fakeUrl =
      "https://pho-city-images-prod.s3.us-west-1.amazonaws.com/hero/123-pho.jpg";
    uploadToS3.mockResolvedValueOnce(fakeUrl);

    const { req, res } = mockReqRes({
      query: { section: "hero" },
      file: validFile,
    });
    await handleUpload(req, res);

    expect(uploadToS3).toHaveBeenCalledWith(
      validFile.buffer,
      expect.stringMatching(/^hero\/\d+-pho\.jpg$/),
      "image/jpeg",
    );
    expect(res.json).toHaveBeenCalledWith({ url: fakeUrl });
  });

  it("sanitizes the filename before building the S3 key", async () => {
    uploadToS3.mockResolvedValueOnce("https://example.com/key");

    const { req, res } = mockReqRes({
      query: { section: "menu" },
      file: { ...validFile, originalname: "My Photo (1).jpg" },
    });
    await handleUpload(req, res);

    const [, key] = uploadToS3.mock.calls[0];
    expect(key).toMatch(/^menu\/\d+-my_photo__1_\.jpg$/);
  });

  it("accepts all allowed sections", async () => {
    for (const section of ["menu", "hero", "about", "brand"]) {
      uploadToS3.mockResolvedValueOnce("https://example.com/url");
      const { req, res } = mockReqRes({
        query: { section },
        file: validFile,
      });
      await handleUpload(req, res);
      expect(res.json).toHaveBeenCalledWith({ url: "https://example.com/url" });
      vi.clearAllMocks();
      vi.spyOn(console, "error").mockImplementation(() => {});
    }
  });

  it("accepts all allowed MIME types", async () => {
    for (const mimetype of ["image/jpeg", "image/png", "image/webp"]) {
      uploadToS3.mockResolvedValueOnce("https://example.com/url");
      const { req, res } = mockReqRes({
        query: { section: "hero" },
        file: { ...validFile, mimetype },
      });
      await handleUpload(req, res);
      expect(res.json).toHaveBeenCalledWith({ url: "https://example.com/url" });
      vi.clearAllMocks();
      vi.spyOn(console, "error").mockImplementation(() => {});
    }
  });

  it("returns 500 on s3 error", async () => {
    uploadToS3.mockRejectedValueOnce(new Error("S3 fail"));

    const { req, res } = mockReqRes({
      query: { section: "hero" },
      file: validFile,
    });
    await handleUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Upload failed" });
  });
});

describe("handleList", () => {
  const fakeItems = [
    {
      key: "hero/123-pho.jpg",
      url: "https://pho-city-images-prod.s3.us-west-1.amazonaws.com/hero/123-pho.jpg",
      size: 1024,
      lastModified: new Date("2024-01-01"),
    },
  ];

  it("lists all items when no section provided", async () => {
    listFromS3.mockResolvedValueOnce(fakeItems);

    const { req, res } = mockReqRes({ query: {} });
    await handleList(req, res);

    expect(listFromS3).toHaveBeenCalledWith("");
    expect(res.json).toHaveBeenCalledWith({ items: fakeItems });
  });

  it("lists items filtered by valid section", async () => {
    listFromS3.mockResolvedValueOnce(fakeItems);

    const { req, res } = mockReqRes({ query: { section: "hero" } });
    await handleList(req, res);

    expect(listFromS3).toHaveBeenCalledWith("hero/");
    expect(res.json).toHaveBeenCalledWith({ items: fakeItems });
  });

  it("falls back to empty prefix for invalid section", async () => {
    listFromS3.mockResolvedValueOnce([]);

    const { req, res } = mockReqRes({ query: { section: "invalid" } });
    await handleList(req, res);

    expect(listFromS3).toHaveBeenCalledWith("");
    expect(res.json).toHaveBeenCalledWith({ items: [] });
  });

  it("returns 500 on s3 error", async () => {
    listFromS3.mockRejectedValueOnce(new Error("S3 fail"));

    const { req, res } = mockReqRes({ query: { section: "hero" } });
    await handleList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to list media" });
  });
});

describe("handleDelete", () => {
  it("returns 400 when key is missing", async () => {
    const { req, res } = mockReqRes({ body: {} });
    await handleDelete(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "key is required" });
    expect(deleteFromS3).not.toHaveBeenCalled();
  });

  it("returns 400 when key is not a string", async () => {
    const { req, res } = mockReqRes({ body: { key: 123 } });
    await handleDelete(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "key is required" });
  });

  it("returns 400 when key has an invalid section prefix", async () => {
    const { req, res } = mockReqRes({ body: { key: "uploads/photo.jpg" } });
    await handleDelete(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid key" });
    expect(deleteFromS3).not.toHaveBeenCalled();
  });

  it("deletes successfully with a valid key", async () => {
    deleteFromS3.mockResolvedValueOnce(undefined);

    const { req, res } = mockReqRes({ body: { key: "hero/123-pho.jpg" } });
    await handleDelete(req, res);

    expect(deleteFromS3).toHaveBeenCalledWith("hero/123-pho.jpg");
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("accepts all allowed section prefixes", async () => {
    for (const section of ["menu", "hero", "about", "brand"]) {
      deleteFromS3.mockResolvedValueOnce(undefined);
      const { req, res } = mockReqRes({ body: { key: `${section}/file.jpg` } });
      await handleDelete(req, res);
      expect(res.json).toHaveBeenCalledWith({ ok: true });
      vi.clearAllMocks();
      vi.spyOn(console, "error").mockImplementation(() => {});
    }
  });

  it("returns 500 on s3 error", async () => {
    deleteFromS3.mockRejectedValueOnce(new Error("S3 fail"));

    const { req, res } = mockReqRes({ body: { key: "hero/123-pho.jpg" } });
    await handleDelete(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete media" });
  });
});
