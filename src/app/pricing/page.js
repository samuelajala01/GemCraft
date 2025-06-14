// File: src/app/Pages/Pricing.js
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with resume optimization",
      features: [
        "Basic resume grading",
        "3 job matches per month",
        "Limited AI suggestions",
        "Standard formatting",
        "Email support",
      ],
      buttonText: "Get Started",
      buttonClass: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      description: "For serious job seekers who want maximum results",
      features: [
        "Advanced resume grading",
        "Unlimited job matches",
        "AI-powered optimization",
        "ATS compatibility check",
        "Priority support",
        "Real-time feedback",
        "Export to PDF/Word",
      ],
      buttonText: "Go Pro",
      buttonClass:
        "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$29",
      period: "per month",
      description: "For teams and career coaching professionals",
      features: [
        "All Pro features",
        "Team management",
        "Bulk processing",
        "Custom branding",
        "Dedicated account manager",
        "API access",
        "Advanced analytics",
        "Custom integrations",
      ],
      buttonText: "Contact Sales",
      buttonClass: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
      popular: false,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that works best for your career journey. All plans
          include our core resume optimization features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
              plan.popular ? "ring-2 ring-blue-500 relative" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                MOST POPULAR
              </div>
            )}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {plan.name}
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-800">
                  {plan.price}
                </span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              <p className="text-gray-600 mb-8">{plan.description}</p>
              <ul className="mb-10 space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 ${plan.buttonClass}`}
              >
                {plan.buttonText}
                {!plan.popular && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-blue-50/50 backdrop-blur-sm p-8 rounded-2xl border border-blue-100 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Enterprise or Education Solutions?
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          We offer custom plans for universities, career centers, and
          organizations. Get volume discounts, dedicated support, and custom
          features tailored to your needs.
        </p>
        <button className="inline-flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200">
          Contact our Sales Team
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}