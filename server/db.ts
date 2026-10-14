import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  VerificationCode,
  NctbBook,
  NctbChapter,
  NctbLesson,
  ChapterQuiz,
  QuizSubmission,
  ChapterExam,
  ExamSubmission,
  CodeModule,
  StudentProgress,
  StudySessionLog,
  AuditLog,
  SystemSettings,
  AiConversation,
  UserEmailStorageData,
} from '../src/types';

export interface DatabaseSchema {
  users: User[];
  verificationCodes: VerificationCode[];
  books: NctbBook[];
  chapters: NctbChapter[];
  lessons: NctbLesson[];
  quizzes: ChapterQuiz[];
  quizSubmissions: QuizSubmission[];
  exams: ChapterExam[];
  examSubmissions: ExamSubmission[];
  codeModules: CodeModule[];
  progress: StudentProgress[];
  studySessions: StudySessionLog[];
  aiConversations: AiConversation[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  userEmailStorages: UserEmailStorageData[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'shikkhora_db.json');

// Designated Main Admin Email
export const DESIGNATED_MAIN_ADMIN_EMAIL = 'kmsadikrahmansoccho@gmail.com';

// Password hashing helper using crypto PBKDF2
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// In-memory cached database backed by atomic file writes
class DatabaseManager {
  private data: DatabaseSchema;
  private writeDebounceTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        // Ensure books have working sample PDF links if not provided and uploadedBy
        if (parsed.books && Array.isArray(parsed.books)) {
          parsed.books.forEach((b) => {
            if (!b.pdfUrl) {
              b.pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            }
            if (!b.uploadedBy) {
              b.uploadedBy = DESIGNATED_MAIN_ADMIN_EMAIL;
            }
          });
        }
        if (!parsed.userEmailStorages || !Array.isArray(parsed.userEmailStorages)) {
          parsed.userEmailStorages = [];
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse existing database file, re-initializing with seed data', e);
      }
    }

    const initial = this.generateInitialSeed();
    this.saveImmediate(initial);
    return initial;
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public save(): void {
    if (this.writeDebounceTimer) {
      clearTimeout(this.writeDebounceTimer);
    }
    this.writeDebounceTimer = setTimeout(() => {
      this.saveImmediate(this.data);
    }, 200);
  }

  public saveImmediate(dataToSave: DatabaseSchema): void {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  private generateInitialSeed(): DatabaseSchema {
    // 1. Initial Admin Identity
    const adminUser: User = {
      id: 'admin_root',
      email: DESIGNATED_MAIN_ADMIN_EMAIL,
      role: 'admin',
      fullName: 'Sadik Rahman Soccho',
      createdAt: new Date().toISOString(),
      isVerified: true,
    };

    // 2. Demo Student Account
    const demoStudent: User = {
      id: 'student_1',
      email: 'student@shikkhora.edu.bd',
      role: 'student',
      fullName: 'Afnan Chowdhury',
      schoolName: 'Dhaka Residential Model College',
      gender: 'Male',
      studentClass: 9,
      cityOrDistrict: 'Dhaka',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      isVerified: true,
    };

    // 3. Demo Parent Account
    const demoParent: User = {
      id: 'parent_1',
      email: 'parent@shikkhora.edu.bd',
      role: 'parent',
      fullName: 'Kamal Chowdhury',
      phone: '+8801711234567',
      linkedStudentIds: ['student_1'],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      isVerified: true,
    };

    // 4. NCTB Books for Classes 1 to 10
    const books: NctbBook[] = [
      // Class 9-10 Physics
      {
        id: 'book_c9_physics',
        title: 'Physics (Class 9-10)',
        titleBn: 'পদার্থবিজ্ঞান (৯ম-১০ম শ্রেণি)',
        studentClass: 9,
        subject: 'Physics',
        subjectBn: 'পদার্থবিজ্ঞান',
        curriculumEdition: 'NCTB National Curriculum 2024 Revised Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-blue-600 to-indigo-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 9-10 Chemistry
      {
        id: 'book_c9_chemistry',
        title: 'Chemistry (Class 9-10)',
        titleBn: 'রসায়ন (৯ম-১০ম শ্রেণি)',
        studentClass: 9,
        subject: 'Chemistry',
        subjectBn: 'রসায়ন',
        curriculumEdition: 'NCTB National Curriculum 2024 Revised Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-emerald-600 to-teal-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 9-10 General Mathematics
      {
        id: 'book_c9_math',
        title: 'Mathematics (Class 9-10)',
        titleBn: 'গণিত (৯ম-১০ম শ্রেণি)',
        studentClass: 9,
        subject: 'Mathematics',
        subjectBn: 'সাধারণ গণিত',
        curriculumEdition: 'NCTB National Curriculum 2024 Revised Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-amber-600 to-orange-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 9-10 Biology
      {
        id: 'book_c9_biology',
        title: 'Biology (Class 9-10)',
        titleBn: 'জীববিজ্ঞান (৯ম-১০ম শ্রেণি)',
        studentClass: 9,
        subject: 'Biology',
        subjectBn: 'জীববিজ্ঞান',
        curriculumEdition: 'NCTB National Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-emerald-700 to-green-950',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 9-10 ICT
      {
        id: 'book_c9_ict',
        title: 'Information & Communication Technology',
        titleBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (৯ম-১০ম শ্রেণি)',
        studentClass: 9,
        subject: 'ICT',
        subjectBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',
        curriculumEdition: 'NCTB National Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-cyan-600 to-blue-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 8 General Science
      {
        id: 'book_c8_science',
        title: 'General Science (Class 8)',
        titleBn: 'বিজ্ঞান (৮ম শ্রেণি)',
        studentClass: 8,
        subject: 'Science',
        subjectBn: 'বিজ্ঞান',
        curriculumEdition: 'NCTB National Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-teal-600 to-emerald-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 7 Mathematics
      {
        id: 'book_c7_math',
        title: 'Mathematics (Class 7)',
        titleBn: 'গণিত (৭ম শ্রেণি)',
        studentClass: 7,
        subject: 'Mathematics',
        subjectBn: 'গণিত',
        curriculumEdition: 'NCTB National Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-sky-600 to-blue-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 6 English for Today
      {
        id: 'book_c6_english',
        title: 'English for Today (Class 6)',
        titleBn: 'ইংলিশ ফর টুডে (৬ষ্ঠ শ্রেণি)',
        studentClass: 6,
        subject: 'English',
        subjectBn: 'ইংরেজি',
        curriculumEdition: 'NCTB National Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-rose-600 to-pink-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 5 Primary Science
      {
        id: 'book_c5_science',
        title: 'Primary Science (Class 5)',
        titleBn: 'প্রাথমিক বিজ্ঞান (৫ম শ্রেণি)',
        studentClass: 5,
        subject: 'Science',
        subjectBn: 'প্রাথমিক বিজ্ঞান',
        curriculumEdition: 'NCTB Primary Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-emerald-600 to-teal-950',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 4 Amar Bangla Boi
      {
        id: 'book_c4_bangla',
        title: 'Amar Bangla Boi (Class 4)',
        titleBn: 'আমার বাংলা বই (৪র্থ শ্রেণি)',
        studentClass: 4,
        subject: 'Bangla',
        subjectBn: 'বাংলা',
        curriculumEdition: 'NCTB Primary Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-amber-600 to-red-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 3 Primary Mathematics
      {
        id: 'book_c3_math',
        title: 'Primary Mathematics (Class 3)',
        titleBn: 'প্রাথমিক গণিত (৩য় শ্রেণি)',
        studentClass: 3,
        subject: 'Mathematics',
        subjectBn: 'গণিত',
        curriculumEdition: 'NCTB Primary Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-indigo-600 to-violet-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 2 Amar Bangla Boi
      {
        id: 'book_c2_bangla',
        title: 'Amar Bangla Boi (Class 2)',
        titleBn: 'আমার বাংলা বই (২য় শ্রেণি)',
        studentClass: 2,
        subject: 'Bangla',
        subjectBn: 'বাংলা',
        curriculumEdition: 'NCTB Primary Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-teal-600 to-cyan-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Class 1 Amar Bangla Boi
      {
        id: 'book_c1_bangla',
        title: 'Amar Bangla Boi (Class 1)',
        titleBn: 'আমার বাংলা বই (১ম শ্রেণি)',
        studentClass: 1,
        subject: 'Bangla',
        subjectBn: 'বাংলা',
        curriculumEdition: 'NCTB Primary Curriculum 2024 Edition',
        publisher: 'National Curriculum and Textbook Board (NCTB), Bangladesh',
        coverColor: 'from-fuchsia-600 to-purple-900',
        allowDownload: true,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 5. NCTB Chapters for Class 9 Physics (as reference model chapter)
    const chapters: NctbChapter[] = [
      {
        id: 'chap_c9_phy_01',
        bookId: 'book_c9_physics',
        chapterNumber: 1,
        title: 'Physical Quantities and Measurement',
        titleBn: 'ভৌত রাশি ও তার পরিমাপ',
        summary: 'Explore the origin of physics, fundamental physical quantities, SI base units, dimension equations, vernier calipers, and screw gauge precision measurement.',
        summaryBn: 'পদার্থবিজ্ঞানের ক্রমবিকাশ, মৌলিক ও লব্ধ রাশি, এস.আই একক, মাত্রা সমীকরণ, ভার্নিয়ার স্কেল ও স্ক্রু গজ দ্বারা নির্ভুল পরিমাপ।',
        pdfStartPage: 1,
        pdfEndPage: 28,
        quizConfigured: true,
        examConfigured: true,
      },
      {
        id: 'chap_c9_phy_02',
        bookId: 'book_c9_physics',
        chapterNumber: 2,
        title: 'Motion',
        titleBn: 'গতি',
        summary: 'Study rest and motion, scalars and vectors, speed, velocity, uniform acceleration, equations of linear motion, and motion under gravity.',
        summaryBn: 'স্থিতি ও গতি, স্কেলার ও ভেক্টর, দ্রুতি, বেগ, সুষম ত্বরণ, গতির সমীকরণসমূহ এবং পড়ন্ত বস্তুর গতি।',
        pdfStartPage: 29,
        pdfEndPage: 58,
        quizConfigured: true,
        examConfigured: true,
      },
      {
        id: 'chap_c9_phy_03',
        bookId: 'book_c9_physics',
        chapterNumber: 3,
        title: 'Force and Dynamics',
        titleBn: 'বল ও গতিবিদ্যা',
        summary: "Newton's laws of motion, inertia, momentum, conservation of momentum, friction, and practical dynamics in Bangladeshi transport systems.",
        summaryBn: 'নিউটনের গতির সূত্রাবলী, জড়তা, ভরবেগ, ভরবেগের সংরক্ষণ সূত্র, ঘর্ষণ এবং যানবাহন পরিচালনায় বাস্তব প্রয়োগ।',
        pdfStartPage: 59,
        pdfEndPage: 88,
        quizConfigured: true,
        examConfigured: true,
      },
      {
        id: 'chap_c9_phy_04',
        bookId: 'book_c9_physics',
        chapterNumber: 4,
        title: 'Work, Power, and Energy',
        titleBn: 'কাজ, ক্ষমতা ও শক্তি',
        summary: 'Work done by constant force, kinetic and potential energy, conservation of energy, renewable energy sources in Bangladesh, and power efficiency.',
        summaryBn: 'কাজ, গতিশক্তি ও বিভব শক্তি, শক্তির সংরক্ষণশীলতা, বাংলাদেশে নবায়নযোগ্য শক্তি ও কর্মদক্ষতা।',
        pdfStartPage: 89,
        pdfEndPage: 118,
        quizConfigured: false,
        examConfigured: false,
      },
    ];

    // 6. Pedagogical Lessons for Chapter 1: Physical Quantities & Measurement
    const lessons: NctbLesson[] = [
      {
        id: 'lesson_c9_phy_1_1',
        chapterId: 'chap_c9_phy_01',
        lessonNumber: 1,
        title: 'The Nature of Physics and Scope of Knowledge',
        titleBn: 'পদার্থবিজ্ঞানের প্রকৃতি ও অনুসন্ধিৎসা',
        learningObjectives: [
          'Understand that physics is the foundational natural science investigating matter and energy.',
          'Analyze how observations and quantitative measurements formulate physical laws.',
          'Connect the history of science from Archimedes and Ibn al-Haytham to modern quantum mechanics.',
        ],
        inquiryPrompt: 'If human eyes could see ultraviolet or infrared light, how would our fundamental understanding of physics and natural laws change?',
        realWorldApplication: 'Every sensor in Dhaka’s modern Metro Rail uses physical principles of optical alignment and electromagnetic sensors to regulate passenger safety.',
        content: `### 1.1 The Essence of Physics
Physics is the study of matter, energy, and their mutual interactions. Everything in our universe, from the subatomic quarks to the vast spiral galaxies, follows quantifiable natural principles.

#### Key Historical Milestones
- **Ancient Era**: Archimedes laid down the principles of buoyancy and lever mechanics.
- **Islamic Golden Age**: Ibn al-Haytham founded experimental optics and the scientific method of empirical inquiry.
- **Classical Revolution**: Isaac Newton unified celestial and terrestrial mechanics with universal gravitation.
- **Modern Era**: Einstein's relativity and Planck's quantum theory revolutionized our perspective on spacetime and energy.

#### The Scientific Inquiry Method
1. Observation of a natural phenomenon.
2. Formulation of a falsifiable hypothesis.
3. Controlled experimentation with quantitative data collection.
4. Mathematical synthesis and theoretical verification.`,
        practiceExercises: [
          {
            question: 'Differentiate between a physical quantity and an abstract mathematical concept.',
            hint: 'Consider whether the quantity can be measured directly or indirectly using physical apparatus.',
            sampleAnswer: 'A physical quantity is anything in nature that can be measured with an instrument (e.g., length, mass, temperature), whereas an abstract mathematical concept exists purely in logical systems without mandatory physical existence.',
          },
        ],
      },
      {
        id: 'lesson_c9_phy_1_2',
        chapterId: 'chap_c9_phy_01',
        lessonNumber: 2,
        title: 'Fundamental SI Units and Derived Quantities',
        titleBn: 'মৌলিক এস.আই একক ও লব্ধ রাশি',
        learningObjectives: [
          'Identify the seven fundamental base quantities in the International System of Units (SI).',
          'Derive dimensional formulas for force, pressure, work, and velocity.',
          'Check the dimensional homogeneity of physical equations.',
        ],
        inquiryPrompt: 'Why did the international scientific community standardize definitions of length based on the speed of light rather than physical metal prototype bars?',
        realWorldApplication: 'Accurate medication dosages produced by Beximco and Square Pharmaceuticals in Bangladesh rely on strictly calibrated microgram SI measurements.',
        content: `### 1.2 The Seven Base Quantities
The International System of Units (Système International d'Unités - SI) defines seven fundamental base quantities:

1. **Length**: Meter ($m$) — defined by distance light travels in vacuum in $1/299,792,458$ seconds.
2. **Mass**: Kilogram ($kg$) — defined by the Planck constant $h = 6.62607015 \\times 10^{-34} \\text{ J}\\cdot\\text{s}$.
3. **Time**: Second ($s$) — defined by cesium-133 ground-state hyperfine transition frequency.
4. **Electric Current**: Ampere ($A$).
5. **Thermodynamic Temperature**: Kelvin ($K$).
6. **Amount of Substance**: Mole ($mol$).
7. **Luminous Intensity**: Candela ($cd$).

### Dimensional Analysis
Every physical equation must be dimensionally homogeneous. The dimension of both sides must match.
- Force: $[F] = [m][a] = M L T^{-2}$
- Pressure: $[P] = [F]/[A] = (M L T^{-2}) / L^2 = M L^{-1} T^{-2}$
- Energy / Work: $[W] = [F][s] = M L^2 T^{-2}$`,
        practiceExercises: [
          {
            question: 'Verify using dimensional analysis whether the kinetic energy equation $E_k = \\frac{1}{2} m v^2$ is dimensionally correct.',
            hint: 'Dimension of mass is M, dimension of velocity is LT^-1.',
            sampleAnswer: 'LHS: $[E_k] = M L^2 T^{-2}$. RHS: $[\\frac{1}{2} m v^2] = [m][v]^2 = M (L T^{-1})^2 = M L^2 T^{-2}$. Since LHS dimension matches RHS dimension, the equation is dimensionally consistent.',
          },
        ],
      },
      {
        id: 'lesson_c9_phy_1_3',
        chapterId: 'chap_c9_phy_01',
        lessonNumber: 3,
        title: 'Precision Measuring Instruments: Vernier Calipers and Screw Gauge',
        titleBn: 'সূক্ষ্ম পরিমাপক যন্ত্র: ভার্নিয়ার ক্যালিপার্স ও স্ক্রু গজ',
        learningObjectives: [
          'Calculate the Vernier Constant (VC) and Least Count (LC) of precision instruments.',
          'Measure diameter and depth using Vernier Calipers with zero error correction.',
          'Calculate pitch, least count, and wire thickness with a micrometer screw gauge.',
        ],
        inquiryPrompt: 'How does mechanical gearing allow us to resolve lengths smaller than the thickness of a human hair without optical magnification?',
        realWorldApplication: 'Civil engineers constructing the Padma Bridge required micrometer calibration for steel bearing tolerance within $0.05\\text{ mm}$.',
        content: `### 1.3 Precision Instrumentation

#### Vernier Calipers
A standard ruler can only measure accurately to $1\\text{ mm}$. A Vernier Caliper overcomes this limit by utilizing a sliding Vernier scale.

- **Vernier Constant ($VC$)**:
  $$VC = \\frac{s}{n}$$
  where $s = 1\\text{ mm}$ (smallest division of main scale) and $n = 20$ (number of vernier divisions).
  $$VC = \\frac{1\\text{ mm}}{20} = 0.05\\text{ mm} = 0.005\\text{ cm}$$

- **Total Reading ($L$)**:
  $$L = M + (V \\times VC) - (\\pm e)$$
  where $M$ is main scale reading, $V$ is vernier coincidence division, and $e$ is zero error.

#### Micrometer Screw Gauge
Measures cylindrical wire diameter or sheet thickness down to $0.01\\text{ mm}$.
- **Pitch**: Linear distance advanced by the thimble in one full rotation ($1\\text{ mm}$ or $0.5\\text{ mm}$).
- **Least Count ($LC$)**:
  $$LC = \\frac{\\text{Pitch}}{\\text{Total circular scale divisions}}$$`,
        practiceExercises: [
          {
            question: 'If the pitch of a screw gauge is 1 mm and the circular scale has 100 divisions, calculate its least count.',
            hint: 'Divide pitch by circular scale divisions.',
            sampleAnswer: 'Least Count = Pitch / Number of circular divisions = 1 mm / 100 = 0.01 mm (or 0.001 cm).',
          },
        ],
      },
    ];

    // 7. Mandatory 20-Mark Chapter Quiz for Chapter 1
    const chapter1Quiz: ChapterQuiz = {
      id: 'quiz_c9_phy_chap1',
      chapterId: 'chap_c9_phy_01',
      bookId: 'book_c9_physics',
      title: 'Chapter 1 Mandatory Mastery Quiz: Physical Quantities & Measurement',
      totalMarks: 20,
      passingMarks: 14,
      published: true,
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Which of the following is a fundamental base quantity in the SI system?',
          options: ['Velocity', 'Electric Current', 'Force', 'Density'],
          correctAnswer: 'Electric Current',
          marks: 2,
          explanation: 'Electric current is one of the seven base quantities (Ampere). Velocity, force, and density are derived quantities.',
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What is the dimension of Pressure?',
          options: ['M L T^-2', 'M L^-1 T^-2', 'M L^2 T^-2', 'M^-1 L T^-2'],
          correctAnswer: 'M L^-1 T^-2',
          marks: 2,
          explanation: 'Pressure = Force / Area = (M L T^-2) / (L^2) = M L^-1 T^-2.',
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'If the main scale of a vernier caliper reads 4.3 cm and the vernier coincidence is 6 (VC = 0.005 cm, zero error = 0), what is the total length?',
          options: ['4.330 cm', '4.306 cm', '4.360 cm', '4.036 cm'],
          correctAnswer: '4.330 cm',
          marks: 3,
          explanation: 'Total Length = Main scale + (Coincidence * VC) = 4.3 + (6 * 0.005) = 4.3 + 0.030 = 4.330 cm.',
        },
        {
          id: 'q4',
          type: 'mcq',
          question: 'The pitch of a micrometer screw gauge is 0.5 mm and it has 50 circular divisions. Its least count is:',
          options: ['0.01 mm', '0.05 mm', '0.001 mm', '0.1 mm'],
          correctAnswer: '0.01 mm',
          marks: 3,
          explanation: 'Least Count = Pitch / Circular Divisions = 0.5 mm / 50 = 0.01 mm.',
        },
        {
          id: 'q5',
          type: 'short',
          question: 'State the difference between positive zero error and negative zero error in a Vernier Caliper.',
          correctAnswer: 'In positive zero error, the vernier zero line stays to the right of the main scale zero (reading is larger than actual and must be subtracted). In negative zero error, the vernier zero stays to the left (reading is smaller and must be added).',
          marks: 5,
          explanation: 'Zero errors occur due to manufacturing tolerances or mechanical wear. Positive error is subtracted; negative error is added.',
        },
        {
          id: 'q6',
          type: 'short',
          question: 'Explain why the equation s = vt + (1/2)at^2 is verified to be dimensionally homogeneous.',
          correctAnswer: 'Each term has dimension of Length [L]: [s] = L, [vt] = (LT^-1)(T) = L, and [(1/2)at^2] = (LT^-2)(T^2) = L. Since all additive terms have identical dimension L, the equation is homogeneous.',
          marks: 5,
          explanation: 'Physical quantities with different dimensions cannot be added or equated.',
        },
      ],
    };

    // 8. Separate 100-Mark Chapter Examination for Chapter 1
    const chapter1Exam: ChapterExam = {
      id: 'exam_c9_phy_chap1',
      chapterId: 'chap_c9_phy_01',
      bookId: 'book_c9_physics',
      title: 'Chapter 1 Comprehensive Examination: Physical Quantities, Precision Metrology & Analysis',
      totalMarks: 100,
      durationMinutes: 75,
      instructions: [
        'This examination consists of 3 comprehensive sections worth a total of 100 marks.',
        'Answer all questions with clear step-by-step mathematical reasoning and scientific rationale.',
        'Visible countdown timer is strictly enforced. Upon time expiry, answers will be saved automatically.',
        'Results will be evaluated via AI-assisted grading and reviewed by Shikkhora Main Admin within 48 hours.',
      ],
      questions: [
        {
          id: 'eq1',
          section: 'A: Knowledge & Understanding',
          question: 'Explain the fundamental significance of the International System of Units (SI). Detail the operational definitions of the kilogram and the second as revised by the BIPM.',
          marks: 15,
          guidelines: 'Student should detail the transition from physical artifacts (such as the platinum-iridium cylinder in Sèvres) to fundamental universal physical constants (Planck constant and cesium-133 atomic hyperfine transition).',
        },
        {
          id: 'eq2',
          section: 'A: Knowledge & Understanding',
          question: 'Define Vernier Constant (VC) and Least Count (LC). Derive the formula for Vernier Constant when n divisions of the Vernier scale coincide with (n-1) divisions of the main scale of smallest division s.',
          marks: 15,
          guidelines: 'Clear mathematical proof showing n * VSD = (n-1) * MSD, leading to VC = MSD - VSD = s/n.',
        },
        {
          id: 'eq3',
          section: 'B: Conceptual & Problem Solving',
          question: 'A laboratory student in Chittagong measures the diameter of a solid brass cylinder using a slide calipers. The main scale reading is 3.2 cm, the vernier coincidence is 7, and the instrument has 20 vernier divisions spanning 19 mm. Before taking measurements, when the jaws were in contact, the vernier zero was 2 divisions to the right of the main scale zero. Calculate: (a) The vernier constant, (b) The zero error, (c) The corrected diameter of the cylinder, (d) The volume of the cylinder if its corrected length is 8.54 cm.',
          marks: 25,
          guidelines: 'Part (a) VC = 1 mm / 20 = 0.05 mm = 0.005 cm (5 marks). Part (b) Positive zero error = +0.01 cm (5 marks). Part (c) Corrected diameter = 3.2 + (7 * 0.005) - 0.01 = 3.2 + 0.035 - 0.01 = 3.225 cm (7 marks). Part (d) Volume = pi * (d/2)^2 * h = 3.1416 * (1.6125)^2 * 8.54 = ~69.75 cm^3 (8 marks).',
        },
        {
          id: 'eq4',
          section: 'B: Conceptual & Problem Solving',
          question: 'The period of oscillation T of a simple pendulum may depend on mass of the bob m, length of the string l, and acceleration due to gravity g. Use the method of dimensions to derive the relation between T, m, l, and g. State why the dimensionless constant cannot be determined solely by dimensional analysis.',
          marks: 20,
          guidelines: 'Dimensional setup: [T] = M^a L^b (LT^-2)^c. Solve powers: a = 0, b = 1/2, c = -1/2. Yields T = k * sqrt(l/g). Explain that dimensional analysis only deals with fundamental dimensions and cannot resolve pure numerical factors like 2*pi.',
        },
        {
          id: 'eq5',
          section: 'C: Creative & Inquiry Application',
          question: 'An environmental research team in Sylhet needs to determine the thickness of microplastic films collected from the Surma River. They possess a micrometer screw gauge and a digital laboratory scale. Formulate a comprehensive experimental protocol to measure the film thickness accurately, account for instrumental zero errors, and estimate percentage uncertainty in the final result.',
          marks: 25,
          guidelines: 'Inquiry response should encompass: (1) Preliminary calibration and zero error check of the micrometer, (2) Multiple randomized sampling across different points on the film to compute mean and standard deviation, (3) Use of folded layered technique (e.g. measure 10 layers together then divide) to overcome instrument resolution barrier, (4) Systematic uncertainty vs random error analysis.',
        },
      ],
      rubric: [
        {
          criteria: 'Scientific Conceptual Accuracy',
          maxPoints: 35,
          description: 'Correctness of physical principles, SI definitions, and dimensional logic.',
        },
        {
          criteria: 'Mathematical Precision & Derivation',
          maxPoints: 35,
          description: 'Step-by-step arithmetic accuracy, formula derivation, and dimensional balancing.',
        },
        {
          criteria: 'Critical Inquiry & Scientific Protocol',
          maxPoints: 30,
          description: 'Experimental rigor, error analysis, practical calibration, and real-world synthesis.',
        },
      ],
      published: true,
    };

    // 9. C Programming Course Modules (21 Structured Modules)
    const cModules: CodeModule[] = [
      {
        id: 'c_mod_01',
        category: 'c',
        moduleNumber: 1,
        title: 'Introduction to Programming & Computing Models',
        summary: 'Explore how computers execute machine instructions, what compilers do, and the legacy of Dennis Ritchie’s C language.',
        level: 'Beginner',
        content: `### Why Learn C?
C was developed in 1972 at Bell Labs by Dennis Ritchie. It powers Unix, Linux kernels, Windows operating systems, embedded systems, automotive controllers, and high-performance game engines.

Key features:
- Procedural, structured programming language.
- Low-level memory manipulation via pointers.
- Minimal runtime overhead and close-to-metal execution speed.`,
        starterCode: `// Module 1: The First Step in C
#include <stdio.h>

int main() {
    printf("Shikkhora: Welcome to C Programming!\\n");
    printf("Learn Better. Grow Further.\\n");
    return 0;
}`,
        exercisePrompt: 'Modify the program to print your name, your school, and the year you started learning to code.',
        expectedOutputSnippet: 'Shikkhora: Welcome to C Programming!',
        quizQuestions: [
          {
            question: 'Who created the C programming language?',
            options: ['Bjarne Stroustrup', 'Dennis Ritchie', 'James Gosling', 'Guido van Rossum'],
            correctIndex: 1,
            explanation: 'Dennis Ritchie developed C at Bell Laboratories in 1972.',
          },
        ],
      },
      {
        id: 'c_mod_02',
        category: 'c',
        moduleNumber: 2,
        title: 'Structure of a C Program & The Preprocessor',
        summary: 'Understand #include, header files, the main() entry point function, and program return codes.',
        level: 'Beginner',
        content: `### Anatomical Breakdown of a C Program
1. **Preprocessor Directives**: Lines beginning with \`#\`, such as \`#include <stdio.h>\`.
2. **Global Declarations**: Constants and function prototypes.
3. **The main() Function**: The mandatory entry point where operating system transfers control.
4. **Statements & Semicolons**: Every statement ends with a semicolon \`;\`.
5. **Return Code**: \`return 0;\` signals successful execution to the operating system.`,
        starterCode: `#include <stdio.h>

int main() {
    // Write your code here
    int a = 15;
    int b = 25;
    printf("Sum: %d + %d = %d\\n", a, b, a + b);
    return 0;
}`,
        exercisePrompt: 'Declare three integers representing lengths of three sides of a box and print its calculated volume.',
        quizQuestions: [
          {
            question: 'What does the return code 0 conventionally signify in main()?',
            options: ['Runtime syntax error', 'Program completed successfully', 'Execution paused', 'Infinite loop'],
            correctIndex: 1,
            explanation: 'In standard Unix and C conventions, returning 0 signals that the process terminated without error.',
          },
        ],
      },
      {
        id: 'c_mod_03',
        category: 'c',
        moduleNumber: 3,
        title: 'Variables, Constants, and Data Types',
        summary: 'Master int, float, double, char, format specifiers (%d, %f, %lf, %c), and memory sizes.',
        level: 'Beginner',
        content: `### Data Types and Memory
- \`int\`: Integer numbers (typically 4 bytes, $-2^{31}$ to $2^{31}-1$).
- \`float\`: Single-precision floating point (4 bytes, 6-7 digits precision).
- \`double\`: Double-precision floating point (8 bytes, 15-16 digits precision).
- \`char\`: Single character (1 byte, stored as ASCII code).`,
        starterCode: `#include <stdio.h>

int main() {
    int age = 16;
    double gpa = 5.00;
    char grade = 'A';
    
    printf("Student Profile:\\n");
    printf("Age: %d years\\n", age);
    printf("SSC GPA: %.2f\\n", gpa);
    printf("Grade: %c+\\n", grade);
    return 0;
}`,
        exercisePrompt: 'Calculate the area of a circle with radius 7.5 cm using double precision and print the result with 3 decimal places.',
        quizQuestions: [
          {
            question: 'Which format specifier is used for double-precision float in printf?',
            options: ['%d', '%f', '%lf', '%c'],
            correctIndex: 1,
            explanation: 'In printf, both %f and %lf can print double, but %lf is standard for scanf and double output.',
          },
        ],
      },
      {
        id: 'c_mod_04',
        category: 'c',
        moduleNumber: 4,
        title: 'Operators and Expressions',
        summary: 'Arithmetic, relational, logical, assignment, and increment/decrement operators.',
        level: 'Beginner',
        content: `### Operator Hierarchy
- Arithmetic: \`+\`, \`-\`, \`*\`, \`/\`, \`%\` (modulus for integer remainder).
- Relational: \`==\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`.
- Logical: \`&&\` (AND), \`||\` (OR), \`!\` (NOT).`,
        starterCode: `#include <stdio.h>

int main() {
    int totalMinutes = 145;
    int hours = totalMinutes / 60;
    int remainingMinutes = totalMinutes % 60;
    
    printf("%d minutes = %d hours and %d minutes\\n", totalMinutes, hours, remainingMinutes);
    return 0;
}`,
        exercisePrompt: 'Given a 3-digit number (e.g., 385), extract and print the sum of its individual digits using % and /.',
        quizQuestions: [
          {
            question: 'What is the value of 17 % 5?',
            options: ['3', '2', '1', '0'],
            correctIndex: 1,
            explanation: '17 divided by 5 is 3 with a remainder of 2. 17 % 5 = 2.',
          },
        ],
      },
      {
        id: 'c_mod_05',
        category: 'c',
        moduleNumber: 5,
        title: 'Conditional Statements: if, else if, switch',
        summary: 'Branching logic, decision trees, and the ternary conditional operator.',
        level: 'Beginner',
        content: `### Branching in C
Use \`if\`, \`else if\`, and \`else\` to direct flow based on boolean expressions. Use \`switch-case\` for multi-way constant integer/char branching.`,
        starterCode: `#include <stdio.h>

int main() {
    int marks = 85;
    
    if (marks >= 80) {
        printf("Grade: A+ (Outstanding)\\n");
    } else if (marks >= 70) {
        printf("Grade: A (Excellent)\\n");
    } else if (marks >= 60) {
        printf("Grade: A- (Very Good)\\n");
    } else {
        printf("Review needed\\n");
    }
    return 0;
}`,
        exercisePrompt: 'Write a program to determine whether a given year (e.g. 2024) is a Leap Year.',
        quizQuestions: [
          {
            question: 'What keyword prevents fall-through in a switch statement?',
            options: ['stop', 'exit', 'break', 'return'],
            correctIndex: 2,
            explanation: 'The break keyword exits the switch block immediately.',
          },
        ],
      },
      {
        id: 'c_mod_06',
        category: 'c',
        moduleNumber: 6,
        title: 'Loops and Iteration: for, while, do-while',
        summary: 'Repetition constructs, break, continue, and nested loop patterns.',
        level: 'Beginner',
        content: `### Iteration
- \`for (init; condition; step)\`: Best when loop count is known.
- \`while (condition)\`: Best when condition is checked prior to body.
- \`do ... while (condition);\`: Guarantees body runs at least once.`,
        starterCode: `#include <stdio.h>

int main() {
    printf("Generating Multiplication Table for 7:\\n");
    for (int i = 1; i <= 10; i++) {
        printf("7 x %2d = %2d\\n", i, 7 * i);
    }
    return 0;
}`,
        exercisePrompt: 'Print the first 15 numbers of the Fibonacci sequence using a while loop.',
        quizQuestions: [
          {
            question: 'Which loop is guaranteed to execute at least once?',
            options: ['for', 'while', 'do-while', 'nested for'],
            correctIndex: 2,
            explanation: 'do-while evaluates its condition at the bottom after executing the loop body.',
          },
        ],
      },
      {
        id: 'c_mod_07',
        category: 'c',
        moduleNumber: 7,
        title: 'Functions and Modular Code Design',
        summary: 'Function prototypes, parameters, call-by-value, return types, and scope.',
        level: 'Intermediate',
        content: `### Functions
Break complex problems into reusable, single-responsibility units.
- Prototype: \`int calculateArea(int width, int height);\``,
        starterCode: `#include <stdio.h>

// Function Prototype
long long factorial(int n);

int main() {
    int num = 6;
    printf("Factorial of %d is %lld\\n", num, factorial(num));
    return 0;
}

// Function Definition
long long factorial(int n) {
    long long result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}`,
        exercisePrompt: 'Write a function isPrime(int n) that returns 1 if n is prime, and 0 otherwise.',
        quizQuestions: [
          {
            question: 'In C, function arguments are passed by default using which mechanism?',
            options: ['Call by reference', 'Call by value', 'Call by name', 'Call by pointer'],
            correctIndex: 1,
            explanation: 'C passes arguments by value (copy of data). To modify originals, pass pointers.',
          },
        ],
      },
      {
        id: 'c_mod_08',
        category: 'c',
        moduleNumber: 8,
        title: 'Arrays: 1D and Multi-Dimensional',
        summary: 'Contiguous memory allocation, indexing, traversal, and matrix operations.',
        level: 'Intermediate',
        content: `### Arrays
An array is a collection of elements of the same type placed in contiguous memory locations.`,
        starterCode: `#include <stdio.h>

int main() {
    int scores[] = {88, 92, 79, 95, 84};
    int n = sizeof(scores) / sizeof(scores[0]);
    int sum = 0;
    
    for (int i = 0; i < n; i++) {
        sum += scores[i];
    }
    
    printf("Average Score: %.2f\\n", (double)sum / n);
    return 0;
}`,
        exercisePrompt: 'Find the maximum and minimum elements in an array of 8 integers.',
        quizQuestions: [
          {
            question: 'What is the index of the first element in a C array?',
            options: ['1', '0', '-1', 'Undefined'],
            correctIndex: 1,
            explanation: 'Arrays in C are zero-indexed; the first element is at index 0.',
          },
        ],
      },
      {
        id: 'c_mod_09',
        category: 'c',
        moduleNumber: 9,
        title: 'Strings and Text Processing in C',
        summary: 'Null-terminated char arrays, strlen, strcpy, strcmp, strcat, and safe buffer handling.',
        level: 'Intermediate',
        content: `### Strings in C
In C, a string is a 1D array of characters terminated by the null character \`'\\0'\`.`,
        starterCode: `#include <stdio.h>
#include <string.h>

int main() {
    char school[] = "Shikkhora Academy";
    printf("Institution: %s\\n", school);
    printf("Length: %zu characters\\n", strlen(school));
    return 0;
}`,
        exercisePrompt: 'Write a function that reverses a string in-place without using library string functions.',
        quizQuestions: [
          {
            question: 'What special character marks the end of a string in C?',
            options: ['\\n', '\\t', '\\0', '\\r'],
            correctIndex: 2,
            explanation: 'The null terminator character \\0 (ASCII 0) defines string termination.',
          },
        ],
      },
      {
        id: 'c_mod_10',
        category: 'c',
        moduleNumber: 10,
        title: 'Pointers and Memory Addresses',
        summary: 'Address-of operator (&), dereference operator (*), pointer arithmetic, and pointers with functions.',
        level: 'Intermediate',
        content: `### The Power of Pointers
A pointer is a variable that stores the memory address of another variable.
- \`&x\`: Retrieves memory address of x.
- \`*ptr\`: Dereferences ptr to access or modify data at that address.`,
        starterCode: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10, y = 20;
    printf("Before swap: x=%d, y=%d\\n", x, y);
    swap(&x, &y);
    printf("After swap:  x=%d, y=%d\\n", x, y);
    return 0;
}`,
        exercisePrompt: 'Implement a function that computes the sum and average of an array using pointer traversal.',
        quizQuestions: [
          {
            question: 'What does the & operator return when applied to a variable?',
            options: ['The value', 'The memory address', 'The size in bytes', 'The pointer type'],
            correctIndex: 1,
            explanation: 'The & operator (address-of) evaluates to the memory address of the operand.',
          },
        ],
      },
      {
        id: 'c_mod_11',
        category: 'c',
        moduleNumber: 11,
        title: 'Structures, Unions, and Enumerations',
        summary: 'User-defined composite data types with struct, typedef, union memory sharing, and enum states.',
        level: 'Intermediate',
        content: `### Structs
Group heterogeneous data fields under a single composite type name.`,
        starterCode: `#include <stdio.h>

typedef struct {
    char name[50];
    int rollNumber;
    double gpa;
} Student;

int main() {
    Student s1 = {"Tamim Hasan", 101, 4.88};
    printf("Student: %s (Roll: %d) - GPA: %.2f\\n", s1.name, s1.rollNumber, s1.gpa);
    return 0;
}`,
        exercisePrompt: 'Define a struct for a Point(x, y) and write a function to calculate distance between two Points.',
        quizQuestions: [
          {
            question: 'What operator accesses members of a struct pointer?',
            options: ['.', '->', '::', ':'],
            correctIndex: 1,
            explanation: 'The arrow operator -> accesses struct members through a pointer.',
          },
        ],
      },
      {
        id: 'c_mod_12',
        category: 'c',
        moduleNumber: 12,
        title: 'Dynamic Memory Allocation (malloc, calloc, free)',
        summary: 'Heap vs stack memory, runtime sizing, realloc, avoiding memory leaks and dangling pointers.',
        level: 'Advanced',
        content: `### Dynamic Memory
- \`malloc(bytes)\`: Allocates uninitialized memory on heap.
- \`calloc(n, size)\`: Allocates zero-initialized memory.
- \`free(ptr)\`: Releases heap block back to OS.`,
        starterCode: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    int *arr = (int*)malloc(n * sizeof(int));
    if (arr == NULL) {
        printf("Memory allocation failed\\n");
        return 1;
    }
    for (int i = 0; i < n; i++) arr[i] = (i + 1) * 10;
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    free(arr);
    return 0;
}`,
        exercisePrompt: 'Dynamically allocate an array whose size is provided at runtime, fill it, and calculate variance.',
        quizQuestions: [
          {
            question: 'What occurs if dynamically allocated memory is never released with free()?',
            options: ['Stack overflow', 'Memory leak', 'Segmentation fault', 'Dangling reference'],
            correctIndex: 1,
            explanation: 'Failing to free heap memory leads to progressive memory leakage.',
          },
        ],
      },
    ];

    // 10. HTML & Web Development Course (19 Progressive Modules)
    const htmlModules: CodeModule[] = [
      {
        id: 'html_mod_01',
        category: 'html',
        moduleNumber: 1,
        title: 'Introduction to the World Wide Web & HTML',
        summary: 'How browsers request and render web pages, client-server architecture, and HTML history.',
        level: 'Beginner',
        content: `### What is HTML?
HyperText Markup Language (HTML) is the standard markup language used to structure web documents. Tim Berners-Lee invented HTML at CERN in 1989.`,
        starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shikkhora Web Lab</title>
</head>
<body>
  <h1>Welcome to Web Development!</h1>
  <p>Learn Better. Grow Further with Shikkhora.</p>
</body>
</html>`,
        exercisePrompt: 'Add your own biography paragraph and a subtitle with an h2 tag.',
        quizQuestions: [
          {
            question: 'What does HTML stand for?',
            options: [
              'HyperText Markup Language',
              'High Tech Modern Language',
              'Hyperlink Text Model Layout',
              'Home Tool Markup Language',
            ],
            correctIndex: 0,
            explanation: 'HTML stands for HyperText Markup Language.',
          },
        ],
      },
      {
        id: 'html_mod_02',
        category: 'html',
        moduleNumber: 2,
        title: 'Headings, Paragraphs, and Text Formatting',
        summary: 'Hierarchy with h1-h6, p tags, strong, em, mark, sub, sup, and blockquotes.',
        level: 'Beginner',
        content: `### Typographic Hierarchy
Use \`<h1>\` through \`<h6>\` to signal conceptual hierarchy, not merely font size. Use \`<p>\` for content prose.`,
        starterCode: `<h1>Bangladeshi Innovations in Education</h1>
<h2>Empowering Youth through Technology</h2>
<p>Shikkhora brings <strong>world-class pedagogy</strong> directly to students across all 64 districts.</p>
<blockquote>"Education is the most powerful weapon which you can use to change the world."</blockquote>`,
        exercisePrompt: 'Create a scientific article snippet displaying the chemical equation for photosynthesis and the Pythagorean theorem with sub and sup tags.',
        quizQuestions: [
          {
            question: 'Which tag represents the highest level heading in HTML?',
            options: ['<h6>', '<head>', '<h1>', '<header>'],
            correctIndex: 2,
            explanation: '<h1> is the primary top-level heading.',
          },
        ],
      },
      {
        id: 'html_mod_03',
        category: 'html',
        moduleNumber: 3,
        title: 'Hyperlinks, Anchor Tags, and Navigation',
        summary: 'The href attribute, internal anchors, target="_blank", rel="noopener noreferrer", and mailto links.',
        level: 'Beginner',
        content: `### Hyperlinks
The \`<a>\` element creates hyperlinks connecting web pages across the world.
- \`href\`: Destination URL or hash target.`,
        starterCode: `<nav>
  <a href="#about">About</a> |
  <a href="#curriculum">Curriculum</a> |
  <a href="https://nctb.gov.bd" target="_blank" rel="noopener">NCTB Official</a>
</nav>

<section id="about" style="margin-top: 20px;">
  <h2>About Shikkhora</h2>
  <p>Dedicated to excellence in Bangladeshi secondary education.</p>
</section>`,
        exercisePrompt: 'Create a table of contents that jumps smoothly to three different sections on the page using id attributes.',
        quizQuestions: [
          {
            question: 'Which attribute specifies the destination URL of a link?',
            options: ['src', 'href', 'link', 'dest'],
            correctIndex: 1,
            explanation: 'The href (hypertext reference) attribute specifies the destination address.',
          },
        ],
      },
      {
        id: 'html_mod_04',
        category: 'html',
        moduleNumber: 4,
        title: 'Images, Figures, and Modern Responsive Media',
        summary: 'The img element, alt text accessibility, srcset, figure, and figcaption.',
        level: 'Beginner',
        content: `### Images and Accessibility
Always provide descriptive \`alt\` text so screen readers can narrate visual content to visually impaired students.`,
        starterCode: `<figure style="text-align: center; font-family: sans-serif;">
  <img 
    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop" 
    alt="Students collaborating in a modern physics classroom"
    style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
  />
  <figcaption style="margin-top: 8px; color: #64748b; font-size: 14px;">
    Figure 1: Inquiry-based active learning in science.
  </figcaption>
</figure>`,
        exercisePrompt: 'Render an image with fallback styling and an informative figcaption describing an NCTB textbook topic.',
        quizQuestions: [
          {
            question: 'Why is the alt attribute mandatory for accessible images?',
            options: ['It changes the image color', 'Screen readers read it for visually impaired users', 'It increases download speed', 'It is required by CSS'],
            correctIndex: 1,
            explanation: 'Screen readers use alt text to describe images, and it displays if the image file fails to load.',
          },
        ],
      },
      {
        id: 'html_mod_05',
        category: 'html',
        moduleNumber: 5,
        title: 'Lists and Hierarchical Outlines',
        summary: 'Ordered lists (ol), unordered lists (ul), definition lists (dl, dt, dd), and nested structures.',
        level: 'Beginner',
        content: `### Structuring Lists
- \`<ul>\`: Unordered bulleted list.
- \`<ol>\`: Ordered sequence.
- \`<dl>\`: Key-value glossary.`,
        starterCode: `<h3>NCTB Class 9 Science Subjects</h3>
<ul>
  <li>Physics
    <ol>
      <li>Physical Quantities and Measurement</li>
      <li>Motion</li>
      <li>Force</li>
    </ol>
  </li>
  <li>Chemistry</li>
  <li>Biology</li>
</ul>`,
        exercisePrompt: 'Build a definition list (dl) explaining 4 fundamental physics quantities and their units.',
        quizQuestions: [
          {
            question: 'Which tag pair defines a glossary definition description?',
            options: ['<dt>', '<dd>', '<dl>', '<li>'],
            correctIndex: 1,
            explanation: '<dd> (definition description) follows <dt> (definition term) within a <dl> (description list).',
          },
        ],
      },
      {
        id: 'html_mod_06',
        category: 'html',
        moduleNumber: 6,
        title: 'Data Tables and Tabular Information',
        summary: 'Table, thead, tbody, tr, th, td, scope, colspan, and rowspan attributes.',
        level: 'Intermediate',
        content: `### Tables
Organize tabular data clearly with semantic header and body sections.`,
        starterCode: `<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
  <thead style="background: #0f172a; color: white;">
    <tr>
      <th>Subject</th>
      <th>Chapter</th>
      <th>Quiz Marks</th>
      <th>Exam Marks</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Physics</td>
      <td>Physical Quantities</td>
      <td align="center">20</td>
      <td align="center">100</td>
    </tr>
    <tr>
      <td>Chemistry</td>
      <td>Atomic Structure</td>
      <td align="center">20</td>
      <td align="center">100</td>
    </tr>
  </tbody>
</table>`,
        exercisePrompt: 'Create a weekly study schedule table using colspan and rowspan for multiple period blocks.',
        quizQuestions: [
          {
            question: 'Which element indicates a table header cell?',
            options: ['<td>', '<th>', '<tr>', '<thead_cell>'],
            correctIndex: 1,
            explanation: '<th> defines a header cell with default bold text and centered alignment.',
          },
        ],
      },
      {
        id: 'html_mod_07',
        category: 'html',
        moduleNumber: 7,
        title: 'Forms, Inputs, and User Interaction',
        summary: 'Form element, input types (text, email, password, number, radio, checkbox), labels, select, textarea, and submit.',
        level: 'Intermediate',
        content: `### Forms
HTML forms collect input from users and send it to server endpoints for processing.`,
        starterCode: `<form style="font-family: sans-serif; max-width: 400px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <h3 style="margin-top:0;">Student Feedback</h3>
  
  <label for="name" style="display:block; margin-bottom: 4px; font-weight: 500;">Your Name:</label>
  <input type="text" id="name" name="name" placeholder="Afnan Chowdhury" required style="width: 100%; padding: 8px; margin-bottom: 12px; box-sizing: border-box;" />
  
  <label for="rating" style="display:block; margin-bottom: 4px; font-weight: 500;">Lesson Rating:</label>
  <select id="rating" name="rating" style="width: 100%; padding: 8px; margin-bottom: 12px;">
    <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
    <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
    <option value="3">⭐⭐⭐ 3 - Good</option>
  </select>
  
  <button type="submit" style="background: #0284c7; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">Submit Feedback</button>
</form>`,
        exercisePrompt: 'Construct a complete student quiz answer submission form with radio button MCQ choices.',
        quizQuestions: [
          {
            question: 'Why should every input have an associated <label>?',
            options: ['It styles the background', 'It enhances accessibility and expands touch target click area', 'It speeds up page load', 'It prevents browser caching'],
            correctIndex: 1,
            explanation: 'Labels improve accessibility for screen readers and make clicking the text focus the input.',
          },
        ],
      },
    ];

    // 11. Initial Student Progress for Demo
    const demoProgress: StudentProgress = {
      studentId: 'student_1',
      completedLessonIds: ['lesson_c9_phy_1_1', 'lesson_c9_phy_1_2', 'lesson_c9_phy_1_3'],
      quizScores: {
        quiz_c9_phy_chap1: 18,
      },
      examIds: ['exam_c9_phy_chap1'],
      cCompletedModules: ['c_mod_01', 'c_mod_02'],
      htmlCompletedModules: ['html_mod_01'],
      totalStudyMinutes: 245,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    // 12. Study Sessions across 5 days (for real 5-day progress reports)
    const today = new Date();
    const studySessions: StudySessionLog[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      studySessions.push(
        {
          id: `sess_${i}_1`,
          studentId: 'student_1',
          date: dateStr,
          minutes: 45 + (i * 12) % 30,
          activityType: 'lesson',
          details: 'Studied Physics Chapter 1 SI units and measurement concepts.',
        },
        {
          id: `sess_${i}_2`,
          studentId: 'student_1',
          date: dateStr,
          minutes: 20 + (i * 8) % 25,
          activityType: 'c_code',
          details: 'Solved C programming variables and arithmetic expressions exercises.',
        }
      );
    }

    // 13. System Settings
    const settings: SystemSettings = {
      allowStudentRegistration: true,
      requireEmailVerification: true,
      enableAiTutor: true,
      enableAiExamGrading: true,
      adminDesignatedEmail: DESIGNATED_MAIN_ADMIN_EMAIL,
      examResultTargetHours: 48,
      allowPdfDownloads: true,
    };

    return {
      users: [adminUser, demoStudent, demoParent],
      verificationCodes: [],
      books,
      chapters,
      lessons,
      quizzes: [chapter1Quiz],
      quizSubmissions: [
        {
          id: 'sub_quiz_1',
          quizId: 'quiz_c9_phy_chap1',
          chapterId: 'chap_c9_phy_01',
          studentId: 'student_1',
          studentName: 'Afnan Chowdhury',
          answers: {
            q1: 'Electric Current',
            q2: 'M L^-1 T^-2',
            q3: '4.330 cm',
            q4: '0.01 mm',
            q5: 'In positive error vernier zero is to right; in negative error to left.',
            q6: 'All additive terms simplify to dimension of length [L].',
          },
          score: 18,
          totalMarks: 20,
          passed: true,
          submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
      ],
      exams: [chapter1Exam],
      examSubmissions: [
        {
          id: 'exam_sub_1',
          examId: 'exam_c9_phy_chap1',
          chapterId: 'chap_c9_phy_01',
          bookId: 'book_c9_physics',
          studentId: 'student_1',
          studentName: 'Afnan Chowdhury',
          studentEmail: 'student@shikkhora.edu.bd',
          answers: {
            eq1: 'The SI system unifies measurements globally. The kilogram is defined via the Planck constant h = 6.62607015 x 10^-34 J.s, and the second is defined by the cesium-133 hyperfine transition frequency.',
            eq2: 'Vernier constant VC = s/n where s is smallest main division (1mm) and n is 20 divisions, yielding 0.05mm.',
            eq3: '(a) VC = 0.005 cm, (b) Zero error = +0.01 cm, (c) Corrected diameter = 3.225 cm, (d) Volume = ~69.75 cm^3.',
            eq4: 'Dimensional balance yields T = k * sqrt(l/g). Pure constants like 2*pi have no dimension so cannot be determined by dimensions.',
            eq5: 'Use layered stacking (measure 10 sheets together with micrometer screw gauge), calibrate zero error, repeat across 5 samples to compute standard deviation.',
          },
          startedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          submittedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
          status: 'PENDING_ADMIN_REVIEW',
          targetPublicationTime: new Date(Date.now() + 26 * 3600000).toISOString(),
          aiEvaluation: {
            totalScore: 92,
            sectionScores: {
              'A: Knowledge & Understanding': 28,
              'B: Conceptual & Problem Solving': 42,
              'C: Creative & Inquiry Application': 22,
            },
            feedbackByQuestion: {
              eq1: { marksAwarded: 14, maxMarks: 15, feedback: 'Accurate SI definitions; mentioned Planck constant and cesium transition.' },
              eq2: { marksAwarded: 14, maxMarks: 15, feedback: 'Derivation is clear.' },
              eq3: { marksAwarded: 24, maxMarks: 25, feedback: 'Calculations for volume and zero error are correct.' },
              eq4: { marksAwarded: 18, maxMarks: 20, feedback: 'Correct dimensional powers.' },
              eq5: { marksAwarded: 22, maxMarks: 25, feedback: 'Layered sheet method is scientifically rigorous.' },
            },
            overallFeedback: 'High level of conceptual mastery and inquiry methodology shown. Ready for Main Admin publication approval.',
            flaggedForReview: false,
            evaluatedAt: new Date(Date.now() - 21 * 3600000).toISOString(),
          },
        },
      ],
      codeModules: [...cModules, ...htmlModules],
      progress: [demoProgress],
      studySessions,
      aiConversations: [],
      auditLogs: [
        {
          id: 'log_init',
          adminEmail: DESIGNATED_MAIN_ADMIN_EMAIL,
          action: 'SYSTEM_BOOTSTRAP',
          targetType: 'settings',
          targetId: 'system',
          details: 'Shikkhora educational platform initialized with NCTB curriculum and designated admin.',
          timestamp: new Date().toISOString(),
        },
      ],
      userEmailStorages: [],
      settings,
    };
  }
}

export const db = new DatabaseManager();
