/**
 * ─── BUILT-IN NLP ENGINE ─────────────────────────────────────────────────────
 * Port of the Python resume-nlp-service directly into Node.js.
 * This eliminates the need for a separate Python microservice.
 * 
 * Modules ported:
 *   - parser.py       → extractText()        (PDF via pdf-parse, DOCX via mammoth)
 *   - skills.py       → extractSkills()       (keyword matching against 40+ skills)
 *   - nlp_engine.py   → extractExperience()   (keyword-based experience detection)
 *                     → extractEducation()    (keyword-based education detection)
 *   - job_matcher.py  → getRecommendedJobs()  (skill-to-role scoring)
 *   - scorer.py       → calculateResumeScore()(weighted 100-point scoring)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');

// ─── TEXT EXTRACTION (replaces parser.py) ────────────────────────────────────

/**
 * Extract text from a PDF or DOCX file buffer.
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimetype - MIME type of the file
 * @param {string} originalname - Original filename
 * @returns {Promise<string>} Extracted text
 */
async function extractText(filePath, mimetype, originalname) {
  const filenameLower = (originalname || '').toLowerCase();

  try {
    if (mimetype === 'application/pdf' || filenameLower.endsWith('.pdf')) {
      // PDF extraction via pdf-parse
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return (pdfData.text || '').trim();

    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filenameLower.endsWith('.docx')
    ) {
      // DOCX extraction via mammoth
      const mammoth = require('mammoth');
      const dataBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return (result.value || '').trim();

    } else {
      // Fallback: try to read as UTF-8 text
      return fs.readFileSync(filePath, 'utf8').trim();
    }
  } catch (err) {
    throw new Error(`Failed to parse document: ${err.message}`);
  }
}

// ─── SKILL EXTRACTION (replaces skills.py) ───────────────────────────────────

const PREDEFINED_SKILLS = [
  'python', 'java', 'react', 'node.js', 'mongodb', 'machine learning', 'sql',
  'javascript', 'typescript', 'express', 'aws', 'docker', 'kubernetes',
  'flutter', 'react native', 'ui/ux', 'figma', 'framer', 'next.js', 'vue',
  'angular', 'c++', 'data science', 'devops', 'firebase', 'redux', 'tailwind',
  'bootstrap', 'html', 'css', 'c#', '.net', 'go', 'rust', 'php', 'ruby',
  'scikit-learn', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'fastapi', 'django'
];

/**
 * Match skills using keyword matching against the predefined database.
 * @param {string} text - Raw resume text
 * @returns {string[]} List of detected skills
 */
function extractSkills(text) {
  const textLower = text.toLowerCase();
  const detectedSkills = new Set();

  for (const skill of PREDEFINED_SKILLS) {
    if (textLower.includes(skill)) {
      detectedSkills.add(skill);
    }
  }

  return Array.from(detectedSkills);
}

// ─── EXPERIENCE DETECTION (replaces nlp_engine.py → extract_experience) ──────

/**
 * Detect experience level from resume text via keyword matching.
 * @param {string} text - Raw resume text
 * @returns {string} "Fresher" | "Intermediate" | "Experienced"
 */
function extractExperience(text) {
  const textLower = text.toLowerCase();

  const fresherKeywords = ['intern', 'fresher', 'entry level', 'student', 'graduate'];
  const intermediateKeywords = ['2 years', '3 years', '4 years', 'intermediate'];
  const experiencedKeywords = ['5 years', '6 years', '7 years', 'senior', 'lead', 'manager', 'architect'];

  // Check experienced first (higher priority)
  if (experiencedKeywords.some(w => textLower.includes(w))) {
    return 'Experienced';
  }
  if (intermediateKeywords.some(w => textLower.includes(w))) {
    return 'Intermediate';
  }
  if (fresherKeywords.some(w => textLower.includes(w))) {
    return 'Fresher';
  }

  // Default fallback
  return 'Fresher';
}

// ─── EDUCATION DETECTION (replaces nlp_engine.py → extract_education) ────────

/**
 * Detect education level from resume text via keyword matching.
 * @param {string} text - Raw resume text
 * @returns {string} Education level description
 */
function extractEducation(text) {
  const textLower = text.toLowerCase();

  // Order matters: highest first
  const postgrad = ['m.tech', 'mba', 'master', 'm.sc', 'mca'];
  const undergrad = ['b.tech', 'b.e', 'b.sc', 'bca', 'bachelor', 'degree'];

  if (postgrad.some(w => textLower.includes(w))) {
    return 'Postgraduate (M.Tech / MBA / Masters)';
  }
  if (undergrad.some(w => textLower.includes(w))) {
    return 'Undergraduate (B.Tech / B.Sc / Bachelors)';
  }
  if (textLower.includes('diploma')) {
    return 'Diploma';
  }

  return 'Not Specified';
}

// ─── JOB RECOMMENDATION ENGINE (replaces job_matcher.py) ─────────────────────

const JOB_SKILL_MAP = {
  'Frontend Developer': ['react', 'javascript', 'typescript', 'html', 'css', 'vue', 'angular', 'tailwind', 'figma'],
  'Backend Developer':  ['python', 'node.js', 'java', 'sql', 'mongodb', 'express', 'go', 'php'],
  'Data Scientist':     ['machine learning', 'data science', 'python', 'sql', 'scikit-learn', 'pandas', 'tensorflow'],
  'Data Analyst':       ['machine learning', 'data science', 'python', 'sql', 'scikit-learn', 'pandas', 'tensorflow'],
  'DevOps Engineer':    ['aws', 'docker', 'kubernetes', 'devops', 'python', 'go'],
  'Mobile App Developer': ['flutter', 'react native', 'java', 'swift', 'kotlin'],
};

