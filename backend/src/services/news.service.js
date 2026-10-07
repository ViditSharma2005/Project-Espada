import { getCollection } from "../config/db.js";


function parseArticleDate(dateStr) {
  if (!dateStr) return new Date(0);
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SCORE_FIELDS = {
  relevance: "relevance_score",
  impact: "impact_score",
};


export async function getNews({ limit = 50, category, sort = "date", q } = {}) {
  const filter = {};
  if (category) filter.category = category;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ heading: rx }, { description: rx }];
  }

  const docs = await getCollection().find(filter).toArray();

  if (sort in SCORE_FIELDS) {
    const field = SCORE_FIELDS[sort];
    docs.sort((a, b) => (b[field] || 0) - (a[field] || 0));
  } else {
    
    docs.sort((a, b) => {
      const byDate = parseArticleDate(b.date) - parseArticleDate(a.date);
      return byDate !== 0 ? byDate : (b.relevance_score || 0) - (a.relevance_score || 0);
    });
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  return docs.slice(0, safeLimit);
}


export async function getNewsById(id) {
  return getCollection().findOne({ _id: id });
}


export async function getNewsCount() {
  return getCollection().countDocuments();
}
