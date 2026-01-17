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
            height: 80,
            paddingBottom: 12,
            paddingTop: 8,
            elevation: 12,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
          },
          tabBarActiveTintColor: colors.accent.pink,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: 2,
          },
        }}
      >
        {/* 左侧：养成 */}
        <Tabs.Screen
          name="index"
          options={{
            title: '养成',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ 
                width: 32, 
                height: 32, 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: focused ? 'rgba(255, 202, 212, 0.25)' : 'transparent',
                borderRadius: 10,
              }}>
                <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>🐾</Text>
              </View>
            ),
          }}
        />
        
        {/* 中间：SOS - 清透梦幻风格 */}
        <Tabs.Screen
          name="pause"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -32,
              }}>
                {/* 外层光晕 */}
                <View style={{
                  position: 'absolute',
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: focused ? 'rgba(165, 201, 232, 0.25)' : 'rgba(197, 168, 232, 0.2)',
                }} />
                {/* 中层渐变感 */}
                <View style={{
                  position: 'absolute',
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  backgroundColor: focused ? 'rgba(165, 201, 232, 0.4)' : 'rgba(212, 229, 247, 0.5)',
                  borderWidth: 1.5,
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                }} />
                {/* 内层玻璃质感 */}
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: focused ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: focused ? colors.accent.blue : colors.accent.purple,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.9)',
                }}>
                  {/* 顶部高光 */}
                  <View style={{
                    position: 'absolute',
                    top: 4,
                    left: 10,
                    right: 10,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  }} />
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: focused ? colors.accent.blue : colors.accent.purple,
                    letterSpacing: 2,
                    marginTop: 2,
                  }}>SOS</Text>
                </View>
              </View>
            ),
          }}
        />
        
        {/* 右侧：心情 */}
        <Tabs.Screen
          name="mood"
          options={{
            title: '心情',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ 
                width: 28, 
                height: 28, 
                justifyContent: 'center', 
                alignItems: 'center',
                opacity: focused ? 1 : 0.7,
              }}>
                <Text style={{ fontSize: 22 }}>📔</Text>
              </View>
            ),
          }}
        />
        
        {/* 隐藏的页面 */}
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="lighthouse"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="breathe"
          options={{
            href: null,
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
