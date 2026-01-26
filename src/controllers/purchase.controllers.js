import Course from "../models/course.models.js";
import Purchase from "../models/purchase.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      throw new ApiError({
        message: "course id is required",
        statusCode: 400,
      });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError({
        statusCode: 404,
        message: "Course not found",
      });
    }
    const amaountInPaise = Math.round(Number(course.pricing) * 100);
    const options = {
      amount: amaountInPaise,
      currency: "INR",
      receipt: `${crypto.randomUUID()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      throw new ApiError({
        message: "unable to create order",
        status: 500,
      });
    }

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        data: { order, course },
        message: "Order created",
      }),
    );
  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new ApiResponse({
        message: error.message || error.error.description,
        statusCode: error.statusCode || 500,
      }),
    );
  }
});

export const verifyPayment = asyncHandler(async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      price_paid,
      courseId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courseId
    ) {
      throw new ApiError({
        message: "Missing payment fields",
        statusCode: 400,
      });
    }
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new ApiError(400, "Invalid signature");
    }

    await Purchase.create({
      student_id: req.info._id,
      course_id: courseId,
      paymentId: razorpay_payment_id,
      price_paid,
    });
    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Payment Verified",
      }),
    );
  } catch (error) {
    return res
      .json(
        new ApiResponse({
          message: error.message,
          statusCode: error.statusCode || error.http_code || 500,
        }),
      )
      .status(error.statusCode || error.http_code || 500);
  }
});

export const markVideoComplete = asyncHandler(async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const { _id } = req.info;

    if (!courseId || !videoId) {
      throw new ApiError({
        message: "Course ID and Video ID are required",
        statusCode: 400,
      });
    }

    // Find the purchase for this student and course
    const purchase = await Purchase.findOne({
      student_id: new mongoose.Types.ObjectId(_id),
      course_id: new mongoose.Types.ObjectId(courseId),
    });

    if (!purchase) {
      throw new ApiError({
        message: "Purchase not found. You must purchase the course first.",
        statusCode: 404,
      });
    }

    // Update the purchase: add video to completed list (using $addToSet to avoid duplicates)
    // and update last_watched_video_id
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      purchase._id,
      {
        $addToSet: {
          videos_completed_ids: new mongoose.Types.ObjectId(videoId),
        },
      },
      { new: true },
    );

    if (!updatedPurchase) {
      throw new ApiError({
        message: "Unable to update video completion status",
        statusCode: 500,
      });
    }

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Video marked as completed successfully",
        data: {
          videos_completed_count: updatedPurchase.videos_completed_ids.length,
        },
      }),
    );
  } catch (error) {
    return res.status(error.statusCode || error.http_code || 500).json(
      new ApiResponse({
        message: error.message,
        statusCode: error.statusCode || error.http_code || 500,
      }),
    );
  }
});

export const updateLastWatched = asyncHandler(async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const { _id } = req.info;

    if (!courseId || !videoId) {
      throw new ApiError({
        message: "Course ID and Video ID are required",
        statusCode: 400,
      });
    }

    // Find the purchase for this student and course
    const purchase = await Purchase.findOne({
      student_id: new mongoose.Types.ObjectId(_id),
      course_id: new mongoose.Types.ObjectId(courseId),
    });

    if (!purchase) {
      throw new ApiError({
        message: "Purchase not found. You must purchase the course first.",
        statusCode: 404,
      });
    }

    // Update the purchase: add video to completed list (using $addToSet to avoid duplicates)
    // and update last_watched_video_id
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      purchase._id,
      {
        $set: { last_watched_video_id: new mongoose.Types.ObjectId(videoId) },
      },
      { new: true },
    );

    if (!updatedPurchase) {
      throw new ApiError({
        message: "Unable to update last watched video",
        statusCode: 500,
      });
    }

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Video marked as Last Watched Video",
        data: {
          videoId,
        },
      }),
    );
  } catch (error) {
    return res.status(error.statusCode || error.http_code || 500).json(
      new ApiResponse({
        message: error.message,
        statusCode: error.statusCode || error.http_code || 500,
      }),
    );
  }
});
