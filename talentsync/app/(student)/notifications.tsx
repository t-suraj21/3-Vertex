import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeScreenLayout } from '../../src/components/layout/SafeScreenLayout';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Notifications() {
  const router = useRouter();

  const notifications = [
    {
      id: 1,
      title: 'Interview Scheduled',
      message: 'Tech Corp has shortlisted you for an interview on May 20th.',
      icon: 'calendar-check',
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      time: '2h ago',
    },
    {
      id: 2,
      title: 'New AI Match!',
      message: 'We found a new Frontend Developer position matching your resume at Innovate Ltd.',
      icon: 'robot',
      color: '#1A1D3D',
      bgColor: '#E0E7FF',
      time: '5h ago',
    },
    {
      id: 3,
      title: 'Application Viewed',
      message: 'Global Systems Inc has viewed your application for Backend Intern.',
      icon: 'eye-outline',
      color: '#FF9800',
      bgColor: '#FFF3E0',
      time: '1d ago',
    }
  ];

  return (
    <SafeScreenLayout style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1A1D3D" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {notifications.map((notif) => (
          <View key={notif.id} style={styles.notifCard}>
            <View style={[styles.iconContainer, { backgroundColor: notif.bgColor }]}>
              <MaterialCommunityIcons name={notif.icon as any} size={24} color={notif.color} />
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.titleRow}>
                 <Text style={styles.notifTitle}>{notif.title}</Text>
                 <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
              <Text style={styles.notifMessage}>{notif.message}</Text>
            </View>
          </View>
        ))}
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
    marginBottom: 20,
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
  listContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D3D',
  },
  notifTime: {
    fontSize: 12,
    color: '#A0A0A0',
    fontWeight: '600',
  },
  notifMessage: {
    fontSize: 14,
    color: '#7C7D91',
    lineHeight: 22,
  }
});
