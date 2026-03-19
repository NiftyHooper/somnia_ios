import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { format } from 'date-fns'
import { useStore } from '../store'
import { getTodayKey, getDreamByDate, getSeedByDate, getAllSeeds } from '../lib/db'
import { theme } from '../theme'

type WindowState = 'morning' | 'evening' | 'day' | 'night'

export default function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { profile } = useStore()
  const [todayDream, setTodayDream] = useState<any>(null)
  const [todaySeed, setTodaySeed] = useState<any>(null)
  const [stats, setStats] = useState({
    streak: 0,
    successRate: 0,
    totalDreams: 0,
  })
  const [refreshing, setRefreshing] = useState(false)
  const [windowState, setWindowState] = useState<WindowState>('day')

  const load = useCallback(async () => {
    const today = getTodayKey()
    const [dream, seed] = await Promise.all([getDreamByDate(today), getSeedByDate(today)])
    setTodayDream(dream)
    setTodaySeed(seed)

    const allSeeds = await getAllSeeds()
    const withMatch = allSeeds.filter((s) => s.match_percentage !== null)
    const avgMatch =
      withMatch.length > 0
        ? Math.round(
            withMatch.reduce((sum, x) => sum + (x.match_percentage ?? 0), 0) / withMatch.length
          )
        : 0

    setStats({
      streak: 0,
      successRate: avgMatch,
      totalDreams: allSeeds.length,
    })

    if (profile) {
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()
      const current = hour * 60 + minute

      const morningHour = (profile.wakeHour - 2 + 24) % 24
      const morning = morningHour * 60 + profile.wakeMinute
      const wake = profile.wakeHour * 60 + profile.wakeMinute

      const eveningTotal = profile.sleepHour * 60 + profile.sleepMinute - 10
      const evening = (eveningTotal + 24 * 60) % (24 * 60)
      const sleep = profile.sleepHour * 60 + profile.sleepMinute

      if (current >= morning && current < wake) {
        setWindowState('morning')
      } else if (current >= evening && current < sleep) {
        setWindowState('evening')
      } else {
        setWindowState('day')
      }
    }
  }, [profile])

  useEffect(() => {
    load()
  }, [load])

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.logo}>Somnia</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.date}>{today}</Text>

      <View style={styles.windowCard}>
        {windowState === 'morning' && !todayDream && (
          <>
            <Text style={styles.windowLabel}>MORNING WINDOW</Text>
            <Text style={styles.windowText}>Write before it fades.</Text>
            <TouchableOpacity style={styles.windowBtn} onPress={() => navigation.navigate('Morning')}>
              <Text style={styles.windowBtnText}>Capture dream →</Text>
            </TouchableOpacity>
          </>
        )}
        {windowState === 'evening' && !todaySeed && (
          <>
            <Text style={styles.windowLabel}>EVENING WINDOW</Text>
            <Text style={styles.windowText}>What do you want to dream tonight?</Text>
            <TouchableOpacity style={styles.windowBtn} onPress={() => navigation.navigate('Evening')}>
              <Text style={styles.windowBtnText}>Plant seed →</Text>
            </TouchableOpacity>
          </>
        )}
        {windowState === 'morning' && todayDream && (
          <>
            <Text style={styles.windowLabel}>MORNING DONE ✓</Text>
            <Text style={styles.windowText}>Dream captured. Rest easy.</Text>
          </>
        )}
        {windowState === 'evening' && todaySeed && (
          <>
            <Text style={styles.windowLabel}>SEED PLANTED ✓</Text>
            <Text style={styles.windowText}>Sleep well. Your seed is set.</Text>
          </>
        )}
        {windowState === 'day' && (
          <>
            <Text style={styles.windowLabel}>{todayDream ? 'DREAM CAPTURED' : 'RESTING'}</Text>
            <Text style={styles.windowText}>
              {todayDream
                ? 'Morning complete.'
                : profile
                  ? `Evening window opens at ${profile.sleepHour
                      .toString()
                      .padStart(2, '0')}:${(profile.sleepMinute - 10 < 0 ? 50 : profile.sleepMinute - 10)
                      .toString()
                      .padStart(2, '0')}`
                  : 'Set your sleep time in settings.'}
            </Text>
          </>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalDreams}</Text>
          <Text style={styles.statLabel}>DREAMS</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.successRate}%</Text>
          <Text style={styles.statLabel}>SUCCESS</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.streak}</Text>
          <Text style={styles.statLabel}>STREAK</Text>
        </View>
      </View>

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.navBtnText}>Archive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Evening')}>
          <Text style={styles.navBtnText}>Evening</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Morning')}>
          <Text style={styles.navBtnText}>Morning</Text>
        </TouchableOpacity>
      </View>
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
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontFamily: theme.fonts.serif,
    fontStyle: 'italic',
    fontSize: 28,
    color: theme.colors.gold,
  },
  settingsIcon: {
    fontSize: 20,
    color: theme.colors.textMuted,
  },
  date: {
    fontSize: 13,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  windowCard: {
    borderWidth: 1,
    borderColor: theme.colors.borderBright,
    borderRadius: theme.radius.md,
    padding: 20,
    backgroundColor: theme.colors.surface,
    gap: 8,
  },
  windowLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: theme.colors.gold,
    textTransform: 'uppercase',
  },
  windowText: {
    fontFamily: theme.fonts.serif,
    fontStyle: 'italic',
    fontSize: 22,
    color: theme.colors.text,
    lineHeight: 30,
  },
  windowBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  windowBtnText: {
    color: theme.colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  statNumber: {
    fontSize: 28,
    color: theme.colors.gold,
    fontFamily: theme.fonts.serif,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  nav: {
    flexDirection: 'row',
    gap: 10,
  },
  navBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navBtnText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
})
