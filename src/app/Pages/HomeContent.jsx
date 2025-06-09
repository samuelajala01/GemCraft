import { Sparkles, Target, Zap, Award, Star } from "lucide-react";

const HomeContent = ({ onNavigate }) => (
  <div className="space-y-12">
    <div className="text-center space-y-6">
      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
        <Sparkles className="w-4 h-4" />
        AI-Powered Resume Enhancement
      </div>
      <h2 className="text-4xl my-4 font-bold text-gray-800 leading-tight">
        Transform Your Career with
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Smart Resume Tools</span>
      </h2>
      <p className="text-xl my-4 text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Leverage cutting-edge AI to craft compelling resumes, optimize job applications, and get detailed feedback to land your dream job.
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 mt-16 gap-8 max-w-4xl mx-auto">
      <div 
        onClick={() => onNavigate("jobcraft")}
        className="group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Job Craft</h3>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Create tailored resumes that perfectly match job descriptions using advanced AI analysis and optimization.
        </p>
        <div className="flex items-center text-blue-600 font-medium group-hover:gap-3 gap-2 transition-all">
          Start Crafting <Zap className="w-4 h-4" />
        </div>
      </div>
      
      <div 
        onClick={() => onNavigate("resume grader")}
        className="group cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Resume Grader</h3>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Get comprehensive feedback and scoring on your resume with actionable insights to improve your chances.
        </p>
        <div className="flex items-center text-purple-600 font-medium group-hover:gap-3 gap-2 transition-all">
          Grade Resume <Star className="w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
);


export default HomeContent;