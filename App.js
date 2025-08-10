// App.js (Fixed prop passing)
import React, { useState, useEffect, createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Appearance } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';  
import SavedScreen from './screens/SavedScreen';
import ArticleDetailScreen from './screens/ArticleDetailScreen';

// Create Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemPreference, setIsSystemPreference] = useState(true);

  // Detect system appearance on app start
  useEffect(() => {
    const systemColorScheme = Appearance.getColorScheme();
    setIsDarkMode(systemColorScheme === 'dark');

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (isSystemPreference) {
        setIsDarkMode(colorScheme === 'dark');
      }
    });

    return () => subscription?.remove();
  }, [isSystemPreference]);

  const handleNavigation = (screenName) => {
    console.log(`Navigation called: ${screenName}`);
    setCurrentScreen(screenName);
    setSelectedArticle(null); // Clear selected article when navigating to main screens
  };

  const handleArticleDetail = (article) => {
    console.log(`Opening article: ${article.headline}`);
    setSelectedArticle(article);
    setCurrentScreen('ArticleDetail');
  };

  const handleBackFromArticle = () => {
    setCurrentScreen('Home'); // Return to home screen
    setSelectedArticle(null);
  };

  const toggleDarkMode = () => {
    setIsSystemPreference(false);
    setIsDarkMode(prev => !prev);
  };

  const resetToSystemPreference = () => {
    setIsSystemPreference(true);
    const systemColorScheme = Appearance.getColorScheme();
    setIsDarkMode(systemColorScheme === 'dark');
  };

  // Theme object with all colors
  const theme = {
    isDark: isDarkMode,
    isSystemPreference,
    toggleDarkMode,
    resetToSystemPreference,
    colors: {
      background: isDarkMode ? '#0f172a' : '#f1f5f9',
      cardBackground: isDarkMode ? '#1e293b' : '#ffffff',
      headerBackground: isDarkMode ? '#1e40af' : '#2563eb',
      primaryText: isDarkMode ? '#f8fafc' : '#1f2937',
      secondaryText: isDarkMode ? '#cbd5e1' : '#6b7280',
      accentText: isDarkMode ? '#60a5fa' : '#2563eb',
      border: isDarkMode ? '#374151' : '#e5e7eb',
      separator: isDarkMode ? '#4b5563' : '#f3f4f6',
      buttonBackground: isDarkMode ? '#374151' : '#f3f4f6',
      buttonText: isDarkMode ? '#e2e8f0' : '#6b7280',
      primaryButton: isDarkMode ? '#3b82f6' : '#2563eb',
      liked: '#dc2626',
      saved: '#16a34a',
      likedBackground: isDarkMode ? '#450a0a' : '#fef2f2',
      savedBackground: isDarkMode ? '#052e16' : '#f0fdf4',
      headerText: '#ffffff',
      headerSubtext: isDarkMode ? '#93c5fd' : '#bfdbfe',
      headerButton: 'rgba(255, 255, 255, 0.15)',
    }
  };

// In App.js - renderCurrentScreen function
const renderCurrentScreen = () => {
  // Handle ArticleDetail screen separately
  if (currentScreen === 'ArticleDetail' && selectedArticle) {
    return (
      <ArticleDetailScreen
        article={selectedArticle}
        onBack={handleBackFromArticle}
        onNavigate={handleNavigation}
        key="article-detail"
      />
    );
  }

  // Handle main screens with proper prop passing
  switch(currentScreen) {
    case 'Home':
      return (
        <HomeScreen 
          onNavigate={handleNavigation}
          onArticleDetail={handleArticleDetail}  // ✅ Passed to HomeScreen
          key="home" 
        />
      );
    case 'Profile':
      return (
        <ProfileScreen 
          onNavigate={handleNavigation}
          key="profile" 
        />
      );
    case 'Saved':
      return (
        <SavedScreen 
          onNavigate={handleNavigation}
          onArticleDetail={handleArticleDetail}  // ✅ Must be passed to SavedScreen
          key="saved" 
        />
      );
    default:
      return (
        <HomeScreen 
          onNavigate={handleNavigation}
          onArticleDetail={handleArticleDetail}
          key="home-default" 
        />
      );
  }
};

  return (
    <ThemeContext.Provider value={theme}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        {renderCurrentScreen()}
      </View>
    </ThemeContext.Provider>
  );
}
