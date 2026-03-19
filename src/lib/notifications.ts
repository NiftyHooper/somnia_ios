import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export const requestPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export const scheduleNotifications = async (
  wakeHour: number,
  wakeMinute: number,
  sleepHour: number,
  sleepMinute: number
) => {
  await Notifications.cancelAllScheduledNotificationsAsync()

  let mHour = wakeHour - 2
  let mMinute = wakeMinute
  if (mHour < 0) mHour += 24

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Somnia',
      body: 'Your morning window is open. Write before it fades.',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      vibrate: [0, 200, 100, 200, 100, 200],
      color: '#c9a84c',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: mHour,
      minute: mMinute,
    },
  })

  let eHour = sleepHour
  let eMinute = sleepMinute - 10
  if (eMinute < 0) {
    eMinute += 60
    eHour -= 1
  }
  if (eHour < 0) eHour += 24

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Somnia',
      body: 'Your planting window is open. What do you want to dream tonight?',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      vibrate: [0, 100, 50, 200],
      color: '#c9a84c',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: eHour,
      minute: eMinute,
    },
  })
}
