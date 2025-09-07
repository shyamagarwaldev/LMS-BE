import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      index: true,
      required: [true, "Course Title is Required"],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, "Course Subtitle is Required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course Discription is Required"],
    },
    objectives: {
      type: String,
      required: [true, "Course Objective is Required"],
    },
    welcomeMessage: {
      type: String,
      required: [true, "Welcome Message is Required"],
    },
    pricing: {
      type: Number,
      required: [true, "Price is Required"],
    },
    category: {
      type: String,
      required: [true, "Course Category is Required"],
    },
    level: {
      type: String,
      required: [true, "Course Level is Required"],
    },
    primaryLanguage: {
      type: String,
      required: [true, "Course Language is Required"],
    },
    thumbnail: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoeC_2VgaUp-id_Sqlsf0lG1DfmABAF6aTBw&s",
    },
    thumbnail_s3_key: {
      type: String,
    },
    videos_id: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    instructor: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
