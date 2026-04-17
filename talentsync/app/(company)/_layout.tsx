import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 20 }]}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          const mainTabs = ['index', 'manage-jobs', 'post-job', 'profile'];
          
          // Hide any route that is not one of our main 4 tabs
          if (!mainTabs.includes(route.name)) {
            return null;
          }

          const isFocused = state.index === index;

          let iconName: any = 'circle';
          let label = route.name;

          if (route.name === 'index') {
            iconName = 'home';
            label = 'Home';
          } else if (route.name === 'manage-jobs') {
            iconName = 'briefcase'; 
            label = 'Jobs';
          } else if (route.name === 'post-job') {
            iconName = 'plus-square';
            label = 'Post Job';
          } else if (route.name === 'profile') {
            iconName = 'user';
            label = 'Profile';
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.tabItemFocused]}
            >
              <Feather 
                name={iconName} 
                size={22} 
                color={isFocused ? '#FFF' : '#1A1D3D'} 
                strokeWidth={isFocused ? 2.5 : 2}
              />
              {isFocused && (
                <Text style={styles.tabLabelFocused}>
                  {label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function CompanyLayout() {
  const router = useRouter();
  const segments = useSegments();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user && user.role === 'company' && user.verified === false) {
      if (segments[1] !== 'verify-status') {
        router.replace('/(company)/verify-status');
      }
    }
  }, [user, segments]);

  return (
    <View style={styles.container}>
      <Tabs
        initialRouteName="index"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="manage-jobs" />
        <Tabs.Screen name="post-job" />
        <Tabs.Screen name="profile" />

        {/* Hidden screens */}
        <Tabs.Screen name="verify-status" options={{ href: null }} />
        <Tabs.Screen name="search-talent" options={{ href: null }} />
        <Tabs.Screen name="messages" options={{ href: null }} />
        <Tabs.Screen name="account-settings" options={{ href: null }} />
        <Tabs.Screen name="help-support" options={{ href: null }} />
        <Tabs.Screen name="terms-policies" options={{ href: null }} />
        <Tabs.Screen name="review-candidates" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    elevation: 0,
  },
  tabBarInner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    height: 70,
    width: '100%',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  tabItemFocused: {
    backgroundColor: '#111827', // Dark navy/black pill
    paddingHorizontal: 20,
  },
  tabLabelFocused: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  }
});
