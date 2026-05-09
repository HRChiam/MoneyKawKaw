import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
        },
      }}>
      <Tabs.Screen
        name="01-home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="02-rewards"
        options={{
          title: 'Reward',
          tabBarIcon: ({ color }) => <Ionicons name="gift" size={28} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="03-notifications"
        options={{
          title: 'Notification',
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={28} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="04-profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <AntDesign name="profile" size={28} color={color}/>,
        }}
      />
    </Tabs>
  );
}
