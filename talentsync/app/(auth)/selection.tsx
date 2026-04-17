import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<string | null>(null);

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnimCard1 = useRef(new Animated.Value(50)).current;
  const slideAnimCard2 = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Sequence the entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.stagger(150, [
        Animated.timing(slideAnimCard1, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimCard2, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleRolePress = (role: string, path: string) => {
    setActiveRole(role);
    setTimeout(() => {
      router.push(path as any);
      setActiveRole(null);
    }, 200);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Background Shapes (Matching Onboarding) */}
      <View style={styles.tealShape} />
      <View style={styles.yellowShape} />
      <View style={styles.pinkShape} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          <Animated.View style={[styles.headerSection, { opacity: fadeAnim }]}>
            <View style={styles.brandRow}>
              <View style={styles.logoCircle}>
                <MaterialCommunityIcons name="briefcase-account" size={24} color="#FFF" />
              </View>
              <Text style={styles.brandName}>VerifyHire</Text>
            </View>
            <Text style={styles.mainHeading}>
              Identify Yourselves
            </Text>
            <Text style={styles.subText}>
              Select your role to continue building{'\n'}your professional network
            </Text>
          </Animated.View>

          <View style={styles.selectionSection}>
            {/* Student Card */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnimCard1 }] }}>
              <TouchableOpacity
                style={[styles.roleCard, activeRole === 'student' && styles.cardActive]}
                onPress={() => handleRolePress('student', '/(auth)/student/login')}
                activeOpacity={0.9}
              >
                <View style={[styles.iconBox, { backgroundColor: '#FDE4A9' }]}>
                  <MaterialCommunityIcons name="school" size={26} color="#000" />
                </View>
                <View style={styles.roleMeta}>
                  <Text style={styles.roleTitle}>Student</Text>
                  <Text style={styles.roleSub}>Find & apply for jobs</Text>
                </View>
                <View style={[styles.arrowCircle, activeRole === 'student' && styles.arrowCircleActive]}>
                   <Feather name="arrow-right" size={18} color="#FFF" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Company Card */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnimCard2 }] }}>
              <TouchableOpacity
                style={[styles.roleCard, activeRole === 'company' && styles.cardActive]}
                onPress={() => handleRolePress('company', '/(auth)/company/login')}
                activeOpacity={0.9}
              >
                <View style={[styles.iconBox, { backgroundColor: '#A2D5D4' }]}>
                  <MaterialCommunityIcons name="domain" size={26} color="#000" />
                </View>
                <View style={styles.roleMeta}>
                  <Text style={styles.roleTitle}>Company</Text>
                  <Text style={styles.roleSub}>Post jobs & hire talent</Text>
                </View>
                <View style={[styles.arrowCircle, activeRole === 'company' && styles.arrowCircleActive]}>
                   <Feather name="arrow-right" size={18} color="#FFF" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Animated.View style={[styles.footerArea, { opacity: fadeAnim }]}>
             <TouchableOpacity 
                style={styles.adminLink} 
                onPress={() => router.push('/(auth)/admin/login')}
             >
                <Text style={styles.adminText}>System Administrator? <Text style={styles.adminHighlight}>Login Here</Text></Text>
             </TouchableOpacity>
             
             {/* Decorative Teal Dot */}
             <View style={styles.tealDot} />
          </Animated.View>

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
    paddingHorizontal: 40,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  
  /* BACKGROUND SHAPES matching Onboarding */
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

  /* HEADER */
  headerSection: {
    marginBottom: 40,
    marginTop: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  mainHeading: {
    fontSize: 34,
    fontWeight: '900',
    color: '#000',
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    fontWeight: '400',
  },

  /* SELECTION CARDS */
  selectionSection: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: '#000',
    shadowOpacity: 0.2,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleMeta: {
    flex: 1,
    marginLeft: 18,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  roleSub: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircleActive: {
    backgroundColor: '#000',
  },

  /* FOOTER */
  footerArea: {
    marginTop: 50,
    alignItems: 'flex-start',
  },
  adminLink: {
    paddingVertical: 10,
  },
  adminText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  adminHighlight: {
    color: '#000',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  tealDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#A2D5D4',
    marginTop: 30,
    marginLeft: 10,
  },
});
