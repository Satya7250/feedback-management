// app/api/login/route.js
import connectDB from "@/lib/db";
import User from "@/model/user.model";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("🔄 Login attempt initiated");
    await connectDB();

    const data = await req.json();
    console.log("📝 Received login data:", { email: data.email });

    // Validate required fields
    if (!data.email || !data.dob) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Email and date of birth are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: data.email });
    console.log("🔍 User search result:", user ? "Found" : "Not found");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Verify date of birth
    const inputDob = new Date(data.dob);
    const userDob = new Date(user.dob);

    const doMatch =
      inputDob.getFullYear() === userDob.getFullYear() &&
      inputDob.getMonth() === userDob.getMonth() &&
      inputDob.getDate() === userDob.getDate();

    console.log("🔐 DOB verification:", doMatch ? "Matched" : "Not matched");

    if (!doMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Successful login
    console.log("✅ Login successful for:", user.email);
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
