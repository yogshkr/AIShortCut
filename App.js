import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Appearance, Alert, Platform, BackHandler, ToastAndroid, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';
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
const ThemeContext = createContext(undefined);

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
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [isSystemPreference, setIsSystemPreference] = useState(true);
const saveTimeoutRef = useRef(null);
  // NEW: Helper to save theme prefs to Firestore
  // Updated: Save function takes explicit params to avoid stale closures
  const saveThemePreferences = useCallback(async (userId, newIsSystemPreference, newIsDarkMode) => {
    if (!userId) return;

    // Debounce to prevent rapid duplicate saves
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, {
          preferences: {
            theme: {
              isSystemPreference: newIsSystemPreference,
              isDarkMode: newIsDarkMode,
            }
          }
        }, { merge: true });
        console.log('Theme preferences saved successfully'); // Optional: For debugging
      } catch (error) {
        console.error('Error saving theme prefs:', error);
      }
    }, 300); // 300ms debounce
  }, []);

  // Memoized theme object to prevent unnecessary re-renders
  const theme = useMemo(() => ({
    isDark: isDarkMode,
    isSystemPreference,
    toggleDarkMode: () => {
      const newIsSystemPreference = false;
      const newIsDarkMode = !isDarkMode; // Calculate new value first
      setIsSystemPreference(newIsSystemPreference);
      setIsDarkMode(newIsDarkMode);
      if (currentUser?.uid) {
        saveThemePreferences(currentUser.uid, newIsSystemPreference, newIsDarkMode);
      }
    },
    resetToSystemPreference: () => {
      const newIsSystemPreference = true;
      const systemColorScheme = Appearance.getColorScheme();
      const newIsDarkMode = systemColorScheme === 'dark';
      setIsSystemPreference(newIsSystemPreference);
      setIsDarkMode(newIsDarkMode);
      if (currentUser?.uid) {
        saveThemePreferences(currentUser.uid, newIsSystemPreference, newIsDarkMode);
      }
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
  }), [isDarkMode, currentUser?.uid, saveThemePreferences]);

  // System theme + Firebase auth listener
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log('[auth] onAuthStateChanged fired. user:', !!user);
    try {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
        };
        setCurrentUser(userData);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));

        // Ensure main app starts from a clean root (only relevant on actual auth changes)
        setCurrentScreen('Home');
        setSelectedArticle(null);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('currentUser');

        // Ensure auth flow starts from Welcome
        setAuthScreen('Welcome');
        // Clear any residual app state
        setCurrentScreen('Home');
        setSelectedArticle(null);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []); // Empty deps: subscribe once on mount

// NEW: Separate useEffect for theme listener (only adds/removes listener based on isSystemPreference)
useEffect(() => {
  if (!isSystemPreference) return; // Don't listen if manual mode

  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    setIsDarkMode(colorScheme === 'dark');
  });

  return () => subscription?.remove();
}, [isSystemPreference]);

// NEW: Load theme prefs from Firestore after auth (only when user changes)
  useEffect(() => {
    const loadThemePreferences = async (userId) => {
      if (!userId) return;
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const prefs = userDoc.data()?.preferences?.theme;
          if (prefs) {
            setIsSystemPreference(prefs.isSystemPreference ?? true);
            setIsDarkMode(prefs.isDarkMode ?? (Appearance.getColorScheme() === 'dark'));
          }
        }
      } catch (error) {
        console.error('Error loading theme prefs:', error);
        // Fallback to defaults silently
      }
    };

    if (isAuthenticated && currentUser?.uid) {
      loadThemePreferences(currentUser.uid);
    }
  }, [isAuthenticated, currentUser?.uid]); // Runs on auth/user change

  // ... (rest of your code remains the same: back handler, renders, etc.)
useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);
  // Auth flow navigation (callbacks should NOT flip isAuthenticated or force Home)
  const handleAuthNavigation = useCallback((screenName) => {
    setAuthScreen(screenName);
  }, []);

  const handleLoginSuccess = useCallback((userData) => {
    // Optional: update local user immediately for UI; Firebase listener will flip isAuthenticated
    setCurrentUser(userData ?? null);
    // Do NOT setIsAuthenticated(true)
    // Do NOT setCurrentScreen('Home')
  }, []);

  const handleSignupSuccess = useCallback((userData) => {
    setCurrentUser(userData ?? null);
    // Do NOT setIsAuthenticated(true)
    // Do NOT setCurrentScreen('Home')
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while logging out.');
    }
  }, []);

  // Main app navigation
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

  // Render auth branch
  const renderAuthScreens = useCallback(() => {
    switch (authScreen) {
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

  // Render main app branch
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

    switch (currentScreen) {
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
  }, [
    currentScreen,
    selectedArticle,
    currentUser,
    handleMainNavigation,
    handleArticleDetail,
    handleLogout,
    handleBackFromArticle,
    handleFullArticleNavigation,
    handleBackFromFullArticle,
  ]);

  // ANDROID BACK HANDLER: pop in-app "stack" first; double-press exit on root
  const lastBackPressRef = useRef(0);
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      // Authenticated branch
      if (isAuthenticated) {
        if (currentScreen === 'FullArticle' && selectedArticle) {
          setCurrentScreen('ArticleDetail');
          return true;
        }
        if (currentScreen === 'ArticleDetail' && selectedArticle) {
          setSelectedArticle(null);
          setCurrentScreen('Home');
          return true;
        }
        if (currentScreen === 'Profile' || currentScreen === 'Saved') {
          setCurrentScreen('Home');
          return true;
        }
        if (currentScreen === 'Home' && !selectedArticle) {
          const now = Date.now();
          if (now - lastBackPressRef.current < 1500) {
            return false; // allow system to exit
          }
          lastBackPressRef.current = now;
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          return true; // consume first press
        }
        return false;
      }

      // Unauthenticated branch
      if (!isAuthenticated) {
        if (authScreen === 'Login' || authScreen === 'Signup') {
          setAuthScreen('Welcome');
          return true;
        }
        if (authScreen === 'Welcome') {
          const now = Date.now();
          if (now - lastBackPressRef.current < 1500) {
            return false; // exit app
          }
          lastBackPressRef.current = now;
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          return true;
        }
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isAuthenticated, currentScreen, authScreen, selectedArticle]);

  // Loading guard: wait for Firebase to resolve auth status to avoid UI races
  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
          <ActivityIndicator size="large" color={isDarkMode ? '#60a5fa' : '#2563eb'} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor:isDarkMode ? '#0f172a' : '#f1f5f9'}} edges={['top', 'bottom']}>
        <ThemeContext.Provider value={theme}>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            {isAuthenticated ? renderMainAppScreens() : renderAuthScreens()}
          </View>
        </ThemeContext.Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
