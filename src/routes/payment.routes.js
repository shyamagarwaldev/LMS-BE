// server/src/routes/payment.routes.js
import { Router } from "express";
import Auth from "../middlewares/auth.middlewares.js";
import {
  createOrder,
  verifyPayment,
} from "../controllers/payment.controllers.js";

const paymentRouter = Router();
paymentRouter.use(Auth);
paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/verify", verifyPayment);

export default paymentRouter;
