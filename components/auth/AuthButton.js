import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../App';

const AuthButton = React.memo(({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false 
}) => {
  const theme = useTheme();

  // Memoized button style calculation
  const buttonStyle = useMemo(() => {
    const baseStyle = styles.button;
    
    if (variant === 'primary') {
      return [
        baseStyle,
        {
          backgroundColor: disabled ? theme.colors.buttonBackground : theme.colors.primaryButton,
          borderWidth: 0,
        }
      ];
    }
    
    return [
      baseStyle,
      {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.border,
      }
    ];
  }, [variant, disabled, theme.colors.buttonBackground, theme.colors.primaryButton, theme.colors.border]);

  // Memoized text style calculation
  const textStyle = useMemo(() => {
    const baseStyle = styles.buttonText;
    
    if (variant === 'primary') {
      return [
        baseStyle,
        { color: disabled ? theme.colors.buttonText : 'white' }
      ];
    }
    
    return [
      baseStyle,
      { color: theme.colors.primaryText }
    ];
  }, [variant, disabled, theme.colors.buttonText, theme.colors.primaryText]);

  // Memoized activity indicator color
  const indicatorColor = useMemo(() => {
    return variant === 'primary' ? 'white' : theme.colors.primaryButton;
  }, [variant, theme.colors.primaryButton]);

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={indicatorColor} 
          size="small" 
        />
      ) : (
        <Text style={textStyle}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

AuthButton.displayName = 'AuthButton';

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
