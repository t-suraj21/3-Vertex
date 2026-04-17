import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function JobsListingScreen() {
  const router = useRouter();

  // This is a placeholder for the jobs search/listing page
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Browse Jobs', headerShown: true }} />
      <View style={styles.content}>
        <MaterialCommunityIcons name="briefcase-search" size={64} color="#D1D1DE" />
        <Text style={styles.title}>Job Search</Text>
        <Text style={styles.subtitle}>Explore opportunities from verified companies.</Text>
        <TouchableOpacity 
          style={styles.btn}
          onPress={() => router.back()}
        >
          <Text style={styles.btnText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#0A0F24' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 24 },
  btn: { marginTop: 30, backgroundColor: '#0A0F24', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});
