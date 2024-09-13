import { Router } from "express";
import upload from "../middlewares/multer.middleeware.js"; // Adjust based on your export
import { registerUser , loginUser, logoutUser  , ChangePassword ,ChangeProfilePhoto , getCurrentUser, ChangeCoverImage ,up} from "../controllers/user.controller.js";
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
  router.route("/ch-password").post(verifyJWT  , ChangePassword);
  router.route("/ch-avatar").patch(verifyJWT ,upload.single("avatar"),ChangeProfilePhoto);
  router.route("/profile").get(getCurrentUser);
  router.route("/ch-cover-img").patch(verifyJWT ,upload.single("coverImage") , ChangeCoverImage);

export  default router;
