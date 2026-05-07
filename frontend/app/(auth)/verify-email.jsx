import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>✉️</Text>
      </View>

      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.body}>
        We've sent an activation link to{'\n'}
        <Text style={styles.email}>{email || 'your email address'}</Text>
      </Text>
      <Text style={styles.hint}>
        Click the link in the email to activate your account, then come back to sign in.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Didn't receive it?</Text>
        <Text style={styles.cardBody}>
          • Check your spam / junk folder{'\n'}
          • Make sure you entered the correct email{'\n'}
          • Wait a few minutes and check again
        </Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.replace('/(auth)/login')}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: SIZES.base,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  hint: {
    fontSize: SIZES.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginTop: 28,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardTitle: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  btn: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 48,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: SIZES.base,
  },
});