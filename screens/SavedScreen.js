// screens/SavedScreen.js (Complete Article Detail Navigation)
import React, { useState, useEffect, useCallback  } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl  } from 'react-native';
import Header from '../components/Header';
import BottomMenu from '../components/BottomMenu';
import NewsCard from '../components/NewsCard';
import { useTheme } from '../App';
import { subscribeToArticles, getUserInteractions } from '../firebase/firebaseService'; // Make sure these are exported
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Adjust path if needed
import { updateUserInteraction } from '../firebase/firebaseService'; // Add this import

const SavedScreen = ({ onNavigate, onArticleDetail, currentUser, onLogout }) => {
  const theme = useTheme();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedArticles, setLikedArticles] = useState({});
  const [savedArticlesList, setSavedArticlesList] = useState({});

useEffect(() => {
  const loadSavedArticles = async () => {
    setLoading(true);
    try {
      // Fetch all articles and user interactions
      const [allArticles, userInteractions] = await Promise.all([
        subscribeToArticles(),
        getUserInteractions(currentUser.uid)
      ]);

      // REMOVED OLD NORMALIZATION - subscribeToArticles now handles this properly
      console.log('✅ Loaded articles:', allArticles?.length || 0);
      console.log('✅ User interactions:', userInteractions);

      // Ensure we have valid arrays
      const articles = Array.isArray(allArticles) ? allArticles : [];
      const savedIds = Array.isArray(userInteractions?.savedArticles) ? userInteractions.savedArticles : [];
      const likedIds = Array.isArray(userInteractions?.likedArticles) ? userInteractions.likedArticles : [];

      // Filter saved articles
      const savedArticles = articles.filter(article => 
        article && article.id && savedIds.includes(article.id)
      );
      
      console.log('✅ Filtered saved articles:', savedArticles.length);
      setArticles(savedArticles);

      // Set saved/liked status for UI
      const savedMap = {};
      savedIds.forEach(id => { savedMap[id] = true; });
      setSavedArticlesList(savedMap);

      const likedMap = {};
      likedIds.forEach(id => { likedMap[id] = true; });
      setLikedArticles(likedMap);

    } catch (error) {
      console.error('❌ Error loading saved articles:', error);
      // Set safe defaults on error
      setArticles([]);
      setSavedArticlesList({});
      setLikedArticles({});
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    loadSavedArticles();
  }
}, [currentUser]);

// Add this state with your existing useState hooks
const [refreshing, setRefreshing] = useState(false);

// Add this refresh function
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  try {
    // Reload saved articles
    const [allArticles, userInteractions] = await Promise.all([
      subscribeToArticles(),
      getUserInteractions(currentUser.uid)
    ]);

    const articles = Array.isArray(allArticles) ? allArticles : [];
    const savedIds = Array.isArray(userInteractions?.savedArticles) ? userInteractions.savedArticles : [];
    const likedIds = Array.isArray(userInteractions?.likedArticles) ? userInteractions.likedArticles : [];

    const savedArticles = articles.filter(article => 
      article && article.id && savedIds.includes(article.id)
    );
    
    setArticles(savedArticles);

    // Update UI states
    const savedMap = {};
    savedIds.forEach(id => { savedMap[id] = true; });
    setSavedArticlesList(savedMap);

    const likedMap = {};
    likedIds.forEach(id => { likedMap[id] = true; });
    setLikedArticles(likedMap);

  } catch (error) {
    console.error('Error refreshing saved articles:', error);
  } finally {
    setRefreshing(false);
  }
}, [currentUser]);


const handleLike = async (articleId) => {
  const isLiked = !likedArticles[articleId];
  setLikedArticles(prev => ({
    ...prev,
    [articleId]: isLiked
  }));

  // Update Firestore
  try {
    await updateUserInteraction(currentUser.uid, articleId, 'like', isLiked);
  } catch (error) {
    console.error('Error updating like status in Firestore:', error);
  }

  Alert.alert(
    isLiked ? "❤️ Liked!" : "💔 Unliked",
    isLiked ? "Added to your liked articles" : "Removed from liked articles"
  );
};