// Multipliers for partial match (e.g. frontend skills partially count toward fullstack)
const CROSS_ROLE_BOOST = {
  'Fullstack Developer': { from: ['Frontend Developer', 'Backend Developer'], weight: 0.5 },
};

/**
 * Map detected skills to recommended job roles. Returns top 3.
 * @param {string[]} skills - Detected skills list
 * @returns {string[]} Top 3 recommended job roles
 */
function getRecommendedJobs(skills) {
  const jobScores = {
    'Frontend Developer': 0,
    'Backend Developer': 0,
    'Fullstack Developer': 0,
    'Data Scientist': 0,
    'Data Analyst': 0,
    'DevOps Engineer': 0,
    'Mobile App Developer': 0,
  };

  for (const skill of skills) {
    const s = skill.toLowerCase();

    if (JOB_SKILL_MAP['Frontend Developer'].includes(s)) {
      jobScores['Frontend Developer'] += 1;
      jobScores['Fullstack Developer'] += 0.5;
    }
    if (JOB_SKILL_MAP['Backend Developer'].includes(s)) {
      jobScores['Backend Developer'] += 1;
      jobScores['Fullstack Developer'] += 0.5;
    }
    if (JOB_SKILL_MAP['Data Scientist'].includes(s)) {
      jobScores['Data Scientist'] += 1;
      jobScores['Data Analyst'] += 0.8;
    }
    if (JOB_SKILL_MAP['DevOps Engineer'].includes(s)) {
      jobScores['DevOps Engineer'] += 1;
    }
    if (JOB_SKILL_MAP['Mobile App Developer'].includes(s)) {
      jobScores['Mobile App Developer'] += 1;
    }
  }

  // Sort roles by score descending
  const sortedJobs = Object.entries(jobScores)
    .sort((a, b) => b[1] - a[1]);

  // Return top 3 that have a score > 0
  const topJobs = sortedJobs
    .filter(([_, score]) => score > 0)
    .slice(0, 3)
    .map(([role]) => role);

  // Fallback
  return topJobs.length > 0 ? topJobs : ['Software Engineer'];
}

// ─── RESUME SCORING ALGORITHM (replaces scorer.py) ───────────────────────────

/**
 * Calculate a weighted resume score (0-100).
 * Weights: Skills 40%, Education 20%, Experience 20%, Structure 20%
 * 
 * @param {string[]} skills - Detected skills
 * @param {string} education - Education level
 * @param {string} experience - Experience level
 * @param {number} textLength - Length of raw resume text
 * @returns {{ score: number, improvements: string[] }}
 */
function calculateResumeScore(skills, education, experience, textLength) {
  let score = 0;
  const improvements = [];

  // Skills (up to 40 points)
  const numSkills = skills.length;
  if (numSkills >= 8) {
    score += 40;
  } else if (numSkills >= 4) {
    score += 30;
    improvements.push('Consider adding more specialized technical skills.');
  } else if (numSkills > 0) {
    score += 15;
    improvements.push('Your skills section is lacking. Add more relevant keywords.');
  } else {
    improvements.push('No technical skills detected. Please add a skills section.');
  }

  // Education (up to 20 points)
  if (education !== 'Not Specified') {
    score += 20;
  } else {
    improvements.push('Education details missing. Include your degree and university.');
  }

  // Experience (up to 20 points)
  if (experience === 'Experienced') {
    score += 20;
  } else if (experience === 'Intermediate') {
    score += 15;
  } else {
    score += 10;
    improvements.push('As a fresher, try adding more real-world projects and internships.');
  }

  // Structure/Length (up to 20 points)
  if (textLength > 1500) {
    score += 20;
  } else if (textLength > 800) {
    score += 15;
  } else {
    score += 5;
    improvements.push('Your resume is very brief. Improve the summary and experience descriptions.');
  }

  return { score, improvements };
}

// ─── FULL NLP ANALYSIS PIPELINE ──────────────────────────────────────────────

/**
 * Run the complete NLP analysis pipeline on a resume file.
 * This replaces the entire Python FastAPI microservice.
 * 
 * @param {string} filePath - Path to uploaded file
 * @param {string} mimetype - MIME type
 * @param {string} originalname - Original filename
 * @returns {Promise<Object>} NLP analysis result matching the Python API response format
 */
async function analyzeResume(filePath, mimetype, originalname) {
  // 1. Text Extraction
  const rawText = await extractText(filePath, mimetype, originalname);

  if (!rawText || rawText.trim().length < 50) {
    throw new Error('Could not extract meaningful text from the file.');
  }

  // 2. Skill Extraction
  const skills = extractSkills(rawText);

  // 3. Experience Detection
  const experience = extractExperience(rawText);

  // 4. Education Extraction
  const education = extractEducation(rawText);

  // 5. Job Recommendation Engine
  const recommended_jobs = getRecommendedJobs(skills);

  // 6. Resume Scoring & Improvements
  const { score, improvements } = calculateResumeScore(
    skills,
    education,
    experience,
    rawText.length
  );

  // 7. Return structured response (matches Python API format exactly)
  return {
    skills,
    education,
    experience,
    recommended_jobs,
    score,
    improvements,
    rawText, // Bonus: also return the raw text so aiController can use it for Gemini
  };
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

module.exports = {
  extractText,
  extractSkills,
  extractExperience,
  extractEducation,
  getRecommendedJobs,
  calculateResumeScore,
  analyzeResume,
};
