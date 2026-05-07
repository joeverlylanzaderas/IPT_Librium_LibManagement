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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Sophisticated warm palette - Browns, Maroons, Dark Yellows
const COLORS = {
  primary: '#6B2D2C',     // Deep Mahogany/Burgundy
  primaryDark: '#4A1F1E',  // Darker Maroon
  secondary: '#B8860B',    // Dark Goldenrod
  secondaryDark: '#8B6508', // Darker Gold
  background: '#F5F0E8',   // Warm Cream/Parchment
  surface: '#FFFFFF',      // Crisp White Content Sheet
  frame: '#D4C5B0',        // Warm Muted Brown frame
  dark: '#2C1810',         // Espresso Brown
  textPrimary: '#2C1810',  // Dark Brown for text
  textSecondary: '#6B4C3A', // Medium Brown
  gray600: '#5C4033',      // Dark Brown-Gray
  gray500: '#8B7355',      // Warm Brown-Gray
  gray400: '#C4A882',      // Warm Beige for borders
  white: '#FFFFFF',
  error: '#B22222',        // Firebrick red for errors
  errorBg: '#FEE2E2',      // Light red background
  shadow: '#1A0F0A',       // Dark brown for shadows
};

// Sharp edges - no border radius
const FORM_RADIUS = 0;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
        imageStyle={styles.backgroundImageStyle}
      >
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          {/* --- MAIN OUTER FRAME --- */}
          <View style={styles.formFrame}>
            
            {/* 1. Integrated Header Bar */}
            <View style={styles.headerBar}>
              <View style={styles.logoMarkContainer}>
                <View style={styles.logoMark}>
                  <Feather name="book-open" size={26} color={COLORS.primary} />
                </View>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Librium</Text>
                <Text style={styles.headerSubtitle}>Knowledge Management System</Text>
              </View>
            </View>

            {/* 2. INNER CONTENT SHEET */}
            <View style={styles.innerContentSheet}>
              
              {/* General Error Display */}
              {errors.general && (
                <View style={styles.generalErrorContainer}>
                  <Feather name="alert-circle" size={16} color={COLORS.error} />
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                </View>
              )}

              <View style={styles.formBody}>
                <Input
                  label="Institution Email"
                  leftIcon={<Feather name="mail" size={16} color={COLORS.gray500} />}
                  placeholder="name@institution.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  containerStyle={styles.inputSpacing}
                  themeColors={COLORS}
                />

                <Input
                  label="System Password"
                  leftIcon={<Feather name="lock" size={16} color={COLORS.gray500} />}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  rightIcon={
                    <Feather 
                      name={showPassword ? "eye" : "eye-off"} 
                      size={16} 
                      color={COLORS.gray500} 
                    />
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  themeColors={COLORS}
                />
              </View>

              {/* Controls Row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  activeOpacity={0.7}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Feather name="check" size={11} color={COLORS.white} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </TouchableOpacity>
                
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Action Button */}
              <View style={styles.buttonCenteringContainer}>
                <Button
                  title="Secure Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  style={styles.loginButton}
                  textStyle={styles.loginButtonText}
                />
              </View>
            </View>
          </View>

          {/* Quote Section */}
          <View style={styles.quoteContainer}>
            <View style={styles.quoteLine} />
            <Text style={styles.quoteText}>
              "Libraries store the energy that fuels the imagination."
            </Text>
            <Text style={styles.quoteAuthor}>— Sidney Sheldon</Text>
            <View style={styles.quoteLine} />
          </View>

          {/* Footer Area */}
          <View style={styles.externalFooter}>
            <View style={styles.footerLinks}>
              <Text style={styles.footerText}>New to Librium? </Text>
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.link}>Request access</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.trustIndicator}>
              <Feather name="shield" size={12} color={COLORS.gray400} />
              <Text style={styles.trustText}>End-to-End Encrypted</Text>
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
    justifyContent: 'center',
  },
  backgroundImageStyle: {
    // Dark shadow overlay on background image
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  // --- Outer structural frame - Sharp edges ---
  formFrame: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: FORM_RADIUS,
    borderTopRightRadius: FORM_RADIUS,
    borderBottomRightRadius: FORM_RADIUS,
    borderBottomLeftRadius: FORM_RADIUS,
    
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    
    // Darker shadow for depth
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    
    borderWidth: 1,
    borderColor: COLORS.frame,
    overflow: 'hidden',
  },

  // --- Header ---
  headerBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logoMarkContainer: {
    marginRight: 16,
    zIndex: 2,
  },
  logoMark: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: 0, // Sharp edges
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 11,
    color: COLORS.white,
    letterSpacing: 0.3,
    opacity: 0.85,
    textTransform: 'uppercase',
  },

  // --- Content Sheet - Sharp edges ---
  innerContentSheet: {
    backgroundColor: COLORS.surface,
    padding: 28,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    
    marginTop: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    
    // Inner shadow for depth
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  formBody: {
    marginTop: 8,
    marginBottom: 8,
  },
  inputSpacing: {
    marginBottom: 20,
  },
  
  // Error handling
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
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '500',
  },
  
  // --- Controls & Inputs ---
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 0, // Sharp edges
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
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
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  forgotLink: {
    fontSize: 13,
    color: COLORS.secondaryDark,
    fontWeight: '600',
  },
  
  // --- Button & Footer ---
  buttonCenteringContainer: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  loginButton: {
    width: '100%',
    maxWidth: 180,
    height: 48,
    borderRadius: 0, // Sharp edges
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  
  // Quote Section
  quoteContainer: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    marginTop: 32,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quoteLine: {
    height: 1,
    backgroundColor: COLORS.gray400,
    width: 40,
    marginVertical: 8,
  },
  quoteText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    color: COLORS.secondaryDark,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  
  externalFooter: {
    marginTop: 24,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  link: {
    fontSize: 13,
    color: COLORS.secondaryDark,
    fontWeight: '600',
  },
  trustIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  trustText: {
    fontSize: 10,
    color: COLORS.gray500,
    marginLeft: 6,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});