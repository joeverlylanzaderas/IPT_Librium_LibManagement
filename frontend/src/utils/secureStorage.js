// src/utils/secureStorage.js
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Wrapper to handle both old and new APIs
export const secureStorage = {
  setItem: async (key, value) => {
    try {
      // Try modern API first
      if (SecureStore.setItemAsync) {
        await SecureStore.setItemAsync(key, value);
      } 
      // Fallback for older versions
      else if (SecureStore.setItem) {
        await SecureStore.setItem(key, value);
      }
      // Web fallback
      else if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      // Last resort fallback for web
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      }
    }
  },

  getItem: async (key) => {
    try {
      // Try modern API first
      if (SecureStore.getItemAsync) {
        return await SecureStore.getItemAsync(key);
      }
      // Fallback for older versions
      else if (SecureStore.getItem) {
        return await SecureStore.getItem(key);
      }
      // Web fallback
      else if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      // Last resort fallback for web
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return null;
    }
  },

  deleteItem: async (key) => {
    try {
      // Try modern API first
      if (SecureStore.deleteItemAsync) {
        await SecureStore.deleteItemAsync(key);
      }
      // Fallback for older versions
      else if (SecureStore.deleteItem) {
        await SecureStore.deleteItem(key);
      }
      // Web fallback
      else if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error deleting ${key}:`, error);
      // Last resort fallback for web
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      }
    }
  },
};