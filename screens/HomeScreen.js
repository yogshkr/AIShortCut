import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, RefreshControl } from 'react-native';
import Header from '../components/Header';
import NewsCard from '../components/NewsCard';
import BottomMenu from '../components/BottomMenu';
import { useTheme } from '../App';
import { subscribeToArticles, getUserInteractions, updateUserInteraction } from '../firebase/firebaseService';

const HomeScreen = React.memo(({ onNavigate, onArticleDetail, currentUser, onLogout }) => {
  const theme = useTheme();
  const [articles, setArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized data loading function
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const [articlesData, userInteractions] = await Promise.all([
        subscribeToArticles(),
        getUserInteractions(currentUser.uid)
      ]);
      
      setArticles(articlesData || []);
      setLikedArticles(userInteractions.likedArticles || []);
      setSavedArticles(userInteractions.savedArticles || []);
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading data:', error);
      }
      Alert.alert('Error', 'Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load data when user changes
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  // Memoized refresh function
  const onRefresh = useCallback(async () => {
    if (!currentUser) return;
    
    setRefreshing(true);
    try {
      const [freshArticles, userInteractions] = await Promise.all([
        subscribeToArticles(),
        getUserInteractions(currentUser.uid)
      ]);
      
      setArticles(freshArticles || []);
      setLikedArticles(userInteractions.likedArticles || []);
      setSavedArticles(userInteractions.savedArticles || []);
    } catch (error) {
      if (__DEV__) {
        console.error('Error refreshing data:', error);
      }
    } finally {
      setRefreshing(false);
    }
  }, [currentUser]);

  // Memoized like handler
  const handleLike = useCallback(async (articleId) => {
    const isCurrentlyLiked = likedArticles.includes(articleId);
    const newLikedState = !isCurrentlyLiked;
    
    // Optimistic update
    if (newLikedState) {
      setLikedArticles(prev => [...prev, articleId]);
    } else {
      setLikedArticles(prev => prev.filter(id => id !== articleId));
    }
    
    try {
      const success = await updateUserInteraction(
        currentUser.uid, 
        articleId, 
        'like', 
        newLikedState
      );
      
      if (!success) {
        // Revert optimistic update on failure
        if (newLikedState) {
          setLikedArticles(prev => prev.filter(id => id !== articleId));
        } else {
          setLikedArticles(prev => [...prev, articleId]);
        }
        Alert.alert("Error", "Failed to update. Please try again.");
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating like:', error);
      }
      // Revert optimistic update
      if (newLikedState) {
        setLikedArticles(prev => prev.filter(id => id !== articleId));
      } else {
        setLikedArticles(prev => [...prev, articleId]);
      }
      Alert.alert("Error", "Failed to update. Please try again.");
    }
  }, [likedArticles, currentUser]);

  // Memoized save handler
  const handleSave = useCallback(async (articleId) => {
    const isCurrentlySaved = savedArticles.includes(articleId);
    const newSavedState = !isCurrentlySaved;
    
    // Optimistic update
    if (newSavedState) {
      setSavedArticles(prev => [...prev, articleId]);
    } else {
      setSavedArticles(prev => prev.filter(id => id !== articleId));
    }
    
    try {
      const success = await updateUserInteraction(
        currentUser.uid, 
        articleId, 
        'save', 
        newSavedState
      );
      
      if (!success) {
        // Revert optimistic update on failure
        if (newSavedState) {
          setSavedArticles(prev => prev.filter(id => id !== articleId));
        } else {
          setSavedArticles(prev => [...prev, articleId]);
        }
        Alert.alert("Error", "Failed to update. Please try again.");
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating save:', error);
      }
      // Revert optimistic update
      if (newSavedState) {
        setSavedArticles(prev => prev.filter(id => id !== articleId));
      } else {
        setSavedArticles(prev => [...prev, articleId]);
      }
      Alert.alert("Error", "Failed to update. Please try again.");
    }
  }, [savedArticles, currentUser]);

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
    onArticleDetail(article);
  }, [onArticleDetail]);

  // Memoized dynamic styles
  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const loadingTextStyle = useMemo(() => [
    styles.loadingText,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const emptyTextStyle = useMemo(() => [
    styles.emptyText,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const endTextStyle = useMemo(() => [
    styles.endText,
    { color: theme.colors.accentText }
  ], [theme.colors.accentText]);

  const endSubtextStyle = useMemo(() => [
    styles.endSubtext,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

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
        currentScreen="Home" 
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
      <ScrollView 
        style={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={refreshControl}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={loadingTextStyle}>
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
            <Text style={emptyTextStyle}>
              No articles available
            </Text>
            <Text style={[emptyTextStyle, styles.emptySubtext]}>
              Pull down to refresh or check back later
            </Text>
          </View>
        )}
        
        {articles.length > 0 && (
          <View style={styles.endMessage}>
            <Text style={endTextStyle}>
              🚀 You're all caught up!
            </Text>
            <Text style={endSubtextStyle}>
              Check back later for more AI news
            </Text>
          </View>
        )}
      </ScrollView>
      
      <BottomMenu 
        activeScreen="Home" 
        onNavigate={onNavigate}
      />
    </View>
  );
});

HomeScreen.displayName = 'HomeScreen';

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
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
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
