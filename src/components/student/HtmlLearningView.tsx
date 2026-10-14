import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { CodeModule, User } from '../../types';
import {
  ChevronLeft,
  Play,
  Globe,
  CheckCircle,
  Eye,
  Code2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface HtmlLearningViewProps {
  user: User;
  onBack: () => void;
}

export const HtmlLearningView: React.FC<HtmlLearningViewProps> = ({ user, onBack }) => {
  const [modules, setModules] = useState<CodeModule[]>([]);
  const [activeModule, setActiveModule] = useState<CodeModule | null>(null);
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'learn' | 'exercise' | 'quiz'>('learn');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    api.getCodeModules('html')
      .then((res) => {
        setModules(res.modules);
        if (res.modules.length > 0) {
          selectModule(res.modules[0]);
        }
      })
      .catch((err) => console.error('Failed to load HTML modules:', err));
  }, []);

  const selectModule = (mod: CodeModule) => {
    setActiveModule(mod);
    setHtmlCode(mod.starterCode);
    setActiveTab('learn');
    setSelectedQuizAnswers({});
  };

  const handleMarkComplete = async () => {
    if (!activeModule) return;
    try {
      await api.completeCodeModule(activeModule.id, 'html');
      if (!completedModuleIds.includes(activeModule.id)) {
        setCompletedModuleIds((prev) => [...prev, activeModule.id]);
      }
      alert('HTML module completed and recorded in your study profile!');
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
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                HTML5
              </span>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                HTML & Web Development
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              Modern Web Engineering: 19 Modules from Structure to CSS/JS Integration
            </p>
          </div>
        </div>

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
        {/* Module Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 lg:max-h-[calc(100vh-65px)] overflow-y-auto p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>19 Curriculum Modules</span>
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
                      ? 'bg-slate-800 border-amber-500/40 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-amber-400 shrink-0 mt-0.5">
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

        {/* Center / Right Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden lg:max-h-[calc(100vh-65px)]">
          {/* Left Sub-Panel: Theory, Exercise, Quiz */}
          <div className="flex-1 flex flex-col border-r border-slate-800 overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center gap-3">
              <button
                onClick={() => setActiveTab('learn')}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                  activeTab === 'learn'
                    ? 'border-emerald-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Concept & Semantics
              </button>
              <button
                onClick={() => setActiveTab('exercise')}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                  activeTab === 'exercise'
                    ? 'border-emerald-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Hands-on Task
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                  activeTab === 'quiz'
                    ? 'border-emerald-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Verification Quiz
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {activeModule && activeTab === 'learn' && (
                <>
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
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
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                      Web Challenge
                    </h3>
                    <p className="text-xs sm:text-sm">{activeModule.exercisePrompt}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    Write HTML/CSS in the editor. The preview panel updates live in an isolated sandbox.
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
                              name={`html_q_${qIdx}`}
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

          {/* Right Sub-Panel: HTML Editor & Sandboxed Live Preview */}
          <div className="w-full lg:w-[500px] bg-slate-950 flex flex-col shrink-0 border-t lg:border-t-0">
            {/* Editor Top Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-medium text-slate-300">index.html</span>
              </div>
              <span className="text-[10px] text-slate-400">Live Sandboxed Rendering</span>
            </div>

            {/* Code Input */}
            <div className="h-56 p-4 bg-slate-950 border-b border-slate-800">
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent text-amber-200 font-mono text-xs leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Live Sandboxed Preview */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="bg-slate-100 px-4 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-sans">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold">Browser Preview</span>
                </div>
                <span className="text-[10px] text-slate-400">Isolated & Secure Sandbox</span>
              </div>
              <iframe
                title="HTML Preview"
                srcDoc={htmlCode}
                sandbox="allow-scripts"
                className="w-full flex-1 border-none min-h-[240px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
