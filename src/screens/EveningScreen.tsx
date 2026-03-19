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
} from 'react-native'
import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { saveSeed, getTodayKey } from '../lib/db'
import { theme } from '../theme'

const MIN_WORDS = 60

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

export default function EveningScreen() {
  const navigation = useNavigation<any>()
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const words = countWords(text)
  const ready = words >= MIN_WORDS

  const handleSave = async () => {
    if (!ready) return
    setSaving(true)
    try {
      const today = getTodayKey()
      await saveSeed(today, text.trim())
      navigation.replace('Dashboard')
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>EVENING</Text>
        <Text style={styles.title}>
          What do you want{"\n"}
          to dream tonight?
        </Text>
        <Text style={styles.hint}>
          Write your intention. A question, a memory, a feeling. At least {MIN_WORDS} words.
          Then sleep.
        </Text>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Plant your seed here..."
          placeholderTextColor={theme.colors.textMuted}
          value={text}
          onChangeText={setText}
          autoFocus
          textAlignVertical="top"
        />

        <View style={styles.footer}>
          <Text style={[styles.wordCount, ready && styles.wordCountReady]}>
            {words} / {MIN_WORDS} words
          </Text>
          <TouchableOpacity
            style={[styles.btn, !ready && styles.btnDisabled]}
            onPress={handleSave}
            disabled={!ready || saving}
          >
            <Text style={[styles.btnText, !ready && styles.btnTextDisabled]}>
              {saving ? 'Planting...' : 'Plant seed'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  wordCount: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  wordCountReady: {
    color: theme.colors.success,
  },
  btn: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: 'rgba(201,168,76,0.2)',
  },
  btnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextDisabled: {
    color: theme.colors.textMuted,
  },
})
