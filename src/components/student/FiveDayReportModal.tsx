import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { FiveDayProgressReport } from '../../types';
import {
  X,
  FileCheck2,
  Clock,
  Award,
  BookOpen,
  Code2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';

interface FiveDayReportModalProps {
  isOpen: boolean;
  studentId: string;
  studentName: string;
  onClose: () => void;
}

export const FiveDayReportModal: React.FC<FiveDayReportModalProps> = ({
  isOpen,
  studentId,
  studentName,
  onClose,
}) => {
  const [report, setReport] = useState<FiveDayProgressReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    api.getFiveDayReport(studentId)
      .then((res) => setReport(res.report))
      .catch((err) => setError(err.message || 'Failed to load progress report'))
      .finally(() => setLoading(false));
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Official Academic Analysis
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Five-Day Rolling Progress Report
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Student: {studentName} · NCTB Class {report?.studentClass || 9}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Computing rolling 5-day analytics from database records...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        ) : report ? (
          <div className="space-y-6">
            {/* Window Timeline Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Audit Window: {report.reportStartDate} to {report.reportEndDate}</span>
              </div>
              <span className="text-emerald-400 font-semibold">Active Rolling Window</span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Clock className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white font-mono">{report.activeStudyMinutes}m</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Study Time</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <BookOpen className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white font-mono">{report.lessonsCompletedCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Lessons Done</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white font-mono">{report.averageQuizScore}%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Quiz Score</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Code2 className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white font-mono">
                  {report.cModulesCompletedCount + report.htmlModulesCompletedCount}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Code Modules</div>
              </div>
            </div>

            {/* Daily Minutes Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Daily Study Minutes (Last 5 Days)
              </h4>
              <div className="grid grid-cols-5 gap-2 pt-2 text-center">
                {report.dailyActivity.map((day, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono">{day.date.slice(5)}</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">{day.minutes}m</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strong Topics */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Demonstrated Academic Strengths</span>
              </h4>
              <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                {report.strongTopics.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Improvement Recommendations */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Targeted Next-Step Recommendations</span>
              </h4>
              <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                {report.recommendations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
