import { useState } from "react";
import { Loader2, FileText, Star, AlertCircle, CheckCircle2, Award } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const gradeToScore = (grade) => {
  const map = { A: 20, B: 16, C: 12, D: 8, F: 4 };
  return map[grade.toUpperCase()] || 0;
};

const gradeColor = (grade) => {
  switch (grade.toUpperCase()) {
    case "A":
      return "bg-green-100 text-green-800 border-green-200";
    case "B":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "C":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "D":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "F":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getScoreColor = (score, maxScore) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 80) return "text-blue-600";
  if (percentage >= 70) return "text-yellow-600";
  if (percentage >= 60) return "text-orange-600";
  return "text-red-600";
};

const ResGrader = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
      setSuccess(false);
      setSummary([]); // Clear previous results when new file is uploaded
    } else {
      setFile(null);
      setError("Please select a valid PDF file.");
      setSuccess(false);
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
    if (!file || !jobTitle.trim()) {
      setError("Please upload a resume and enter a job title.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    setSummary([]);

    try {
      const base64Data = await convertFileToBase64(file);

      const prompt = `
You are a resume grading expert. Analyze the resume for the job title "${jobTitle}".
Evaluate it on these 5 specific metrics:
1. Clarity & Structure
2. Keyword Optimization  
3. Achievements & Impact
4. Professionalism
5. Relevance to Role

Give each metric a grade (A, B, C, D, or F) and provide expert feedback. Be specific and detailed in your feedback. Highlight specific phrases or sections in the resume that need improvement.
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
        topP: 1.0,
        topK: 1, 
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
      setSuccess(true);
    } catch (err) {
      console.error("Error analyzing resume:", err);
      setError("Failed to analyze resume. Please check your API key and try again.");
    } finally {
      setLoading(false); // This ensures loading stops regardless of success/failure
    }
  };

  const totalScore = summary.reduce((acc, item) => acc + gradeToScore(item.grade), 0);
  const maxPossibleScore = summary.length * 20;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-2">

      <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
        <Award className="w-4 h-4" />
        Resume Grader
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Grade Your Resume</h2>
      <p className="text-gray-600">Get detailed analysis and actionable feedback on your resume</p>
    </div>

        <div className="bg-white shadow-lg rounded-xl p-8 border">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-700 mb-3">Resume Grader 🔍</h1>
            <p className="text-gray-600 text-lg">Get personalized feedback on your resume based on your target job</p>
          </div>

          <div className="space-y-6">
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Target Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Backend Developer, Marketing Manager, Data Scientist"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Upload Resume (PDF only) *
              </label>
              <div className="relative mb-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                />
              </div>
              {file && (
                <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && !loading && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Resume analyzed successfully!</span>
              </div>
            )}

            <button
              onClick={handleSummarize}
              disabled={!file || !jobTitle.trim() || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold flex justify-center items-center gap-3 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-lg shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </div>

        {summary.length > 0 && (
          <div className="mt-8 space-y-6">
            {/* Total Score Card */}
            <div className="bg-white shadow-lg rounded-xl p-6 border mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Star className="text-yellow-600 w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Overall Score</h3>
                    <p className="text-gray-600 text-sm">Based on 5 key metrics</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-extrabold ${getScoreColor(totalScore, maxPossibleScore)}`}>
                    {totalScore}
                  </span>
                  <span className="text-2xl text-gray-500 font-semibold">
                    / {maxPossibleScore}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    {Math.round((totalScore / maxPossibleScore) * 100)}% Score
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {summary.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-6 border-2 ${gradeColor(item.grade)} shadow-md hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-bold text-xl">{item.metric}</h4>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold mb-1">{item.grade}</div>
                      <div className="text-sm opacity-75">
                        {gradeToScore(item.grade)}/20 pts
                      </div>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed">
                    {item.feedback}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResGrader;