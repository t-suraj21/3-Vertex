const Job = require('../models/Job');
const axios = require('axios');

// ─── LOCAL NLP FALLBACK ENGINE ──────────────────────────────────────────────
// Used when Gemini API is unavailable or quota exceeded
const SKILL_DICTIONARY = {
  fullstack:      ['javascript', 'typescript', 'react', 'node.js', 'express', 'next.js', 'vue', 'angular'],
  backend:        ['python', 'java', 'c++', 'go', 'rust', 'php', 'spring', 'django', 'fastapi'],
  database:       ['mongodb', 'sql', 'postgresql', 'mysql', 'redis', 'firebase', 'supabase'],
  devops:         ['aws', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'linux', 'nginx', 'terraform', 'devops'],
  mobile:         ['flutter', 'react native', 'swift', 'kotlin', 'android', 'ios', 'expo'],
  ai:             ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'data science', 'scikit-learn', 'ai'],
  design:         ['ui/ux', 'figma', 'framer', 'tailwind', 'bootstrap', 'css', 'html'],
  tools:          ['git', 'github', 'postman', 'redux', 'graphql', 'rest api', 'jwt'],
};

function localNLPAnalysis(resumeText) {
  const lower = resumeText.toLowerCase();
  const extractedSkills = [];

  for (const category of Object.values(SKILL_DICTIONARY)) {
    for (const skill of category) {
      if (lower.includes(skill)) extractedSkills.push(skill);
    }
  }

  const totalSkills = Object.values(SKILL_DICTIONARY).flat().length;
  const skillDensity = (extractedSkills.length / totalSkills) * 100;
  const atsScore = Math.min(Math.round(62 + skillDensity * 0.38), 92);

  const profileTags = [];
  if (lower.includes('senior') || lower.includes('lead') || lower.includes('manager')) profileTags.push('Senior Level');
  else if (lower.includes('intern') || lower.includes('fresher')) profileTags.push('Fresher');
  else profileTags.push('Mid Level');

  if (extractedSkills.some(s => ['react', 'node.js', 'next.js', 'express'].includes(s))) profileTags.push('Fullstack');
  if (extractedSkills.some(s => ['machine learning', 'deep learning', 'ai', 'nlp'].includes(s))) profileTags.push('AI/ML');
  if (extractedSkills.some(s => ['flutter', 'react native', 'android', 'ios'].includes(s))) profileTags.push('Mobile Dev');
  if (extractedSkills.some(s => ['aws', 'docker', 'kubernetes', 'devops'].includes(s))) profileTags.push('DevOps');
  profileTags.push('High Potential');

  const whatToChange = [];
  const howToImprove = [];

  if (!lower.includes('%') && !lower.match(/\d+\s*(users|requests|students|customers)/i)) {
    whatToChange.push('No quantifiable metrics found (e.g. "handled 10,000 users")');
    howToImprove.push('Add measurable impact to each project: users, performance gains, or scale');
  }
  if (!lower.includes('project') && !lower.includes('built') && !lower.includes('developed')) {
    whatToChange.push('Project descriptions are vague or missing');
    howToImprove.push('Use "Built X using Y to solve Z" format for each project');
  }
  if (extractedSkills.length < 8) {
    whatToChange.push('Skill section is sparse — ATS filters may eliminate this resume early');
    howToImprove.push('List all relevant technologies explicitly in a dedicated Skills section');
  }
  if (!lower.includes('github') && !lower.includes('portfolio')) {
    whatToChange.push('No GitHub or portfolio link found');
    howToImprove.push('Add a GitHub profile link with active repositories to prove your skills');
  }

  if (whatToChange.length === 0) whatToChange.push('Resume structure looks solid — minor polishing recommended');
  if (howToImprove.length === 0) howToImprove.push('Use the STAR method (Situation, Task, Action, Result) for all bullet points');

  return { extractedSkills, atsScore, profileTags, whatToChange, howToImprove };
}

// ─── HELPER ─────────────────────────────────────────────────────────────────
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    Gemini-powered Resume Parser with local NLP fallback
 * @route   POST /api/ai/parse-resume
 */
exports.parseResume = async (req, res) => {
  try {
    let resumeText = '';

    // ── STEP 1: Extract text via PyMuPDF ─────────────────────────────────
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const { execFileSync } = require('child_process');
        const path = require('path');
        const pythonScript = path.join(__dirname, '../utils/python_parser.py');
        const venvPython   = path.join(__dirname, '../../resume-nlp-service/venv/bin/python');

        try {
          resumeText = execFileSync(venvPython, [pythonScript, req.file.path], { encoding: 'utf-8' });
        } catch (pythonError) {
          console.error('PyMuPDF failed:', pythonError.stderr || pythonError.message);
          return res.status(400).json({
            success: false,
            status: 'partial',
            error: 'Could not extract text from this PDF. Please upload a text-based PDF.',
          });
        }
      } else {
        const fs = require('fs');
        resumeText = fs.readFileSync(req.file.path).toString('utf8');
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    if (!resumeText || resumeText.replace(/\s/g, '').length < 50) {
      return res.status(400).json({
        success: false,
        status: 'partial',
        error: 'Resume content too short or unreadable.',
      });
    }

    // ── STEP 2: Try Gemini AI First ───────────────────────────────────────
    let analysisResult = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const safeText = resumeText.substring(0, 5000);
        const prompt = `You are an elite Fortune 500 Technical Recruiter and ATS parsing engine.
Analyze this resume and return ONLY valid JSON (no markdown, no code blocks) in this exact structure:
{
  "extractedSkills": ["skill1", "skill2"],
  "atsScore": 78,
  "profileTags": ["Fullstack", "Mid Level"],
  "whatToChange": ["Issue 1", "Issue 2"],
  "howToImprove": ["Action 1", "Action 2"]
}

RESUME TEXT:
${safeText}`;

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          { contents: [{ parts: [{ text: prompt }] }], generationConfig: { response_mime_type: 'application/json', temperature: 0.2 } },
          { timeout: 30000 }
        );

        const raw = geminiRes.data.candidates[0].content.parts[0].text;
        analysisResult = JSON.parse(raw);
        console.log('[AI] Gemini analysis complete. ATS Score:', analysisResult.atsScore);
      } catch (geminiErr) {
        const status = geminiErr.response?.status;
        if (status === 429) {
          console.warn('[AI] Gemini quota exceeded. Switching to local NLP engine.');
        } else {
          console.error('[AI] Gemini error:', geminiErr.message);
        }
        // Fall through to local NLP
      }
    }

    // ── STEP 3: Local NLP Fallback if Gemini unavailable ─────────────────
    if (!analysisResult) {
      console.log('[AI] Running local NLP analysis...');
      analysisResult = localNLPAnalysis(resumeText);
    }

    const { extractedSkills, atsScore, profileTags, whatToChange, howToImprove } = analysisResult;

    // ── STEP 4: Match Jobs from DB ────────────────────────────────────────
    const matchingJobs = await Job.find({
      $or: [
        { skillsRequired: { $in: extractedSkills.map(s => new RegExp(escapeRegExp(s), 'i')) } },
        { title:          { $in: extractedSkills.map(s => new RegExp(escapeRegExp(s), 'i')) } },
      ],
    }).limit(10).populate('companyId', 'companyName');

    return res.status(200).json({
      success: true,
      extractedSkills,
      atsScore,
      profileTags,
      matches: matchingJobs,
      whatToChange,
      howToImprove,
    });

  } catch (err) {
    console.error('Resume Analysis Fatal Error:', err.message);
    return res.status(500).json({ success: false, error: 'Resume analysis failed. Please try again.' });
  }
};


