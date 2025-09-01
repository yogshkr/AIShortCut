import React, { useState, useCallback, useMemo } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth'; // ADDED sendEmailVerification, signOut
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
  Platform, Image, Linking
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

  // Validation
  const validateForm = useCallback(() => {
    const newErrors= {};
    
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

  // UPDATED signup handler: send verification + sign out + route hint
  const handleSignup = useCallback(async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const email = formData.email.trim().toLowerCase();

      // 1) Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        formData.password
      );
      const user = userCredential.user;

      // 2) Update profile with name (optional but nice)
      const displayName = formData.name.trim();
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // 3) Create Firestore user doc (non-sensitive defaults)
      await setDoc(doc(db, 'users', user.uid), {
        name: displayName,
        email,
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

      // 4) Send verification email
      await sendEmailVerification(user);

      // 5) Sign out to prevent unverified access
      await signOut(auth);

      // 6) Tell user and provide next steps
      Alert.alert(
        'Verify your email',
        `We sent a verification link to ${email}. Open that email and tap the link, then Sign In.`,
        [
          { text: 'Resend', onPress: async () => {
              try {
                // Attempt to sign back in silently isn't possible here;
                // sendEmailVerification requires a currentUser. Since we signed out,
                // we can instead prompt user to login and use your Verify screen to resend.
                // Simpler path: Just tell them to check spam/promotions and try Sign In.
                Alert.alert('Note', 'Please check spam/promotions. You can also use "Resend verification" from the Verify screen after signing in.');
              } catch (err) {
                Alert.alert('Resend failed', 'Please sign in and use the resend option on the Verify screen.');
              }
            } 
          },
          { text: 'Go to Sign In', onPress: onNavigateToLogin }
        ]
      );

    } catch (error) {
      if (__DEV__) console.error('Signup error:', error);

      let errorMessage = 'Account creation failed. Please try again.';
      switch (error?.code) {
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
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData.name, formData.email, formData.password, validateForm, onNavigateToLogin]);

  // Form updates
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

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

  // Styles (unchanged)
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

  const showTerms = useCallback(() => {
Alert.alert(
'Terms of Service',
[
'- Use: You must be 13+ and provide accurate information.',
'- Account: Keep credentials secure; do not share your account.',
'- Content & License: We grant you a limited, non-transferable license to use the app. Do not reverse engineer, abuse, or misuse the service.',
'- Payments: If any in-app purchases/subscriptions are offered, Google Play Billing terms apply and local laws may require disclosures/refunds per policy.',
'- Prohibited: Spam, fraud, harassment, illegal content/activity.',
'- Data: Your use is also governed by our Privacy Policy.',
'- Termination: We may suspend/terminate accounts for policy violations.',
'- Liability: Service provided “as is”; to the maximum extent permitted by law, we limit liability for indirect or consequential damages.',
'- Changes: We may update these terms; continued use means acceptance.',
].join('\n'),
[
{ text: 'Close', style: 'cancel' },
],
{ cancelable: true }
);
}, []);

const showPrivacy = useCallback(() => {
Alert.alert(
'Privacy Policy',
[
'- Data We Collect: Name, email, password (hashed by Firebase Auth), usage and device data (as described in our full policy).',
'- Purpose: To create and secure your account, provide features, prevent abuse, improve the app, and comply with legal obligations.',
'- Storage & Security: Auth managed by Firebase; we apply reasonable technical & organizational measures.',
'- Sharing: We do not sell personal data. We may share with service providers (e.g., Firebase) and as required by law.',
'- Retention: We keep data only as long as needed for the purposes above or as required by law.',
'- Your Choices: Access, update, or delete your data; request account deletion from in-app settings or support.',
'- Children: Not intended for users under 13.',
'- International Transfers: Data may be processed outside your country consistent with applicable law.',
'- Changes: We may update this policy; material changes will be highlighted in-app.',
].join('\n'),
[
{ text: 'Close', style: 'cancel' },
],
{ cancelable: true }
);
}, []);

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
            <Image source={require("../../assets/icon.png")} style={styles.logoImage} resizeMode="contain" />
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

          <View style={[styles.terms, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>
<Text style={termsTextStyle}>By creating an account, you agree to our </Text>
<TouchableOpacity 
            onPress={() => Linking.openURL('https://pythonhub.in/terms-of-service-aishortcut/')} activeOpacity={0.7}>
<Text style={[termsTextStyle, termsLinkStyle]}>Terms of Service</Text>
</TouchableOpacity>
<Text style={termsTextStyle}> and </Text>
<TouchableOpacity 
            onPress={() => Linking.openURL('https://pythonhub.in/privacy-policy-aishortcut/')} activeOpacity={0.7}>
<Text style={[termsTextStyle, termsLinkStyle]}>Privacy Policy</Text>
</TouchableOpacity>
<Text style={termsTextStyle}>.</Text>
</View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
});

SignupScreen.displayName = 'SignupScreen';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    // paddingTop: 60, 
    paddingHorizontal: 30, 
    // paddingBottom: 20 
    paddingBottom: 10,},
  backButton: { alignSelf: 'flex-start', padding: 8, 
    marginBottom: 10
   },
  backIcon: { fontSize: 28, fontWeight: 'bold' },
  titleContainer: { alignItems: 'center' },
  logoIcon: { fontSize: 60, marginBottom: 15 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 30 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  form: { marginBottom: 30 },
  actions: { marginBottom: 30 },
  loginPrompt: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 16 },
  loginLink: { fontSize: 16, fontWeight: 'bold' },
  terms: { paddingBottom: 40, paddingHorizontal: 10 },
  termsText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  termsLink: { fontWeight: '600' },
  logoImage: {
  width: 110,
  height: 110,
  // marginBottom: 15,
},
});

export default SignupScreen;
