// app/api/feedback/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Feedback from "@/model/feedback.model";

export async function POST(req) {
  try {
    console.log("🔄 Creating new feedback");
    await connectDB();
    const data = await req.json();

    // Validate required fields
    if (
      !data.courseContent ||
      !data.teachingMethods ||
      !data.campusFacilities
    ) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "All rating fields are required" },
        { status: 400 }
      );
    }

    // Create feedback object - only include the necessary fields
    const feedbackData = {
      courseContent: data.courseContent,
      teachingMethods: data.teachingMethods,
      campusFacilities: data.campusFacilities,
      comments: data.comments || "",
      isAnonymous: data.isAnonymous || false,
      status: "pending",
    };

    // Create feedback
    const feedback = await Feedback.create(feedbackData);

    console.log("✅ Feedback created successfully:", feedback._id);
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating feedback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create feedback" },
      { status: 500 }
    );
  }
}

// GET /api/feedback - Get all feedback (for admin)
export async function GET(req) {
  try {
    console.log("🔄 Fetching feedback");
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .populate("studentId", "name email");

    console.log(`✅ Found ${feedbacks.length} feedback entries`);
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("❌ Error fetching feedback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// app/api/feedback/[id]/route.js
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ Invalid feedback ID format");
      return NextResponse.json(
        { error: "Invalid feedback ID format" },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating feedback: ${id}`);
    const data = await req.json();

    // Add validation for required fields
    if (!data.response) {
      return NextResponse.json(
        { error: "Response is required" },
        { status: 400 }
      );
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        $set: {
          response: data.response,
          status: "responded",
          updatedAt: new Date(),
        },
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!feedback) {
      console.log("❌ Feedback not found");
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    console.log("✅ Feedback updated successfully");
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("❌ Error updating feedback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update feedback" },
      { status: 500 }
    );
  }
}
