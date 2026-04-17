import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { BASE_URL } from '../../src/config/apiConfig';

export default function StudentMessagesScreen() {
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inbox, setInbox] = useState<any[]>([]);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/messages/inbox`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setInbox(data.inbox);
        }
      }
    } catch (err) {
      console.error('Inbox fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInbox();
  };

  const filteredInbox = inbox.filter(item => {
    const companyName = item.jobId?.companyId?.companyName || '';
    return companyName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeScreenLayout style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#0A0F24" />
          </TouchableOpacity>
          <Text style={styles.title}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchBarContainer}>
          <Feather name="search" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
        >
          <Text style={styles.sectionTitle}>Inbox</Text>
          
          {loading && !refreshing ? (
            <ActivityIndicator size="small" color="#10B981" style={{ marginTop: 20 }} />
          ) : filteredInbox.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="message-text-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptyText}>When a company reaches out to you, their messages will appear here.</Text>
            </View>
          ) : (
            filteredInbox.map(item => (
              <TouchableOpacity 
                key={item._id} 
                style={styles.messageCard}
                onPress={() => router.push(`/chat/${item._id}`)}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{(item.jobId?.companyId?.companyName?.[0] || 'C').toUpperCase()}</Text>
                </View>
                <View style={styles.messageInfo}>
                  <Text style={styles.contactName}>{item.jobId?.companyId?.companyName || 'Company'}</Text>
                  <Text style={styles.contactRole}>{item.jobId?.title || 'Job Application'}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  safeArea: { paddingHorizontal: 0, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 25, marginTop: 15, marginBottom: 20,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#0A0F24' },
  searchBarContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    marginHorizontal: 25, borderRadius: 16, paddingHorizontal: 15, height: 52, marginBottom: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0A0F24', height: '100%' },
  listContent: { paddingHorizontal: 25, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#6B7280', marginBottom: 15 },
  messageCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#059669', fontWeight: '800', fontSize: 16 },
  messageInfo: { flex: 1, marginLeft: 15 },
  contactName: { fontSize: 16, fontWeight: '800', color: '#0A0F24', marginBottom: 2 },
  contactRole: { fontSize: 13, color: '#6B7280' },
  
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#6B7280', marginTop: 15, marginBottom: 5 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 }
});
