import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI } from '../../src/api/auth';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.register(form);
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: form.email },
      });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        // Map backend field errors
        const fieldMap = {
          email: 'email',
          password: 'password',
          first_name: 'firstName',
          last_name: 'lastName',
        };
        const mapped = {};
        Object.keys(data).forEach((k) => {
          const key = fieldMap[k] || k;
          mapped[key] = Array.isArray(data[k]) ? data[k][0] : data[k];
        });
        setErrors(mapped);
      } else {
        Alert.alert('Registration Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the IPT Library</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Input
              label="First Name"
              placeholder="Juan"
              value={form.firstName}
              onChangeText={set('firstName')}
              error={errors.firstName}
              containerStyle={styles.half}
            />
            <Input
              label="Last Name"
              placeholder="Dela Cruz"
              value={form.lastName}
              onChangeText={set('lastName')}
              error={errors.lastName}
              containerStyle={styles.half}
            />
          </View>

          <Input
            label="Email address"
            leftIcon="mail-outline"
            placeholder="you@example.com"
            keyboardType="email-address"
            value={form.email}
            onChangeText={set('email')}
            error={errors.email}
          />
          <Input
            label="Password"
            leftIcon="lock-closed-outline"
            placeholder="Min. 8 characters"
            secureTextEntry
            value={form.password}
            onChangeText={set('password')}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            leftIcon="lock-closed-outline"
            placeholder="Repeat your password"
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={set('confirmPassword')}
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: 8, width: '100%' }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back('/(auth)/login')}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.dark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: SIZES.base,
    color: COLORS.gray500,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { color: COLORS.gray500, fontSize: SIZES.base },
  link: { color: COLORS.primary, fontWeight: '700', fontSize: SIZES.base },
});