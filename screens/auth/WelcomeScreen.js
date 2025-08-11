// screens/auth/WelcomeScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  StatusBar 
} from 'react-native';
import { useTheme } from '../../App';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ onNavigateToLogin, onNavigateToSignup }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🤖</Text>
          <Text style={[styles.logoText, { color: theme.colors.primaryText }]}>
            AI ShortCut
          </Text>
        </View>
        
        <Text style={[styles.tagline, { color: theme.colors.secondaryText }]}>
          Your Daily AI News Summary
        </Text>
        
        <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
          Stay ahead of the AI revolution with curated news, insights, and breakthroughs delivered daily.
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📰</Text>
          <Text style={[styles.featureText, { color: theme.colors.primaryText }]}>
            Curated AI News
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>💾</Text>
          <Text style={[styles.featureText, { color: theme.colors.primaryText }]}>
            Save & Organize
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🌙</Text>
          <Text style={[styles.featureText, { color: theme.colors.primaryText }]}>
            Dark Mode
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: theme.colors.primaryButton }]}
          onPress={onNavigateToSignup}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
          onPress={onNavigateToLogin}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.primaryText }]}>
            I Already Have an Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.secondaryText }]}>
          Join thousands of AI enthusiasts
        </Text>
      </View>
    </View>
  );
};

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
    borderColor: 'rgba(107, 114, 128, 0.2)',
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
});

export default WelcomeScreen;
