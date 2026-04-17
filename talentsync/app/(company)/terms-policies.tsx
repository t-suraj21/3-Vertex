import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function TermsPoliciesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.headerGlow} />

      <SafeScreenLayout style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#0A0F24" />
          </TouchableOpacity>
          <Text style={styles.title}>Terms & Policies</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.updatedText}>Last Updated: April 2026</Text>

            <Text style={styles.sectionHeader}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to VerifyHire. These Terms of Service and Policies actively govern your 
              usage of the VerifyHire SaaS platform. By using the Company Dashboard, you agree to 
              comply with these directives entirely.
            </Text>

            <Text style={styles.sectionHeader}>2. Account Verification</Text>
            <Text style={styles.paragraph}>
              All corporate entities must undergo our strict validation process...
              Providing false credentials will result in permanent termination of your company profile.
            </Text>

            <Text style={styles.sectionHeader}>3. Data Privacy and GDPR</Text>
            <Text style={styles.paragraph}>
              When accessing student data, you must abide by international privacy laws. 
              Resumes and candidate details are strictly for hiring purposes and cannot be sold.
            </Text>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  headerGlow: { position: 'absolute', top: -100, left: 0, right: 0, height: 300, backgroundColor: '#FDE68A', opacity: 0.3, borderRadius: 200, transform: [{ scaleX: 1.5 }] },
  safeArea: { paddingHorizontal: 0, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 15 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  title: { fontSize: 20, fontWeight: '900', color: '#0A0F24' },
  content: { paddingHorizontal: 22, paddingTop: 10 },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  updatedText: { fontSize: 13, color: '#9CA3AF', fontWeight: '700', marginBottom: 20, fontStyle: 'italic' },
  sectionHeader: { fontSize: 18, fontWeight: '900', color: '#0A0F24', marginTop: 20, marginBottom: 10 },
  paragraph: { fontSize: 15, color: '#4B5563', lineHeight: 24 },
});
