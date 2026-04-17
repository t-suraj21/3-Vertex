import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logout } from '../../src/store/slices/authSlice';

export default function AdminDashboard() {
  const dispatch = useDispatch();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Panel</Text>
            <Text style={styles.subtitle}>Manage verifyhire operations</Text>
          </View>
          <TouchableOpacity onPress={() => dispatch(logout())}>
            <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Pending Verification</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Total Companies</Text>
          </View>
        </View>

        {/* Placeholder for management sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionRow}>
            <MaterialCommunityIcons name="domain-plus" size={24} color="#0A0F24" />
            <Text style={styles.actionText}>Review Company Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow}>
            <MaterialCommunityIcons name="alert-decagram" size={24} color="#0A0F24" />
            <Text style={styles.actionText}>Fraud Reports</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 30 
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0A0F24' },
  subtitle: { fontSize: 16, color: '#666' },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statCard: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#D32F2F' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 12,
    marginBottom: 10,
    gap: 15
  },
  actionText: { fontSize: 16, fontWeight: '500' }
});
