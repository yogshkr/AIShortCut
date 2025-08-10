// components/FullScreenNewsCard.js (Instagram Reels Style)
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../App';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FullScreenNewsCard = ({ 
  article, 
  isLiked, 
  isSaved, 
  onLike, 
  onSave, 
  onShare, 
  onReadMore 
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Background Image with Overlay */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: article.imageUrl }} style={styles.backgroundImage} />
        <View style={[styles.imageOverlay, { 
          backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)' 
        }]} />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Top Section - Topics */}
        <View style={styles.topSection}>
          <View style={styles.topicsContainer}>
            {article.topics.slice(0, 2).map((topic, index) => (
              <View 
                key={index} 
                style={[styles.topicTag, { 
                  backgroundColor: theme.colors.primaryButton 
                }]}
              >
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Section - Main Content */}
        <View style={styles.bottomSection}>
          {/* Article Content */}
          <View style={styles.articleContent}>
            <Text style={[styles.headline, { color: theme.colors.headerText }]}>
              {article.headline}
            </Text>
            
            <Text style={[styles.summary, { color: theme.colors.headerSubtext }]}>
              {article.summary}
            </Text>
            
            <View style={styles.metaInfo}>
              <Text style={[styles.author, { color: theme.colors.headerSubtext }]}>
                By {article.author}
              </Text>
              <Text style={[styles.readTime, { color: theme.colors.headerSubtext }]}>
                • {article.readTime} • {article.publishDate}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, isLiked && styles.likedButton]} 
              onPress={() => onLike(article.id)}
            >
              <Text style={styles.actionIcon}>
                {isLiked ? '❤️' : '🤍'}
              </Text>
              <Text style={[styles.actionText, { color: theme.colors.headerText }]}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, isSaved && styles.savedButton]} 
              onPress={() => onSave(article.id)}
            >
              <Text style={styles.actionIcon}>
                {isSaved ? '💾' : '🔖'}
              </Text>
              <Text style={[styles.actionText, { color: theme.colors.headerText }]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onShare(article)}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={[styles.actionText, { color: theme.colors.headerText }]}>
                Share
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.readMoreButton, { backgroundColor: theme.colors.primaryButton }]} 
              onPress={() => onReadMore(article)}
            >
              <Text style={styles.readMoreText}>Read Full Article</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight - 100, // Account for header space
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'flex-start',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  topicText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  articleContent: {
    marginBottom: 30,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  readTime: {
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  likedButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    borderColor: 'rgba(220, 38, 38, 0.9)',
  },
  savedButton: {
    backgroundColor: 'rgba(22, 163, 74, 0.8)',
    borderColor: 'rgba(22, 163, 74, 0.9)',
  },
  actionIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  readMoreButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginLeft: 10,
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default FullScreenNewsCard;
