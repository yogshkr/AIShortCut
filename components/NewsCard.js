import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../App';

const NewsCard = React.memo(({ 
  article, 
  isLiked, 
  isSaved, 
  onLike, 
  onSave, 
  onShare, 
  onReadMore 
}) => {
  const theme = useTheme();

  // Memoized event handlers
  const handleReadMore = useCallback(() => {
    onReadMore(article);
  }, [onReadMore, article]);

  const handleLike = useCallback(() => {
    onLike(article.id);
  }, [onLike, article.id]);

  const handleSave = useCallback(() => {
    onSave(article.id);
  }, [onSave, article.id]);

  const handleShare = useCallback(() => {
    onShare(article);
  }, [onShare, article]);

  // Memoized dynamic styles
  const newsCardStyle = useMemo(() => [
    styles.newsCard,
    {
      backgroundColor: theme.colors.cardBackground,
      shadowColor: theme.isDark ? '#000' : '#000',
    }
  ], [theme.colors.cardBackground, theme.isDark]);

  const headlineStyle = useMemo(() => [
    styles.cardHeadline,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const authorStyle = useMemo(() => [
    styles.author,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const readTimeStyle = useMemo(() => [
    styles.readTime,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const publishDateStyle = useMemo(() => [
    styles.publishDate,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  // Memoized action button styles
  const likeButtonStyle = useMemo(() => [
    styles.smallActionButton,
    { backgroundColor: theme.colors.buttonBackground },
    isLiked && { backgroundColor: theme.colors.likedBackground }
  ], [theme.colors.buttonBackground, theme.colors.likedBackground, isLiked]);

  const saveButtonStyle = useMemo(() => [
    styles.smallActionButton,
    { backgroundColor: theme.colors.buttonBackground },
    isSaved && { backgroundColor: theme.colors.savedBackground }
  ], [theme.colors.buttonBackground, theme.colors.savedBackground, isSaved]);

  const shareButtonStyle = useMemo(() => [
    styles.smallActionButton,
    { backgroundColor: theme.colors.buttonBackground }
  ], [theme.colors.buttonBackground]);

  const likeTextStyle = useMemo(() => [
    styles.smallActionText,
    { color: theme.colors.buttonText },
    isLiked && { color: theme.colors.liked }
  ], [theme.colors.buttonText, theme.colors.liked, isLiked]);

  const saveTextStyle = useMemo(() => [
    styles.smallActionText,
    { color: theme.colors.buttonText },
    isSaved && { color: theme.colors.saved }
  ], [theme.colors.buttonText, theme.colors.saved, isSaved]);

  const shareTextStyle = useMemo(() => [
    styles.smallActionText,
    { color: theme.colors.buttonText }
  ], [theme.colors.buttonText]);

  const readMoreButtonStyle = useMemo(() => [
    styles.readMoreButton,
    { backgroundColor: theme.colors.primaryButton }
  ], [theme.colors.primaryButton]);

  return (
    <TouchableOpacity 
      style={newsCardStyle}
      onPress={handleReadMore}
      activeOpacity={1}
    >
      <Image 
        source={{ uri: article.imageUrl }} 
        style={styles.cardImage}
        resizeMode="cover"
      />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={headlineStyle} numberOfLines={2}>
            {article.headline}
          </Text>
          <View style={styles.metaInfo}>
            <Text style={authorStyle}>
              {article.author}
            </Text>
            <Text style={readTimeStyle}>
              • {article.readTime} min read
            </Text>
            <Text style={publishDateStyle}>
              • {article.publishDate}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <View style={styles.smallButtonsRow}>
            <TouchableOpacity 
              style={likeButtonStyle}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>
                {isLiked ? '❤️' : '🤍'}
              </Text>
              <Text style={likeTextStyle}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={saveButtonStyle}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>
                {isSaved ? '💾' : '🔖'}
              </Text>
              <Text style={saveTextStyle}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={shareButtonStyle}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={shareTextStyle}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={readMoreButtonStyle}
            onPress={handleReadMore}
            activeOpacity={0.8}
          >
            <Text style={styles.readMoreText}>Get ShortCut →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

NewsCard.displayName = 'NewsCard';

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
