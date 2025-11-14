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

    // Add scroll-smooth class to html element for enhanced scrolling
    document.documentElement.classList.add("scroll-smooth");

    // Handle smooth scrolling for anchor links
    const handleAnchorClick = (e) => {
      const href = e.target.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          smoothScrollTo(targetElement, 80); // Extra offset for better spacing
        }
      }
    };

    // Throttle function for performance optimization
    const throttle = (func, limit) => {
      let inThrottle;
      return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    };

    // Optimize scroll performance with passive listeners
    const optimizeScrolling = () => {
      // Enable passive scroll listeners for better performance
      const handleScroll = throttle(() => {
        // Optional: Add any scroll-based animations or effects here
      }, 16); // 60fps throttling

      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    };

    const cleanupScroll = optimizeScrolling();

    // Add event listener for anchor links
    document.addEventListener("click", handleAnchorClick);

    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove("scroll-smooth");
      document.removeEventListener("click", handleAnchorClick);
      cleanupScroll();
    };
  }, []);

  // Enhanced smooth scroll function with better performance
  const smoothScrollTo = (element, offset = 0) => {
    if (!element) return;

    const targetPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = Math.min(1000, Math.abs(distance) * 0.5); // Dynamic duration based on distance
    let startTime = null;

    // Easing function for natural feel
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animateScroll = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);

    setTimeout(() => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        smoothScrollTo(mainContent, 20);
      }
    }, 50); // Reduced timeout for faster response
  };

  const handleStartCrafting = () => {
    setCurrentPage("jobcraft");
    setTimeout(() => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        smoothScrollTo(mainContent, 20);
      }
    }, 50);
  };

  const handleGradeResume = () => {
    setCurrentPage("resume grader");
    setTimeout(() => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        smoothScrollTo(mainContent, 20);
      }
    }, 50);
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
      <div className="min-h-screen">
        {/* Clean background */}

        <section
          className={`pt-24 pb-16 transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-6xl md:text-8xl font-black lg:my-12">
              <span className="">Gem</span>
              <span className="">Craft</span>
            </h1>

            <p className="text-xl md:text-2xl  mb-12 max-w-3xl mx-auto leading-relaxed">
              Your resume crafting tool that transforms your resume through
              intelligent optimization
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleStartCrafting}
                className="group  px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#ff5252] hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                Start Crafting
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleGradeResume}
                className=" px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#4a5568] transition-all duration-300 border border-[#4a5568] hover:shadow-lg"
              >
                Grade My Resume
              </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">1K+</div>
                <div className="">Resumes Optimized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">85%</div>
                <div className="">Interview Rate Increase</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold  mb-2">2K+</div>
                <div className="">Job Matches Made</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold  mb-2">
                  4.9/5
                </div>
                <div className="">User Rating</div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
              <div className=" p-6 rounded-2xl border border-[#4a5568] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <div className="font-semibold  mb-1">
                  Smart Matching
                </div>
                <div className="text-sm ">
                  AI-powered job alignment that identifies key skills and
                  requirements
                </div>
              </div>
              <div className=" p-6 rounded-2xl border border-[#4a5568] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12  rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="font-semibold  mb-1">
                  Detailed Analysis
                </div>
                <div className="text-sm">
                  Comprehensive feedback with actionable improvement suggestions
                </div>
              </div>
              <div className=" p-6 rounded-2xl border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12  rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="font-semibold mb-1">
                  Instant Results
                </div>
                <div className="text-sm">
                  Real-time optimization with immediate feedback and
                  improvements
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 ">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                How GemCraft Works
              </h2>
              <p className="text-xl max-w-2xl mx-auto">
                Transform your resume in three simple steps with our AI-powered
                optimization engine
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 " />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  1. Upload Your Resume
                </h3>
                <p className="">
                  Upload your current resume and let our AI analyze your
                  experience, skills, and achievements
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 " />
                </div>
                <h3 className="text-xl font-semibold  mb-3">
                  2. Add Job Description
                </h3>
                <p className="">
                  Paste the job description you're targeting and our AI will
                  identify key requirements and skills
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 " />
                </div>
                <h3 className="text-xl font-semibold  mb-3">
                  3. Get Optimized Results
                </h3>
                <p className="">
                  Receive personalized suggestions and improvements to make your
                  resume stand out to employers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 ">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold  mb-4">
                Powerful Features
              </h2>
              <p className="text-xl  max-w-2xl mx-auto">
                Everything you need to create a winning resume that gets noticed
                by recruiters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className=" p-6 rounded-2xl border border-[#4a5568] shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12  rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 " />
                </div>
                <h3 className="text-lg font-semibold  mb-3">
                  ATS Optimization
                </h3>
                <p className="">
                  Ensure your resume passes Applicant Tracking Systems with
                  keyword optimization and formatting
                </p>
              </div>
              <div className=" p-6 rounded-2xl border border-[#4a5568] shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12  rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 " />
                </div>
                <h3 className="text-lg font-semibold mb-3">
                  Real-time Feedback
                </h3>
                <p className="">
                  Get rapid responses and improvement tips within seconds
                  whenever you query your resume—no waiting, just actionable
                  insights.
                </p>
              </div>

              <div className=" p-6 rounded-2xl border shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12  rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 " />
                </div>
                <h3 className="text-lg font-semibold mb-3">
                  Privacy Focused
                </h3>
                <p className="">
                  Your data is secure and private. We never store your personal
                  information or resume content
                </p>
              </div>

              <div className=" p-6 rounded-2xl border shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12  rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 " />
                </div>
                <h3 className="text-lg font-semibold mb-3">
                  Smart Suggestions
                </h3>
                <p className="">
                  AI-powered recommendations for better word choices, phrases,
                  and content structure
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 ">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="p-8 rounded-2xl border shadow-lg">
              <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 " />
              </div>
              <h2 className="text-3xl font-bold  mb-4">
                More Features Coming Soon
              </h2>
              <p className="text-lg mb-6">
                We're working on exciting new features to make your job search
                even more successful
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border">
                Stay tuned for updates
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 pb-16">
          <div className=" backdrop-blur-lg rounded-3xl shadow-2xl border overflow-hidden">
            {/* Sub Navigation */}
            <nav className="border-b  backdrop-blur-sm overflow-x-auto">
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
                        : " hover:text-gray-800 hover:bg-white/60"
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
