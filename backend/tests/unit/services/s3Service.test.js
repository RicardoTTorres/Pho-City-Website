import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => {
  process.env.AWS_REGION = "us-west-1";
  process.env.S3_BUCKET = "test-media-bucket";
  return { sendMock: vi.fn() };
});

vi.mock("@aws-sdk/client-s3", () => {
  class MockCommand {
    constructor(input) {
      this.input = input;
    }
  }

  return {
    S3Client: class {
      send(command) {
        return sendMock(command);
      }
    },
    PutObjectCommand: MockCommand,
    ListObjectsV2Command: MockCommand,
    DeleteObjectCommand: MockCommand,
  };
});

import { deleteFromS3, listFromS3 } from "../../../src/services/s3Service.js";

const baseUrl = "https://test-media-bucket.s3.us-west-1.amazonaws.com/";

beforeEach(() => {
  sendMock.mockReset();
});

describe("listFromS3", () => {
  it("requests URL encoding and returns normal keys unchanged", async () => {
    sendMock.mockResolvedValueOnce({
      Contents: [
        {
          Key: "menu/pho.jpg",
          Size: 123,
          LastModified: new Date("2026-01-01"),
        },
      ],
    });

    const items = await listFromS3("menu/");

    expect(sendMock.mock.calls[0][0].input).toEqual({
      Bucket: "test-media-bucket",
      Prefix: "menu/",
      MaxKeys: 500,
      EncodingType: "url",
    });
    expect(items).toEqual([
      {
        key: "menu/pho.jpg",
        url: `${baseUrl}menu/pho.jpg`,
        size: 123,
        lastModified: new Date("2026-01-01"),
      },
    ]);
  });

  it("decodes spaces and non-ASCII keys and safely encodes the public URL", async () => {
    sendMock.mockResolvedValueOnce({
      Contents: [
        {
          Key: "about/Ph%E1%BB%9F%20City%20%231%25.jpg",
        },
      ],
    });

    const [item] = await listFromS3();

    expect(item.key).toBe("about/Phở City #1%.jpg");
    expect(item.url).toBe(
      `${baseUrl}about/Ph%E1%BB%9F%20City%20%231%25.jpg`,
    );
  });

  it("decodes an encoded carriage return and preserves it for deletion", async () => {
    sendMock
      .mockResolvedValueOnce({
        Contents: [{ Key: "menu/line%0Dbreak.jpg" }],
      })
      .mockResolvedValueOnce({});

    const [item] = await listFromS3();
    await deleteFromS3(item.key);

    expect(item.key).toBe("menu/line\rbreak.jpg");
    expect(item.url).toBe(`${baseUrl}menu/line%0Dbreak.jpg`);
    expect(sendMock.mock.calls[1][0].input).toEqual({
      Bucket: "test-media-bucket",
      Key: "menu/line\rbreak.jpg",
    });
  });

  it("handles malformed percent encoding without failing the listing", async () => {
    sendMock.mockResolvedValueOnce({
      Contents: [{ Key: "brand/bad%ZZ%20name.jpg" }],
    });

    await expect(listFromS3()).resolves.toEqual([
      {
        key: "brand/bad%ZZ name.jpg",
        url: `${baseUrl}brand/bad%25ZZ%20name.jpg`,
        size: undefined,
        lastModified: undefined,
      },
    ]);
  });
});
