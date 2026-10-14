# Shikkhora — Educational Technology Platform
**Brand Promise:** *Learn Better. Grow Further.*

Shikkhora is a world-class educational technology platform engineered from scratch for learners across Bangladesh. It integrates official National Curriculum and Textbook Board (NCTB) school education (Classes 1–10) with international pedagogical quality inspired by Cambridge inquiry-based and IB/PYP conceptual frameworks, alongside comprehensive AI-assisted tutoring, structured C programming, and modern web development.

---

## 1. Core Architecture & System Overview

- **Frontend:** React 19 SPA with Tailwind CSS v4, custom Bengali (`Hind Siliguri`) and Latin (`Plus Jakarta Sans`) typography, and zero-pill clean visual design discipline.
- **Backend:** Full-stack Express.js server running on port 3000 with unified API routing (`/api/*`) and seamless development Vite middleware integration.
- **Database:** Persistent relational-integrity JSON datastore (`data/shikkhora_db.json`) with synchronous atomic file swapping, foreign-key relationships, and seed data.
- **AI Engine:** Google Gemini SDK (`@google/genai`) powering the ChatGPT-style AI tutor in Bangla & English, diagram/math image recognition, automated 100-mark exam grading, and curriculum generation.
- **Authentication & Security:** 
  - PBKDF2 cryptographic password salting and hashing.
  - Signed HMAC 7-day bearer session tokens.
  - Mandatory email verification for students.
  - Strict **Single Main Admin Identity** restricted to `kmsadikrahmansoccho@gmail.com` with mandatory 2-Factor OTP verification.

---

## 2. World-Class Minimal Homepage

The initial homepage adheres strictly to the minimal requirements:
1. **The Shikkhora Logo and Wordmark:** Custom original SVG symbol representing an illuminated open book rising into an ascending knowledge beam and growth path.
2. **Heading:** “Welcome to Shikkhora”.
3. **Student Login:** Opens student login & registration modal.
4. **Parent Login:** Opens parent portal authentication modal.
5. **Three-Dot Menu (Top-Right):** Opens a discrete dropdown containing exactly one item: **Admin Login**.

---

## 3. Four Primary Learning Options (Student Dashboard)

Upon student authentication, exactly four primary learning cards are presented:
1. **Classes 1–10 Lessons:** Official NCTB curriculum across Classes 1 through 10 (Physics, Chemistry, Math, Biology, ICT, Science, Bangla, English). Includes chapter lessons, guided inquiries, real-world Bangladeshi applications, in-browser PDF reader, mandatory 20-mark quizzes, and 100-mark examinations.
2. **AI Learning:** ChatGPT-style AI educational tutor for Bangla and English questions, step-by-step mathematical problem solving, photo/diagram upload, and speech synthesis/recognition.
3. **C Language Learning:** 21 structured modules from beginner syntax to pointers, dynamic memory, and algorithms, equipped with an in-browser C runner and terminal output.
4. **HTML Learning:** 19 progressive web engineering modules with a live interactive code editor and an isolated sandboxed iframe preview.

*Secondary Utilities:* Accessible via the header bar (Active learning timer, rolling 5-day progress report, exam results tracker, student profile, logout).

---

## 4. Assessment & Grading Lifecycle

- **20-Mark Chapter Quiz:** MCQs and short answers totaling exactly 20 marks with instant server scoring.
- **100-Mark Chapter Examination:** Timed countdown, multi-section structured questions (Knowledge, Conceptual/Problem-Solving, Inquiry/Application), auto-save, and server-side submission.
- **AI-Assisted Grading:** Evaluates student answers against rubric and sample answers, assigning section scores and flagging subjective evaluations.
- **48-Hour Publication Target:** Tracked via states: `SUBMITTED` → `AI_GRADING_IN_PROGRESS` → `PENDING_ADMIN_REVIEW` → `PUBLISHED`.
- **Main Admin Audit:** Admin reviews AI scores, can adjust marks with a mandatory recorded audit reason, and publishes results directly to student and parent dashboards.

---

## 5. Main Admin Control Center

Authorized strictly for `kmsadikrahmansoccho@gmail.com`:
- **Overview KPIs:** Active students, verified accounts, parent links, textbook coverage, pending exam audits.
- **Completeness Matrix:** Class-by-class and subject-by-subject gap analysis of books, PDFs, quizzes, and exams.
- **Textbook & PDF Library:** Create books, attach official PDFs, and manage chapters.
- **Exam Grading Console:** Review AI evaluations, adjust marks, and publish results.
- **AI Curriculum Generator:** Draft lessons, 20-mark quizzes, and 100-mark exams with rubrics.
- **Security Audit Logs:** Immutable records of administrative actions.

---

## 6. Development & Deployment Configuration

### Environment Variables (`.env`)
```bash
PORT=3000
GEMINI_API_KEY="your-google-gemini-api-key"
SESSION_SECRET="your-session-secret-key"
SHIKKHORA_ADMIN_PASSWORD="YourSecureAdminPassword!"
```

### Pre-Configured Demo Accounts
- **Main Admin:** `kmsadikrahmansoccho@gmail.com` / `ShikkhoraAdmin2026!` (Prompts for 6-digit OTP delivered to server outbox)
- **Student:** `student@shikkhora.edu.bd` / `Student12345!`
- **Parent:** `parent@shikkhora.edu.bd` / `Parent12345!`
