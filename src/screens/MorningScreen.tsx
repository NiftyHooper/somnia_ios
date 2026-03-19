import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Animated,
} from 'react-native'
import { useState, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import { format, subDays } from 'date-fns'
import { saveDream, getTodayKey, getSeedByDate, revealSeed, updateSeedMatch } from '../lib/db'
import { theme } from '../theme'

type Step = 'write' | 'reveal' | 'match'

export default function MorningScreen() {
  const navigation = useNavigation<any>()
  const [text, setText] = useState('')
  const [step, setStep] = useState<Step>('write')
  const [seed, setSeed] = useState<any>(null)
  const [matchPct, setMatchPct] = useState(0)
  const [saving, setSaving] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const handleSubmitDream = async () => {
    if (text.trim().length < 10) {
      Alert.alert('Write more', 'Write at least a few words before submitting.')
      return
    }
    setSaving(true)
    try {
      const today = getTodayKey()
      await saveDream(today, text.trim())

      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
      const s = await getSeedByDate(yesterday)
      setSeed(s)

      if (s) {
        await revealSeed(yesterday)
        setStep('reveal')
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start()
      } else {
        navigation.replace('Dashboard')
      }
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRevealContinue = () => {
    setStep('match')
  }

  const handleSaveMatch = async () => {
    try {
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
      await updateSeedMatch(yesterday, matchPct)
      navigation.replace('Dashboard')
    } catch (err: any) {
      Alert.alert('Error', err.message)
    }
  }

  if (step === 'write') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>MORNING</Text>
          <Text style={styles.title}>
            What do you{"\n"}
            remember?
          </Text>
          <Text style={styles.hint}>Write before anything else. Even fragments. Even nothing.</Text>

          <TextInput
            style={styles.input}
            multiline
            placeholder="Write what came back..."
            placeholderTextColor={theme.colors.textMuted}
            value={text}
            onChangeText={setText}
            autoFocus
            textAlignVertical="top"
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.btn} onPress={handleSubmitDream} disabled={saving}>
              <Text style={styles.btnText}>{saving ? 'Saving...' : 'Submit dream'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace('Dashboard')}>
              <Text style={styles.skipText}>I don't remember anything</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  if (step === 'reveal') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>STEP 1</Text>
          <Text style={[styles.hint, { color: theme.colors.success }]}>Dream submitted ✓</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>STEP 2</Text>
          <Text style={styles.revealIntro}>Last night you planted:</Text>

          <Animated.View style={[styles.seedCard, { opacity: fadeAnim }]}>
            <Text style={styles.seedText}>"{seed?.content}"</Text>
          </Animated.View>

          <TouchableOpacity style={styles.btn} onPress={handleRevealContinue}>
            <Text style={styles.btnText}>Rate the match →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>STEP 3</Text>
        <Text style={styles.title}>
          How much did it{"\n"}
          match your dream?
        </Text>

        <View style={styles.matchDisplay}>
          <Text style={styles.matchNumber}>{matchPct}%</Text>
          <Text style={styles.matchLabel}>
            {matchPct === 0 && 'Not at all'}
            {matchPct > 0 && matchPct <= 25 && 'Faint traces'}
            {matchPct > 25 && matchPct <= 50 && 'Somewhat'}
            {matchPct > 50 && matchPct <= 75 && 'Strongly'}
            {matchPct > 75 && 'Completely'}
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          {[0, 25, 50, 75, 100].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.sliderBtn, matchPct === val && styles.sliderBtnActive]}
              onPress={() => setMatchPct(val)}
            >
              <Text style={[styles.sliderBtnText, matchPct === val && styles.sliderBtnTextActive]}>
                {val}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>Or tap to fine-tune:</Text>
        <View style={styles.fineControl}>
          <TouchableOpacity style={styles.fineBtn} onPress={() => setMatchPct(Math.max(0, matchPct - 5))}>
            <Text style={styles.fineBtnText}>-5</Text>
          </TouchableOpacity>
          <Text style={styles.finePct}>{matchPct}%</Text>
          <TouchableOpacity
            style={styles.fineBtn}
            onPress={() => setMatchPct(Math.min(100, matchPct + 5))}
          >
            <Text style={styles.fineBtnText}>+5</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSaveMatch}>
          <Text style={styles.btnText}>Save & continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    gap: 16,
    flexGrow: 1,
  },
  label: {
    fontSize: 10,
    letterSpacing: 4,
    color: theme.colors.gold,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontStyle: 'italic',
    fontSize: 32,
    color: theme.colors.text,
    lineHeight: 40,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  input: {
    flex: 1,
    minHeight: 200,
    fontSize: 17,
    color: theme.colors.text,
    lineHeight: 26,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  footer: {
    gap: 12,
    paddingBottom: 32,
  },
  btn: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  skipText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  revealIntro: {
    fontSize: 16,
    color: theme.colors.textDim,
  },
  seedCard: {
    borderWidth: 1,
    borderColor: theme.colors.borderBright,
    borderRadius: theme.radius.md,
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  seedText: {
    fontFamily: theme.fonts.serif,
    fontStyle: 'italic',
    fontSize: 20,
    color: theme.colors.gold,
    lineHeight: 30,
  },
  matchDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  matchNumber: {
    fontSize: 72,
    color: theme.colors.gold,
    fontFamily: theme.fonts.serif,
  },
  matchLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sliderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  sliderBtnActive: {
    borderColor: theme.colors.gold,
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  sliderBtnText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  sliderBtnTextActive: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
  fineControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  fineBtn: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fineBtnText: {
    color: theme.colors.textDim,
    fontSize: 16,
  },
  finePct: {
    fontSize: 24,
    color: theme.colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
})
