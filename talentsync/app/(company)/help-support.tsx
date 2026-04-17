import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const FAQS = [
  { q: "How do I upgrade my account verification?", a: "Verification is managed by our internal team. You can submit your documents through the settings tab, and validation takes 48 hours." },
  { q: "Where can I see candidate resumes?", a: "When you select a candidate from the review screen, their full profile and attached PDF resume will be available to download." },
  { q: "How to integrate Google Form?", a: "In the Post Job screen, select 'Google Form' on step 3 and paste your valid completely public link." },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.headerGlow} />

      <SafeScreenLayout style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#0A0F24" />
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Contact Box */}
          <View style={styles.contactCard}>
            <View style={styles.contactIconCircle}>
              <MaterialCommunityIcons name="headphones" size={32} color="#4F46E5" />
            </View>
            <Text style={styles.contactTitle}>Need Immediate Help?</Text>
            <Text style={styles.contactSub}>Our enterprise support team is available 24/7</Text>
            <TouchableOpacity style={styles.contactBtn}>
              <MaterialCommunityIcons name="chat-processing-outline" size={18} color="#FFF" />
              <Text style={styles.contactBtnText}>Start Live Chat</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqCard}>
            {FAQS.map((faq, i) => (
              <View key={i} style={[styles.faqItem, i < FAQS.length - 1 && styles.faqBorder]}>
                <TouchableOpacity style={styles.faqRow} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
                  <Text style={[styles.faqQ, openFaq === i && styles.faqQActive]}>{faq.q}</Text>
                  <Feather name={openFaq === i ? 'chevron-up' : 'chevron-down'} size={20} color={openFaq === i ? '#10B981' : '#9CA3AF'} />
                </TouchableOpacity>
                {openFaq === i && <Text style={styles.faqA}>{faq.a}</Text>}
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Send us a message</Text>
          <View style={styles.ticketCard}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your issue..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={msg}
              onChangeText={setMsg}
            />
            <TouchableOpacity style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>Submit Ticket</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  headerGlow: { position: 'absolute', top: -100, left: 0, right: 0, height: 300, backgroundColor: '#E0E7FF', opacity: 0.4, borderRadius: 200, transform: [{ scaleX: 1.5 }] },
  safeArea: { paddingHorizontal: 0, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 15 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  title: { fontSize: 20, fontWeight: '900', color: '#0A0F24' },
  content: { paddingHorizontal: 22, paddingTop: 10 },

  contactCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  contactIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  contactTitle: { fontSize: 20, fontWeight: '900', color: '#0A0F24', marginBottom: 8 },
  contactSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4F46E5', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16 },
  contactBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#6B7280', marginBottom: 12 },
  faqCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  faqItem: { paddingVertical: 14 },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, fontSize: 15, fontWeight: '700', color: '#374151', paddingRight: 15 },
  faqQActive: { color: '#10B981' },
  faqA: { marginTop: 12, fontSize: 14, color: '#6B7280', lineHeight: 22 },

  ticketCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  textArea: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 15, fontSize: 15, color: '#0A0F24', minHeight: 120, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 15 },
  submitBtn: { backgroundColor: '#0A0F24', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
