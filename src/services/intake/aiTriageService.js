/**
 * AI Triage Service
 * Simulates an AI analysis pipeline on the complaint text.
 * All logic here is rule-based mock AI — safe, non-hallucinating.
 * Replace the internals with real API calls when a backend is available.
 *
 * POST /api/complaints/analyze  (future)
 */
import { extractLocationFromText } from './locationService';

// ── Department / Category Rules ─────────────────────────────────────────────

const DEPARTMENT_RULES = [
  {
    department: 'Sanitation Department',
    category: 'Garbage Collection',
    keywords: ['garbage', 'kachra', 'waste', 'trash', 'dustbin', 'safai', 'nali', 'sewage', 'sewer', 'drain', 'kuda'],
    urgencyKeywords: ['days', 'din', 'week', 'overflowing', 'smell', 'disease'],
  },
  {
    department: 'Water Supply Department',
    category: 'Water Leakage',
    keywords: ['water', 'paani', 'leak', 'pipe', 'supply', 'nali', 'flooding', 'flood', 'pani'],
    urgencyKeywords: ['burst', 'toot', 'bhar gaya', 'no water', 'major'],
  },
  {
    department: 'Roads & Infrastructure',
    category: 'Pothole',
    keywords: ['road', 'pothole', 'sadak', 'gaddha', 'crack', 'broken road', 'damage', 'accident'],
    urgencyKeywords: ['accident', 'large', 'bada', 'main road', 'flooding'],
  },
  {
    department: 'Street Lighting',
    category: 'Light Failure',
    keywords: ['light', 'street light', 'lamp', 'bijli', 'electricity', 'dark', 'bulb', 'pole'],
    urgencyKeywords: ['school', 'accident', 'crime', 'week', 'month'],
  },
  {
    department: 'Parks & Horticulture',
    category: 'Park Maintenance',
    keywords: ['park', 'garden', 'tree', 'plant', 'grass', 'playground'],
    urgencyKeywords: ['broken', 'fallen', 'dangerous', 'blocked'],
  },
  {
    department: 'Drainage Department',
    category: 'Drain Blockage',
    keywords: ['drain', 'nali', 'gutter', 'sewer', 'blocked', 'overflow', 'clogged'],
    urgencyKeywords: ['road par', 'overflow', 'flooding', 'bhar'],
  },
];

// ── Language Detection ────────────────────────────────────────────────────────

function detectLanguage(text) {
  const hindiPattern = /[\u0900-\u097F]/;
  const hindiWords = ['hai', 'nahi', 'din', 'paani', 'kachra', 'sadak', 'bijli', 'rasta', 'gayi', 'gaya', 'hua', 'se', 'ke', 'ki', 'ka', 'mein', 'par'];
  const lower = text.toLowerCase();
  if (hindiPattern.test(text)) return 'Hindi';
  const hindiWordCount = hindiWords.filter(w => lower.split(/\s+/).includes(w)).length;
  if (hindiWordCount >= 3) return 'Hindi';
  if (hindiWordCount >= 1) return 'Hinglish';
  return 'English';
}

// ── Department Matching ───────────────────────────────────────────────────────

function classifyDepartment(text) {
  const lower = text.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const rule of DEPARTMENT_RULES) {
    const matchCount = rule.keywords.filter(k => lower.includes(k)).length;
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestMatch = rule;
    }
  }

  if (!bestMatch || bestScore === 0) {
    return {
      department: 'General Administration',
      category: 'General Complaint',
      confidence: 0.45,
      explanation: 'No specific department keywords found. Assigned for manual review.',
      matchedKeywords: [],
    };
  }

  const matchedKw = bestMatch.keywords.filter(k => lower.includes(k));
  const confidence = Math.min(0.97, 0.60 + matchedKw.length * 0.08);

  return {
    department: bestMatch.department,
    category: bestMatch.category,
    confidence: Math.round(confidence * 100) / 100,
    explanation: `Keywords found: "${matchedKw.join('", "')}" → ${bestMatch.department}`,
    matchedKeywords: matchedKw,
  };
}

// ── Urgency Detection ─────────────────────────────────────────────────────────

function detectUrgency(text, matchedRule) {
  const lower = text.toLowerCase();
  const criticalPhrases = ['accident', 'injury', 'open manhole', 'school ke paas', 'fire', 'electrocution', 'collapsed', 'major flooding', 'critical'];
  const highPhrases = ['3 days', 'flood', 'burst pipe', 'no water', 'days tak', 'multiple days', 'toot gayi', 'bhar gaya', 'road blocked', 'ganda paani'];
  const lowPhrases = ['minor', 'small', 'please fix', 'week ago', 'not urgent'];

  if (criticalPhrases.some(p => lower.includes(p))) {
    return { urgency: 'CRITICAL', urgencyScore: 0.95, reason: 'Critical safety hazard detected in complaint text.' };
  }

  // Check matched rule urgency keywords
  let urgencyHits = 0;
  if (matchedRule?.urgencyKeywords) {
    urgencyHits = matchedRule.urgencyKeywords.filter(k => lower.includes(k)).length;
  }

  if (highPhrases.some(p => lower.includes(p)) || urgencyHits >= 2) {
    return { urgency: 'HIGH', urgencyScore: 0.78, reason: 'Duration or severity indicators suggest high urgency.' };
  }
  if (lowPhrases.some(p => lower.includes(p))) {
    return { urgency: 'LOW', urgencyScore: 0.30, reason: 'Language suggests non-critical issue.' };
  }
  if (urgencyHits >= 1) {
    return { urgency: 'MEDIUM', urgencyScore: 0.60, reason: 'Some urgency indicators found; default medium priority.' };
  }
  return { urgency: 'MEDIUM', urgencyScore: 0.55, reason: 'Standard complaint — assigned medium urgency by default.' };
}

