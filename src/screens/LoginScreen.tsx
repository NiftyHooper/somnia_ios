import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { theme } from '../theme'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      '839140138509-3spkgvvba8801btdv1ogcjm062jgaici.apps.googleusercontent.com',
    iosClientId:
      '630276750066-opja2v4tidkoj8revde1ku7qor14k676.apps.googleusercontent.com',
    webClientId:
      '839140138509-3spkgvvba8801btdv1ogcjm062jgaici.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      scheme: 'com.googleusercontent.apps.630276750066-opja2v4tidkoj8revde1ku7qor14k676',
      path: 'oauth2redirect',
    }),
  })

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response
      if (authentication?.accessToken) {
        // Sign in to Supabase with Google token
        supabase.auth
          .signInWithIdToken({
            provider: 'google',
            token: authentication.idToken ?? '',
            access_token: authentication.accessToken,
          })
          .then(({ error }) => {
            if (error) {
              Alert.alert('Sign in failed', error.message)
            }
            // Auth state change in App.tsx handles redirect
          })
      }
    }
  }, [response])

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
          onPress={() => promptAsync()}
          disabled={!request}
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
