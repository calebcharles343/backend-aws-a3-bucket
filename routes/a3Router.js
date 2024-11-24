import express from "express";
import {
  deleteImage,
  getImages,
  postImage,
} from "../controllers/s3Controller.js";

const router = express.Router();

// Apply multer middleware only for the POST route
import multer, { memoryStorage } from "multer";
const storage = memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), postImage);
router.get("/", getImages);
router.delete("/:userId/:key", deleteImage); // Adjust route to avoid duplication

export default router;
