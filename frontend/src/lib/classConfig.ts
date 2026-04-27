// ─── Central class & subject configuration ───
// Each class has its own set of subjects which varies by grade level.
// All gradient colors use semantic design tokens from token.scss

export interface SubjectConfig {
  name: string
  icon: string       // emoji icon
  color: string       // tailwind gradient for card accent
  teacher: string     // placeholder teacher name
  topics: string[]    // sample topic tags
}

export interface ClassConfig {
  subjects: SubjectConfig[]
  board: string
}

const CLASS_CONFIG: Record<number, ClassConfig> = {
  1: { board: 'KSEEB', subjects: [
    { name: 'English',     icon: '📖', color: 'from-info-500 to-info-600',         teacher: 'Meera Reddy',     topics: ['Grammar', 'Reading', 'Writing'] },
    { name: 'Kannada',     icon: '🏛️', color: 'from-accent-500 to-accent-600',     teacher: 'Kavitha N',       topics: ['ಕನ್ನಡ', 'ವ್ಯಾಕರಣ'] },
    { name: 'Mathematics', icon: '🔢', color: 'from-success-500 to-success-600',   teacher: 'Suresh Kumar',    topics: ['Numbers', 'Shapes', 'Measurement'] },
    { name: 'EVS',         icon: '🌿', color: 'from-secondary-500 to-secondary-600', teacher: 'Lakshmi Devi', topics: ['Plants', 'Animals', 'Environment'] },
  ]},
  2: { board: 'KSEEB', subjects: [
    { name: 'English',     icon: '📖', color: 'from-info-500 to-info-600',         teacher: 'Meera Reddy',     topics: ['Grammar', 'Reading', 'Writing'] },
    { name: 'Kannada',     icon: '🏛️', color: 'from-accent-500 to-accent-600',     teacher: 'Kavitha N',       topics: ['ಕನ್ನಡ', 'ವ್ಯಾಕರಣ'] },
    { name: 'Mathematics', icon: '🔢', color: 'from-success-500 to-success-600',   teacher: 'Suresh Kumar',    topics: ['Numbers', 'Addition', 'Subtraction'] },
    { name: 'EVS',         icon: '🌿', color: 'from-secondary-500 to-secondary-600', teacher: 'Lakshmi Devi', topics: ['Plants', 'Water', 'Family'] },
  ]},
  3: { board: 'KSEEB', subjects: [
    { name: 'English',     icon: '📖', color: 'from-info-500 to-info-600',         teacher: 'Meera Reddy',     topics: ['Grammar', 'Comprehension', 'Writing'] },
    { name: 'Kannada',     icon: '🏛️', color: 'from-accent-500 to-accent-600',     teacher: 'Kavitha N',       topics: ['ಕನ್ನಡ', 'ವ್ಯಾಕರಣ'] },
    { name: 'Hindi',       icon: '📝', color: 'from-orange-500 to-danger-500',     teacher: 'Anita Gupta',     topics: ['व्याकरण', 'पठन'] },
    { name: 'Mathematics', icon: '🔢', color: 'from-success-500 to-success-600',   teacher: 'Suresh Kumar',    topics: ['Multiplication', 'Fractions', 'Geometry'] },
    { name: 'EVS',         icon: '🌿', color: 'from-secondary-500 to-secondary-600', teacher: 'Lakshmi Devi', topics: ['Shelter', 'Food', 'Weather'] },
  ]},
  4: { board: 'KSEEB', subjects: [
    { name: 'English',     icon: '📖', color: 'from-info-500 to-info-600',         teacher: 'Meera Reddy',     topics: ['Grammar', 'Essay', 'Poetry'] },
    { name: 'Kannada',     icon: '🏛️', color: 'from-accent-500 to-accent-600',     teacher: 'Kavitha N',       topics: ['ಪದ್ಯ', 'ಗದ್ಯ'] },
    { name: 'Hindi',       icon: '📝', color: 'from-orange-500 to-danger-500',     teacher: 'Anita Gupta',     topics: ['कहानी', 'कविता'] },
    { name: 'Mathematics', icon: '🔢', color: 'from-success-500 to-success-600',   teacher: 'Suresh Kumar',    topics: ['Fractions', 'Decimals', 'Patterns'] },
    { name: 'EVS',         icon: '🌿', color: 'from-secondary-500 to-secondary-600', teacher: 'Lakshmi Devi', topics: ['Soil', 'Maps', 'Transport'] },
  ]},
  5: { board: 'KSEEB', subjects: [
    { name: 'English',     icon: '📖', color: 'from-info-500 to-info-600',         teacher: 'Meera Reddy',     topics: ['Grammar', 'Essay', 'Comprehension'] },
    { name: 'Kannada',     icon: '🏛️', color: 'from-accent-500 to-accent-600',     teacher: 'Kavitha N',       topics: ['ಪದ್ಯ', 'ಗದ್ಯ', 'ಪತ್ರ'] },
    { name: 'Hindi',       icon: '📝', color: 'from-orange-500 to-danger-500',     teacher: 'Anita Gupta',     topics: ['निबंध', 'पत्र'] },
    { name: 'Mathematics', icon: '🔢', color: 'from-success-500 to-success-600',   teacher: 'Suresh Kumar',    topics: ['Percentage', 'Area', 'Volume'] },
    { name: 'EVS',         icon: '🌿', color: 'from-secondary-500 to-secondary-600', teacher: 'Lakshmi Devi', topics: ['Ecosystems', 'Energy', 'Health'] },
  ]},
  6: { board: 'KSEEB', subjects: [
    { name: 'English',        icon: '📖', color: 'from-info-500 to-info-600',       teacher: 'Meera Reddy',     topics: ['Prose', 'Poetry', 'Grammar'] },
    { name: 'Kannada',        icon: '🏛️', color: 'from-accent-500 to-accent-600',   teacher: 'Kavitha N',       topics: ['ಗದ್ಯ', 'ಪದ್ಯ'] },
    { name: 'Hindi',          icon: '📝', color: 'from-orange-500 to-danger-500',   teacher: 'Anita Gupta',     topics: ['गद्य', 'पद्य'] },
    { name: 'Mathematics',    icon: '🔢', color: 'from-success-500 to-success-600', teacher: 'Suresh Kumar',    topics: ['Integers', 'Algebra', 'Geometry'] },
    { name: 'Science',        icon: '🔬', color: 'from-purple-500 to-purple-600',   teacher: 'Deepa Rao',       topics: ['Physics', 'Chemistry', 'Biology'] },
    { name: 'Social Science', icon: '🌍', color: 'from-indigo-500 to-indigo-600',   teacher: 'Ramesh Kumar',    topics: ['History', 'Geography', 'Civics'] },
  ]},
  7: { board: 'KSEEB', subjects: [
    { name: 'English',        icon: '📖', color: 'from-info-500 to-info-600',       teacher: 'Meera Reddy',     topics: ['Prose', 'Poetry', 'Grammar'] },
    { name: 'Kannada',        icon: '🏛️', color: 'from-accent-500 to-accent-600',   teacher: 'Kavitha N',       topics: ['ಗದ್ಯ', 'ಪದ್ಯ'] },
    { name: 'Hindi',          icon: '📝', color: 'from-orange-500 to-danger-500',   teacher: 'Anita Gupta',     topics: ['गद्य', 'पद्य'] },
    { name: 'Mathematics',    icon: '🔢', color: 'from-success-500 to-success-600', teacher: 'Suresh Kumar',    topics: ['Ratios', 'Triangles', 'Data'] },
    { name: 'Science',        icon: '🔬', color: 'from-purple-500 to-purple-600',   teacher: 'Deepa Rao',       topics: ['Physics', 'Chemistry', 'Biology'] },
    { name: 'Social Science', icon: '🌍', color: 'from-indigo-500 to-indigo-600',   teacher: 'Ramesh Kumar',    topics: ['History', 'Geography', 'Civics'] },
  ]},
  8: { board: 'KSEEB', subjects: [
    { name: 'English',        icon: '📖', color: 'from-info-500 to-info-600',       teacher: 'Meera Reddy',     topics: ['Prose', 'Poetry', 'Grammar'] },
    { name: 'Kannada',        icon: '🏛️', color: 'from-accent-500 to-accent-600',   teacher: 'Kavitha N',       topics: ['ಗದ್ಯ', 'ಪದ್ಯ', 'ವ್ಯಾಕರಣ'] },
    { name: 'Hindi',          icon: '📝', color: 'from-orange-500 to-danger-500',   teacher: 'Anita Gupta',     topics: ['गद्य', 'पद्य', 'व्याकरण'] },
    { name: 'Mathematics',    icon: '🔢', color: 'from-success-500 to-success-600', teacher: 'Suresh Kumar',    topics: ['Linear Eq', 'Quadrilaterals', 'Mensuration'] },
    { name: 'Science',        icon: '🔬', color: 'from-purple-500 to-purple-600',   teacher: 'Deepa Rao',       topics: ['Physics', 'Chemistry', 'Biology'] },
    { name: 'Social Science', icon: '🌍', color: 'from-indigo-500 to-indigo-600',   teacher: 'Ramesh Kumar',    topics: ['History', 'Geography', 'Civics'] },
    { name: 'Computer Science', icon: '💻', color: 'from-cyan-500 to-cyan-600',     teacher: 'Priya Sharma',    topics: ['HTML', 'Basics', 'Scratch'] },
  ]},
  9: { board: 'KSEEB', subjects: [
    { name: 'English',        icon: '📖', color: 'from-info-500 to-info-600',       teacher: 'Meera Reddy',     topics: ['Prose', 'Poetry', 'Grammar'] },
    { name: 'Kannada',        icon: '🏛️', color: 'from-accent-500 to-accent-600',   teacher: 'Kavitha N',       topics: ['ಗದ್ಯ', 'ಪದ್ಯ', 'ವ್ಯಾಕರಣ'] },
    { name: 'Hindi',          icon: '📝', color: 'from-orange-500 to-danger-500',   teacher: 'Anita Gupta',     topics: ['गद्य', 'पद्य', 'व्याकरण'] },
    { name: 'Mathematics',    icon: '🔢', color: 'from-success-500 to-success-600', teacher: 'Suresh Kumar',    topics: ['Number Systems', 'Polynomials', 'Geometry'] },
    { name: 'Science',        icon: '🔬', color: 'from-purple-500 to-purple-600',   teacher: 'Deepa Rao',       topics: ['Physics', 'Chemistry', 'Biology'] },
    { name: 'Social Science', icon: '🌍', color: 'from-indigo-500 to-indigo-600',   teacher: 'Ramesh Kumar',    topics: ['History', 'Geography', 'Economics'] },
    { name: 'Computer Science', icon: '💻', color: 'from-cyan-500 to-cyan-600',     teacher: 'Priya Sharma',    topics: ['Python', 'Networking', 'Database'] },
    { name: 'Physical Education', icon: '⚽', color: 'from-rose-500 to-pink-600',   teacher: 'Vikram Singh',    topics: ['Sports', 'Health', 'Fitness'] },
  ]},
  10: { board: 'KSEEB', subjects: [
    { name: 'English',        icon: '📖', color: 'from-info-500 to-info-600',       teacher: 'Meera Reddy',     topics: ['Prose', 'Poetry', 'Grammar'] },
    { name: 'Kannada',        icon: '🏛️', color: 'from-accent-500 to-accent-600',   teacher: 'Kavitha N',       topics: ['ಗದ್ಯ', 'ಪದ್ಯ', 'ವ್ಯಾಕರಣ'] },
    { name: 'Hindi',          icon: '📝', color: 'from-orange-500 to-danger-500',   teacher: 'Anita Gupta',     topics: ['गद्य', 'पद्य', 'व्याकरण'] },
    { name: 'Mathematics',    icon: '🔢', color: 'from-success-500 to-success-600', teacher: 'Suresh Kumar',    topics: ['Real Numbers', 'Polynomials', 'Trigonometry'] },
    { name: 'Science',        icon: '🔬', color: 'from-purple-500 to-purple-600',   teacher: 'Deepa Rao',       topics: ['Physics', 'Chemistry', 'Biology'] },
    { name: 'Social Science', icon: '🌍', color: 'from-indigo-500 to-indigo-600',   teacher: 'Ramesh Kumar',    topics: ['History', 'Geography', 'Economics'] },
    { name: 'Computer Science', icon: '💻', color: 'from-cyan-500 to-cyan-600',     teacher: 'Priya Sharma',    topics: ['Python', 'AI Basics', 'Cybersecurity'] },
    { name: 'Physical Education', icon: '⚽', color: 'from-rose-500 to-pink-600',   teacher: 'Vikram Singh',    topics: ['Sports', 'Health', 'Yoga'] },
  ]},
}

