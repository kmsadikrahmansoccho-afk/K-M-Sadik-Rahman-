import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { NctbBook, NctbChapter, NctbLesson, User } from '../../types';
import { ChatGPTModal } from '../common/ChatGPTModal';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  Clock,
  Sparkles,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  Loader2,
  AlertCircle,
  Bot,
  Link2,
} from 'lucide-react';

interface NctbLearningViewProps {
  user: User;
  onBack: () => void;
  onStartQuiz: (chapterId: string, chapterTitle: string) => void;
  onStartExam: (chapterId: string, chapterTitle: string) => void;
}

export const NctbLearningView: React.FC<NctbLearningViewProps> = ({
  user,
  onBack,
  onStartQuiz,
  onStartExam,
}) => {
  const [selectedClass, setSelectedClass] = useState<number>(user.studentClass || 9);
  const [books, setBooks] = useState<NctbBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<NctbBook | null>(null);
  const [chapters, setChapters] = useState<NctbChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<NctbChapter | null>(null);
  const [lessons, setLessons] = useState<NctbLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<NctbLesson | null>(null);
  const [loading, setLoading] = useState(false);

  // PDF Reader States
  const [showPdfReader, setShowPdfReader] = useState(true); // default to reading the PDF book if available!
  const [pdfViewerMode, setPdfViewerMode] = useState<'docs_viewer' | 'direct'>('docs_viewer');
  const [isFullscreenPdf, setIsFullscreenPdf] = useState(false);

  // ChatGPT Modal State
  const [showChatGPTModal, setShowChatGPTModal] = useState(false);

  // Load books for selected class
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getBooks(selectedClass)
      .then((res) => {
        if (!isMounted) return;
        setBooks(res.books);
        if (res.books.length > 0) {
          handleSelectBook(res.books[0]);
        } else {
          setSelectedBook(null);
          setChapters([]);
          setLessons([]);
          setSelectedLesson(null);
        }
      })
      .catch((err) => console.error('Failed to load books:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedClass]);

  const handleSelectBook = async (book: NctbBook) => {
    setSelectedBook(book);
    setShowPdfReader(Boolean(book.pdfUrl)); // Open PDF view immediately if URL exists
    try {
      const res = await api.getBookDetails(book.id);
      setChapters(res.chapters);
      if (res.chapters.length > 0) {
        handleSelectChapter(res.chapters[0]);
      } else {
        setSelectedChapter(null);
        setLessons([]);
        setSelectedLesson(null);
      }
    } catch (err) {
      console.error('Failed to load book chapters:', err);
    }
  };

  const handleSelectChapter = async (chapter: NctbChapter) => {
    setSelectedChapter(chapter);
    try {
      const res = await api.getChapterLessons(chapter.id);
      setLessons(res.lessons);
      if (res.lessons.length > 0) {
        setSelectedLesson(res.lessons[0]);
      } else {
        setSelectedLesson(null);
      }
    } catch (err) {
      console.error('Failed to load lessons:', err);
    }
  };

  const pdfUrl = selectedBook?.pdfUrl;
  const isGoogleDrivePreview = pdfUrl && pdfUrl.includes('drive.google.com');

  // Iframe source URL
  const iframeSrc = isGoogleDrivePreview
    ? pdfUrl
    : pdfViewerMode === 'docs_viewer'
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl || '')}&embedded=true`
    : pdfUrl;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Breadcrumb & Class Selector Navigation */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to Student Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Classes 1–10 Curriculum</span>
              <span>/</span>
              <span className="text-emerald-400 font-medium">Class {selectedClass}</span>
              {selectedBook && (
                <>
                  <span>/</span>
                  <span className="text-slate-200 truncate max-w-[140px] sm:max-w-xs">{selectedBook.subject}</span>
                </>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{selectedBook ? selectedBook.title : `Class ${selectedClass} Textbooks`}</span>
              {selectedBook?.pdfUrl && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PDF Available
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ChatGPT Quick Assistant Button */}
          <button
            onClick={() => setShowChatGPTModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Open ChatGPT Assistant"
          >
            <Bot className="w-4 h-4" />
            <span>Ask ChatGPT</span>
          </button>

          {/* Class Selection Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((cNum) => (
              <button
                key={cNum}
                onClick={() => setSelectedClass(cNum)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedClass === cNum
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                C{cNum}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Books & Chapters List */}
        <aside className="w-full lg:w-80 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 lg:max-h-[calc(100vh-65px)] overflow-y-auto">
          {/* Books in this Class */}
          <div className="p-4 border-b border-slate-800/80">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Class {selectedClass} Textbooks
            </h2>
            {loading ? (
              <div className="py-6 flex items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading curriculum...</span>
              </div>
            ) : books.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs text-center">
                No books uploaded for Class {selectedClass} yet. (Admin can add books & paste PDF links)
              </div>
            ) : (
              <div className="space-y-2">
                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 ${
                      selectedBook?.id === book.id
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-white shadow-sm'
                        : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-10 rounded bg-gradient-to-br from-emerald-600 to-sky-800 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold truncate text-white">{book.subject}</span>
                        {book.pdfUrl && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            PDF
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{book.title}</div>
                      <div className="text-[10px] text-emerald-400/90 mt-0.5 font-bn truncate">{book.titleBn || book.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chapters of Selected Book */}
          {selectedBook && (
            <div className="p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Chapters & Quizzes
                </h2>
                {selectedBook.pdfUrl && (
                  <button
                    onClick={() => setShowPdfReader((prev) => !prev)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 transition-colors bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{showPdfReader ? 'View Lesson Text' : 'Read PDF Book'}</span>
                  </button>
                )}
              </div>

              {chapters.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center">
                  No chapters registered for this book yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chap) => (
                    <div
                      key={chap.id}
                      className={`p-3 rounded-xl transition-all border ${
                        selectedChapter?.id === chap.id
                          ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
                          : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => {
                          handleSelectChapter(chap);
                        }}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-emerald-400">Chapter {chap.chapterNumber}</span>
                          {chap.pdfStartPage && (
                            <span>pp. {chap.pdfStartPage}–{chap.pdfEndPage}</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-100">{chap.title}</div>
                        <div className="text-[11px] text-slate-400 font-bn mt-0.5">{chap.titleBn}</div>
                      </button>

                      {/* Quick Take Quiz & Attend Exam Buttons */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => onStartQuiz(chap.id, chap.title)}
                          className="px-2 py-1 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Award className="w-3 h-3 text-sky-400" />
                          <span>Take Quiz (20M)</span>
                        </button>
                        <button
                          onClick={() => onStartExam(chap.id, chap.title)}
                          className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>Attend Exam (100M)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Center / Right Content Panel */}
        <section className={`flex-1 flex flex-col ${isFullscreenPdf ? 'fixed inset-0 z-50 bg-slate-950' : 'lg:max-h-[calc(100vh-65px)] overflow-y-auto'}`}>
          {showPdfReader && selectedBook?.pdfUrl ? (
            /* First-Class Interactive PDF Textbook Reader Component */
            <div className="flex-1 flex flex-col bg-slate-950 h-full">
              {/* PDF Toolbar */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                      {selectedBook.title}
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    Class {selectedBook.studentClass}
                  </span>
                </div>

                {/* Reader Controls & Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Take Quiz Button */}
                  {selectedChapter && (
                    <button
                      onClick={() => onStartQuiz(selectedChapter.id, selectedChapter.title)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Take Quiz</span>
                    </button>
                  )}

                  {/* Attend Exam Button */}
                  {selectedChapter && (
                    <button
                      onClick={() => onStartExam(selectedChapter.id, selectedChapter.title)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Attend Exam</span>
                    </button>
                  )}

                  {/* ChatGPT Tutor Assistant Button */}
                  <button
                    onClick={() => setShowChatGPTModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-700 transition-colors"
                    title="Ask ChatGPT about this PDF"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Ask ChatGPT</span>
                  </button>

                  {/* Open in New Window */}
                  <a
                    href={selectedBook.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Open PDF in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Download PDF button if allowed */}
                  {selectedBook.allowDownload && (
                    <a
                      href={selectedBook.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={() => setIsFullscreenPdf((prev) => !prev)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title={isFullscreenPdf ? 'Exit Fullscreen' : 'Fullscreen Reader'}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Embedded PDF Viewer Iframe */}
              <div className="flex-1 bg-slate-950 relative w-full h-[650px] lg:h-full min-h-[500px]">
                <iframe
                  src={iframeSrc}
                  title={`PDF Reader - ${selectedBook.title}`}
                  className="w-full h-full border-0 bg-slate-900"
                  allow="fullscreen"
                />
              </div>
            </div>
          ) : selectedChapter ? (
            /* Interactive Structured Lesson & Assessments Workspace */
            <div className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto w-full">
              {/* Chapter Header Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      Class {selectedClass} · {selectedBook?.subject}
                    </span>
                    <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                      Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                    </h2>
                    <h3 className="text-base text-slate-400 font-bn mt-0.5">
                      {selectedChapter.titleBn}
                    </h3>
                  </div>

                  {/* 20-Mark Quiz & 100-Mark Exam Actions */}
                  <div className="flex items-center gap-3">
                    {selectedBook?.pdfUrl && (
                      <button
                        onClick={() => setShowPdfReader(true)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs inline-flex items-center gap-2 transition-all border border-slate-700"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Read PDF Book</span>
                      </button>
                    )}
                    <button
                      onClick={() => onStartQuiz(selectedChapter.id, selectedChapter.title)}
                      className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      <Award className="w-4 h-4" />
                      <span>Take 20-Mark Quiz</span>
                    </button>
                    <button
                      onClick={() => onStartExam(selectedChapter.id, selectedChapter.title)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      <Clock className="w-4 h-4" />
                      <span>100-Mark Chapter Exam</span>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                  {selectedChapter.summary}
                </p>
              </div>

              {/* Pedagogical Lesson Content */}
              {selectedLesson ? (
                <div className="space-y-6">
                  {/* Cambridge / IB Style Inquiry Prompt */}
                  {selectedLesson.inquiryPrompt && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 text-amber-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Inquiry & Curiosity Spark</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium">{selectedLesson.inquiryPrompt}</p>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  {selectedLesson.learningObjectives?.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Learning Objectives
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {selectedLesson.learningObjectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Main Structured Instructional Text */}
                  <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    {selectedLesson.content}
                  </div>

                  {/* Real World Bangladesh Application */}
                  {selectedLesson.realWorldApplication && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 text-emerald-400">
                        <Lightbulb className="w-4 h-4" />
                        <span>Real-World Context: Bangladesh</span>
                      </div>
                      <p className="text-xs sm:text-sm">{selectedLesson.realWorldApplication}</p>
                    </div>
                  )}

                  {/* Guided Practice Exercises */}
                  {selectedLesson.practiceExercises?.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Guided Practice Exercises
                      </h4>
                      {selectedLesson.practiceExercises.map((ex, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="text-xs font-medium text-white">
                            <span className="text-emerald-400 font-bold">Exercise {idx + 1}: </span>
                            {ex.question}
                          </div>
                          {ex.hint && (
                            <div className="text-[11px] text-amber-300/90 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Hint: {ex.hint}</span>
                            </div>
                          )}
                          <details className="text-xs text-slate-400">
                            <summary className="cursor-pointer hover:text-slate-200 font-semibold select-none">
                              Show Sample Derivation / Solution
                            </summary>
                            <div className="mt-2 p-3 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-mono text-[11px]">
                              {ex.sampleAnswer}
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Select a chapter on the left to begin learning.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600" />
              <p>Please choose a textbook and chapter to read the PDF and take assessments.</p>
            </div>
          )}
        </section>
      </div>

      {/* Linked ChatGPT Modal */}
      <ChatGPTModal
        isOpen={showChatGPTModal}
        onClose={() => setShowChatGPTModal(false)}
        contextBookTitle={selectedBook?.title}
        contextSubject={selectedBook?.subject}
        contextChapterTitle={selectedChapter?.title}
      />
    </div>
  );
};
