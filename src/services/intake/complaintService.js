/**
 * Complaint Service
 * Handles complaint ID generation and final schema assembly.
 * Designed to be replaced with real POST /api/complaints when backend is ready.
 */

/**
 * Generate a unique complaint ID in the format CMP-YYYY-XXXXXX
 */
export function generateComplaintId() {
  const year = new Date().getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${year}-${seq}`;
}

/**
 * Assemble the full complaint object from intake form data + AI analysis.
 * Preserves originalText and voiceTranscript separately.
 * @param {object} params
 * @returns {object} full complaint record
 */
export function assembleComplaint({
  originalText,
  voiceTranscript = null,
  inputMethod = 'text',
  analysis,
  photoAttachment = null,
  operatorOverrides = {},
}) {
  const id = generateComplaintId();
  const now = new Date().toISOString();

  return {
    // Identity
    id,
    status: 'Received',
    createdAt: now,
    updatedAt: now,

    // Raw citizen input — NEVER overwritten
    originalText,
    voiceTranscript,
    normalizedText: analysis?.normalizedText || originalText,
    inputType: inputMethod === 'voice' ? 'Voice' : inputMethod === 'image' ? 'Image' : 'Text',
    sourceChannel: 'Web Portal',

    // AI Analysis results
    language: analysis?.language || 'Unknown',
    department: operatorOverrides.department || analysis?.department || 'General Administration',
    category: operatorOverrides.category || analysis?.category || 'General Complaint',
    urgency: operatorOverrides.urgency || analysis?.urgency || 'MEDIUM',
    urgencyReason: analysis?.urgencyReason || '',
    urgencyScore: analysis?.urgencyScore || 0.5,

    // Location
    locality: analysis?.locality || null,
    normalizedLocality: analysis?.locality || 'Unknown',
    ward: analysis?.ward || null,
    locationSource: analysis?.locationSource || null,
    locationConfidence: analysis?.locationConfidence || null,

    // AI Metadata
    confidence: analysis?.overallConfidence || 50,
    aiExplanation: analysis?.aiExplanation || [],
    departmentConfidence: analysis?.departmentConfidence || 50,
    entities: analysis?.entities || {},

    // Duplicate Detection
    duplicateStatus: 'None',
    linkedComplaint: null,

    // Evidence
    evidence: analysis?.entities ? Object.values(analysis.entities) : [],
    attachments: photoAttachment ? [photoAttachment] : [],

    // Operator fields (filled during review)
    operatorDecision: null,
    operatorNotes: null,
  };
}
