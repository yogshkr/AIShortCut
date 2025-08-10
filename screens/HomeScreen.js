// screens/HomeScreen.js (Updated for Article Detail Navigation)
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import Header from '../components/Header';
import NewsCard from '../components/NewsCard';
import BottomMenu from '../components/BottomMenu';
import { sampleNewsData } from '../data/newsData';
import { useTheme } from '../App';

const HomeScreen = ({ onNavigate, onArticleDetail }) => {
  const theme = useTheme();
  const [likedArticles, setLikedArticles] = useState({});
  const [savedArticles, setSavedArticles] = useState({});

  const handleLike = (articleId) => {
    setLikedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
    
    const isLiked = !likedArticles[articleId];
    Alert.alert(
      isLiked ? "❤️ Liked!" : "💔 Unliked",
      isLiked ? "Added to your liked articles" : "Removed from liked articles"
    );
  };

  const handleSave = (articleId) => {
    setSavedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
    
    const isSaved = !savedArticles[articleId];
    Alert.alert(
      isSaved ? "💾 Saved!" : "🗑️ Unsaved",
      isSaved ? "Article saved for later reading" : "Article removed from saved list"
    );
  };

  const handleShare = (article) => {
    Alert.alert(
      "📤 Share Article",
      `Sharing: "${article.headline}"\n\nThis will open your device's share menu with the article link.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Share", onPress: () => console.log("Sharing article:", article.headline) }
      ]
    );
  };

  // Updated to navigate to article detail instead of showing alert
  const handleReadMore = (article) => {
    onArticleDetail(article);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header currentScreen="Home" />
      
      <ScrollView 
        style={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sampleNewsData.map(article => (
          <NewsCard
            key={article.id}
            article={article}
            isLiked={likedArticles[article.id] || false}
            isSaved={savedArticles[article.id] || false}
            onLike={handleLike}
            onSave={handleSave}
            onShare={handleShare}
            onReadMore={handleReadMore}
          />
        ))}
        
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
