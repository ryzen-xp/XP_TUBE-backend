import { publishAVideo } from "../controllers/video.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import upload from "../middlewares/multer.middleeware.js";

const router =  new Router();

router.use(verifyJWT);


router.route("/").post(upload.fields([{
  name : "videofile",
  maxCount : 1
}, {
  name : "thumbnailfile" ,
  maxCount : 1
}]),publishAVideo);




export default router ;