// Mock chapters that appear after "textbook extraction"
export const MOCK_EXTRACTED_CHAPTERS: Record<string, { title: string; pages: number }[]> = {
  english: [
    { title: 'The Fun They Had', pages: 12 },
    { title: 'The Sound of Music', pages: 8 },
    { title: 'The Little Girl', pages: 10 },
    { title: 'A Truly Beautiful Mind', pages: 14 },
    { title: 'The Snake and the Mirror', pages: 9 },
    { title: 'My Childhood', pages: 11 },
    { title: 'Packing', pages: 7 },
    { title: 'Reach for the Top', pages: 13 },
    { title: 'The Bond of Love', pages: 10 },
    { title: 'Kathmandu', pages: 8 },
  ],
  kannada: [
    { title: 'ನಾನು ಕಂಡ ಭಾರತ', pages: 10 },
    { title: 'ಸಂಕಲ್ಪ ಗೀತೆ', pages: 8 },
    { title: 'ಬೆಳಕಿನ ಹಾಡು', pages: 12 },
    { title: 'ಶಿಕ್ಷಣ ಮತ್ತು ಸಮಾಜ', pages: 14 },
    { title: 'ನಮ್ಮ ದೇಶ', pages: 9 },
    { title: 'ಪರಿಸರ ಪ್ರೀತಿ', pages: 11 },
    { title: 'ಸ್ನೇಹ', pages: 7 },
    { title: 'ವಿಜ್ಞಾನ ಜಗತ್ತು', pages: 10 },
  ],
  hindi: [
    { title: 'दो बैलों की कथा', pages: 14 },
    { title: 'ल्हासा की ओर', pages: 10 },
    { title: 'उपभोक्तावाद की संस्कृति', pages: 8 },
    { title: 'साँवले सपनों की याद', pages: 12 },
    { title: 'नाना साहब की पुत्री', pages: 9 },
    { title: 'प्रेमचंद के फटे जूते', pages: 11 },
    { title: 'मेरे बचपन के दिन', pages: 13 },
    { title: 'एक कुत्ता और एक मैना', pages: 7 },
  ],
  mathematics: [
    { title: 'Number Systems', pages: 18 },
    { title: 'Polynomials', pages: 14 },
    { title: 'Coordinate Geometry', pages: 12 },
    { title: 'Linear Equations in Two Variables', pages: 16 },
    { title: 'Introduction to Euclid\'s Geometry', pages: 10 },
    { title: 'Lines and Angles', pages: 14 },
    { title: 'Triangles', pages: 16 },
    { title: 'Quadrilaterals', pages: 12 },
    { title: 'Circles', pages: 14 },
    { title: 'Constructions', pages: 8 },
    { title: 'Heron\'s Formula', pages: 10 },
    { title: 'Surface Areas and Volumes', pages: 18 },
    { title: 'Statistics', pages: 14 },
    { title: 'Probability', pages: 10 },
  ],
  science: [
    { title: 'Matter in Our Surroundings', pages: 16 },
    { title: 'Is Matter Around Us Pure', pages: 14 },
    { title: 'Atoms and Molecules', pages: 18 },
    { title: 'Structure of the Atom', pages: 14 },
    { title: 'The Fundamental Unit of Life', pages: 16 },
    { title: 'Tissues', pages: 12 },
    { title: 'Motion', pages: 18 },
    { title: 'Force and Laws of Motion', pages: 16 },
    { title: 'Gravitation', pages: 14 },
    { title: 'Work and Energy', pages: 16 },
    { title: 'Sound', pages: 12 },
    { title: 'Improvement in Food Resources', pages: 14 },
  ],
  'social-science': [
    { title: 'The French Revolution', pages: 18 },
    { title: 'Socialism in Europe', pages: 14 },
    { title: 'Nazism and the Rise of Hitler', pages: 16 },
    { title: 'India — Size and Location', pages: 10 },
    { title: 'Physical Features of India', pages: 14 },
    { title: 'Drainage', pages: 12 },
    { title: 'Democracy in the Contemporary World', pages: 14 },
    { title: 'Constitutional Design', pages: 16 },
    { title: 'The Story of Village Palampur', pages: 12 },
    { title: 'People as Resource', pages: 10 },
  ],
  'computer-science': [
    { title: 'Introduction to Computers', pages: 12 },
    { title: 'Computer Hardware', pages: 10 },
    { title: 'Operating Systems', pages: 14 },
    { title: 'Introduction to Python', pages: 16 },
    { title: 'Data Types and Variables', pages: 12 },
    { title: 'Control Structures', pages: 14 },
    { title: 'Functions in Python', pages: 10 },
    { title: 'Networking Basics', pages: 12 },
  ],
  evs: [
    { title: 'Our Environment', pages: 10 },
    { title: 'Living and Non-Living Things', pages: 8 },
    { title: 'Plants Around Us', pages: 12 },
    { title: 'Animals and Their Habitats', pages: 10 },
    { title: 'Water — Our Lifeline', pages: 8 },
    { title: 'Air and Weather', pages: 10 },
    { title: 'Food and Health', pages: 12 },
    { title: 'Shelter and Clothing', pages: 8 },
  ],
  'physical-education': [
    { title: 'Physical Fitness', pages: 10 },
    { title: 'Sports and Games', pages: 12 },
    { title: 'Yoga and Health', pages: 8 },
    { title: 'First Aid', pages: 6 },
    { title: 'Nutrition and Diet', pages: 10 },
  ],
}

export function getClassConfig(classId: number): ClassConfig {
  return CLASS_CONFIG[classId] || CLASS_CONFIG[1]
}

export function getSubjectSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export function getSubjectChapters(subjectSlug: string): { title: string; pages: number }[] {
  return MOCK_EXTRACTED_CHAPTERS[subjectSlug] || MOCK_EXTRACTED_CHAPTERS.english
}

export default CLASS_CONFIG
