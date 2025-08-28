import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  orderBy,
  query,
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Fetches and processes articles from Firestore
 * @returns {Promise<Array>} Array of processed articles
 */

export const subscribeToArticles = async () => {
  try {
    // Prefer createdAt descending; if your collection uses a different timestamp field (e.g., publishedAt),
    // change 'createdAt' below to that field name.
    const q = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const articles = [];

    querySnapshot.forEach((docSnapshot) => {
      const docData = docSnapshot.data();
      let articleData;
      const dataKeys = Object.keys(docData || {});

      // Handle nested JSON structure from previous incorrect storage
      if (dataKeys.length === 1 && dataKeys[0]?.startsWith?.('{')) {
        try {
          articleData = JSON.parse(dataKeys);
        } catch {
          articleData = docData;
        }
      } else {
        articleData = docData;
      }

      // Normalize possible Firestore Timestamp or ISO/string to JS Date
      const toDate = (val) => {
        if (!val) return null;
        // Firestore Timestamp has toDate()
        if (typeof val === 'object' && typeof val.toDate === 'function') {
          return val.toDate();
        }
        // ISO string or number
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
      };

      const createdAtDate = toDate(articleData.createdAt);
      const updatedAtDate = toDate(articleData.updatedAt);
      const publishDateDate = toDate(articleData.publishDate) || createdAtDate;

      const processedArticle = {
        id: docSnapshot.id,
        headline: articleData.headline || 'Untitled Article',
        summary: articleData.summary || 'No summary available',
        content: articleData.content || articleData.summary || 'No content available',
        author: articleData.author || 'Unknown Author',
        // keep original values but also provide normalized dates if you use them
        publishDate: articleData.publishDate || (publishDateDate ? publishDateDate.toISOString() : new Date().toISOString()),
        readTime: articleData.readTime || '5 min read',
        imageUrl: articleData.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        topics: Array.isArray(articleData.topics)
          ? articleData.topics
          : (typeof articleData.topics === 'string' ? [articleData.topics] : ['AI', 'Technology']),
        createdAt: createdAtDate || new Date(),
        updatedAt: updatedAtDate || new Date()
      };

      articles.push(processedArticle);
    });

    // Safety: if some docs lack createdAt or Firestore ordering couldn't be used,
    // ensure final client-side sort by the most reliable date (createdAt -> publishDate).
    articles.sort((a, b) => {
      const aDate = a.createdAt || (a.publishDate ? new Date(a.publishDate) : null);
      const bDate = b.createdAt || (b.publishDate ? new Date(b.publishDate) : null);
      const aTime = aDate ? aDate.getTime() : 0;
      const bTime = bDate ? bDate.getTime() : 0;
      return bTime - aTime; // desc
    });

    return articles;
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching articles:', error);
    }
    return [];
  }
};

/**
 * Retrieves user interactions (likes, saves, reads)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User interaction data
 */
export const getUserInteractions = async (userId) => {
  if (!userId) {
    return { likedArticles: [], savedArticles: [], readArticles: [] };
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        likedArticles: userData.likedArticles || [],
        savedArticles: userData.savedArticles || [],
        readArticles: userData.readArticles || []
      };
    }
    return { likedArticles: [], savedArticles: [], readArticles: [] };
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching user interactions:', error);
    }
    return { likedArticles: [], savedArticles: [], readArticles: [] };
  }
};

/**
 * Updates user interaction (like/save)
 * @param {string} userId - User ID
 * @param {string} articleId - Article ID
 * @param {string} action - 'like' or 'save'
 * @param {boolean} isAdd - Add or remove interaction
 * @returns {Promise<boolean>} Success status
 */
