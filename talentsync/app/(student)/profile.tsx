import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../src/store/slices/authSlice';
import { store, RootState } from '../../src/store';
import { Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { setCredentials } from '../../src/store/slices/authSlice';
import { BASE_URL } from '../../src/config/apiConfig';

export default function StudentProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [roleName, setRoleName] = useState(user?.roleName || 'Student');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [github, setGithub] = useState(user?.github || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [resume, setResume] = useState(user?.resume || '');
  const [portfolio, setPortfolio] = useState(user?.portfolio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, location, github, linkedin, resume, portfolio }),
      });
      const data = await response.json();
      if (data.success) {
        dispatch(setCredentials({ user: data.user, token, role: user.role }));
        Alert.alert("Success", "Profile Updated Successfully!");
      } else {
        Alert.alert("Update Failed", data.error || "Unknown error occurred");
      }
    } catch (err) {
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow access to your photos to change profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'profile.jpg';

      // @ts-ignore
      formData.append('avatar', {
        uri,
        name: filename,
        type: 'image/jpeg',
      });

      const response = await fetch(`${BASE_URL}/auth/profile/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setAvatar(data.user.avatar);
        dispatch(setCredentials({ user: data.user, token, role: user.role }));
        Alert.alert("Success", "Profile picture updated!");
      } else {
        Alert.alert("Error", data.error || "Failed to upload image");
      }
    } catch (err) {
      Alert.alert("Upload Error", "Could not connect to server.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/selection');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Full Screen Header */}
      <View style={styles.headerArea}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <View style={styles.profileHero}>
          <View style={styles.avatarContainer}>
            {uploading ? (
              <View style={styles.avatarLarge}>
                <ActivityIndicator size="large" color="#FFF" />
              </View>
            ) : (
              <Image
                source={{ uri: avatar ? `${BASE_URL.replace('/api', '')}${avatar}` : 'https://i.pravatar.cc/150?img=12' }}
                style={styles.avatarLarge}
              />
            )}
            <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage} disabled={uploading}>
              <Feather name="camera" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroName}>{name || 'Student Name'}</Text>
          <Text style={styles.heroRole}>{roleName} • {location || 'Location'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Personal Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#6B7280" />
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address (Read-only)</Text>
            <View style={[styles.inputBox, { backgroundColor: '#F9FAFB' }]}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#9CA3AF" />
              <TextInput style={styles.input} value={user?.email} editable={false} color="#6B7280" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="phone-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Location</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Bangalore, India"
              />
            </View>
          </View>
        </View>

        {/* Documents */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Portfolio & Web Links</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Portfolio Website</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="web" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={portfolio}
                onChangeText={setPortfolio}
                placeholder="https://yourportfolio.com"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>GitHub Profile</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="github" size={20} color="#0A0F24" />
              <TextInput style={styles.input} value={github} onChangeText={setGithub} placeholder="github.com/username" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LinkedIn Profile</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="linkedin" size={20} color="#0284C7" />
              <TextInput style={styles.input} value={linkedin} onChangeText={setLinkedin} placeholder="linkedin.com/in/username" />
            </View>
          </View>
        </View>

        {/* Save/Submit Button */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: '#10B981', borderColor: '#10B981' }]} onPress={handleSave} disabled={saving}>
          <Text style={[styles.logoutText, { color: '#FFF' }]}>{saving ? 'Saving...' : 'Save Profile Updates'}</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  headerArea: {
    backgroundColor: '#0A0F24',
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    paddingHorizontal: 25, paddingBottom: 40, paddingTop: 10,
  },
  headerTop: { alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },

  profileHero: { alignItems: 'center' },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' },
  editAvatarBtn: {
    position: 'absolute', top: 70, right: 130,
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0A0F24',
  },
  heroName: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 12, marginBottom: 4 },
  heroRole: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0A0F24', marginBottom: 15 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },

  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 48 },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#0A0F24', fontWeight: '500' },

  uploadRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  docIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 14, fontWeight: '700', color: '#0A0F24', marginBottom: 2 },
  docSize: { fontSize: 12, color: '#9CA3AF' },

  addLinkBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 5, paddingVertical: 5 },
  addLinkText: { fontSize: 13, fontWeight: '700', color: '#10B981', marginLeft: 4 },

  addRefText: { fontSize: 13, fontWeight: '700', color: '#3B82F6' },
  referenceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  refAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  refInitials: { fontSize: 14, fontWeight: '800', color: '#059669' },
  refInfo: { flex: 1 },
  refName: { fontSize: 14, fontWeight: '800', color: '#0A0F24', marginBottom: 2 },
  refRole: { fontSize: 12, color: '#6B7280' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FEF2F2', paddingVertical: 18, borderRadius: 20,
    borderWidth: 1, borderColor: '#FECACA', marginTop: 10,
  },
  logoutText: { fontSize: 16, fontWeight: '800', color: '#EF4444' },
});
