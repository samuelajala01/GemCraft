import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import jsPDF from "jspdf";

const JobCraft = () => {
  const [mode, setMode] = useState("refine");
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

  // Initialize AI - Note: This would need proper API key handling in production
  const initializeAI = () => {
    try {
      return new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        temperature: 0.5,
      });
    } catch (error) {
      console.error("Failed to initialize AI:", error);
      return null;
    }
  };

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

  const sanitizeHtml = (html) => {
    // Clean up the HTML response from Gemini
    return html
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
  };

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    setShowPreview(false);

    try {
      const ai = initializeAI();
      if (!ai) {
        throw new Error("Failed to initialize AI. Please check your API key.");
      }

      let userPrompt = "";
      let contents = [];

      if (mode === "refine" && file) {
        const base64Data = await convertFileToBase64(file);
        userPrompt = `
You are a professional resume optimization tool. Analyze the uploaded resume and refine it based on the job description provided. 

Rules:
1. Return ONLY clean HTML with proper structure
2. Use professional styling with inline CSS
Ensure you do not repeat the resume content word for word
3. Include proper sections: header, summary/objective, experience, education, skills
4. Tailor content to match the job requirements
5. Ensure ATS-friendly formatting
6. Use bullet points for achievements and responsibilities
7. Do not include any explanations or commentary

Job Description: ${jobDescription}

Please return the optimized resume as clean HTML:`;

        contents = [
          {
            role: "user",
            parts: [
              { text: userPrompt },
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64Data,
                },
              },
            ],
          },
        ];
      } else if (mode === "build") {
        userPrompt = `
You are a professional resume builder. Create a comprehensive resume based on the following information:

Personal Information:
- Name: ${personalDetails.name}
- Email: ${personalDetails.email}
- Website: ${personalDetails.web_link}
- LinkedIn: ${personalDetails.linkedin}

Target Position: ${jobTarget}

Job Description to tailor for: ${jobDescription}

Please create a professional resume with the following requirements:
1. Return ONLY clean HTML with inline CSS styling
2. Include appropriate sections: header, professional summary, core competencies, experience, education, certifications (if applicable)
3. Use a clean, professional layout with proper spacing
4. Tailor the content to match the job requirements
5. Include relevant keywords from the job description
6. Use bullet points for achievements and responsibilities
7. Ensure ATS-friendly formatting
8. Make it visually appealing but professional

Note: Since this is a new resume build, please create compelling content that would be typical for someone applying for this role.`;

        contents = [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro-preview-05-06",
        contents: contents,
      });

      const rawText = await response.text;
      const cleanedHtml = sanitizeHtml(rawText);

      setSummary(cleanedHtml);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Error: ${err.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = () => {
    setShowPreview(!showPreview);
  };

  const handleDownloadPDF = async () => {
    try {
      // Create a temporary container with better PDF styling
      const tempDiv = document.createElement("div");
      tempDiv.style.cssText = `
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 210mm;
        margin: 0 auto;
        padding: 20px;
        background: white;
      `;

      // Create PDF-optimized HTML
      const pdfOptimizedHtml = summary
        .replace(/<style[^>]*>.*?<\/style>/gis, "") // Remove style tags
        .replace(/style="[^"]*"/gi, "") // Remove inline styles that might conflict
        .replace(
          /<h1/gi,
          '<h1 style="font-size: 24px; margin-bottom: 10px; color: #333;"'
        )
        .replace(
          /<h2/gi,
          '<h2 style="font-size: 20px; margin-bottom: 8px; color: #333;"'
        )
        .replace(
          /<h3/gi,
          '<h3 style="font-size: 18px; margin-bottom: 6px; color: #333;"'
        )
        .replace(/<p/gi, '<p style="margin-bottom: 10px; line-height: 1.5;"')
        .replace(
          /<ul/gi,
          '<ul style="margin-bottom: 10px; padding-left: 20px;"'
        )
        .replace(/<li/gi, '<li style="margin-bottom: 4px;"')
        .replace(/<div/gi, '<div style="margin-bottom: 10px;"');

      tempDiv.innerHTML = pdfOptimizedHtml;
      document.body.appendChild(tempDiv);

      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      await new Promise((resolve) => {
        doc.html(tempDiv, {
          callback: (doc) => {
            doc.save(`${personalDetails.name || "resume"}.pdf`);
            document.body.removeChild(tempDiv);
            resolve();
          },
          margin: [15, 15, 15, 15],
          autoPaging: "text",
          html2canvas: {
            scale: 0.5,
            useCORS: true,
            letterRendering: true,
            allowTaint: true,
            dpi: 300,
            width: 794, // A4 width in pixels at 96 DPI
            windowWidth: 794,
          },
          width: 180, // Content width in mm (A4 width - margins)
          windowWidth: 794,
        });
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      setError("Failed to generate PDF. Please try again.");
    }
  };

  const resetForm = () => {
    setStep(1);
    setSummary("");
    setShowPreview(false);
    setError("");
    if (mode === "build") {
      setPersonalDetails({
        name: "",
        email: "",
        web_link: "",
        linkedin: "",
      });
      setJobTarget("");
      setJobDescription("");
    } else {
      setFile(null);
      setJobDescription("");
    }
  };

  const canProceedToNextStep = () => {
    if (step === 1) {
      return personalDetails.name && personalDetails.email;
    }
    if (step === 2) {
      return jobTarget && jobDescription;
    }
    return true;
  };

  const canSubmit = () => {
    if (mode === "build") {
      return (
        personalDetails.name &&
        personalDetails.email &&
        jobTarget &&
        jobDescription
      );
    }
    return file && jobDescription;
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">JobCraft</h1>
        <p className="text-gray-600">AI-Powered Resume Builder & Optimizer</p>
      </div>

      <div className="flex space-x-4 mb-8 border-b pb-4">
        <button
          onClick={() => {
            setMode("build");
            resetForm();
          }}
          className={`px-6 py-3 rounded-lg transition-all duration-200 ${
            mode === "build"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Build New Resume
        </button>
        <button
          onClick={() => {
            setMode("refine");
            resetForm();
          }}
          className={`px-6 py-3 rounded-lg transition-all duration-200 ${
            mode === "refine"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Refine Existing Resume
        </button>
      </div>

      {mode === "build" && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">
                Step {step} of 3
              </span>
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      s <= step ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={personalDetails.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={personalDetails.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website/Portfolio
                  </label>
                  <input
                    name="web_link"
                    type="url"
                    value={personalDetails.web_link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://johndoe.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    name="linkedin"
                    type="url"
                    value={personalDetails.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
              </div>
              <button
                className={`px-6 py-3 rounded-lg transition-all duration-200 shadow-md ${
                  canProceedToNextStep()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
                onClick={() => setStep(2)}
                disabled={!canProceedToNextStep()}
              >
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">
                Job Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Job Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Senior Python Developer"
                  value={jobTarget}
                  onChange={(e) => setJobTarget(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include requirements, responsibilities, and preferred
                  qualifications
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className={`px-6 py-3 rounded-lg transition-all duration-200 shadow-md ${
                    canProceedToNextStep()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                  onClick={() => setStep(3)}
                  disabled={!canProceedToNextStep()}
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">
                Generate Your Resume
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Review Your Information:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    <strong>Name:</strong> {personalDetails.name}
                  </li>
                  <li>
                    <strong>Email:</strong> {personalDetails.email}
                  </li>
                  <li>
                    <strong>Target Position:</strong> {jobTarget}
                  </li>
                  <li>
                    <strong>Job Description:</strong>{" "}
                    {jobDescription.substring(0, 100)}...
                  </li>
                </ul>
              </div>
              <p className="text-gray-600">
                Ready to create your tailored resume? Our AI will analyze the
                job description and generate a professional resume optimized for
                this position.
              </p>
              <div className="flex gap-3">
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  onClick={handleSummarize}
                  disabled={loading || !canSubmit()}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 shadow-md ${
                    loading || !canSubmit()
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Generating...
                    </span>
                  ) : (
                    "Generate Resume"
                  )}
                </button>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {mode === "refine" && (
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800">
            Upload & Refine Your Resume
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Resume (PDF) *
              </label>
              <div className="flex items-center gap-4">
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Choose PDF File
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <span className="text-green-600 font-medium flex items-center">
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {file.name}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description *
              </label>
              <textarea
                rows={8}
                placeholder="Paste the job description you want to tailor your resume for..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
              />
              <p className="text-sm text-gray-500 mt-1">
                Include all requirements and keywords from the job posting
              </p>
            </div>
          </div>
          <button
            onClick={handleSummarize}
            disabled={loading || !canSubmit()}
            className={`px-6 py-3 rounded-lg transition-all duration-200 shadow-md ${
              loading || !canSubmit()
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Refining...
              </span>
            ) : (
              "Refine Resume"
            )}
          </button>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {summary && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePreviewPDF}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {showPreview ? "Hide Preview" : "Preview Resume"}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-md flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Start Over
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            {showPreview ? (
              <div className="bg-white">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <h3 className="font-semibold text-gray-800">
                    Resume Preview
                  </h3>
                </div>
                <div
                  className="p-8 min-h-96"
                  dangerouslySetInnerHTML={{ __html: summary }}
                />
              </div>
            ) : (
              <div className="bg-gray-50">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <h3 className="font-semibold text-gray-800">
                    Generated Resume (HTML)
                  </h3>
                </div>
                <div className="p-6">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto">
                    {summary}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCraft;
