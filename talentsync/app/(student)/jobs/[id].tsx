import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  Platform, Image, ActivityIndicator, Animated, Dimensions, Share, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/store';
import { BASE_URL } from '../../../src/config/apiConfig';

const { width: SW } = Dimensions.get('window');

/* ═══════════════════════════════════════════════════════════════════════════
   JOB DETAILS SCREEN — Premium View Details Page
   ═══════════════════════════════════════════════════════════════════════════ */
export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // ── Fetch Job Details ──────────────────────────────────────────────────
  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
        setSaved(user?.savedJobs?.includes(data.data._id) || false);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
      }
    } catch (err) {
      console.error('Failed to fetch job:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────
  const toggleSave = async () => {
    try {
      setSaved(!saved);
      await fetch(`${BASE_URL}/jobs/save/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      setSaved(!saved);
    }
  };

  const handleApply = async () => {
    if (job?.applicationLink) {
      Alert.alert('External Application', 'This uses an external form. Open it?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Form', onPress: () => router.push(job.applicationLink) },
      ]);
      return;
    }
    router.push(`/(student)/jobs/apply?id=${id}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this job: ${job?.title} at ${job?.companyId?.companyName || 'a great company'} on TalentSync!`,
      });
    } catch (err) {}
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const getInitials = (name: string) => {
    if (!name) return 'CO';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  const getTimeAgo = (date: string) => {
    if (!date) return 'Recently';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Remote': return { bg: '#DCFCE7', fg: '#15803D' };
      case 'Hybrid': return { bg: '#FEF3C7', fg: '#B45309' };
      case 'On-site': return { bg: '#DBEAFE', fg: '#1D4ED8' };
      case 'Internship': return { bg: '#F3E8FF', fg: '#7C3AED' };
      case 'Part-time': return { bg: '#FCE7F3', fg: '#BE185D' };
      default: return { bg: '#EEF2FF', fg: '#4338CA' };
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[st.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '600' }}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={[st.container, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <StatusBar style="dark" />
        <Feather name="alert-circle" size={48} color="#CBD5E1" />
        <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '800', color: '#334155' }}>Job Not Found</Text>
        <Text style={{ marginTop: 6, fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>This job may have been removed or the link is invalid.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, backgroundColor: '#EEF2FF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#6366F1' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const companyName = job.companyId?.companyName || 'Company';
  const isVerified = job.companyId?.verifiedStatus === 'verified';

  return (
    <View style={st.container}>
      <StatusBar style="dark" />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(student)')} style={st.headerBtn}>
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Job Details</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={handleShare} style={st.headerBtn}>
            <Feather name="share-2" size={18} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSave} style={st.headerBtn}>
            <MaterialCommunityIcons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={saved ? '#6366F1' : '#0F172A'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SCROLLABLE CONTENT ──────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Company + Job Title Hero ──────────────────────────────── */}
          <View style={st.heroSection}>
            {/* Company Logo */}
            <View style={st.logoRow}>
              <View style={st.logoBox}>
                <Text style={st.logoText}>{getInitials(companyName)}</Text>
              </View>
              <View style={st.heroInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={st.companyName}>{companyName}</Text>
                  {isVerified && (
                    <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
                  )}
                </View>
                <Text style={st.postedTime}>{getTimeAgo(job.createdAt)}</Text>
              </View>
            </View>

            {/* Job Title */}
            <Text style={st.jobTitle}>{job.title}</Text>

            {/* Tags Row */}
            <View style={st.tagsRow}>
              {job.type && (
                <View style={[st.tag, { backgroundColor: getTypeColor(job.type).bg }]}>
                  <Feather name="briefcase" size={11} color={getTypeColor(job.type).fg} />
                  <Text style={[st.tagText, { color: getTypeColor(job.type).fg }]}>{job.type}</Text>
                </View>
              )}
              {job.location && (
                <View style={[st.tag, { backgroundColor: '#F1F5F9' }]}>
                  <Feather name="map-pin" size={11} color="#475569" />
                  <Text style={[st.tagText, { color: '#475569' }]}>{job.location}</Text>
                </View>
              )}
              {job.salary && (
                <View style={[st.tag, { backgroundColor: '#DCFCE7' }]}>
                  <Feather name="dollar-sign" size={11} color="#15803D" />
                  <Text style={[st.tagText, { color: '#15803D' }]}>{job.salary}</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Quick Stats ──────────────────────────────────────────── */}
          <View style={st.statsRow}>
            <View style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="briefcase" size={16} color="#6366F1" />
              </View>
              <Text style={st.statLabel}>Type</Text>
              <Text style={st.statValue}>{job.type || 'Full-time'}</Text>
            </View>
            <View style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: '#DCFCE7' }]}>
                <Feather name="map-pin" size={16} color="#16A34A" />
              </View>
              <Text style={st.statLabel}>Location</Text>
              <Text style={st.statValue} numberOfLines={1}>{job.location || 'Remote'}</Text>
            </View>
            <View style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="dollar-sign" size={16} color="#F59E0B" />
              </View>
              <Text style={st.statLabel}>Salary</Text>
              <Text style={st.statValue} numberOfLines={1}>{job.salary || 'Competitive'}</Text>
            </View>
          </View>

          {/* ── Job Description ──────────────────────────────────────── */}
          <View style={st.card}>
            <View style={st.cardHeader}>
              <View style={[st.cardIconBox, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="file-text" size={15} color="#6366F1" />
              </View>
              <Text style={st.cardTitle}>Job Description</Text>
            </View>
            <Text style={st.descText}>{job.description || 'No description provided.'}</Text>
          </View>

          {/* ── Skills Required ──────────────────────────────────────── */}
          {job.skillsRequired?.length > 0 && (
            <View style={st.card}>
              <View style={st.cardHeader}>
                <View style={[st.cardIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Feather name="cpu" size={15} color="#16A34A" />
                </View>
                <Text style={st.cardTitle}>Skills Required</Text>
                <View style={st.skillCount}>
                  <Text style={st.skillCountText}>{job.skillsRequired.length}</Text>
                </View>
              </View>
              <View style={st.skillsGrid}>
                {job.skillsRequired.map((skill: string, i: number) => (
                  <View key={i} style={st.skillChip}>
                    <View style={st.skillDot} />
                    <Text style={st.skillChipText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Company Info ─────────────────────────────────────────── */}
          <View style={st.card}>
            <View style={st.cardHeader}>
              <View style={[st.cardIconBox, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons name="domain" size={16} color="#F59E0B" />
              </View>
              <Text style={st.cardTitle}>About Company</Text>
            </View>
            <View style={st.companyInfoRow}>
              <View style={st.companyLogoLg}>
                <Text style={st.companyLogoText}>{getInitials(companyName)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={st.companyInfoName}>{companyName}</Text>
                  {isVerified && <MaterialCommunityIcons name="check-decagram" size={14} color="#10B981" />}
                </View>
                {isVerified ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <MaterialCommunityIcons name="shield-check" size={13} color="#10B981" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#16A34A' }}>Verified Employer — Trusted & Scam-Free</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Feather name="clock" size={12} color="#F59E0B" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#B45309' }}>Verification Pending</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ── Safety Badge ──────────────────────────────────────────── */}
          {isVerified && (
            <View style={st.safetyCard}>
              <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={st.safetyGradient}>
                <MaterialCommunityIcons name="shield-check-outline" size={28} color="#16A34A" />
                <View style={{ flex: 1 }}>
                  <Text style={st.safetyTitle}>Verified & Secure</Text>
                  <Text style={st.safetySub}>This company has been verified through our multi-layer verification system. Apply with confidence.</Text>
                </View>
              </LinearGradient>
            </View>
          )}

        </Animated.View>
      </ScrollView>

      {/* ── FLOATING APPLY BUTTON ────────────────────────────────────────── */}
      <View style={st.footer}>
        <TouchableOpacity style={st.chatBtn} onPress={() => Alert.alert('Coming Soon', 'Chat with recruiter will be available in the next update.')}>
          <Feather name="message-circle" size={20} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity style={st.applyBtn} onPress={handleApply} activeOpacity={0.85}>
          <LinearGradient colors={['#6366F1', '#4F46E5']} style={st.applyGradient}>
            {applying ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Feather name="send" size={16} color="#FFF" />
                <Text style={st.applyText}>Apply Now</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 44, paddingBottom: 14,
    backgroundColor: '#F8FAFC',
  },
  headerBtn: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },

  // Hero
  heroSection: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  logoBox: {
    width: 54, height: 54, borderRadius: 16, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E7FF',
  },
  logoText: { fontSize: 18, fontWeight: '900', color: '#4338CA' },
  heroInfo: { flex: 1 },
  companyName: { fontSize: 14, fontWeight: '700', color: '#475569' },
  postedTime: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginTop: 2 },
  jobTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A', lineHeight: 34, marginBottom: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12,
  },
  tagText: { fontSize: 12, fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 18, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  statIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  statValue: { fontSize: 12, fontWeight: '800', color: '#0F172A', textAlign: 'center' },

  // Cards
  card: {
    backgroundColor: '#FFF', borderRadius: 20, marginHorizontal: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4 },
  cardIconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', flex: 1 },

  // Description
  descText: { fontSize: 14, lineHeight: 24, color: '#475569', fontWeight: '500', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },

  // Skills
  skillCount: { backgroundColor: '#EEF2FF', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  skillCountText: { fontSize: 11, fontWeight: '900', color: '#6366F1' },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  skillChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  skillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  skillChipText: { fontSize: 12, fontWeight: '600', color: '#334155' },

  // Company Info
  companyInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  companyLogoLg: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#FEF3C7',
    justifyContent: 'center', alignItems: 'center',
  },
  companyLogoText: { fontSize: 16, fontWeight: '900', color: '#B45309' },
  companyInfoName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },

  // Safety
  safetyCard: { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, overflow: 'hidden' },
  safetyGradient: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  safetyTitle: { fontSize: 14, fontWeight: '800', color: '#15803D', marginBottom: 3 },
  safetySub: { fontSize: 11, color: '#166534', lineHeight: 17, fontWeight: '500' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 12,
  },
  chatBtn: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#C7D2FE',
  },
  applyBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  applyGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16,
  },
  applyText: { fontSize: 15, fontWeight: '900', color: '#FFF' },
});
