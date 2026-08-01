import { Health } from '@capgo/capacitor-health';
import { Capacitor } from '@capacitor/core';

export class HealthConnectService {
  private isNative = Capacitor.isNativePlatform();

  public async isAvailable(): Promise<boolean> {
    if (!this.isNative) return false;
    try {
      return true;
    } catch {
      return false;
    }
  }

  public async requestPermissions(): Promise<boolean> {
    if (!this.isNative) return false;
    try {
      await Health.requestAuthorization({
        read: ['steps', 'calories', 'heartRate', 'sleep', 'weight'],
        write: ['steps', 'calories']
      });
      return true;
    } catch (e) {
      console.warn('Health Connect authorization request failed:', e);
      return false;
    }
  }

  public async fetchTodaySteps(): Promise<number> {
    if (!this.isNative) return 0;
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const result = await Health.queryAggregated({
        dataType: 'steps',
        startDate: todayStart.toISOString(),
        endDate: todayEnd.toISOString(),
        bucket: 'day',
        aggregation: 'sum'
      });

      if (result && result.samples && result.samples.length > 0) {
        const total = result.samples.reduce((sum: number, sample: any) => sum + (sample.value || 0), 0);
        return Math.round(total);
      }
      return 0;
    } catch (e) {
      console.warn('Error fetching steps from Health Connect:', e);
      return 0;
    }
  }

  public async fetchTodayCaloriesBurned(): Promise<number> {
    if (!this.isNative) return 0;
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const result = await Health.queryAggregated({
        dataType: 'calories',
        startDate: todayStart.toISOString(),
        endDate: todayEnd.toISOString(),
        bucket: 'day',
        aggregation: 'sum'
      });

      if (result && result.samples && result.samples.length > 0) {
        const total = result.samples.reduce((sum: number, sample: any) => sum + (sample.value || 0), 0);
        return Math.round(total);
      }
      return 0;
    } catch (e) {
      console.warn('Error fetching calories burned from Health Connect:', e);
      return 0;
    }
  }

  public async fetchTodayHeartRate(): Promise<{ avg: number; min: number; max: number } | null> {
    if (!this.isNative) return null;
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const result = await Health.queryAggregated({
        dataType: 'heartRate',
        startDate: todayStart.toISOString(),
        endDate: todayEnd.toISOString(),
        bucket: 'day',
        aggregation: ['average', 'min', 'max']
      });

      if (result && result.samples && result.samples.length > 0) {
        const sample = result.samples[0];
        return {
          avg: Math.round(sample.values.average || sample.value || 0),
          min: Math.round(sample.values.min || 0),
          max: Math.round(sample.values.max || 0)
        };
      }
      return null;
    } catch (e) {
      console.warn('Error fetching heart rate from Health Connect:', e);
      return null;
    }
  }

  public async fetchSleepDurationHours(): Promise<number> {
    if (!this.isNative) return 0;
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(18, 0, 0, 0);
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const result = await Health.readSamples({
        dataType: 'sleep',
        startDate: yesterday.toISOString(),
        endDate: today.toISOString()
      });

      if (result && result.samples && result.samples.length > 0) {
        let totalDurationMs = 0;
        result.samples.forEach((sample: any) => {
          const start = new Date(sample.startDate).getTime();
          const end = new Date(sample.endDate).getTime();
          if (end > start) {
            totalDurationMs += (end - start);
          }
        });
        return Number((totalDurationMs / (1000 * 60 * 60)).toFixed(1));
      }
      return 0;
    } catch (e) {
      console.warn('Error fetching sleep from Health Connect:', e);
      return 0;
    }
  }

  public async fetchLatestWeight(): Promise<number | null> {
    if (!this.isNative) return null;
    try {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const now = new Date();

      const result = await Health.readSamples({
        dataType: 'weight',
        startDate: monthAgo.toISOString(),
        endDate: now.toISOString()
      });

      if (result && result.samples && result.samples.length > 0) {
        const sorted = [...result.samples].sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        return sorted[0].value || null;
      }
      return null;
    } catch (e) {
      console.warn('Error fetching weight from Health Connect:', e);
      return null;
    }
  }
}

export const healthConnectService = new HealthConnectService();
