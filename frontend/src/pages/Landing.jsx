import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Layout, Code2, Cpu, CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 text-indigo-400 text-xs px-3.5 py-1.5 rounded-full font-medium mb-6">
          <Layers className="w-3.5 h-3.5" />
          <span>Design to Implementation Workflow for Developers</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Turn UI Designs into Actionable <br />
          <span className="text-indigo-400">Web Application Implementation Plans</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Vision2System helps developers organize UI wireframes, screenshot references, and technical requirements into clean, structured MERN stack architecture specifications.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-md transition shadow-sm w-full sm:w-auto justify-center"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-medium px-6 py-3 rounded-md transition w-full sm:w-auto justify-center"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="border-t border-slate-900 bg-slate-900/40 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-100 mb-12">
            Simple Developer Workflow
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
              <div className="w-9 h-9 bg-slate-800 text-indigo-400 rounded-md flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-slate-200 text-sm">Design / Idea</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Provide a website screenshot link, UI design reference, or project description.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
              <div className="w-9 h-9 bg-slate-800 text-indigo-400 rounded-md flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-slate-200 text-sm">Create Project</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Specify initial technologies, target components, and architectural goals.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
              <div className="w-9 h-9 bg-slate-800 text-indigo-400 rounded-md flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-slate-200 text-sm">Implementation Plan</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Generate structured breakdown of Pages, React components, REST APIs, and DB schema.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
              <div className="w-9 h-9 bg-slate-800 text-indigo-400 rounded-md flex items-center justify-center font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold text-slate-200 text-sm">Development</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Build your project efficiently with a clear technical roadmap.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
            <Layout className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="font-semibold text-slate-200 text-base">Organized References</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Keep your UI inspiration, design links, and targeted frontend pages in one central developer dashboard.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
            <Code2 className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="font-semibold text-slate-200 text-base">Full Stack Specifications</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Automatically maps front-end pages and UI components to express API endpoints and database collections.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
            <Cpu className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="font-semibold text-slate-200 text-base">AI Plan Assistance</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Leverage Google Gemini API to generate instant step-by-step developer execution roadmaps.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>Vision2System — Developer Portfolio Project (MERN Stack)</p>
      </footer>

    </div>
  );
};

export default Landing;
