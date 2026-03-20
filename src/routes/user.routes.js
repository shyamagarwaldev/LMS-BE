import { Router } from "express";

import Auth from "../middlewares/auth.middlewares.js";
import {
  getAllAdminCourses,
  getUser,
  logout,
  refreshAccessToken,
  signin,
  signup,
} from "../controllers/user.controllers.js";
const userRouter = Router();

userRouter.route("/signup").post(signup);
userRouter.route("/signin").post(signin);
userRouter.route("/refreshAccessToken").get(refreshAccessToken);

userRouter.use(Auth);

userRouter.route("/getUser").get(getUser);

userRouter.route("/logout").post(logout);
// userRouter.route("/studentAllCourses").get(getAllStudentCourses);
userRouter.route("/getAllAdminCourses").get(getAllAdminCourses);
export default userRouter;
