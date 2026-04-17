import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { PrimaryButton } from '../../src/components/common/PrimaryButton';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ResumeUploadScreen() {
  const router = useRouter();
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUploaded(true);
    }, 2500);
  };

  return (
    <SafeScreenLayout style={styles.container} scrollable>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#0A0F24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Resume Analyzer</Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={styles.subtitle}>
        Upload your resume and let our AI extract your skills, experience, and tailor your profile instantly.
      </Text>

      {!uploaded ? (
        <View style={styles.uploadSection}>
          <TouchableOpacity 
            style={[styles.uploadArea, loading && styles.uploadAreaLoading]} 
            activeOpacity={0.8}
            onPress={handleUpload}
            disabled={loading}
          >
            <View style={styles.dashedBorder}>
              {loading ? (
                <>
                  <ActivityIndicator size="large" color="#4F46E5" style={{ marginBottom: 15 }} />
                  <Text style={styles.uploadTextActive}>Analyzing document layout...</Text>
                  <Text style={styles.uploadSubtext}>Extracting skills via NLP</Text>
                </>
              ) : (
                <>
                  <View style={styles.iconCircleOuter}>
                    <MaterialCommunityIcons name="file-document-outline" size={44} color="#4F46E5" />
                  </View>
                  <Text style={styles.uploadText}>Tap to select resume file</Text>
                  <Text style={styles.uploadSubtext}>Supported: PDF, DOCX (Max 5MB)</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.infoBox}>
             <MaterialCommunityIcons name="shield-check" size={20} color="#10B981" />
             <Text style={styles.infoText}>Your data is securely encrypted and never shared without permission.</Text>
          </View>

          <PrimaryButton
            title={loading ? "Processing..." : "Select Document"}
            onPress={handleUpload}
            loading={loading}
            style={styles.actionBtn}
          />
        </View>
      ) : (
        <View style={styles.successArea}>
          <View style={styles.successHeader}>
            <View style={styles.confettiCircle}>
              <MaterialCommunityIcons name="check-decagram" size={64} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Parsing Successful!</Text>
            <Text style={styles.successSubtitle}>Our AI successfully mapped all relevant skills and work experience to your VerifyHire profile.</Text>
          </View>

          <View style={styles.statsRow}>
             <View style={styles.statBox}>
               <Text style={styles.statNum}>12</Text>
               <Text style={styles.statLabel}>Skills Found</Text>
             </View>
             <View style={styles.statBox}>
               <Text style={styles.statNum}>3</Text>
               <Text style={styles.statLabel}>Jobs Added</Text>
             </View>
          </View>

          <PrimaryButton
            title="Review My Profile"
            onPress={() => router.push('/(student)/profile')}
            style={styles.successBtn}
          />
          <TouchableOpacity onPress={() => setUploaded(false)} style={styles.resetBtn}>
             <Text style={styles.resetText}>Upload a different document</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Spacing for absolute bottom navbar */}
      <View style={{ height: 110 }} />
    </SafeScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    backgroundColor: '#FAF9FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0A0F24' },
  
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 30,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  uploadSection: {
    flex: 1,
  },
  uploadArea: {
    height: 280,
    backgroundColor: '#FFF',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 20,
    padding: 3,
  },
  uploadAreaLoading: {
    backgroundColor: '#EEF2FF',
  },
  dashedBorder: {
    flex: 1,
    borderRadius: 25,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A0F24',
    marginBottom: 8,
  },
  uploadTextActive: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  infoText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },

  actionBtn: {
    backgroundColor: '#0A0F24',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#0A0F24',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  successArea: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  successHeader: { alignItems: 'center', marginBottom: 30 },
  confettiCircle: { marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#0A0F24', marginBottom: 10 },
  successSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
  
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 35,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNum: { fontSize: 24, fontWeight: '900', color: '#4F46E5', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  successBtn: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    width: '100%',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  resetBtn: { marginTop: 20, padding: 10 },
  resetText: { color: '#6B7280', fontWeight: '700', fontSize: 13 }
});
