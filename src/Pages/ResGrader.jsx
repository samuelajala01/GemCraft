import { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, FileText, Star } from "lucide-react";

const gradeToScore = (grade) => {
  const map = { A: 25, B: 20, C: 15, D: 10, F: 5 };
  return map[grade.toUpperCase()] || 0;
};

const gradeColor = (grade) => {
  switch (grade.toUpperCase()) {
    case "A":
      return "bg-green-100 text-green-700";
    case "B":
      return "bg-yellow-100 text-yellow-700";
    case "C":
      return "bg-orange-100 text-orange-700";
    case "D":
    case "F":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const ResGrader = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY }); // Add your API key

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else {
      setFile(null);
      setError("Please select a valid PDF file.");
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSummarize = async () => {
    if (!file || !jobTitle) {
      setError("Please upload a resume and enter a job title.");
      return;
    }

    setLoading(true);
    setError("");
    setSummary([]);

    try {
      const base64Data = await convertFileToBase64(file);

      const prompt = `
You are a resume grading assistant. Analyze the resume for the job title "${jobTitle}".
Evaluate it on clarity, structure, keyword optimization, achievements, and professionalism.
Give each metric a grade (A–F) and expert feedback.
      `;

      const contents = [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        temperature: 0,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                metric: { type: Type.STRING },
                grade: { type: Type.STRING },
                feedback: { type: Type.STRING },
              },
              required: ["metric", "grade", "feedback"],
            },
          },
        },
      });

      const result = JSON.parse(response.text);
      setSummary(result);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalScore = summary.reduce((acc, item) => acc + gradeToScore(item.grade), 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white shadow-lg rounded-xl p-6 border">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Resume Grader 🔍</h1>
        <p className="text-gray-600 mb-6">Get personalized feedback on your resume based on your job target.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-4 text-gray-700">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Backend Developer"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Upload Resume (PDF only)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-md bg-white mb-4"
            />
            {file && (
              <p className="text-green-600 mt-1 flex items-center gap-2 text-sm">
                <FileText size={16} /> {file.name}
              </p>
            )}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleSummarize}
            disabled={!file || !jobTitle || loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold flex justify-center items-center gap-2 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Analyze Resume"}
          </button>
        </div>
      </div>

      {summary.length > 0 && (
        <div className="mt-10">
          {/* Total Score */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow-md flex items-center justify-between border border-blue-100">
            <div className="flex items-center gap-3">
              <Star className="text-yellow-500 w-6 h-6" />
              <h3 className="text-lg font-bold text-blue-800">Total Score</h3>
            </div>
            <span className="text-2xl font-extrabold text-blue-700">{totalScore} / 100</span>
          </div>

          {/* Metric Feedback Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {summary.map((item, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border ${gradeColor(item.grade)} shadow-sm`}
              >
                <h4 className="font-bold text-lg mb-2">{item.metric}</h4>
                <p className="text-sm font-semibold mb-2">
                  Grade: <span className="text-base">{item.grade}</span>
                </p>
                <p className="text-sm text-gray-800">{item.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResGrader;
