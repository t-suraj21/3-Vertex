import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { BASE_URL } from '../../src/config/apiConfig';

const { width } = Dimensions.get('window');

export default function CompanyDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, shortlisted: 0 });
  const [recentApplicants, setRecentApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch(`${BASE_URL}/jobs/mine`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BASE_URL}/applications/company`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      let jobs = [];
      let apps = [];

      // Safely parse JSON to prevent crashes if backend returns HTML error page (e.g. 404)
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData.success) jobs = jobsData.data;
      }
      
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        if (appsData.success) apps = appsData.applications;
      }

      setStats({
        activeJobs: jobs.filter((j: any) => j.isActive).length,
        totalApplicants: apps.length,
        shortlisted: apps.filter((a: any) => a.status === 'Shortlisted' || a.status === 'Technical Interview' || a.status === 'HR Interview').length,
      });

      // Show the 5 most recent applicants
      setRecentApplicants(apps.slice(0, 5));
    } catch (err) {
      console.error('Company dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FF' }}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetSub}>Welcome back,</Text>
            <View style={styles.nameRow}>
              <Text style={styles.greetName} numberOfLines={1}>
                {user?.companyName || 'Company'}
              </Text>
              {user?.verifiedStatus === 'verified' && (
                <MaterialCommunityIcons name="check-decagram" size={20} color="#10B981" style={{ marginLeft: 6 }} />
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/(company)/review-candidates')}>
            <Feather name="users" size={20} color="#0A0F24" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 30 }} />
        ) : (
          <>
            {/* Hero Stats */}
            <View style={styles.statsGrid}>
              <TouchableOpacity style={styles.heroPrimary} onPress={() => router.push('/(company)/manage-jobs')} activeOpacity={0.9}>
                <View style={styles.heroGlow} />
                <MaterialCommunityIcons name="briefcase-outline" size={26} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroVal}>{stats.activeJobs}</Text>
                <Text style={styles.heroLabel}>Active Jobs</Text>
                <View style={styles.heroArrow}>
                  <Feather name="arrow-up-right" size={16} color="rgba(255,255,255,0.6)" />
                </View>
              </TouchableOpacity>

              <View style={styles.statsCol}>
                <TouchableOpacity style={styles.statSmall} onPress={() => router.push('/(company)/review-candidates')} activeOpacity={0.9}>
                  <View style={styles.statSmallRow}>
                    <Text style={styles.statSmallVal}>{stats.totalApplicants}</Text>
                    <View style={[styles.statSmallIcon, { backgroundColor: '#D1FAE5' }]}>
                      <MaterialCommunityIcons name="account-group-outline" size={16} color="#10B981" />
                    </View>
                  </View>
                  <Text style={styles.statSmallLabel}>Applicants</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.statSmall} onPress={() => router.push('/(company)/review-candidates')} activeOpacity={0.9}>
                  <View style={styles.statSmallRow}>
                    <Text style={styles.statSmallVal}>{stats.shortlisted}</Text>
                    <View style={[styles.statSmallIcon, { backgroundColor: '#FEF3C7' }]}>
                      <MaterialCommunityIcons name="calendar-check-outline" size={16} color="#F59E0B" />
                    </View>
                  </View>
                  <Text style={styles.statSmallLabel}>Shortlisted</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Actions */}
            <View>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                {[
                  { icon: 'plus-circle-outline', label: 'Post Job', color: '#10B981', bg: '#ECFDF5', route: '/(company)/post-job' },
                  { icon: 'account-search-outline', label: 'Find Talent', color: '#7C3AED', bg: '#F5F3FF', route: '/(company)/search-talent' },
                  { icon: 'message-text-outline', label: 'Messages', color: '#D97706', bg: '#FFFBEB', route: '/(company)/messages' },
                  { icon: 'briefcase-check-outline', label: 'My Jobs', color: '#2563EB', bg: '#EFF6FF', route: '/(company)/manage-jobs' },
                ].map((action, idx) => (
                  <TouchableOpacity key={idx} style={styles.actionCard} onPress={() => router.push(action.route as any)} activeOpacity={0.8}>
                    <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                      <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <Feather name="chevron-right" size={14} color="#D1D5DB" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Applicants — live from DB */}
            <View>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Recent Applicants</Text>
                <TouchableOpacity onPress={() => router.push('/(company)/review-candidates')}>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>

              {recentApplicants.length === 0 ? (
                <View style={styles.emptyApps}>
                  <MaterialCommunityIcons name="account-clock-outline" size={44} color="#D1D5DB" />
                  <Text style={styles.emptyAppsText}>No applications yet.</Text>
                  <Text style={styles.emptyAppsSubText}>Post a job to start receiving candidates.</Text>
                </View>
              ) : (
                recentApplicants.map((app) => {
                  const student = app.studentId || {};
                  const job = app.jobId || {};
                  const initial = (student.name || 'S')[0].toUpperCase();
                  return (
                    <TouchableOpacity
                      key={app._id}
                      style={styles.appCard}
                      activeOpacity={0.9}
                      onPress={() => router.push('/(company)/review-candidates')}
                    >
                      <View style={[styles.appAvatar, { backgroundColor: '#E0E7FF' }]}>
                        <Text style={[styles.appAvatarText, { color: '#4F46E5' }]}>{initial}</Text>
                      </View>
                      <View style={styles.appInfo}>
                        <Text style={styles.appName}>{student.name || 'Student'}</Text>
                        <Text style={styles.appRole}>Applied for {job.title || 'a position'}</Text>
                      </View>
                      <View style={styles.appRight}>
                        <View style={[
                          styles.statusPill,
                          { backgroundColor: app.status === 'Shortlisted' ? '#D1FAE5' : app.status === 'Rejected' ? '#FEE2E2' : '#EFF6FF' }
                        ]}>
                          <Text style={[
                            styles.statusPillText,
                            { color: app.status === 'Shortlisted' ? '#059669' : app.status === 'Rejected' ? '#EF4444' : '#3B82F6' }
                          ]}>
                            {app.status === 'Resume Received' ? 'New' : app.status}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greetSub: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  greetName: { fontSize: 22, fontWeight: '900', color: '#0A0F24', maxWidth: width * 0.6 },
  bellBtn: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },

  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  heroPrimary: {
    flex: 1.1, backgroundColor: '#10B981', borderRadius: 24, padding: 18,
    justifyContent: 'space-between', overflow: 'hidden',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 8,
  },
  heroGlow: {
    position: 'absolute', top: -30, right: -30, width: 100, height: 100,
    borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroVal: { fontSize: 42, fontWeight: '900', color: '#FFF', marginTop: 8 },
  heroLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  heroArrow: { position: 'absolute', top: 16, right: 16 },
  statsCol: { flex: 0.9, gap: 12 },
  statSmall: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  statSmallRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statSmallVal: { fontSize: 24, fontWeight: '900', color: '#0A0F24' },
  statSmallIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statSmallLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0A0F24', marginBottom: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  viewAll: { color: '#10B981', fontWeight: '700', fontSize: 14 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  actionCard: {
    width: (width - 54) / 2, backgroundColor: '#FFF', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: '#374151' },

  appCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 20, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2,
  },
  appAvatar: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  appAvatarText: { fontWeight: '800', fontSize: 16 },
  appInfo: { flex: 1, marginLeft: 14 },
  appName: { fontSize: 15, fontWeight: '800', color: '#0A0F24', marginBottom: 2 },
  appRole: { fontSize: 12, color: '#9CA3AF' },
  appRight: { alignItems: 'flex-end' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: '800' },

  emptyApps: { alignItems: 'center', paddingVertical: 30 },
  emptyAppsText: { fontSize: 16, fontWeight: '700', color: '#9CA3AF', marginTop: 12 },
  emptyAppsSubText: { fontSize: 13, color: '#D1D5DB', marginTop: 6, textAlign: 'center' },
});
