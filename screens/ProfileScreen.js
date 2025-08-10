// screens/ProfileScreen.js (Dark Mode Support)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import BottomMenu from '../components/BottomMenu';
import { useTheme } from '../App';

const ProfileScreen = ({ onNavigate }) => {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSettingToggle = (setting, value) => {
    if (setting === 'notifications') {
      setNotificationsEnabled(value);
      Alert.alert("🔔 Notifications", value ? "Notifications enabled" : "Notifications disabled");
    }
  };

  const handleAction = (action) => {
    switch(action) {
      case 'preferences':
        Alert.alert("⚙️ Preferences", "AI news topic preferences coming soon!");
        break;
      case 'about':
        Alert.alert("ℹ️ About AI ShortCut", "Version 1.0.0\nYour daily AI news companion\nBuilt with React Native & Expo");
        break;
      case 'feedback':
        Alert.alert("💬 Feedback", "We'd love to hear from you!\nFeedback system coming soon.");
        break;
      case 'share':
        Alert.alert("📤 Share App", "Sharing AI ShortCut with friends!\nShare functionality coming soon.");
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header currentScreen="Profile" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primaryButton }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={[styles.userName, { color: theme.colors.primaryText }]}>
            AI News Reader
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.secondaryText }]}>
            Stay updated with AI trends
          </Text>
        </View>

        <View style={[styles.statsSection, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.accentText }]}>47</Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>Articles Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.accentText }]}>12</Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>Saved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.accentText }]}>8</Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>Liked</Text>
          </View>
        </View>

        <View style={[styles.settingsSection, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>Settings</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.separator }]}
            onPress={() => handleSettingToggle('notifications', !notificationsEnabled)}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={[styles.settingText, { color: theme.colors.primaryText }]}>Push Notifications</Text>
            </View>
            <View style={[
              styles.toggle, 
              { backgroundColor: theme.colors.buttonBackground },
              notificationsEnabled && { backgroundColor: theme.colors.primaryButton }
            ]}>
              <Text style={[
                styles.toggleText, 
                { color: theme.colors.buttonText },
                notificationsEnabled && { color: '#ffffff' }
              ]}>
                {notificationsEnabled ? 'ON' : 'OFF'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.separator }]}
            onPress={() => theme.toggleDarkMode()}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>{theme.isDark ? '🌙' : '☀️'}</Text>
              <Text style={[styles.settingText, { color: theme.colors.primaryText }]}>
                Dark Mode {theme.isSystemPreference ? '(Auto)' : ''}
              </Text>
            </View>
            <View style={[
              styles.toggle, 
              { backgroundColor: theme.colors.buttonBackground },
              theme.isDark && { backgroundColor: theme.colors.primaryButton }
            ]}>
              <Text style={[
                styles.toggleText, 
                { color: theme.colors.buttonText },
                theme.isDark && { color: '#ffffff' }
              ]}>
                {theme.isDark ? 'ON' : 'OFF'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.separator }]}
            onPress={() => handleAction('preferences')}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>⚙️</Text>
              <Text style={[styles.settingText, { color: theme.colors.primaryText }]}>AI Topic Preferences</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.secondaryText }]}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.actionsSection, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>More</Text>
          
          <TouchableOpacity 
            style={[styles.actionItem, { borderBottomColor: theme.colors.separator }]}
            onPress={() => handleAction('about')}
          >
            <Text style={styles.actionIcon}>ℹ️</Text>
            <Text style={[styles.actionText, { color: theme.colors.primaryText }]}>About AI ShortCut</Text>
            <Text style={[styles.arrow, { color: theme.colors.secondaryText }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, { borderBottomColor: theme.colors.separator }]}
            onPress={() => handleAction('feedback')}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={[styles.actionText, { color: theme.colors.primaryText }]}>Send Feedback</Text>
            <Text style={[styles.arrow, { color: theme.colors.secondaryText }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, { borderBottomColor: theme.colors.separator }]}
            onPress={() => handleAction('share')}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={[styles.actionText, { color: theme.colors.primaryText }]}>Share App</Text>
            <Text style={[styles.arrow, { color: theme.colors.secondaryText }]}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <BottomMenu 
        activeScreen="Profile" 
        onNavigate={onNavigate}
      />
    </View>
  );
};

// Keep all the same styles from before - just the colors are now dynamic
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
});

export default ProfileScreen;
