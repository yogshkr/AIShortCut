import React, { useState, useCallback, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../App';

const AuthInput = React.memo(({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error = null 
}) => {
  const theme = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Memoized password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  // Memoized focus handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Memoized dynamic input container style
  const inputContainerStyle = useMemo(() => [
    styles.inputContainer,
    {
      backgroundColor: theme.colors.cardBackground,
      borderColor: error 
        ? '#dc2626' 
        : (isFocused ? theme.colors.primaryButton : theme.colors.border)
    }
  ], [theme.colors.cardBackground, theme.colors.primaryButton, theme.colors.border, error, isFocused]);

  // Memoized label style
  const labelStyle = useMemo(() => [
    styles.label,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  // Memoized input style
  const inputStyle = useMemo(() => [
    styles.input,
    { color: theme.colors.primaryText }
  ], [theme.colors.primaryText]);

  // Memoized secure text entry value
  const isSecureEntry = useMemo(() => {
    return secureTextEntry && !isPasswordVisible;
  }, [secureTextEntry, isPasswordVisible]);

  return (
    <View style={styles.container}>
      <Text style={labelStyle}>
        {label}
      </Text>
      
      <View style={inputContainerStyle}>
        <TextInput
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.secondaryText}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecureEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCorrect={false}
          spellCheck={false}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
          >
            <Text style={styles.eyeIcon}>
              {isPasswordVisible ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
});

AuthInput.displayName = 'AuthInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
});

export default AuthInput;