const handleUnsave = async (articleId) => {
  setSavedArticlesList(prev => ({
    ...prev,
    [articleId]: false
  }));

  // Update Firestore: remove article from savedArticles
  try {
    await updateUserInteraction(currentUser.uid, articleId, 'save', false);
  } catch (error) {
    console.error('Error updating saved status in Firestore:', error);
  }

  Alert.alert(
    "🗑️ Removed from Saved",
    "Article removed from your saved list",
    [
      { text: "Undo", onPress: async () => {
        setSavedArticlesList(prev => ({ ...prev, [articleId]: true }));
        // Update Firestore: add article back to savedArticles
        try {
          await updateUserInteraction(currentUser.uid, articleId, 'save', true);
        } catch (error) {
          console.error('Error restoring saved status in Firestore:', error);
        }
      }},
      { text: "OK", style: "default" }
    ]
  );
};
// 
// Sharing: "${article.headline}"\n\nThis will open your device's share menu with the article link.
  const handleShare = (article) => {
    Alert.alert(
      "📤 Share Saved Article",
      `!!Featue comin soon!!`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Back", onPress: () => console.log("Sharing saved article:", article.headline) }
      ]
    );
  };

  // FIXED: Navigate to article detail for saved articles
  const handleReadMore = (article) => {
    console.log("SavedScreen: Attempting to open article detail for:", article.headline);
    
    if (onArticleDetail) {
      console.log("SavedScreen: onArticleDetail function exists, calling it");
      onArticleDetail(article);
    } else {
      console.log("SavedScreen: onArticleDetail function is undefined!");
      Alert.alert(
        "Error", 
        "Article detail navigation not available. Please check the app configuration."
      );
    }
  };

  const clearAllSaved = () => {
  Alert.alert(
    "🗑️ Clear All Saved",
    "Are you sure you want to remove all saved articles?",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Clear All", 
        style: "destructive",
        onPress: async () => {
          setSavedArticlesList({});
          // Remove all saved articles in Firestore
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { savedArticles: [] });
          } catch (error) {
            console.error('Error clearing saved articles in Firestore:', error);
          }
        }
      }
    ]
  );
};

  // Filter articles that are still saved
// Filter articles that are still saved - WITH SAFE ARRAY HANDLING
const currentSavedArticles = Array.isArray(articles) ? 
  articles.filter(article => article && savedArticlesList[article.id]) : [];


  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
      currentScreen="Saved"
      currentUser={currentUser}
        onLogout={onLogout}
         />
      
      <View style={[styles.headerActions, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.savedCount, { color: theme.colors.accentText }]}>
          💾 {currentSavedArticles.length} Saved Articles
        </Text>
        {currentSavedArticles.length > 0 && (
          <TouchableOpacity 
            onPress={clearAllSaved} 
            style={[styles.clearButton, { backgroundColor: theme.colors.likedBackground }]}
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.liked }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.primaryButton} // iOS
      colors={[theme.colors.primaryButton]} // Android
    />
  }
      >
           {loading ? (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>⏳</Text>
    <Text style={[styles.emptyTitle, { color: theme.colors.primaryText }]}>Loading...</Text>
  </View>
) : currentSavedArticles.length > 0 ? (
  <>
    {currentSavedArticles.map(article => {
      // Add safety check for each article
      if (!article || !article.id) {
        console.warn('⚠️ Invalid article data:', article);
        return null;
      }
      
      return (
        <NewsCard
          key={article.id}
          article={article}
          isLiked={likedArticles[article.id] || false}
          isSaved={savedArticlesList[article.id] || false}
          onLike={handleLike}
          onSave={handleUnsave}
          onShare={handleShare}
          onReadMore={handleReadMore}
        />
      );
    })}
  </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.primaryText }]}>No Saved Articles</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.secondaryText }]}>
              Articles you save will appear here for easy access later
            </Text>
            <TouchableOpacity 
              style={[styles.browseButton, { backgroundColor: theme.colors.primaryButton }]}
              onPress={() => onNavigate('Home')}
            >
              <Text style={styles.browseButtonText}>Browse AI News →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      <BottomMenu 
        activeScreen="Saved" 
        onNavigate={onNavigate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savedCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SavedScreen;
