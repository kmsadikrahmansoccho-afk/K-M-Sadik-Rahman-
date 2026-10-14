import React, { useState, useEffect } from 'react';
import { ShikkhoraLogo } from '../common/ShikkhoraLogo';
import { FiveDayReportModal } from '../student/FiveDayReportModal';
import { api } from '../../services/api';
import type { User, AuthSession, ExamSubmission, QuizSubmission } from '../../types';
import {
  Users,
  LogOut,
  Award,
  BookOpen,
  Clock,
  Code2,
  FileCheck2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ParentDashboardProps {
  user: User;
  session: AuthSession;
  onLogout: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  user,
  session,
  onLogout,
}) => {
  const [loading, setLoading] = useState(true);
  const [linkedStudents, setLinkedStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);

  // Link child modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [childEmailInput, setChildEmailInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  // Five-Day Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchParentData = () => {
    setLoading(true);
    api.getParentChildData()
      .then((res) => {
        setLinkedStudents(res.linkedStudents || []);
        setExamSubmissions(res.examSubmissions || []);
        setQuizSubmissions(res.quizSubmissions || []);
        if (res.linkedStudents?.length > 0) {
          setSelectedStudent(res.linkedStudents[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkLoading(true);
    setLinkError(null);
    try {
      await api.linkChild(childEmailInput.trim());
      setShowLinkModal(false);
      setChildEmailInput('');
      fetchParentData();
    } catch (err: any) {
      setLinkError(err.message || 'Failed to link student account.');
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <ShikkhoraLogo variant="horizontal" size="sm" theme="dark" showTagline={false} />

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Parent: {user.fullName}</span>
            </div>

            <button
              onClick={() => setShowLinkModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Child</span>
            </button>

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

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Loading authorized family educational records...</span>
          </div>
        ) : linkedStudents.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No Linked Student Account Found</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              To monitor progress, link your child's verified student email address.
            </p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Link Student Account</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Child Selector Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-800">
              {linkedStudents.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedStudent(child)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    selectedStudent?.id === child.id
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{child.fullName} (Class {child.studentClass || 9})</span>
                </button>
              ))}
            </div>

            {selectedStudent && (
              <div className="space-y-6">
                {/* Child Summary Card */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                      Child Profile
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                      {selectedStudent.fullName}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedStudent.schoolName || 'School not listed'} · Class {selectedStudent.studentClass || 9} (NCTB) · {selectedStudent.cityOrDistrict || 'Bangladesh'}
                    </p>
                  </div>

                  {/* 5-Day Report Button */}
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>View 5-Day Academic Report</span>
                  </button>
                </div>

                {/* Examination Results Feed */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Official Examination & Assessment Submissions</span>
                    </h3>
                  </div>

                  {examSubmissions.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                      No chapter examination submissions recorded yet for {selectedStudent.fullName}.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {examSubmissions.map((sub) => (
                        <div key={sub.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-bold text-white">100-Mark Chapter Examination</span>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                Submitted: {new Date(sub.submittedAt).toLocaleString()}
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full ${
                              sub.status === 'PUBLISHED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              Status: {sub.status}
                            </span>
                          </div>

                          {sub.finalGrade ? (
                            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-emerald-300">
                                  Published Grade: {sub.finalGrade.letterGrade}
                                </span>
                                {sub.finalGrade.adminFeedback && (
                                  <p className="text-[11px] text-slate-300 mt-1">{sub.finalGrade.adminFeedback}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold font-mono text-white">
                                  {sub.finalGrade.totalScore} / 100
                                </div>
                                <span className="text-[10px] text-slate-400">Audited by Admin</span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                              <span>AI evaluation under administrative audit.</span>
                              <span className="text-emerald-400 font-mono text-[11px]">
                                Target 48h publication: {new Date(sub.targetPublicationTime).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
            <button
              onClick={() => setShowLinkModal(false)}
              className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white mb-2">Link Student Account</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your child's verified student email address to connect them to your parent portal.
            </p>

            {linkError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {linkError}
              </div>
            )}

            <form onSubmit={handleLinkChild} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Student Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@shikkhora.edu.bd"
                  value={childEmailInput}
                  onChange={(e) => setChildEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={linkLoading || !childEmailInput.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {linkLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Authorize & Link Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Five-Day Report Modal for Selected Child */}
      {selectedStudent && (
        <FiveDayReportModal
          isOpen={showReportModal}
          studentId={selectedStudent.id}
          studentName={selectedStudent.fullName}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
