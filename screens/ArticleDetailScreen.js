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

const { width } = Dimensions.get('window');

const ArticleDetailScreen = ({ article, onBack, currentUser }) => {
  const theme = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setSaved] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Sample full article content (in real app, this would come from Firebase)
  const fullContent = `
${article.summary}

Artificial intelligence continues to reshape industries worldwide, with breakthrough developments emerging at an unprecedented pace. This latest advancement represents a significant milestone in the field, demonstrating capabilities that were previously thought to be years away.

## Key Developments

The recent progress in AI technology has been driven by several key factors:

**Advanced Neural Networks**: New architectures have enabled more sophisticated reasoning and problem-solving capabilities, allowing AI systems to tackle complex challenges with greater accuracy and efficiency.

**Massive Data Processing**: The ability to process and learn from enormous datasets has significantly improved AI performance across various domains, from natural language understanding to computer vision.

**Computational Breakthroughs**: Enhanced computing power and optimized algorithms have made it possible to train larger, more capable models that can handle increasingly complex tasks.

## Industry Impact

This development is expected to have far-reaching implications across multiple sectors:

- **Healthcare**: Improved diagnostic accuracy and treatment personalization
- **Finance**: Enhanced fraud detection and risk assessment capabilities  
- **Education**: Personalized learning experiences and intelligent tutoring systems
- **Transportation**: Safer autonomous vehicle technologies
- **Research**: Accelerated scientific discovery and analysis

## Looking Forward

As we move into this new era of artificial intelligence, several trends are becoming clear. The technology is becoming more accessible to businesses of all sizes, enabling widespread adoption and innovation. At the same time, important questions about ethics, safety, and regulation continue to evolve.

The implications of these advances extend beyond immediate practical applications. They represent a fundamental shift in how we approach problem-solving and decision-making across industries. Organizations that can successfully integrate these technologies while addressing associated challenges will likely find themselves at a significant competitive advantage.

## Expert Perspectives

Leading researchers in the field have expressed both excitement and caution about these developments. While the potential benefits are enormous, they emphasize the importance of responsible development and deployment of these powerful technologies.

The consensus among experts is that this represents just the beginning of a transformative period in AI development. The next few years are likely to bring even more remarkable advances as research continues and practical applications expand.

This ongoing evolution highlights the importance of staying informed about AI developments and their potential impact on various aspects of our lives and work.
  `;

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    setReadingProgress(Math.min(Math.max(progress, 0), 1));
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
          <Text style={[styles.contentText, { color: theme.colors.primaryText }]}>
            {fullContent.trim()}
          </Text>
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
});

export default ArticleDetailScreen;
