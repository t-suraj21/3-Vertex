import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/selection');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* ILLUSTRATIVE BACKGROUND SHAPES */}
      {/* Top Left Teal/Cyan Shape */}
      <View style={styles.tealShape} />
      
      {/* Right Yellow/Peach Shape */}
      <View style={styles.yellowShape} />
      
      {/* Bottom Left Pink/Salmon Shape */}
      <View style={styles.pinkShape} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          <View style={styles.textStack}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            
            <Text style={styles.mainHeading}>
              VerifyHire & Digital{'\n'}Hiring
            </Text>
            
            <Text style={styles.subText}>
              Get your mobile app and{'\n'}
              have access to your hiring process
            </Text>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.getStartedBtn}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
            
            {/* Decorative Teal Dot */}
            <View style={styles.tealDot} />
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 45,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  
  /* BACKGROUND SHAPES */
  tealShape: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 450,
    height: 380,
    backgroundColor: '#A2D5D4',
    borderBottomRightRadius: 280,
    borderBottomLeftRadius: 100,
    transform: [{ rotate: '5deg' }],
  },
  yellowShape: {
    position: 'absolute',
    top: 60,
    right: -130,
    width: 320,
    height: 650,
    backgroundColor: '#FDE4A9',
    borderTopLeftRadius: 260,
    borderBottomLeftRadius: 260,
  },
  pinkShape: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 340,
    height: 340,
    backgroundColor: '#F89B9C',
    borderRadius: 170,
    transform: [{ scaleX: 1.2 }],
  },

  /* TEXT ELEMENTS */
  textStack: {
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    marginBottom: 20,
  },
  mainHeading: {
    fontSize: 40,
    fontWeight: '900',
    color: '#000',
    lineHeight: 48,
    letterSpacing: -0.5,
    marginBottom: 25,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    fontWeight: '400',
  },

  /* ACTION SECTION */
  actionSection: {
    marginTop: 60,
    alignItems: 'flex-start',
  },
  getStartedBtn: {
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 45,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  tealDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#A2D5D4',
    marginTop: 50,
    marginLeft: 15,
  },
});
