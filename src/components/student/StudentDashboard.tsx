import React, { useState, useEffect } from 'react';
import { ShikkhoraLogo } from '../common/ShikkhoraLogo';
import { NctbLearningView } from './NctbLearningView';
import { AiTutorView } from './AiTutorView';
import { CLearningView } from './CLearningView';
import { HtmlLearningView } from './HtmlLearningView';
import { AssessmentModal } from './AssessmentModal';
import { FiveDayReportModal } from './FiveDayReportModal';
import { ChatGPTModal } from '../common/ChatGPTModal';
import { api, clearSession } from '../../services/api';
import type { User, AuthSession, ExamSubmission } from '../../types';
import {
  BookOpen,
  Sparkles,
  Terminal,
  Globe,
  LogOut,
  User as UserIcon,
  FileCheck2,
  Clock,
  Award,
  ChevronRight,
  School,
  MapPin,
  CheckCircle,
  Bot,
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  session: AuthSession;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  session,
  onLogout,
}) => {
  // Navigation state among the 4 primary options
  const [activeView, setActiveView] = useState<'home' | 'nctb' | 'ai' | 'c' | 'html'>('home');

  // Secondary utilities modals
  const [showFiveDayReport, setShowFiveDayReport] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChatGPTModal, setShowChatGPTModal] = useState(false);

  // Assessment Modal state
  const [assessmentModalState, setAssessmentModalState] = useState<{
    isOpen: boolean;
    type: 'quiz' | 'exam';
    chapterId: string;
    chapterTitle: string;
  }>({
    isOpen: false,
    type: 'quiz',
    chapterId: '',
    chapterTitle: '',
  });

  // Real student exam submissions state
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);

  // Active study duration timer in seconds
  const [activeStudySeconds, setActiveStudySeconds] = useState(0);

  useEffect(() => {
    // Increment study timer when tab is active
    const timer = setInterval(() => {
      setActiveStudySeconds((prev) => prev + 1);
    }, 1000);

    // Fetch initial exam submissions
    api.getMyExamSubmissions()
      .then((res) => setExamSubmissions(res.submissions))
      .catch((err) => console.error(err));

    return () => clearInterval(timer);
  }, []);

  // Periodic session logging (every 2 minutes)
  useEffect(() => {
    if (activeStudySeconds > 0 && activeStudySeconds % 120 === 0) {
      api.logStudySession(2, 'lesson', `Active learning in ${activeView} mode`).catch(() => {});
    }
  }, [activeStudySeconds, activeView]);

  const handleStartQuiz = (chapterId: string, chapterTitle: string) => {
    setAssessmentModalState({
      isOpen: true,
      type: 'quiz',
      chapterId,
      chapterTitle,
    });
  };

  const handleStartExam = (chapterId: string, chapterTitle: string) => {
    setAssessmentModalState({
      isOpen: true,
      type: 'exam',
      chapterId,
      chapterTitle,
    });
  };

  // If one of the 4 primary options is active, render its functional workspace
  if (activeView === 'nctb') {
    return (
      <>
        <NctbLearningView
          user={user}
          onBack={() => setActiveView('home')}
          onStartQuiz={handleStartQuiz}
          onStartExam={handleStartExam}
        />
        <AssessmentModal
          isOpen={assessmentModalState.isOpen}
          type={assessmentModalState.type}
          chapterId={assessmentModalState.chapterId}
          chapterTitle={assessmentModalState.chapterTitle}
          onClose={() => setAssessmentModalState((prev) => ({ ...prev, isOpen: false }))}
          onCompleted={() => {
            api.getMyExamSubmissions().then((res) => setExamSubmissions(res.submissions)).catch(() => {});
          }}
        />
      </>
    );
  }

  if (activeView === 'ai') {
    return <AiTutorView user={user} onBack={() => setActiveView('home')} />;
  }

  if (activeView === 'c') {
    return <CLearningView user={user} onBack={() => setActiveView('home')} />;
  }

  if (activeView === 'html') {
    return <HtmlLearningView user={user} onBack={() => setActiveView('home')} />;
  }

  // Home Dashboard with EXACTLY four primary learning option cards + secondary utilities in header/footer
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <ShikkhoraLogo variant="horizontal" size="sm" theme="dark" showTagline={false} />

          {/* Secondary Utilities Bar (Active Timer, Reports, Profile, Logout) */}
          <div className="flex items-center gap-3">
            {/* Active Learning Session Timer */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{Math.floor(activeStudySeconds / 60)}m active</span>
            </div>

            {/* Live ChatGPT Assistant Trigger */}
            <button
              onClick={() => setShowChatGPTModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title="Open ChatGPT & AI Study Assistant"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask ChatGPT</span>
            </button>

            {/* Five-Day Progress Report Trigger */}
            <button
              onClick={() => setShowFiveDayReport(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">5-Day Report</span>
            </button>

            {/* Exam Results History */}
            <button
              onClick={() => setShowResultsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Results ({examSubmissions.length})</span>
            </button>

            {/* Student Profile */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Student Profile"
            >
              <UserIcon className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Student Hub */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col justify-center">
        {/* Welcome greeting */}
        <div className="mb-10">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Student Learning Portal · Class {user.studentClass || 9}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Choose from the four dedicated learning pathways below to continue your educational journey today.
          </p>
        </div>

        {/* EXACTLY FOUR PRIMARY LEARNING OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PRIMARY OPTION 1: Classes 1–10 Lessons */}
          <div
            onClick={() => setActiveView('nctb')}
            className="group relative cursor-pointer p-7 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Primary Option One
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                Classes 1–10 Lessons
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                National Curriculum & Textbook Board (NCTB) subjects from Class 1 through 10. Read textbook chapters, guided inquiries, mandatory 20-mark quizzes, and 100-mark examinations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>Open Class {user.studentClass || 9} Curriculum</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* PRIMARY OPTION 2: AI Learning (ChatGPT-Style Tutor) */}
          <div
            onClick={() => setActiveView('ai')}
            className="group relative cursor-pointer p-7 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider font-mono">
                Primary Option Two
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                AI Learning
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                ChatGPT-style personal AI tutoring workspace for questions in Bangla and English, step-by-step mathematical problem solving, diagram analysis, and speech interaction.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-sky-300">
              <span>Enter AI Tutoring Workspace</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* PRIMARY OPTION 3: C Language Learning */}
          <div
            onClick={() => setActiveView('c')}
            className="group relative cursor-pointer p-7 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                Primary Option Three
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                C Language Learning
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Structured 21-module C programming curriculum from fundamentals to pointers, dynamic memory, and algorithms, complete with an interactive in-browser compiler sandbox.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
              <span>Launch C Programming Lab</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* PRIMARY OPTION 4: HTML Learning */}
          <div
            onClick={() => setActiveView('html')}
            className="group relative cursor-pointer p-7 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                Primary Option Four
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                HTML Learning
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Progressive 19-module web development laboratory covering semantic HTML5, accessible forms, audio/video, CSS styling, JavaScript integration, and live sandboxed previews.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
              <span>Launch Web Development Lab</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </main>

      {/* Secondary Utility Modals */}
      <FiveDayReportModal
        isOpen={showFiveDayReport}
        studentId={user.id}
        studentName={user.fullName}
        onClose={() => setShowFiveDayReport(false)}
      />

      {/* Exam Results History Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white">Your Examination Submissions</h3>
              <button
                onClick={() => setShowResultsModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {examSubmissions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No examination submissions recorded yet. Take an exam under Classes 1–10 Lessons!
              </p>
            ) : (
              <div className="space-y-3">
                {examSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">Chapter Examination</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        sub.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    {sub.finalGrade ? (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-300">Grade: {sub.finalGrade.letterGrade}</span>
                        <span className="font-mono font-bold text-white">{sub.finalGrade.totalScore} / 100</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        Target publication: within 48 hours ({new Date(sub.targetPublicationTime).toLocaleDateString()})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white">Student Account Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Full Name</span>
                <span className="font-semibold text-white">{user.fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Email</span>
                <span className="font-mono text-slate-300">{user.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Curriculum Class</span>
                <span className="font-semibold text-emerald-400">Class {user.studentClass || 9} (NCTB)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Institution</span>
                <span className="text-white">{user.schoolName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">District / City</span>
                <span className="text-white">{user.cityOrDistrict || 'Bangladesh'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Email Verification</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Linked ChatGPT Assistant Modal */}
      <ChatGPTModal
        isOpen={showChatGPTModal}
        onClose={() => setShowChatGPTModal(false)}
      />
    </div>
  );
};
