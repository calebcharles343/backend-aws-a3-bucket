import { deleteFile, getUserPresignedUrls, uploadToS3 } from "../model/s3.js";

/*/////////////////////////////// */
// Route to handle image upload
/*/////////////////////////////// */
export const postImage = async (req, res) => {
  const { file } = req;
  const userId = req.headers["x-user-id"];

  // Validate request
  if (!file || !userId) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    // Await the result of uploadToS3
    const { key, err } = await uploadToS3(file, userId);

    if (err) {
      console.error("Error uploading to S3:", err);
      return res.status(500).json({ err: err });
    }

    // Return success response
    res.status(200).json({
      message: "Upload successful",
      fileName: file.originalname,
      key: key,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*/////////////////////////////// */
//Get images
/*/////////////////////////////// */
export const getImages = async (req, res) => {
  const userId = req.headers["x-user-id"];

  // Validate request
  if (!userId) {
    return res.status(400).json({ message: "Bad request: Missing user ID" });
  }

  try {
    // Call getUserPresignedUrls with the userId
    const { presignedUrls, err } = await getUserPresignedUrls(userId);

    if (err) {
      console.error("Error fetching presigned URLs:", err);
      return res.status(500).json({ message: err.message });
    }

    return res.status(200).json({ urls: presignedUrls });
  } catch (err) {
    console.error("Unexpected error in /images route:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/*//////////////////////////////////////////// */
// Add an API endpoint to handle delete requests
/*//////////////////////////////////////////// */
export const deleteImage = async (req, res) => {
  const { userId, key } = req.params;

  // Validate inputs
  if (!userId || !key) {
    return res.status(400).json({ message: "Missing key" });
  }

  const { message, err } = await deleteFile(userId, key);

  if (message) {
    return res.status(200).json({ message: message });
  } else {
    return res.status(500).json({ err: err });
  }
};
