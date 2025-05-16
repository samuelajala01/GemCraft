import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const JobCraft = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
  });
  const [jobDescription, setJobDescription] = useState("");

  const ai = new GoogleGenAI({
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
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

  // Define user prompt for tailoring resumes to job descriptions

  const handleSummarize = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }
  
    if (!jobDescription) {
      setError("Please enter a job description");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const base64Data = await convertFileToBase64(file);
  
      // Merge system instructions + user input into a single prompt
      const userPrompt = `
  You are a GemCraft tool -JobCraft, a specialized assistant that helps job seekers optimize their resumes for specific job positions. Your task is to create a tailored resume for the user based on the job description provided, and the necessary resume details provided by the user.
  
  Personal Details:
  - Name: ${personalDetails.name}
  - Email: ${personalDetails.email}
  - Phone: ${personalDetails.phone}
  - LinkedIn: ${personalDetails.linkedin}
  
  Job Description:
  ${jobDescription}
  
  Please analyze my resume PDF (attached) and provide feedback on how I can improve it to match this job description.
      `;
  
      const contents = [
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
  
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
      });
  
      setSummary(response.text); // note: access response.text via response.response.text
    } catch (err) {
      console.error("API Error:", err);
      setError("Error processing document: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">JobCraft</h2>
      <p className="text-blue-600 mb-4">This tool gives you feedback on how to improve your resume for specific job positions.</p>
      
      {/* Form for personal details */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Personal Details</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={personalDetails.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={personalDetails.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={personalDetails.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input
              type="text"
              name="linkedin"
              value={personalDetails.linkedin}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Job Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
        <textarea
          value={jobDescription}
          onChange={handleJobDescriptionChange}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Paste the job description here..."
        />
      </div>
      
      {/* File upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Your Resume (PDF)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      
      {file && <p className="mb-4 text-green-600">Selected: {file.name}</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}
      
      <button
        onClick={handleSummarize}
        disabled={!file || !jobDescription || loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Analyze Resume"}
      </button>
      
      {summary && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Analysis:</h3>
          <div className="text-gray-700 whitespace-pre-line">{summary}</div>
        </div>
      )}
    </div>
  );
};

export default JobCraft;