export const updateUserInteraction = async (userId, articleId, action, isAdd) => {
  if (!userId || !articleId || !['like', 'save'].includes(action)) {
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const field = action === 'like' ? 'likedArticles' : 'savedArticles';
    
    await updateDoc(userRef, {
      [field]: isAdd ? arrayUnion(articleId) : arrayRemove(articleId),
      lastActivity: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error updating user interaction:', error);
    }
    return false;
  }
};

/**
 * Filters user's saved articles from all articles and sorts by recency.
 * - If userInteractions.savedArticles is an array of IDs: sorts by article.createdAt/publishDate desc.
 * - If it's an object map { [articleId]: timestamp }: sorts by saved timestamp desc.
 * @param {string} userId - User ID
 * @param {Array} allArticles - All articles array
 * @returns {Promise<Array>} Saved articles sorted by most recent
 */
export const getUserSavedArticles = async (userId, allArticles) => {
  if (!userId || !Array.isArray(allArticles)) {
    return [];
  }

  try {
    const userInteractions = await getUserInteractions(userId);
    if (!userInteractions) return [];

    const saved = userInteractions.savedArticles || [];

    // Normalize to a consistent structure:
    // - ids: Set of saved IDs (fast lookup)
    // - savedAtMap: if available, map of id -> Date for saved time
    const toDate = (val) => {
      if (!val) return null;
      if (typeof val === 'object' && typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    let ids = new Set();
    let savedAtMap = null;

    if (Array.isArray(saved)) {
      // Legacy: array of IDs
      ids = new Set(saved);
    } else if (saved && typeof saved === 'object') {
      // Preferred: object map { [articleId]: timestamp | true }
      ids = new Set(Object.keys(saved));
      savedAtMap = {};
      for (const [id, ts] of Object.entries(saved)) {
        // ts could be boolean true, ISO string, number, or Firestore Timestamp
        const d = toDate(ts);
        if (d) savedAtMap[id] = d;
      }
    }

    // Filter only saved articles
    const filtered = allArticles.filter((article) => ids.has(article.id));

    // Decide sort key
    const getArticleCreatedDate = (a) => {
      // Prefer Date objects on createdAt if already normalized
      if (a.createdAt instanceof Date) return a.createdAt;
      // If createdAt is Firestore Timestamp
      if (a.createdAt && typeof a.createdAt.toDate === 'function') return a.createdAt.toDate();
      // If createdAt/publishDate are strings/numbers
      const c = a.createdAt ? new Date(a.createdAt) : null;
      if (c && !isNaN(c.getTime())) return c;
      const p = a.publishDate ? new Date(a.publishDate) : null;
      if (p && !isNaN(p.getTime())) return p;
      return new Date(0); // fallback very old
    };

    // Sort:
    // - If we have savedAtMap, sort by when user saved (desc)
    // - Else sort by article's createdAt/publishDate (desc)
    if (savedAtMap) {
      filtered.sort((a, b) => {
        const aSaved = savedAtMap[a.id] ? savedAtMap[a.id].getTime() : 0;
        const bSaved = savedAtMap[b.id] ? savedAtMap[b.id].getTime() : 0;
        if (bSaved !== aSaved) return bSaved - aSaved;
        // tie-breaker by article recency
        return getArticleCreatedDate(b) - getArticleCreatedDate(a);
      });
    } else {
      filtered.sort((a, b) => getArticleCreatedDate(b) - getArticleCreatedDate(a));
    }

    return filtered;
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching saved articles:', error);
    }
    return [];
  }
};


/**
 * Marks article as read and updates user stats
 * @param {string} userId - User ID
 * @param {string} articleId - Article ID
 * @returns {Promise<boolean>} Success status
 */
export const markArticleAsRead = async (userId, articleId) => {
  if (!userId || !articleId) return;

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const readArticles = userData.readArticles || []; // Assume array of article IDs

      // Check for uniqueness
      if (readArticles.includes(articleId)) {
        // Already read: Skip to avoid overcounting
        return;
      }

      // Mark as read (add to array and increment count)
      await setDoc(userDocRef, {
        readArticles: arrayUnion(articleId), // Appends if not present (Firestore ensures no duplicates in arrays)
        articlesReadCount: increment(1) // Increment count only if unique
      }, { merge: true });
    } else {
      // If no user doc, create one with initial read
      await setDoc(userDocRef, {
        readArticles: [articleId],
        articlesReadCount: 1
      });
    }
  } catch (error) {
    console.error('Error marking article as read:', error);
    // Optional: Throw or handle for UI feedback
  }
};

/**
 * Updates reading progress for an article
 * @param {string} userId - User ID
 * @param {string} articleId - Article ID
 * @param {number} progressPercent - Progress percentage (0-100)
 * @returns {Promise<boolean>} Success status
 */
export const updateReadingProgress = async (userId, articleId, progressPercent) => {
  if (!userId || !articleId || typeof progressPercent !== 'number') {
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      [`readingProgress.${articleId}`]: {
        progress: Math.min(100, Math.max(0, progressPercent)),
        lastUpdated: serverTimestamp()
      }
    });
    
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error updating reading progress:', error);
    }
    return false;
  }
};

/**
 * Retrieves user's reading history
 * @param {string} userId - User ID
 * @param {Array} allArticles - All articles array
 * @returns {Promise<Array>} Read articles
 */
export const getUserReadingHistory = async (userId, allArticles) => {
  if (!userId || !Array.isArray(allArticles)) {
    return [];
  }

  try {
    const userInteractions = await getUserInteractions(userId);
    return allArticles.filter(article => 
      userInteractions.readArticles?.includes(article.id)
    );
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching reading history:', error);
    }
    return [];
  }
};

/**
 * Creates or initializes user document
 * @param {string} userId - User ID
 * @param {Object} userData - User data
 * @returns {Promise<boolean>} Success status
 */
export const initializeUser = async (userId, userData = {}) => {
  if (!userId) {
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        ...userData,
        likedArticles: [],
        savedArticles: [],
        readArticles: [],
        stats: {
          articlesRead: 0,
          totalReadingTime: 0
        },
        readingProgress: {},
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error initializing user:', error);
    }
    return false;
  }
};
