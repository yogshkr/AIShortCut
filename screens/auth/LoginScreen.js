import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform, Image
} from 'react-native';
import { signInWithEmailAndPassword, sendEmailVerification, signOut, sendPasswordResetEmail  } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
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

  // Helper
  const normalizeEmail = useCallback((v) => v.trim().toLowerCase(), []);

  // Validation
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

  // Login with email verification gate
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const email = normalizeEmail(formData.email);
      const { user } = await signInWithEmailAndPassword(auth, email, formData.password);

      // Ensure latest verification status
      await user.reload();

      if (user.emailVerified) {
        // Verified → let onAuthStateChanged handle navigation
        return;
      }

      // Not verified → give options
      Alert.alert(
        'Email not verified',
        `The account for ${email} is not verified yet.`,
        [
          {
            text: 'Use another email/Try again',
            onPress: async () => {
              try { await signOut(auth); } catch {}
            }
          },
          {
            text: 'Resend verification',
            onPress: async () => {
              try {
                await sendEmailVerification(user);
                Alert.alert('Verification sent', 'Check your inbox (and spam). After verifying, sign in again.');
                try { await signOut(auth); } catch {}
              } catch (e) {
                Alert.alert('Resend failed', 'Please try again in a moment.');
              }
            }
          }
        ]
      );
    } catch (error) {
      if (__DEV__) console.error('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';
      switch (error?.code) {
        case 'auth/user-not-found':
                Alert.alert('No account found with this email address.');
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
                Alert.alert('Incorrect password. Please try again.');
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
                Alert.alert('Please enter a valid email address.');
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
                Alert.alert('Too many failed attempts. Please try again later.');
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
                Alert.alert('Network error. Please check your connection.');
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
                Alert.alert('Login failed. Please try again.');
          errorMessage = 'Login failed. Please try again.';
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.password, normalizeEmail, validateForm]);

  // Form updates
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  }, [errors]);
// Memoized email handler
  const handleEmailChange = useCallback((value) => {
    updateFormData('email', value);
  }, [updateFormData]);
  // Memoized password handler
  const handlePasswordChange = useCallback((value) => {
    updateFormData('password', value);
  }, [updateFormData]);

const handleForgotPassword = useCallback(async () => {
  const raw = formData.email || '';
  const email = normalizeEmail(raw);

  // Basic validation before calling Firebase
  if (!email) {
    Alert.alert('Enter email', 'Please enter your email to reset your password.');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    Alert.alert('Invalid email', 'Please enter a valid email address.');
    return;
  }

  // Optional: prevent double taps by toggling loading
  setLoading(true);
  try {
    await sendPasswordResetEmail(auth, email);
    Alert.alert(
      'Reset email sent',
      'Check your inbox (and spam). Open the email and follow the link to create a new password.'
    );
  } catch (error) {
    if (__DEV__) console.error('Forgot password error:', error);

    let message = 'Could not send reset email. Please try again.';
    switch (error?.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection.';
        break;
      default:
        message = 'Could not send reset email. Please try again.';
    }
    Alert.alert('Reset failed', message);
  } finally {
    setLoading(false);
  }
}, [formData.email, normalizeEmail, setLoading]);

  // Memoized style objects (unchanged)
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

  // ... your return JSX continues here

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
            <Image source={require("E:/portfolio-projects/AIShortCut/assets/AIShortCut_logo-removebg.png")} style={styles.logoImage} resizeMode="contain" />
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
              onPress={handleForgotPassword}
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
  logoImage: {
  width: 140,
  height: 140,
  // marginBottom: 15,
},
});

export default LoginScreen;
