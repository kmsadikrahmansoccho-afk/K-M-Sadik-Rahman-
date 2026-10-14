// Shikkhora Platform Types

export type UserRole = 'student' | 'parent' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  createdAt: string;
  isVerified: boolean;
  // Student specific fields
  schoolName?: string;
  gender?: 'Male' | 'Female' | 'Other';
  studentClass?: number; // 1 - 10
  cityOrDistrict?: string;
  // Parent specific fields
  phone?: string;
  linkedStudentIds?: string[];
}

export interface AuthSession {
  token: string;
  userId: string;
  role: UserRole;
  email: string;
  fullName: string;
  expiresAt: string;
  studentClass?: number;
}

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  purpose: 'student_verify' | 'admin_otp' | 'password_reset' | 'parent_link';
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface NctbBook {
  id: string;
  title: string;
  titleBn: string;
  studentClass: number; // 1-10
  subject: string;
  subjectBn: string;
  curriculumEdition: string;
  publisher: string;
  coverColor: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfSizeBytes?: number;
  allowDownload: boolean;
  published: boolean;
  uploadedBy?: string; // admin email, e.g. kmsadikrahmansoccho@gmail.com
  createdAt: string;
  updatedAt: string;
}

export interface NctbChapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  titleBn: string;
  summary: string;
  summaryBn?: string;
  pdfStartPage?: number;
  pdfEndPage?: number;
  quizConfigured: boolean;
  examConfigured: boolean;
}

