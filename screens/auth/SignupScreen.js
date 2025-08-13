// screens/auth/SignupScreen.js
import React, { useState } from 'react';
// Add Firebase imports:
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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

const SignupScreen = ({ onBack, onNavigateToLogin }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
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
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// Replace handleSignup function with:
const handleSignup = async () => {
  if (!validateForm()) return;
  
  setLoading(true);
  
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email.trim(),
      formData.password
    );
    
    const user = userCredential.user;
    
    // Update user profile with name
    await updateProfile(user, {
      displayName: formData.name.trim(),
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: formData.name.trim(),
      email: formData.email.trim(),
      createdAt: new Date().toISOString(),
      preferences: {
        notifications: true,
        darkMode: false,
        topics: []
      },
      stats: {
        articlesRead: 0,
        articlesLiked: 0,
        articlesSaved: 0
      }
    });
    
    console.log('Signup successful:', user.email);
    Alert.alert(
      "🎉 Account Created!",
      `Welcome to AI ShortCut, ${formData.name}! Your account has been created successfully.`
    );
    
  } catch (error) {
    console.error('Signup error:', error);
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
    }
    
    Alert.alert("Signup Failed", errorMessage);
  } finally {
    setLoading(false);
  }
};


  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={[styles.backIcon, { color: theme.colors.primaryText }]}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.logoIcon}>🤖</Text>
            <Text style={[styles.title, { color: theme.colors.primaryText }]}>
              Join AI ShortCut
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
              Create your account to get started
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Signup Form */}
          <View style={styles.form}>
            <AuthInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              autoCapitalize="words"
              error={errors.name}
            />

            <AuthInput
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              error={errors.email}
            />

            <AuthInput
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              error={errors.password}
            />

            <AuthInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <AuthButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              variant="primary"
            />

            <View style={styles.loginPrompt}>
              <Text style={[styles.loginText, { color: theme.colors.secondaryText }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={[styles.loginLink, { color: theme.colors.accentText }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.terms}>
            <Text style={[styles.termsText, { color: theme.colors.secondaryText }]}>
              By creating an account, you agree to our{' '}
              <Text style={[styles.termsLink, { color: theme.colors.accentText }]}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={[styles.termsLink, { color: theme.colors.accentText }]}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

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
