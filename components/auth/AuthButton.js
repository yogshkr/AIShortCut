// components/auth/AuthButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../App';

const AuthButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false 
}) => {
  const theme = useTheme();

  const getButtonStyle = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: disabled ? theme.colors.buttonBackground : theme.colors.primaryButton,
        borderWidth: 0,
      };
    } else {
      return {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.border,
      };
    }
  };

  const getTextStyle = () => {
    if (variant === 'primary') {
      return {
        color: disabled ? theme.colors.buttonText : 'white',
      };
    } else {
      return {
        color: theme.colors.primaryText,
      };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle()]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? 'white' : theme.colors.primaryButton} 
          size="small" 
        />
      ) : (
        <Text style={[styles.buttonText, getTextStyle()]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AuthButton;
