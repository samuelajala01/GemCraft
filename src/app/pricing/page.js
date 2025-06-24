"use client";

import React from "react";

export default function PricingPage() {
  const plans = [
    {
      name: "Free Plan",
      price: "Free",
      description: "Get started with basic features and generate 1 resume.",
      features: [
        "2 Resume Generation",
        "Limited Templates",
        "Brand watermark"
      ],
      buttonText: "Start for Free",
      highlighted: false
    },
    {
      name: "Basic Pack",
      price: "$10",
      description: "One-time access to more templates and downloads.",
      features: [
        "Unlimited Resume Downloads",
        "All Templates Unlocked",
        "No Watermark",
        "PDF Export"
      ],
      buttonText: "Buy Basic Pack",
      highlighted: true
    },
    {
      name: "Pro Pack",
      price: "$25",
      description: "Full access to AI rewriting, cover letters, and optimizations.",
      features: [
        "Everything in Basic",
        "AI Rewrite & Suggestions",
        "Cover Letter Generator",
        "ATS Optimization Tools"
      ],
      buttonText: "Buy Pro Pack",
      highlighted: false
    }
  ];

  return (
    <>
    <div className="min-h-screen mt-[10vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Simple, One-Time Pricing</h2>
        <p className="text-lg text-gray-600 mb-12">
          Only pay when you're ready. No subscriptions. No pressure.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col justify-between h-full p-6 rounded-2xl shadow-md ${plan.highlighted ? "border-2 border-indigo-500 bg-white" : "bg-white"}`}
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{plan.price}</p>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-700">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2 text-green-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <button
                  className={`w-full py-2 px-4 text-white font-semibold rounded-xl ${plan.highlighted ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-700 hover:bg-gray-800"}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div></>
  );
}
