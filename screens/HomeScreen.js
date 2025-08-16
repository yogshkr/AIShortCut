// screens/HomeScreen.js (Updated for Article Detail Navigation)
import React, { useState, useEffect, useCallback  } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, RefreshControl  } from 'react-native';
import Header from '../components/Header';
import NewsCard from '../components/NewsCard';
import BottomMenu from '../components/BottomMenu';
import { useTheme } from '../App';
// Add these imports
import { subscribeToArticles, getUserInteractions, updateUserInteraction } from '../firebase/firebaseService';

const HomeScreen = ({ onNavigate, onArticleDetail, currentUser, onLogout }) => {
  const theme = useTheme();
// Replace the existing state with:
const [articles, setArticles] = useState([]);
const [likedArticles, setLikedArticles] = useState([]);
const [savedArticles, setSavedArticles] = useState([]);
const [loading, setLoading] = useState(true);

// Add useEffect to fetch data
useEffect(() => {
  if (currentUser) {
    loadData();
  }
}, [currentUser]);

const loadData = async () => {
  try {
    setLoading(true);
    
    // Fetch articles and user interactions simultaneously
    const [articlesData, userInteractions] = await Promise.all([
      subscribeToArticles(),
      getUserInteractions(currentUser.uid)
    ]);
    
    setArticles(articlesData);
    setLikedArticles(userInteractions.likedArticles);
    setSavedArticles(userInteractions.savedArticles);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    setLoading(false);
  }
};

// Add this state with your existing useState hooks
const [refreshing, setRefreshing] = useState(false);

// Add this refresh function
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  try {
    // Reload articles data
    const freshArticles = await subscribeToArticles();
    setArticles(freshArticles);
    
    // Reload user interactions if needed
    if (currentUser) {
      const userInteractions = await getUserInteractions(currentUser.uid);
      setLikedArticles(userInteractions.likedArticles || {});
      // setSavedArticlesList(userInteractions.savedArticles || {});
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    setRefreshing(false);
  }
}, [currentUser]);


// Replace handleLike function:
const handleLike = async (articleId) => {
  const isCurrentlyLiked = likedArticles.includes(articleId);
  const newLikedState = !isCurrentlyLiked;
  
  // Optimistic update
  if (newLikedState) {
    setLikedArticles(prev => [...prev, articleId]);
  } else {
    setLikedArticles(prev => prev.filter(id => id !== articleId));
  }
  
  // Update in Firebase
  const success = await updateUserInteraction(
    currentUser.uid, 
    articleId, 
    'like', 
    newLikedState
  );
  
  if (success) {
    // Alert.alert(
    //   newLikedState ? "❤️ Liked!" : "💔 Unliked",
    //   newLikedState ? "Added to your liked articles" : "Removed from liked articles"
    // );
  } else {
    // Revert optimistic update on failure
    if (newLikedState) {
      setLikedArticles(prev => prev.filter(id => id !== articleId));
    } else {
      setLikedArticles(prev => [...prev, articleId]);
    }
    Alert.alert("Error", "Failed to update. Please try again.");
  }
};

// Replace handleSave function:
const handleSave = async (articleId) => {
  const isCurrentlySaved = savedArticles.includes(articleId);
  const newSavedState = !isCurrentlySaved;
  
  // Optimistic update
  if (newSavedState) {
    setSavedArticles(prev => [...prev, articleId]);
  } else {
    setSavedArticles(prev => prev.filter(id => id !== articleId));
  }
  
  // Update in Firebase
  const success = await updateUserInteraction(
    currentUser.uid, 
    articleId, 
    'save', 
    newSavedState
  );
  
  if (success) {
    // Alert.alert(
    //   newSavedState ? "💾 Saved!" : "🗑️ Unsaved",
    //   newSavedState ? "Article saved for later reading" : "Article removed from saved list"
    // );
  } else {
    // Revert optimistic update on failure
    if (newSavedState) {
      setSavedArticles(prev => prev.filter(id => id !== articleId));
    } else {
      setSavedArticles(prev => [...prev, articleId]);
    }
    Alert.alert("Error", "Failed to update. Please try again.");
  }
};

  const handleShare = (article) => {
    Alert.alert(
      "📤 Share Article",
      `!!Feature comin soon!!`,
// Sharing: "${article.headline}"\n\nThis will open your device's share menu with the article link.
      [
        { text: "Cancel", style: "cancel" },
        { text: "Back", onPress: () => console.log("Sharing article:", article.headline) }
      ]
    );
  };

  // Updated to navigate to article detail instead of showing alert
  const handleReadMore = (article) => {
    onArticleDetail(article);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header currentScreen="Home" 
      currentUser={currentUser}
        onLogout={onLogout}
        />
      
      <ScrollView 
        style={styles.contentContainer} 
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
  <View style={styles.loadingContainer}>
    <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
      Loading AI news...
    </Text>
  </View>
) : articles.length > 0 ? (
  articles.map(article => (
    <NewsCard
      key={article.id}
      article={article}
      isLiked={likedArticles.includes(article.id)}
      isSaved={savedArticles.includes(article.id)}
      onLike={handleLike}
      onSave={handleSave}
      onShare={handleShare}
      onReadMore={handleReadMore}
    />
  ))
) : (
  <View style={styles.emptyContainer}>
    <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
      No articles available
    </Text>
  </View>
)}

        
        <View style={styles.endMessage}>
          <Text style={[styles.endText, { color: theme.colors.accentText }]}>
            🚀 You're all caught up!
          </Text>
          <Text style={[styles.endSubtext, { color: theme.colors.secondaryText }]}>
            Check back later for more AI news
          </Text>
        </View>
      </ScrollView>
      
      <BottomMenu 
        activeScreen="Home" 
        onNavigate={onNavigate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },
  endText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  endSubtext: {
    fontSize: 14,
  },
});

export default HomeScreen;
