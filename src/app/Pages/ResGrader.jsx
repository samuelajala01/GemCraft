import { useState } from "react";
import { Loader2, FileText, Star, AlertCircle, CheckCircle2, Award } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const gradeToScore = (grade) => {
  const map = { A: 20, B: 16, C: 12, D: 8, F: 4 };
  return map[grade.toUpperCase()] || 0;
};

const gradeColor = (grade) => {
  switch (grade.toUpperCase()) {
    case "A":
      return "border-[#ff6b6b]/30";
    case "B":
      return " border-[#4a5568]";
    case "C":
      return " border-yellow-700";
    case "D":
      return "border-orange-700";
    case "F":
      return "border-red-700";
    default:
      return "border-gray-700";
  }
};

const getScoreColor = (score, maxScore) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return "text-[#ff6b6b]";
  if (percentage >= 80) return "text-[#ff8787]";
  if (percentage >= 70) return "text-yellow-400";
  if (percentage >= 60) return "text-orange-400";
  return "text-red-400";
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
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-2">

      <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#ff6b6b]/20">
        <Award className="w-4 h-4" />
        Resume Grader
      </div>
      <h2 className="text-3xl font-bold  mb-4">Grade Your Resume</h2>
      <p className="">Get detailed analysis and actionable feedback on your resume</p>
    </div>

        <div className="shadow-lg rounded-xl p-8 border">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <FileText className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Resume Grader</h1>
            </div>
            <p className=" text-lg">Get personalized feedback on your resume based on your target job</p>
          </div>

          <div className="space-y-6">
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2">
                Target Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Backend Developer, Marketing Manager, Data Scientist"
                className="w-full px-4 py-3  border border-[#4a5568] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent transition-all text-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Upload Resume (PDF only) *
              </label>
              <div className="relative mb-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-[#4a5568] rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#000] file:text-[#fff] hover:file:bg-[#000] transition-all"
                />
              </div>
              {file && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-lg border border-[#ff6b6b]/20">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2  p-4 rounded-lg border border-red-700">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && !loading && (
              <div className="flex items-center gap-2 p-4 rounded-lg border border-[#ff6b6b]/20">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Resume analyzed successfully!</span>
              </div>
            )}

            <button
              onClick={handleSummarize}
              disabled={!file || !jobTitle.trim() || loading}
              className="w-full text-white py-4 px-6 rounded-lg font-semibold flex justify-center items-center gap-3 disabled:bg-[#4a5568] disabled:cursor-not-allowed transition-all duration-200 text-lg shadow-lg"
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
            <div className="shadow-lg rounded-xl p-6 border border-[#4a5568] mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className=" p-3 rounded-full">
                    <Star className=" w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Overall Score</h3>
                    <p className=" text-sm">Based on 5 key metrics</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-extrabold ${getScoreColor(totalScore, maxPossibleScore)}`}>
                    {totalScore}
                  </span>
                  <span className="text-2xl font-semibold">
                    / {maxPossibleScore}
                  </span>
                  <div className="text-sm mt-1">
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