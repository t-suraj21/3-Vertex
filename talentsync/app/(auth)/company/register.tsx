import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '../../../src/components/common/FormInput';
import { PrimaryButton } from '../../../src/components/common/PrimaryButton';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BASE_URL } from '../../../src/config/apiConfig';

const { width } = Dimensions.get('window');

export default function CompanyRegisterScreen() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [govId, setGovId] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!companyName || !email || !password || !govId || !gstNumber || !address) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/register/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, email, password, govId, gstNumber, address }),
      });
      const data = await response.json();
      
      if (data.success) {
        router.replace('/(auth)/company/login');
      } else {
        console.error("Register Failed:", data.error);
        alert(data.error);
      }
    } catch (err) {
      console.error("Server Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Apply for Access</Text>
        <Text style={styles.subtitle}>Submit your business credentials to be verified on our talent network.</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <FormInput
            label="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <FormInput
            label="Official Contact Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.sectionTitle}>Verification Details</Text>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#10B981" />
            <Text style={styles.infoText}>
              Government IDs are securely stored and strictly used by admins to verify your corporate entity.
            </Text>
          </View>

          <FormInput
            label="Government Registration ID"
            value={govId}
            onChangeText={setGovId}
          />
          <FormInput
            label="GST/CIN Number"
            value={gstNumber}
            onChangeText={setGstNumber}
          />
          <FormInput
            label="Corporate Address"
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.sectionTitle}>Security</Text>
          <FormInput
            label="Portal Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryButton
            title="Submit for Verification"
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
          />
          
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already approved? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/company/login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F24',
  },
  topSection: {
    paddingTop: 100,
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 25,
    padding: 8,
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
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A0F24',
    marginTop: 10,
    marginBottom: 15,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#10B981',
    lineHeight: 20,
  },
  btn: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
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
