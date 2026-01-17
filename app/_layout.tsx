import { useEffect, useState } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '@/theme/colors';
import { initializeCreatureStore, useCreatureStore } from '@/store/creatureStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);
  const hasCompletedOnboarding = useCreatureStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    async function init() {
      await initializeCreatureStore();
      setIsLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/');
    }
  }, [isLoading, hasCompletedOnboarding, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundGradient[0] }}>
        <ActivityIndicator size="large" color={colors.accent.pink} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            elevation: 8,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          },
          tabBarActiveTintColor: colors.accent.pink,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="pause"
          options={{
            title: 'SOS',
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>⏸️</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: '养成',
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>🌸</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="lighthouse"
          options={{
            title: '灯塔',
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>💫</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="onboarding"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
