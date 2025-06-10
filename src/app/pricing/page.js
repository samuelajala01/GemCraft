import React from "react";
import { CheckCircle } from "lucide-react";

function PlanCard({ title, features, price, highlight, buttonText }) {
  return (
    <div
      className={`rounded-2xl p-6 text-left shadow-xl border transition-colors duration-300 ${
        highlight ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white"
      }`}
    >
      <h3
        className={`text-2xl font-bold mb-4 ${
          highlight ? "text-purple-700" : "text-gray-800"
        }`}
      >
        {title}
      </h3>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-700 text-sm">
            <CheckCircle size={16} className="text-purple-500 mr-2" /> {feature}
          </li>
        ))}
      </ul>
      {price && <p className="text-xl font-bold text-purple-700 mb-4">{price}</p>}
      <button
        className={`w-full py-2 px-4 rounded-lg font-semibold text-white ${
          highlight ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-500 hover:bg-purple-600"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 px-6 py-10 text-center">
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
        Simple, Clear Pricing
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto text-lg">
        Choose the right plan to level up your resume and land your dream job faster.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
        <PlanCard
          title="Free Plan"
          features={[
            "1 Resume Upload",
            "1 Job Description Match",
            "Basic AI Suggestions",
            "Download as PDF"
          ]}
          price={null}
          highlight={false}
          buttonText="Get Started Free"
        />

        <PlanCard
          title="Pro Plan"
          features={[
            "Unlimited Resume Uploads",
            "Unlimited Job Description Matches",
            "Advanced AI Optimization",
            "Cover Letter Generator",
            "Download in Multiple Formats"
          ]}
          price="$8/month"
          highlight={true}
          buttonText="Upgrade to Pro"
        />
      </div>

      <div className="mt-20 max-w-4xl mx-auto text-left bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-purple-700 mb-4">Why Go Pro?</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Get tailored feedback to match your resume to any job you want.</li>
          <li>Generate personalized cover letters instantly.</li>
          <li>Access deeper analysis to improve tone, keywords, and formatting.</li>
          <li>Get updates and improvements without worrying about limits.</li>
        </ul>
      </div>
    </div>
  );
}
