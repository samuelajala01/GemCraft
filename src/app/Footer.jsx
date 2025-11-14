import {
    Github,
    Sparkles
  } from "lucide-react";

const Footer = () => {
    return ( <>
    <footer className="border-t py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">
                    GemCraft
                  </div>
                </div>
                <p className=" mb-4 max-w-md">
                  Transform your career with AI-powered resume optimization. Get
                  noticed by recruiters and land your dream job.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/samuelajala01/gemcraft"
                    className=" transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 ">
                  <li>
                    <a
                      href=""
                      className=" transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how-it-works"
                      className=" transition-colors"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="transition-colors"
                    >
                      Testimonials
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold  mb-4">Support</h3>
                <ul className="space-y-2 ">
                  <li>
                    <a
                      href=""
                      className=" transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className=" transition-colors"
                    >
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/samuelajala01"
                      className="transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href=""
                      className="transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t mt-8 pt-8 text-center text-gray-500">
              <p>
                © 2025 GemCraft. Crafted with care for your career success.
              </p>
            </div>
          </div>
        </footer></> );
}
 
export default Footer;