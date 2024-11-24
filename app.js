import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer, { memoryStorage } from "multer";
import router from "./routes/a3Router.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Create the Express app
const app = express();

// Middlewares
app.use(cors({ origin: "*" }));
app.use(json());

// Storage setup for multer
const storage = memoryStorage();
const upload = multer({ storage });

// Routes
app.use("/images", router); // Apply routes under "/images"

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
