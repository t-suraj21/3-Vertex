import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '../../../src/components/common/FormInput';
import { PrimaryButton } from '../../../src/components/common/PrimaryButton';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../../src/store/slices/authSlice';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BASE_URL } from '../../../src/config/apiConfig';

const { width } = Dimensions.get('window');

export default function CompanyLoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('google@talentsync.dev');
  const [password, setPassword] = useState('Company@123');
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

      if (data.success && data.user.role === 'company') {
        dispatch(setCredentials({
          user: data.user,
          token: data.token,
          role: data.user.role
        }));
        router.replace('/(company)');
      } else {
        Alert.alert('Login Failed', data.error || 'Not a company account.');
      }
    } catch (err: any) {
      console.error('[Company Login] Network error:', err?.message);
      Alert.alert('Connection Error', `Cannot reach server.\n\n• Backend running on port 8001?\n• Same Wi-Fi?\n\n${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="domain" size={48} color="#10B981" />
        </View>
        <Text style={styles.title}>Company Portal</Text>
        <Text style={styles.subtitle}>Enter your employer credentials to access the hiring dashboard.</Text>
      </View>

      <View style={styles.formContainer}>
        <FormInput
          label="Official Work Email"
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
        
        <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 25 }}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <PrimaryButton
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.btn}
        />
        
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Not registered yet? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/company/register')}>
            <Text style={styles.footerLink}>Apply for Verification</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F24',
  },
  topSection: {
    flex: 0.45,
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 25,
    padding: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  formContainer: {
    flex: 0.55,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  forgotText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  btn: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 15,
  },
  footerLink: {
    color: '#0A0F24',
    fontWeight: '800',
    fontSize: 15,
  }
});
