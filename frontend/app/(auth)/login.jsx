// app/(auth)/login.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Dimensions,
  ImageBackground,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#2C1810',
  primaryLight: '#8B7355',
  secondary: '#D4A373',
  background: '#1A0F0A',
  surface: '#F5F0E1',
  surfaceLight: '#FFF8EE',
  textPrimary: '#2C1810',
  textSecondary: '#6B4C3A',
  border: '#E0D5C0',
  borderFocused: '#2C1810',
  inputBg: '#FFFFFF',
  placeholder: '#A89880',
  error: '#B22222',
  errorBg: '#FDF0F0',
  shadow: 'rgba(0,0,0,0.3)',
  overlay: 'rgba(0,0,0,0.30)',
};

const FONTS = {
  logo: {
    medium: 'AllrounderMonumentTest-Medium',
  },
  body: {
    regular: 'LibreBaskerville-Regular',
    medium: 'LibreBaskerville-Medium',
    semibold: 'LibreBaskerville-SemiBold',
    italic: 'LibreBaskerville-Italic',
  },
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const validate = () => {
    const e = {};
    if (!email.trim()) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const userData = await login(email, password);
      
      if (userData.role === 'admin' || userData.role === 'librarian') {
        router.replace('/(admin)/');
      } else {
        router.replace('/(member)/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.error ||
                           err.message ||
                           'Invalid credentials. Please try again.';
      setErrors({ general: errorMessage });
      Alert.alert('Authentication Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={require('../../assets/login-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LIBRIUM</Text>
              <View style={styles.logoUnderline} />
            </View>

            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>
                "Libraries store the energy that fuels the imagination."
              </Text>
              <Text style={styles.quoteAuthor}>— Sidney Sheldon</Text>
            </View>

            <View style={styles.card}>
              
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>WELCOME</Text>
                <View style={styles.welcomeDivider} />
              </View>

              {errors.general && (
                <View style={styles.generalErrorContainer}>
                  <Feather name="alert-circle" size={16} color={COLORS.error} />
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                </View>
              )}

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email:</Text>
                <View style={[
                  styles.inputContainer, 
                  errors.email && styles.inputError,
                  focusedField === 'email' && styles.inputFocused
                ]}>
                  <Feather name="mail" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    placeholder="name@institution.edu"
                    placeholderTextColor={COLORS.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    selectionColor={COLORS.primary}
                    underlineColorAndroid="transparent"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password:</Text>
                <View style={[
                  styles.inputContainer, 
                  errors.password && styles.inputError,
                  focusedField === 'password' && styles.inputFocused
                ]}>
                  <Feather name="lock" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.placeholder}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                    selectionColor={COLORS.primary}
                    underlineColorAndroid="transparent"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={18} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  activeOpacity={0.7}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Feather name="check" size={10} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </TouchableOpacity>
                
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotLink}>Forgot Password</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <Text style={styles.signInButtonText}>Signing in...</Text>
                ) : (
                  <Text style={styles.signInButtonText}>SIGN IN</Text>
                )}
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'web' ? 60 : 40,
  },
  contentWrapper: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontFamily: FONTS.logo.medium,
    fontSize: width < 380 ? 72 : 88,
    fontWeight: 'normal',
    letterSpacing: 4,
    color: COLORS.surface,
    textShadow: '0px 2px 4px rgba(0,0,0,0.3)',
  },
  logoUnderline: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.secondary,
    marginTop: 2,
  },
  
  quoteContainer: {
    alignItems: 'center',
    maxWidth: 400,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  quoteText: {
    fontFamily: FONTS.body.italic,
    fontSize: 14,
    color: COLORS.surface,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  quoteAuthor: {
    fontFamily: FONTS.body.medium,
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  
  card: {
    backgroundColor: COLORS.surface,
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 40,
    paddingVertical: 48,
    boxShadow: '0px 8px 24px rgba(0,0,0,0.3)', // Updated from shadow* props
    elevation: 12,
  },
  
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontFamily: FONTS.body.semibold,
    fontSize: 28,
    letterSpacing: 2,
    color: COLORS.textPrimary,
  },
  welcomeDivider: {
    width: 80,
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 12,
  },
  
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: FONTS.body.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: COLORS.borderFocused,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body.regular,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 0,
    margin: 0,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: FONTS.body.regular,
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },
  
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontFamily: FONTS.body.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  forgotLink: {
    fontFamily: FONTS.body.medium,
    fontSize: 12,
    color: COLORS.primary,
  },
  
  signInButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    fontFamily: FONTS.body.semibold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: '#fff',
  },
  
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    gap: 10,
  },
  generalErrorText: {
    flex: 1,
    fontFamily: FONTS.body.regular,
    fontSize: 12,
    color: COLORS.error,
  },
});

// Remove the focus ring for web platform
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    input:focus, textarea:focus, select:focus {
      outline: none !important;
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(style);
}