import { Router } from "express";
import upload from "../middlewares/multer.middleeware.js"; // Adjust based on your export
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register")
  .post(
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
  );

export { router };
