// screens/ArticleDetailScreen.js
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
import { markArticleAsRead, updateReadingProgress } from '../firebase/firebaseService';
import RenderHtml from 'react-native-render-html';



const { width } = Dimensions.get('window');

const ArticleDetailScreen = ({ article, onBack, currentUser }) => {
  const theme = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setSaved] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Add this useEffect after your existing state declarations
useEffect(() => {
  if (currentUser && article) {
    // Mark article as read when user opens it
    markArticleAsRead(currentUser.uid, article.id);
  }
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


  const handleLike = () => {
    setIsLiked(prev => !prev);
    Alert.alert(
      isLiked ? "💔 Unliked" : "❤️ Liked!",
      isLiked ? "Removed from liked articles" : "Added to your liked articles"
    );
  };

  const handleSave = () => {
    setSaved(prev => !prev);
    Alert.alert(
      isSaved ? "🗑️ Unsaved" : "💾 Saved!",
      isSaved ? "Removed from saved articles" : "Article saved for later reading"
    );
  };

  const handleShare = () => {
    Alert.alert(
      "📤 Share Article",
      `Sharing: "${article.headline}"\n\nThis will open your device's share menu.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Share", onPress: () => console.log("Sharing article:", article.headline) }
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

        {/* Article Content */}
<View style={[styles.articleContent, { backgroundColor: theme.colors.cardBackground }]}>
  {/* Summary Section */}
  <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
    Summary
  </Text>
  <Text style={[styles.contentText, { color: theme.colors.secondaryText, marginBottom: 20 }]}>
    {article.summary}
  </Text>
  
  {/* Full Content Section - HTML RENDERING */}
  <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
    Full Article
  </Text>
  
  <RenderHtml
    contentWidth={width - 70}
    source={{ html: article.content || '<p>Rich content not available for this article.</p>' }}
    tagsStyles={{
      p: {
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'justify',
        color: theme.colors.primaryText,
        marginBottom: 15,
      },
      img: {
        borderRadius: 12,
        marginVertical: 15,
      },
      h1: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primaryText,
        marginTop: 20,
        marginBottom: 10,
      },
      h2: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primaryText,
        marginTop: 15,
        marginBottom: 8,
      },
      strong: {
        fontWeight: 'bold',
        color: theme.colors.primaryText,
      },
      em: {
        fontStyle: 'italic',
        color: theme.colors.primaryText,
      },
      ul: {
        color: theme.colors.primaryText,
        marginVertical: 10,
      },
      ol: {
        color: theme.colors.primaryText,
        marginVertical: 10,
      },
      li: {
        color: theme.colors.primaryText,
        fontSize: 16,
        lineHeight: 24,
      },
    }}
    systemFonts={['System']}
  />
</View>


        {/* Related Articles */}
        <View style={[styles.relatedSection, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.relatedTitle, { color: theme.colors.primaryText }]}>
            Related Articles
          </Text>
          
          <TouchableOpacity style={styles.relatedItem}>
            <Text style={[styles.relatedHeadline, { color: theme.colors.accentText }]}>
              OpenAI Announces ChatGPT-5: Next Generation AI
            </Text>
            <Text style={[styles.relatedSummary, { color: theme.colors.secondaryText }]}>
              The latest iteration promises enhanced reasoning capabilities...
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.relatedItem}>
            <Text style={[styles.relatedHeadline, { color: theme.colors.accentText }]}>
              AI Ethics: Balancing Innovation and Responsibility
            </Text>
            <Text style={[styles.relatedSummary, { color: theme.colors.secondaryText }]}>
              As AI becomes more powerful, ethical considerations become crucial...
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { 
        backgroundColor: theme.colors.cardBackground,
        borderTopColor: theme.colors.border 
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
  // Add this to your styles object in ArticleDetailScreen.js
sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},

});

export default ArticleDetailScreen;
