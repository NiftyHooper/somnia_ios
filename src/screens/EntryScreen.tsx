import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import { format, parseISO } from 'date-fns'
import { getDreamByDate, getSeedByDate } from '../lib/db'
import { theme } from '../theme'

export default function EntryScreen() {
  const route = useRoute<any>()
  const { date } = route.params
  const [dream, setDream] = useState<any>(null)
  const [seed, setSeed] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const [d, s] = await Promise.all([getDreamByDate(date), getSeedByDate(date)])
      setDream(d)
      setSeed(s)
    }
    load()
  }, [date])

  const dateLabel = format(parseISO(date), 'EEEE, MMMM d yyyy')

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.date}>{dateLabel}</Text>

      {seed && seed.revealed === 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SEED</Text>
          <Text style={styles.seedText}>"{seed.content}"</Text>
          {seed.match_percentage !== null && (
            <View style={styles.matchRow}>
              <Text style={styles.matchText}>{seed.match_percentage}% match</Text>
            </View>
          )}
        </View>
      )}

      {dream && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DREAM</Text>
          <Text style={styles.dreamText}>{dream.content}</Text>
        </View>
      )}

      {!dream && !seed && <Text style={styles.empty}>Nothing recorded for this day.</Text>}
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
    gap: 24,
  },
  date: {
    fontSize: 13,
    letterSpacing: 1,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  section: {
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 3,
    color: theme.colors.gold,
    textTransform: 'uppercase',
  },
  seedText: {
    fontFamily: theme.fonts.serif,
    fontStyle: 'italic',
    fontSize: 20,
    color: theme.colors.gold,
    lineHeight: 30,
  },
  matchRow: {
    marginTop: 4,
  },
  matchText: {
    fontSize: 12,
    color: theme.colors.gold,
  },
  dreamText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 26,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    paddingTop: 40,
  },
})
