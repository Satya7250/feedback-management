"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const AdminDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Process trend data (monthly averages)
  const processTrendData = (data) => {
    const monthlyData = {};

    data.forEach((feedback) => {
      const date = new Date(feedback.createdAt);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          courseContent: [],
          teachingMethods: [],
          campusFacilities: [],
        };
      }

      monthlyData[monthYear].courseContent.push(Number(feedback.courseContent));
      monthlyData[monthYear].teachingMethods.push(
        Number(feedback.teachingMethods)
      );
      monthlyData[monthYear].campusFacilities.push(
        Number(feedback.campusFacilities)
      );
    });

    return Object.values(monthlyData).map((month) => ({
      month: month.month,
      courseContent: calculateAverage(month.courseContent),
      teachingMethods: calculateAverage(month.teachingMethods),
      campusFacilities: calculateAverage(month.campusFacilities),
    }));
  };

  // Calculate rating distribution
  const processDistributionData = (data) => {
    const distribution = {
      courseContent: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      teachingMethods: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      campusFacilities: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    data.forEach((feedback) => {
      distribution.courseContent[feedback.courseContent]++;
      distribution.teachingMethods[feedback.teachingMethods]++;
      distribution.campusFacilities[feedback.campusFacilities]++;
    });

    return Object.entries(distribution.courseContent).map(
      ([rating, count]) => ({
        rating: Number(rating),
        courseContent: count,
        teachingMethods: distribution.teachingMethods[rating],
        campusFacilities: distribution.campusFacilities[rating],
      })
    );
  };

  // Calculate overall averages
  const processOverallAverages = (data) => {
    const totals = {
      courseContent: 0,
      teachingMethods: 0,
      campusFacilities: 0,
    };

    data.forEach((feedback) => {
      totals.courseContent += Number(feedback.courseContent);
      totals.teachingMethods += Number(feedback.teachingMethods);
      totals.campusFacilities += Number(feedback.campusFacilities);
    });

    return [
      {
        category: "Course Content",
        value: (totals.courseContent / data.length).toFixed(2),
      },
      {
        category: "Teaching Methods",
        value: (totals.teachingMethods / data.length).toFixed(2),
      },
      {
        category: "Campus Facilities",
        value: (totals.campusFacilities / data.length).toFixed(2),
      },
    ];
  };

  const calculateAverage = (arr) => {
    return arr.length
      ? Number((arr.reduce((a, b) => a + b) / arr.length).toFixed(2))
      : 0;
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/feedback?status=${filterStatus}`);
      if (!response.ok) throw new Error("Failed to fetch feedback");
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async () => {
    if (!selectedFeedback || !response) return;

    try {
      const res = await fetch(`/api/feedback/${selectedFeedback._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit response");
      }

      fetchFeedbacks();
      setResponse("");
      setSelectedFeedback(null);
    } catch (err) {
      alert("Failed to submit response: " + err.message);
    }
  };

  const handleExportData = () => {
    const csvContent = convertToCSV(feedbacks);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback_export.csv";
    a.click();
  };

  const convertToCSV = (data) => {
    const headers = [
      "Date",
      "Student",
      "Course Content",
      "Teaching Methods",
      "Facilities",
      "Comments",
      "Status",
      "Response",
    ];
    const rows = data.map((feedback) => [
      new Date(feedback.createdAt).toLocaleDateString(),
      feedback.isAnonymous ? "Anonymous" : feedback.studentId?.name || "N/A",
      feedback.courseContent,
      feedback.teachingMethods,
      feedback.campusFacilities,
      feedback.comments,
      feedback.status,
      feedback.response || "No response",
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filterStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl text-indigo-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  const trendData = processTrendData(feedbacks);
  const distributionData = processDistributionData(feedbacks);
  const overallAverages = processOverallAverages(feedbacks);
  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg border border-indigo-100 p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Feedback Dashboard
          </h1>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trend Analysis */}
          {/* <div className="md:col-span-2 bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg border border-purple-100 p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">
              Feedback Trends Over Time
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis domain={[0, 5]} stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="courseContent"
                    stroke={COLORS[0]}
                    strokeWidth={2}
                    name="Course Content"
                  />
                  <Line
                    type="monotone"
                    dataKey="teachingMethods"
                    stroke={COLORS[1]}
                    strokeWidth={2}
                    name="Teaching Methods"
                  />
                  <Line
                    type="monotone"
                    dataKey="campusFacilities"
                    stroke={COLORS[2]}
                    strokeWidth={2}
                    name="Campus Facilities"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div> */}

          {/* Rating Distribution */}
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg border border-purple-100 p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">
              Rating Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="rating" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="courseContent"
                    fill={COLORS[0]}
                    name="Course Content"
                  />
                  <Bar
                    dataKey="teachingMethods"
                    fill={COLORS[1]}
                    name="Teaching Methods"
                  />
                  <Bar
                    dataKey="campusFacilities"
                    fill={COLORS[2]}
                    name="Campus Facilities"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Overall Performance */}
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg border border-purple-100 p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">
              Overall Performance
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={overallAverages}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar
                    name="Average Rating"
                    dataKey="value"
                    stroke={COLORS[0]}
                    fill={COLORS[0]}
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg border border-pink-100 p-6 flex justify-between items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-purple-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white"
          >
            <option value="all">All Feedback</option>
            <option value="pending">Pending</option>
            <option value="responded">Responded</option>
          </select>
          <button
            onClick={handleExportData}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-md"
          >
            Export to CSV
          </button>
        </div>

        {/* Feedback List */}
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg border border-indigo-100 overflow-hidden">
          <table className="min-w-full divide-y divide-purple-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Ratings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Comments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {feedbacks.map((feedback) => (
                <tr
                  key={feedback._id}
                  className="hover:bg-purple-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-purple-700">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-purple-700">
                    {feedback.isAnonymous
                      ? "Anonymous"
                      : feedback.studentId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-indigo-600">
                        Course: {feedback.courseContent}/5
                      </div>
                      <div className="text-purple-600">
                        Teaching: {feedback.teachingMethods}/5
                      </div>
                      <div className="text-pink-600">
                        Facilities: {feedback.campusFacilities}/5
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-purple-700">
                    {feedback.comments}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedFeedback(feedback)}
                      className={`px-4 py-1 rounded-md ${
                        feedback.status === "responded"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
                      }`}
                      disabled={feedback.status === "responded"}
                    >
                      {feedback.status === "responded"
                        ? "Responded"
                        : "Respond"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Response Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-purple-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full m-4">
              <h3 className="text-lg font-semibold mb-4 text-purple-700">
                Respond to Feedback
              </h3>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full h-32 p-2 border border-purple-200 rounded-md mb-4 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Type your response..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResponseSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
