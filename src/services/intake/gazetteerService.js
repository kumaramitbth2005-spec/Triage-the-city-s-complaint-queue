/**
 * Gazetteer Service
 * Normalises informal locality names used by citizens into official ward entries.
 * Extend the LOCALITIES array to cover more areas.
 */

const LOCALITIES = [
  { locality: 'Arera Colony', aliases: ['arera', 'arera col', 'arera colony', 'arera coloni'], ward: '42', city: 'Bhopal' },
  { locality: 'MP Nagar', aliases: ['mp nagar', 'mpnagar', 'em pee nagar', 'mp naagar'], ward: '55', city: 'Bhopal' },
  { locality: 'Bairagarh', aliases: ['bairagarh', 'bairagarh nagar', 'bairgarh'], ward: '1', city: 'Bhopal' },
  { locality: 'Kolar Road', aliases: ['kolar', 'kolar road', 'kolar rd'], ward: '31', city: 'Bhopal' },
  { locality: 'Saket Nagar', aliases: ['saket', 'saket nagar', 'saket ngr'], ward: '21', city: 'Bhopal' },
  { locality: 'Shahpura', aliases: ['shahpura', 'shagpura', 'shapur'], ward: '13', city: 'Bhopal' },
  { locality: 'Kotra Sultanabad', aliases: ['kotra', 'kotra sultanabad', 'kotara'], ward: '7', city: 'Bhopal' },
  { locality: 'Gulmohar', aliases: ['gulmohar', 'gulmohor', 'gul mohar'], ward: '38', city: 'Bhopal' },
  { locality: 'New Market', aliases: ['new market', 'new mrkt', 'newmarket'], ward: '17', city: 'Bhopal' },
  { locality: 'TT Nagar', aliases: ['tt nagar', 'tt ngr', 'tatya tope nagar'], ward: '19', city: 'Bhopal' },
  { locality: 'Karond', aliases: ['karond', 'karound', 'karond bazar'], ward: '3', city: 'Bhopal' },
  { locality: 'Govindpura', aliases: ['govindpura', 'govind pura', 'gowindpura'], ward: '62', city: 'Bhopal' },
  { locality: 'Piplani', aliases: ['piplani', 'pipalni', 'piplani sector'], ward: '70', city: 'Bhopal' },
  { locality: 'Misrod', aliases: ['misrod', 'misord', 'misrod area'], ward: '82', city: 'Bhopal' },
  { locality: 'Ashoka Garden', aliases: ['ashoka garden', 'ashok garden', 'ashoka bagh'], ward: '28', city: 'Bhopal' },
];

/**
 * Attempts to match a raw text string against known locality aliases.
 * Returns null if no match found.
 * @param {string} rawText — The complaint text or location string entered by the user
 * @returns {{ locality: string, ward: string, city: string, confidence: number } | null}
 */
export function matchLocality(rawText) {
  if (!rawText) return null;
  const lower = rawText.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of LOCALITIES) {
    for (const alias of entry.aliases) {
      if (lower.includes(alias)) {
        // Longer alias = more specific = higher confidence
        const score = alias.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = entry;
        }
      }
    }
  }

  if (!bestMatch) return null;

  // Confidence based on alias length vs full locality name length
  const confidence = Math.min(0.95, 0.65 + (bestScore / bestMatch.locality.length) * 0.3);

  return {
    locality: bestMatch.locality,
    ward: bestMatch.ward,
    city: bestMatch.city,
    confidence: Math.round(confidence * 100) / 100,
    source: 'complaint_text',
  };
}

/**
 * Returns all known localities for ward-lookup dropdowns.
 */
export function getAllLocalities() {
  return LOCALITIES.map(({ locality, ward, city }) => ({ locality, ward, city }));
}
