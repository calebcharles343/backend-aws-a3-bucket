import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config(); // Ensure environment variables are loaded

// Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.BUCKET;

/*///////////////////////////////////*/
/*Upload a File*/
/*///////////////////////////////////*/
export const uploadToS3 = async (file, userId) => {
  if (!file || !file.buffer || !file.mimetype) {
    throw new Error("Invalid file object provided");
  }

  const key = `${userId}/${uuidv4()}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    // const data = await s3.send(command);
    await s3.send(command);
    return { key }; // Only return key if successful
  } catch (err) {
    return { err }; // Re-throw the error for the calling function to handle
  }
};

/*///////////////////////////////////*/
/*List Files in a Bucket*/
/*///////////////////////////////////*/
export async function getPhotoKeysByUser(userId) {
  const params = {
    Bucket: BUCKET,
    Prefix: userId,
  };

  try {
    const { Contents = [] } = await s3.send(new ListObjectsV2Command(params));
    const keys = Contents.map((photo) => photo.Key); // Extract keys from response
    return keys;
  } catch (err) {
    console.error("Error listing files:", err);
    throw err; // Throw the error to be handled by the caller
  }
}

/*///////////////////////////////////*/
/*Generate Presigned URLs*/
/*///////////////////////////////////*/
export const getUserPresignedUrls = async (userId) => {
  try {
    // Fetch keys for the user
    const photoKeys = await getPhotoKeysByUser(userId);

    if (!photoKeys || photoKeys.length === 0) {
      console.log("No photos found for user:", userId);
      return { presignedUrls: [] }; // Return empty array if no photos
    }

    // Generate both URLs and keys
    const presignedUrls = await Promise.all(
      photoKeys.map(async (key) => {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return { url, key }; // Return both URL and key as an object
      })
    );

    return { presignedUrls };
  } catch (err) {
    console.error("Error generating presigned URLs:", err);
    return { err };
  }
};

/*///////////////////////////////////*/
/*Delete a File*/
/*///////////////////////////////////*/

// Define the deleteFile function if not already defined
export async function deleteFile(userId, key) {
  const mainKey = `${userId}/${key}`;
  const params = {
    Bucket: BUCKET,
    Key: mainKey,
  };

  try {
    // Delete the object from S3
    await s3.send(new DeleteObjectCommand(params));
    return { message: "File deleted successfully" };
  } catch (err) {
    console.error("Error deleting file:", err);
    return { err };
  }
}

// Usage
// deleteFile("my-bucket-name", "my-folder/my-file.txt");