export interface NctbLesson {
  id: string;
  chapterId: string;
  lessonNumber: number;
  title: string;
  titleBn: string;
  content: string; // Markdown / structured pedagogical text
  contentBn?: string;
  learningObjectives: string[];
  inquiryPrompt: string; // Cambridge / IB style inquiry
  realWorldApplication: string;
  practiceExercises: {
    question: string;
    hint: string;
    sampleAnswer: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'short';
  question: string;
  questionBn?: string;
  options?: string[]; // 4 options for MCQ
  correctAnswer: string;
  marks: number;
  explanation: string;
}

export interface ChapterQuiz {
  id: string;
  chapterId: string;
  bookId: string;
  title: string;
  totalMarks: 20; // Exactly 20 marks requirement
  questions: QuizQuestion[];
  passingMarks: number; // e.g. 12/20
  published: boolean;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  chapterId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, string>; // questionId -> answer
  score: number; // Max 20
  totalMarks: 20;
  passed: boolean;
  submittedAt: string;
}

export interface ExamQuestion {
  id: string;
  section: 'A: Knowledge & Understanding' | 'B: Conceptual & Problem Solving' | 'C: Creative & Inquiry Application';
  question: string;
  questionBn?: string;
  marks: number;
  guidelines: string;
  sampleAnswer?: string;
}

export interface ChapterExam {
  id: string;
  chapterId: string;
  bookId: string;
  title: string;
  totalMarks: 100; // Exactly 100 marks requirement
  durationMinutes: number; // e.g. 60 or 90
  instructions: string[];
  questions: ExamQuestion[];
  rubric: {
    criteria: string;
    maxPoints: number;
    description: string;
  }[];
  published: boolean;
}

export type ExamStatus = 'SUBMITTED' | 'AI_GRADING_IN_PROGRESS' | 'PENDING_ADMIN_REVIEW' | 'PUBLISHED' | 'PROCESSING_FAILED';

export interface ExamSubmission {
  id: string;
  examId: string;
  chapterId: string;
  bookId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  answers: Record<string, string>; // questionId -> answer text
  startedAt: string;
  submittedAt: string;
  status: ExamStatus;
  targetPublicationTime: string; // 48 hours from submittedAt
  aiEvaluation?: {
    totalScore: number; // Max 100
    sectionScores: Record<string, number>;
    feedbackByQuestion: Record<string, { marksAwarded: number; maxMarks: number; feedback: string }>;
    overallFeedback: string;
    flaggedForReview: boolean;
    uncertaintyReason?: string;
    evaluatedAt: string;
  };
  finalGrade?: {
    totalScore: number;
    letterGrade: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F';
    adminFeedback?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    isOverridden: boolean;
    overrideReason?: string;
  };
  publishedAt?: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  timestamp: string;
  language?: 'bn' | 'en' | 'mixed';
}

export interface AiConversation {
  id: string;
  studentId: string;
  title: string;
  messages: AiChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CodeModule {
  id: string;
  category: 'c' | 'html';
  moduleNumber: number;
  title: string;
  titleBn?: string;
  summary: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string; // Rich explanation & code blocks
  starterCode: string;
  solutionCode?: string;
  exercisePrompt: string;
  expectedOutputSnippet?: string;
  quizQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface StudentProgress {
  studentId: string;
  completedLessonIds: string[];
  quizScores: Record<string, number>; // quizId -> score
  examIds: string[];
  cCompletedModules: string[];
  htmlCompletedModules: string[];
  totalStudyMinutes: number;
  lastActiveDate: string;
}

export interface StudySessionLog {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  activityType: 'lesson' | 'quiz' | 'exam' | 'ai_tutor' | 'c_code' | 'html_code';
  details: string;
}

export interface FiveDayProgressReport {
  studentId: string;
  studentName: string;
  studentClass: number;
  reportStartDate: string;
  reportEndDate: string;
  activeStudyMinutes: number;
  lessonsCompletedCount: number;
  quizzesTakenCount: number;
  averageQuizScore: number; // percentage
  examsSubmittedCount: number;
  cModulesCompletedCount: number;
  htmlModulesCompletedCount: number;
  strongTopics: string[];
  improvementAreas: string[];
  recommendations: string[];
  dailyActivity: {
    date: string;
    minutes: number;
    lessons: number;
    quizzes: number;
  }[];
  isSufficientData: boolean;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: 'user' | 'book' | 'pdf' | 'exam' | 'quiz' | 'grade' | 'settings';
  targetId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemSettings {
  allowStudentRegistration: boolean;
  requireEmailVerification: boolean;
  enableAiTutor: boolean;
  enableAiExamGrading: boolean;
  adminDesignatedEmail: string;
  examResultTargetHours: number; // 48
  allowPdfDownloads: boolean;
}

export interface AiSearchRecord {
  id: string;
  userEmail: string;
  query: string;
  responseSnippet?: string;
  modelUsed?: string;
  timestamp: string;
}

export interface ReadPdfRecord {
  id: string;
  userEmail: string;
  bookId: string;
  bookTitle: string;
  studentClass: number;
  pdfUrl: string;
  lastReadAt: string;
  pagesRead?: number;
  notes?: string;
}

export interface DownloadedPdfRecord {
  id: string;
  userEmail: string;
  bookId: string;
  bookTitle: string;
  studentClass: number;
  pdfUrl: string;
  downloadedAt: string;
  fileSizeBytes?: number;
}

export interface UserEmailStorageData {
  userEmail: string;
  studentId?: string;
  aiSearches: AiSearchRecord[];
  readPdfs: ReadPdfRecord[];
  downloadedPdfs: DownloadedPdfRecord[];
  storageUsedBytes: number;
  lastSyncAt: string;
}

export interface AdminStorageOverview {
  adminEmail: string;
  totalBooksAdded: number;
  totalPdfsLinked: number;
  totalQuizzesConfigured: number;
  totalExamsConfigured: number;
  estimatedStorageBytes: number;
  googleDriveLinked: boolean;
  driveAccount: string;
  items: {
    id: string;
    title: string;
    studentClass: number;
    subject: string;
    pdfUrl: string;
    fileSizeBytes: number;
    allowDownload: boolean;
    addedAt: string;
    uploadedBy: string;
  }[];
}

