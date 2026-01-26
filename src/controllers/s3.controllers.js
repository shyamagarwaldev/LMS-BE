import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteS3Object,
  generateGetURL,
  generateUploadURL,
} from "../utils/s3.js";
import Purchase from "../models/purchase.models.js";
import Course from "../models/course.models.js";
import Video from "../models/video.models.js";
import mongoose from "mongoose";
const folderType = {
  videos: 1,
  thumbnails: 1,
  profiles: 1,
};

const generatePublicURL = (key) => {
  const bucketName = process.env.BUCKET_NAME;
  const region = process.env.REGION;
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

const isPublicFolder = (folder) => {
  return folder === "thumbnails" || folder === "profiles";
};
export const generatePUTPreSignedURL = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.info;
    const { file, folder } = req.query;
    if (!file || !folder) {
      throw new ApiError({
        message: "FileType and FolderType both is Required",
        statusCode: 400,
      });
    }
    //file -->image/jpeg
    //filetype--> jpeg
    const fileType = file.split("/")[1];
    if (!fileType) {
      throw new ApiError({
        message: "fileType is Required",
        statusCode: 400,
      });
    }
    if (!folderType.hasOwnProperty(folder)) {
      throw new ApiError({
        message: "Invalid Folder Type",
        statusCode: 400,
      });
    }

    if (role !== "admin" && folder === "videos") {
      throw new ApiError({
        message: "Unathorised upload to videos folder",
        statusCode: 401,
      });
    }
    const { uploadURL, Key: key } = await generateUploadURL(
      fileType,
      folder,
      _id,
    );
    return res.status(200).json(
      new ApiResponse({
        message: "Successfully generated pre signed url to upload",
        statusCode: 200,
        data: {
          uploadURL,
          key,
        },
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

export const generateGETVideoPreSignedURL = asyncHandler(async (req, res) => {
  try {
    const { role } = req.info;
    if (role !== "admin") {
      throw new ApiError({
        message: "Unauthorised Request (only admin)",
        statusCode: 401,
      });
    }
    const { key } = req.query;
    if (!key) {
      throw new ApiError({
        message: "S3 Key is Required",
        statusCode: 400,
      });
    }
    const getURL = await generateGetURL(key);
    if (!getURL) {
      throw new ApiError({
        message: "Unable to generate Get Pre-Signed URL",
        statusCode: 500,
      });
    }
    return res.status(200).json(
      new ApiResponse({
        message: "Successfully Generated The Get Pre-Signed URL",
        statusCode: 200,
        data: {
          getURL,
          key,
        },
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
// improve the business logic by including multiple edge cases and checkpoints for both instructor as well as user. Ensuring secure resourse access.
export const generateMultiGETVideoPreSignedURL = asyncHandler(
  async (req, res) => {
    const { role } = req.info;
    if (role !== "admin") {
      throw new ApiError({
        message: "Unauthorised Request (only admin)",
        statusCode: 401,
      });
    }

    try {
      const { videos } = req.body;
      if (!videos.length) {
        throw new ApiError({
          message: "No Videos Exist in course",
          statusCode: 404,
        });
      }
      const sigendURLs = await Promise.allSettled(
        videos.map(async (video) => {
          const getURL = await generateGetURL(video.s3Key);
          return { getURL, _id: video._id };
        }),
      );

      let url = {};

      sigendURLs.forEach((video) => {
        if (video.status === "fulfilled") {
          url[video.value._id] = video.value.getURL;
        }
      });

      return res.status(200).json(
        new ApiResponse({
          message: "successfully got all the pre-signed urls.",
          statusCode: 200,
          data: url,
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
  },
);

export const deleteS3Items = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.info;
    const { key } = req.query;

    if (!key) {
      throw new ApiError({
        message: "S3 Key is Required",
        statusCode: 400,
      });
    }

    const keyParts = key.split("/");
    if (keyParts.length < 2) {
      throw new ApiError({
        message: "Invalid S3 Key format",
        statusCode: 400,
      });
    }

    const folderName = keyParts[0];
    const fileName = keyParts[1];

    if (!folderType.hasOwnProperty(folderName)) {
      throw new ApiError({
        message: "Invalid folder type in S3 key",
        statusCode: 400,
      });
    } else if (role === "user" || role === "student") {
      if (folderName !== "profiles") {
        throw new ApiError({
          message: "Unauthorized: Users can only delete profile images",
          statusCode: 403,
        });
      }
    }
    if (!fileName.startsWith(_id + "_")) {
      throw new ApiError({
        message: "Unauthorized: You can only delete your own profile image",
        statusCode: 403,
      });
    }
    const result = await deleteS3Object(key);
    if (!result) {
      throw new ApiError({
        message: "Unable to Delete S3 Object Try again",
        statusCode: 500,
      });
    }

    return res
      .json(
        new ApiResponse({
          message: `Successfully Deleted S3 Object from ${folderName}`,
          statusCode: 204,
        }),
      )
      .status(204);
  } catch (error) {
    return res.status(error.statusCode || error.http_code || 500).json(
      new ApiResponse({
        message: error.message,
        statusCode: error.statusCode || error.http_code || 500,
      }),
    );
  }
});

export const getFreePreviewVideoURLs = asyncHandler(async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    if (!courseId) {
      throw new ApiError({
        message: "Course ID is required",
        statusCode: 400,
      });
    }

    if (!videoId) {
      throw new ApiError({
        message: "Video ID is required",
        statusCode: 400,
      });
    }

    // Get video with freePreview flag
    const video = await Video.findOne({
      _id: new mongoose.Types.ObjectId(videoId),
      freePreview: true,
    }).select("_id s3Key");

    if (!video) {
      throw new ApiError({
        message: "Free preview video not found",
        statusCode: 404,
      });
    }

    // Generate pre-signed URL
    const getURL = await generateGetURL(video.s3Key);

    return res.status(200).json(
      new ApiResponse({
        message: "Successfully generated free preview video URL",
        statusCode: 200,
        data: { url: getURL },
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
export const getPublicURL = asyncHandler(async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      throw new ApiError({
        message: "S3 Key is Required",
        statusCode: 400,
      });
    }

    const keyParts = key.split("/");
    const folderName = keyParts[0];

    if (!folderType.hasOwnProperty(folderName)) {
      throw new ApiError({
        message: "Invalid folder type in S3 key",
        statusCode: 400,
      });
    }

    if (!isPublicFolder(folderName)) {
      throw new ApiError({
        message: `Folder '${folderName}' does not allow public access. Use pre-signed URLs instead.`,
        statusCode: 403,
      });
    }

    const publicURL = generatePublicURL(key);

    return res.status(200).json(
      new ApiResponse({
        message: "Successfully generated public URL",
        statusCode: 200,
        data: {
          publicURL,
          key,
        },
      }),
    );
  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new ApiResponse({
        message: error.message || "Internal server error",
        statusCode: error.statusCode || 500,
      }),
    );
  }
});

export const getStudentVideoURLs = asyncHandler(async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const { _id } = req.info;

    if (!courseId) {
      throw new ApiError({
        message: "Course ID is required",
        statusCode: 400,
      });
    }

    if (!videoId) {
      throw new ApiError({
        message: "Video ID is required",
        statusCode: 400,
      });
    }

    // Verify the student has purchased the course
    const purchase = await Purchase.findOne({
      student_id: new mongoose.Types.ObjectId(_id),
      course_id: new mongoose.Types.ObjectId(courseId),
    });

    if (!purchase) {
      throw new ApiError({
        message: "You must purchase the course to access videos",
        statusCode: 403,
      });
    }

    // Get the course to verify video belongs to it
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError({
        message: "Course not found",
        statusCode: 404,
      });
    }

    // Verify video belongs to this course
    const videoObjectId = new mongoose.Types.ObjectId(videoId);
    const isVideoInCourse = course.videos_id.some(
      (courseVideoId) => courseVideoId.toString() === videoObjectId.toString(),
    );

    if (!isVideoInCourse) {
      throw new ApiError({
        message: "Video not found in this course",
        statusCode: 404,
      });
    }

    // Get video
    const video = await Video.findById(videoObjectId).select("_id s3Key");

    if (!video) {
      throw new ApiError({
        message: "Video not found",
        statusCode: 404,
      });
    }

    if (!video.s3Key) {
      throw new ApiError({
        message: "Video does not have an s3Key",
        statusCode: 500,
      });
    }

    // Generate pre-signed URL
    const getURL = await generateGetURL(video.s3Key);

    return res.status(200).json(
      new ApiResponse({
        message: "Successfully generated video URL",
        statusCode: 200,
        data: { url: getURL },
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
