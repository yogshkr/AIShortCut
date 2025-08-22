import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useTheme } from '../App';

const Header = React.memo(({ currentScreen = 'Home', currentUser, onLogout }) => {
  const theme = useTheme();

  // Memoized current date calculation
  const currentDate = useMemo(() => {
    const options = { 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  }, []);

  // Memoized screen title
  const screenTitle = useMemo(() => {
    switch(currentScreen) {
      case 'Home': return 'AI ShortCut';
      case 'Profile': return 'Profile';
      case 'Saved': return 'Saved Articles';
      default: return 'AI ShortCut';
    }
  }, [currentScreen]);

  // Memoized screen subtitle
  const screenSubtitle = useMemo(() => {
    switch(currentScreen) {
      case 'Home': return 'AI News Feed';
      case 'Profile': return 'Settings & Preferences';
      case 'Saved': return 'Your Bookmarks';
      default: return 'AI News Feed';
    }
  }, [currentScreen]);

  // Memoized logout handler
  const handleQuickLogout = useCallback(() => {
    Alert.alert(
      "🚪 Quick Sign Out",
      "Sign out of AI ShortCut?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: onLogout }
      ]
    );
  }, [onLogout]);

  // Memoized dark mode toggle handler
  const handleDarkModeToggle = useCallback(() => {
    theme.toggleDarkMode();
  }, [theme.toggleDarkMode]);

  // Memoized dynamic styles
  const headerStyle = useMemo(() => [
    styles.header,
    { backgroundColor: theme.colors.headerBackground }
  ], [theme.colors.headerBackground]);

  const titleStyle = useMemo(() => [
    styles.title,
    { color: theme.colors.headerText }
  ], [theme.colors.headerText]);

  const subtitleStyle = useMemo(() => [
    styles.subtitle,
    { color: theme.colors.headerSubtext }
  ], [theme.colors.headerSubtext]);

  const dateTextStyle = useMemo(() => [
    styles.dateText,
    { color: theme.colors.headerSubtext }
  ], [theme.colors.headerSubtext]);

  const headerButtonStyle = useMemo(() => [
    styles.headerButton,
    { backgroundColor: theme.colors.headerButton }
  ], [theme.colors.headerButton]);

  const systemIndicatorStyle = useMemo(() => [
    styles.systemIndicator,
    { color: theme.colors.headerSubtext }
  ], [theme.colors.headerSubtext]);

  // Memoized notification handler
const handleNotificationPress = useCallback(() => {
  Alert.alert(
    "🔔 Notifications",
    "Push notifications feature coming soon in the next update!",
    [{ text: "OK", style: "default" }]
  );
}, []);


  return (
    <View style={headerStyle}>
      <View style={styles.leftSection}>
        <View style={styles.titleRow}>
          <Image source={require("../../assets/AIShortCut_logo-removebg.png")} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.titleContainer}>
            <Text style={titleStyle}>
              {screenTitle}
            </Text>
            <Text style={subtitleStyle}>
              {screenSubtitle}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={dateTextStyle}>
          {currentDate}
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={headerButtonStyle}
            onPress={handleDarkModeToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.headerButtonIcon}>
              {theme.isDark ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
  style={headerButtonStyle}
  onPress={handleNotificationPress}  // Add this line
  activeOpacity={0.7}
>
  <Text style={styles.headerButtonIcon}>🔔</Text>
</TouchableOpacity>

        </View>
        
        {theme.isSystemPreference ? (
          <Text style={systemIndicatorStyle}>
            Auto
          </Text>
        ) : null}
      </View>
    </View>
  );
});

Header.displayName = 'Header';

const styles = StyleSheet.create({
  header: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    borderRadius: 16,
    padding: 8,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonIcon: {
    fontSize: 16,
  },
  systemIndicator: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.8,
  },
  logoImage: {
  width: 50,
  height: 50,
  // marginBottom: 15,
},
});

export default Header;
