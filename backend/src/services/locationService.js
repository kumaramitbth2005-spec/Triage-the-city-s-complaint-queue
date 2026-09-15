const Gazetteer = require('../models/Gazetteer');

/**
 * Resolve location from text or GPS coordinates.
 * Returns { locality, ward, city, source, confidence } or null.
 */
async function resolveLocation({ text, latitude, longitude }) {
  // If text is provided, search the gazetteer
  if (text) {
    const regex = new RegExp(text.trim(), 'i');
    const match = await Gazetteer.findOne({
      type: 'locality',
      $or: [{ name: regex }, { aliases: regex }]
    });
    if (match) {
      return {
        locality: match.name,
        ward: match.wardNumber,
        city: 'Bhopal',
        source: 'gazetteer',
        confidence: 0.92
      };
    }
    return null;
  }

  // If GPS coordinates provided, do a simple bounding-box mock lookup
  if (latitude != null && longitude != null) {
    return {
      locality: 'Unknown Locality',
      ward: null,
      city: 'Bhopal',
      source: 'coordinates',
      confidence: 0.60
    };
  }

  return null;
}

module.exports = { resolveLocation };
