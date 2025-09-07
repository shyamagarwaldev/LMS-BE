import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
  s3Key: {
    type: String, // For S3 uploads
  },
  thumbnail: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQldv1SEwqRB3Yr6JNklf6cSiRbQC_Bk0pkaQ&s",
  },
  thumbnail_id: {
    type: String,
  },
  title: {
    type: String,
    index: true,
    required: [true, "Video Title is Required"],
    trim: true,
  },
  freePreview: {
    type: Boolean,
    default: false,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  duration: {
    type: Number,
    required: true,
  },

  notes: [{}],
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
