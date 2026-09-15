/**
 * Duplicate Detection Service
 * Compares a new complaint against the existing complaint list.
 * Uses a simple similarity score based on shared keywords + location + category.
 * Replace with a proper vector similarity / Elasticsearch endpoint in production.
 */

/**
 * Calculate a similarity score between two complaint texts (0 to 1).
 */
function textSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);
  if (union.size === 0) return 0;
  return intersection.length / union.size;
}

/**
 * Find potential duplicate complaints from an existing list.
 * @param {object} newAnalysis — result from aiTriageService.analyzeComplaint()
 * @param {Array} existingComplaints — current complaints array from AppContext
 * @param {number} threshold — similarity score threshold (default 0.35)
 * @returns {Array<{ complaint: object, similarity: number }>}
 */
export function findDuplicates(newAnalysis, existingComplaints, threshold = 0.35) {
  if (!newAnalysis?.originalText || !existingComplaints?.length) return [];

  const candidates = [];

  for (const complaint of existingComplaints) {
    let score = 0;
    let matchReasons = [];

    // Text similarity (weighted 50%)
    const textScore = textSimilarity(newAnalysis.originalText, complaint.originalText);
    score += textScore * 0.50;
    if (textScore > 0.3) matchReasons.push('Similar complaint text');

    // Same category (20%)
    if (newAnalysis.category && complaint.category && 
        newAnalysis.category.toLowerCase() === complaint.category.toLowerCase()) {
      score += 0.20;
      matchReasons.push(`Same category: ${complaint.category}`);
    }

    // Same locality/ward (20%)
    if (newAnalysis.ward && complaint.ward && newAnalysis.ward === complaint.ward) {
      score += 0.20;
      matchReasons.push(`Same ward: Ward ${complaint.ward}`);
    } else if (newAnalysis.locality && complaint.normalizedLocality &&
               newAnalysis.locality.toLowerCase() === complaint.normalizedLocality.toLowerCase()) {
      score += 0.10;
      matchReasons.push(`Same locality: ${complaint.normalizedLocality}`);
    }

    // Same department (10%)
    if (newAnalysis.department && complaint.department &&
        newAnalysis.department.toLowerCase() === complaint.department.toLowerCase()) {
      score += 0.10;
      matchReasons.push(`Same department: ${complaint.department}`);
    }

    if (score >= threshold) {
      candidates.push({
        complaint,
        similarity: Math.round(score * 100),
        matchReasons,
      });
    }
  }

  // Sort by similarity descending
  return candidates.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}
