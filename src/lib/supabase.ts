import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(
  'https://vvqpmpbpwgllirpahnhm.supabase.co',
  'sb_publishable_vb7tErdboR8BWs0HqnpQkg_4bWkDnHs',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
