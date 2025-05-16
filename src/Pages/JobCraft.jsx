import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const JobCraft = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
  });

  const [jobTarget, setJobTarget] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.GEMINI_API_KEY,
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

    try {
      const base64Data = file ? await convertFileToBase64(file) : null;
      const userPrompt = `
You are a GemCraft tool -JobCraft, a specialized Resume reviewer with decades of experience that helps job seekers optimize their resumes for specific job positions. Your task is to create a tailored resume for the user based on the job description provided, and the following resume details provided by the user.

Personal Details:
- Name: ${personalDetails.name}
- Email: ${personalDetails.email}
- Phone: ${personalDetails.phone}
- LinkedIn: ${personalDetails.linkedin}

Job Target: ${jobTarget}
Job Description: ${jobDescription}

${file ? "Also analyze the attached resume PDF." : "No resume file provided."}
`;

      const contents = [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            ...(base64Data
              ? [
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: base64Data,
                    },
                  },
                ]
              : []),
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
      });

      setSummary(response.text);
    } catch (err) {
      console.error("API Error:", err);
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">JobCraft</h2>
      <div className="mb-4 text-gray-600">Step {step} of 3</div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Let's start with some personal info
          </h3>
          <input
            name="name"
            placeholder="Full Name"
            value={personalDetails.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            name="email"
            placeholder="Email Address"
            value={personalDetails.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            name="phone"
            placeholder="Phone Number"
            value={personalDetails.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            name="linkedin"
            placeholder="LinkedIn URL"
            value={personalDetails.linkedin}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What job are you targeting?</h3>
          <input
            type="text"
            placeholder="e.g. Python Backend Developer"
            value={jobTarget}
            onChange={(e) => setJobTarget(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <textarea
            rows={6}
            placeholder="Paste job description..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block"
          />
          {file && <p className="text-green-600">Selected: {file.name}</p>}
          <div className="flex gap-3">
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setStep(3)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Ready to generate your resume?
          </h3>
          <p>
            We'll use the info you've provided to generate a tailored resume.
          </p>
          <div className="flex gap-3">
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Processing..." : "Generate Resume"}
            </button>
          </div>
          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}

      {summary && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">AI-Generated Resume:</h3>
          <pre className="whitespace-pre-wrap text-gray-800">{summary}</pre>
        </div>
      )}
    </div>
  );
};


export default JobCraft;