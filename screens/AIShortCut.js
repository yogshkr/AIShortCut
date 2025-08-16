// screens/AIShortCut.js
import React, { useState, useEffect } from 'react';
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
import { markArticleAsRead, updateReadingProgress, getUserInteractions } from '../firebase/firebaseService';
 // Add this import at the top
import { updateUserInteraction } from '../firebase/firebaseService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



const { width } = Dimensions.get('window');

const AIShortCut = ({ article, onBack, currentUser, onReadFullArticle  }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets(); 
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setSaved] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Add this useEffect after your existing state declarations
// Add this useEffect after your existing one
useEffect(() => {
  const loadUserInteractions = async () => {
    if (currentUser && article) {
      try {
        const userInteractions = await getUserInteractions(currentUser.uid);
        setIsLiked(userInteractions.likedArticles?.includes(article.id) || false);
        setSaved(userInteractions.savedArticles?.includes(article.id) || false);
      } catch (error) {
        console.error('Error loading user interactions:', error);
      }
      
    markArticleAsRead(currentUser.uid, article.id);
    }
  };

  loadUserInteractions();
}, [currentUser, article]);



  const fullContent = `
${article.summary}

---

${article.content || 'Content not available for this article.'}`;

  // Replace your existing handleScroll function
const handleScroll = (event) => {
  const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
  const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
  const progressPercent = Math.min(Math.max(progress, 0), 1);
  
  setReadingProgress(progressPercent);
  
  // Update reading progress in Firebase when user scrolls significantly
  if (currentUser && article && progressPercent > 0.1) {
    updateReadingProgress(currentUser.uid, article.id, Math.round(progressPercent * 100));
  }
};



// Replace handleLike function
const handleLike = async () => {
  const newLikedState = !isLiked;
  setIsLiked(newLikedState);
  
  // Update Firebase
  try {
    await updateUserInteraction(currentUser.uid, article.id, 'like', newLikedState);
  } catch (error) {
    console.error('Error updating like status:', error);
  }

  // Alert.alert(
  //   newLikedState ? "❤️ Liked!" : "💔 Unliked",
  //   newLikedState ? "Added to your liked articles" : "Removed from liked articles"
  // );
};

// Replace handleSave function
const handleSave = async () => {
  const newSavedState = !isSaved;
  setSaved(newSavedState);
  
  // Update Firebase
  try {
    await updateUserInteraction(currentUser.uid, article.id, 'save', newSavedState);
  } catch (error) {
    console.error('Error updating save status:', error);
  }

  // Alert.alert(
  //   newSavedState ? "💾 Saved!" : "🗑️ Unsaved",
  //   newSavedState ? "Article saved for later reading" : "Removed from saved articles"
  // );
};

  const handleShare = () => {
    Alert.alert(
      "📤 Share Article",
      `!!Feature coming soon!!.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Back", onPress: () => console.log("Sharing article:", article.headline) }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.headerText }]} numberOfLines={1}>
          Article
        </Text>
        
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Reading Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.cardBackground }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${readingProgress * 100}%`,
              backgroundColor: theme.colors.primaryButton 
            }
          ]} 
        />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />
          
          <View style={styles.headerContent}>
            <Text style={[styles.headline, { color: theme.colors.primaryText }]}>
              {article.headline}
            </Text>
            
            <View style={styles.metaRow}>
              <Text style={[styles.author, { color: theme.colors.secondaryText }]}>
                By {article.author}
              </Text>
              <Text style={[styles.metaDivider, { color: theme.colors.secondaryText }]}>•</Text>
              <Text style={[styles.readTime, { color: theme.colors.secondaryText }]}>
                {article.readTime}
              </Text>
              <Text style={[styles.metaDivider, { color: theme.colors.secondaryText }]}>•</Text>
              <Text style={[styles.publishDate, { color: theme.colors.secondaryText }]}>
                {article.publishDate}
              </Text>
            </View>

            <View style={styles.topicsRow}>
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
            </View>
          </View>
        </View>

        {/* Article Content - REPLACED WITH READ FULL ARTICLE BUTTON */}
<View style={[styles.articleContent, { backgroundColor: theme.colors.cardBackground }]}>
  {/* Summary Section */}
  <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
    Summary
  </Text>
  <Text style={[styles.contentText, { color: theme.colors.secondaryText, marginBottom: 25 }]}>
    {article.summary}
  </Text>
  
  {/* Read Full Article Button */}
  <TouchableOpacity 
    style={[styles.readFullArticleButton, { backgroundColor: theme.colors.primaryButton }]}
    onPress={() => onReadFullArticle && onReadFullArticle(article)}
  >
    <Text style={styles.readFullArticleIcon}>📖</Text>
    <Text style={styles.readFullArticleText}>Read Full Article</Text>
    <Text style={styles.readFullArticleArrow}>→</Text>
  </TouchableOpacity>
  
  <Text style={[styles.readingTimeHint, { color: theme.colors.secondaryText }]}>
    {article.readTime} • Tap to read the complete article with rich content
  </Text>
</View>


        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { 
        backgroundColor: theme.colors.cardBackground,
        borderTopColor: theme.colors.border, 
  paddingBottom: insets.bottom + 15,
      }]}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.buttonBackground },
            isLiked && { backgroundColor: theme.colors.likedBackground }
          ]}
          onPress={handleLike}
        >
          <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text style={[
            styles.actionText,
            { color: theme.colors.buttonText },
            isLiked && { color: theme.colors.liked }
          ]}>
            {isLiked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.buttonBackground },
            isSaved && { backgroundColor: theme.colors.savedBackground }
          ]}
          onPress={handleSave}
        >
          <Text style={styles.actionIcon}>{isSaved ? '💾' : '🔖'}</Text>
          <Text style={[
            styles.actionText,
            { color: theme.colors.buttonText },
            isSaved && { color: theme.colors.saved }
          ]}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.buttonBackground }]}
          onPress={handleShare}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={[styles.actionText, { color: theme.colors.buttonText }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'justify',
  },
  relatedSection: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  relatedItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  relatedHeadline: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  relatedSummary: {
    fontSize: 14,
    lineHeight: 20,
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
  // Add this to your styles object in AIShortCut.js
sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},
// Add these new styles to your existing styles object:
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

});

export default AIShortCut;
