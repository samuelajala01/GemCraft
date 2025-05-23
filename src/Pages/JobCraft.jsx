import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import html2pdf from "html2pdf.js";

const JobCraft = () => {
  const [mode, setMode] = useState("refine"); // 'build' or 'refine'
  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [file, setFile] = useState(null);

  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    email: "",
    web_link: "",
    linkedin: "",
  });

  const [jobTarget, setJobTarget] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a PDF file");
      setFile(null);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerateResume = async () => {
    setLoading(true);
    setError("");
    setShowPreview(false);

    try {
      let response;

      if (mode === "build") {
        // Send JSON for building resume
        response = await fetch("http://localhost:4000/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: personalDetails.name,
            email: personalDetails.email,
            web_link: personalDetails.web_link,
            linkedin: personalDetails.linkedin,
            jobTarget: jobTarget,
            jobDescription: jobDescription,
            mode: "build",
          }),
        });
      } else if (mode === "refine" && file) {
        // Send multipart/form-data for resume refinement
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("jobDescription", jobDescription);
        formData.append("mode", "refine");

        response = await fetch("http://localhost:4000/generate-pdf", {
          method: "POST",
          body: formData,
        });
      } else {
        throw new Error("Missing data");
      }

      if (!response.ok) {
        throw new Error("Failed to generate resume");
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);

      // Open preview
      setSummary(pdfUrl);
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = () => {
    setShowPreview(!showPreview);
  };

  const handleDownloadPDF = () => {
    if (!summary) return;

    const link = document.createElement("a");
    link.href = summary;
    link.download = `${personalDetails.name || "resume"}.pdf`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-600">JobCraft</h2>

      <div className="flex mb-6 border-b pb-4">
        <button
          onClick={() => setMode("build")}
          className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium ${
            mode === "build"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Build Resume
        </button>
        <button
          onClick={() => setMode("refine")}
          className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium ${
            mode === "refine"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Refine Existing
        </button>
      </div>

      {mode === "build" && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 font-medium">
                Step {step} of 3
              </span>
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-3 h-3 rounded-full ${
                      s <= step ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 bg-gray-50 p-5 sm:p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                Let's start with some personal info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={personalDetails.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    name="email"
                    value={personalDetails.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Web Link
                  </label>
                  <input
                    name="web_link"
                    value={personalDetails.web_link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    LinkedIn URL
                  </label>
                  <input
                    name="linkedin"
                    value={personalDetails.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md font-medium"
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 bg-gray-50 p-5 sm:p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                What job are you targeting?
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python Backend Developer"
                  value={jobTarget}
                  onChange={(e) => setJobTarget(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Description
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md font-medium"
                  onClick={() => setStep(3)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 bg-gray-50 p-5 sm:p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                Ready to generate your resume?
              </h3>
              <p className="text-gray-600">
                We'll use the info you've provided to generate a tailored
                resume.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateResume}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Generate Resume"
                  )}
                </button>
              </div>
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          )}
        </>
      )}

      {mode === "refine" && (
        <div className="space-y-6 bg-gray-50 p-5 sm:p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">
            Upload your existing resume
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="bg-blue-600 text-white px-5 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200 inline-flex items-center justify-center font-medium">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              Choose File
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && (
              <span className="text-green-600 text-sm sm:text-base">
                {file.name}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Job Description
            </label>
            <textarea
              rows={6}
              placeholder="Paste job description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleGenerateResume}
            disabled={loading || !file || !jobDescription}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Refine Resume"
            )}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {summary && (
        <div className="mt-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handlePreviewPDF}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md font-medium"
            >
              {showPreview ? "Hide Preview" : "Preview PDF"}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-md font-medium"
            >
              Download PDF
            </button>
          </div>

          {showPreview ? (
            <div className="p-6 sm:p-8 bg-white border shadow-lg min-h-screen rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: summary }} />
            </div>
          ) : (
            <div className="p-5 sm:p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-800">
                AI-Generated Resume:
              </h3>
              <div className="whitespace-pre-wrap text-gray-800 font-mono text-sm bg-white p-4 rounded border">
                {summary}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCraft;
