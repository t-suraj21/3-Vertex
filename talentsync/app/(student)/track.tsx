import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { BASE_URL } from '../../src/config/apiConfig';

const { width } = Dimensions.get('window');

export default function ApplicationTrackScreen() {
  const router = useRouter();
  const { appId } = useLocalSearchParams();
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/applications/tracker`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (appId) {
            setApplications(data.applications.filter((a: any) => a._id === appId));
          } else {
            setApplications(data.applications);
          }
        }
      }
    } catch (err) {
      console.error('Tracker fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appId, token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const getStepsForStatus = (currentStatus: string) => {
    const allSteps = ['Resume Received', 'Resume Verified', 'Shortlisted', 'Assessment Pending', 'Technical Interview', 'HR Interview', 'Selected'];
    const currentIndex = allSteps.indexOf(currentStatus);
    const rejected = currentStatus === 'Rejected';
    
    return allSteps.map((step, idx) => ({
      id: idx + 1,
      title: step,
      status: rejected ? (idx <= currentIndex ? 'completed' : 'pending') : (idx < currentIndex ? 'completed' : (idx === currentIndex ? 'active' : 'pending')),
      date: idx <= currentIndex ? 'Updated Recently' : 'Waiting',
      detail: idx === currentIndex ? `Your application is currently at the ${step} stage.` : ''
    }));
  };

  const renderTimelineIcon = (status: string, isRejected: boolean) => {
    if (isRejected && status === 'completed') {
       return <View style={[styles.timelineIconBox, { backgroundColor: '#EF4444' }]}><MaterialCommunityIcons name="close" size={16} color="#FFF" /></View>;
    }
    if (status === 'completed') {
      return (
        <View style={[styles.timelineIconBox, { backgroundColor: '#10B981' }]}>
          <MaterialCommunityIcons name="check" size={16} color="#FFF" />
        </View>
      );
    }
    if (status === 'active') {
      return (
        <View style={[styles.timelineIconBox, { backgroundColor: '#FFF', borderWidth: 3, borderColor: '#3B82F6' }]}>
          <View style={styles.activeDotInner} />
        </View>
      );
    }
    return <View style={[styles.timelineIconBox, { backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB' }]} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.headerArea}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detailed Progress</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0A0F24" style={{ marginTop: 50 }} />
        ) : applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="briefcase-search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No tracking information available.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.replace('/(student)/saved-jobs')}>
              <Text style={styles.browseBtnText}>Go to My Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          applications.map((app) => (
            <View key={app._id}>
              {/* Main Job Detail Card */}
              <View style={styles.jobDetailCard}>
                <View style={styles.jobDetailHeader}>
                  <View style={styles.companyLogoLarge}>
                     <MaterialCommunityIcons name="domain" size={30} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailRole}>{app.jobId?.title}</Text>
                    <Text style={styles.detailCompany}>{app.jobId?.companyId?.companyName}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: app.status === 'Selected' ? '#D1FAE5' : app.status === 'Rejected' ? '#FEE2E2' : '#EFF6FF' }]}>
                    <Text style={[styles.statusPillText, { color: app.status === 'Selected' ? '#059669' : app.status === 'Rejected' ? '#EF4444' : '#3B82F6' }]}>
                      {app.status}
                    </Text>
                  </View>
                </View>

                {/* Info Grid */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Feather name="map-pin" size={14} color="#6B7280" />
                    <Text style={styles.infoValue}>{app.jobId?.location || 'Remote'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Feather name="clock" size={14} color="#6B7280" />
                    <Text style={styles.infoValue}>{app.jobId?.type || 'Full-time'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Feather name="dollar-sign" size={14} color="#6B7280" />
                    <Text style={styles.infoValue}>{app.jobId?.salary || 'Competitive'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="chart-bell-curve" size={14} color="#6B7280" />
                    <Text style={styles.infoValue}>ATS: {app.atsScore || 85}%</Text>
                  </View>
                </View>

                {/* Company Reviewed Info */}
                {app.viewedByCompany && (
                  <View style={styles.viewedAlert}>
                    <MaterialCommunityIcons name="shield-check-outline" size={18} color="#059669" />
                    <Text style={styles.viewedAlertText}>The hiring manager has recently reviewed your application.</Text>
                  </View>
                )}

                {/* Quick Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.chatBtn}
                    onPress={() => router.push(`/chat/${app._id}`)}
                  >
                    <MaterialCommunityIcons name="chat-processing-outline" size={18} color="#FFF" />
                    <Text style={styles.chatBtnText}>Chat with HR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.jobLinkBtn} onPress={() => {}}>
                    <Feather name="external-link" size={18} color="#4B5563" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Timeline Section */}
              <View style={styles.timelineCard}>
                <Text style={styles.sectionHeading}>Recruitement Journey</Text>
                <View style={styles.timelineWrapper}>
                  {getStepsForStatus(app.status).map((step, index, arr) => {
                    const isLast = index === arr.length - 1;
                    const isRejected = app.status === 'Rejected' && index === arr.indexOf(app.status);
                    
                    return (
                      <View key={step.id} style={styles.stepRow}>
                        <View style={styles.stepLeft}>
                          {renderTimelineIcon(step.status, isRejected)}
                          {!isLast && (
                            <View style={[
                              styles.stepLine,
                              step.status === 'completed' ? { backgroundColor: '#10B981' } : { backgroundColor: '#E5E7EB' }
                            ]} />
                          )}
                        </View>
                        <View style={styles.stepRight}>
                          <Text style={[
                            styles.stepTitle,
                            step.status === 'active' && styles.stepTitleActive,
                            step.status === 'pending' && styles.stepTitlePending,
                            isRejected && { color: '#EF4444' }
                          ]}>
                            {step.title}
                          </Text>
                          <Text style={styles.stepDate}>{step.date}</Text>
                          {step.detail ? <Text style={styles.stepDetail}>{step.detail}</Text> : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
              
              <View style={{ height: 40 }} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFCFF' },
  headerArea: {
    backgroundColor: '#0A0F24',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    paddingHorizontal: 25, paddingBottom: 25, paddingTop: 10,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },

  scrollContent: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 100 },

  // Job Detail Card
  jobDetailCard: { 
    backgroundColor: '#FFF', borderRadius: 28, padding: 25, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  jobDetailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  companyLogoLarge: { width: 60, height: 60, borderRadius: 18, backgroundColor: '#F8FAFF', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  detailRole: { fontSize: 18, fontWeight: '900', color: '#0A0F24', marginBottom: 4 },
  detailCompany: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusPillText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  infoValue: { fontSize: 13, color: '#4B5563', fontWeight: '700' },

  viewedAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12, gap: 10, marginBottom: 20 },
  viewedAlertText: { flex: 1, color: '#059669', fontSize: 13, fontWeight: '600', lineHeight: 18 },

  actionRow: { flexDirection: 'row', gap: 12 },
  chatBtn: { flex: 1, backgroundColor: '#0A0F24', height: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  chatBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  jobLinkBtn: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },

  // Timeline Card
  timelineCard: { 
    backgroundColor: '#FFF', borderRadius: 28, padding: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.03, shadowRadius: 15, elevation: 3,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  sectionHeading: { fontSize: 17, fontWeight: '900', color: '#0A0F24', marginBottom: 25 },
  timelineWrapper: { paddingLeft: 5 },
  stepRow: { flexDirection: 'row' },
  stepLeft: { width: 30, alignItems: 'center', marginRight: 18 },
  timelineIconBox: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  activeDotInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6' },
  stepLine: { flex: 1, width: 2, marginVertical: -2, zIndex: 1 },
  stepRight: { flex: 1, paddingBottom: 35 },
  stepTitle: { fontSize: 15, fontWeight: '800', color: '#0A0F24', marginBottom: 4 },
  stepTitleActive: { color: '#3B82F6' },
  stepTitlePending: { color: '#CBD5E1', fontWeight: '600' },
  stepDate: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8 },
  stepDetail: { fontSize: 13, color: '#64748B', lineHeight: 20, backgroundColor: '#F8FAFF', padding: 12, borderRadius: 12, marginTop: 4 },

  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, color: '#9CA3AF', fontWeight: '600', marginTop: 16, marginBottom: 24, textAlign: 'center' },
  browseBtn: { backgroundColor: '#0A0F24', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 16 },
  browseBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
