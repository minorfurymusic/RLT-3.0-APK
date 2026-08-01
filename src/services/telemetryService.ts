/**
 * Telemetry Service - Serviço de envio de dados de pesquisa epidemiológica de forma anônima
 * 
 * Envia dados demográficos e de condições de saúde para um endpoint serverless
 * (ex: Google Apps Script Webhook que preenche uma planilha no Google Drive)
 * a cada 7 dias de forma totalmente silenciosa e anonimizada.
 */

import { UserProfile, HistoryRecord, Meal, WaterLog, ActivityTracking } from '../types';

const TELEMETRY_LAST_SYNC_KEY = 'rlt_telemetry_last_sync';
const TELEMETRY_URL_KEY = 'rlt_telemetry_webhook_url';

export interface TelemetryPayload {
  timestamp: string;
  sex: string;
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  conditions: string[];
  medications: string[];
  stepGoal: number;
  avgDailySteps: number;
  avgDailyCalories: number;
  avgDailyWater: number;
}

class TelemetryService {
  /**
   * Verifica se o prazo de 7 dias expirou e dispara a coleta silenciosa
   */
  async checkAndSync(
    profile: UserProfile,
    historyRecords: HistoryRecord[],
    meals: Meal[],
    waterLogs: WaterLog[],
    activities: ActivityTracking[]
  ): Promise<void> {
    if (!profile.onboardingCompleted) return;

    const lastSyncStr = localStorage.getItem(TELEMETRY_LAST_SYNC_KEY);
    const now = Date.now();

    // Sincroniza se for o primeiro envio ou se passaram 7 dias (604800000 ms)
    if (!lastSyncStr || now - Number(lastSyncStr) >= 7 * 24 * 60 * 60 * 1000) {
      try {
        await this.sync(profile, historyRecords, meals, waterLogs, activities);
        localStorage.setItem(TELEMETRY_LAST_SYNC_KEY, now.toString());
        console.log('[Telemetry] Sincronização epidemiológica periódica realizada com sucesso.');
      } catch (error) {
        console.error('[Telemetry] Falha ao enviar telemetria epidemiológica:', error);
      }
    }
  }

  /**
   * Envia os dados de telemetria epidemiológica para a planilha do Google Drive do administrador
   */
  async sync(
    profile: UserProfile,
    historyRecords: HistoryRecord[],
    meals: Meal[],
    waterLogs: WaterLog[],
    activities: ActivityTracking[]
  ): Promise<boolean> {
    const webhookUrl = localStorage.getItem(TELEMETRY_URL_KEY) || '';
    if (!webhookUrl) {
      console.warn('[Telemetry] Webhook URL de telemetria não configurada. Coleta ignorada.');
      return false;
    }

    const payload = this.buildPayload(profile, historyRecords, meals, waterLogs, activities);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('[Telemetry] Erro de rede na requisição de telemetria:', error);
      return false;
    }
  }

  /**
   * Monta o payload epidemiológico estritamente anonimizado (sem nome e e-mail)
   */
  private buildPayload(
    profile: UserProfile,
    historyRecords: HistoryRecord[],
    meals: Meal[],
    waterLogs: WaterLog[],
    activities: ActivityTracking[]
  ): TelemetryPayload {
    // 1. Coleta condições de saúde registradas
    const conditions: string[] = [];
    historyRecords.forEach(r => {
      if (r.category === 'Medical History' && 'conditionName' in r) {
        conditions.push(r.conditionName);
      }
    });

    // 2. Coleta prescrições médicas ativas (medicamentos)
    const medications: string[] = [];
    historyRecords.forEach(r => {
      if (r.category === 'Consultations' && 'prescriptions' in r && r.prescriptions) {
        r.prescriptions.forEach(p => {
          medications.push(`${p.medicationName} (${p.dosage})`);
        });
      }
    });

    // 3. Calcula médias de passos (se integrado)
    // 4. Calcula médias de calorias e água
    const mealDays = Array.from(new Set(meals.map(m => new Date(m.date).toDateString())));
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const avgDailyCalories = mealDays.length > 0 ? Math.round(totalCalories / mealDays.length) : 0;

    const waterDays = Array.from(new Set(waterLogs.map(w => new Date(w.date).toDateString())));
    const totalWater = waterLogs.reduce((sum, w) => sum + w.amount, 0);
    const avgDailyWater = waterDays.length > 0 ? Math.round(totalWater / waterDays.length) : 0;

    return {
      timestamp: new Date().toISOString(),
      sex: profile.sex || 'Not set',
      age: profile.age || 0,
      weight: profile.weight || 0,
      height: profile.height || 0,
      activityLevel: profile.workActivityType || 'Sedentary',
      conditions: Array.from(new Set(conditions)),
      medications: Array.from(new Set(medications)),
      stepGoal: profile.stepGoal || 10000,
      avgDailySteps: 0,
      avgDailyCalories,
      avgDailyWater,
    };
  }
}

export const telemetryService = new TelemetryService();
export default telemetryService;
