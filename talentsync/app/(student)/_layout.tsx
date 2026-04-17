import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
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
          
          const mainTabs = ['index', 'saved-jobs', 'recommended', 'profile'];
          
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
          } else if (route.name === 'saved-jobs') {
            iconName = 'briefcase'; 
            label = 'My Jobs';
          } else if (route.name === 'recommended') {
            iconName = 'bell'; // Replicating the design image's bell icon
            label = 'Activity';
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

export default function StudentLayout() {
  return (
    <Tabs 
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="saved-jobs" />
      <Tabs.Screen name="recommended" />
      <Tabs.Screen name="profile" />
      
      {/* Hidden nested pages from tab bar */}
      <Tabs.Screen name="news" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="resume" options={{ href: null }} />
      <Tabs.Screen name="jobs" options={{ href: null }} />
      <Tabs.Screen name="track" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
