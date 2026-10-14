import React, { useState, useEffect } from 'react';
import { ShikkhoraLogo } from '../common/ShikkhoraLogo';
import { api } from '../../services/api';
import type { User, AuthSession, ExamSubmission, NctbBook, AuditLog, ChapterQuiz, ChapterExam } from '../../types';
import {
  ShieldCheck,
  LogOut,
  Users,
  BookOpen,
  Award,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Plus,
  RefreshCw,
  Eye,
  Check,
  Search,
  History,
  FileCheck2,
  Loader2,
  Trash2,
  Link2,
  ExternalLink,
  Edit,
  Clock,
  X,
  Bot,
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  session: AuthSession;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  session,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'completeness' | 'books' | 'grading' | 'ai_drafts' | 'users' | 'audit'>('books');
  const [loading, setLoading] = useState(true);

  // Overview stats
  const [overview, setOverview] = useState<any>(null);

  // Content completeness matrix
  const [matrix, setMatrix] = useState<any[]>([]);

  // Books list
  const [books, setBooks] = useState<NctbBook[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<number | 'all'>('all');
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  // Exam Submissions for Grading Review
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);

  // Grading Review Form state
  const [reviewScore, setReviewScore] = useState<number>(85);
  const [reviewLetterGrade, setReviewLetterGrade] = useState<'A+' | 'A' | 'A-' | 'B' | 'C'>('A+');
  const [reviewFeedback, setReviewFeedback] = useState<string>('Mastery confirmed across fundamental SI units and experimental derivations.');
  const [overrideReason, setOverrideReason] = useState<string>('Reviewed and validated by Shikkhora Main Admin.');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Add / Edit Book Modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookTitleBn, setBookTitleBn] = useState('');
  const [bookClass, setBookClass] = useState(9);
  const [bookSubject, setBookSubject] = useState('Physics');
  const [bookSubjectBn, setBookSubjectBn] = useState('পদার্থবিজ্ঞান');
  const [bookPdfUrl, setBookPdfUrl] = useState('');
  const [bookAllowDownload, setBookAllowDownload] = useState(true);

  // Quick Paste PDF Modal for existing book
  const [pastePdfModalBook, setPastePdfModalBook] = useState<NctbBook | null>(null);
  const [pastePdfUrlInput, setPastePdfUrlInput] = useState('');

  // Preview PDF Modal
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>('');

  // Create / Edit Quiz Modal state
  const [quizModalBook, setQuizModalBook] = useState<NctbBook | null>(null);
  const [quizTitle, setQuizTitle] = useState('20-Mark Chapter Mastery Quiz');
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    marks: number;
    explanation: string;
  }>>([
    {
      id: 'q1',
      question: 'What is the standard unit of measurement in this chapter?',
      options: ['Meter / Second (SI units)', 'Inches and Feet', 'Arbitrary Estimates', 'Uncalibrated units'],
      correctAnswer: 'Meter / Second (SI units)',
      marks: 4,
      explanation: 'SI standard units provide precision and international compatibility.',
    },
    {
      id: 'q2',
      question: 'Which instrument eliminates zero error through a calibrated vernier scale?',
      options: ['Vernier Caliper', 'Rough Ruler', 'Measuring Tape without zero scale', 'Stopwatch'],
      correctAnswer: 'Vernier Caliper',
      marks: 4,
      explanation: 'Vernier calipers use vernier constant calculations to correct reading uncertainty.',
    },
    {
      id: 'q3',
      question: 'What is the passing criteria for standard NCTB assessment in this module?',
      options: ['60% or 12 marks out of 20', 'Only 25% marks', 'Writing any random text', 'Zero marks'],
      correctAnswer: '60% or 12 marks out of 20',
      marks: 4,
      explanation: 'The passing threshold requires demonstrating fundamental mastery with at least 12 marks.',
    },
    {
      id: 'q4',
      question: 'What is the first step of scientific inquiry and empirical research?',
      options: ['Systematic Observation and Questioning', 'Publishing before testing', 'Skipping data analysis', 'Ignoring laws'],
      correctAnswer: 'Systematic Observation and Questioning',
      marks: 4,
      explanation: 'All scientific inquiries begin with careful systematic observations.',
    },
    {
      id: 'q5',
      question: 'How do repeated trial measurements improve experimental reliability?',
      options: ['By reducing random errors and averaging deviations', 'By changing the laws of nature', 'By creating more errors', 'By multiplying uncertainties'],
      correctAnswer: 'By reducing random errors and averaging deviations',
      marks: 4,
      explanation: 'Averaging repeated trials suppresses random statistical fluctuations.',
    },
  ]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Create / Edit Exam Modal state
  const [examModalBook, setExamModalBook] = useState<NctbBook | null>(null);
  const [examTitle, setExamTitle] = useState('100-Mark Comprehensive Examination');
  const [examDuration, setExamDuration] = useState(75);
  const [examQuestions, setExamQuestions] = useState<Array<{
    id: string;
    section: 'A: Knowledge & Understanding' | 'B: Conceptual & Problem Solving' | 'C: Creative & Inquiry Application';
    question: string;
    marks: number;
    guidelines: string;
  }>>([
    {
      id: 'eq1',
      section: 'A: Knowledge & Understanding',
      question: 'Define the fundamental laws, governing equations, and primary SI quantities introduced in this textbook chapter.',
      marks: 30,
      guidelines: 'Provide exact definitions, standard symbols, and two practical examples.',
    },
    {
      id: 'eq2',
      section: 'B: Conceptual & Problem Solving',
      question: 'Derive step-by-step the mathematical formula for error correction and solve a quantitative scenario with calculations.',
      marks: 40,
      guidelines: 'Show all steps, algebraic manipulations, units, and clear final result.',
    },
    {
      id: 'eq3',
      section: 'C: Creative & Inquiry Application',
      question: 'Design an experimental investigation applicable to Bangladesh environmental or industrial context using the concepts of this book.',
      marks: 30,
      guidelines: 'Specify apparatus, method, hypothesis, data table layout, and safety protocols.',
    },
  ]);
  const [savingExam, setSavingExam] = useState(false);

  // AI Content Generator state
  const [draftType, setDraftType] = useState<'lesson' | 'quiz' | 'exam'>('quiz');
  const [draftSubject, setDraftSubject] = useState('Physics');
  const [draftClass, setDraftClass] = useState(9);
  const [draftChapterTitle, setDraftChapterTitle] = useState('Motion and Force');
  const [generatedDraft, setGeneratedDraft] = useState<any | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);

  // Users & Audit Logs
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchAllData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminOverview(),
      api.getAdminCompletenessMatrix(),
      api.getBooks(),
      api.getAdminExamSubmissions(),
      api.getAdminUsers(),
      api.getAdminAuditLogs(),
    ])
      .then(([ovRes, matRes, bRes, subRes, uRes, audRes]) => {
        setOverview(ovRes);
        setMatrix(matRes.matrix);
        setBooks(bRes.books);
        setSubmissions(subRes.submissions);
        setUsersList(uRes.users);
        setAuditLogs(audRes.auditLogs);
      })
      .catch((err) => console.error('Error fetching admin data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleReviewSubmission = async (publishNow: boolean) => {
    if (!selectedSubmission) return;
    setReviewLoading(true);
    try {
      await api.reviewExamSubmission(selectedSubmission.id, {
        score: reviewScore,
        letterGrade: reviewLetterGrade,
        adminFeedback: reviewFeedback,
        isOverridden: true,
        overrideReason,
        publishNow,
      });
      alert(`Exam result successfully ${publishNow ? 'published to student & parent' : 'audited and saved'}!`);
      setSelectedSubmission(null);
      fetchAllData();
    } catch (err: any) {
      alert(`Failed to save review: ${err.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  // Open Create/Edit Book modal
  const handleOpenAddBookModal = (bookToEdit?: NctbBook) => {
    if (bookToEdit) {
      setEditingBookId(bookToEdit.id);
      setBookTitle(bookToEdit.title);
      setBookTitleBn(bookToEdit.titleBn || '');
      setBookClass(bookToEdit.studentClass);
      setBookSubject(bookToEdit.subject);
      setBookSubjectBn(bookToEdit.subjectBn || '');
      setBookPdfUrl(bookToEdit.pdfUrl || '');
      setBookAllowDownload(bookToEdit.allowDownload !== false);
    } else {
      setEditingBookId(null);
      setBookTitle('Physics (Class 9-10)');
      setBookTitleBn('পদার্থবিজ্ঞান (৯ম-১০ম শ্রেণি)');
      setBookClass(9);
      setBookSubject('Physics');
      setBookSubjectBn('পদার্থবিজ্ঞান');
      setBookPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      setBookAllowDownload(true);
    }
    setShowBookModal(true);
  };

  // Save Book (Add or Edit)
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createOrUpdateBook({
        id: editingBookId || undefined,
        title: bookTitle,
        titleBn: bookTitleBn || bookTitle,
        studentClass: bookClass,
        subject: bookSubject,
        subjectBn: bookSubjectBn || bookSubject,
        pdfUrl: bookPdfUrl.trim() || undefined,
        allowDownload: bookAllowDownload,
      });
      setShowBookModal(false);
      fetchAllData();
      alert(`Book "${bookTitle}" saved successfully with PDF link and auto-configured quiz & exam!`);
    } catch (err: any) {
      alert(`Failed to save book: ${err.message}`);
    }
  };

  // Quick Paste PDF
  const handleSavePastedPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastePdfModalBook || !pastePdfUrlInput.trim()) return;
    try {
      await api.attachPdf(pastePdfModalBook.id, {
        pdfUrl: pastePdfUrlInput.trim(),
        pdfFileName: `${pastePdfModalBook.subject.toLowerCase()}_class_${pastePdfModalBook.studentClass}.pdf`,
        pdfSizeBytes: 14500000,
      });
      setPastePdfModalBook(null);
      setPastePdfUrlInput('');
      fetchAllData();
      alert(`PDF link attached successfully to "${pastePdfModalBook.title}"!`);
    } catch (err: any) {
      alert(`Failed to attach PDF: ${err.message}`);
    }
  };

  // Delete Book
  const handleDeleteBook = async (book: NctbBook) => {
    if (!confirm(`Are you sure you want to delete "${book.title}" (Class ${book.studentClass})? This will also remove associated chapters, quizzes, and exams.`)) {
      return;
    }
    try {
      await api.deleteBook(book.id);
      fetchAllData();
    } catch (err: any) {
      alert(`Failed to delete book: ${err.message}`);
    }
  };

  // Save Quiz
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizModalBook) return;
    setSavingQuiz(true);
    try {
      // Find chapter for this book
      const bookRes = await api.getBookDetails(quizModalBook.id);
      let chapterId = bookRes.chapters[0]?.id;
      if (!chapterId) {
        // create chapter 1
        const chapRes = await api.createChapter({
          bookId: quizModalBook.id,
          chapterNumber: 1,
          title: `${quizModalBook.subject} Chapter 1`,
          titleBn: `${quizModalBook.subjectBn || quizModalBook.subject} ১ম অধ্যায়`,
        });
        chapterId = chapRes.chapter.id;
      }

      await api.createQuiz({
        chapterId,
        bookId: quizModalBook.id,
        title: quizTitle,
        questions: quizQuestions,
        passingMarks: 12,
      });

      setQuizModalBook(null);
      fetchAllData();
      alert('20-Mark Quiz successfully published for this textbook!');
    } catch (err: any) {
      alert(`Failed to save quiz: ${err.message}`);
    } finally {
      setSavingQuiz(false);
    }
  };

  // Save Exam
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examModalBook) return;
    setSavingExam(true);
    try {
      const bookRes = await api.getBookDetails(examModalBook.id);
      let chapterId = bookRes.chapters[0]?.id;
      if (!chapterId) {
        const chapRes = await api.createChapter({
          bookId: examModalBook.id,
          chapterNumber: 1,
          title: `${examModalBook.subject} Chapter 1`,
          titleBn: `${examModalBook.subjectBn || examModalBook.subject} ১ম অধ্যায়`,
        });
        chapterId = chapRes.chapter.id;
      }

      await api.createExam({
        chapterId,
        bookId: examModalBook.id,
        title: examTitle,
        durationMinutes: examDuration,
        questions: examQuestions,
        rubric: [
          { criteria: 'Knowledge & Understanding', maxPoints: 30, description: 'Accuracy of definitions and principles.' },
          { criteria: 'Conceptual & Problem Solving', maxPoints: 40, description: 'Step-by-step derivations and calculations.' },
          { criteria: 'Creative Application', maxPoints: 30, description: 'Synthesis and real-world Bangladesh relevance.' },
        ],
      });

      setExamModalBook(null);
      fetchAllData();
      alert('100-Mark Examination successfully published for this textbook!');
    } catch (err: any) {
      alert(`Failed to save exam: ${err.message}`);
    } finally {
      setSavingExam(false);
    }
  };

  const handleGenerateAiDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setDraftLoading(true);
    setGeneratedDraft(null);
    try {
      const res = await api.generateAiContent({
        type: draftType,
        subject: draftSubject,
        studentClass: draftClass,
        chapterTitle: draftChapterTitle,
      });
      setGeneratedDraft(res.draft);
    } catch (err: any) {
      alert(`Draft generation error: ${err.message}`);
    } finally {
      setDraftLoading(false);
    }
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesClass = selectedClassFilter === 'all' || b.studentClass === selectedClassFilter;
    const matchesSearch = !bookSearchQuery ||
      b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      b.subject.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      (b.titleBn && b.titleBn.toLowerCase().includes(bookSearchQuery.toLowerCase()));
    return matchesClass && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShikkhoraLogo variant="horizontal" size="sm" theme="dark" showTagline={false} />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              Main Admin Control Center
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-emerald-300">kmsadikrahmansoccho@gmail.com</span>
            </div>

            <button
              onClick={fetchAllData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Log Out Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Subnav */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('books')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'books' ? 'border-emerald-400 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>PDF Textbooks & Curricula ({books.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-emerald-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview KPIs
          </button>
          <button
            onClick={() => setActiveTab('completeness')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'completeness' ? 'border-emerald-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Completeness Matrix (Classes 1–10)
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'grading' ? 'border-emerald-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Grading Review & Publishing</span>
            {submissions.filter((s) => s.status === 'PENDING_ADMIN_REVIEW').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ai_drafts')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'ai_drafts' ? 'border-emerald-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Curriculum Assistant
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'users' ? 'border-emerald-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Users & Verification
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'audit' ? 'border-emerald-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Security Audit Logs
          </button>
        </div>
      </div>

      {/* Main Admin Workspace View */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs">Loading Shikkhora admin datastore...</span>
          </div>
        ) : (
          <>
            {/* TAB: TEXTBOOKS & PDFS (PRIMARY EMPHASIS) */}
            {activeTab === 'books' && (
              <div className="space-y-6">
                {/* Header with Title and Add PDF Book Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                        NCTB Portal
                      </span>
                      <h3 className="text-xl font-bold text-white">PDF Textbooks Management</h3>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Add new textbooks, paste PDF links, create 20-mark quizzes and 100-mark examinations. Students can read the PDF directly, take quizzes, attend exams, and consult the AI study tutor.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenAddBookModal()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add PDF Book (Paste Link)</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  {/* Class Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                    <button
                      onClick={() => setSelectedClassFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                        selectedClassFilter === 'all'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      All Classes
                    </button>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((cNum) => (
                      <button
                        key={cNum}
                        onClick={() => setSelectedClassFilter(cNum)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                          selectedClassFilter === cNum
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Class {cNum}
                      </button>
                    ))}
                  </div>

                  {/* Search box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search title or subject..."
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Books Grid */}
                {filteredBooks.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
                    No books found matching this filter. Click "+ Add PDF Book" above to create one!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredBooks.map((book) => (
                      <div
                        key={book.id}
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                      >
                        <div>
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                                Class {book.studentClass} · {book.subject}
                              </span>
                              <h4 className="text-base font-bold text-white mt-0.5">{book.title}</h4>
                              <div className="text-xs text-slate-400 font-bn mt-0.5">{book.titleBn}</div>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                                book.pdfUrl
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              <Link2 className="w-3 h-3" />
                              <span>{book.pdfUrl ? 'PDF Active' : 'No Link'}</span>
                            </span>
                          </div>

                          {/* PDF URL preview link */}
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                            <div className="text-slate-400 truncate">
                              <span className="font-semibold text-slate-300">PDF URL: </span>
                              {book.pdfUrl ? (
                                <span className="text-emerald-400 font-mono">{book.pdfUrl}</span>
                              ) : (
                                <span className="text-amber-400 italic">None pasted yet</span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              Edition: {book.curriculumEdition}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-3 border-t border-slate-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            {/* Paste / Replace PDF link */}
                            <button
                              onClick={() => {
                                setPastePdfModalBook(book);
                                setPastePdfUrlInput(book.pdfUrl || '');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-emerald-500/20"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span>Paste PDF Link</span>
                            </button>

                            {/* Preview / Read PDF */}
                            {book.pdfUrl && (
                              <button
                                onClick={() => {
                                  setPreviewPdfUrl(book.pdfUrl || null);
                                  setPreviewPdfTitle(book.title);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Read PDF</span>
                              </button>
                            )}

                            {/* Edit Metadata */}
                            <button
                              onClick={() => handleOpenAddBookModal(book)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Edit Book Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Book */}
                            <button
                              onClick={() => handleDeleteBook(book)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                              title="Delete Book"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Create Quiz & Create Exam shortcuts */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => {
                                setQuizModalBook(book);
                                setQuizTitle(`${book.subject} (Class ${book.studentClass}) 20-Mark Quiz`);
                              }}
                              className="px-2 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                            >
                              <Award className="w-3 h-3" />
                              <span>Create Quiz</span>
                            </button>
                            <button
                              onClick={() => {
                                setExamModalBook(book);
                                setExamTitle(`${book.subject} (Class ${book.studentClass}) 100-Mark Exam`);
                              }}
                              className="px-2 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Create Exam</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && overview && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students</span>
                    <div className="text-3xl font-bold font-mono text-white mt-1">{overview.studentsCount}</div>
                    <span className="text-[11px] text-emerald-400 mt-1 block">
                      {overview.verifiedStudentsCount} Registered Students
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parent Accounts</span>
                    <div className="text-3xl font-bold font-mono text-white mt-1">{overview.parentsCount}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Linked family accounts</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Grading</span>
                    <div className="text-3xl font-bold font-mono text-amber-400 mt-1">{overview.pendingExamReviews}</div>
                    <span className="text-[11px] text-amber-400/90 mt-1 block">Awaiting admin publication</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Textbook Coverage</span>
                    <div className="text-3xl font-bold font-mono text-sky-400 mt-1">{overview.booksCount} Books</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Classes 1–10 NCTB titles</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">48-Hour Exam Grading SLA Target</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      There are currently {overview.pendingExamReviews} examination submissions awaiting audit review.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('grading')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    Open Examination Review Console
                  </button>
                </div>
              </div>
            )}

            {/* TAB: COMPLETENESS MATRIX */}
            {activeTab === 'completeness' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Curriculum Completeness Matrix</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Class-by-class audit identifying which classes have uploaded books, attached PDFs, 20-mark quizzes, and 100-mark examinations.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenAddBookModal()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Textbook Record</span>
                  </button>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Target Class</th>
                        <th className="py-3 px-4 font-semibold">Books Uploaded</th>
                        <th className="py-3 px-4 font-semibold">Attached PDF</th>
                        <th className="py-3 px-4 font-semibold">20-Mark Quiz</th>
                        <th className="py-3 px-4 font-semibold">100-Mark Exam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                      {matrix.map((row) => (
                        <tr key={row.class} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white font-sans">Class {row.class}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400">{row.booksCount} books</td>
                          <td className="py-3.5 px-4">
                            {row.pdfCount > 0 ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                <Check className="w-3.5 h-3.5" /> {row.pdfCount} PDFs
                              </span>
                            ) : (
                              <span className="text-slate-500">None</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {row.quizCount > 0 ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                <Check className="w-3.5 h-3.5" /> {row.quizCount} Quizzes
                              </span>
                            ) : (
                              <span className="text-slate-500">None</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {row.examCount > 0 ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                <Check className="w-3.5 h-3.5" /> {row.examCount} Exams
                              </span>
                            ) : (
                              <span className="text-slate-500">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: EXAM GRADING & PUBLISHING */}
            {activeTab === 'grading' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">100-Mark Examination Submissions & AI Grading</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review AI evaluation, verify rubric scores, add audit notes, and publish results to students and parents within 48 hours.
                  </p>
                </div>

                {submissions.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                    No student examination submissions pending review.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-white">{sub.studentName}</span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">({sub.studentEmail})</span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Submitted: {new Date(sub.submittedAt).toLocaleString()} · 48h Target: {new Date(sub.targetPublicationTime).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                              sub.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {sub.status}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setReviewScore(sub.aiEvaluation?.totalScore || 85);
                                setReviewFeedback(sub.aiEvaluation?.overallFeedback || 'Mastery confirmed across foundational concepts.');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
                            >
                              Audit & Grade
                            </button>
                          </div>
                        </div>

                        {sub.aiEvaluation && (
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-300 font-semibold">
                              <span>AI Automated Score:</span>
                              <span className="font-mono text-emerald-400 font-bold">{sub.aiEvaluation.totalScore} / 100</span>
                            </div>
                            <p className="text-[11px] text-slate-400 italic">{sub.aiEvaluation.overallFeedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: AI CURRICULUM ASSISTANT */}
            {activeTab === 'ai_drafts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">AI Curriculum Drafting Assistant</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate draft lesson explanations, 20-mark chapter quizzes, and 100-mark examinations with rubrics for the Main Admin to review and adopt.
                  </p>
                </div>

                <form onSubmit={handleGenerateAiDraft} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Content Type</label>
                      <select
                        value={draftType}
                        onChange={(e) => setDraftType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        <option value="quiz">20-Mark Quiz</option>
                        <option value="exam">100-Mark Examination</option>
                        <option value="lesson">Instructional Lesson</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Class</label>
                      <select
                        value={draftClass}
                        onChange={(e) => setDraftClass(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => (
                          <option key={c} value={c}>Class {c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Chapter Title</label>
                    <input
                      type="text"
                      required
                      value={draftChapterTitle}
                      onChange={(e) => setDraftChapterTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={draftLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {draftLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Generate AI Pedagogical Draft</span>
                  </button>
                </form>

                {generatedDraft && (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">AI Draft Ready for Admin Review</h4>
                    <pre className="p-4 rounded-xl bg-slate-950 text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap font-mono">
                      {JSON.stringify(generatedDraft, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB: USERS & VERIFICATION */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Registered Users</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View active student and parent accounts across the platform.
                  </p>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 font-semibold">User</th>
                        <th className="py-3 px-4 font-semibold">Role</th>
                        <th className="py-3 px-4 font-semibold">Class / School</th>
                        <th className="py-3 px-4 font-semibold">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-sans">
                            <div className="font-bold text-white">{u.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-300' : u.role === 'parent' ? 'bg-purple-500/20 text-purple-300' : 'bg-sky-500/20 text-sky-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-sans text-slate-300">
                            {u.studentClass ? `Class ${u.studentClass} (${u.schoolName || 'General'})` : u.phone || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: AUDIT LOGS */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Immutable Administrative Audit Trail</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Every admin action, PDF attachment, book modification, and grading override is recorded with timestamps.
                  </p>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Timestamp</th>
                        <th className="py-3 px-4 font-semibold">Action</th>
                        <th className="py-3 px-4 font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300 text-[11px]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400">{log.action}</td>
                          <td className="py-3 px-4 font-sans text-slate-300">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL 1: ADD / EDIT PDF BOOK */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowBookModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                {editingBookId ? 'Edit Textbook & PDF Details' : 'Add New PDF Book to Shikkhora'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Paste the PDF link below. The web app automatically configures Chapter 1, a 20-mark quiz, and a 100-mark exam so students can immediately read and test!
            </p>

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physics, Math"
                    value={bookSubject}
                    onChange={(e) => setBookSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject (Bangla)</label>
                  <input
                    type="text"
                    placeholder="e.g. পদার্থবিজ্ঞান"
                    value={bookSubjectBn}
                    onChange={(e) => setBookSubjectBn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-bn"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Book Title (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Secondary Physics (Class 9-10)"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Book Title (Bangla)</label>
                <input
                  type="text"
                  placeholder="e.g. মাধ্যমিক পদার্থবিজ্ঞান"
                  value={bookTitleBn}
                  onChange={(e) => setBookTitleBn(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-bn"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Class (1 to 10)</label>
                <select
                  value={bookClass}
                  onChange={(e) => setBookClass(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>

              {/* PDF LINK (PASTE URL) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-emerald-400">
                    PDF Link (Paste URL Here)
                  </label>
                  <span className="text-[10px] text-slate-400">Direct PDF, Google Drive, or Web Link</span>
                </div>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="url"
                    placeholder="https://... (paste direct pdf or drive link)"
                    value={bookPdfUrl}
                    onChange={(e) => setBookPdfUrl(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                {/* Sample Paste Buttons for instant testing */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Quick Test Samples:</span>
                  <button
                    type="button"
                    onClick={() => setBookPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                  >
                    Sample Document PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookPdfUrl('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                  >
                    Mozilla PDF Sample
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allowDownloadCheck"
                  checked={bookAllowDownload}
                  onChange={(e) => setBookAllowDownload(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="allowDownloadCheck" className="text-xs text-slate-300 cursor-pointer">
                  Allow students to download this PDF book
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-[0.99] mt-2"
              >
                {editingBookId ? 'Save Changes to Book' : 'Publish Book with PDF, Quiz & Exam'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK PASTE PDF LINK MODAL */}
      {pastePdfModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-6 text-slate-100">
            <button
              onClick={() => setPastePdfModalBook(null)}
              className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Paste PDF Link for {pastePdfModalBook.title}</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter or paste any valid PDF URL (direct link or Google Drive preview link). Students will immediately be able to read it in their reader.
            </p>

            <form onSubmit={handleSavePastedPdf} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Paste PDF Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/textbook.pdf or drive.google.com..."
                  value={pastePdfUrlInput}
                  onChange={(e) => setPastePdfUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              {/* Sample Links */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400">Quick link:</span>
                <button
                  type="button"
                  onClick={() => setPastePdfUrlInput('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                >
                  Insert Sample PDF Link
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Confirm & Attach PDF to Textbook
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PREVIEW PDF MODAL */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                  Preview: {previewPdfTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>
                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 relative">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewPdfUrl)}&embedded=true`}
                title="PDF Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE / EDIT 20-MARK QUIZ */}
      {quizModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQuizModalBook(null)}
              className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">
                Create 20-Mark Quiz for {quizModalBook.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Configure 5 multiple-choice questions (4 marks each = 20 marks total). Students can take this quiz directly after reading the PDF book!
            </p>

            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Questions List (Total: {quizQuestions.reduce((a, c) => a + c.marks, 0)} / 20 Marks)
                  </h4>
                  <span className="text-[11px] text-slate-400">Strict 20-Mark Passing Protocol</span>
                </div>

                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>Question {idx + 1} ({q.marks} Marks)</span>
                    </div>

                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...quizQuestions];
                        updated[idx].question = e.target.value;
                        setQuizQuestions(updated);
                      }}
                      placeholder="Enter question text..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold">Option {String.fromCharCode(65 + optIdx)}</label>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const updated = [...quizQuestions];
                              updated[idx].options[optIdx] = e.target.value;
                              // if this was correct answer, update it too
                              if (updated[idx].correctAnswer === opt) {
                                updated[idx].correctAnswer = e.target.value;
                              }
                              setQuizQuestions(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-emerald-400 mb-1">Correct Answer</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[idx].correctAnswer = e.target.value;
                            setQuizQuestions(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-xs text-white"
                        >
                          {q.options.map((opt, optIdx) => (
                            <option key={optIdx} value={opt}>
                              Option {String.fromCharCode(65 + optIdx)}: {opt.slice(0, 30)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Explanation</label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[idx].explanation = e.target.value;
                            setQuizQuestions(updated);
                          }}
                          placeholder="Why this answer is correct..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={savingQuiz}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
              >
                {savingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                <span>Publish 20-Mark Quiz to Students</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CREATE / EDIT 100-MARK EXAM */}
      {examModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setExamModalBook(null)}
              className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">
                Create 100-Mark Examination for {examModalBook.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Configure Sections A, B, and C totaling exactly 100 marks with countdown duration.
            </p>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Title</label>
                  <input
                    type="text"
                    required
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    required
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Exam Questions (Total: {examQuestions.reduce((a, c) => a + c.marks, 0)} / 100 Marks)
                  </h4>
                </div>

                {examQuestions.map((eq, idx) => (
                  <div key={eq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>Section {eq.section}</span>
                      <span className="text-emerald-400 font-mono">{eq.marks} Marks</span>
                    </div>

                    <textarea
                      rows={2}
                      required
                      value={eq.question}
                      onChange={(e) => {
                        const updated = [...examQuestions];
                        updated[idx].question = e.target.value;
                        setExamQuestions(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Evaluation Guidelines</label>
                      <input
                        type="text"
                        value={eq.guidelines}
                        onChange={(e) => {
                          const updated = [...examQuestions];
                          updated[idx].guidelines = e.target.value;
                          setExamQuestions(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={savingExam}
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
              >
                {savingExam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                <span>Publish 100-Mark Examination to Students</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: GRADING REVIEW MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">
              Audit Examination Submission: {selectedSubmission.studentName}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Review AI preliminary scores, adjust final grade, and record mandatory audit reason.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Final Score (out of 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Letter Grade</label>
                  <select
                    value={reviewLetterGrade}
                    onChange={(e) => setReviewLetterGrade(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="A-">A- (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C">C (Pass)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Admin Feedback</label>
                <textarea
                  rows={2}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mandatory Audit Log Reason for Grade Revision
                </label>
                <input
                  type="text"
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleReviewSubmission(true)}
                  disabled={reviewLoading}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                >
                  Confirm & Publish Result to Student & Parent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
