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

export async function uploadToS3(buffer, key, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function listFromS3(prefix = "") {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: 500,
  });

  const response = await s3.send(command);
  const baseUrl = `https://${bucket}.s3.${region}.amazonaws.com/`;

  return (response.Contents || []).map((obj) => ({
    key: obj.Key,
    url: `${baseUrl}${obj.Key}`,
    size: obj.Size,
    lastModified: obj.LastModified,
  }));
}

export async function deleteFromS3(key) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
