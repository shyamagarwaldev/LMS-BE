// server/src/routes/payment.routes.js
import { Router } from "express";
import Auth from "../middlewares/auth.middlewares.js";
import {
  createOrder,
  verifyPayment,
  markVideoComplete,
  updateLastWatched,
} from "../controllers/purchase.controllers.js";

const purchaseRouter = Router();
purchaseRouter.use(Auth);
purchaseRouter.post("/create-order", createOrder);
purchaseRouter.post("/verify", verifyPayment);
purchaseRouter.put("/markVideoComplete/:courseId/:videoId", markVideoComplete);
purchaseRouter.put("/last-watched/:courseId/:videoId", updateLastWatched);

export default purchaseRouter;
