const Job = require('../models/Job');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// ─── PYTHON NLP SERVICE URL ─────────────────────────────────────────────────
const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000';

// ─── SKILL TAXONOMY (NLP KEYWORD DICTIONARY) ────────────────────────────────
const SKILL_DICTIONARY = {
  'Programming Languages': ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'dart', 'r', 'scala'],
  'Frontend':              ['react', 'next.js', 'vue', 'angular', 'svelte', 'html', 'css', 'tailwind', 'bootstrap', 'sass', 'webpack', 'vite'],
  'Backend':               ['node.js', 'express', 'django', 'fastapi', 'spring', 'flask', 'nest.js', 'graphql', 'rest api', 'microservices'],
  'Database':              ['mongodb', 'sql', 'postgresql', 'mysql', 'redis', 'firebase', 'supabase', 'dynamodb', 'cassandra', 'elasticsearch'],
  'DevOps & Cloud':        ['aws', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'linux', 'nginx', 'terraform', 'gcp', 'azure', 'github actions'],
  'Mobile':                ['flutter', 'react native', 'swift', 'kotlin', 'android', 'ios', 'expo'],
  'AI & Data Science':     ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'data science', 'scikit-learn', 'pandas', 'numpy', 'opencv', 'computer vision', 'llm', 'generative ai'],
  'Tools & Practices':     ['git', 'github', 'postman', 'jira', 'figma', 'agile', 'scrum', 'tdd', 'redux', 'jwt', 'oauth'],
};

// ─── MARKET DEMAND DATABASE ─────────────────────────────────────────────────
const MARKET_DEMAND = {
  'react':           { demand: 'Very High', growth: '+28%', openings: '45K+' },
  'node.js':         { demand: 'Very High', growth: '+25%', openings: '38K+' },
  'python':          { demand: 'Very High', growth: '+35%', openings: '52K+' },
  'typescript':      { demand: 'High',      growth: '+42%', openings: '30K+' },
  'next.js':         { demand: 'High',      growth: '+55%', openings: '18K+' },
  'docker':          { demand: 'High',      growth: '+22%', openings: '25K+' },
  'kubernetes':      { demand: 'High',      growth: '+30%', openings: '20K+' },
  'aws':             { demand: 'Very High', growth: '+20%', openings: '48K+' },
  'flutter':         { demand: 'Medium',    growth: '+18%', openings: '12K+' },
  'react native':    { demand: 'Medium',    growth: '+15%', openings: '10K+' },
  'machine learning':{ demand: 'Very High', growth: '+40%', openings: '35K+' },
  'deep learning':   { demand: 'High',      growth: '+38%', openings: '15K+' },
  'mongodb':         { demand: 'High',      growth: '+20%', openings: '22K+' },
  'postgresql':      { demand: 'High',      growth: '+25%', openings: '28K+' },
  'java':            { demand: 'Very High', growth: '+10%', openings: '55K+' },
  'go':              { demand: 'High',      growth: '+45%', openings: '15K+' },
  'rust':            { demand: 'Medium',    growth: '+60%', openings: '8K+'  },
  'angular':         { demand: 'Medium',    growth: '+5%',  openings: '20K+' },
  'vue':             { demand: 'Medium',    growth: '+12%', openings: '14K+' },
  'tensorflow':      { demand: 'High',      growth: '+22%', openings: '12K+' },
  'pytorch':         { demand: 'High',      growth: '+35%', openings: '14K+' },
  'graphql':         { demand: 'Medium',    growth: '+30%', openings: '10K+' },
  'figma':           { demand: 'High',      growth: '+40%', openings: '18K+' },
  'tailwind':        { demand: 'High',      growth: '+55%', openings: '15K+' },
  'generative ai':   { demand: 'Very High', growth: '+120%',openings: '25K+' },
  'llm':             { demand: 'Very High', growth: '+150%',openings: '20K+' },
};

