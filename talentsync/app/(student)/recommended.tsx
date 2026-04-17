import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { BASE_URL } from '../../src/config/apiConfig';

export default function RecommendedJobs() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{ atsScore: number, whatToChange: string[], howToImprove: string[] } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setSelectedFile(null);
      setResults(null);
      setRefreshing(false);
    }, 1000);
  };

  const handleDocumentSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);

    try {
      const formData = new FormData();
      // @ts-ignore — React Native FormData accepts this object shape
      formData.append('resume', {
        uri: selectedFile.uri,   // Keep file:// prefix — Android needs it
        name: selectedFile.name || 'resume.pdf',
        type: selectedFile.mimeType || 'application/pdf',
      } as any);

      // Use XMLHttpRequest — fetch silently drops multipart bodies on Android
      const data: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/ai/parse-resume`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 60000; // 60 second timeout for Gemini AI response

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            resolve(json);
          } catch {
            reject(new Error('Server returned invalid JSON response'));
          }
        };

        xhr.onerror = () => reject(new Error('Network request failed — check Wi-Fi and server IP'));
        xhr.ontimeout = () => reject(new Error('Request timed out — server took too long to respond'));
        xhr.send(formData);
      });

      if (data.success) {
        setResults({
          atsScore: data.atsScore,
          whatToChange: data.whatToChange || ['No specific issues found'],
          howToImprove: data.howToImprove || ['Keep up the great work!'],
        });
      } else {
        throw new Error(data.error || 'Engine error');
      }
    } catch (err: any) {
      console.log('Analysis engine fallback:', err);
      setResults({
        atsScore: -1,
        whatToChange: [err.message || 'System Error Occurred'],
        howToImprove: [
          'Ensure your phone & laptop are on the same Wi-Fi network',
          'Restart backend: node server.js',
        ],
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* PREMIUM HERO HEADER */}
      <LinearGradient colors={['#101828', '#1D2939']} style={styles.heroHeader}>
        <View style={styles.heroTop}>
           <View>
              <Text style={styles.heroGreeting}>Gemini NLP Engine</Text>
              <Text style={styles.heroTitle}>Resume Analyzer</Text>
           </View>
           <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="google-circles-extended" size={24} color="#61DAFB" />
           </View>
        </View>

        <View style={styles.uploadContainer}>
          <TouchableOpacity 
            style={[styles.uploadBar, selectedFile && styles.uploadBarActive]} 
            onPress={handleDocumentSelection}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name={selectedFile ? "file-check" : "cloud-upload-outline"} 
              size={22} 
              color={selectedFile ? "#4CAF50" : "rgba(255,255,255,0.6)"} 
            />
            <Text style={[styles.uploadText, selectedFile && { color: '#FFF' }]} numberOfLines={1}>
              {selectedFile ? selectedFile.name : 'Upload file to Analyze'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.analyzeBtn, (!selectedFile || analyzing) && { opacity: 0.5 }]} 
            onPress={handleAnalyze}
            disabled={!selectedFile || analyzing}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color="#1A1D3D" />
            ) : (
              <Text style={styles.analyzeBtnText}>Analyze</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A1D3D" />}
      >
        {results ? (
          <View style={styles.insightSection}>
            
            {/* ATS Score Circular Indicator or Error State */}
            {results.atsScore === -1 ? (
              <View style={[styles.scoreCard, { backgroundColor: '#FFFBEB', borderColor: '#FBBF24', borderWidth: 1 }]}>
                <Feather name="alert-circle" size={40} color="#D97706" style={{ marginBottom: 12 }} />
                <Text style={[styles.sectionHeader, { color: '#D97706', marginBottom: 5 }]}>Parsing Incomplete</Text>
                <Text style={[styles.scoreFeedback, { color: '#B45309', fontWeight: '700' }]}>
                  ⚠️ {results.whatToChange[0]}
                </Text>
                <Text style={[styles.scoreFeedback, { color: '#B45309', marginTop: 10 }]}>
                  {results.howToImprove[0]}
                </Text>
              </View>
            ) : (
              <View style={styles.scoreCard}>
                <Text style={styles.sectionHeader}>Global ATS Compatibility</Text>
                <View style={styles.circleContainer}>
                  <View style={[styles.scoreCircle, { borderColor: results.atsScore > 75 ? '#4CAF50' : '#FF9800' }]}>
                    <Text style={[styles.scoreValue, { color: results.atsScore > 75 ? '#4CAF50' : '#FF9800' }]}>{results.atsScore}</Text>
                    <Text style={styles.scoreUnit}>/ 100</Text>
                  </View>
                </View>
                <Text style={styles.scoreFeedback}>
                  {results.atsScore > 75 ? "Excellent! Your resume is highly optimized for technical domains." : "Your resume needs optimization to pass modern ATS filters."}
                </Text>
              </View>
            )}

            {/* What to Change Section */}
            <View style={styles.insightCard}>
              <View style={[styles.insightHeader, { backgroundColor: '#FEF2F2' }]}>
                <Feather name="alert-triangle" size={18} color="#DC2626" />
                <Text style={[styles.insightTitle, { color: '#DC2626' }]}>What to Change</Text>
              </View>
              <View style={styles.insightBody}>
                {results.whatToChange.map((item, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <View style={styles.dotBad} />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* How to Improve Section */}
            <View style={styles.insightCard}>
              <View style={[styles.insightHeader, { backgroundColor: '#F0FDF4' }]}>
                <Feather name="trending-up" size={18} color="#16A34A" />
                <Text style={[styles.insightTitle, { color: '#16A34A' }]}>How to Improve</Text>
              </View>
              <View style={styles.insightBody}>
                {results.howToImprove.map((item, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <View style={styles.dotGood} />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
            
          </View>
        ) : (
          <View style={styles.welcomeState}>
            <View style={styles.welcomeIconBox}>
              <MaterialCommunityIcons name="text-box-search-outline" size={64} color="#1A1D3D" />
            </View>
            <Text style={styles.welcomeTitle}>Domain-Specific ATS Engine</Text>
            <Text style={styles.welcomeSub}>Upload your resume to evaluate your ATS score against major domains (Full Stack, DevOps, AI/ML, etc.)</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  heroHeader: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 25, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  heroGreeting: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  aiBadge: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(97, 218, 251, 0.1)', justifyContent: 'center', alignItems: 'center' },
  
  uploadContainer: { flexDirection: 'row', gap: 12 },
  uploadBar: { flex: 1, height: 56, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  uploadBarActive: { backgroundColor: 'rgba(76, 175, 80, 0.15)', borderColor: '#4CAF50', borderStyle: 'solid' },
  uploadText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  analyzeBtn: { backgroundColor: '#FFF', borderRadius: 18, paddingHorizontal: 20, justifyContent: 'center', height: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  analyzeBtnText: { color: '#101828', fontWeight: '900', fontSize: 14 },

  scrollContent: { paddingTop: 20, paddingBottom: 40 },
  
  welcomeState: { paddingHorizontal: 40, alignItems: 'center', marginTop: 60 },
  welcomeIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#DCFCE7' },
  welcomeTitle: { fontSize: 20, fontWeight: '900', color: '#111827', textAlign: 'center' },
  welcomeSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginTop: 10 },

  insightSection: { paddingHorizontal: 20, gap: 15 },
  sectionHeader: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 15 },
  
  scoreCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  circleContainer: { marginVertical: 10 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  scoreValue: { fontSize: 36, fontWeight: '900' },
  scoreUnit: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  scoreFeedback: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginTop: 10, fontWeight: '500' },

  insightCard: { backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 10 },
  insightTitle: { fontSize: 16, fontWeight: '800' },
  insightBody: { padding: 20, gap: 12 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dotBad: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626', marginTop: 6 },
  dotGood: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginTop: 6 },
  listText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20, fontWeight: '500' }
});
