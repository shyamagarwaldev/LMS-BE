import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
    methods: ["GET", "DELETE", "PUT", "POST"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use("/static", express.static("public"));

import userRouter from "./routes/user.routes.js";
import courseRouter from "./routes/course.routes.js";
import videoRouter from "./routes/video.routes.js";
import s3Router from "./routes/s3.routes.js";
import paymentRouter from "./routes/payment.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/s3", s3Router);
app.use("/api/v1/payment", paymentRouter);
export default app;
