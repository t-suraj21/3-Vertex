import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const theme = useTheme();
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Basic redirection simulation after splash
    if (!isLoading) {
      if (!isAuthenticated) {
        // give it a short delay for splash effect
        setTimeout(() => {
          router.replace('/(auth)/onboarding');
        }, 1500);
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {/* Fallback to simple text if image not ready */}
      <Image
         source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3214/3214011.png' }}
         style={styles.logo}
         tintColor="#ffffff"
      />
      <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});
