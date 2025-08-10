// screens/SavedScreen.js (Complete Article Detail Navigation)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import BottomMenu from '../components/BottomMenu';
import NewsCard from '../components/NewsCard';
import { useTheme } from '../App';

const SavedScreen = ({ onNavigate, onArticleDetail }) => {
  const theme = useTheme();

  // Sample saved articles (in a real app, this would come from storage/Firebase)
  const [savedArticles] = useState([
    {
      id: 2,
      headline: "Google's Gemini Ultra Outperforms Human Experts",
      summary: "Google's newest AI model demonstrates superior performance in professional examinations, marking a significant milestone in artificial intelligence development.",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
      topics: ["Google", "AI Research", "Performance"],
      publishDate: "2024-01-14",
      author: "AI ShortCut Team", 
      readTime: "3 min read",
    },
    {
      id: 4,
      headline: "Autonomous AI Agents Transform Business Operations", 
      summary: "Companies worldwide are deploying AI agents that can independently handle customer service, data analysis, and decision-making processes.",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop",
      topics: ["Business", "Automation", "AI Agents"],
      publishDate: "2024-01-12",
      author: "AI ShortCut Team",
      readTime: "3 min read",
    }
  ]);

  const [likedArticles, setLikedArticles] = useState({2: true, 4: false});
  const [savedArticlesList, setSavedArticlesList] = useState({2: true, 4: true});

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

  const handleUnsave = (articleId) => {
    setSavedArticlesList(prev => ({
      ...prev,
      [articleId]: false
    }));
    
    Alert.alert(
      "🗑️ Removed from Saved",
      "Article removed from your saved list",
      [
        { text: "Undo", onPress: () => setSavedArticlesList(prev => ({...prev, [articleId]: true})) },
        { text: "OK", style: "default" }
      ]
    );
  };

  const handleShare = (article) => {
    Alert.alert(
      "📤 Share Saved Article",
      `Sharing: "${article.headline}"\n\nThis will open your device's share menu with the article link.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Share", onPress: () => console.log("Sharing saved article:", article.headline) }
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
          onPress: () => setSavedArticlesList({})
        }
      ]
    );
  };

  // Filter articles that are still saved
  const currentSavedArticles = savedArticles.filter(article => savedArticlesList[article.id]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header currentScreen="Saved" />
      
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
      >
        {currentSavedArticles.length > 0 ? (
          <>
            {currentSavedArticles.map(article => (
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
            ))}
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
