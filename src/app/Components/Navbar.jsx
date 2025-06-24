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
import Link from "next/link";

const Navbar = () => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-sm z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GemCraft
              </div>
            </div>

            <div className="flex gap-8">
              <a
                href="#pricing"
                className="hidden sm:inline-block text-gray-600 hover:text-gray-900"
              >
                How it Works
              </a>
              <a
                href="/pricing"
                className="hidden sm:inline-block text-gray-600 hover:text-gray-900"
              >
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Link href="/auth">
                  <button className="py-1.5 sm:py-2 px-4 sm:px-6 bg-purple-600 text-white text-sm sm:text-base rounded-md hover:bg-purple-700 transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="py-1.5 sm:py-2 px-4 sm:px-6 bg-white text-purple-600 text-sm sm:text-base rounded-md border border-purple-600 hover:bg-purple-50 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
