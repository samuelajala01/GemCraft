import {
    Github,
    Sparkles
  } from "lucide-react";

const Footer = () => {
    return ( <>
    <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    GemCraft
                  </div>
                </div>
                <p className="text-gray-600 mb-4 max-w-md">
                  Transform your career with AI-powered resume optimization. Get
                  noticed by recruiters and land your dream job.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/samuelajala01/gemcraft"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Product</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <a
                      href=""
                      className="hover:text-blue-600 transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how-it-works"
                      className="hover:text-blue-600 transition-colors"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="hover:text-blue-600 transition-colors"
                    >
                      Testimonials
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Support</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <a
                      href=""
                      className="hover:text-blue-600 transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="hover:text-blue-600 transition-colors"
                    >
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/samuelajala01"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="hover:text-blue-600 transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
              <p>
                © 2025 GemCraft. Crafted with ❤️ and ⚡ for your career success.
              </p>
            </div>
          </div>
        </footer></> );
}
 
export default Footer;