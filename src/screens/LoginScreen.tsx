import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { theme } from '../theme'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const { setUser } = useStore()

  const signInWithGoogle = async () => {
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'me.somniavault.app',
      })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      })

      if (error) throw error

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)

      if (result.type === 'success') {
        const { url } = result
        await supabase.auth.exchangeCodeForSession(
          url.split('code=')[1]?.split('&')[0]
        )
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          setUser(userData.user)
        }
      }
    } catch (err: any) {
      Alert.alert('Sign in failed', err.message)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.moon}>☽</Text>
        <Text style={styles.title}>Somnia</Text>
        <Text style={styles.subtitle}>program your dreams</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.heading}>Start dreaming</Text>
        <Text style={styles.body}>
          Plant an intention every evening.{"\n"}
          Find out what grows by morning.
        </Text>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={signInWithGoogle}
          activeOpacity={0.8}
        >
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.privacy}>Privacy-first. Your dreams stay on your device.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  moon: {
    fontSize: 80,
    color: theme.colors.gold,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 42,
    fontStyle: 'italic',
    color: theme.colors.gold,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  bottom: {
    paddingHorizontal: 32,
    gap: 16,
  },
  heading: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    fontStyle: 'italic',
    color: theme.colors.text,
  },
  body: {
    fontSize: 15,
    color: theme.colors.textDim,
    lineHeight: 22,
  },
  googleBtn: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  googleBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  privacy: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
})
