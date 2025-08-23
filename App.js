import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Appearance, Alert } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Import main app screens
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';  
import SavedScreen from './screens/SavedScreen';
import FullArticleScreen from './screens/FullArticleScreen';
import AIShortCut from './screens/AIShortCut';

// Import authentication screens
import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';

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
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('Welcome');
  const [loading, setLoading] = useState(true);

  // Main app navigation state
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemPreference, setIsSystemPreference] = useState(true);

  // Memoized theme object to prevent unnecessary re-renders
  const theme = useMemo(() => ({
    isDark: isDarkMode,
    isSystemPreference,
    toggleDarkMode: () => {
      setIsSystemPreference(false);
      setIsDarkMode(prev => !prev);
    },
    resetToSystemPreference: () => {
      setIsSystemPreference(true);
      const systemColorScheme = Appearance.getColorScheme();
      setIsDarkMode(systemColorScheme === 'dark');
    },
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
  }), [isDarkMode, isSystemPreference]);

  // Optimized useEffect with proper cleanup
  useEffect(() => {
    const systemColorScheme = Appearance.getColorScheme();
    setIsDarkMode(systemColorScheme === 'dark');

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (isSystemPreference) {
        setIsDarkMode(colorScheme === 'dark');
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
          };
          setCurrentUser(userData);
          setIsAuthenticated(true);
          await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          setAuthScreen('Welcome');
          await AsyncStorage.removeItem('currentUser');
        }
      } catch (error) {
        // Silent error handling for production
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription?.remove();
      unsubscribe();
    };
  }, [isSystemPreference]);

  // Optimized navigation handlers with useCallback
  const handleAuthNavigation = useCallback((screenName) => {
    setAuthScreen(screenName);
  }, []);

  const handleLoginSuccess = useCallback((userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setCurrentScreen('Home');
  }, []);

  const handleSignupSuccess = useCallback((userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setCurrentScreen('Home');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while logging out.');
    }
  }, []);

  const handleMainNavigation = useCallback((screenName) => {
    setCurrentScreen(screenName);
    setSelectedArticle(null);
  }, []);

  const handleArticleDetail = useCallback((article) => {
    setSelectedArticle(article);
    setCurrentScreen('ArticleDetail');
  }, []);

  const handleBackFromArticle = useCallback(() => {
    setCurrentScreen('Home');
    setSelectedArticle(null);
  }, []);

  const handleBackFromFullArticle = useCallback(() => {
    setCurrentScreen('ArticleDetail');
  }, []);

  const handleFullArticleNavigation = useCallback(() => {
    setCurrentScreen('FullArticle');
  }, []);

  // Memoized authentication screens renderer
  const renderAuthScreens = useCallback(() => {
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
  }, [authScreen, handleAuthNavigation, handleLoginSuccess, handleSignupSuccess]);

  // Memoized main app screens renderer
  const renderMainAppScreens = useCallback(() => {
    if (currentScreen === 'ArticleDetail' && selectedArticle) {
      return (
        <AIShortCut
          article={selectedArticle}
          onBack={handleBackFromArticle}
          currentUser={currentUser}
          onReadFullArticle={handleFullArticleNavigation}
          key="article-detail"
        />
      );
    }

    if (currentScreen === 'FullArticle' && selectedArticle) {
      return (
        <FullArticleScreen
          article={selectedArticle}
          onBack={handleBackFromFullArticle}
          currentUser={currentUser}
          key="full-article"
        />
      );
    }

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
  }, [currentScreen, selectedArticle, currentUser, handleMainNavigation, handleArticleDetail, handleLogout, handleBackFromArticle, handleFullArticleNavigation, handleBackFromFullArticle]);

  return (
    <SafeAreaProvider><SafeAreaView style={{flex:1, backgroundColor:isDarkMode ? '#0f172a' : '#f1f5f9',}} edges={['top', 'bottom']}>
      <ThemeContext.Provider value={theme}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
          {isAuthenticated ? renderMainAppScreens() : renderAuthScreens()}
        </View>
      </ThemeContext.Provider></SafeAreaView>
    </SafeAreaProvider>
  );
}