import { NextResponse } from "next/server";
// import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Feedback from "@/model/feedback.model";

export async function PUT(request, { params }) {
  console.log("PUT request received", { params });

  try {
    // Connect to database
    await connectDB();
    const { id } = params;

    // Log the incoming request
    console.log("Processing feedback update:", id);
    const body = await request.json();
    console.log("Request body:", body);

    // Validate ID
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return NextResponse.json(
    //     { error: "Invalid feedback ID format" },
    //     { status: 400 }
    //   );
    // }

    // Update feedback
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        response: body.response,
        status: "responded",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}
