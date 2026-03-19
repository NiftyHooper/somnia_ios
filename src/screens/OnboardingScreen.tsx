import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { scheduleNotifications, requestPermission } from '../lib/notifications'
import { theme } from '../theme'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

const pad = (n: number) => n.toString().padStart(2, '0')

export default function OnboardingScreen() {
  const { user, setProfile, setOnboardingDone } = useStore()
  const [wakeHour, setWakeHour] = useState(7)
  const [wakeMinute, setWakeMinute] = useState(0)
  const [sleepHour, setSleepHour] = useState(23)
  const [sleepMinute, setSleepMinute] = useState(0)
  const [step, setStep] = useState<'wake' | 'sleep'>('wake')
  const [loading, setLoading] = useState(false)

  const handleBegin = async () => {
    setLoading(true)
    try {
      const granted = await requestPermission()
      if (!granted) {
        Alert.alert(
          'Notifications needed',
          'Somnia needs notifications to open your morning and evening windows.'
        )
      }

      await supabase.from('profiles').upsert({
        id: user.id,
        target_wake_time: `${pad(wakeHour)}:${pad(wakeMinute)}:00`,
        target_sleep_time: `${pad(sleepHour)}:${pad(sleepMinute)}:00`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      await scheduleNotifications(wakeHour, wakeMinute, sleepHour, sleepMinute)

      setProfile({
        wakeHour,
        wakeMinute,
        sleepHour,
        sleepMinute,
      })

      await AsyncStorage.setItem('onboarding_done', 'true')
      setOnboardingDone(true)
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>When do you sleep?</Text>
        <Text style={styles.subtitle}>
          Somnia opens your windows{"\n"}
          at exactly the right moment.
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, step === 'wake' && styles.tabActive]}
            onPress={() => setStep('wake')}
          >
            <Text style={[styles.tabText, step === 'wake' && styles.tabTextActive]}>Wake time</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, step === 'sleep' && styles.tabActive]}
            onPress={() => setStep('sleep')}
          >
            <Text style={[styles.tabText, step === 'sleep' && styles.tabTextActive]}>Sleep time</Text>
          </TouchableOpacity>
        </View>

        {step === 'wake' ? (
          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>I wake up at</Text>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                {pad(wakeHour)}:{pad(wakeMinute)}
              </Text>
            </View>
            <Text style={styles.pickerHint}>Hours</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scroll_h}
            >
              {HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.chip, wakeHour === h && styles.chipActive]}
                  onPress={() => setWakeHour(h)}
                >
                  <Text style={[styles.chipText, wakeHour === h && styles.chipTextActive]}>
                    {pad(h)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.pickerHint}>Minutes</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scroll_h}
            >
              {MINUTES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, wakeMinute === m && styles.chipActive]}
                  onPress={() => setWakeMinute(m)}
                >
                  <Text style={[styles.chipText, wakeMinute === m && styles.chipTextActive]}>
                    {pad(m)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep('sleep')}>
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>I sleep at</Text>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                {pad(sleepHour)}:{pad(sleepMinute)}
              </Text>
            </View>
            <Text style={styles.pickerHint}>Hours</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scroll_h}
            >
              {HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.chip, sleepHour === h && styles.chipActive]}
                  onPress={() => setSleepHour(h)}
                >
                  <Text style={[styles.chipText, sleepHour === h && styles.chipTextActive]}>
                    {pad(h)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.pickerHint}>Minutes</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scroll_h}
            >
              {MINUTES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, sleepMinute === m && styles.chipActive]}
                  onPress={() => setSleepMinute(m)}
                >
                  <Text style={[styles.chipText, sleepMinute === m && styles.chipTextActive]}>
                    {pad(m)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {step === 'sleep' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.beginBtn, loading && styles.beginBtnDisabled]}
            onPress={handleBegin}
            disabled={loading}
          >
            <Text style={styles.beginBtnText}>
              {loading ? 'Setting up...' : 'Begin my practice'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: 24,
    paddingTop: 64,
    gap: 24,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 36,
    fontStyle: 'italic',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textDim,
    lineHeight: 22,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  tabActive: {
    borderColor: theme.colors.gold,
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  tabText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  tabTextActive: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
  pickerSection: {
    gap: 12,
  },
  pickerLabel: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: theme.fonts.serif,
    fontStyle: 'italic',
  },
  timeDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  timeText: {
    fontSize: 64,
    color: theme.colors.gold,
    fontFamily: theme.fonts.serif,
    fontWeight: '300',
  },
  pickerHint: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  scroll_h: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    width: 48,
    height: 48,
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
    fontSize: 14,
  },
  chipTextActive: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
  nextBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  nextBtnText: {
    color: theme.colors.textDim,
    fontSize: 15,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  beginBtn: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingVertical: 18,
    alignItems: 'center',
  },
  beginBtnDisabled: {
    opacity: 0.5,
  },
  beginBtnText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
