import { searchApi } from '../api/searchApi';
import { mockSearchIndex } from '../data/mockSearchIndex';

// Simple delay to simulate network latency (fallback only)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function searchMock(query) {
  const lowerQuery = query.toLowerCase().trim();
  const results = mockSearchIndex.filter(item => {
    if (item.id.toLowerCase() === lowerQuery) return true;
    return item.title.toLowerCase().includes(lowerQuery) ||
           item.keywords.toLowerCase().includes(lowerQuery) ||
           item.description.toLowerCase().includes(lowerQuery);
  });
  results.sort((a, b) => {
    const aIdMatch = a.id.toLowerCase() === lowerQuery;
    const bIdMatch = b.id.toLowerCase() === lowerQuery;
    if (aIdMatch && !bIdMatch) return -1;
    if (!aIdMatch && bIdMatch) return 1;
    const aTitleMatch = a.title.toLowerCase().includes(lowerQuery);
    const bTitleMatch = b.title.toLowerCase().includes(lowerQuery);
    if (aTitleMatch && !bTitleMatch) return -1;
    if (!aTitleMatch && bTitleMatch) return 1;
    return 0;
  });
  return results.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});
}

export const searchService = {
  async search(query, scope = 'all') {
    if (!query || query.trim().length < 2) return {};

    try {
      const res = await searchApi.search(query, { scope });
      return res.data?.data || {};
    } catch (err) {
      // Fallback to mock search with small delay
      await delay(200);
      return searchMock(query.trim());
    }
  }
};
