import { useState } from "react";
import "./App.css";
import ResGrader from "./Pages/ResGrader";
import JobCraft from "./Pages/JobCraft";
import HomeContent from "./Pages/HomeContent";
function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);

  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomeContent/>
        );

      case "jobcraft":
        return (
          <JobCraft/>
        );

      case "resume grader":
        return <ResGrader />;

      default:
        return null;
    }
  };

  return (
    <>
    <div className="text-center mt-20 mb-8">
    <h1 className="text-7xl font-bold text-blue-600 mb-4">GemCraft</h1>
            <p className="text-xl text-gray-600">
              Your AI-powered resume crafting assistant
            </p>
    </div>
    <div className="mx-[4vw]">
    <div className="bg-white p-6 rounded-lg">
      {/* Navigation Buttons */}
      <div className="flex justify-center gap-8 mx-8 space-x-4 mb-8">
        <button
          onClick={() => setCurrentPage("home")}
          className={`px-6 py-2 rounded-lg font-semibold ${
            currentPage === "home"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentPage("jobcraft")}
          className={`px-6 py-2 rounded-lg font-semibold ${
            currentPage === "jobcraft"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Job Craft
        </button>
        <button
          onClick={() => setCurrentPage("resume grader")}
          className={`px-6 py-2 rounded-lg font-semibold ${
            currentPage === "resume grader"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Resume Grader
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-20">{renderContent()}</div>
    </div>
  </div></>
  );
}

export default App;

