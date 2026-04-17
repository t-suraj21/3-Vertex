import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions, Animated } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { BASE_URL } from '../../src/config/apiConfig';

const { width } = Dimensions.get('window');

type TabType = 'Saved' | 'Applications';

export default function MyJobsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<TabType>((params.tab as TabType) || 'Saved');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'Saved') {
        const res = await fetch(`${BASE_URL}/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const filtered = data.data.filter((j: any) => user?.savedJobs?.includes(j._id));
            setSavedJobs(filtered);
          }
        }
      } else {
        const res = await fetch(`${BASE_URL}/applications/tracker`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setApplications(data.applications);
          }
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, token, user?.savedJobs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleSave = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/save/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSavedJobs(prev => prev.filter(j => j._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStepsForStatus = (currentStatus: string) => {
    const allSteps = ['Resume Received', 'Resume Verified', 'Shortlisted', 'Assessment Pending', 'Technical Interview', 'HR Interview', 'Selected'];
    const currentIndex = allSteps.indexOf(currentStatus);
    const rejected = currentStatus === 'Rejected';
    
    return allSteps.map((step, idx) => ({
      id: idx + 1,
      title: step,
      status: rejected ? 'pending' : (idx < currentIndex ? 'completed' : (idx === currentIndex ? 'active' : 'pending')),
      date: idx <= currentIndex && !rejected ? 'Updated' : 'Pending',
    }));
  };

  const renderTimelineIcon = (status: string) => {
    if (status === 'completed') return <View style={[styles.timelineIconIcon, { backgroundColor: '#10B981' }]}><MaterialCommunityIcons name="check" size={12} color="#FFF" /></View>;
    if (status === 'active') return <View style={[styles.timelineIconIcon, { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#3B82F6' }]}><View style={styles.activeDot} /></View>;
    return <View style={[styles.timelineIconIcon, { backgroundColor: '#E5E7EB' }]} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Career Hub</Text>
          <Text style={styles.headerSub}>Manage your opportunities and tracking</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Saved' && styles.activeTab]} 
            onPress={() => setActiveTab('Saved')}
          >
            <MaterialCommunityIcons name="bookmark-outline" size={20} color={activeTab === 'Saved' ? '#FFF' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'Saved' && styles.tabTextActive]}>Bookmarked</Text>
            {savedJobs.length > 0 && activeTab !== 'Saved' && <View style={styles.badge} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Applications' && styles.activeTab]} 
            onPress={() => setActiveTab('Applications')}
          >
            <MaterialCommunityIcons name="briefcase-outline" size={20} color={activeTab === 'Applications' ? '#FFF' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'Applications' && styles.tabTextActive]}>Applications</Text>
            {applications.length > 0 && activeTab !== 'Applications' && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
        >
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
          ) : activeTab === 'Saved' ? (
            // SAVED JOBS VIEW
            savedJobs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <MaterialCommunityIcons name="bookmark-plus-outline" size={50} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyTitle}>No saved jobs yet</Text>
                <Text style={styles.emptySub}>Bookmark interesting roles from the home feed to view them here.</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={() => router.replace('/(student)')}>
                  <Text style={styles.actionBtnText}>Explore Jobs</Text>
                </TouchableOpacity>
              </View>
            ) : (
              savedJobs.map(job => (
                <TouchableOpacity key={job._id} style={styles.jobCard} onPress={() => {}}>
                  <View style={styles.jobTop}>
                    <View style={styles.companyLogo}>
                      <MaterialCommunityIcons name="domain" size={24} color="#0A0F24" />
                    </View>
                    <View style={styles.jobInfo}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.companyName}>{job.companyId?.companyName || 'Verified Company'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleSave(job._id)} style={styles.saveIconBox}>
                      <MaterialCommunityIcons name="bookmark" size={24} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.jobFooter}>
                    <View style={styles.tagRow}>
                      <View style={styles.tag}><Text style={styles.tagText}>{job.type}</Text></View>
                      <View style={[styles.tag, { backgroundColor: '#ECFDF5' }]}><Text style={[styles.tagText, { color: '#059669' }]}>{job.location}</Text></View>
                    </View>
                    <Text style={styles.salary}>{job.salary || 'Competitive'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : (
            // APPLICATIONS VIEW
            applications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <MaterialCommunityIcons name="briefcase-search-outline" size={50} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyTitle}>No applications yet</Text>
                <Text style={styles.emptySub}>Your application process and status tracking will appear here.</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={() => router.replace('/(student)')}>
                  <Text style={styles.actionBtnText}>Find Opportunities</Text>
                </TouchableOpacity>
              </View>
            ) : (
              applications.map((app) => (
                <View key={app._id} style={styles.appCard}>
                  <View style={styles.appHeader}>
                    <View style={styles.appCompanyIcon}>
                      <MaterialCommunityIcons name="domain" size={20} color="#3B82F6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.appRole}>{app.jobId?.title}</Text>
                      <Text style={styles.appCompany}>{app.jobId?.companyId?.companyName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: app.status === 'Selected' ? '#D1FAE5' : app.status === 'Rejected' ? '#FEE2E2' : '#EFF6FF' }]}>
                      <Text style={[styles.statusBadgeText, { color: app.status === 'Selected' ? '#059669' : app.status === 'Rejected' ? '#EF4444' : '#3B82F6' }]}>
                        {app.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timelineCompact}>
                    {getStepsForStatus(app.status).slice(0, 4).map((step, idx) => (
                      <React.Fragment key={step.id}>
                        <View style={styles.timelineItem}>
                           {renderTimelineIcon(step.status)}
                        </View>
                        {idx < 3 && <View style={[styles.timelineLine, step.status === 'completed' && { backgroundColor: '#10B981' }]} />}
                      </React.Fragment>
                    ))}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.trackBtn} 
                    onPress={() => router.push({ pathname: '/(student)/track', params: { appId: app._id } })}
                  >
                    <Text style={styles.trackBtnText}>View Detailed Progress</Text>
                    <Feather name="arrow-right" size={14} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))
            )
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFCFF' },
  header: { paddingHorizontal: 25, paddingTop: 15, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#0A0F24' },
  headerSub: { fontSize: 13, color: '#9CA3AF', marginTop: 4, fontWeight: '500' },
  
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F3F4F6', 
    marginHorizontal: 25, 
    borderRadius: 20, 
    padding: 6,
    marginBottom: 20,
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 48, 
    borderRadius: 16,
    gap: 8,
  },
  activeTab: { backgroundColor: '#0A0F24', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  tabText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  tabTextActive: { color: '#FFF' },
  badge: { position: 'absolute', top: 12, right: 20, width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },

  scrollContent: { paddingHorizontal: 25, paddingBottom: 100 },
  
  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 30 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#0A0F24', textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  actionBtn: { backgroundColor: '#0A0F24', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16, marginTop: 25 },
  actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  // Job Cards
  jobCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 15, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  jobTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  companyLogo: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#F8FAFF', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 17, fontWeight: '800', color: '#0A0F24', marginBottom: 4 },
  companyName: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  saveIconBox: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  tagText: { fontSize: 12, color: '#4B5563', fontWeight: '700' },
  salary: { fontSize: 15, fontWeight: '900', color: '#10B981' },

  // App Cards
  appCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 15, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  appHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  appCompanyIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  appRole: { fontSize: 16, fontWeight: '800', color: '#0A0F24', marginBottom: 2 },
  appCompany: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  
  timelineCompact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, marginBottom: 20 },
  timelineItem: { zIndex: 10 },
  timelineIconIcon: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  timelineLine: { height: 2, flex: 1, backgroundColor: '#E5E7EB', marginHorizontal: -2 },

  trackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  trackBtnText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
});
