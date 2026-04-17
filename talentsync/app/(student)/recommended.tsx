import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Animated, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { BASE_URL } from '../../src/config/apiConfig';

const { width: SW } = Dimensions.get('window');

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Animated Score Ring ──────────────────────────────────────────────────────
function ScoreRing({ score, size = 150, strokeWidth = 12, color }: { score: number; size?: number; strokeWidth?: number; color: string }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: '#1E293B', position: 'absolute' }} />
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        borderTopColor: score > 25 ? color : 'transparent',
        borderRightColor: score > 50 ? color : 'transparent',
        borderBottomColor: score > 75 ? color : 'transparent',
        borderLeftColor: 'transparent',
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
      }} />
      <Text style={{ fontSize: 42, fontWeight: '900', color: '#FFF' }}>{score}</Text>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', marginTop: -2 }}>out of 100</Text>
    </View>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ label, score, icon, color }: { label: string; score: number; icon: string; color: string }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, { toValue: score, duration: 900, delay: 300, useNativeDriver: false }).start();
  }, [score]);
  const barColor = score >= 75 ? '#10B981' : score >= 50 ? '#FBBF24' : '#EF4444';
  return (
    <View style={pStyles.row}>
      <View style={[pStyles.icon, { backgroundColor: color + '18' }]}>
        <Feather name={icon as any} size={15} color={color} />
      </View>
      <View style={pStyles.bar}>
        <View style={pStyles.labelRow}>
          <Text style={pStyles.label}>{label}</Text>
          <Text style={[pStyles.score, { color: barColor }]}>{score}%</Text>
        </View>
        <View style={pStyles.track}>
          <Animated.View style={[pStyles.fill, { backgroundColor: barColor, width: barAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
        </View>
      </View>
    </View>
  );
}
const pStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  icon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bar: { flex: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 12, fontWeight: '700', color: '#334155' },
  score: { fontSize: 12, fontWeight: '800' },
  track: { height: 7, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});

// ── Demand Pill ──────────────────────────────────────────────────────────────
function DemandPill({ level }: { level: string }) {
  const bg = level === 'Very High' ? '#DCFCE7' : level === 'High' ? '#FEF3C7' : '#F1F5F9';
  const fg = level === 'Very High' ? '#15803D' : level === 'High' ? '#B45309' : '#475569';
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
      <Text style={{ fontSize: 10, fontWeight: '800', color: fg }}>{level}</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ResumeAnalyzerScreen() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'jobs' | 'market'>('overview');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setSelectedFile(null); setResults(null); setActiveTab('overview'); setRefreshing(false); }, 800);
  };

  // ── File Picker ────────────────────────────────────────────────────────
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) { setSelectedFile(result.assets[0]); setResults(null); }
    } catch { Alert.alert('Error', 'Failed to pick document'); }
  };

  // ── Analyze ────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    fadeAnim.setValue(0);

    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('resume', { uri: selectedFile.uri, name: selectedFile.name || 'resume.pdf', type: selectedFile.mimeType || 'application/pdf' } as any);

      const data: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/ai/parse-resume`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 60000;
        xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error('Invalid JSON')); } };
        xhr.onerror = () => reject(new Error('Network error — check Wi-Fi'));
        xhr.ontimeout = () => reject(new Error('Timeout — server too slow'));
        xhr.send(formData);
      });

      if (data.success) {
        setResults(data);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err: any) {
      setResults({ success: false, atsScore: -1, error: err.message });
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const scoreColor = (s: number) => s >= 80 ? '#10B981' : s >= 60 ? '#FBBF24' : '#EF4444';
  const scoreLabel = (s: number) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Needs Work' : 'Poor';

  /* ═════════════════════════════════════════════════════════════════════════
     RENDER
     ═════════════════════════════════════════════════════════════════════════ */
  return (
    <View style={s.container}>
      <StatusBar style="light" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <LinearGradient colors={['#0F172A', '#1E293B']} style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.headerLabel}>INTELLIGENT RESUME SCREENING</Text>
            <Text style={s.headerTitle}>AI Resume Analyzer</Text>
          </View>
          <View style={s.aiBadge}>
            <MaterialCommunityIcons name="robot-outline" size={22} color="#818CF8" />
          </View>
        </View>

        {/* Upload Bar */}
        <View style={s.uploadRow}>
          <TouchableOpacity style={[s.uploadBar, selectedFile && s.uploadBarOk]} onPress={pickDocument} activeOpacity={0.8}>
            <MaterialCommunityIcons name={selectedFile ? 'file-check' : 'cloud-upload-outline'} size={18} color={selectedFile ? '#4ADE80' : 'rgba(255,255,255,0.45)'} />
            <Text style={[s.uploadBarText, selectedFile && { color: '#E2E8F0' }]} numberOfLines={1}>
              {selectedFile ? selectedFile.name : 'Upload resume (PDF / DOCX)'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.analyzeBtn, (!selectedFile || analyzing) && { opacity: 0.35 }]} onPress={handleAnalyze} disabled={!selectedFile || analyzing}>
            {analyzing ? <ActivityIndicator size="small" color="#0F172A" /> : (
              <><Feather name="zap" size={15} color="#0F172A" /><Text style={s.analyzeBtnTxt}>Analyze</Text></>
            )}
          </TouchableOpacity>
        </View>

        {analyzing && (
          <View style={s.loadingPill}>
            <ActivityIndicator size="small" color="#818CF8" />
            <Text style={s.loadingText}>Gemini AI + NLP scanning your resume...</Text>
          </View>
        )}
      </LinearGradient>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}>

        {results ? (
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* ERROR STATE */}
            {results.atsScore === -1 ? (
              <View style={[s.card, { margin: 16, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' }]}>
                <Feather name="alert-circle" size={36} color="#D97706" style={{ alignSelf: 'center', marginBottom: 10 }} />
                <Text style={[s.cardTitle, { color: '#92400E', textAlign: 'center' }]}>Analysis Failed</Text>
                <Text style={{ color: '#92400E', textAlign: 'center', marginTop: 8, fontSize: 13, lineHeight: 20 }}>⚠️ {results.error}</Text>
                <Text style={{ color: '#B45309', textAlign: 'center', marginTop: 6, fontSize: 12 }}>Make sure your phone and laptop are on the same Wi-Fi</Text>
              </View>
            ) : (
              <>
                {/* ── SCORE HERO ──────────────────────────────────────────── */}
                <LinearGradient colors={['#0F172A', '#1E293B']} style={s.scoreHero}>
                  <View style={s.scoreHeroInner}>
                    <ScoreRing score={results.atsScore} color={scoreColor(results.atsScore)} />
                    <View style={s.scoreInfo}>
                      <View style={[s.scorePill, { backgroundColor: scoreColor(results.atsScore) + '25' }]}>
                        <Text style={[s.scorePillText, { color: scoreColor(results.atsScore) }]}>{scoreLabel(results.atsScore)}</Text>
                      </View>
                      <Text style={s.scoreInfoTitle}>ATS Compatibility</Text>
                      <Text style={s.scoreInfoSub}>Bias-free, data-driven analysis powered by Gemini AI + NLP</Text>
                    </View>
                  </View>
                  {results.summary ? <Text style={s.summaryText}>{results.summary}</Text> : null}
                </LinearGradient>

                {/* ── TAB BAR ─────────────────────────────────────────────── */}
                <View style={s.tabBar}>
                  {[
                    { key: 'overview', label: 'Overview', icon: 'bar-chart-2' },
                    { key: 'skills', label: 'Skills', icon: 'cpu' },
                    { key: 'jobs', label: 'Job Match', icon: 'briefcase' },
                    { key: 'market', label: 'Trends', icon: 'trending-up' },
                  ].map(t => (
                    <TouchableOpacity key={t.key} style={[s.tab, activeTab === t.key && s.tabActive]} onPress={() => setActiveTab(t.key as any)}>
                      <Feather name={t.icon as any} size={14} color={activeTab === t.key ? '#6366F1' : '#94A3B8'} />
                      <Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* ── TAB: OVERVIEW ───────────────────────────────────────── */}
                {activeTab === 'overview' && (
                  <View style={s.section}>
                    {/* Profile Tags */}
                    {results.profileTags?.length > 0 && (
                      <View style={s.card}>
                        <View style={s.cardHeader}><Feather name="user" size={15} color="#6366F1" /><Text style={s.cardTitle}>Candidate Profile</Text></View>
                        <View style={s.chipRow}>
                          {results.profileTags.map((t: string, i: number) => (
                            <View key={i} style={s.chip}><Text style={s.chipText}>{t}</Text></View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* NLP Microservice Analysis */}
                    {(results.education || results.experience || results.recommendedRoles?.length > 0) && (
                      <View style={s.card}>
                        <View style={s.cardHeader}>
                          <MaterialCommunityIcons name="brain" size={16} color="#6366F1" />
                          <Text style={s.cardTitle}>NLP Engine Analysis</Text>
                          {results.nlpScore != null && (
                            <View style={[s.badge, { backgroundColor: '#EEF2FF' }]}>
                              <Text style={[s.badgeNum, { color: '#6366F1' }]}>{results.nlpScore}</Text>
                            </View>
                          )}
                        </View>
                        <View style={{ paddingHorizontal: 20, paddingBottom: 18, paddingTop: 8, gap: 10 }}>
                          {results.education && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}>
                              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' }}>
                                <Feather name="book-open" size={15} color="#16A34A" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Education</Text>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 }}>{results.education}</Text>
                              </View>
                            </View>
                          )}
                          {results.experience && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}>
                              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' }}>
                                <Feather name="award" size={15} color="#F59E0B" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Experience Level</Text>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 }}>{results.experience}</Text>
                              </View>
                            </View>
                          )}
                          {results.recommendedRoles?.length > 0 && (
                            <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }}>
                                  <Feather name="target" size={15} color="#6366F1" />
                                </View>
                                <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recommended Roles</Text>
                              </View>
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginLeft: 44 }}>
                                {results.recommendedRoles.map((role: string, i: number) => (
                                  <View key={i} style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#C7D2FE' }}>
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#4338CA' }}>{role}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Section Breakdown */}
                    {results.sectionScores && (
                      <View style={s.card}>
                        <View style={s.cardHeader}><Feather name="bar-chart-2" size={15} color="#6366F1" /><Text style={s.cardTitle}>ATS Section Breakdown</Text></View>
                        <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 4 }}>
                          <ProgressBar label="Formatting & Layout" score={results.sectionScores.formatting} icon="layout" color="#6366F1" />
                          <ProgressBar label="Technical Skills" score={results.sectionScores.skills} icon="code" color="#0EA5E9" />
                          <ProgressBar label="Work Experience" score={results.sectionScores.experience} icon="briefcase" color="#F59E0B" />
                          <ProgressBar label="Education" score={results.sectionScores.education} icon="book-open" color="#10B981" />
                          <ProgressBar label="Impact & Metrics" score={results.sectionScores.impact} icon="trending-up" color="#EF4444" />
                        </View>
                      </View>
                    )}

                    {/* Keyword Density */}
                    {results.keywordDensity && Object.keys(results.keywordDensity).length > 0 && (
                      <View style={s.card}>
                        <View style={s.cardHeader}><Feather name="hash" size={15} color="#6366F1" /><Text style={s.cardTitle}>Keyword Density (NLP)</Text></View>
                        <View style={[s.chipRow, { paddingBottom: 18 }]}>
                          {Object.entries(results.keywordDensity).map(([kw, count]: any, i: number) => (
                            <View key={i} style={s.kwChip}>
                              <Text style={s.kwWord}>{kw}</Text>
                              <View style={s.kwBadge}><Text style={s.kwCount}>×{count}</Text></View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* What to Change */}
                    <View style={s.card}>
                      <View style={[s.feedbackHeader, { backgroundColor: '#FEF2F2' }]}>
                        <Feather name="alert-triangle" size={16} color="#DC2626" />
                        <Text style={[s.feedbackTitle, { color: '#DC2626' }]}>What to Change</Text>
                        <View style={[s.badge, { backgroundColor: '#FEE2E2' }]}><Text style={[s.badgeNum, { color: '#DC2626' }]}>{results.whatToChange?.length}</Text></View>
                      </View>
                      <View style={s.feedbackBody}>
                        {(results.whatToChange || []).map((item: string, i: number) => (
                          <View key={i} style={s.feedbackItem}>
                            <View style={[s.numCircle, { backgroundColor: '#FEE2E2' }]}><Text style={[s.numText, { color: '#DC2626' }]}>{i + 1}</Text></View>
                            <Text style={s.feedbackText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* How to Improve */}
                    <View style={s.card}>
                      <View style={[s.feedbackHeader, { backgroundColor: '#F0FDF4' }]}>
                        <Feather name="check-circle" size={16} color="#16A34A" />
                        <Text style={[s.feedbackTitle, { color: '#16A34A' }]}>How to Improve</Text>
                        <View style={[s.badge, { backgroundColor: '#DCFCE7' }]}><Text style={[s.badgeNum, { color: '#16A34A' }]}>{results.howToImprove?.length}</Text></View>
                      </View>
                      <View style={s.feedbackBody}>
                        {(results.howToImprove || []).map((item: string, i: number) => (
                          <View key={i} style={s.feedbackItem}>
                            <View style={[s.numCircle, { backgroundColor: '#DCFCE7' }]}><Text style={[s.numText, { color: '#16A34A' }]}>{i + 1}</Text></View>
                            <Text style={s.feedbackText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* ── TAB: SKILLS ─────────────────────────────────────────── */}
                {activeTab === 'skills' && (
                  <View style={s.section}>
                    {/* Skills by Category */}
                    {results.skillCategories && Object.keys(results.skillCategories).length > 0 ? (
                      Object.entries(results.skillCategories).map(([category, skills]: any, idx: number) => (
                        <View key={idx} style={s.card}>
                          <View style={s.cardHeader}>
                            <Feather name={
                              category.includes('Language') ? 'code' :
                              category.includes('Frontend') ? 'monitor' :
                              category.includes('Backend') ? 'server' :
                              category.includes('Database') ? 'database' :
                              category.includes('DevOps') ? 'cloud' :
                              category.includes('Mobile') ? 'smartphone' :
                              category.includes('AI') ? 'cpu' : 'tool'
                            } size={15} color="#6366F1" />
                            <Text style={s.cardTitle}>{category}</Text>
                            <View style={[s.badge, { backgroundColor: '#EEF2FF' }]}>
                              <Text style={[s.badgeNum, { color: '#6366F1' }]}>{skills.length}</Text>
                            </View>
                          </View>
                          <View style={[s.chipRow, { paddingBottom: 18 }]}>
                            {skills.map((sk: string, i: number) => (
                              <View key={i} style={s.skillChip}>
                                <View style={s.skillDot} />
                                <Text style={s.skillChipText}>{sk}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))
                    ) : results.extractedSkills?.length > 0 ? (
                      <View style={s.card}>
                        <View style={s.cardHeader}><Feather name="cpu" size={15} color="#6366F1" /><Text style={s.cardTitle}>Detected Skills ({results.extractedSkills.length})</Text></View>
                        <View style={[s.chipRow, { paddingBottom: 18 }]}>
                          {results.extractedSkills.map((sk: string, i: number) => (
                            <View key={i} style={s.skillChip}><View style={s.skillDot} /><Text style={s.skillChipText}>{sk}</Text></View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View style={s.emptyState}>
                        <Feather name="alert-circle" size={40} color="#CBD5E1" />
                        <Text style={s.emptyTitle}>No Skills Detected</Text>
                        <Text style={s.emptySub}>Add a dedicated "Technical Skills" section to your resume</Text>
                      </View>
                    )}

                    {/* Total Skills Summary */}
                    {results.extractedSkills?.length > 0 && (
                      <View style={[s.card, { backgroundColor: '#EEF2FF' }]}>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>{results.extractedSkills.length}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: '#312E81' }}>Total Skills Extracted</Text>
                            <Text style={{ fontSize: 12, color: '#4338CA', marginTop: 2 }}>
                              Across {Object.keys(results.skillCategories || {}).length || 1} categories via NLP analysis
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* ── TAB: JOB MATCHING ───────────────────────────────────── */}
                {activeTab === 'jobs' && (
                  <View style={s.section}>
                    <View style={[s.card, { backgroundColor: '#EEF2FF' }]}>
                      <View style={{ paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Feather name="info" size={16} color="#4338CA" />
                        <Text style={{ fontSize: 12, color: '#4338CA', fontWeight: '600', flex: 1, lineHeight: 18 }}>
                          Jobs are ranked by skill relevance & fit score — bias-free, data-driven matching.
                        </Text>
                      </View>
                    </View>

                    {results.matchedJobs?.length > 0 ? (
                      results.matchedJobs.map((job: any, i: number) => (
                        <View key={i} style={s.card}>
                          <View style={{ padding: 18 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 3 }}>{job.title}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>{job.company}</Text>
                                  {job.companyVerified && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                      <MaterialCommunityIcons name="check-decagram" size={10} color="#16A34A" />
                                      <Text style={{ fontSize: 9, fontWeight: '800', color: '#16A34A' }}>VERIFIED</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                              {/* Fit Score Ring */}
                              <View style={{
                                width: 50, height: 50, borderRadius: 25,
                                borderWidth: 3, borderColor: job.fitScore >= 70 ? '#10B981' : job.fitScore >= 40 ? '#FBBF24' : '#EF4444',
                                justifyContent: 'center', alignItems: 'center',
                              }}>
                                <Text style={{ fontSize: 14, fontWeight: '900', color: job.fitScore >= 70 ? '#10B981' : job.fitScore >= 40 ? '#FBBF24' : '#EF4444' }}>{job.fitScore}%</Text>
                              </View>
                            </View>

                            {/* Meta */}
                            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Feather name="map-pin" size={11} color="#94A3B8" />
                                <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>{job.location}</Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Feather name="clock" size={11} color="#94A3B8" />
                                <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>{job.type}</Text>
                              </View>
                              {job.salary !== 'Not Disclosed' && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <Feather name="dollar-sign" size={11} color="#94A3B8" />
                                  <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>{job.salary}</Text>
                                </View>
                              )}
                            </View>

                            {/* Matched Skills */}
                            {job.matchedSkills?.length > 0 && (
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {job.matchedSkills.map((ms: string, j: number) => (
                                  <View key={j} style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#DCFCE7' }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#15803D' }}>{ms}</Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {/* Ranking indicator */}
                            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <MaterialCommunityIcons name="trophy-outline" size={14} color="#F59E0B" />
                              <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400E' }}>
                                Rank #{i + 1} — {job.matchCount} skill{job.matchCount !== 1 ? 's' : ''} matched
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={s.emptyState}>
                        <Feather name="briefcase" size={40} color="#CBD5E1" />
                        <Text style={s.emptyTitle}>No Job Matches Found</Text>
                        <Text style={s.emptySub}>No open positions match your current skill set. Check back as new jobs are posted.</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* ── TAB: MARKET TRENDS ──────────────────────────────────── */}
                {activeTab === 'market' && (
                  <View style={s.section}>
                    {/* Your Skills Demand */}
                    {results.marketInsights?.length > 0 && (
                      <View style={s.card}>
                        <View style={s.cardHeader}><Feather name="trending-up" size={15} color="#10B981" /><Text style={s.cardTitle}>Your Skills — Market Demand</Text></View>
                        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
                          {results.marketInsights.map((mi: any, i: number) => (
                            <View key={i} style={s.marketRow}>
                              <Text style={s.marketSkill}>{mi.skill}</Text>
                              <DemandPill level={mi.demand} />
                              <Text style={s.marketGrowth}>{mi.growth}</Text>
                              <Text style={s.marketOpenings}>{mi.openings}</Text>
                            </View>
                          ))}
                        </View>
                        {/* Legend */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 }}>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, color: '#94A3B8', fontWeight: '700' }}>DEMAND</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, color: '#94A3B8', fontWeight: '700' }}>YOY GROWTH</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, color: '#94A3B8', fontWeight: '700' }}>OPEN ROLES</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* High Demand Skills You're Missing */}
                    {results.missingHighDemand?.length > 0 && (
                      <View style={s.card}>
                        <View style={[s.feedbackHeader, { backgroundColor: '#FFF7ED' }]}>
                          <Feather name="star" size={16} color="#EA580C" />
                          <Text style={[s.feedbackTitle, { color: '#EA580C' }]}>High-Demand Skills You're Missing</Text>
                        </View>
                        <View style={{ paddingHorizontal: 16, paddingBottom: 14, paddingTop: 8 }}>
                          {results.missingHighDemand.map((ms: any, i: number) => (
                            <View key={i} style={[s.marketRow, { backgroundColor: '#FFF7ED' }]}>
                              <Text style={[s.marketSkill, { color: '#9A3412' }]}>{ms.skill}</Text>
                              <DemandPill level="Very High" />
                              <Text style={s.marketGrowth}>{ms.growth}</Text>
                              <Text style={s.marketOpenings}>{ms.openings}</Text>
                            </View>
                          ))}
                        </View>
                        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
                          <Text style={{ fontSize: 11, color: '#B45309', fontWeight: '600', lineHeight: 18 }}>
                            💡 Learning these skills could significantly increase your market value and job matches.
                          </Text>
                        </View>
                      </View>
                    )}

                    {(!results.marketInsights?.length && !results.missingHighDemand?.length) && (
                      <View style={s.emptyState}>
                        <Feather name="trending-up" size={40} color="#CBD5E1" />
                        <Text style={s.emptyTitle}>No Market Data</Text>
                        <Text style={s.emptySub}>Upload a resume with technical skills to see market trends.</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* ── RETRY ───────────────────────────────────────────────── */}
                <TouchableOpacity style={s.retryBtn} onPress={() => { setResults(null); setSelectedFile(null); setActiveTab('overview'); }}>
                  <Feather name="refresh-cw" size={15} color="#6366F1" />
                  <Text style={s.retryText}>Analyze Another Resume</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        ) : (
          /* ── WELCOME STATE ─────────────────────────────────────────────── */
          <View style={s.welcome}>
            <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={s.welcomeIcon}>
              <MaterialCommunityIcons name="text-box-search-outline" size={52} color="#6366F1" />
            </LinearGradient>
            <Text style={s.welcomeTitle}>Intelligent Resume Screening</Text>
            <Text style={s.welcomeSub}>
              Upload your resume to get an AI-powered ATS score, skill extraction, job matching, market insights, and personalized improvement plan.
            </Text>

            <View style={s.featureRow}>
              {[
                { icon: 'bar-chart-2', label: 'ATS Score', bg: '#EEF2FF', color: '#6366F1' },
                { icon: 'cpu', label: 'NLP Skills', bg: '#DCFCE7', color: '#10B981' },
                { icon: 'briefcase', label: 'Job Match', bg: '#FEF3C7', color: '#F59E0B' },
                { icon: 'trending-up', label: 'Trends', bg: '#FCE7F3', color: '#EC4899' },
              ].map((f, i) => (
                <View key={i} style={s.featureItem}>
                  <View style={[s.featureIconBox, { backgroundColor: f.bg }]}>
                    <Feather name={f.icon as any} size={18} color={f.color} />
                  </View>
                  <Text style={s.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>

            {/* How It Works */}
            <View style={[s.card, { marginTop: 30, width: '100%' }]}>
              <View style={s.cardHeader}><Feather name="info" size={15} color="#6366F1" /><Text style={s.cardTitle}>How It Works</Text></View>
              <View style={{ paddingHorizontal: 20, paddingBottom: 18, gap: 14 }}>
                {[
                  { step: '1', text: 'Upload your resume (PDF or DOCX format)' },
                  { step: '2', text: 'AI + NLP engine extracts skills, analyzes formatting & content' },
                  { step: '3', text: 'Gemini AI generates ATS score with section breakdown' },
                  { step: '4', text: 'Get matched jobs ranked by skill relevance' },
                  { step: '5', text: 'See market demand trends + personalized improvements' },
                ].map((s2, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#6366F1' }}>{s2.step}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#475569', fontWeight: '600', flex: 1 }}>{s2.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 22, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLabel: { color: '#818CF8', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  headerTitle: { color: '#F1F5F9', fontSize: 24, fontWeight: '900' },
  aiBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(129,140,248,0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(129,140,248,0.2)' },

  // Upload
  uploadRow: { flexDirection: 'row', gap: 10 },
  uploadBar: { flex: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed' as any, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  uploadBarOk: { backgroundColor: 'rgba(74,222,128,0.1)', borderColor: '#4ADE80', borderStyle: 'solid' as any },
  uploadBarText: { color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: '600', flex: 1 },
  analyzeBtn: { backgroundColor: '#818CF8', borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', height: 50, flexDirection: 'row', gap: 5 },
  analyzeBtnTxt: { color: '#0F172A', fontWeight: '900', fontSize: 13 },
  loadingPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, backgroundColor: 'rgba(129,140,248,0.1)', borderRadius: 10, paddingVertical: 9 },
  loadingText: { color: '#C7D2FE', fontSize: 11, fontWeight: '700' },

  // Score Hero
  scoreHero: { marginHorizontal: 16, marginTop: 16, borderRadius: 24, padding: 22, overflow: 'hidden' },
  scoreHeroInner: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreInfo: { flex: 1 },
  scorePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  scorePillText: { fontSize: 11, fontWeight: '800' },
  scoreInfoTitle: { fontSize: 17, fontWeight: '900', color: '#F1F5F9', marginBottom: 4 },
  scoreInfoSub: { fontSize: 11, color: '#94A3B8', fontWeight: '500', lineHeight: 16 },
  summaryText: { marginTop: 16, fontSize: 12, color: '#94A3B8', lineHeight: 19, fontWeight: '500' },

  // Tab Bar
  tabBar: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: '#FFF', borderRadius: 16, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 11, borderRadius: 12 },
  tabActive: { backgroundColor: '#EEF2FF' },
  tabText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  tabTextActive: { color: '#6366F1' },

  section: { paddingHorizontal: 16, paddingTop: 14, gap: 14 },

  // Cards
  card: { backgroundColor: '#FFF', borderRadius: 18, overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', flex: 1 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 20, paddingTop: 10 },
  chip: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#C7D2FE' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#4338CA' },

  // Skills
  skillChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 5, borderWidth: 1, borderColor: '#E2E8F0' },
  skillDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#10B981' },
  skillChipText: { fontSize: 11, fontWeight: '600', color: '#334155' },

  // Keyword Density
  kwChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 10, paddingLeft: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  kwWord: { fontSize: 11, fontWeight: '700', color: '#334155', marginRight: 6 },
  kwBadge: { backgroundColor: '#6366F1', paddingHorizontal: 7, paddingVertical: 5 },
  kwCount: { fontSize: 10, fontWeight: '800', color: '#FFF' },

  // Feedback Cards
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, gap: 8 },
  feedbackTitle: { fontSize: 14, fontWeight: '800', flex: 1 },
  feedbackBody: { padding: 18, gap: 12 },
  feedbackItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  feedbackText: { flex: 1, fontSize: 12, color: '#374151', lineHeight: 19, fontWeight: '500' },
  badge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  badgeNum: { fontSize: 11, fontWeight: '900' },
  numCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  numText: { fontSize: 10, fontWeight: '900' },

  // Market Rows
  marketRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, marginBottom: 4, backgroundColor: '#F8FAFC' },
  marketSkill: { flex: 1, fontSize: 12, fontWeight: '700', color: '#0F172A' },
  marketGrowth: { fontSize: 11, fontWeight: '800', color: '#10B981', width: 48, textAlign: 'center' },
  marketOpenings: { fontSize: 11, fontWeight: '600', color: '#64748B', width: 42, textAlign: 'right' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#94A3B8' },
  emptySub: { fontSize: 12, color: '#CBD5E1', textAlign: 'center', lineHeight: 18 },

  // Retry
  retryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, backgroundColor: '#EEF2FF', borderRadius: 14, marginHorizontal: 16, marginTop: 16 },
  retryText: { fontSize: 13, fontWeight: '800', color: '#6366F1' },

  // Welcome
  welcome: { paddingHorizontal: 28, alignItems: 'center', marginTop: 36 },
  welcomeIcon: { width: 105, height: 105, borderRadius: 52, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#C7D2FE', marginBottom: 22 },
  welcomeTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  welcomeSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 21 },
  featureRow: { flexDirection: 'row', gap: 14, marginTop: 28 },
  featureItem: { alignItems: 'center', gap: 7 },
  featureIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  featureLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
});
