import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert,
  Dimensions 
} from 'react-native';
import { useTheme } from '../App';
import { 
  getUserInteractions,
  updateUserInteraction 
} from '../firebase/firebaseService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AIShortCut = React.memo(({ article, onBack, currentUser, onReadFullArticle }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets(); 
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setSaved] = useState(false);

  // Load user interactions and mark as read
  useEffect(() => {
    const loadUserInteractions = async () => {
      if (!currentUser || !article) return;
      
      try {
        const userInteractions = await getUserInteractions(currentUser.uid);
        setIsLiked(userInteractions.likedArticles?.includes(article.id) || false);
        setSaved(userInteractions.savedArticles?.includes(article.id) || false);
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading user interactions:', error);
        }
      }
    };

    loadUserInteractions();
  }, [currentUser, article]);

  // Memoized like handler
  const handleLike = useCallback(async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    try {
      await updateUserInteraction(currentUser.uid, article.id, 'like', newLikedState);
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating like status:', error);
      }
      // Revert on error
      setIsLiked(!newLikedState);
    }
  }, [isLiked, currentUser, article]);

  // Memoized save handler
  const handleSave = useCallback(async () => {
    const newSavedState = !isSaved;
    setSaved(newSavedState);
    
    try {
      await updateUserInteraction(currentUser.uid, article.id, 'save', newSavedState);
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating save status:', error);
      }
      // Revert on error
      setSaved(!newSavedState);
    }
  }, [isSaved, currentUser, article]);

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

  // Memoized read full article handler
  const handleReadFullArticle = useCallback(() => {
    if (onReadFullArticle) {
      onReadFullArticle(article);
    }
  }, [onReadFullArticle, article]);

  // Memoized dynamic styles
  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const headerStyle = useMemo(() => [
    styles.header,
    { backgroundColor: theme.colors.headerBackground }
  ], [theme.colors.headerBackground]);

  const headerTitleStyle = useMemo(() => [
    styles.headerTitle,
    { color: theme.colors.headerText }
  ], [theme.colors.headerText]);

  const headlineStyle = useMemo(() => [
    styles.headline,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const authorStyle = useMemo(() => [
    styles.author,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const metaDividerStyle = useMemo(() => [
    styles.metaDivider,
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

  const articleContentStyle = useMemo(() => [
    styles.articleContent,
    { backgroundColor: theme.colors.cardBackground }
  ], [theme.colors.cardBackground]);

  const sectionTitleStyle = useMemo(() => [
    styles.sectionTitle,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const contentTextStyle = useMemo(() => [
    styles.contentText,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const readFullArticleButtonStyle = useMemo(() => [
    styles.readFullArticleButton,
    { backgroundColor: theme.colors.primaryButton }
  ], [theme.colors.primaryButton]);

  const readingTimeHintStyle = useMemo(() => [
    styles.readingTimeHint,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const actionBarStyle = useMemo(() => [
    styles.actionBar,
    {
      backgroundColor: theme.colors.cardBackground,
      borderTopColor: theme.colors.border,
      paddingBottom: insets.bottom + 15,
    }
  ], [theme.colors.cardBackground, theme.colors.border, insets.bottom]);

  // Memoized action button styles
  const likeButtonStyle = useMemo(() => [
    styles.actionButton,
    { backgroundColor: theme.colors.buttonBackground },
    isLiked && { backgroundColor: theme.colors.likedBackground }
  ], [theme.colors.buttonBackground, theme.colors.likedBackground, isLiked]);

  const saveButtonStyle = useMemo(() => [
    styles.actionButton,
    { backgroundColor: theme.colors.buttonBackground },
    isSaved && { backgroundColor: theme.colors.savedBackground }
  ], [theme.colors.buttonBackground, theme.colors.savedBackground, isSaved]);

  const shareButtonActionStyle = useMemo(() => [
    styles.actionButton,
    { backgroundColor: theme.colors.buttonBackground }
  ], [theme.colors.buttonBackground]);

  const likeTextStyle = useMemo(() => [
    styles.actionText,
    { color: theme.colors.buttonText },
    isLiked && { color: theme.colors.liked }
  ], [theme.colors.buttonText, theme.colors.liked, isLiked]);

  const saveTextStyle = useMemo(() => [
    styles.actionText,
    { color: theme.colors.buttonText },
    isSaved && { color: theme.colors.saved }
  ], [theme.colors.buttonText, theme.colors.saved, isSaved]);

  const shareTextStyle = useMemo(() => [
    styles.actionText,
    { color: theme.colors.buttonText }
  ], [theme.colors.buttonText]);

  return (
    <View style={containerStyle}>
      <View style={headerStyle}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={headerTitleStyle} numberOfLines={1}>
          Article Preview
        </Text>
        
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        // onScroll={handleScroll}
        // scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.articleHeader}>
          <Image 
            source={{ uri: article.imageUrl }} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          
          <View style={styles.headerContent}>
            <Text style={headlineStyle}>
              {article.headline}
            </Text>
            
            <View style={styles.metaRow}>
              <Text style={authorStyle}>
                By {article.author}
              </Text>
              <Text style={metaDividerStyle}>•</Text>
              <Text style={readTimeStyle}>
                {article.readTime} min read
              </Text>
              <Text style={metaDividerStyle}>•</Text>
              <Text style={publishDateStyle}>
                {article.publishDate}
              </Text>
            </View>

            <View style={styles.topicsRow}>
              {article.topics?.map((topic, index) => (
                <View 
                  key={`${topic}-${index}`}
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
            </View>
          </View>
        </View>

        <View style={articleContentStyle}>
          {/* <Text style={sectionTitleStyle}>
            Summary
          </Text> */}
          <Text style={[contentTextStyle, { marginBottom: 25 }]}>
            {article.summary}
          </Text>
          
          <TouchableOpacity 
            style={readFullArticleButtonStyle}
            onPress={handleReadFullArticle}
            activeOpacity={0.8}
          >
            <Text style={styles.readFullArticleIcon}>📖</Text>
            <Text style={styles.readFullArticleText}>Read Full Article</Text>
            <Text style={styles.readFullArticleArrow}>→</Text>
          </TouchableOpacity>
          
          <Text style={readingTimeHintStyle}>
            {article.readTime} min read • Tap to read the complete article with rich content
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={actionBarStyle}>
        <TouchableOpacity 
          style={likeButtonStyle}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text style={likeTextStyle}>
            {isLiked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={saveButtonStyle}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>{isSaved ? '💾' : '🔖'}</Text>
          <Text style={saveTextStyle}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={shareButtonActionStyle}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={shareTextStyle}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

AIShortCut.displayName = 'AIShortCut';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 20,
  },
  progressContainer: {
    height: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  articleHeader: {
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e5e7eb',
  },
  headerContent: {
    padding: 20,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaDivider: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  readTime: {
    fontSize: 14,
  },
  publishDate: {
    fontSize: 14,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  articleContent: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'justify',
  },
  readFullArticleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 16,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  readFullArticleIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  readFullArticleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  readFullArticleArrow: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  readingTimeHint: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  bottomSpacer: {
    height: 100,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AIShortCut;
