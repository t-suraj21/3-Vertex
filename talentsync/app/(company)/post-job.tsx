import React, { useState } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Dimensions, TextInput,
  Linking, Alert
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { BASE_URL } from '../../src/config/apiConfig';

const { width } = Dimensions.get('window');

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Remote', 'Hybrid', 'On-site'];
const EXPERIENCE = ['Fresher', '1-3 yrs', '3-5 yrs', '5+ yrs'];

export default function PostJobScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [expLevel, setExpLevel] = useState('1-3 yrs');
  const [description, setDescription] = useState('');
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [useGoogleForm, setUseGoogleForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const totalSteps = 3;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          location,
          salary,
          type: jobType,
          experienceLevel: expLevel,
          description: description.trim() ? description : 'Description carefully drafted in external doc.',
          applicationLink: useGoogleForm ? googleFormUrl : '',
          isActive: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setTitle(''); setLocation(''); setSalary(''); setDescription(''); setGoogleFormUrl('');
          setStep(1);
          router.push('/(company)/manage-jobs');
        }, 2000);
      } else {
        Alert.alert('Error', data.error || 'Failed to post job');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openGoogleFormPreview = () => {
    if (googleFormUrl.trim()) {
      Linking.openURL(googleFormUrl).catch(() => {
        Alert.alert('Invalid URL', 'Please enter a valid Google Form link.');
      });
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <StatusBar style="dark" />
        <View style={styles.successCircle}>
          <MaterialCommunityIcons name="rocket-launch-outline" size={48} color="#FFF" />
        </View>
        <Text style={styles.successTitle}>Job Published! 🎉</Text>
        <Text style={styles.successSub}>
          Your listing is now live. {useGoogleForm ? 'Students will be redirected to your Google Form to apply.' : 'Candidates can start applying now.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View>
            <Text style={styles.title}>Create Job</Text>
            <Text style={styles.titleSub}>Step {step} of {totalSteps}</Text>
          </View>
          <TouchableOpacity style={styles.draftBtn}>
            <MaterialCommunityIcons name="content-save-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View>
              <View style={styles.stepHeader}>
                <View style={styles.stepIconBox}>
                  <MaterialCommunityIcons name="text-box-outline" size={22} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.stepTitle}>Job Details</Text>
                  <Text style={styles.stepSub}>Basic information about the role</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Job Title <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Senior React Developer"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={setTitle}
                />

                <View style={styles.rowFields}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.fieldLabel}>Location</Text>
                    <TextInput style={styles.input} placeholder="City / Remote" placeholderTextColor="#9CA3AF" value={location} onChangeText={setLocation} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Salary</Text>
                    <TextInput style={styles.input} placeholder="₹8-12 LPA" placeholderTextColor="#9CA3AF" value={salary} onChangeText={setSalary} />
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Employment Type</Text>
                <View style={styles.chipWrap}>
                  {JOB_TYPES.map(t => (
                    <TouchableOpacity key={t} style={[styles.chip, jobType === t && styles.chipActive]} onPress={() => setJobType(t)}>
                      <Text style={[styles.chipText, jobType === t && styles.chipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Experience</Text>
                <View style={styles.chipWrap}>
                  {EXPERIENCE.map(e => (
                    <TouchableOpacity key={e} style={[styles.chip, expLevel === e && styles.chipActive]} onPress={() => setExpLevel(e)}>
                      <Text style={[styles.chipText, expLevel === e && styles.chipTextActive]}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBox, { backgroundColor: '#F5F3FF' }]}>
                  <MaterialCommunityIcons name="file-document-edit-outline" size={22} color="#7C3AED" />
                </View>
                <View>
                  <Text style={styles.stepTitle}>Job Description</Text>
                  <Text style={styles.stepSub}>Tell candidates what to expect</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Full Description</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe responsibilities, qualifications, benefits, culture..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={12}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.tipCard}>
                <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#D97706" />
                <Text style={styles.tipText}>Tip: Job postings with detailed descriptions receive <Text style={{ fontWeight: '800' }}>40% more</Text> qualified applications.</Text>
              </View>
            </View>
          )}

          {/* Step 3: Application Method */}
          {step === 3 && (
            <View>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialCommunityIcons name="link-variant" size={22} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.stepTitle}>Application Method</Text>
                  <Text style={styles.stepSub}>How should students apply?</Text>
                </View>
              </View>

              {/* Toggle */}
              <View style={styles.toggleCard}>
                <TouchableOpacity
                  style={[styles.toggleOption, !useGoogleForm && styles.toggleOptionActive]}
                  onPress={() => setUseGoogleForm(false)}
                >
                  <MaterialCommunityIcons name="application-outline" size={28} color={!useGoogleForm ? '#10B981' : '#9CA3AF'} />
                  <Text style={[styles.toggleTitle, !useGoogleForm && styles.toggleTitleActive]}>In-App Apply</Text>
                  <Text style={styles.toggleSub}>Students apply within VerifyHire</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleOption, useGoogleForm && styles.toggleOptionActive]}
                  onPress={() => setUseGoogleForm(true)}
                >
                  <MaterialCommunityIcons name="google" size={28} color={useGoogleForm ? '#4285F4' : '#9CA3AF'} />
                  <Text style={[styles.toggleTitle, useGoogleForm && { color: '#4285F4' }]}>Google Form</Text>
                  <Text style={styles.toggleSub}>Redirect to external form</Text>
                </TouchableOpacity>
              </View>

              {useGoogleForm && (
                <View style={styles.card}>
                  <Text style={styles.fieldLabel}>Google Form URL <Text style={{ color: '#EF4444' }}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://docs.google.com/forms/d/e/..."
                    placeholderTextColor="#9CA3AF"
                    value={googleFormUrl}
                    onChangeText={setGoogleFormUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  {googleFormUrl.trim().length > 0 && (
                    <TouchableOpacity style={styles.previewLink} onPress={openGoogleFormPreview}>
                      <Feather name="external-link" size={14} color="#4285F4" />
                      <Text style={styles.previewLinkText}>Preview Form in Browser</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.formInfoBox}>
                    <MaterialCommunityIcons name="information-outline" size={18} color="#6B7280" />
                    <Text style={styles.formInfoText}>
                      When students tap "Apply", they will be redirected to your Google Form. All responses will appear in your Google Drive.
                    </Text>
                  </View>
                </View>
              )}

              {!useGoogleForm && (
                <View style={styles.inAppInfo}>
                  <View style={styles.inAppRow}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                    <Text style={styles.inAppText}>Auto-collect resume & profile</Text>
                  </View>
                  <View style={styles.inAppRow}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                    <Text style={styles.inAppText}>AI-powered candidate matching</Text>
                  </View>
                  <View style={styles.inAppRow}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                    <Text style={styles.inAppText}>Track status on your dashboard</Text>
                  </View>
                </View>
              )}

              {/* Summary Preview */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Listing Preview</Text>
                <Text style={styles.summaryTitle}>{title || 'Untitled Role'}</Text>
                <View style={styles.summaryMetaRow}>
                  {location ? <Text style={styles.summaryMeta}>{location}</Text> : null}
                  <Text style={styles.summaryMeta}>{jobType}</Text>
                  {salary ? <Text style={styles.summaryMeta}>{salary}</Text> : null}
                </View>
              </View>
            </View>
          )}

          {/* Footer Nav Integrated into Scroll */}
          <View style={styles.inlineFooter}>
            <View style={styles.footerRow}>
              {step > 1 && (
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                  <Feather name="arrow-left" size={20} color="#6B7280" />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              {step < totalSteps ? (
                <TouchableOpacity
                  style={[styles.nextBtn, (!title.trim() && step === 1) && styles.btnDisabled]}
                  onPress={() => setStep(step + 1)}
                  disabled={!title.trim() && step === 1}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextBtnText}>Continue</Text>
                  <Feather name="arrow-right" size={18} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.publishBtn, (useGoogleForm && !googleFormUrl.trim()) && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={loading || (useGoogleForm && !googleFormUrl.trim())}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="rocket-launch-outline" size={20} color="#FFF" />
                  <Text style={styles.publishBtnText}>{loading ? 'Publishing...' : 'Publish Job'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ height: 160 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#0A0F24' },
  titleSub: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },
  draftBtn: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  progressBarBg: { height: 4, backgroundColor: '#E5E7EB', marginHorizontal: 22, borderRadius: 2, marginBottom: 20 },
  progressBarFill: { height: 4, backgroundColor: '#10B981', borderRadius: 2 },
  formContent: { paddingHorizontal: 22 },

  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  stepIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  stepTitle: { fontSize: 18, fontWeight: '800', color: '#0A0F24' },
  stepSub: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },

  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: '#0A0F24', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12,
  },
  rowFields: { flexDirection: 'row' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  chipText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#10B981', fontWeight: '800' },
  textArea: {
    backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: '#0A0F24', minHeight: 200, borderWidth: 1, borderColor: '#E5E7EB',
  },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 14,
  },
  tipText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 20 },

  // Step 3
  toggleCard: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleOption: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 18, alignItems: 'center',
    borderWidth: 2, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1,
  },
  toggleOptionActive: { borderColor: '#10B981', backgroundColor: '#F0FDF9' },
  toggleTitle: { fontSize: 14, fontWeight: '800', color: '#6B7280', marginTop: 10, marginBottom: 4 },
  toggleTitleActive: { color: '#10B981' },
  toggleSub: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  previewLink: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14,
  },
  previewLinkText: { fontSize: 14, color: '#4285F4', fontWeight: '700' },
  formInfoBox: {
    flexDirection: 'row', gap: 8, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12,
  },
  formInfoText: { flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 18 },
  inAppInfo: {
    backgroundColor: '#F0FDF9', borderRadius: 16, padding: 16, gap: 12, marginBottom: 14,
  },
  inAppRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inAppText: { fontSize: 14, color: '#047857', fontWeight: '600' },

  summaryCard: {
    backgroundColor: '#0A0F24', borderRadius: 20, padding: 20, marginTop: 6,
  },
  summaryLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', marginBottom: 10 },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 10 },
  summaryMetaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  summaryMeta: {
    fontSize: 12, color: '#10B981', fontWeight: '700',
    backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },

  // Footer Integrated
  inlineFooter: {
    marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FAF9FF'
  },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14, paddingRight: 20 },
  backBtnText: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0A0F24', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 16,
  },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  publishBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#10B981', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 16,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
  },
  publishBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  btnDisabled: { backgroundColor: '#D1D5DB', shadowOpacity: 0 },

  successContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FAF9FF', paddingHorizontal: 40,
  },
  successCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 6,
  },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#0A0F24', marginBottom: 12 },
  successSub: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
});
