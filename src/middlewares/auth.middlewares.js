import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export default function Auth(req, res, next) {
  try {
    const token =
      req.cookies.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token)
      throw new ApiError({ statusCode: 403, message: "Access Token Required" });
    let verifiedToken;
    try {
      verifiedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new ApiError({ statusCode: 401, message: "Invalid Access Token" });
    }
    req.info = verifiedToken;
    next();
  } catch (error) {
    return res.status(error.statusCode || error.http_code || 500).json(
      new ApiResponse({
        statusCode: error.statusCode || error.http_code || 500,
        message: error.message,
      }),
    );
  }
}