// ── Entity Extraction ─────────────────────────────────────────────────────────

function extractEntities(text) {
  const entities = {};
  const lower = text.toLowerCase();

  // Duration
  const durationMatch = lower.match(/(\d+)\s*(day|din|week|hour|ghanta|month|mahine)/);
  if (durationMatch) {
    entities.duration = durationMatch[0];
  }

  // Ward
  const wardMatch = lower.match(/ward\s*[#no.]*\s*(\d+)/i);
  if (wardMatch) {
    entities.wardMention = wardMatch[1];
  }

  return entities;
}

// ── Missing Info Detection ────────────────────────────────────────────────────

export function detectMissingInfo(text, location) {
  const missing = [];
  const lower = text.toLowerCase();

  if (!location) {
    missing.push({ field: 'location', label: 'Location / Locality', prompt: 'Where did this happen? Adding a locality or ward number helps us route your complaint correctly.' });
  }

  const durationKeywords = ['day', 'din', 'week', 'since', 'hours', 'se', 'din se'];
  const hasDuration = durationKeywords.some(k => lower.includes(k));
  if (!hasDuration && lower.split(' ').length < 12) {
    missing.push({ field: 'duration', label: 'Duration', prompt: 'How long has this issue been going on?' });
  }

  return missing;
}

// ── Main Pipeline ─────────────────────────────────────────────────────────────

/**
 * Run full AI analysis pipeline on a complaint text.
 * @param {string} text — raw or normalized complaint text
 * @param {object|null} providedLocation — location already provided (GPS or manual)
 * @returns {Promise<object>} structured analysis result
 */
export async function analyzeComplaint(text, providedLocation = null) {
  if (!text || text.trim().length < 5) {
    throw new Error('COMPLAINT_TOO_SHORT');
  }

  // Simulate processing steps with small delays
  const steps = [
    { label: 'Detecting language…', ms: 300 },
    { label: 'Extracting key information…', ms: 400 },
    { label: 'Detecting location…', ms: 500 },
    { label: 'Classifying department…', ms: 400 },
    { label: 'Calculating urgency…', ms: 300 },
    { label: 'Checking for duplicates…', ms: 500 },
  ];

  for (const step of steps) {
    await new Promise(r => setTimeout(r, step.ms));
  }

  const language = detectLanguage(text);
  const deptResult = classifyDepartment(text);
  const matchedRule = DEPARTMENT_RULES.find(r => r.department === deptResult.department) || null;
  const urgencyResult = detectUrgency(text, matchedRule);
  const entities = extractEntities(text);

  // Location: use provided or extract from text
  let locationResult = providedLocation;
  if (!locationResult) {
    locationResult = extractLocationFromText(text);
  }

  // If ward was mentioned directly in text, prefer it
  if (entities.wardMention && !locationResult?.ward) {
    if (!locationResult) locationResult = {};
    locationResult.ward = entities.wardMention;
    locationResult.source = locationResult.source || 'complaint_text';
    locationResult.confidence = locationResult.confidence || 0.70;
  }

  // Overall confidence
  const overallConfidence = Math.round(
    (deptResult.confidence * 0.35 + (locationResult?.confidence || 0.3) * 0.25 + (urgencyResult.urgencyScore || 0.5) * 0.25 + 0.15) * 100
  );

  const explanations = [
    `"${deptResult.matchedKeywords.join('", "')}" → ${deptResult.department}`,
    locationResult ? `"${locationResult.locality}" → Ward ${locationResult.ward} (${locationResult.source})` : 'Location: Not detected',
    `Urgency: ${urgencyResult.reason}`,
  ];

  return {
    originalText: text,
    normalizedText: text.trim(),
    language,
    department: deptResult.department,
    category: deptResult.category,
    departmentConfidence: Math.round(deptResult.confidence * 100),
    urgency: urgencyResult.urgency,
    urgencyScore: urgencyResult.urgencyScore,
    urgencyReason: urgencyResult.reason,
    locality: locationResult?.locality || null,
    ward: locationResult?.ward || null,
    locationSource: locationResult?.source || null,
    locationConfidence: locationResult ? Math.round(locationResult.confidence * 100) : null,
    entities,
    aiExplanation: explanations,
    overallConfidence,
    missingInfo: detectMissingInfo(text, locationResult),
    analysedAt: new Date().toISOString(),
    note: '[Mock AI] — Replace with real AI backend in production.',
  };
}
