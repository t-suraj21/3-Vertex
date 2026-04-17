import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const DUMMY_TALENT: any[] = [];

export default function SearchTalentScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'React', 'Python', 'Design', 'DevOps'];

  const filtered = DUMMY_TALENT.filter((t: any) =>
    t?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t?.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t?.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeScreenLayout style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#0A0F24" />
          </TouchableOpacity>
          <Text style={styles.title}>Search Talent</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchBarContainer}>
          <Feather name="search" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, role, or skill..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, selectedFilter === f && styles.filterChipActive]}
              onPress={() => setSelectedFilter(f)}
            >
              <Text style={[styles.filterText, selectedFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.resultCount}>{filtered.length} candidates found</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filtered.map(talent => (
            <View key={talent.id} style={styles.talentCard}>
              <View style={styles.cardTop}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{talent.initials}</Text>
                </View>
                <View style={styles.talentInfo}>
                  <Text style={styles.talentName}>{talent.name}</Text>
                  <Text style={styles.talentRole}>{talent.role}</Text>
                  <View style={styles.locationRow}>
                    <Feather name="map-pin" size={12} color="#9CA3AF" />
                    <Text style={styles.locationText}>{talent.location}</Text>
                    <Text style={styles.dotSep}>{'·'}</Text>
                    <Text style={styles.locationText}>{talent.experience}</Text>
                  </View>
                </View>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{talent.match}%</Text>
                </View>
              </View>

              <View style={styles.skillsRow}>
                {talent.skills.map((skill, idx) => (
                  <View key={idx} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn} onPress={() => router.push('/(company)/messages')}>
                  <Feather name="send" size={16} color="#FFF" />
                  <Text style={styles.contactBtnText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 120 }} />
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
    marginHorizontal: 25, borderRadius: 16, paddingHorizontal: 15, height: 52, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0A0F24', height: '100%' },
  filterScroll: { maxHeight: 50, marginBottom: 15 },
  filterContent: { paddingHorizontal: 25, gap: 10, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'transparent',
  },
  filterChipActive: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: '#10B981' },
  filterText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
  filterTextActive: { color: '#10B981', fontWeight: '800' },
  resultCount: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', paddingHorizontal: 25, marginBottom: 15 },
  listContent: { paddingHorizontal: 25 },
  talentCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarCircle: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#E0E7FF',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#4F46E5', fontWeight: '800', fontSize: 16 },
  talentInfo: { flex: 1, marginLeft: 15 },
  talentName: { fontSize: 16, fontWeight: '800', color: '#0A0F24', marginBottom: 2 },
  talentRole: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4 },
  dotSep: { color: '#9CA3AF', marginHorizontal: 6 },
  matchBadge: {
    backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  matchText: { fontSize: 14, fontWeight: '900', color: '#059669' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  skillChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  skillText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 12 },
  viewBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center',
  },
  viewBtnText: { color: '#4B5563', fontWeight: '700', fontSize: 14 },
  contactBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#10B981',
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  contactBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
