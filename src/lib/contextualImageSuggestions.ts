/**
 * contextualImageSuggestions.ts
 * Returns contextually relevant stock images based on page type,
 * book title, chapter title, and surrounding text content.
 */

// ─── Categorized Stock Image Library ─────────────────────────────────────────

interface ImageCategory {
  name: string;
  keywords: string[];
  images: string[];
}

const IMAGE_CATEGORIES: ImageCategory[] = [
  {
    name: 'Business & Office',
    keywords: ['business', 'corporate', 'office', 'company', 'management', 'leadership', 'strategy', 'meeting', 'team', 'startup', 'entrepreneur', 'revenue', 'profit', 'ceo', 'executive', 'organization', 'enterprise', 'consulting', 'workplace', 'professional', 'career', 'growth', 'plan', 'goal'],
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Technology',
    keywords: ['technology', 'tech', 'software', 'code', 'coding', 'programming', 'digital', 'data', 'ai', 'artificial intelligence', 'machine learning', 'computer', 'app', 'web', 'cyber', 'internet', 'cloud', 'automation', 'algorithm', 'developer', 'api', 'blockchain', 'innovation', 'hardware', 'robot'],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Nature & Landscapes',
    keywords: ['nature', 'landscape', 'mountain', 'forest', 'ocean', 'river', 'sky', 'sunset', 'sunrise', 'tree', 'earth', 'environment', 'climate', 'green', 'garden', 'outdoor', 'wilderness', 'park', 'lake', 'beach', 'flower', 'plant', 'season', 'weather', 'eco', 'sustainability'],
    images: [
      'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Education & Books',
    keywords: ['education', 'learn', 'study', 'school', 'university', 'college', 'book', 'read', 'knowledge', 'teach', 'course', 'training', 'tutorial', 'guide', 'how to', 'lesson', 'class', 'student', 'academic', 'research', 'science', 'library', 'writing', 'essay'],
    images: [
      'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Creative & Abstract',
    keywords: ['creative', 'abstract', 'art', 'design', 'color', 'pattern', 'modern', 'concept', 'idea', 'imagination', 'inspiration', 'visual', 'aesthetic', 'minimal', 'vibrant', 'artistic', 'paint', 'draw', 'illustration', 'craft', 'diy'],
    images: [
      'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1604076913837-52ab5f7c4ccb?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Health & Wellness',
    keywords: ['health', 'wellness', 'fitness', 'yoga', 'meditation', 'mental', 'mind', 'body', 'nutrition', 'diet', 'exercise', 'workout', 'mindfulness', 'self-care', 'therapy', 'healing', 'stress', 'sleep', 'wellbeing', 'calm', 'relax', 'breathe', 'holistic', 'medical', 'hospital', 'doctor'],
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Food & Lifestyle',
    keywords: ['food', 'cook', 'recipe', 'kitchen', 'meal', 'restaurant', 'dining', 'eat', 'lifestyle', 'home', 'living', 'family', 'daily', 'routine', 'habit', 'morning', 'coffee', 'drink', 'bake', 'cuisine'],
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Architecture & Interior',
    keywords: ['architecture', 'building', 'interior', 'house', 'real estate', 'property', 'construction', 'city', 'urban', 'skyline', 'apartment', 'room', 'space', 'design', 'modern', 'structure', 'bridge', 'tower'],
    images: [
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Travel & Adventure',
    keywords: ['travel', 'adventure', 'trip', 'journey', 'explore', 'destination', 'vacation', 'holiday', 'tourism', 'world', 'globe', 'map', 'road', 'flight', 'passport', 'backpack', 'wander', 'discover', 'culture'],
    images: [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'People & Portraits',
    keywords: ['people', 'person', 'portrait', 'face', 'human', 'community', 'social', 'relationship', 'friend', 'group', 'diversity', 'culture', 'society', 'individual', 'personality', 'communication', 'network', 'connect', 'author', 'speaker'],
    images: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Finance & Marketing',
    keywords: ['finance', 'money', 'invest', 'stock', 'market', 'bank', 'economy', 'budget', 'wealth', 'crypto', 'trading', 'marketing', 'brand', 'advertis', 'sales', 'customer', 'client', 'funnel', 'conversion', 'seo', 'social media', 'content', 'campaign', 'analytics', 'roi'],
    images: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Science & Space',
    keywords: ['science', 'space', 'universe', 'galaxy', 'star', 'planet', 'physics', 'chemistry', 'biology', 'experiment', 'lab', 'discovery', 'atom', 'molecule', 'quantum', 'nasa', 'astronomy', 'cosmos', 'rocket'],
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Music & Arts',
    keywords: ['music', 'song', 'band', 'concert', 'instrument', 'guitar', 'piano', 'singing', 'performance', 'stage', 'festival', 'art', 'gallery', 'museum', 'sculpture', 'painting', 'exhibition', 'theater', 'dance', 'film', 'cinema', 'movie', 'photography'],
    images: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Sports & Fitness',
    keywords: ['sport', 'athlete', 'run', 'gym', 'training', 'compete', 'game', 'match', 'champion', 'race', 'swimming', 'cycling', 'climb', 'hike', 'marathon', 'strength', 'endurance', 'performance'],
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-bd45ba8c8cd4?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Self-Help & Motivation',
    keywords: ['self-help', 'motivation', 'mindset', 'success', 'habit', 'discipline', 'focus', 'confidence', 'self-improvement', 'personal development', 'growth', 'purpose', 'vision', 'journal', 'gratitude', 'resilience', 'overcome', 'empower', 'transform', 'potential', 'dream', 'inspire', 'goal'],
    images: [
      'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Fashion & Style',
    keywords: ['fashion', 'style', 'clothing', 'outfit', 'trend', 'model', 'beauty', 'makeup', 'accessories', 'luxury', 'elegant', 'wardrobe', 'designer', 'boutique', 'chic'],
    images: [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&auto=format&fit=crop',
    ],
  },
  {
    name: 'Textures & Backgrounds',
    keywords: ['texture', 'background', 'gradient', 'pattern', 'abstract', 'wallpaper', 'surface', 'material'],
    images: [
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop',
    ],
  },
];

// ─── Scoring Engine ──────────────────────────────────────────────────────────

/** Deterministic hash for consistent results per context */
const strHash = (s: string): number => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return h >>> 0;
};

/** Score a category against a text blob using keyword frequency */
function scoreCategory(category: ImageCategory, text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of category.keywords) {
    // Count occurrences — partial word match via includes
    let idx = 0;
    let occurrences = 0;
    while ((idx = lower.indexOf(kw, idx)) !== -1) {
      occurrences++;
      idx += kw.length;
    }
    score += occurrences;
  }
  return score;
}

// ─── Page type → preferred categories ────────────────────────────────────────

const COVER_PREFERRED = ['Creative & Abstract', 'Textures & Backgrounds', 'Architecture & Interior'];
const BACK_PREFERRED = ['People & Portraits', 'Creative & Abstract', 'Textures & Backgrounds'];

// ─── Main API ────────────────────────────────────────────────────────────────

export interface ImageContext {
  /** The book title */
  bookTitle: string;
  /** Current page title (chapter name, etc.) */
  pageTitle?: string;
  /** The page type */
  pageType?: 'cover' | 'toc' | 'chapter' | 'chapter-page' | 'back' | string;
  /** Text content from the page elements */
  surroundingText?: string;
  /** Images already used on this page (to avoid duplicates) */
  excludeSrcs?: string[];
  /** Number of suggestions to return */
  count?: number;
}

/**
 * Returns contextually relevant stock images based on the provided context.
 * Uses keyword scoring to match content to image categories, with page-type
 * awareness and deterministic shuffling for variety.
 */
export function getContextualImages(ctx: ImageContext): string[] {
  const count = ctx.count ?? 3;
  const excludeSet = new Set(ctx.excludeSrcs || []);

  // Build the context text blob from all available signals
  const textParts = [ctx.bookTitle];
  if (ctx.pageTitle) textParts.push(ctx.pageTitle);
  if (ctx.surroundingText) textParts.push(ctx.surroundingText);
  const contextText = textParts.join(' ');

  // Score all categories
  const scored = IMAGE_CATEGORIES.map(cat => ({
    cat,
    score: scoreCategory(cat, contextText),
  }));

  // Apply page-type preference boosts
  if (ctx.pageType === 'cover') {
    for (const s of scored) {
      if (COVER_PREFERRED.includes(s.cat.name)) s.score += 3;
    }
  } else if (ctx.pageType === 'back') {
    for (const s of scored) {
      if (BACK_PREFERRED.includes(s.cat.name)) s.score += 3;
    }
  }

  // Sort by score descending — ties broken by name for stability
  scored.sort((a, b) => b.score - a.score || a.cat.name.localeCompare(b.cat.name));

  // Collect images from top-scoring categories
  const result: string[] = [];
  const seed = strHash(contextText);

  for (const { cat } of scored) {
    if (result.length >= count) break;
    // Deterministically shuffle this category's images based on context
    const available = cat.images.filter(src => !excludeSet.has(src) && !result.includes(src));
    if (available.length === 0) continue;

    // Pick images starting from a seeded offset for variety
    const startIdx = seed % available.length;
    for (let i = 0; i < available.length && result.length < count; i++) {
      result.push(available[(startIdx + i) % available.length]);
    }
  }

  // If we still don't have enough (very generic content), fill from all categories
  if (result.length < count) {
    const allImages = IMAGE_CATEGORIES.flatMap(c => c.images);
    const startIdx = seed % allImages.length;
    for (let i = 0; i < allImages.length && result.length < count; i++) {
      const img = allImages[(startIdx + i) % allImages.length];
      if (!excludeSet.has(img) && !result.includes(img)) {
        result.push(img);
      }
    }
  }

  return result.slice(0, count);
}

/**
 * Helper to gather surrounding text from page elements.
 */
export function gatherPageText(elements: Array<{ type: string; content?: string }>): string {
  return elements
    .filter(el => el.type === 'text' && el.content)
    .map(el => el.content!)
    .join(' ')
    .slice(0, 500); // Cap for performance
}
