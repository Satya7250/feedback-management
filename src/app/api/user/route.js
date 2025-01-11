// app/api/user/route.js
import connectDB from "@/lib/db";
import User from "@/model/user.model";
import { NextResponse } from "next/server";

export async function POST(req) {
  console.log("called");

  try {
    await connectDB();

    const data = await req.json();

    // Basic validation
    if (!data.email || !data.name || !data.dob) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate date format
    const dobDate = new Date(data.dob);
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Please use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      email: data.email,
      name: data.name,
      dob: dobDate,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          dob: user.dob,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { error: validationErrors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
