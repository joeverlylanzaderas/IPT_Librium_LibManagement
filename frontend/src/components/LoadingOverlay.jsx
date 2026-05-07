// src/components/LoadingOverlay.jsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text, Platform } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function LoadingOverlay({ visible, message = 'Loading...' }) {
  if (!visible) return null;

  // On web, don't use Modal to avoid aria-hidden warnings
  if (Platform.OS === 'web') {
    return (
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    );
  }

  // On native (iOS/Android), use Modal
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    minWidth: 140,
  },
  text: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
});