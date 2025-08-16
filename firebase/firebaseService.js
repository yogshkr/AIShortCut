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
    const q = query(collection(db, 'articles'));
    const querySnapshot = await getDocs(q);
    const articles = [];
    
    querySnapshot.forEach((docSnapshot) => {
      const docData = docSnapshot.data();
      let articleData;
      const dataKeys = Object.keys(docData);
      
      // Handle nested JSON structure from previous incorrect storage
      if (dataKeys.length === 1 && dataKeys[0].startsWith('{')) {
        try {
          articleData = JSON.parse(dataKeys[0]);
        } catch (parseError) {
          articleData = docData;
        }
      } else {
        articleData = docData;
      }
      
      // Process and validate article data
      const processedArticle = {
        id: docSnapshot.id,
        headline: articleData.headline || 'Untitled Article',
        summary: articleData.summary || 'No summary available',
        content: articleData.content || articleData.summary || 'No content available',
        author: articleData.author || 'Unknown Author',
        publishDate: articleData.publishDate || new Date().toLocaleDateString(),
        readTime: articleData.readTime || '5 min read',
        imageUrl: articleData.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        topics: Array.isArray(articleData.topics) ? articleData.topics : 
                (typeof articleData.topics === 'string' ? [articleData.topics] : 
                ['AI', 'Technology']),
        createdAt: articleData.createdAt || new Date(),
        updatedAt: articleData.updatedAt || new Date()
      };
      
      articles.push(processedArticle);
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
 * Filters user's saved articles from all articles
 * @param {string} userId - User ID
 * @param {Array} allArticles - All articles array
 * @returns {Promise<Array>} Saved articles
 */
export const getUserSavedArticles = async (userId, allArticles) => {
  if (!userId || !Array.isArray(allArticles)) {
    return [];
  }

  try {
    const userInteractions = await getUserInteractions(userId);
    return allArticles.filter(article => 
      userInteractions.savedArticles.includes(article.id)
    );
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
  if (!userId || !articleId) {
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      readArticles: arrayUnion(articleId),
      'stats.articlesRead': increment(1),
      lastReadAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error marking article as read:', error);
    }
    return false;
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
