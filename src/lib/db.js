// lib/db.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ No MONGODB_URI found in .env");
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

let cached = global.mongoose;

if (!cached) {
  console.log("📦 Initializing mongoose cache");
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  try {
    if (cached.conn) {
      console.log("✅ Using cached MongoDB connection");
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      console.log("🔄 Connecting to MongoDB...");
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log("✅ Successfully connected to MongoDB");
        return mongoose;
      });
    } else {
      console.log("⏳ Existing connection promise found, waiting...");
    }

    cached.conn = await cached.promise;
    console.log(`📡 MongoDB Connected: ${mongoose.connection.host}`);

    // Add connection event listeners
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("❗ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    return cached.conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export default connectDB;
