import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Type alias for compatibility
type EventSubscription = Notifications.Subscription;

class NotificationService {
  private permissionGranted: boolean = false;

  async initialize(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.permissionGranted = finalStatus === 'granted';

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366f1',
        });

        await Notifications.setNotificationChannelAsync('water', {
          name: 'water',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3b82f6',
        });

        await Notifications.setNotificationChannelAsync('medication', {
          name: 'medication',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#ef4444',
        });
      }

      return this.permissionGranted;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async scheduleWaterReminder(intervalHours: number = 2): Promise<string[]> {
    if (!this.permissionGranted) return [];

    const notificationIds: string[] = [];

    for (let i = 1; i <= 8; i++) {
      const triggerDate = new Date();
      triggerDate.setHours(8 + i * intervalHours, 0, 0, 0);

      if (triggerDate.getHours() < 22) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '💧 Hora de beber água!',
            body: 'Mantenha-se hidratado. Beba um copo de água agora.',
            data: { type: 'water_reminder' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
            channelId: 'water',
          },
        });
        notificationIds.push(id);
      }
    }

    return notificationIds;
  }

  async scheduleMedicationReminder(
    medicationName: string,
    time: Date
  ): Promise<string> {
    if (!this.permissionGranted) return '';

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Hora de tomar medicamento!',
        body: `Está na hora de tomar ${medicationName}`,
        data: { type: 'medication_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: time,
        channelId: 'medication',
      },
    });

    return id;
  }

  async scheduleSleepReminder(time?: Date): Promise<string> {
    if (!this.permissionGranted) return '';

    const triggerTime = time || new Date();
    triggerTime.setHours(22, 0, 0, 0);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '😴 Hora de dormir',
        body: 'Prepare-se para uma boa noite de sono. Descanse bem!',
        data: { type: 'sleep_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerTime,
        channelId: 'default',
      },
    });

    return id;
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelNotification(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
