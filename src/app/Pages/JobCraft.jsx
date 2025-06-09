import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { Target } from "lucide-react";
import ResumeChatbot from "../ResumeChatbot";

const JobCraft = () => {
  const [mode, setMode] = useState("refine"); // 'build' or 'refine'

  // Refine mode states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Refine mode functions
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

  const handleRefineResume = async () => {
    setLoading(true);
    setError("");
    setShowPreview(false);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);
      formData.append("mode", "refine");

      const response = await fetch(`${process.env.BACKEND_URL}/refine-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to refine resume");
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
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
    link.download = "refined_resume.pdf";
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Target className="w-4 h-4" />
          Job Craft Mode
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Craft Your Perfect Resume
        </h2>
        <p className="text-gray-600">
          Upload your resume and job description to get insights
        </p>
      </div>
      <div className="flex mb-6 border-b pb-4 gap-4">
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
        <button
          onClick={() => setMode("build")}
          className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium mr-2 ${
            mode === "build"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Build Resume
        </button>
        
      </div>

      {mode === "build" && <ResumeChatbot />}

      {mode === "refine" && (
        <div className="space-y-6 bg-gray-50 p-5 sm:p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 my-4">
            Upload your existing resume(*pdf)
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
            <label className="block text-sm font-medium text-gray-700 my-2">
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
            onClick={handleRefineResume}
            disabled={loading || !file || !jobDescription}
            className="bg-blue-600 text-white mt-4 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
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

      {summary && mode === "refine" && (
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

          {showPreview && (
            <div className="p-6 sm:p-8 bg-white border shadow-lg min-h-screen rounded-lg">
              <iframe
                src={summary}
                width="100%"
                height="600px"
                title="Resume Preview"
                className="border rounded"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCraft;