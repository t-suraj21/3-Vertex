import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AccountSettingsScreen() {
  const router = useRouter();
  
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.headerGlow} />
      
      <SafeScreenLayout style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#0A0F24" />
          </TouchableOpacity>
          <Text style={styles.title}>Account Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email Alerts</Text>
                <Text style={styles.settingSub}>Receive daily candidate summaries</Text>
              </View>
              <Switch value={emailNotif} onValueChange={setEmailNotif} trackColor={{ true: '#10B981', false: '#E5E7EB' }} />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingSub}>Instant alerts for new applicants</Text>
              </View>
              <Switch value={pushNotif} onValueChange={setPushNotif} trackColor={{ true: '#10B981', false: '#E5E7EB' }} />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Marketing Emails</Text>
                <Text style={styles.settingSub}>Updates on VerifyHire features</Text>
              </View>
              <Switch value={marketingNotif} onValueChange={setMarketingNotif} trackColor={{ true: '#10B981', false: '#E5E7EB' }} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Two-Factor Auth (2FA)</Text>
                <Text style={styles.settingSub}>Enhanced account protection</Text>
              </View>
              <Switch value={twoFactor} onValueChange={setTwoFactor} trackColor={{ true: '#10B981', false: '#E5E7EB' }} />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow}>
              <Text style={styles.actionLabel}>Change Password</Text>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow}>
              <Text style={styles.actionLabel}>Active Sessions</Text>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.dangerCard}>
            <TouchableOpacity style={styles.deleteBtn}>
              <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Delete Company Account</Text>
            </TouchableOpacity>
            <Text style={styles.dangerSub}>Permanently delete all data and jobs. This action cannot be undone.</Text>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  headerGlow: { position: 'absolute', top: -100, left: 0, right: 0, height: 300, backgroundColor: '#D1FAE5', opacity: 0.3, borderRadius: 200, transform: [{ scaleX: 1.5 }] },
  safeArea: { paddingHorizontal: 0, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 15 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  title: { fontSize: 20, fontWeight: '900', color: '#0A0F24' },
  content: { paddingHorizontal: 22, paddingTop: 10 },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#6B7280', marginBottom: 12, marginTop: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  settingInfo: { flex: 1, paddingRight: 20 },
  settingLabel: { fontSize: 16, fontWeight: '800', color: '#0A0F24', marginBottom: 4 },
  settingSub: { fontSize: 13, color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  actionLabel: { fontSize: 16, fontWeight: '700', color: '#374151' },
  
  dangerCard: { backgroundColor: '#FEF2F2', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#FECACA' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  deleteBtnText: { fontSize: 16, fontWeight: '800', color: '#EF4444' },
  dangerSub: { fontSize: 13, color: '#991B1B', lineHeight: 20 },
});
