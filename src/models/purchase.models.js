import mongoose, { mongo, Schema } from "mongoose";

const purchaseSchema = new Schema({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  course_id: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  price_paid: {
    type: Number,
    required: true,
  },
  access_status: {
    type: String,
    enum: ["active", "suspended", "expired"],
    default: "active",
    required: true,
  },
  videos_completed_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  last_watched_video_id: {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
