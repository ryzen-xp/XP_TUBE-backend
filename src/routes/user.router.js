import { Router } from "express";
import upload from "../middlewares/multer.middleeware.js"; // Adjust based on your export
import { registerUser , loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT} from "../middlewares/Auth.middleware.js";
import jwt from "jsonwebtoken";

const router = Router();

router.route("/register")
  .post(
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
  );


  router.route("/login").post( loginUser);

  router.route("/logout").post(verifyJWT ,logoutUser);

export  default router;
