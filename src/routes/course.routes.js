import { Router } from "express";
import {
  createCourse,
  deleteCourseThumbnail,
  getStudentViewCourseDetails,
  getAllCourses,
  getAllPurchsedCourses,
  getAdminCourse,
  togglePublish,
  updateCourse,
  uploadCourseThumbnail,
} from "../controllers/course.controllers.js";
import Auth from "../middlewares/auth.middlewares.js";
export const courseRouter = Router();

courseRouter.use(Auth);
courseRouter.route("/allCourses").get(getAllCourses);
courseRouter.route("/purchasedCourses").get(getAllPurchsedCourses);
courseRouter.route("/createCourse").post(createCourse);

courseRouter.route("/getAdminCourse/:courseId").get(getAdminCourse);
courseRouter.route("/updateCourse/:courseId").put(updateCourse);
courseRouter.route("/togglePublish/:courseId").put(togglePublish);
courseRouter.route("/uploadThumbnail/:courseId").put(uploadCourseThumbnail);
courseRouter.route("/deleteThumbnail/:courseId").delete(deleteCourseThumbnail);
courseRouter
  .route("/getStudentViewCourseDetails/:courseId")
  .get(getStudentViewCourseDetails);
export default courseRouter;
