import React, { useState, useCallback, useMemo } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useTheme } from '../../App';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';

const SignupScreen = React.memo(({ onBack, onNavigateToLogin }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Memoized validation function
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password must be less than 128 characters';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name, formData.email, formData.password, formData.confirmPassword]);

  // Memoized signup handler
  const handleSignup = useCallback(async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password
      );
      
      const user = userCredential.user;
      
      // Update user profile with name
      await updateProfile(user, {
        displayName: formData.name.trim(),
      });
      
      // Create user document in Firestore with better structure
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        likedArticles: [],
        savedArticles: [],
        readArticles: [],
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        preferences: {
          notifications: true,
          darkMode: false,
          topics: []
        },
        stats: {
          articlesRead: 0,
          articlesLiked: 0,
          articlesSaved: 0,
          totalReadingTime: 0
        },
        readingProgress: {}
      });
      
      Alert.alert(
        "🎉 Account Created!",
        `Welcome to AI ShortCut, ${formData.name.trim()}! Your account has been created successfully.`
      );
      
    } catch (error) {
      if (__DEV__) {
        console.error('Signup error:', error);
      }
      
      let errorMessage = 'Account creation failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Account creation failed. Please try again.';
      }
      
      Alert.alert("Signup Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData.name, formData.email, formData.password, validateForm]);

  // Memoized form update handler
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Memoized field handlers
  const handleNameChange = useCallback((value) => {
    updateFormData('name', value);
  }, [updateFormData]);

  const handleEmailChange = useCallback((value) => {
    updateFormData('email', value);
  }, [updateFormData]);

  const handlePasswordChange = useCallback((value) => {
    updateFormData('password', value);
  }, [updateFormData]);

  const handleConfirmPasswordChange = useCallback((value) => {
    updateFormData('confirmPassword', value);
  }, [updateFormData]);

  // Memoized dynamic styles
  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const backIconStyle = useMemo(() => [
    styles.backIcon,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const titleStyle = useMemo(() => [
    styles.title,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const subtitleStyle = useMemo(() => [
    styles.subtitle,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const loginTextStyle = useMemo(() => [
    styles.loginText,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const loginLinkStyle = useMemo(() => [
    styles.loginLink,
    { color: theme.colors.accentText }
  ], [theme.colors.accentText]);

  const termsTextStyle = useMemo(() => [
    styles.termsText,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const termsLinkStyle = useMemo(() => [
    styles.termsLink,
    { color: theme.colors.accentText }
  ], [theme.colors.accentText]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={containerStyle}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={backIconStyle}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.logoIcon}>🤖</Text>
            <Text style={titleStyle}>
              Join AI ShortCut
            </Text>
            <Text style={subtitleStyle}>
              Create your account to get started
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.form}>
            <AuthInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={handleNameChange}
              autoCapitalize="words"
              error={errors.name}
            />

            <AuthInput
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <AuthInput
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              error={errors.password}
            />

            <AuthInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>

          <View style={styles.actions}>
            <AuthButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              variant="primary"
              // disabled={loading}
            />

            <View style={styles.loginPrompt}>
              <Text style={loginTextStyle}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity 
                onPress={onNavigateToLogin}
                activeOpacity={0.7}
              >
                <Text style={loginLinkStyle}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.terms}>
            <Text style={termsTextStyle}>
              By creating an account, you agree to our{' '}
              <Text style={termsLinkStyle}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={termsLinkStyle}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
});

SignupScreen.displayName = 'SignupScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  form: {
    marginBottom: 30,
  },
  actions: {
    marginBottom: 30,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  terms: {
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: '600',
  },
});

export default SignupScreen;
