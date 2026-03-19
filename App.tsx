import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useStore } from './src/store'
import { supabase } from './src/lib/supabase'
import { initDB } from './src/lib/db'
import { theme } from './src/theme'

import LoginScreen from './src/screens/LoginScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import EveningScreen from './src/screens/EveningScreen'
import MorningScreen from './src/screens/MorningScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import SearchScreen from './src/screens/SearchScreen'
import EntryScreen from './src/screens/EntryScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const { user, onboardingDone, setUser, setOnboardingDone, setProfile } = useStore()

  useEffect(() => {
    initDB()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const done = await AsyncStorage.getItem('onboarding_done')
        setOnboardingDone(done === 'true')

        const { data } = await supabase
          .from('profiles')
          .select('target_wake_time, target_sleep_time')
          .eq('id', session.user.id)
          .single()

        if (data) {
          const [wH, wM] = (data.target_wake_time ?? '07:00').split(':').map(Number)
          const [sH, sM] = (data.target_sleep_time ?? '23:00').split(':').map(Number)
          setProfile({
            wakeHour: wH,
            wakeMinute: wM,
            sleepHour: sH,
            sleepMinute: sM,
          })
        }
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const done = await AsyncStorage.getItem('onboarding_done')
        setOnboardingDone(done === 'true')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [setOnboardingDone, setProfile, setUser])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: theme.colors.gold,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.gold,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '900' },
          },
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : !onboardingDone ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Evening" component={EveningScreen} />
              <Stack.Screen name="Morning" component={MorningScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="Entry" component={EntryScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}
