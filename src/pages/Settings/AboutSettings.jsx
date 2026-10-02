import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useTranslation } from '../../context/LanguageContext';
import { Mail, User, Code2, BrainCircuit } from 'lucide-react';

export function AboutSettings() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('aboutTitle', 'About')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('aboutDesc', 'Information about the developer and technical details of the civic triage platform.')}</p>
      </div>

      {/* SECTION 1: ABOUT ME */}
      <Card className="border-blue-100 dark:border-slate-700 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white dark:from-slate-800/90 dark:via-slate-800/60 dark:to-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <User size={20} />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900 dark:text-white font-bold">About Me</CardTitle>
              <p className="text-xs text-gray-500 dark:text-slate-400">Developer & Project Creator</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5 text-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Amit Kumar</h3>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Lead Full-Stack & Civic AI Developer</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-1.5">
                <Mail size={13} className="text-gray-400 dark:text-slate-500" />
                <a href="mailto:kumaramitbth2005@gmail.com" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors font-medium">
                  kumaramitbth2005@gmail.com
                </a>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full shrink-0 shadow-xs">
              Project Creator
            </span>
          </div>

          <div className="space-y-3 leading-relaxed text-xs sm:text-sm text-gray-700 dark:text-slate-200">
            <p>
              I am a passionate software engineer specializing in <strong className="text-gray-900 dark:text-white font-semibold">full-stack web applications, AI-assisted automation, and civic technology systems</strong>. My focus is building robust, highly responsive platforms that solve real-world community and municipal governance challenges.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-xs">
                <div className="font-semibold text-gray-900 dark:text-white text-xs flex items-center gap-1.5 mb-1.5">
                  <Code2 size={15} className="text-indigo-600 dark:text-indigo-400" /> 
                  <span>Technical Skills</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  React 19, JavaScript/Node.js, Express, MongoDB, RESTful APIs, TailwindCSS, Web Speech API.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-xs">
                <div className="font-semibold text-gray-900 dark:text-white text-xs flex items-center gap-1.5 mb-1.5">
                  <BrainCircuit size={15} className="text-blue-600 dark:text-blue-400" /> 
                  <span>Project Contributions</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  End-to-end architecture, multi-user isolation, real-time AI triage engine, and multi-language internationalization.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: PLATFORM DETAILS */}
      <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800">
          <CardTitle className="text-gray-900 dark:text-white font-bold">Platform Specifications</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs sm:text-sm">
            <div>
              <dt className="text-gray-500 dark:text-slate-400 font-medium">Application Name</dt>
              <dd className="font-semibold text-gray-900 dark:text-white mt-0.5">City Complaint Triage & Dispatch Platform</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-slate-400 font-medium">Version</dt>
              <dd className="font-semibold text-gray-900 dark:text-white mt-0.5">v2.4.0 (Enterprise Civic Edition)</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-slate-400 font-medium">Core Capabilities</dt>
              <dd className="font-semibold text-gray-900 dark:text-white mt-0.5">Multimodal Citizen Intake (Voice, Text, Photo), AI Ward Routing, Duplicate Deduplication</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-slate-400 font-medium">Supported Languages</dt>
              <dd className="font-semibold text-gray-900 dark:text-white mt-0.5">10 Indian Regional Languages (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, English)</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
