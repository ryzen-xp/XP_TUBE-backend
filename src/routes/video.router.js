import {  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus } from "../controllers/video.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import upload from "../middlewares/multer.middleeware.js";

const router =  new Router();

router.use(verifyJWT);

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videofile",
                maxCount: 1,
            },
            {
                name: "thumbnailfile",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

    router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

    router.route("/toggle/publish/:videoId").patch(togglePublishStatus);


export default router ;