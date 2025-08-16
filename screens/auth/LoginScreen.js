import React, { useState, useCallback, useMemo } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
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

const LoginScreen = React.memo(({ onBack, onNavigateToSignup }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Memoized validation function
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  // Memoized login handler
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(
        auth, 
        formData.email.trim().toLowerCase(), 
        formData.password
      );
      // onAuthStateChanged will handle navigation
    } catch (error) {
      if (__DEV__) {
        console.error('Login error:', error);
      }
      
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = 'Login failed. Please try again.';
      }
      
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.password, validateForm]);

  // Memoized form update handler
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Memoized email handler
  const handleEmailChange = useCallback((value) => {
    updateFormData('email', value);
  }, [updateFormData]);

  // Memoized password handler
  const handlePasswordChange = useCallback((value) => {
    updateFormData('password', value);
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

  const forgotPasswordTextStyle = useMemo(() => [
    styles.forgotPasswordText,
    { color: theme.colors.accentText }
  ], [theme.colors.accentText]);

  const signupTextStyle = useMemo(() => [
    styles.signupText,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const signupLinkStyle = useMemo(() => [
    styles.signupLink,
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
              Welcome Back
            </Text>
            <Text style={subtitleStyle}>
              Sign in to continue reading AI news
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
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              error={errors.password}
            />

            <TouchableOpacity 
              style={styles.forgotPassword}
              activeOpacity={0.7}
            >
              <Text style={forgotPasswordTextStyle}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <AuthButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              variant="primary"
              // disabled={loading}
            />

            <View style={styles.signupPrompt}>
              <Text style={signupTextStyle}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity 
                onPress={onNavigateToSignup}
                activeOpacity={0.7}
              >
                <Text style={signupLinkStyle}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
});

LoginScreen.displayName = 'LoginScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 30,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 10,
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
  },
  signupLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
