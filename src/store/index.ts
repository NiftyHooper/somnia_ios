import { create } from 'zustand'

interface Profile {
  wakeHour: number
  wakeMinute: number
  sleepHour: number
  sleepMinute: number
}

interface AppStore {
  user: any | null
  profile: Profile | null
  onboardingDone: boolean
  setUser: (user: any) => void
  setProfile: (profile: Profile) => void
  setOnboardingDone: (v: boolean) => void
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  profile: null,
  onboardingDone: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setOnboardingDone: (v) => set({ onboardingDone: v }),
}))
