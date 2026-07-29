// src/services/s3Service.js
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-west-1";
const bucket = process.env.S3_BUCKET || "pho-city-images-prod";

const s3 = new S3Client({ region });

function decodeObjectKey(encodedKey) {
  if (typeof encodedKey !== "string") return "";

  try {
    return decodeURIComponent(encodedKey);
  } catch {
    return encodedKey.replace(/(?:%[0-9a-fA-F]{2})+/g, (encodedRun) => {
      try {
        return decodeURIComponent(encodedRun);
      } catch {
        return encodedRun;
      }
    });
  }
}

function buildPublicUrl(key) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export async function uploadToS3(buffer, key, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return buildPublicUrl(key);
}

export async function listFromS3(prefix = "") {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: 500,
    EncodingType: "url",
  });

  const response = await s3.send(command);

  return (response.Contents || []).map((obj) => {
    const key = decodeObjectKey(obj.Key);
    return {
      key,
      url: buildPublicUrl(key),
      size: obj.Size,
      lastModified: obj.LastModified,
    };
  });
}

export async function deleteFromS3(key) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
