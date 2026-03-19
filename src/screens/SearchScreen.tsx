import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native'
import { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { format, parseISO } from 'date-fns'
import { getAllDreams, getAllSeeds } from '../lib/db'
import { theme } from '../theme'

export default function SearchScreen() {
  const navigation = useNavigation<any>()
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    const [dreams, seeds] = await Promise.all([getAllDreams(), getAllSeeds()])

    const dreamsMap = new Map(dreams.map((d) => [d.date, d]))
    const seedsMap = new Map(seeds.map((s) => [s.date, s]))

    const allDates = new Set([...dreams.map((d) => d.date), ...seeds.map((s) => s.date)])

    const sorted = Array.from(allDates).sort().reverse()
    const result = sorted.map((date) => ({
      date,
      dream: dreamsMap.get(date),
      seed: seedsMap.get(date),
    }))

    setEntries(result)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = query
    ? entries.filter(
        (e) =>
          e.dream?.content?.toLowerCase().includes(query.toLowerCase()) ||
          e.seed?.content?.toLowerCase().includes(query.toLowerCase())
      )
    : entries

  const renderItem = ({ item }: { item: any }) => {
    const hasDream = !!item.dream
    const hasSeed = !!item.seed
    const dateLabel = format(parseISO(item.date), 'MMMM d, yyyy')

    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Entry', { date: item.date })}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{dateLabel}</Text>
          <Text
            style={[styles.cardStatus, hasDream && hasSeed ? styles.statusComplete : styles.statusMissed]}
          >
            {hasDream && hasSeed
              ? 'Complete'
              : hasDream
                ? 'Dream only'
                : hasSeed
                  ? 'Seed only'
                  : 'Missed'}
          </Text>
        </View>

        {hasSeed && item.seed.revealed === 1 && (
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionLabel}>SEED</Text>
            <Text style={styles.cardText} numberOfLines={2}>
              {item.seed.content}
            </Text>
            {item.seed.match_percentage !== null && (
              <Text style={styles.matchBadge}>{item.seed.match_percentage}% match</Text>
            )}
          </View>
        )}

        {hasDream && (
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionLabel}>DREAM</Text>
            <Text style={styles.cardText} numberOfLines={2}>
              {item.dream.content}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Archive</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dreams and seeds..."
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true)
              await load()
              setRefreshing(false)
            }}
            tintColor={theme.colors.gold}
          />
        }
        ListEmptyComponent={<Text style={styles.empty}>No entries yet.</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 64,
    gap: 12,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontStyle: 'italic',
    fontSize: 32,
    color: theme.colors.text,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 14,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  list: {
    padding: 24,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 16,
    backgroundColor: theme.colors.surface,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
  },
  cardStatus: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusComplete: {
    color: theme.colors.success,
  },
  statusMissed: {
    color: theme.colors.textMuted,
  },
  cardSection: {
    gap: 4,
  },
  cardSectionLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: theme.colors.gold,
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: 14,
    color: theme.colors.textDim,
    lineHeight: 20,
  },
  matchBadge: {
    fontSize: 11,
    color: theme.colors.gold,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    paddingTop: 40,
  },
})
