import React, { useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../App';

const WelcomeScreen = React.memo(({ onNavigateToLogin, onNavigateToSignup }) => {
  const theme = useTheme();

  // Memoized navigation handlers
  const handleNavigateToLogin = useCallback(() => {
    onNavigateToLogin();
  }, [onNavigateToLogin]);

  const handleNavigateToSignup = useCallback(() => {
    onNavigateToSignup();
  }, [onNavigateToSignup]);

  // Memoized dynamic styles
  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const logoTextStyle = useMemo(() => [
    styles.logoText,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const taglineStyle = useMemo(() => [
    styles.tagline,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const descriptionStyle = useMemo(() => [
    styles.description,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  const featuresSectionStyle = useMemo(() => [
    styles.featuresSection,
    { borderColor: theme.colors.border }
  ], [theme.colors.border]);

  const featureTextStyle = useMemo(() => [
    styles.featureText,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const primaryButtonStyle = useMemo(() => [
    styles.primaryButton,
    { backgroundColor: theme.colors.primaryButton }
  ], [theme.colors.primaryButton]);

  const secondaryButtonStyle = useMemo(() => [
    styles.secondaryButton,
    { borderColor: theme.colors.border }
  ], [theme.colors.border]);

  const secondaryButtonTextStyle = useMemo(() => [
    styles.secondaryButtonText,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  const footerTextStyle = useMemo(() => [
    styles.footerText,
    { color: theme.colors.secondaryText }
  ], [theme.colors.secondaryText]);

  // Memoized features data
  const features = useMemo(() => [
    { icon: '📰', text: 'Curated AI News' },
    { icon: '💾', text: 'Save & Organize' },
    { icon: '🌙', text: 'Dark Mode' }
  ], []);

  return (
    <View style={containerStyle}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Image source={require("E:/portfolio-projects/AIShortCut/assets/AIShortCut_logo-removebg.png")} style={styles.logoImage} resizeMode="contain" />
          {/* <Text style={logoTextStyle}>
            AI ShortCut
          </Text> */}
        </View>
        
        <Text style={taglineStyle}>
          Your Daily AI News Summary
        </Text>
        
        <Text style={descriptionStyle}>
          Stay ahead of the AI revolution with curated news, insights, and breakthroughs delivered daily.
        </Text>
      </View>

      <View style={featuresSectionStyle}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={featureTextStyle}>
              {feature.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={primaryButtonStyle}
          onPress={handleNavigateToSignup}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={secondaryButtonStyle}
          onPress={handleNavigateToLogin}
          activeOpacity={0.8}
        >
          <Text style={secondaryButtonTextStyle}>
            I Already Have an Account
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={footerTextStyle}>
          Join thousands of AI enthusiasts
        </Text>
      </View>
    </View>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 15,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionSection: {
    paddingVertical: 40,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 2,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  logoImage: {
  width: 180,
  height: 180,
  // marginBottom: 15,
},

});

export default WelcomeScreen;
