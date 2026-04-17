import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { FormInput } from '../../../src/components/common/FormInput';
import { PrimaryButton } from '../../../src/components/common/PrimaryButton';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../../src/store/slices/authSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../../src/config/apiConfig';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export default function StudentLoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
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

      if (data.success) {
        dispatch(setCredentials({
          user: data.user,
          token: data.token,
          role: data.user.role
        }));
        router.replace('/(student)');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      console.error('[Login] Network error:', err?.message);
      Alert.alert(
        'Connection Error',
        `Cannot reach the server.\n\nMake sure:\n• Backend is running on port 8001\n• Your phone and Mac are on the same Wi-Fi\n\nDetails: ${err?.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Background Shapes */}
      <View style={styles.cyanShape} />
      <View style={styles.yellowShape} />
      <View style={styles.pinkShape} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/selection')}>
              <Feather name="arrow-left" size={24} color="#0A0F24" />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="account-school-outline" size={32} color="#0A0F24" />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Unlock top jobs tailored for students.</Text>
            </View>

            {/* Grid Toggle */}
            <View style={styles.toggleGrid}>
              <TouchableOpacity style={[styles.toggleBtn, styles.toggleBtnActive]}>
                <Text style={[styles.toggleText, styles.toggleTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleBtn} onPress={() => router.replace('/(auth)/student/register')}>
                <Text style={styles.toggleText}>Register</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <FormInput
                label="Email Address"
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
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={{ color: '#4B5563', fontWeight: '700', fontSize: 13 }}>Forgot Password?</Text>
              </TouchableOpacity>

              <PrimaryButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginBtn}
              />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 40,
  },
  cyanShape: { position: 'absolute', top: -200, left: -150, width: 500, height: 500, backgroundColor: '#A2D5D4', borderRadius: 250, opacity: 0.6 },
  yellowShape: { position: 'absolute', top: -50, right: -150, width: 300, height: 300, backgroundColor: '#FDE4A9', borderRadius: 150, opacity: 0.8 },
  pinkShape: { position: 'absolute', bottom: -150, left: -100, width: 400, height: 400, backgroundColor: '#F89B9C', borderRadius: 200, opacity: 0.5 },

  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, marginBottom: 30 },
  header: { marginBottom: 30 },
  iconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: '#0A0F24' },
  subtitle: { fontSize: 15, color: '#4B5563', marginTop: 8 },

  toggleGrid: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 6, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  toggleBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12 },
  toggleBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  toggleText: { fontSize: 15, fontWeight: '700', color: '#9CA3AF' },
  toggleTextActive: { color: '#0A0F24', fontWeight: '800' },

  formContainer: {
    backgroundColor: '#FFF', padding: 25, borderRadius: 24, paddingBottom: 35,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 3,
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25, marginTop: 5 },
  loginBtn: {
    backgroundColor: '#0A0F24', borderRadius: 16, shadowColor: '#0A0F24', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
});
