import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Header from '../components/Header';
import BottomMenu from '../components/BottomMenu';
import { useTheme } from '../App';

const ProfileScreen = React.memo(({ onNavigate, currentUser, onLogout }) => {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userStats, setUserStats] = useState({
    articlesRead: 0,
    articlesLiked: 0,
    articlesSaved: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Memoized fetch user stats function
 // Memoized fetch user stats function
const fetchUserStats = useCallback(async () => {
  if (!currentUser) return;
  
  try {
    setStatsLoading(true);
    
    // Fetch user data and total articles count in parallel
    const [userDocResult, articlesSnapshot] = await Promise.all([
      getDoc(doc(db, 'users', currentUser.uid)),
      getDocs(collection(db, 'articles'))  // Add this import
    ]);
    
    const totalArticlesAvailable = articlesSnapshot.size;
    
    if (userDocResult.exists()) {
      const userData = userDocResult.data();
      const userArticlesRead = userData.stats?.articlesRead || 0;
      
      setUserStats({
        articlesRead: Math.min(userArticlesRead, totalArticlesAvailable), // Cap at total available
        articlesLiked: Math.min(userData.likedArticles?.length || 0, totalArticlesAvailable),
        articlesSaved: Math.min(userData.savedArticles?.length || 0, totalArticlesAvailable)
      });
    } else {
      // If user document doesn't exist, set all stats to 0
      setUserStats({
        articlesRead: 0,
        articlesLiked: 0,
        articlesSaved: 0
      });
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching user stats:', error);
    }
  } finally {
    setStatsLoading(false);
  }
}, [currentUser]);


  // Fetch user stats on mount and user change
  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  // Memoized setting toggle handler
  // const handleSettingToggle = useCallback((setting, value) => {
  //   if (setting === 'notifications') {
  //     setNotificationsEnabled(value);
  //     Alert.alert(
  //       "🔔 Notifications", 
  //       value ? "Notifications enabled" : "Notifications disabled"
  //     );
  //   }
  // }, []);

  // Memoized action handler
  const handleAction = useCallback((action) => {
    switch(action) {
      case 'preferences':
        Alert.alert(
          "⚙️ Preferences", 
          "AI news topic preferences coming soon!"
        );
        break;
      case 'about':
        Alert.alert(
  "ℹ️ About AI ShortCut", 
  "Version 1.0.0 - Just Launched! 🎉\n\n🤖 Your personalized AI news companion that delivers the latest AI trends, breakthroughs, and insights in bite-sized summaries.\n\n📱 We're updating this app daily with new features and improvements because we're passionate about bringing you the best AI news experience.\n\n🚀 This is just the beginning! As a newly launched app, your support means everything to us. Please keep the app and help us grow by sharing it with fellow AI enthusiasts.\n\n💡 Have suggestions? We're listening and building this app for YOU!\n\nThank you for being an early supporter!🙏\n\nContact Python.Hub on Instagram"
);

        break;
      case 'feedback':
        Alert.alert(
          "💬 Feedback", 
          "We'd love to hear from you!\nPlease contact Python.Hub on Instagram."
        );
        break;
      case 'share':
        Alert.alert(
          "📤 Share App", 
          "Sharing AI ShortCut with friends!\nShare functionality coming soon."
        );
        break;
      default:
        break;
    }
  }, []);

  // Memoized logout handler
  const handleLogoutPress = useCallback(() => {
    Alert.alert(
      "🚪 Sign Out",
      `Are you sure you want to sign out of AI ShortCut?\n\nYou'll need to log in again to access your personalized content.`,
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: onLogout
        }
      ]
    );
  }, [onLogout]);

  // Memoized dark mode toggle handler
  const handleDarkModeToggle = useCallback(() => {
    theme.toggleDarkMode();
  }, [theme.toggleDarkMode]);

  // Memoized notification toggle handler
  const handleNotificationToggle = useCallback(() => {
    Alert.alert(
    "🔔 Notifications",
    "Push notifications feature coming soon in the next update!",
    [{ text: "OK", style: "default" }]
  );
}, []);

  // Memoized dynamic styles
  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const profileSectionStyle = useMemo(() => [
    styles.profileSection,
    { backgroundColor: theme.colors.cardBackground }
  ], [theme.colors.cardBackground]);

  const avatarContainerStyle = useMemo(() => [
    styles.avatarContainer,
    { backgroundColor: theme.colors.primaryButton }
  ], [theme.colors.primaryButton]);

  const userNameStyle = useMemo(() => [
    styles.userName,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const userEmailStyle = useMemo(() => [
    styles.userEmail,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const statsSectionStyle = useMemo(() => [
    styles.statsSection,
    { backgroundColor: theme.colors.cardBackground }
  ], [theme.colors.cardBackground]);

  const statNumberStyle = useMemo(() => [
    styles.statNumber,
    { color: theme.colors.accentText }
  ], [theme.colors.accentText]);

  const statLabelStyle = useMemo(() => [
    styles.statLabel,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const settingsSectionStyle = useMemo(() => [
    styles.settingsSection,
    { backgroundColor: theme.colors.cardBackground }
  ], [theme.colors.cardBackground]);

  const actionsSectionStyle = useMemo(() => [
    styles.actionsSection,
    { backgroundColor: theme.colors.cardBackground }
  ], [theme.colors.cardBackground]);

  const accountSectionStyle = useMemo(() => [
    styles.accountSection,
    { backgroundColor: theme.colors.cardBackground }
  ], [theme.colors.cardBackground]);

  const sectionTitleStyle = useMemo(() => [
    styles.sectionTitle,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const settingItemStyle = useMemo(() => [
    styles.settingItem,
    { borderBottomColor: theme.colors.separator }
  ], [theme.colors.separator]);

  const settingTextStyle = useMemo(() => [
    styles.settingText,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const actionItemStyle = useMemo(() => [
    styles.actionItem,
    { borderBottomColor: theme.colors.separator }
  ], [theme.colors.separator]);

  const actionTextStyle = useMemo(() => [
    styles.actionText,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const arrowStyle = useMemo(() => [
    styles.arrow,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  // Memoized toggle styles
  const notificationToggleStyle = useMemo(() => [
    styles.toggle,
    { backgroundColor: theme.colors.buttonBackground },
    notificationsEnabled && { backgroundColor: theme.colors.primaryButton }
  ], [theme.colors.buttonBackground, theme.colors.primaryButton, notificationsEnabled]);

  const notificationToggleTextStyle = useMemo(() => [
    styles.toggleText,
    { color: theme.colors.buttonText },
    notificationsEnabled && { color: '#ffffff' }
  ], [theme.colors.buttonText, notificationsEnabled]);

  const darkModeToggleStyle = useMemo(() => [
    styles.toggle,
    { backgroundColor: theme.colors.buttonBackground },
    theme.isDark && { backgroundColor: theme.colors.primaryButton }
  ], [theme.colors.buttonBackground, theme.colors.primaryButton, theme.isDark]);

  const darkModeToggleTextStyle = useMemo(() => [
    styles.toggleText,
    { color: theme.colors.buttonText },
    theme.isDark && { color: '#ffffff' }
  ], [theme.colors.buttonText, theme.isDark]);

  const logoutItemStyle = useMemo(() => [
    styles.logoutItem,
    {
      backgroundColor: theme.isDark ? '#450a0a' : '#fef2f2',
      borderColor: theme.isDark ? '#dc2626' : '#fecaca'
    }
  ], [theme.isDark]);

  const showTerms = useCallback(() => {
Alert.alert(
'Terms of Service',
[
'- Use: You must be 13+ and provide accurate information.',
'- Account: Keep credentials secure; do not share your account.',
'- Content & License: Limited, non-transferable license; no reverse engineering or abuse.',
'- Payments: If purchases/subscriptions exist, Google Play Billing terms apply; local law may require refunds/disclosures.',
'- Prohibited: Spam, fraud, harassment, illegal content/activity.',
'- Data: Your use is governed by our Privacy Policy.',
'- Termination: Accounts may be suspended/terminated for policy violations.',
'- Liability: Service “as is”; liability limited to the extent permitted by law.',
'- Changes: We may update these terms; continued use means acceptance.',
].join('\n'),
[{ text: 'Close', style: 'cancel' }],
{ cancelable: true }
);
}, []);

const showPrivacy = useCallback(() => {
Alert.alert(
'Privacy Policy',
[
'- Data We Collect: Name, email, password (hashed via Firebase Auth), usage/device data.',
'- Purpose: Account creation, security, app functionality, abuse prevention, improvements, legal compliance.',
'- Storage & Security: Managed with Firebase; reasonable technical and organizational measures.',
'- Sharing: Not sold; may share with service providers (e.g., Firebase) and when required by law.',
'- Retention: Kept only as long as necessary or legally required.',
'- Your Choices: Access/update/delete; request account deletion via in-app settings or support.',
'- Children: Not for users under 13.',
'- International Transfers: May be processed outside your country per applicable law.',
'- Changes: We may update; material changes highlighted in-app.',
].join('\n'),
[{ text: 'Close', style: 'cancel' }],
{ cancelable: true }
);
}, []);

  return (
    <View style={containerStyle}>
      <Header currentScreen="Profile" />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={profileSectionStyle}>
          <View style={avatarContainerStyle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={userNameStyle}>
            {currentUser?.name || 'AI News Reader'}
          </Text>
          <Text style={userEmailStyle}>
            {currentUser?.email || 'Stay updated with AI trends'}
          </Text>
        </View>

        <View style={statsSectionStyle}>
          <View style={styles.statItem}>
            <Text style={statNumberStyle}>
              {statsLoading ? '...' : userStats.articlesRead}
            </Text>
            <Text style={statLabelStyle}>Articles Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={statNumberStyle}>
              {statsLoading ? '...' : userStats.articlesSaved}
            </Text>
            <Text style={statLabelStyle}>Saved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={statNumberStyle}>
              {statsLoading ? '...' : userStats.articlesLiked}
            </Text>
            <Text style={statLabelStyle}>Liked</Text>
          </View>
        </View>

        <View style={settingsSectionStyle}>
          <Text style={sectionTitleStyle}>Settings</Text>
          
          <TouchableOpacity 
            style={settingItemStyle}
            onPress={handleNotificationToggle}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={settingTextStyle}>Push Notifications</Text>
            </View>
            <View style={notificationToggleStyle}>
              <Text style={notificationToggleTextStyle}>
                {notificationsEnabled ? 'OFF' : 'ON'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={settingItemStyle}
            onPress={handleDarkModeToggle}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>{theme.isDark ? '🌙' : '☀️'}</Text>
              <Text style={settingTextStyle}>
                Dark Mode {theme.isSystemPreference ? '(Auto)' : ''}
              </Text>
            </View>
            <View style={darkModeToggleStyle}>
              <Text style={darkModeToggleTextStyle}>
                {theme.isDark ? 'ON' : 'OFF'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={settingItemStyle}
            onPress={() => handleAction('preferences')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>⚙️</Text>
              <Text style={settingTextStyle}>AI Topic Preferences</Text>
            </View>
            <Text style={arrowStyle}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={actionsSectionStyle}>
          <Text style={sectionTitleStyle}>More</Text>
          
          <TouchableOpacity 
            style={actionItemStyle}
            onPress={() => handleAction('about')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>ℹ️</Text>
            <Text style={actionTextStyle}>About AI ShortCut</Text>
            <Text style={arrowStyle}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={actionItemStyle}
            onPress={() => handleAction('feedback')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={actionTextStyle}>Send Feedback</Text>
            <Text style={arrowStyle}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={actionItemStyle}
            onPress={() => handleAction('share')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={actionTextStyle}>Share App</Text>
            <Text style={arrowStyle}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={actionItemStyle}
            onPress={showTerms}
            activeOpacity={0.7}
            >
              
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={actionTextStyle}>Terms of Service</Text>
            <Text style={arrowStyle}>→</Text>
          </TouchableOpacity>
              
          <TouchableOpacity
            style={actionItemStyle}
            onPress={showPrivacy}
            activeOpacity={0.7}
              >
            <Text style={styles.actionIcon}>🔒</Text>
            <Text style={actionTextStyle}>Privacy Policy</Text>
            <Text style={arrowStyle}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={accountSectionStyle}>
          <Text style={sectionTitleStyle}>Account</Text>
          
          <TouchableOpacity 
            style={logoutItemStyle}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={[styles.logoutText, { color: '#dc2626' }]}>Sign Out</Text>
            <Text style={[styles.arrow, { color: '#dc2626' }]}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <BottomMenu 
        activeScreen="Profile" 
        onNavigate={onNavigate}
      />
    </View>
  );
});

ProfileScreen.displayName = 'ProfileScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarEmoji: {
    fontSize: 32,
    color: 'white',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    minHeight: 29, // Prevents layout shift during loading
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 50,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 5,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
