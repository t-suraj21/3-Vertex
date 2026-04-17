import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '../../../src/components/common/FormInput';
import { PrimaryButton } from '../../../src/components/common/PrimaryButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../../src/config/apiConfig';

const { width } = Dimensions.get('window');

export default function StudentRegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/register/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (data.success) {
        Alert.alert('Account Created!', 'You can now log in.', [
          { text: 'Login', onPress: () => router.replace('/(auth)/student/login') }
        ]);
      } else {
        Alert.alert('Registration Failed', data.error || 'Please try again.');
      }
    } catch (err: any) {
      console.error('[Register] Network error:', err?.message);
      Alert.alert(
        'Connection Error',
        `Cannot reach server.\n\n• Is backend running on port 8001?\n• Same Wi-Fi?\n\n${err?.message}`
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
                <MaterialCommunityIcons name="account-plus-outline" size={32} color="#0A0F24" />
              </View>
              <Text style={styles.title}>Join Verification</Text>
              <Text style={styles.subtitle}>Apply for thousands of verified IT roles.</Text>
            </View>

            {/* Grid Toggle */}
            <View style={styles.toggleGrid}>
              <TouchableOpacity style={styles.toggleBtn} onPress={() => router.replace('/(auth)/student/login')}>
                <Text style={styles.toggleText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtn, styles.toggleBtnActive]}>
                <Text style={[styles.toggleText, styles.toggleTextActive]}>Register</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <FormInput
                label="Full Name"
                value={name}
                onChangeText={setName}
              />
              <FormInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <FormInput
                label="Create Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <PrimaryButton
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerBtn}
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
    backgroundColor: '#FFF', padding: 25, borderRadius: 24, paddingBottom: 35, marginTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 3,
  },
  registerBtn: {
    marginTop: 20,
    backgroundColor: '#0A0F24', borderRadius: 16, shadowColor: '#0A0F24', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
});