// ─── HELPER ─────────────────────────────────────────────────────────────────
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildMarketInsights(skills) {
  const marketInsights = [];
  const missingHighDemand = [];
  const lowerSkills = skills.map(s => s.toLowerCase());

  for (const skill of skills) {
    const key = skill.toLowerCase();
    if (MARKET_DEMAND[key]) {
      marketInsights.push({ skill, demand: MARKET_DEMAND[key].demand, growth: MARKET_DEMAND[key].growth, openings: MARKET_DEMAND[key].openings });
    }
  }

  const highDemandKeys = Object.entries(MARKET_DEMAND).filter(([_, v]) => v.demand === 'Very High').map(([k]) => k);
  for (const hd of highDemandKeys) {
    if (!lowerSkills.includes(hd)) {
      missingHighDemand.push({ skill: hd.charAt(0).toUpperCase() + hd.slice(1), growth: MARKET_DEMAND[hd].growth, openings: MARKET_DEMAND[hd].openings });
    }
  }

  return { marketInsights: marketInsights.slice(0, 10), missingHighDemand: missingHighDemand.slice(0, 6) };
}

function categorizeSkills(skills) {
  const categories = {};
  for (const [category, keywords] of Object.entries(SKILL_DICTIONARY)) {
    const found = [];
    for (const skill of skills) {
      if (keywords.includes(skill.toLowerCase())) found.push(skill);
    }
    if (found.length > 0) categories[category] = found;
  }
  return categories;
}

/**
 * @desc    Full Resume Analysis Pipeline:
 *          1. Python NLP Microservice (spacy + PyMuPDF) → text extraction, skill detection, scoring
 *          2. Gemini AI → deep ATS analysis, section scores, improvement suggestions
 *          3. Node.js → job matching, market insights, merged response
 * @route   POST /api/ai/parse-resume
 * @access  Student only (protected)
 */
