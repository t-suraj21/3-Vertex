import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreenLayout } from '../../../src/components/layout/SafeScreenLayout';
import { PrimaryButton } from '../../../src/components/common/PrimaryButton';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const logoUrl = 'https://ui-avatars.com/api/?name=TC&background=FDEBB3&color=1A1D3D';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeScreenLayout style={styles.safeArea}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(student)');
            }
          }} style={styles.iconButton}>
            <Feather name="arrow-left" size={24} color="#1A1D3D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="bookmark-outline" size={26} color="#1A1D3D" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: logoUrl }} style={styles.companyLogo} />
          </View>
          
          <Text style={styles.jobTitle}>Frontend Developer</Text>
          <View style={styles.companyRow}>
            <Text style={styles.companyName}>Tech Corp</Text>
            <MaterialCommunityIcons name="check-decagram" size={18} color="#4CAF50" style={{ marginLeft: 6 }} />
          </View>
          
          <View style={styles.tagsContainer}>
            <View style={styles.tag}><Text style={styles.tagText}>Remote</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Full-time</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>₹50,000/mo</Text></View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.description}>
              We are looking for a skilled React Native developer to join our mobile team. 
              You will be responsible for building beautiful, smooth UIs across both iOS and Android platforms.
              The ideal candidate has a strong eye for design and performance.
            </Text>

            <Text style={styles.sectionTitle}>Requirements</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletItem}>2+ years of experience with React & React Native</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletItem}>Experience with Redux Toolkit and REST APIs</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletItem}>Familiarity with Expo SDK and native modules</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletItem}>A portfolio of previous applications</Text>
              </View>
            </View>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeScreenLayout>

      <View style={styles.floatingFooter}>
        <PrimaryButton 
          title="Apply Now" 
          onPress={() => router.push(`/(student)/jobs/apply?id=${id}`)}
          style={styles.applyBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },
  safeArea: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 10,
  },
  iconButton: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  content: {
    paddingHorizontal: 25,
  },
  logoContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
  },
  jobTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1D3D',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  companyName: {
    fontSize: 18,
    color: '#555',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 35,
    gap: 10,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  cardSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D3D',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 26,
    color: '#555',
    marginBottom: 30,
  },
  bulletList: {
    marginTop: 5,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingRight: 15,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A1D3D',
    marginTop: 10,
    marginRight: 12,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  applyBtn: {
    backgroundColor: '#1A1D3D',
    borderRadius: 30,
    paddingVertical: 18,
  }
});
