import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from './routes/user.router.js';
import videoRouter from "./routes/video.router.js";
import subscriptionRouter  from "./routes/subscription.router.js"
import playlist  from "./routes/playlist.router.js";
import CommentRouter from "./routes/comment.router.js"

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Route declarations
app.use("/api/v1/users", userRouter);

 
app.use("/api/v1/videos" , videoRouter);
app.use("/api/v1/subscriptions" , subscriptionRouter);
app.use("/api/v1/playlist" , playlist);
app.use("/api/v1/comments" , CommentRouter);

export default app;
