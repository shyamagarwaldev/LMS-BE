import { Router } from "express";
import {
  generatePUTPreSignedURL,
  generateGETVideoPreSignedURL,
  generateMultiGETVideoPreSignedURL,
  deleteS3Items,
  getPublicURL,
  getStudentVideoURLs,
  getFreePreviewVideoURLs,
} from "../controllers/s3.controllers.js";
import Auth from "../middlewares/auth.middlewares.js";

const s3Router = Router();

s3Router.route("/upload-url").get(Auth, generatePUTPreSignedURL);
s3Router.route("/get-url").get(Auth, generateGETVideoPreSignedURL);
s3Router.route("/public-url").get(Auth, getPublicURL);
s3Router.route("/multi-get-url").post(Auth, generateMultiGETVideoPreSignedURL);
s3Router.route("/delete").delete(Auth, deleteS3Items);
s3Router.route("/student-video-urls/:courseId/:videoId").get(Auth, getStudentVideoURLs);
s3Router.route("/free-preview-urls/:courseId/:videoId").get(getFreePreviewVideoURLs);

export default s3Router;
