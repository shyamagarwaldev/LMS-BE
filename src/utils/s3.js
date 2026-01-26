import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import ApiError from "./ApiError.js";

const region = process.env.REGION;
const Bucket = process.env.BUCKET_NAME;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_KEY;

if (!region || !Bucket || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing required AWS S3 environment variables");
}
// this this the client on On whose behalf we are generating the pre-signed URLs. Since this user has access to my S3 bucket. this is a IAM user with name lms
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
const contentTypes = {
  // Images
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",

  // Videos
  mp4: "video/mp4",
  avi: "video/x-msvideo",
  mov: "video/quicktime",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
  webm: "video/webm",

  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function getContentType(fileType) {
  return contentTypes[fileType.toLowerCase()] || "application/octet-stream";
}

export async function generateUploadURL(fileType, folder, id) {
  try {
    if (!contentTypes[fileType]) {
      throw new ApiError({
        statusCode: 400,
        message: "Valid file type is required",
      });
    }

    // path where it is going to be uploaded
    const Key = `${folder}/${id}_${randomUUID()}.${fileType}`;

    const command = new PutObjectCommand({
      Bucket,
      Key,
      ContentType: getContentType(fileType),
    });

    const uploadURL = await getSignedUrl(s3Client, command, {
      expiresIn: 600, // 10 minutes
    });
    return { uploadURL, Key };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    throw new ApiError({
      statusCode: 500,
      message: "Failed to generate upload URL",
    });
  }
}

export async function generateGetURL(Key) {
  try {
    if (!Key || typeof Key !== "string") {
      throw new ApiError({
        statusCode: 400,
        message: "Valid S3 key is required",
      });
    }
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });
    const getURL = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    return getURL;
  } catch (error) {
    console.error("Error generating get URL:", error);
    throw new ApiError({
      statusCode: 500,
      message: "Failed to generate download URL",
    });
  }
}

export async function deleteS3Object(Key) {
  try {
    if (!Key || typeof Key !== "string") {
      throw new ApiError({
        statusCode: 400,
        message: "Valid S3 key is required",
      });
    }

    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });

    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    console.error("Error deleting S3 object:", error);
    throw new ApiError({
      statusCode: 500,
      message: "Failed to delete file from S3",
    });
  }
}
