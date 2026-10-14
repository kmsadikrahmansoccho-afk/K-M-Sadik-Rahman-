import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { CodeModule, User } from '../../types';
import {
  ChevronLeft,
  Play,
  Terminal,
  CheckCircle,
  HelpCircle,
  Code2,
  RefreshCw,
  Award,
  Sparkles,
  BookOpen,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface CLearningViewProps {
  user: User;
  onBack: () => void;
}

export const CLearningView: React.FC<CLearningViewProps> = ({ user, onBack }) => {
  const [modules, setModules] = useState<CodeModule[]>([]);
  const [activeModule, setActiveModule] = useState<CodeModule | null>(null);
  const [editorCode, setEditorCode] = useState<string>('');
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'learn' | 'exercise' | 'quiz'>('learn');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    api.getCodeModules('c')
      .then((res) => {
        setModules(res.modules);
        if (res.modules.length > 0) {
          selectModule(res.modules[0]);
        }
      })
      .catch((err) => console.error('Failed to load C modules:', err));
  }, []);

  const selectModule = (mod: CodeModule) => {
    setActiveModule(mod);
    setEditorCode(mod.starterCode);
    setTerminalOutput(`/* Ready to run ${mod.title} */\nClick 'Run Code' to execute in the Shikkhora C Sandbox.`);
    setActiveTab('learn');
    setSelectedQuizAnswers({});
    setQuizScore(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setTerminalOutput('Compiling C source...\n[gcc -O2 -Wall main.c -o main]\nRunning executable...');
    try {
      const res = await api.runCCode(editorCode);
      if (res.success) {
        setTerminalOutput(`[Execution Success]\nExit Code: ${res.exitCode}\n\n--- Program Output ---\n${res.output}`);
      } else {
        setTerminalOutput(`[Compilation Error]\nExit Code: ${res.exitCode}\n\n${res.error}`);
      }
    } catch (err: any) {
      setTerminalOutput(`Execution error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeModule) return;
    try {
      await api.completeCodeModule(activeModule.id, 'c');
      if (!completedModuleIds.includes(activeModule.id)) {
        setCompletedModuleIds((prev) => [...prev, activeModule.id]);
      }
      alert('Module completed and recorded in your study profile!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to Student Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-xs font-bold">
                C Lang
              </span>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                C Language Learning
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              Structured Curriculum: 21 Modules from Beginner to Advanced Systems
            </p>
          </div>
        </div>

        {/* Complete Module Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkComplete}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium text-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Mark Module Completed</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Module Sidebar (1-21) */}
        <aside className="w-full lg:w-80 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 lg:max-h-[calc(100vh-65px)] overflow-y-auto p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>21 Curriculum Modules</span>
            <span className="text-emerald-400">{completedModuleIds.length}/{modules.length} Done</span>
          </div>

          <div className="space-y-1.5">
            {modules.map((mod) => {
              const isSelected = activeModule?.id === mod.id;
              const isCompleted = completedModuleIds.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  onClick={() => selectModule(mod)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-slate-800 border-sky-500/40 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-sky-400 shrink-0 mt-0.5">
                    {String(mod.moduleNumber).padStart(2, '0')}.
                  </span>
                  <div className="overflow-hidden flex-1">
                    <div className="text-xs font-semibold truncate">{mod.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>{mod.level}</span>
                      {isCompleted && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          ✓ Done
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center / Right Content: Theory & Interactive Code Runner */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden lg:max-h-[calc(100vh-65px)]">
          {/* Left Sub-Panel: Lesson Theory & Exercises */}
          <div className="flex-1 flex flex-col border-r border-slate-800 overflow-y-auto">
            {/* Tab navigation */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center gap-3">
              <button
                onClick={() => setActiveTab('learn')}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                  activeTab === 'learn'
                    ? 'border-emerald-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Concept & Theory
              </button>
              <button
                onClick={() => setActiveTab('exercise')}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                  activeTab === 'exercise'
                    ? 'border-emerald-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Practical Exercise
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                  activeTab === 'quiz'
                    ? 'border-emerald-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Quick Quiz
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {activeModule && activeTab === 'learn' && (
                <>
                  <div>
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-widest font-mono">
                      Module {activeModule.moduleNumber} · {activeModule.level}
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                      {activeModule.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">{activeModule.summary}</p>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
                    {activeModule.content}
                  </div>
                </>
              )}

              {activeModule && activeTab === 'exercise' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                      Hands-on Task
                    </h3>
                    <p className="text-xs sm:text-sm">{activeModule.exercisePrompt}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    Edit the starter code in the right panel and press <strong>Run Code</strong> to inspect the output.
                  </p>
                </div>
              )}

              {activeModule && activeTab === 'quiz' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Module Knowledge Verification
                  </h3>
                  {activeModule.quizQuestions?.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <p className="text-xs font-medium text-white">{q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                              selectedQuizAnswers[qIdx] === optIdx
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`quiz_q_${qIdx}`}
                              checked={selectedQuizAnswers[qIdx] === optIdx}
                              onChange={() => setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                              className="text-emerald-500 focus:ring-0"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      {selectedQuizAnswers[qIdx] !== undefined && (
                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                          {selectedQuizAnswers[qIdx] === q.correctIndex ? (
                            <span className="text-emerald-400 font-bold">✓ Correct! {q.explanation}</span>
                          ) : (
                            <span className="text-rose-400 font-medium">✕ Not quite. {q.explanation}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sub-Panel: Live C Code Editor & Output Terminal */}
          <div className="w-full lg:w-[480px] bg-slate-950 flex flex-col shrink-0 border-t lg:border-t-0">
            {/* Editor Top Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono font-medium text-slate-300">main.c</span>
              </div>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 transition-all"
              >
                {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Run Code</span>
              </button>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 min-h-[260px] p-4 bg-slate-950">
              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full min-h-[240px] bg-transparent text-emerald-300 font-mono text-xs leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Terminal Window */}
            <div className="h-48 border-t border-slate-800 bg-slate-900/90 flex flex-col">
              <div className="bg-slate-900 px-4 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Terminal Output</span>
                </div>
                <button
                  onClick={() => setTerminalOutput('')}
                  className="hover:text-slate-200 transition-colors"
                >
                  Clear
                </button>
              </div>
              <pre className="flex-1 p-3 font-mono text-[11px] text-slate-300 overflow-auto whitespace-pre-wrap leading-relaxed select-text">
                {terminalOutput}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
