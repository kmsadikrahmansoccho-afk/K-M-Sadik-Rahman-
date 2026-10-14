import React, { useState, useEffect, useRef } from 'react';
import { ShikkhoraLogo } from '../common/ShikkhoraLogo';
import { MoreVertical, ShieldCheck, ArrowRight, GraduationCap, Users } from 'lucide-react';

interface MinimalHomepageProps {
  onOpenStudentLogin: () => void;
  onOpenParentLogin: () => void;
  onOpenAdminLogin: () => void;
}

export const MinimalHomepage: React.FC<MinimalHomepageProps> = ({
  onOpenStudentLogin,
  onOpenParentLogin,
  onOpenAdminLogin,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close three-dot menu on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-200">
      {/* Background Architectural Geometry & Restrained Atmospheric Depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft radial aura representing the dawn of learning */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] bg-gradient-to-tr from-sky-600/10 via-emerald-500/10 to-transparent rounded-full blur-3xl opacity-60" />
        {/* Subtle geometric grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Header Bar: Clean whitespace with the single discrete Three-Dot Menu in top-right */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8 pt-8 flex items-center justify-between">
        {/* Empty placeholder on left to preserve perfect balance */}
        <div className="w-10 h-10" aria-hidden="true" />

        {/* Three-Dot Menu in Top-Right Corner */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Platform options"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 active:bg-slate-800 border border-transparent hover:border-slate-800 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dedicated Menu: Exactly ONE item: Admin Login */}
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors text-left group"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <span>Admin Login</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Center Hero Layout */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-12 text-center max-w-3xl mx-auto">
        {/* 1. The Shikkhora Original Logo and Wordmark */}
        <div className="mb-8 transform transition-transform hover:scale-[1.02] duration-300">
          <ShikkhoraLogo variant="horizontal" size="xl" theme="dark" showTagline={true} />
        </div>

        {/* 2. The Heading: “Welcome to Shikkhora” */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 font-sans">
          Welcome to Shikkhora
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-lg mb-10 leading-relaxed font-sans">
          A world-class educational sanctuary engineered for learners across Bangladesh.
          Inquiry-based mastery from Class 1 through 10, C programming, and web development.
        </p>

        {/* 3 & 4. Student Login and Parent Login Entry Points */}
        <div className="w-full max-w-md flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
          {/* Primary Action: Student Login */}
          <button
            onClick={onOpenStudentLogin}
            className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 group"
          >
            <GraduationCap className="w-4 h-4 text-slate-950" />
            <span>Student Login</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Secondary Action: Parent Login */}
          <button
            onClick={onOpenParentLogin}
            className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm border border-slate-800 hover:border-slate-700 transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 group"
          >
            <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
            <span>Parent Login</span>
          </button>
        </div>
      </div>

      {/* Discrete Footer Notice */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-6 text-center text-xs text-slate-500 font-sans">
        <p>© {new Date().getFullYear()} Shikkhora. All rights reserved. National Curriculum & Textbook Board (NCTB) aligned · Live linked with ChatGPT AI Tutor.</p>
      </footer>
    </main>
  );
};
