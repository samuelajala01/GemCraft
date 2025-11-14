import { Sparkles, Target, Zap, Award, Star } from "lucide-react";

const HomeContent = ({ onNavigate }) => (
  <div className="space-y-12">
    <div className="text-center space-y-6">
      <div className="inline-flex items-center gap-2 ] px-4 py-2 rounded-full text-sm font-medium border">
        <Sparkles className="w-4 h-4" />
        AI-Powered Resume Enhancement
      </div>
      <h2 className="text-4xl my-4 font-bold leading-tight">
        Transform Your Career with
        <span className=""> Smart Resume Tools</span>
      </h2>
      <p className="text-xl my-4 max-w-3xl mx-auto leading-relaxed">
        Leverage cutting-edge AI to craft compelling resumes, optimize job applications, and get detailed feedback to land your dream job.
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 mt-16 gap-8 max-w-4xl mx-auto">
      <div 
        onClick={() => onNavigate("jobcraft")}
        className="group cursor-pointer  p-8 rounded-2xl border border-[#4a5568] hover:border-[#ff6b6b]/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl group-hover:bg-[#ff6b6b]/20 transition-colors">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold ">Job Craft</h3>
        </div>
        <p className=" mb-6 leading-relaxed">
          Create tailored resumes that perfectly match job descriptions using advanced AI analysis and optimization.
        </p>
        <div className="flex items-center font-medium group-hover:gap-3 gap-2 transition-all">
          Start Crafting <Zap className="w-4 h-4" />
        </div>
      </div>
      
      <div 
        onClick={() => onNavigate("resume grader")}
        className="group cursor-pointer  p-8 rounded-2xl border border-[#4a5568] hover:border-[#ff6b6b]/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl group-hover:bg-[#ff6b6b]/20 transition-colors">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold ">Resume Grader</h3>
        </div>
        <p className=" mb-6 leading-relaxed">
          Get comprehensive feedback and scoring on your resume with actionable insights to improve your chances.
        </p>
        <div className="flex items-center font-medium group-hover:gap-3 gap-2 transition-all">
          Grade Resume <Star className="w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
);


export default HomeContent;