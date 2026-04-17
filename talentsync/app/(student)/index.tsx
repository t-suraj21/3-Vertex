import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../src/config/apiConfig';

const { width } = Dimensions.get('window');

export default function StudentDashboard() {
  const router = useRouter();
  const { user, token } = useSelector((state: any) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [jobsRes, newsRes] = await Promise.all([
        fetch(`${BASE_URL}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BASE_URL}/news`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const jobsData = await jobsRes.json();
      const newsData = await newsRes.json();
      
      if (jobsData.success) setJobs(jobsData.data);
      if (newsData.success) setNews(newsData.data);
    } catch(err) {
      console.error("Dashboard Fetch Error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleSave = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/save/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Success", "Job bookmark updated!");
      }
    } catch (err) {
      Alert.alert("Error", "Could not save job.");
    }
  };

  const handleApply = async (job: any) => {
    // If job has an external link, open it (Point 2: Google Form style)
    if (job.applicationLink) {
      Alert.alert(
        "External Application",
        "This company uses an external form for applications. Would you like to open it?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Form", onPress: () => router.push(job.applicationLink) }
        ]
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/applications/apply/${job._id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Applied!", "Your application has been sent successfully.");
        router.push({ pathname: '/(student)/saved-jobs', params: { tab: 'Applications' } });
      } else {
        Alert.alert("Already Applied", data.error || "You have already applied for this position.");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
        >
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingLight}>Hello,</Text>
              <View style={styles.nameRow}>
                <Text style={styles.greetingBold}>{user?.name || 'Student'}!</Text>
                <Text style={styles.emoji}>{'👋🏼'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/(student)/profile')}>
              {user?.avatar ? (
                <Image source={{ uri: `${BASE_URL.replace('/api', '')}${user.avatar}` }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#4F46E5' }}>
                    {(user?.name || 'S')[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {loading && <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 20 }} />}

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput 
              placeholder="Search IT jobs, roles..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.filterBtn}>
              <Feather name="sliders" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* IT News Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>IT Industry News</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>Read All</Text></TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newsHorizontal}>
            {news.map(item => (
              <View key={item.id || item._id} style={[styles.newsCard, { backgroundColor: item.bg || '#EEF2FF' }]}>
                <View style={styles.newsTop}>
                  <MaterialCommunityIcons name={(item.icon as any) || 'robot'} size={20} color={item.iconColor || '#4F46E5'} />
                  <Text style={styles.newsSource}>{item.source}</Text>
                </View>
                <Text style={styles.newsTitle} numberOfLines={3}>{item.title}</Text>
                <Text style={styles.newsTime}>{item.time || 'Live'}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Jobs from Verified Companies */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Verified Employers</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>Browse All</Text></TouchableOpacity>
          </View>

          <View style={styles.jobsContainer}>
            {jobs.length === 0 ? (
              <Text style={styles.emptyJobsText}>No jobs available at the moment.</Text>
            ) : (
              jobs.map(job => (
                <TouchableOpacity 
                  key={job._id} 
                  style={styles.jobCard} 
                  onPress={() => {
                    Alert.alert(
                      "Select Action",
                      "Would you like to view more details about this role, or apply immediately?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "View Details", onPress: () => router.push(`/(student)/jobs/${job._id}`) },
                        { text: "Apply Now", onPress: () => handleApply(job) }
                      ]
                    );
                  }} 
                  activeOpacity={0.85}
                >
                  <View style={styles.jobTopRow}>
                    <View style={styles.companyIconBox}>
                      <MaterialCommunityIcons name={'domain'} size={24} color="#0A0F24" />
                    </View>
                    <View style={styles.jobInfo}>
                      <Text style={styles.jobRole}>{job.title}</Text>
                      <View style={styles.companyRow}>
                        <Text style={styles.companyName}>{job.companyId?.companyName || 'Verified Employer'}</Text>
                        {job.companyId?.verifiedStatus === 'verified' && <MaterialCommunityIcons name="check-decagram" size={14} color="#10B981" style={{ marginLeft: 4 }} />}
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => toggleSave(job._id)}>
                      <Feather 
                        name={user?.savedJobs?.includes(job._id) ? "bookmark" : "bookmark"} 
                        size={20} 
                        color={user?.savedJobs?.includes(job._id) ? "#10B981" : "#D1D5DB"} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.jobBottomRow}>
                    <View style={styles.jobTags}>
                      <View style={styles.tag}><Text style={styles.tagText}>{job.type || 'Full-time'}</Text></View>
                      <View style={styles.tag}><Text style={styles.tagText}>{job.location || 'Remote'}</Text></View>
                    </View>
                    <Text style={styles.salaryText}>{job.salary || 'Competitive'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  scrollContent: { paddingTop: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 25, marginBottom: 25,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  msgIconBox: { 
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#F3F4F6', 
    justifyContent: 'center', alignItems: 'center' 
  },
  greetingLight: { fontSize: 28, fontWeight: '400', color: '#6B7280', marginBottom: -5 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  greetingBold: { fontSize: 32, fontWeight: '900', color: '#0A0F24' },
  emoji: { fontSize: 28, marginLeft: 8 },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    marginHorizontal: 25, borderRadius: 16, paddingLeft: 16, height: 52, marginBottom: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
  },
  searchInput: { flex: 1, height: '100%', marginLeft: 10, fontSize: 15, color: '#0A0F24' },
  filterBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#0A0F24', justifyContent: 'center', alignItems: 'center' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0A0F24' },
  seeAllText: { fontSize: 13, color: '#10B981', fontWeight: '700', marginBottom: 2 },

  newsHorizontal: { paddingHorizontal: 25, paddingBottom: 20, gap: 14 },
  newsCard: { width: width * 0.55, borderRadius: 20, padding: 18 },
  newsTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  newsSource: { fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase' },
  newsTitle: { fontSize: 15, fontWeight: '800', color: '#0A0F24', lineHeight: 22, height: 60 },
  newsTime: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginTop: 10 },

  jobsContainer: { paddingHorizontal: 25 },
  jobCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  jobTopRow: { flexDirection: 'row', marginBottom: 16 },
  companyIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  jobInfo: { flex: 1, justifyContent: 'center' },
  jobRole: { fontSize: 16, fontWeight: '800', color: '#0A0F24', marginBottom: 4 },
  companyRow: { flexDirection: 'row', alignItems: 'center' },
  companyName: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  jobBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTags: { flexDirection: 'row', gap: 8 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  salaryText: { fontSize: 14, fontWeight: '800', color: '#10B981' },
});