exports.parseResume = async (req, res) => {
  try {
    let resumeText = '';
    let nlpResult = null;

    // ══════════════════════════════════════════════════════════════════════
    // STEP 1: Send file to Python NLP Microservice for extraction + NLP
    // ══════════════════════════════════════════════════════════════════════
    if (req.file) {
      console.log(`[PIPELINE] Received file: ${req.file.originalname} (${req.file.mimetype})`);

      try {
        // Forward the uploaded file to Python NLP service
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });

        const nlpResponse = await axios.post(`${NLP_SERVICE_URL}/analyze`, formData, {
          headers: formData.getHeaders(),
          timeout: 30000,
        });

        nlpResult = nlpResponse.data;
        console.log(`[NLP] Python service returned: ${nlpResult.skills?.length || 0} skills, score=${nlpResult.score}, education=${nlpResult.education}, experience=${nlpResult.experience}`);

        // Use NLP-extracted text for Gemini (reconstruct from NLP service data)
        // The NLP service already parsed the PDF, so we have structured data
        resumeText = `Skills: ${(nlpResult.skills || []).join(', ')}. Education: ${nlpResult.education}. Experience: ${nlpResult.experience}. Improvements: ${(nlpResult.improvements || []).join('. ')}`;

      } catch (nlpErr) {
        console.warn(`[NLP] Python service unavailable (${nlpErr.message}). Falling back to pdf-parse...`);

        // FALLBACK: Use pdf-parse if Python service is down
        if (req.file.mimetype === 'application/pdf') {
          try {
            const pdfParse = require('pdf-parse');
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(dataBuffer);
            resumeText = pdfData.text || '';
            console.log(`[PDF] Fallback: extracted ${resumeText.length} chars via pdf-parse`);
          } catch (pdfErr) {
            console.error('[PDF] pdf-parse also failed:', pdfErr.message);
            return res.status(400).json({
              success: false,
              error: 'Could not extract text from PDF. Please upload a valid text-based PDF.',
            });
          }
        } else {
          resumeText = fs.readFileSync(req.file.path).toString('utf8');
        }
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    // Also try to extract raw text from PDF for Gemini (if NLP service succeeded but we need full text)
    if (nlpResult && req.file && req.file.mimetype === 'application/pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        if (pdfData.text && pdfData.text.length > resumeText.length) {
          resumeText = pdfData.text;
        }
      } catch (_) { /* Use NLP-reconstructed text */ }
    }

    if (!resumeText || resumeText.replace(/\s/g, '').length < 30) {
      return res.status(400).json({
        success: false,
        error: 'Resume content too short or unreadable.',
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STEP 2: Gemini AI Deep Analysis
    // ══════════════════════════════════════════════════════════════════════
    let geminiResult = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const safeText = resumeText.substring(0, 6000);

        // Enrich the prompt with NLP service data if available
        const nlpContext = nlpResult
          ? `\nPRE-ANALYSIS (from NLP engine): Skills detected: [${nlpResult.skills?.join(', ')}]. Education: ${nlpResult.education}. Experience Level: ${nlpResult.experience}. NLP Score: ${nlpResult.score}/100. Recommended Roles: ${nlpResult.recommended_jobs?.join(', ')}.\n`
          : '';

        const prompt = `You are an elite Fortune 500 ATS (Applicant Tracking System) engine and career advisor.

Perform a DEEP, BIAS-FREE, DATA-DRIVEN analysis of this resume. Evaluate it like a modern ATS scanner — checking formatting, keyword density, section structure, and content quality.

Your analysis must be 100% objective — evaluate ONLY on skills, experience quality, and content.
${nlpContext}
Return ONLY valid JSON with this EXACT structure:
{
  "extractedSkills": ["JavaScript", "React", "Node.js"],
  "skillCategories": {
    "Programming Languages": ["JavaScript"],
    "Frontend": ["React"],
    "Backend": ["Node.js"]
  },
  "atsScore": 72,
  "sectionScores": {
    "formatting": 75,
    "skills": 80,
    "experience": 65,
    "education": 70,
    "impact": 55
  },
  "profileTags": ["Fullstack Developer", "Mid Level"],
  "summary": "2-3 sentence summary of resume quality and ATS compatibility.",
  "whatToChange": [
    "Specific critical issue 1",
    "Specific critical issue 2"
  ],
  "howToImprove": [
    "Specific actionable fix 1 with example",
    "Specific actionable fix 2 with example"
  ],
  "keywordDensity": {
    "experience": 3,
    "project": 5
  }
}

SCORING RULES:
- "formatting" (0-100): Section headings, consistent formatting, no ATS-breaking elements
- "skills" (0-100): Technical skill density, dedicated Skills section present
- "experience" (0-100): Action verbs, STAR method, concrete outputs
- "education" (0-100): Degree, certifications, relevant coursework
- "impact" (0-100): Quantifiable metrics (%, user counts, revenue)
- "atsScore" = formatting(20%) + skills(25%) + experience(25%) + education(15%) + impact(15%)

WHAT TO CHANGE (3-8 items) — Be specific to THIS resume content.
HOW TO IMPROVE (4-8 items) — Include BEFORE → AFTER rewrite examples.
SKILL CATEGORIES — Classify into: Programming Languages, Frontend, Backend, Database, DevOps & Cloud, Mobile, AI & Data Science, Tools & Practices

RESUME TEXT:
${safeText}`;

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: 'application/json', temperature: 0.3 },
          },
          { timeout: 45000 }
        );

        const raw = geminiRes.data.candidates[0].content.parts[0].text;
        geminiResult = JSON.parse(raw);
        console.log('[GEMINI] Analysis complete. ATS Score:', geminiResult.atsScore);
      } catch (geminiErr) {
        console.warn('[GEMINI] Error:', geminiErr.response?.status === 429 ? 'Quota exceeded' : geminiErr.message);
      }
    }

    // ══════════════════════════════════════════════════════════════════════
    // STEP 3: Merge NLP + Gemini Results
    // ══════════════════════════════════════════════════════════════════════
    let finalResult = {};

    if (geminiResult && nlpResult) {
      // ── BEST CASE: Both engines succeeded → merge intelligently ────
      console.log('[PIPELINE] Merging Gemini AI + Python NLP results');

      // Use Gemini for scores/feedback, NLP for additional skills
      const geminiSkills = geminiResult.extractedSkills || [];
      const nlpSkills = nlpResult.skills || [];
      const allSkills = [...new Set([...geminiSkills, ...nlpSkills])];

      finalResult = {
        extractedSkills: allSkills,
        skillCategories: geminiResult.skillCategories || categorizeSkills(allSkills),
        atsScore: geminiResult.atsScore,
        sectionScores: geminiResult.sectionScores || { formatting: 60, skills: 60, experience: 60, education: 60, impact: 50 },
        profileTags: geminiResult.profileTags || [],
        summary: geminiResult.summary || '',
        whatToChange: geminiResult.whatToChange || [],
        howToImprove: geminiResult.howToImprove || [],
        keywordDensity: geminiResult.keywordDensity || {},
        // NLP Service extras
        nlpScore: nlpResult.score,
        education: nlpResult.education,
        experience: nlpResult.experience,
        recommendedRoles: nlpResult.recommended_jobs || [],
        nlpImprovements: nlpResult.improvements || [],
      };

    } else if (geminiResult) {
      // ── Gemini only ─────────────────────────────────────────────────
      console.log('[PIPELINE] Using Gemini AI results only');
      finalResult = {
        extractedSkills: geminiResult.extractedSkills || [],
        skillCategories: geminiResult.skillCategories || categorizeSkills(geminiResult.extractedSkills || []),
        atsScore: geminiResult.atsScore,
        sectionScores: geminiResult.sectionScores || { formatting: 60, skills: 60, experience: 60, education: 60, impact: 50 },
        profileTags: geminiResult.profileTags || [],
        summary: geminiResult.summary || '',
        whatToChange: geminiResult.whatToChange || [],
        howToImprove: geminiResult.howToImprove || [],
        keywordDensity: geminiResult.keywordDensity || {},
        nlpScore: null,
        education: null,
        experience: null,
        recommendedRoles: [],
        nlpImprovements: [],
      };

    } else if (nlpResult) {
      // ── Python NLP only (Gemini down) ───────────────────────────────
      console.log('[PIPELINE] Using Python NLP results only (Gemini unavailable)');
      const skills = nlpResult.skills || [];
      finalResult = {
        extractedSkills: skills,
        skillCategories: categorizeSkills(skills),
        atsScore: nlpResult.score || 50,
        sectionScores: {
          formatting: 60,
          skills: Math.min(skills.length * 7, 100),
          experience: nlpResult.experience === 'Experienced' ? 80 : nlpResult.experience === 'Intermediate' ? 65 : 50,
          education: nlpResult.education !== 'Not Specified' ? 75 : 40,
          impact: 45,
        },
        profileTags: [nlpResult.experience || 'Fresher', ...(nlpResult.recommended_jobs || [])],
        summary: `NLP engine detected ${skills.length} skills. Education: ${nlpResult.education}. Experience: ${nlpResult.experience}. Resume score: ${nlpResult.score}/100.`,
        whatToChange: nlpResult.improvements || ['Enable Gemini API for deeper analysis'],
        howToImprove: ['Add quantifiable metrics to every project', 'Use STAR method for bullet points', 'Add a dedicated Technical Skills section'],
        keywordDensity: {},
        nlpScore: nlpResult.score,
        education: nlpResult.education,
        experience: nlpResult.experience,
        recommendedRoles: nlpResult.recommended_jobs || [],
        nlpImprovements: nlpResult.improvements || [],
      };

    } else {
      // ── Both failed → local keyword analysis ────────────────────────
      console.log('[PIPELINE] Both engines failed. Running local keyword fallback.');
      const lower = resumeText.toLowerCase();
      const skills = [];
      for (const cat of Object.values(SKILL_DICTIONARY)) {
        for (const skill of cat) { if (lower.includes(skill)) skills.push(skill); }
      }
      const atsScore = Math.min(Math.round(50 + skills.length * 2.5), 90);
      finalResult = {
        extractedSkills: skills,
        skillCategories: categorizeSkills(skills),
        atsScore,
        sectionScores: { formatting: 55, skills: Math.min(skills.length * 7, 95), experience: 50, education: 50, impact: 35 },
        profileTags: ['Candidate'],
        summary: `Detected ${skills.length} skills via keyword matching. For better analysis, ensure the Python NLP service is running on port 8000.`,
        whatToChange: ['Start the Python NLP service: cd resume-nlp-service && ./venv/bin/python app.py'],
        howToImprove: ['Check Gemini API key in .env', 'Ensure NLP service is running on port 8000'],
        keywordDensity: {},
        nlpScore: null,
        education: null,
        experience: null,
        recommendedRoles: [],
        nlpImprovements: [],
      };
    }

    // ══════════════════════════════════════════════════════════════════════
    // STEP 4: Market Demand Insights
    // ══════════════════════════════════════════════════════════════════════
    const { marketInsights, missingHighDemand } = buildMarketInsights(finalResult.extractedSkills);

    // ══════════════════════════════════════════════════════════════════════
    // STEP 5: Job Matching & Ranking from Database
    // ══════════════════════════════════════════════════════════════════════
    let matchedJobs = [];
    try {
      const skillsList = finalResult.extractedSkills;
      if (skillsList.length > 0) {
        const allJobs = await Job.find({ isActive: true })
          .populate('companyId', 'companyName verifiedStatus');

        const scoredJobs = allJobs.map(job => {
          const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
          const resumeSkills = skillsList.map(s => s.toLowerCase());
          let matchCount = 0;
          const matched = [];

          for (const rs of resumeSkills) {
            for (const js of jobSkills) {
              if (js.includes(rs) || rs.includes(js)) { matchCount++; matched.push(rs); break; }
            }
          }

          const fitScore = Math.round((matchCount / (jobSkills.length || 1)) * 100);
          return {
            _id: job._id, title: job.title,
            company: job.companyId?.companyName || 'Unknown',
            companyVerified: job.companyId?.verifiedStatus === 'verified',
            location: job.location || 'Remote', type: job.type || 'Full-time',
            salary: job.salary || 'Not Disclosed', skillsRequired: job.skillsRequired,
            matchedSkills: matched, fitScore, matchCount,
          };
        });

        matchedJobs = scoredJobs.filter(j => j.fitScore > 0).sort((a, b) => b.fitScore - a.fitScore).slice(0, 8);
      }
    } catch (jobErr) {
      console.warn('[JOBS] Matching skipped:', jobErr.message);
    }

    // ══════════════════════════════════════════════════════════════════════
    // STEP 6: Return Unified Response
    // ══════════════════════════════════════════════════════════════════════
    console.log(`[PIPELINE] ✅ Complete. ATS=${finalResult.atsScore}, Skills=${finalResult.extractedSkills.length}, Jobs=${matchedJobs.length}`);

    return res.status(200).json({
      success: true,
      // Core ATS
      atsScore: finalResult.atsScore,
      sectionScores: finalResult.sectionScores,
      summary: finalResult.summary,
      // Skills
      extractedSkills: finalResult.extractedSkills,
      skillCategories: finalResult.skillCategories,
      profileTags: finalResult.profileTags,
      // Feedback
      whatToChange: finalResult.whatToChange,
      howToImprove: finalResult.howToImprove,
      // NLP
      keywordDensity: finalResult.keywordDensity,
      // NLP Microservice Data
      nlpScore: finalResult.nlpScore,
      education: finalResult.education,
      experience: finalResult.experience,
      recommendedRoles: finalResult.recommendedRoles,
      nlpImprovements: finalResult.nlpImprovements,
      // Market Intelligence
      marketInsights,
      missingHighDemand,
      // Job Matching
      matchedJobs,
    });

  } catch (err) {
    console.error('Resume Analysis Fatal Error:', err.message);
    return res.status(500).json({ success: false, error: 'Resume analysis failed. Please try again.' });
  }
};
