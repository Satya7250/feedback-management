"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Feedback() {
  const [formData, setFormData] = useState({
    courseContent: "",
    teachingMethods: "",
    campusFacilities: "",
    comments: "",
    isAnonymous: false, // Added back but optional
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (
        !formData.courseContent ||
        !formData.teachingMethods ||
        !formData.campusFacilities
      ) {
        toast.error("Please fill in all rating fields", {
          position: "top-center",
        });
        return;
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setFormData({
        courseContent: "",
        teachingMethods: "",
        campusFacilities: "",
        comments: "",
        isAnonymous: false,
      });

      toast.success("Feedback submitted successfully!", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#4CAF50",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to submit feedback", {
        duration: 4000,
        position: "top-center",
      });
    }
  };

  const ratingOptions = [
    { value: "1", label: "Poor" },
    { value: "2", label: "Fair" },
    { value: "3", label: "Good" },
    { value: "4", label: "Very Good" },
    { value: "5", label: "Excellent" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "#4CAF50",
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: "#E57373",
            },
          },
        }}
      />
      <div className="max-w-2xl mx-auto justify-center">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
            <h1 className="text-2xl font-bold text-white text-center">
              Student Feedback Form
            </h1>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Course Content Rating */}
            <div>
              <label
                htmlFor="course-content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                How would you rate the quality and relevance of the course
                content?
              </label>
              <select
                id="course-content"
                value={formData.courseContent}
                onChange={(e) =>
                  handleInputChange("courseContent", e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700 text-sm"
              >
                <option value="">Select a rating</option>
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Teaching Methods Rating */}
            <div>
              <label
                htmlFor="teaching-methods"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                How effective were the teaching methods used in the course?
              </label>
              <select
                id="teaching-methods"
                value={formData.teachingMethods}
                onChange={(e) =>
                  handleInputChange("teachingMethods", e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700 text-sm"
              >
                <option value="">Select a rating</option>
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campus Facilities Rating */}
            <div>
              <label
                htmlFor="campus-facilities"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                How would you rate the cleanliness, accessibility, and quality
                of campus facilities?
              </label>
              <select
                id="campus-facilities"
                value={formData.campusFacilities}
                onChange={(e) =>
                  handleInputChange("campusFacilities", e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700 text-sm"
              >
                <option value="">Select a rating</option>
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Comments */}
            <div>
              <label
                htmlFor="comments"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Additional Comments
              </label>
              <textarea
                id="comments"
                rows={3}
                value={formData.comments}
                onChange={(e) => handleInputChange("comments", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700 text-sm"
                placeholder="Enter your comments here..."
              />
            </div>

            {/* Anonymous Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) =>
                  handleInputChange("isAnonymous", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="anonymous"
                className="ml-2 block text-sm text-gray-700"
              >
                Submit feedback anonymously
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
