import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../src/store/slices/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootState } from '../../src/store';

const MENU_ITEMS = [
  { icon: 'settings', label: 'Account Settings', chevron: true, route: '/(company)/account-settings' },
  { icon: 'help-circle', label: 'Help & Support', chevron: true, route: '/(company)/help-support' },
  { icon: 'file-text', label: 'Terms & Policies', chevron: true, route: '/(company)/terms-policies' },
];

export default function CompanyProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/selection');
  };

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

  const FIELDS = [
    { icon: 'mail', label: 'Official Email', value: user?.email || 'Not provided' },
    { icon: 'hash', label: 'CIN / GST Number', value: user?.gstCin || 'Not provided', encrypted: true },
    { icon: 'shield', label: 'Government ID', value: user?.govRegId || 'Not provided' },
    { icon: 'map-pin', label: 'Headquarters', value: user?.location || 'Not provided' },
    { icon: 'calendar', label: 'Member Since', value: memberSince },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Hero Header */}
      <View style={[styles.heroHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroTitle}>Profile</Text>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            {user?.avatar ? (
               <MaterialCommunityIcons name="domain" size={36} color="#10B981" />
            ) : (
               <Text style={{ fontSize: 32, fontWeight: '900', color: '#10B981' }}>{(user?.companyName || 'C')[0].toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameVerifyRow}>
              <Text style={styles.companyName}>{user?.companyName || 'Company'}</Text>
              {user?.verifiedStatus === 'verified' && (
                <MaterialCommunityIcons name="check-decagram" size={18} color="#10B981" style={{ marginLeft: 6 }} />
              )}
            </View>
            <View style={[styles.verifiedPill, user?.verifiedStatus !== 'verified' && { backgroundColor: 'transparent' }]}>
              <MaterialCommunityIcons 
                name={user?.verifiedStatus === 'verified' ? "shield-check" : "shield-alert-outline"} 
                size={13} 
                color={user?.verifiedStatus === 'verified' ? "#10B981" : "#F59E0B"} 
              />
              <Text style={[styles.verifiedPillText, user?.verifiedStatus !== 'verified' && { color: '#F59E0B' }]}>
                {user?.verifiedStatus === 'verified' ? 'Verified Enterprise' : 'Pending Verification'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Credentials */}
        <Text style={styles.sectionTitle}>Registered Credentials</Text>
        <View style={styles.credentialsCard}>
          {FIELDS.map((f, i) => (
            <View key={i}>
              <View style={styles.fieldRow}>
                <View style={styles.fieldIconBox}>
                  <Feather name={f.icon as any} size={16} color="#6B7280" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <View style={styles.fieldValueRow}>
                    <Text style={styles.fieldValue}>{f.value}</Text>
                    {f.encrypted && (
                      <View style={styles.encryptedBadge}>
                        <MaterialCommunityIcons name="lock" size={10} color="#6B7280" />
                        <Text style={styles.encryptedText}>Encrypted</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              {i < FIELDS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#059669" />
          <Text style={styles.infoNoteText}>
            Verified credentials are protected and cannot be modified directly. Contact support to update.
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuRow} activeOpacity={0.7} onPress={() => router.push(item.route as any)}>
              <View style={styles.menuIconBox}>
                <Feather name={item.icon as any} size={18} color="#374151" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.chevron && <Feather name="chevron-right" size={18} color="#D1D5DB" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Support */}
        <TouchableOpacity style={styles.supportBtn} activeOpacity={0.85}>
          <Feather name="headphones" size={18} color="#0A0F24" />
          <Text style={styles.supportBtnText}>Contact Support</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutFullBtn} onPress={handleLogout} activeOpacity={0.85}>
          <MaterialCommunityIcons name="logout" size={18} color="#DC2626" />
          <Text style={styles.logoutFullText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>VerifyHire v1.0.0</Text>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },

  // Hero
  heroHeader: {
    backgroundColor: '#0A0F24', paddingHorizontal: 22, paddingBottom: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarBox: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  profileInfo: { marginLeft: 16 },
  nameVerifyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  companyName: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedPillText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  statValue: { fontSize: 20, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600', textTransform: 'uppercase' },

  // Content
  scrollContent: { paddingHorizontal: 22, paddingTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0A0F24', marginBottom: 12 },
  credentialsCard: {
    backgroundColor: '#FFF', borderRadius: 22, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
  fieldIconBox: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginBottom: 4 },
  fieldValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldValue: { fontSize: 14, fontWeight: '700', color: '#0A0F24', flex: 1 },
  encryptedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  encryptedText: { fontSize: 10, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 50 },

  infoNote: {
    flexDirection: 'row', gap: 10, backgroundColor: '#F0FDF9',
    borderRadius: 14, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)',
  },
  infoNoteText: { flex: 1, fontSize: 12, color: '#047857', lineHeight: 18 },

  menuCard: {
    backgroundColor: '#FFF', borderRadius: 22, marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#374151' },

  supportBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', paddingVertical: 16, borderRadius: 18, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  supportBtnText: { fontSize: 15, fontWeight: '800', color: '#0A0F24' },

  logoutFullBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 18, marginBottom: 20,
    borderWidth: 1, borderColor: '#FECACA',
  },
  logoutFullText: { fontSize: 15, fontWeight: '800', color: '#DC2626' },

  versionText: { textAlign: 'center', fontSize: 12, color: '#D1D5DB', fontWeight: '600' },
});
