"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ResGrader from "./Pages/ResGrader";
import JobCraft from "./Pages/JobCraft";
import HomeContent from "./Pages/HomeContent";
import { Github as GithubIcon } from "lucide-react";
import {
  Github,
  Sparkles,
  Star,
  Zap,
  Target,
  FileText,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  BookOpen,
} from "lucide-react";
import Footer from "./Footer";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleNavigation = (page) => {
    setCurrentPage(page);

    setTimeout(() => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        mainContent.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleStartCrafting = () => {
    setCurrentPage("jobcraft");
    setTimeout(() => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        const offsetTop = mainContent.offsetTop - 20;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const handleGradeResume = () => {
    setCurrentPage("resume grader");
    setTimeout(() => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        const offsetTop = mainContent.offsetTop - 20;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }, 100);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Hero Section */}
        <section
          className={`pt-24 pb-16 transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/20 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg">
              <Sparkles className="w-4 h-4" />
              Powered by Advanced AI Technology
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Gem
              </span>
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent">
                Craft
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your AI-powered resume crafting assistant that transforms careers
              through intelligent optimization
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleStartCrafting}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                Start Crafting
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleGradeResume}
                className="bg-white/70 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-300 border border-white/20 hover:shadow-lg"
              >
                Grade My Resume
              </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1K+</div>
                <div className="text-gray-600">Resumes Optimized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  85%
                </div>
                <div className="text-gray-600">Interview Rate Increase</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">2K+</div>
                <div className="text-gray-600">Job Matches Made</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  4.9/5
                </div>
                <div className="text-gray-600">User Rating</div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-gray-800 mb-1">
                  Smart Matching
                </div>
                <div className="text-sm text-gray-600">
                  AI-powered job alignment that identifies key skills and
                  requirements
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-gray-800 mb-1">
                  Detailed Analysis
                </div>
                <div className="text-sm text-gray-600">
                  Comprehensive feedback with actionable improvement suggestions
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold text-gray-800 mb-1">
                  Instant Results
                </div>
                <div className="text-sm text-gray-600">
                  Real-time optimization with immediate feedback and
                  improvements
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-16 bg-white/40 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                How GemCraft Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Transform your resume in three simple steps with our AI-powered
                optimization engine
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  1. Upload Your Resume
                </h3>
                <p className="text-gray-600">
                  Upload your current resume and let our AI analyze your
                  experience, skills, and achievements
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  2. Add Job Description
                </h3>
                <p className="text-gray-600">
                  Paste the job description you're targeting and our AI will
                  identify key requirements and skills
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  3. Get Optimized Results
                </h3>
                <p className="text-gray-600">
                  Receive personalized suggestions and improvements to make your
                  resume stand out to employers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to create a winning resume that gets noticed
                by recruiters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  ATS Optimization
                </h3>
                <p className="text-gray-600">
                  Ensure your resume passes Applicant Tracking Systems with
                  keyword optimization and formatting
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Real-time Feedback
                </h3>
                <p className="text-gray-600">
                  Get rapid responses and improvement tips within seconds
                  whenever you query your resume—no waiting, just actionable
                  insights.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Privacy Focused
                </h3>
                <p className="text-gray-600">
                  Your data is secure and private. We never store your personal
                  information or resume content
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Smart Suggestions
                </h3>
                <p className="text-gray-600">
                  AI-powered recommendations for better word choices, phrases,
                  and content structure
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 bg-white/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-lg">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                More Features Coming Soon
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We're working on exciting new features to make your job search
                even more successful
              </p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Stay tuned for updates
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Sub Navigation */}
            <nav className="border-b border-gray-100 bg-white/50 backdrop-blur-sm overflow-x-auto">
              <div className="flex justify-center gap-1 p-2 min-w-max">
                {[
                  { key: "home", label: "Home", icon: Sparkles },
                  { key: "jobcraft", label: "Job Craft", icon: Target },
                  { key: "resume grader", label: "Resume Grader", icon: Award },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleNavigation(key)}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm whitespace-nowrap ${
                      currentPage === key
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden xs:inline sm:inline">{label}</span>
                    <span className="xs:hidden sm:hidden">
                      {key === "home"
                        ? "Home"
                        : key === "jobcraft"
                        ? "Craft"
                        : key === "resume grader"
                        ? "Grade"
                        : key === "features"
                        ? "Feat"
                        : key === "pricing"
                        ? "Price"
                        : "About"}
                    </span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Content Area */}
            <div className="p-4 md:p-12 min-h-[600px]">
              <div
                className={`transition-all duration-500 ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {renderContent()}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default App;
