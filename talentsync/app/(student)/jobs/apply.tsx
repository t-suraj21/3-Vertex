import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreenLayout } from '../../../src/components/layout/SafeScreenLayout';
import { PrimaryButton } from '../../../src/components/common/PrimaryButton';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ApplyJobScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <StatusBar style="dark" />
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="send-check" size={50} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Application Sent!</Text>
        <Text style={styles.successSubtitle}>
          Your amazing profile and resume have been securely forwarded to the employer.
        </Text>
        <PrimaryButton 
          title="Back to Jobs" 
          onPress={() => router.replace('/(student)/recommended')} 
          style={styles.successBtn}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeScreenLayout style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Feather name="arrow-left" size={24} color="#1A1D3D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Application</Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            
            <View style={styles.resumeCard}>
              <Text style={styles.sectionTitle}>Attached Resume</Text>
              <View style={styles.resumeBox}>
                <View style={styles.pdfIcon}>
                  <MaterialCommunityIcons name="file-pdf-box" size={36} color="#E53935" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resumeName}>student_resume_2026.pdf</Text>
                  <Text style={styles.resumeSource}>Parsed from your profile</Text>
                </View>
                <Feather name="check-circle" size={20} color="#4CAF50" />
              </View>
            </View>

            <View style={styles.coverLetterCard}>
              <Text style={styles.sectionTitle}>Cover Letter (Optional)</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={6}
                placeholder="Why are you the perfect fit for this incredible role?"
                placeholderTextColor="#A0A0A0"
                value={coverLetter}
                onChangeText={setCoverLetter}
                textAlignVertical="top"
              />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeScreenLayout>

      <View style={styles.floatingFooter}>
        <PrimaryButton 
          title="Send Application" 
          onPress={handleApply}
          loading={loading}
          style={styles.applyBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9FF',
    padding: 30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1D3D',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#7C7D91',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  successBtn: {
    width: '100%',
    backgroundColor: '#1A1D3D',
    borderRadius: 30,
    paddingVertical: 18,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },
  safeArea: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 20,
  },
  iconButton: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D3D',
  },
  content: {
    paddingHorizontal: 25,
    paddingBottom: 120,
  },
  resumeCard: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D3D',
    marginBottom: 12,
  },
  resumeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  pdfIcon: {
    backgroundColor: '#FFE9E9',
    padding: 8,
    borderRadius: 12,
    marginRight: 15,
  },
  resumeName: {
    fontWeight: '700',
    color: '#1A1D3D',
    fontSize: 15,
    marginBottom: 4,
  },
  resumeSource: {
    color: '#7C7D91',
    fontSize: 13,
  },
  coverLetterCard: {
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    paddingTop: 20,
    fontSize: 15,
    color: '#1A1D3D',
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  applyBtn: {
    backgroundColor: '#1A1D3D',
    borderRadius: 30,
    paddingVertical: 18,
  }
});
