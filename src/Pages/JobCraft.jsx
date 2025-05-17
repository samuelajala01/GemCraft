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

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    setShowPreview(false);

    try {
      let userPrompt = "";
      let contents = [];

      if (mode === "refine" && file) {
        const base64Data = await convertFileToBase64(file);
        userPrompt = `
You are a resume optimization tool. Refine and tailor the uploaded resume based on the job description below.

Only return the improved resume as clean HTML with basic inline styles: add bullet points, bold, italic, underline, etc where appropriate. 
Do not include explanations, comparisons, or any commentary.
Do not prepend or append any headings or notes.
Strictly return the HTML resume content only.

Job Description: ${jobDescription}`;

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
      } else {
        userPrompt = `
You are a GemCraft tool -JobCraft, a resume generator. Build a resume based on the following:

Name: ${personalDetails.name}
Email: ${personalDetails.email}
Web Link: ${personalDetails.web_link}
LinkedIn: ${personalDetails.linkedin}

Job Target: ${jobTarget}
Job Description: ${jobDescription}

Return a clean, HTML-formatted resume.`;

        contents = [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
      });

      const rawText = response.text;
      const cleanedText = rawText
        .replace(/^```html\s*/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "");

      setSummary(cleanedText);
    } catch (err) {
      console.error("API Error:", err);
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = () => {
    setShowPreview(!showPreview);
  };

  const handleDownloadPDF = () => {
    const container = document.createElement("div");
    container.innerHTML = summary;

    const opt = {
      margin: 0.5,
      filename: `${personalDetails.name || "resume"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(container).save();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-blue-600">JobCraft</h2>

      <div className="flex space-x-4 mb-8 border-b pb-4">
        <button
          onClick={() => setMode("build")}
          className={`px-6 py-3 rounded-lg transition-all duration-200 ${
            mode === "build"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Build Resume
        </button>
        <button
          onClick={() => setMode("refine")}
          className={`px-6 py-3 rounded-lg transition-all duration-200 ${
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
            <div className="flex items-center justify-between mb-2">
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
            <div className="h-1 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold">
                Let's start with some personal info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={personalDetails.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    value={personalDetails.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Web Link
                  </label>
                  <input
                    name="web_link"
                    value={personalDetails.web_link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    name="linkedin"
                    value={personalDetails.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold">
                What job are you targeting?
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python Backend Developer"
                  value={jobTarget}
                  onChange={(e) => setJobTarget(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                  onClick={() => setStep(3)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold">
                Ready to generate your resume?
              </h3>
              <p className="text-gray-600">
                We'll use the info you've provided to generate a tailored
                resume.
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
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Generate Resume"}
                </button>
              </div>
              {error && <p className="text-red-600">{error}</p>}
            </div>
          )}
        </>
      )}

      {mode === "refine" && (
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Upload your existing resume</h3>
          <div className="flex items-center gap-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
              Choose File
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && <span className="text-green-600">{file.name}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              rows={6}
              placeholder="Paste job description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSummarize}
            disabled={loading || !file || !jobDescription}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Refine Resume"}
          </button>
          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}

      {summary && (
        <div className="mt-8">
          <div className="flex gap-3 mb-4">
            <button
              onClick={handlePreviewPDF}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
            >
              {showPreview ? "Hide Preview" : "Preview PDF"}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-md"
            >
              Download PDF
            </button>
          </div>

          {showPreview ? (
            <div className="p-8 bg-white border shadow-lg min-h-screen rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: summary }} />
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">AI-Generated Resume:</h3>
              <pre className="whitespace-pre-wrap text-gray-800">{summary}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCraft;
