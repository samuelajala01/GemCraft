import { useState } from "react";
import "./App.css";
import ResGrader from "./Pages/ResGrader";
import JobCraft from "./Pages/JobCraft";
import HomeContent from "./Pages/HomeContent";
import { Github as GithubIcon } from "lucide-react";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);

  // Navigation handler function
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return <HomeContent onNavigate={handleNavigation} />;

      case "jobcraft":
        return <JobCraft />;

      case "resume grader":
        return <ResGrader />;

      default:
        return <HomeContent onNavigate={handleNavigation} />;
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">GemCraft</div>
          <a
            href="https://github.com/samuelajala01/gemcraft"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <GithubIcon size={24} />
          </a>
        </div>
      </div>
      <div className="text-center mt-32 mb-8">
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
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                currentPage === "home"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage("jobcraft")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                currentPage === "jobcraft"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Job Craft
            </button>
            <button
              onClick={() => setCurrentPage("resume grader")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
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
      </div>
    </>
  );
}

export default App;
