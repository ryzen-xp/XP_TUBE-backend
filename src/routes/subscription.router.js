import { toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels}  from "../controllers/subscription.controller.js";
  import { Router } from "express";
  import { verifyJWT } from "../middlewares/Auth.middleware.js";
  

  const router =  Router();

  router.use(verifyJWT);

  router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router ;