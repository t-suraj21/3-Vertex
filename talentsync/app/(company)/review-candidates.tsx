import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Linking, Image, Modal, RefreshControl, Dimensions, Platform
} from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { BASE_URL } from '../../src/config/apiConfig';

const { width } = Dimensions.get('window');

const STATUS_FLOW = [
  'Resume Received',
  'Resume Verified',
  'Shortlisted',
  'Assessment Pending',
  'Technical Interview',
  'HR Interview',
  'Selected',
];

const STATUS_COLOR: Record<string, string> = {
  'Resume Received':    '#3B82F6',
  'Resume Verified':    '#8B5CF6',
  'Shortlisted':        '#10B981',
  'Assessment Pending': '#F59E0B',
  'Technical Interview':'#F97316',
  'HR Interview':       '#EC4899',
  'Selected':           '#059669',
  'Rejected':           '#EF4444',
};

export default function ReviewCandidatesScreen() {
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  const [filter, setFilter] = useState('All');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModal, setProfileModal] = useState<any | null>(null);

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/applications/company`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setCandidates(data.applications);
    } catch (err) {
      console.error('Fetch candidates error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const onRefresh = () => { setRefreshing(true); fetchCandidates(); };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`${BASE_URL}/applications/status/${appId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCandidates(prev =>
          prev.map(c => c._id === appId ? { ...c, status: newStatus } : c)
        );
      }
    } catch (_) {}
  };

  const confirmStatusChange = (appId: string, studentName: string, newStatus: string) => {
    Alert.alert(
      `Move to "${newStatus}"?`,
      `You are about to update ${studentName}'s status to "${newStatus}". The student will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => handleUpdateStatus(appId, newStatus) }
      ]
    );
  };

  const getNextActions = (status: string): string[] => {
    if (status === 'Rejected') return [];
    const idx = STATUS_FLOW.indexOf(status);
    const actions: string[] = [];
    if (idx !== -1 && idx < STATUS_FLOW.length - 1) {
      actions.push(STATUS_FLOW[idx + 1]);
    }
    if (status !== 'Rejected') actions.push('Rejected');
    return actions;
  };

  const openLink = async (url: string, label: string) => {
    if (!url) { Alert.alert('Not Available', `No ${label} link provided by this student.`); return; }
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    try { await Linking.openURL(fullUrl); } catch { Alert.alert('Error', `Could not open ${label}.`); }
  };

  const filteredCandidates = candidates.filter(c =>
    filter === 'All' || c.status === filter
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeScreenLayout style={styles.safeArea}>

        {/* Premium Header - Removed Back Arrow */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>All Applications</Text>
            <Text style={styles.subtitle}>Review and manage your {candidates.length} candidates</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={onRefresh}>
            <Feather name="refresh-cw" size={20} color="#0A0F24" />
          </TouchableOpacity>
        </View>

        {/* Filters - Fixed Alignment Gap with fixed height and flexGrow: 0 */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterRow}
            style={{ flexGrow: 0 }}
          >
            {['All', 'Resume Received', 'Shortlisted', 'Technical Interview', 'Selected', 'Rejected'].map(f => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f === 'Resume Received' ? 'New' : f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Candidate List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 60 }} />
          ) : filteredCandidates.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search-outline" size={80} color="#E5E7EB" />
              <Text style={styles.emptyText}>No candidates found.</Text>
            </View>
          ) : (
            filteredCandidates.map(c => {
              const student = c.studentId || {};
              const job = c.jobId || {};
              const statusColor = STATUS_COLOR[c.status] || '#6B7280';
              const nextActions = getNextActions(c.status);

              return (
                <View key={c._id} style={styles.card}>
                  {/* Premium Candidate Info Row */}
                  <TouchableOpacity
                    style={styles.cardTop}
                    onPress={() => setProfileModal({ student, job, appId: c._id, status: c.status })}
                    activeOpacity={0.8}
                  >
                    {student.avatar ? (
                      <Image
                        source={{ uri: `${BASE_URL.replace('/api', '')}${student.avatar}` }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.avatar, { backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C7D2FE' }]}>
                        <Text style={styles.avatarInitial}>{(student.name || 'S')[0].toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.info}>
                      <Text style={styles.name}>{student.name || 'Unknown Student'}</Text>
                      <Text style={styles.jobTitle}>Applied for: <Text style={{ color: '#0A0F24', fontWeight: '700' }}>{job.title || 'Position'}</Text></Text>
                      <View style={styles.quickStatusRow}>
                        <View style={[styles.miniDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.miniStatusText, { color: statusColor }]}>{c.status}</Text>
                      </View>
                    </View>
                    <View style={styles.viewProfileBtn}>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  {/* Enhanced Action Buttons */}
                  {nextActions.length > 0 && (
                    <View style={styles.actionRow}>
                      {nextActions.map(action => (
                        <TouchableOpacity
                          key={action}
                          style={[
                            styles.actionBtn,
                            action === 'Rejected'
                              ? styles.actionBtnReject
                              : styles.actionBtnAccept
                          ]}
                          onPress={() => confirmStatusChange(c._id, student.name || 'Student', action)}
                        >
                          <MaterialCommunityIcons
                            name={action === 'Rejected' ? 'close' : 'check'}
                            size={16}
                            color={action === 'Rejected' ? '#EF4444' : '#FFF'}
                          />
                          <Text style={[
                            styles.actionBtnText,
                            action === 'Rejected' && { color: '#EF4444' }
                          ]}>
                            {action === 'Rejected' ? 'Reject' : 'Move to ' + action}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {c.status === 'Selected' && (
                     <View style={[styles.actionRow, { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D1FAE5' }]}>
                       <MaterialCommunityIcons name="party-popper" size={20} color="#10B981" />
                       <Text style={{ color: '#10B981', fontWeight: '800', marginLeft: 8, fontSize: 14 }}>Candidate Hired!</Text>
                     </View>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeScreenLayout>

      {/* Premium Student Profile Modal */}
      <Modal visible={!!profileModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setProfileModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {profileModal && (() => {
              const { student, job, status } = profileModal;
              const statusColor = STATUS_COLOR[status] || '#6B7280';
              return (
                <View style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 }}>
                  <View style={styles.modalHeader}>
                    {student.avatar ? (
                      <Image
                        source={{ uri: `${BASE_URL.replace('/api', '')}${student.avatar}` }}
                        style={styles.modalAvatar}
                      />
                    ) : (
                      <View style={[styles.modalAvatar, { backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 32, fontWeight: '900', color: '#4F46E5' }}>
                          {(student.name || 'S')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.modalName}>{student.name || 'Student'}</Text>
                    <Text style={styles.modalJobTitle}>Applied for <Text style={{ color: '#0A0F24' }}>{job.title}</Text></Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: statusColor, marginTop: 12 }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor, fontSize: 13 }]}>{status}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Candidate Resources</Text>
                    <View style={styles.modalLinksGrid}>
                      {[
                        { label: 'Resume', icon: 'file-text', url: student.resume ? `${BASE_URL.replace('/api', '')}${student.resume}` : null, color: '#4F46E5', isFeather: true },
                        { label: 'GitHub', icon: 'github', url: student.github, color: '#374151', isFeather: false },
                        { label: 'LinkedIn', icon: 'linkedin', url: student.linkedin, color: '#0A66C2', isFeather: false },
                        { label: 'Portfolio', icon: 'globe', url: student.portfolio, color: '#10B981', isFeather: true },
                      ].map(link => (
                        <TouchableOpacity
                          key={link.label}
                          style={[styles.modalLinkBtn, { opacity: link.url ? 1 : 0.4 }]}
                          onPress={() => link.url && openLink(link.url, link.label)}
                          disabled={!link.url}
                        >
                          {link.isFeather
                            ? <Feather name={link.icon as any} size={24} color={link.url ? link.color : '#9CA3AF'} />
                            : <MaterialCommunityIcons name={link.icon as any} size={24} color={link.url ? link.color : '#9CA3AF'} />
                          }
                          <Text style={[styles.modalLinkLabel, { color: link.url ? link.color : '#9CA3AF' }]}>
                            {link.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {student.skills?.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Core Skills</Text>
                      <View style={styles.skillsRow}>
                        {student.skills.map((s: string, i: number) => (
                          <View key={i} style={styles.skillPill}>
                            <Text style={styles.skillPillText}>{s}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 15 }}>
                    <TouchableOpacity 
                      style={[styles.modalClose, { flex: 1, backgroundColor: '#F3F4F6' }]} 
                      onPress={() => setProfileModal(null)}
                    >
                      <Text style={[styles.modalCloseText, { color: '#0A0F24' }]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.modalClose, { flex: 1, backgroundColor: '#0A0F24', flexDirection: 'row', justifyContent: 'center', gap: 8 }]} 
                      onPress={() => {
                        const idToPass = profileModal.appId;
                        setProfileModal(null);
                        router.push(`/chat/${idToPass}`);
                      }}
                    >
                      <MaterialCommunityIcons name="message-text-outline" size={20} color="#FFF" />
                      <Text style={styles.modalCloseText}>Message</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  safeArea: { paddingHorizontal: 0, backgroundColor: 'transparent' },

  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 15 
  },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  title: { fontSize: 26, fontWeight: '900', color: '#0A0F24', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginTop: 4 },

  filterContainer: { height: 60, marginBottom: 15 },
  filterRow: { paddingHorizontal: 24, gap: 10, alignItems: 'center' },
  filterChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  filterChipActive: { backgroundColor: '#0A0F24', borderColor: '#0A0F24' },
  filterText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  filterTextActive: { color: '#FFF' },

  listContent: { paddingHorizontal: 24 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#9CA3AF', fontWeight: '600', marginTop: 16 },

  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 3,
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarInitial: { fontSize: 22, fontWeight: '900', color: '#4F46E5' },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 17, fontWeight: '800', color: '#0A0F24' },
  jobTitle: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginTop: 4 },
  
  quickStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  miniStatusText: { fontSize: 11, fontWeight: '700' },
  
  viewProfileBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 18 },

  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  actionBtnAccept: { backgroundColor: '#0A0F24', shadowColor: '#0A0F24', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  actionBtnReject: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5' },
  actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  // Premium Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 15, 36, 0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 36, borderTopRightRadius: 36,
    maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 20
  },
  modalHandle: { width: 44, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 15 },
  modalHeader: { alignItems: 'center', marginBottom: 28 },
  modalAvatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 16, borderWidth: 4, borderColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
  modalName: { fontSize: 24, fontWeight: '900', color: '#0A0F24' },
  modalJobTitle: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginTop: 6 },
  
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  statusBadgeText: { fontWeight: '800' },

  modalSection: { marginBottom: 26 },
  modalSectionTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16, marginLeft: 4 },
  modalLinksGrid: { flexDirection: 'row', gap: 12 },
  modalLinkBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#F9FAFB', borderRadius: 16, paddingVertical: 18,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  modalLinkLabel: { fontSize: 11, fontWeight: '800' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillPill: { backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  skillPillText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  
  modalClose: {
    paddingVertical: 18, borderRadius: 16, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3
  },
  modalCloseText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
