import { Router } from "express";
import upload from "../middlewares/multer.middleeware.js"; // Adjust based on your export
import { registerUser , loginUser, logoutUser  , ChangePassword ,ChangeProfilePhoto , getCurrentUser, ChangeCoverImage , getUserChannelProfile, UserHistory, updateUserData} from "../controllers/user.controller.js";
import { verifyJWT} from "../middlewares/Auth.middleware.js";

import { publishAVideo } from "../controllers/video.controller.js";


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
  router.route("/c/:username").get(verifyJWT , getUserChannelProfile );
  router.route("/history").get(verifyJWT , UserHistory);
  router.route("/up-userdata").post(verifyJWT , updateUserData);


  // router.route("/pub-video").post(verifyJWT , upload.)

export  default router;
