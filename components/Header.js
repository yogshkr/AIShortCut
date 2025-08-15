// components/Header.js (Updated with Optional Logout)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../App';

const Header = ({ currentScreen = 'Home', currentUser, onLogout }) => {
  const theme = useTheme();

  const getCurrentDate = () => {
    const options = { 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const getScreenTitle = () => {
    switch(currentScreen) {
      case 'Home': return 'AI ShortCut';
      case 'Profile': return 'Profile';
      case 'Saved': return 'Saved Articles';
      default: return 'AI ShortCut';
    }
  };

  const getScreenSubtitle = () => {
    switch(currentScreen) {
      case 'Home': return 'AI News Feed';
      case 'Profile': return 'Settings & Preferences';
      case 'Saved': return 'Your Bookmarks';
      default: return 'AI News Feed';
    }
  };

  const handleQuickLogout = () => {
    Alert.alert(
      "🚪 Quick Sign Out",
      "Sign out of AI ShortCut?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: onLogout }
      ]
    );
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
      <View style={styles.leftSection}>
        <View style={styles.titleRow}>
          <Text style={styles.appIcon}>🤖</Text>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.headerText }]}>
              {getScreenTitle()}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.headerSubtext }]}>
              {getScreenSubtitle()}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.dateText, { color: theme.colors.headerSubtext }]}>
          {getCurrentDate()}
        </Text>
        
        <View style={styles.buttonRow}>
          {/* Dark Mode Toggle */}
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.colors.headerButton }]}
            onPress={theme.toggleDarkMode}
          >
            <Text style={styles.headerButtonIcon}>
              {theme.isDark ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
          
          {/* User Profile / Quick Logout (only show on non-Profile screens) */}
          {/* {currentScreen !== 'Profile' && currentUser && (
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: theme.colors.headerButton }]}
              onPress={handleQuickLogout}
            >
              <Text style={styles.headerButtonIcon}>👤</Text>
            </TouchableOpacity>
          )} */}
          
          {/* Notification Button */}
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.colors.headerButton }]}
          >
            <Text style={styles.headerButtonIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
        
        {/* System preference indicator */}
        {theme.isSystemPreference && (
          <Text style={[styles.systemIndicator, { color: theme.colors.headerSubtext }]}>
            Auto
          </Text>
        )}
      </View>
    </View>
  );
};

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
});

export default Header;
