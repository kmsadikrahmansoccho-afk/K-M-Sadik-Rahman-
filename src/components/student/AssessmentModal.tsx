import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ChapterQuiz, ChapterExam } from '../../types';
import {
  X,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  ChevronRight,
  ShieldAlert,
  Send,
} from 'lucide-react';

interface AssessmentModalProps {
  isOpen: boolean;
  type: 'quiz' | 'exam';
  chapterId: string;
  chapterTitle: string;
  onClose: () => void;
  onCompleted: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  type,
  chapterId,
  chapterTitle,
  onClose,
  onCompleted,
}) => {
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<ChapterQuiz | null>(null);
  const [examData, setExamData] = useState<ChapterExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState<any | null>(null);

  // Exam timer states
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(75 * 60);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setResultSummary(null);
    setAnswers({});
    setExamStarted(false);

    if (type === 'quiz') {
      api.getQuiz(chapterId)
        .then((res) => setQuizData(res.quiz))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      api.getExam(chapterId)
        .then((res) => {
          setExamData(res.exam);
          setTimeRemainingSeconds((res.exam.durationMinutes || 75) * 60);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, type, chapterId]);

  // Exam countdown timer
  useEffect(() => {
    if (!examStarted || type !== 'exam' || resultSummary) return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExamSubmit(); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, type, resultSummary]);

  if (!isOpen) return null;

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizData) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitQuiz(quizData.id, answers);
      setResultSummary(res);
      onCompleted();
    } catch (err: any) {
      alert(`Error submitting quiz: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExamSubmit = async () => {
    if (!examData) return;
    if (!confirm('Are you sure you wish to finalize and submit your 100-mark examination? You cannot edit answers after submission.')) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.submitExam(examData.id, answers, new Date().toISOString());
      setResultSummary(res);
      onCompleted();
    } catch (err: any) {
      alert(`Error submitting exam: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${type === 'quiz' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {type === 'quiz' ? <Award className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {type === 'quiz' ? 'Mandatory Chapter Quiz (20 Marks)' : 'Comprehensive Chapter Examination (100 Marks)'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {chapterTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {type === 'exam' && examStarted && !resultSummary && (
              <div className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 ${
                timeRemainingSeconds < 300 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' : 'bg-slate-950 border-slate-800 text-emerald-400'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeRemainingSeconds)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs">Loading assessment questions...</span>
            </div>
          ) : resultSummary ? (
            /* Result Feedback View */
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              {type === 'quiz' ? (
                <div>
                  <h3 className="text-2xl font-bold text-white">Quiz Completed!</h3>
                  <p className="text-sm text-slate-400 mt-1">{resultSummary.message}</p>

                  <div className="mt-6 p-6 rounded-2xl bg-slate-950 border border-slate-800 inline-block text-center">
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Your Score</span>
                    <div className="text-4xl font-extrabold text-emerald-400 font-mono mt-1">
                      {resultSummary.score} <span className="text-xl text-slate-500">/ 20</span>
                    </div>
                    <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      resultSummary.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {resultSummary.passed ? 'Passed with Mastery' : 'Review & Retake Recommended'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-xl font-bold text-white">Examination Submitted Successfully</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your answers have been stored in the Shikkhora evaluation repository. AI-assisted grading is processing the rubric, and the designated Main Admin will review the final grades.
                  </p>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Status:</span>
                      <span className="text-amber-400 font-semibold font-mono">PENDING_ADMIN_REVIEW</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Publication Target:</span>
                      <span className="text-white font-mono">Within 48 Hours</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Target Time:</span>
                      <span className="text-slate-300 font-mono">{new Date(resultSummary.targetPublicationTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                Return to Coursework
              </button>
            </div>
          ) : type === 'quiz' && quizData ? (
            /* 20-Mark Quiz Questions Form */
            <form onSubmit={handleQuizSubmit} className="space-y-6">
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs">
                Answer all questions below. Total marks: <strong>20</strong>. Passing threshold: <strong>14/20</strong>.
              </div>

              {quizData.questions.map((q, idx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-semibold text-white">
                      <span className="text-sky-400 font-bold">Q{idx + 1}. </span>
                      {q.question}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      [{q.marks} Marks]
                    </span>
                  </div>

                  {q.type === 'mcq' && q.options ? (
                    <div className="space-y-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                            answers[q.id] === opt
                              ? 'bg-sky-500/10 border-sky-500/40 text-white'
                              : 'bg-slate-900 border-slate-800/80 hover:bg-slate-850 text-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz_${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            className="text-sky-500 focus:ring-0"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="pt-1">
                      <textarea
                        rows={3}
                        placeholder="Type your concise scientific explanation..."
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating 20-Mark Quiz...' : 'Submit Quiz for Instant Scoring'}
              </button>
            </form>
          ) : type === 'exam' && examData ? (
            /* 100-Mark Examination */
            !examStarted ? (
              /* Pre-Exam Instructions & Declaration */
              <div className="space-y-6 max-w-xl mx-auto py-4">
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Official 100-Mark Chapter Examination</span>
                  </div>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300 leading-relaxed">
                    {examData.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-white font-mono font-bold">{examData.durationMinutes} Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Marks:</span>
                    <span className="text-emerald-400 font-mono font-bold">100 Marks</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Evaluation Mode:</span>
                    <span className="text-slate-200">AI-Assisted Grading with Main Admin Audit</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExamStarted(true)}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg transition-all active:scale-[0.99]"
                >
                  I Understand the Academic Rules · Start Examination
                </button>
              </div>
            ) : (
              /* Active 100-Mark Exam Questions Form */
              <div className="space-y-6">
                {examData.questions.map((q, idx) => (
                  <div key={q.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                          Section {q.section}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-white">
                          <span className="font-mono text-emerald-400 mr-1.5">Q{idx + 1}.</span>
                          {q.question}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {q.marks} Marks
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <strong>Rubric Focus:</strong> {q.guidelines}
                    </div>

                    <textarea
                      rows={5}
                      required
                      placeholder="Enter detailed step-by-step mathematical derivation, reasoning, and real-world synthesis..."
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleExamSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording Final Submission...' : 'Finalize & Submit 100-Mark Examination'}
                </button>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};
