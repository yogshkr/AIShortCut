import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import Header from '../components/Header';
import BottomMenu from '../components/BottomMenu';
import NewsCard from '../components/NewsCard';
import { useTheme } from '../App';
import { subscribeToArticles, getUserInteractions, updateUserInteraction } from '../firebase/firebaseService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const SavedScreen = React.memo(({ onNavigate, onArticleDetail, currentUser, onLogout }) => {
  const theme = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedArticles, setLikedArticles] = useState({});
  const [savedArticlesList, setSavedArticlesList] = useState({});

  // Memoized load saved articles function
  const loadSavedArticles = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
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

      const savedMap = {};
      savedIds.forEach(id => { savedMap[id] = true; });
      setSavedArticlesList(savedMap);

      const likedMap = {};
      likedIds.forEach(id => { likedMap[id] = true; });
      setLikedArticles(likedMap);

    } catch (error) {
      if (__DEV__) {
        console.error('Error loading saved articles:', error);
      }
      setArticles([]);
      setSavedArticlesList({});
      setLikedArticles({});
      Alert.alert('Error', 'Failed to load saved articles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load saved articles when user changes
  useEffect(() => {
    if (currentUser) {
      loadSavedArticles();
    }
  }, [currentUser, loadSavedArticles]);

  // Memoized refresh function
  const onRefresh = useCallback(async () => {
    if (!currentUser) return;
    
    setRefreshing(true);
    try {
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

      const savedMap = {};
      savedIds.forEach(id => { savedMap[id] = true; });
      setSavedArticlesList(savedMap);

      const likedMap = {};
      likedIds.forEach(id => { likedMap[id] = true; });
      setLikedArticles(likedMap);

    } catch (error) {
      if (__DEV__) {
        console.error('Error refreshing saved articles:', error);
      }
    } finally {
      setRefreshing(false);
    }
  }, [currentUser]);

  // Memoized like handler
  const handleLike = useCallback(async (articleId) => {
    const isLiked = !likedArticles[articleId];
    setLikedArticles(prev => ({
      ...prev,
      [articleId]: isLiked
    }));

    try {
      await updateUserInteraction(currentUser.uid, articleId, 'like', isLiked);
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating like status:', error);
      }
      // Revert on error
      setLikedArticles(prev => ({
        ...prev,
        [articleId]: !isLiked
      }));
    }
  }, [likedArticles, currentUser]);

  // Memoized unsave handler
  const handleUnsave = useCallback(async (articleId) => {
    setSavedArticlesList(prev => ({
      ...prev,
      [articleId]: false
    }));

    try {
      await updateUserInteraction(currentUser.uid, articleId, 'save', false);
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating saved status:', error);
      }
      // Revert on error
      setSavedArticlesList(prev => ({
        ...prev,
        [articleId]: true
      }));
    }
  }, [currentUser]);

  // Memoized share handler
  const handleShare = useCallback(() => {
    Alert.alert(
      "📤 Share Article",
      "Feature coming soon!",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", style: "default" }
      ]
    );
  }, []);

  // Memoized read more handler
  const handleReadMore = useCallback((article) => {
    if (onArticleDetail) {
      onArticleDetail(article);
    } else {
      Alert.alert(
        "Error", 
        "Article detail navigation not available. Please check the app configuration."
      );
    }
  }, [onArticleDetail]);

  // Memoized clear all saved handler
  const clearAllSaved = useCallback(() => {
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
            try {
              const userRef = doc(db, 'users', currentUser.uid);
              await updateDoc(userRef, { savedArticles: [] });
            } catch (error) {
              if (__DEV__) {
                console.error('Error clearing saved articles:', error);
              }
              Alert.alert('Error', 'Failed to clear saved articles. Please try again.');
            }
          }
        }
      ]
    );
  }, [currentUser]);

  // Memoized browse articles handler
  const handleBrowseArticles = useCallback(() => {
    onNavigate('Home');
  }, [onNavigate]);

  // Memoized filtered articles
  const currentSavedArticles = useMemo(() => {
    return Array.isArray(articles) ? 
      articles.filter(article => article && savedArticlesList[article.id]) : [];
  }, [articles, savedArticlesList]);

  // Memoized dynamic styles
  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const headerActionsStyle = useMemo(() => [
    styles.headerActions,
    { backgroundColor: theme.colors.cardBackground }
  ], [theme.colors.cardBackground]);

  const savedCountStyle = useMemo(() => [
    styles.savedCount,
    { color: theme.colors.accentText }
  ], [theme.colors.accentText]);

  const clearButtonStyle = useMemo(() => [
    styles.clearButton,
    { backgroundColor: theme.colors.likedBackground }
  ], [theme.colors.likedBackground]);

  const clearButtonTextStyle = useMemo(() => [
    styles.clearButtonText,
    { color: theme.colors.liked }
  ], [theme.colors.liked]);

  const emptyTitleStyle = useMemo(() => [
    styles.emptyTitle,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const emptySubtitleStyle = useMemo(() => [
    styles.emptySubtitle,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const browseButtonStyle = useMemo(() => [
    styles.browseButton,
    { backgroundColor: theme.colors.primaryButton }
  ], [theme.colors.primaryButton]);

  // Memoized refresh control
  const refreshControl = useMemo(() => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.primaryButton}
      colors={[theme.colors.primaryButton]}
    />
  ), [refreshing, onRefresh, theme.colors.primaryButton]);

  return (
    <View style={containerStyle}>
      <Header 
        currentScreen="Saved"
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
      <View style={headerActionsStyle}>
        <Text style={savedCountStyle}>
          💾 {currentSavedArticles.length} Saved Articles
        </Text>
        {currentSavedArticles.length > 0 && (
          <TouchableOpacity 
            onPress={clearAllSaved} 
            style={clearButtonStyle}
            activeOpacity={0.7}
          >
            <Text style={clearButtonTextStyle}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={refreshControl}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⏳</Text>
            <Text style={emptyTitleStyle}>Loading...</Text>
            <Text style={emptySubtitleStyle}>Fetching your saved articles</Text>
          </View>
        ) : currentSavedArticles.length > 0 ? (
          currentSavedArticles.map(article => {
            if (!article || !article.id) {
              if (__DEV__) {
                console.warn('Invalid article data:', article);
              }
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
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={emptyTitleStyle}>No Saved Articles</Text>
            <Text style={emptySubtitleStyle}>
              Articles you save will appear here for easy access later
            </Text>
            <TouchableOpacity 
              style={browseButtonStyle}
              onPress={handleBrowseArticles}
              activeOpacity={0.8}
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
});

SavedScreen.displayName = 'SavedScreen';

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
    flexGrow: 1,
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
