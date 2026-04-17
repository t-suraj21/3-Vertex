import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ITNews() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeScreenLayout style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1A1D3D" />
        </TouchableOpacity>
        <Text style={styles.title}>Industry News</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>Stay updated with the latest in tech</Text>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A1D3D" />}
      >
        <View style={styles.newsCard}>
           <Text style={styles.newsDate}>Today • TechCrunch</Text>
           <Text style={styles.newsTitle}>React Native 0.74 Released with New Architecture by Default</Text>
           <Text style={styles.newsDesc}>Meta just announced the release of React Native 0.74 featuring bridgeless mode...</Text>
        </View>

        <View style={styles.newsCard}>
           <Text style={styles.newsDate}>Yesterday • VerifiedHire Blog</Text>
           <Text style={styles.newsTitle}>Top 10 Internship Skills Companies Look for in 2026</Text>
           <Text style={styles.newsDesc}>As AI becomes mainstream, companies are prioritizing candidates who can leverage modern generative tooling...</Text>
        </View>
        
        <View style={styles.newsCard}>
           <Text style={styles.newsDate}>May 12 • The Verge</Text>
           <Text style={styles.newsTitle}>Major Shift in AI Engineering Jobs</Text>
           <Text style={styles.newsDesc}>Data reveals a 40% spike in demand for prompt engineers and RAG specialists compared to traditional backend development...</Text>
        </View>
      </ScrollView>
    </SafeScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF9FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 5,
  },
  backButton: {
    padding: 5,
    marginLeft: -5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1D3D',
  },
  subtitle: {
    fontSize: 14,
    color: '#7C7D91',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  newsDate: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    color: '#1A1D3D',
    lineHeight: 24,
  },
  newsDesc: {
    fontSize: 14,
    color: '#7C7D91',
    lineHeight: 22,
  }
});
