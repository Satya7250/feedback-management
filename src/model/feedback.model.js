// model/feedback.model.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    courseContent: {
      type: String,
      required: true,
    },
    teachingMethods: {
      type: String,
      required: true,
    },
    campusFacilities: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
      default: "",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    studentId: {
      type: String, // Changed from ObjectId to String
      default: "anonymous", // Provide a default value
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "archived"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Delete existing model if it exists to prevent the OverwriteModelError
mongoose.models = {};

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
