import { Router } from "express";
import {
  createCourse,
  deleteCourseThumbnail,
  getAllCourses,
  getAllPurchsedCourses,
  getCourse,
  togglePublish,
  updateCourse,
  uploadCourseThumbnail,
} from "../controllers/course.controllers.js";
import Auth from "../middlewares/auth.middlewares.js";
import upload from "../middlewares/multer.middlewares.js";
export const courseRouter = Router();

courseRouter.use(Auth);
courseRouter.route("/allCourses").get(getAllCourses);
courseRouter.route("/purchasedCourses").get(getAllPurchsedCourses);
courseRouter.route("/createCourse").post(createCourse);

courseRouter.route("/getCourse/:courseId").get(getCourse);
courseRouter.route("/updateCourse/:courseId").put(updateCourse);
courseRouter.route("/togglePublish/:courseId").put(togglePublish);
courseRouter.route("/uploadThumbnail/:courseId").put(uploadCourseThumbnail);
courseRouter.route("/deleteThumbnail/:courseId").delete(deleteCourseThumbnail);

export default courseRouter;
