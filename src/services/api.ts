import type {
  User,
  AuthSession,
  NctbBook,
  NctbChapter,
  NctbLesson,
  ChapterQuiz,
  ChapterExam,
  ExamSubmission,
  CodeModule,
  FiveDayProgressReport,
  AuditLog,
  UserEmailStorageData,
  AdminStorageOverview,
} from '../types';

const TOKEN_KEY = 'shikkhora_auth_token';
const USER_KEY = 'shikkhora_auth_user';

export function getStoredSession(): { token: string | null; user: User | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);
  let user: User | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }
  return { token, user };
}

export function saveSession(session: AuthSession, user: User): void {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { token } = getStoredSession();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Authentication
  registerStudent: (data: any) => request<any>('/auth/register-student', { method: 'POST', body: JSON.stringify(data) }),
  verifyEmail: (data: { email: string; code: string }) => request<any>('/auth/verify-email', { method: 'POST', body: JSON.stringify(data) }),
  resendCode: (email: string, purpose = 'student_verify') => request<any>('/auth/resend-code', { method: 'POST', body: JSON.stringify({ email, purpose }) }),
  login: (data: { email: string; password: string }) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  // Admin Login (Direct login without OTP)
  adminLogin: (data: { email: string; password: string }) => request<{ message: string; session: AuthSession; user: User }>('/auth/admin/login', { method: 'POST', body: JSON.stringify(data) }),
  adminVerifyOtp: (data: { email: string; otp: string }) => request<{ message: string; session: AuthSession; user: User }>('/auth/admin/verify-otp', { method: 'POST', body: JSON.stringify(data) }),

  // Parent Auth
  registerParent: (data: any) => request<any>('/auth/parent/register', { method: 'POST', body: JSON.stringify(data) }),
  linkChild: (studentEmail: string) => request<any>('/auth/parent/link-child', { method: 'POST', body: JSON.stringify({ studentEmail }) }),
  
  // User Profile & Dev outbox
  getMe: () => request<{ user: User; session: AuthSession }>('/auth/me'),
  getOutbox: () => request<{ messages: any[] }>('/auth/outbox'),

  // Catalogue & Curriculum
  getBooks: (studentClass?: number, subject?: string) => {
    const params = new URLSearchParams();
    if (studentClass) params.set('studentClass', String(studentClass));
    if (subject) params.set('subject', subject);
    return request<{ books: NctbBook[] }>(`/catalogue/books?${params.toString()}`);
  },
  getBookDetails: (id: string) => request<{ book: NctbBook; chapters: NctbChapter[] }>(`/catalogue/books/${id}`),
  getChapterLessons: (chapterId: string) => request<{ lessons: NctbLesson[]; quizConfigured: boolean; examConfigured: boolean }>(`/catalogue/chapters/${chapterId}/lessons`),
  getLesson: (id: string) => request<{ lesson: NctbLesson }>(`/catalogue/lessons/${id}`),

  // Quizzes & Exams
  getQuiz: (chapterId: string) => request<{ quiz: ChapterQuiz }>(`/quizzes/chapter/${chapterId}`),
  submitQuiz: (quizId: string, answers: Record<string, string>) => request<any>(`/quizzes/${quizId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  getExam: (chapterId: string) => request<{ exam: ChapterExam }>(`/exams/chapter/${chapterId}`),
  submitExam: (examId: string, answers: Record<string, string>, startedAt: string) => request<any>(`/exams/${examId}/submit`, { method: 'POST', body: JSON.stringify({ answers, startedAt }) }),
  getMyExamSubmissions: () => request<{ submissions: ExamSubmission[] }>('/exams/submissions/me'),

  // AI Workspace
  askAiTutor: (message: string, history: any[] = [], preferredLanguage = 'mixed') => request<{ response: string }>('/ai/chat', { method: 'POST', body: JSON.stringify({ message, history, preferredLanguage }) }),
  analyzeImage: (imageBase64: string, mimeType: string, userPrompt?: string) => request<{ analysis: string }>('/ai/analyze-image', { method: 'POST', body: JSON.stringify({ imageBase64, mimeType, userPrompt }) }),

  // C Language & HTML Learning
  getCodeModules: (category?: 'c' | 'html') => request<{ modules: CodeModule[] }>(`/code/modules${category ? `?category=${category}` : ''}`),
  runCCode: (code: string, input = '') => request<{ success: boolean; output: string; exitCode: number; error?: string }>('/code/run-c', { method: 'POST', body: JSON.stringify({ code, input }) }),
  completeCodeModule: (moduleId: string, category: 'c' | 'html') => request<any>('/code/complete-module', { method: 'POST', body: JSON.stringify({ moduleId, category }) }),

  // 5-Day Reports & Study Session
  getFiveDayReport: (studentId: string) => request<{ report: FiveDayProgressReport }>(`/reports/five-day/${studentId}`),
  getParentChildData: () => request<any>('/parent/child-data'),
  logStudySession: (minutes: number, activityType: string, details?: string) => request<any>('/study/log-session', { method: 'POST', body: JSON.stringify({ minutes, activityType, details }) }),

  // Main Admin Operations
  getAdminOverview: () => request<any>('/admin/overview'),
  getAdminCompletenessMatrix: () => request<{ matrix: any[] }>('/admin/completeness-matrix'),
  createOrUpdateBook: (bookData: any) => request<any>('/admin/books', { method: 'POST', body: JSON.stringify(bookData) }),
  deleteBook: (bookId: string) => request<any>(`/admin/books/${bookId}`, { method: 'DELETE' }),
  attachPdf: (bookId: string, pdfData: any) => request<any>(`/admin/books/${bookId}/pdf`, { method: 'POST', body: JSON.stringify(pdfData) }),
  createChapter: (chapterData: any) => request<any>('/admin/chapters', { method: 'POST', body: JSON.stringify(chapterData) }),
  createQuiz: (quizData: any) => request<any>('/admin/quizzes', { method: 'POST', body: JSON.stringify(quizData) }),
  createExam: (examData: any) => request<any>('/admin/exams', { method: 'POST', body: JSON.stringify(examData) }),
  getAdminExamSubmissions: () => request<{ submissions: ExamSubmission[] }>('/admin/exam-submissions'),
  reviewExamSubmission: (submissionId: string, reviewData: any) => request<any>(`/admin/exam-submissions/${submissionId}/review`, { method: 'POST', body: JSON.stringify(reviewData) }),
  generateAiContent: (data: { type: string; subject: string; studentClass: number; chapterTitle: string }) => request<any>('/admin/generate-content', { method: 'POST', body: JSON.stringify(data) }),
  getAdminUsers: () => request<{ users: User[] }>('/admin/users'),
  getAdminAuditLogs: () => request<{ auditLogs: AuditLog[] }>('/admin/audit-logs'),
  getAdminStorage: () => request<AdminStorageOverview>('/admin/storage'),
  updateAdminStorageBook: (bookId: string, data: { allowDownload?: boolean; pdfUrl?: string }) => request<any>(`/admin/storage/books/${bookId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Student User Email Storage
  getStudentStorage: () => request<{ storage: UserEmailStorageData; availablePdfs: any[] }>('/student/storage'),
  saveAiSearch: (query: string, responseSnippet?: string, modelUsed?: string) => request<any>('/student/storage/ai-search', { method: 'POST', body: JSON.stringify({ query, responseSnippet, modelUsed }) }),
  deleteAiSearch: (id: string) => request<any>(`/student/storage/ai-search/${id}`, { method: 'DELETE' }),
  recordReadPdf: (data: { bookId: string; bookTitle: string; studentClass: number; pdfUrl: string; pagesRead?: number; notes?: string }) => request<any>('/student/storage/read-pdf', { method: 'POST', body: JSON.stringify(data) }),
  recordDownloadPdf: (data: { bookId: string; bookTitle: string; studentClass: number; pdfUrl: string; fileSizeBytes?: number }) => request<any>('/student/storage/download-pdf', { method: 'POST', body: JSON.stringify(data) }),
};
