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

// Fetch articles from Firestore
// Fetch articles from Firestore (UPDATED VERSION)
export const subscribeToArticles = async () => {
  try {
    const q = query(collection(db, 'articles'));
    const querySnapshot = await getDocs(q);
    const articles = [];
    
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      let articleData;
      const dataKeys = Object.keys(docData);
      
      // Handle nested JSON structure (from previous incorrect storage)
      if (dataKeys.length === 1 && dataKeys[0].startsWith('{')) {
        try {
          articleData = JSON.parse(dataKeys[0]);
          console.log('📄 Parsed nested data:', articleData);
        } catch (parseError) {
          console.error('Error parsing nested data:', parseError);
          articleData = docData;
        }
      } else {
        articleData = docData;
      }
      
      // Ensure all required fields exist and are in correct format
      const processedArticle = {
        id: doc.id,
        headline: articleData.headline || 'Untitled Article',
        summary: articleData.summary || 'No summary available',
        content: articleData.content || articleData.summary || 'No content available', // Rich HTML content
        author: articleData.author || 'Unknown Author',
        publishDate: articleData.publishDate || new Date().toLocaleDateString(),
        readTime: articleData.readTime || '5 min read',
        imageUrl: articleData.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        topics: Array.isArray(articleData.topics) ? articleData.topics : 
                (typeof articleData.topics === 'string' ? [articleData.topics] : 
                ['AI', 'Technology']), // Ensure topics is always an array
        createdAt: articleData.createdAt || new Date(),
        updatedAt: articleData.updatedAt || new Date()
      };
      
      articles.push(processedArticle);
    });
    
    console.log(`✅ Processed ${articles.length} articles successfully`);
    return articles;
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    return [];
  }
};


// Get user interactions (likes, saves)
export const getUserInteractions = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        likedArticles: userData.likedArticles || [],
        savedArticles: userData.savedArticles || []
      };
    }
    return { likedArticles: [], savedArticles: [] };
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return { likedArticles: [], savedArticles: [] };
  }
};

// Update user interactions
export const updateUserInteraction = async (userId, articleId, action, isAdd) => {
  try {
    const userRef = doc(db, 'users', userId);
    const field = action === 'like' ? 'likedArticles' : 'savedArticles';
    
    await updateDoc(userRef, {
      [field]: isAdd ? arrayUnion(articleId) : arrayRemove(articleId)
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user interaction:', error);
    return false;
  }
};

// Get articles that user has saved
export const getUserSavedArticles = async (userId, allArticles) => {
  try {
    const userInteractions = await getUserInteractions(userId);
    return allArticles.filter(article => 
      userInteractions.savedArticles.includes(article.id)
    );
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return [];
  }
};

// Add after your existing functions
export const markArticleAsRead = async (userId, articleId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Add to readArticles array and update reading stats
    await updateDoc(userRef, {
      readArticles: arrayUnion(articleId),
      'stats.articlesRead': increment(1),
      lastReadAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error marking article as read:', error);
    return false;
  }
};

// Optional: Track reading progress
export const updateReadingProgress = async (userId, articleId, progressPercent) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      [`readingProgress.${articleId}`]: {
        progress: progressPercent,
        lastUpdated: serverTimestamp()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return false;
  }
};

// Get user's reading history
export const getUserReadingHistory = async (userId, allArticles) => {
  try {
    const userInteractions = await getUserInteractions(userId);
    return allArticles.filter(article => 
      userInteractions.readArticles?.includes(article.id)
    );
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return [];
  }
};
