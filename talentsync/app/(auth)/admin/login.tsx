import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreenLayout } from '../../../src/components/layout/SafeScreenLayout';
import { FormInput } from '../../../src/components/common/FormInput';
import { PrimaryButton } from '../../../src/components/common/PrimaryButton';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../../src/store/slices/authSlice';
import { useTheme } from 'react-native-paper';
import { BASE_URL } from '../../../src/config/apiConfig';

export default function AdminLoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success && data.user.role === 'admin') {
        dispatch(setCredentials({
          user: data.user,
          token: data.token,
          role: data.user.role
        }));
        router.replace('/(admin)');
      } else {
        Alert.alert('Login Failed', data.error || 'Not an admin account.');
      }
    } catch (err: any) {
      console.error('[Admin Login] Network error:', err?.message);
      Alert.alert('Connection Error', `Cannot reach server.\n\n• Backend running on port 8001?\n• Same Wi-Fi?\n\n${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreenLayout style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Portal</Text>
        <Text style={styles.subtitle}>Supervise VerifyHire operations</Text>
      </View>

      <View style={styles.form}>
        <FormInput
          label="Admin Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton
          title="Secure Login"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginBtn}
        />
      </View>
      
      <TouchableOpacity onPress={() => router.replace('/(auth)/onboarding')} style={styles.backBtn}>
        <Text style={{ color: theme.colors.primary }}>Back to Setup</Text>
      </TouchableOpacity>
    </SafeScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D32F2F', // Admin specific color indicator
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  form: {
    marginBottom: 30,
  },
  loginBtn: {
    marginTop: 20,
    backgroundColor: '#D32F2F',
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 20,
  }
});
