import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { scheduleNotifications } from '../lib/notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { theme } from '../theme'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
const pad = (n: number) => n.toString().padStart(2, '0')

export default function SettingsScreen() {
  const navigation = useNavigation<any>()
  const { user, profile, setProfile, setUser, setOnboardingDone } = useStore()
  const [wakeHour, setWakeHour] = useState(profile?.wakeHour ?? 7)
  const [wakeMinute, setWakeMinute] = useState(profile?.wakeMinute ?? 0)
  const [sleepHour, setSleepHour] = useState(profile?.sleepHour ?? 23)
  const [sleepMinute, setSleepMinute] = useState(profile?.sleepMinute ?? 0)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        target_wake_time: `${pad(wakeHour)}:${pad(wakeMinute)}:00`,
        target_sleep_time: `${pad(sleepHour)}:${pad(sleepMinute)}:00`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      await scheduleNotifications(wakeHour, wakeMinute, sleepHour, sleepMinute)

      setProfile({ wakeHour, wakeMinute, sleepHour, sleepMinute })
      Alert.alert('Saved', 'Your times and notifications are updated.')
      navigation.navigate('Dashboard')
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    await AsyncStorage.removeItem('onboarding_done')
    setUser(null)
    setOnboardingDone(false)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.sectionLabel}>WAKE TIME</Text>
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>
          {pad(wakeHour)}:{pad(wakeMinute)}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {HOURS.map((h) => (
          <TouchableOpacity
            key={h}
            style={[styles.chip, wakeHour === h && styles.chipActive]}
            onPress={() => setWakeHour(h)}
          >
            <Text style={[styles.chipText, wakeHour === h && styles.chipTextActive]}>{pad(h)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {MINUTES.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, wakeMinute === m && styles.chipActive]}
            onPress={() => setWakeMinute(m)}
          >
            <Text style={[styles.chipText, wakeMinute === m && styles.chipTextActive]}>{pad(m)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>SLEEP TIME</Text>
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>
          {pad(sleepHour)}:{pad(sleepMinute)}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {HOURS.map((h) => (
          <TouchableOpacity
            key={h}
            style={[styles.chip, sleepHour === h && styles.chipActive]}
            onPress={() => setSleepHour(h)}
          >
            <Text style={[styles.chipText, sleepHour === h && styles.chipTextActive]}>{pad(h)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {MINUTES.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, sleepMinute === m && styles.chipActive]}
            onPress={() => setSleepMinute(m)}
          >
            <Text style={[styles.chipText, sleepMinute === m && styles.chipTextActive]}>{pad(m)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save & update notifications'}</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Somnia - built by one person.{"\n"}
        somniavault.me
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    gap: 12,
    paddingBottom: 64,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontStyle: 'italic',
    fontSize: 32,
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: theme.colors.gold,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  timeDisplay: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeText: {
    fontSize: 48,
    color: theme.colors.gold,
    fontFamily: theme.fonts.serif,
  },
  chips: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: theme.colors.gold,
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  chipTextActive: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  signOutBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
  },
  signOutText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
  },
})
