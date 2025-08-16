// App.js (Updated with Article Detail Navigation)
import React, { useState, useEffect, createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Appearance } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import main app screens
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';  
import SavedScreen from './screens/SavedScreen';
// import ArticleDetailScreen from './screens/ArticleDetailScreen';

import FullArticleScreen from './screens/FullArticleScreen';
import AIShortCut from './screens/AIShortCut';

// Import authentication screens
import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
// Replace the existing authentication state section with:
// Authentication state
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [authScreen, setAuthScreen] = useState('Welcome');
const [loading, setLoading] = useState(true); // Add loading state

// Main app navigation state
const [currentScreen, setCurrentScreen] = useState('Home');
const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemPreference, setIsSystemPreference] = useState(true);

  // Detect system appearance on app start
  useEffect(() => {
  // --- Appearance theme handling ---
  const systemColorScheme = Appearance.getColorScheme();
  setIsDarkMode(systemColorScheme === 'dark');

  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    if (isSystemPreference) {
      setIsDarkMode(colorScheme === 'dark');
    }
  });

  // --- Authentication state handling ---
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
      };
      setCurrentUser(userData);
      setIsAuthenticated(true);

      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
      // User is signed out
      setCurrentUser(null);
      setIsAuthenticated(false);
      setAuthScreen('Welcome');

      await AsyncStorage.removeItem('currentUser');
    }
    setLoading(false);
  });

  // --- Combined cleanup ---
  return () => {
    subscription?.remove();
    unsubscribe();
  };
}, [isSystemPreference]);


  // Authentication handlers
  const handleAuthNavigation = (screenName) => {
    console.log(`Auth navigation to: ${screenName}`);
    setAuthScreen(screenName);
  };

  const handleLoginSuccess = (userData) => {
    console.log(`Login successful for: ${userData.email}`);
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setCurrentScreen('Home');
  };

  const handleSignupSuccess = (userData) => {
    console.log(`Signup successful for: ${userData.email}`);
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setCurrentScreen('Home');
  };

// Replace handleLogout with:
const handleLogout = async () => {
  try {
    await auth.signOut();
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    Alert.alert('Logout Error', 'Something went wrong while logging out.');
  }
};


  // Main app navigation handlers
  const handleMainNavigation = (screenName) => {
    console.log(`Main app navigation to: ${screenName}`);
    setCurrentScreen(screenName);
    setSelectedArticle(null); // Clear selected article when navigating to main screens
  };

  // Article detail navigation handlers
  const handleArticleDetail = (article) => {
    console.log(`Opening article detail: ${article.headline}`);
    setSelectedArticle(article);
    setCurrentScreen('ArticleDetail');
  };

  const handleBackFromArticle = () => {
    console.log('Returning from article detail');
    setCurrentScreen('Home'); // Return to home (or remember previous screen)
    setSelectedArticle(null);
  };
  // Add this new back handler
const handleBackFromFullArticle = () => {
  console.log('Returning from full article to preview');
  setCurrentScreen('ArticleDetail'); // Go back to AIShortCut preview
  // Keep selectedArticle - don't set to null
};

const handleFullArticleNavigation = (article) => {
  console.log(`Opening full article: ${article.headline}`);
  setCurrentScreen('FullArticle'); // We'll handle this case next
};
  // Theme handlers
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

  // Render authentication screens
  const renderAuthScreens = () => {
    switch(authScreen) {
      case 'Welcome':
        return (
          <WelcomeScreen 
            onNavigateToLogin={() => handleAuthNavigation('Login')}
            onNavigateToSignup={() => handleAuthNavigation('Signup')}
          />
        );
      case 'Login':
        return (
          <LoginScreen 
            onBack={() => handleAuthNavigation('Welcome')}
            onNavigateToSignup={() => handleAuthNavigation('Signup')}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'Signup':
        return (
          <SignupScreen 
            onBack={() => handleAuthNavigation('Welcome')}
            onNavigateToLogin={() => handleAuthNavigation('Login')}
            onSignupSuccess={handleSignupSuccess}
          />
        );
      default:
        return (
          <WelcomeScreen 
            onNavigateToLogin={() => handleAuthNavigation('Login')}
            onNavigateToSignup={() => handleAuthNavigation('Signup')}
          />
        );
    }
  };

  // Render main app screens
  const renderMainAppScreens = () => {
    // Handle ArticleDetail screen
    if (currentScreen === 'ArticleDetail' && selectedArticle) {
  return (
    <AIShortCut
      article={selectedArticle}
      onBack={handleBackFromArticle}
      currentUser={currentUser}
      onReadFullArticle={handleFullArticleNavigation} // Add this new prop
      key="article-detail"
    />
  );
}
// Add this new case after the ArticleDetail case:
// Update the FullArticle case:
if (currentScreen === 'FullArticle' && selectedArticle) {
  return (
    <FullArticleScreen
      article={selectedArticle}
      onBack={handleBackFromFullArticle} // Use the new back handler
      currentUser={currentUser}
      key="full-article"
    />
  );
}


    // Handle main screens
    switch(currentScreen) {
      case 'Home':
        return (
          <HomeScreen 
            onNavigate={handleMainNavigation}
            onArticleDetail={handleArticleDetail}
            currentUser={currentUser}
            onLogout={handleLogout}
            key="home" 
          />
        );
      case 'Profile':
        return (
          <ProfileScreen 
            onNavigate={handleMainNavigation}
            currentUser={currentUser}
            onLogout={handleLogout}
            key="profile" 
          />
        );
      case 'Saved':
        return (
          <SavedScreen 
            onNavigate={handleMainNavigation}
            onArticleDetail={handleArticleDetail}
            currentUser={currentUser}
            onLogout={handleLogout}
            key="saved" 
          />
        );
      default:
        return (
          <HomeScreen 
            onNavigate={handleMainNavigation}
            onArticleDetail={handleArticleDetail}
            currentUser={currentUser}
            onLogout={handleLogout}
            key="home-default" 
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
    <ThemeContext.Provider value={theme}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        
        {/* Show authentication screens if not authenticated, main app if authenticated */}
        {isAuthenticated ? renderMainAppScreens() : renderAuthScreens()}
      </View>
    </ThemeContext.Provider></SafeAreaProvider>
  );
}
