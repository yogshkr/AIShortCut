// components/NewsCard.js (Dark Mode Support)
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../App';

const NewsCard = ({ 
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
    <TouchableOpacity 
      style={[styles.newsCard, { 
        backgroundColor: theme.colors.cardBackground,
        shadowColor: theme.isDark ? '#000' : '#000',
      }]} 
      onPress={() => onReadMore(article)}
      activeOpacity={1}
    >
      <Image source={{ uri: article.imageUrl }} style={styles.cardImage} />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardHeadline, { color: theme.colors.primaryText }]}>
            {article.headline}
          </Text>
          <View style={styles.metaInfo}>
            <Text style={[styles.author, { color: theme.colors.secondaryText }]}>
              {article.author}
            </Text>
            <Text style={[styles.readTime, { color: theme.colors.secondaryText }]}>
              • {article.readTime}
            </Text>
            <Text style={[styles.publishDate, { color: theme.colors.secondaryText }]}>
              • {article.publishDate}
            </Text>
          </View>
        </View>
        
        {/* <Text 
          style={[styles.cardSummary, { color: theme.colors.secondaryText }]} 
          numberOfLines={3}
        >
          {article.summary}
        </Text> */}
        
        {/* <View style={styles.topicsContainer}>
          {article.topics.map((topic, index) => (
            <View 
              key={index} 
              style={[styles.topicTag, { 
                backgroundColor: theme.isDark ? '#1e40af' : '#dbeafe' 
              }]}
            >
              <Text style={[styles.topicText, { 
                color: theme.isDark ? '#bfdbfe' : '#2563eb' 
              }]}>
                {topic}
              </Text>
            </View>
          ))}
        </View> */}
        
        <View style={styles.cardActions}>
          <View style={styles.smallButtonsRow}>
            <TouchableOpacity 
              style={[
                styles.smallActionButton, 
                { backgroundColor: theme.colors.buttonBackground },
                isLiked && { backgroundColor: theme.colors.likedBackground }
              ]} 
              onPress={() => onLike(article.id)}
            >
              <Text style={styles.actionIcon}>
                {isLiked ? '❤️' : '🤍'}
              </Text>
              <Text style={[
                styles.smallActionText, 
                { color: theme.colors.buttonText },
                isLiked && { color: theme.colors.liked }
              ]}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.smallActionButton, 
                { backgroundColor: theme.colors.buttonBackground },
                isSaved && { backgroundColor: theme.colors.savedBackground }
              ]} 
              onPress={() => onSave(article.id)}
            >
              <Text style={styles.actionIcon}>
                {isSaved ? '💾' : '🔖'}
              </Text>
              <Text style={[
                styles.smallActionText, 
                { color: theme.colors.buttonText },
                isSaved && { color: theme.colors.saved }
              ]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.smallActionButton, { backgroundColor: theme.colors.buttonBackground }]} 
              onPress={() => onShare(article)}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={[styles.smallActionText, { color: theme.colors.buttonText }]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.readMoreButton, { backgroundColor: theme.colors.primaryButton }]} 
            onPress={() => onReadMore(article)}
          >
            <Text style={styles.readMoreText}>Get ShortCut →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Keep all the same styles from before
const styles = StyleSheet.create({
  newsCard: {
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardHeadline: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  author: {
    fontSize: 12,
    fontWeight: '600',
  },
  readTime: {
    fontSize: 12,
  },
  publishDate: {
    fontSize: 12,
  },
  cardSummary: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  topicTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  topicText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    gap: 12,
  },
  smallButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  smallActionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 40,
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  readMoreButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default NewsCard;
