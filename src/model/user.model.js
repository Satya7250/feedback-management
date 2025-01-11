// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minLength: [2, "Name must be at least 2 characters long"],
    maxLength: [50, "Name cannot be more than 50 characters"],
  },
  dob: {
    type: Date,
    required: [true, "Date of birth is required"],
    validate: {
      validator: function (value) {
        return value <= new Date();
      },
      message: "Date of birth cannot be in the future",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Prevent duplicate model creation error in development with hot reloading
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
