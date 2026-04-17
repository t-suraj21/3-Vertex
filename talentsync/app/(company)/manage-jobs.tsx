import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { BASE_URL } from '../../src/config/apiConfig';

export default function ManageJobsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useSelector((state: RootState) => state.auth);

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Active' | 'Closed'>('Active');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/mine`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setJobs(data.data);
      }
    } catch (err) {
      console.error('Manage jobs fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  const onRefresh = () => { setRefreshing(true); fetchJobs(); };

  const handleToggleStatus = async (jobId: string, currentIsActive: boolean) => {
    const action = currentIsActive ? 'Close' : 'Reopen';
    Alert.alert(
      `${action} this job?`,
      currentIsActive
        ? 'Closing the job will stop students from applying.'
        : 'Reopening will make this job visible to students again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: async () => {
            try {
              const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentIsActive })
              });
              const data = await res.json();
              if (data.success) {
                setJobs(prev => prev.map(j => j._id === jobId ? { ...j, isActive: !currentIsActive } : j));
              }
            } catch (_) {}
          }
        }
      ]
    );
  };

  const handleDelete = (jobId: string) => {
    Alert.alert('Delete Job?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${BASE_URL}/jobs/${jobId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            setJobs(prev => prev.filter(j => j._id !== jobId));
          } catch (_) {}
        }
      }
    ]);
  };

  const filtered = jobs.filter(j =>
    (activeTab === 'Active' ? j.isActive : !j.isActive) &&
    j.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = jobs.filter(j => j.isActive).length;
  const closedCount = jobs.filter(j => !j.isActive).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <Text style={styles.title}>Job Postings</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(company)/post-job')}>
          <Feather name="plus" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posted jobs..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, activeTab === 'Active' && styles.tabActive]} onPress={() => setActiveTab('Active')}>
          <Text style={[styles.tabText, activeTab === 'Active' && styles.tabTextActive]}>
            Active  <Text style={[styles.tabBadge, activeTab === 'Active' && styles.tabBadgeActive]}>{activeCount}</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'Closed' && styles.tabActive]} onPress={() => setActiveTab('Closed')}>
          <Text style={[styles.tabText, activeTab === 'Closed' && styles.tabTextActive]}>
            Closed  <Text style={[styles.tabBadge, activeTab === 'Closed' && styles.tabBadgeActive]}>{closedCount}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 60 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="briefcase-search-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>
              {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs found'}
            </Text>
            <Text style={styles.emptyText}>
              {jobs.length === 0 ? 'Tap the + button to post your first job.' : 'Try adjusting your search.'}
            </Text>
            {jobs.length === 0 && (
              <TouchableOpacity style={styles.postNowBtn} onPress={() => router.push('/(company)/post-job')}>
                <Text style={styles.postNowText}>Post a Job</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map(job => (
            <View key={job._id} style={styles.jobCard}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                  <View style={styles.metaRow}>
                    {job.location && (
                      <>
                        <Feather name="map-pin" size={12} color="#9CA3AF" />
                        <Text style={styles.metaText}>{job.location}</Text>
                        <Text style={styles.dot}>·</Text>
                      </>
                    )}
                    {job.type && (
                      <>
                        <MaterialCommunityIcons name="briefcase-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.metaText}>{job.type}</Text>
                      </>
                    )}
                  </View>
                  {job.salary && <Text style={styles.salaryText}>{job.salary}</Text>}
                </View>
                <View style={styles.cardTopRight}>
                  <View style={[styles.statusBadge, !job.isActive && styles.statusBadgeClosed]}>
                    <Text style={[styles.statusText, !job.isActive && styles.statusTextClosed]}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </Text>
                  </View>
                  <Text style={styles.postedDate}>{timeAgo(job.createdAt)}</Text>
                </View>
              </View>

              {/* Skills */}
              {job.skillsRequired?.length > 0 && (
                <View style={styles.skillsRow}>
                  {job.skillsRequired.slice(0, 4).map((s: string, i: number) => (
                    <View key={i} style={styles.skillPill}>
                      <Text style={styles.skillPillText}>{s}</Text>
                    </View>
                  ))}
                  {job.skillsRequired.length > 4 && (
                    <Text style={styles.moreSkills}>+{job.skillsRequired.length - 4}</Text>
                  )}
                </View>
              )}

              <View style={styles.cardFooter}>
                {job.isActive ? (
                  <>
                    <TouchableOpacity style={styles.ghostBtn} onPress={() => handleToggleStatus(job._id, true)}>
                      <Feather name="x-circle" size={15} color="#EF4444" />
                      <Text style={[styles.ghostBtnText, { color: '#EF4444' }]}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.solidBtn} onPress={() => router.push('/(company)/review-candidates')}>
                      <MaterialCommunityIcons name="account-check-outline" size={16} color="#FFF" />
                      <Text style={styles.solidBtnText}>Review Candidates</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.ghostBtn} onPress={() => handleDelete(job._id)}>
                      <Feather name="trash-2" size={15} color="#EF4444" />
                      <Text style={[styles.ghostBtnText, { color: '#EF4444' }]}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.solidBtn, { backgroundColor: '#6366F1' }]} onPress={() => handleToggleStatus(job._id, false)}>
                      <MaterialCommunityIcons name="repeat" size={16} color="#FFF" />
                      <Text style={styles.solidBtnText}>Reopen</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingBottom: 18,
  },
  title: { fontSize: 24, fontWeight: '900', color: '#0A0F24' },
  addBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 22, backgroundColor: '#FFF', borderRadius: 14,
    paddingHorizontal: 14, height: 48, marginBottom: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0A0F24', height: '100%' },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 22, marginBottom: 18,
    backgroundColor: '#F3F4F6', borderRadius: 14, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3 },
  tabText: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  tabTextActive: { color: '#0A0F24' },
  tabBadge: { fontWeight: '600', color: '#9CA3AF' },
  tabBadgeActive: { color: '#10B981', fontWeight: '800' },
  listContent: { paddingHorizontal: 22 },
  jobCard: {
    backgroundColor: '#FFF', borderRadius: 22, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3,
  },
  cardTopRow: { flexDirection: 'row', marginBottom: 12 },
  jobTitle: { fontSize: 16, fontWeight: '800', color: '#0A0F24', marginBottom: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  metaText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  dot: { color: '#D1D5DB', fontSize: 12 },
  salaryText: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  cardTopRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBadgeClosed: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '800', color: '#059669', textTransform: 'uppercase' },
  statusTextClosed: { color: '#DC2626' },
  postedDate: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  skillPill: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  skillPillText: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  moreSkills: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', alignSelf: 'center' },
  cardFooter: { flexDirection: 'row', gap: 10 },
  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    flex: 0.4, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#FEF2F2', justifyContent: 'center',
  },
  ghostBtnText: { fontWeight: '700', fontSize: 13 },
  solidBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    flex: 0.6, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#10B981', justifyContent: 'center',
  },
  solidBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#6B7280', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 20 },
  postNowBtn: { backgroundColor: '#10B981', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
  postNowText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
