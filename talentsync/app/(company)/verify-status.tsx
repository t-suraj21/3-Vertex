import React from 'react';
import { View, StyleSheet, Text, Platform, ActivityIndicator } from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { PrimaryButton } from '../../src/components/common/PrimaryButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logout } from '../../src/store/slices/authSlice';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function VerifyStatusScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeScreenLayout style={styles.safeArea}>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="shield-search" size={64} color="#10B981" />
            <View style={styles.loaderBadge}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          </View>
          
          <Text style={styles.title}>Verification Pending</Text>
          <Text style={styles.subtitle}>
            Your corporate account is currently under review by our administration team. 
            This process typically takes 1-2 business days.
          </Text>

          <View style={styles.infoCard}>
             <View style={styles.infoRow}>
               <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
               <Text style={styles.infoText}>Email registered successfully</Text>
             </View>
             <View style={styles.infoRow}>
               <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
               <Text style={styles.infoText}>Government IDs uploaded</Text>
             </View>
             <View style={[styles.infoRow, { opacity: 0.5 }]}>
               <MaterialCommunityIcons name="dots-horizontal-circle" size={20} color="#FFF" />
               <Text style={styles.infoText}>Awaiting manual review</Text>
             </View>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton 
            title="Sign Out" 
            onPress={handleLogout}
            style={styles.btn}
          />
          <Text style={styles.contactText}>Need help? Contact support@verifyhire.com</Text>
        </View>

      </SafeScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F24',
  },
  safeArea: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    position: 'relative',
  },
  loaderBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0A0F24',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 25,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#D1D5DB',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  btn: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 18,
    borderWidth: 0,
  },
  contactText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    marginTop: 20,
  }
});
