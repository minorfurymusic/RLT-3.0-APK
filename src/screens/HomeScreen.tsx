import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { Card, Button, ProgressCircle } from '../components';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, DAILY_GOALS } from '../utils/constants';
import { getGreeting, formatDate } from '../utils/dateUtils';
import { useApp } from '../context';
import { useSteps } from '../hooks';
import { brainService } from '../services';
import { StorageService } from '../services/storage';
import { MoodEntry } from '../types';

interface HomeScreenProps {
  navigation?: any;
  onLogout?: () => void;
}

const MOOD_OPTIONS: { emoji: string; mood: MoodEntry['mood'] }[] = [
  { emoji: '😊', mood: 'happy' },
  { emoji: '😐', mood: 'neutral' },
  { emoji: '😢', mood: 'sad' },
  { emoji: '😰', mood: 'anxious' },
  { emoji: '😴', mood: 'tired' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, onLogout }) => {
  const { state, addWater, addMeal } = useApp();
  const { steps, isAvailable: stepsAvailable, isLoading: stepsLoading } = useSteps();
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);

  // Estados dos modais de entrada
  const [isWaterModalVisible, setIsWaterModalVisible] = useState(false);
  const [isMealModalVisible, setIsMealModalVisible] = useState(false);

  // Estados dos inputs de dados
  const [waterAmount, setWaterAmount] = useState('250');
  const [mealName, setMealName] = useState('Refeição');
  const [mealWeight, setMealWeight] = useState('350');
  const [mealCalories, setMealCalories] = useState('450');

  const water = state.water;
  const calories = state.calories;
  const sleep = 0;

  const stepsProgress = steps / DAILY_GOALS.steps;
  const waterProgress = water / DAILY_GOALS.water;
  const caloriesProgress = calories / DAILY_GOALS.calories;
  const sleepProgress = sleep / DAILY_GOALS.sleep;

  const handleQuickAction = async (input: string) => {
    const result = await brainService.processCommand(input);

    if (result.success && result.action === 'water') {
      await addWater(result.data?.amount || 250);
    }

    Alert.alert(result.success ? 'Real Life Track' : 'Não entendi', result.message);
  };

  const handleAvatarPress = () => {
    if (onLogout) {
      Alert.alert(
        'Sair',
        'Deseja sair da conta de testes?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: onLogout },
        ],
        { cancelable: true }
      );
    }
  };

  const handleAddWaterSubmit = async () => {
    const amount = parseInt(waterAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Por favor, insira uma quantidade de água válida e positiva em ml.');
      return;
    }
    await addWater(amount);
    setIsWaterModalVisible(false);
    setWaterAmount('250');
    Alert.alert('Sucesso', `💧 ${amount}ml de água registrados com sucesso!`);
  };

  const handleAddMealSubmit = async () => {
    const weight = parseInt(mealWeight, 10);
    const kcal = parseInt(mealCalories, 10);

    if (!mealName.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome da refeição.');
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Erro', 'Por favor, insira um peso válido e positivo em gramas.');
      return;
    }
    if (isNaN(kcal) || kcal <= 0) {
      Alert.alert('Erro', 'Por favor, insira uma quantidade de calorias válida.');
      return;
    }

    await addMeal(
      mealName.trim(), 
      kcal, 
      Math.round(weight * 0.1), 
      Math.round(weight * 0.4), 
      Math.round(weight * 0.05)
    );
    setIsMealModalVisible(false);
    
    setMealName('Refeição');
    setMealWeight('350');
    setMealCalories('450');
    
    Alert.alert('Sucesso', `🍽️ Refeição "${mealName}" de ${weight}g (${kcal} kcal) registrada!`);
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Real Life Track', 'Escolha um humor antes de registrar.');
      return;
    }

    const result = await brainService.executeCommand('mood', { mood: selectedMood });

    const entries = await StorageService.getMoodEntries();
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      timestamp: new Date(),
    };
    await StorageService.saveMoodEntries([...entries, newEntry]);

    Alert.alert('Real Life Track', result.message);
    setSelectedMood(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
            <Text style={styles.date}>{formatDate(new Date())}</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={handleAvatarPress}>
            <Text style={styles.avatarText}>JP</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumo do Dia</Text>
          {!stepsLoading && !stepsAvailable && (
            <Text style={styles.warningText}>
              ⚠️ Sensor de passos indisponível neste dispositivo/emulador
            </Text>
          )}
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <ProgressCircle
                progress={stepsProgress}
                size={80}
                strokeWidth={6}
                color={COLORS.primary}
                label="Passos"
                value={`${steps.toLocaleString()}`}
              />
            </View>
            <View style={styles.progressItem}>
              <ProgressCircle
                progress={waterProgress}
                size={80}
                strokeWidth={6}
                color={COLORS.info}
                label="Água"
                value={`${water}ml`}
              />
            </View>
            <View style={styles.progressItem}>
              <ProgressCircle
                progress={caloriesProgress}
                size={80}
                strokeWidth={6}
                color={COLORS.accent}
                label="Calorias"
                value={`${calories}`}
              />
            </View>
            <View style={styles.progressItem}>
              <ProgressCircle
                progress={sleepProgress}
                size={80}
                strokeWidth={6}
                color={COLORS.secondary}
                label="Sono"
                value={`${sleep}h`}
              />
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => setIsWaterModalVisible(true)}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.info + '20' }]}>
              <Text style={styles.quickActionEmoji}>💧</Text>
            </View>
            <Text style={styles.quickActionText}>Água</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => setIsMealModalVisible(true)}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.accent + '20' }]}>
              <Text style={styles.quickActionEmoji}>🍽️</Text>
            </View>
            <Text style={styles.quickActionText}>Refeição</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('tomei remedio')}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.secondary + '20' }]}>
              <Text style={styles.quickActionEmoji}>💊</Text>
            </View>
            <Text style={styles.quickActionText}>Remédio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('estou me sentindo bem')}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.moodHappy + '20' }]}>
              <Text style={styles.quickActionEmoji}>😊</Text>
            </View>
            <Text style={styles.quickActionText}>Humor</Text>
          </TouchableOpacity>
        </View>

        {/* Mood Check */}
        <Card style={styles.moodCard}>
          <Text style={styles.cardTitle}>Como você está se sentindo?</Text>
          <View style={styles.moodOptions}>
            {MOOD_OPTIONS.map(({ emoji, mood }) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodOption,
                  selectedMood === mood && styles.moodOptionSelected,
                ]}
                onPress={() => setSelectedMood(mood)}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title="Registrar Humor"
            variant="primary"
            onPress={handleMoodSubmit}
            style={styles.moodButton}
          />
        </Card>

        {/* Streak Info */}
        <Card style={styles.streakCard}>
          <View style={styles.streakContent}>
            <View style={styles.streakInfo}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <View>
                <Text style={styles.streakCount}>7 dias</Text>
                <Text style={styles.streakLabel}>Sequência de atividades</Text>
              </View>
            </View>
            <Text style={styles.streakGoal}>Meta: 30 dias</Text>
          </View>
          <View style={styles.streakProgress}>
            <View style={styles.streakProgressBar}>
              <View style={[styles.streakProgressFill, { width: '23%' }]} />
            </View>
          </View>
        </Card>

        {/* Modules Grid */}
        <Text style={styles.sectionTitle}>Módulos</Text>
        <View style={styles.modulesGrid}>
          <TouchableOpacity style={styles.moduleCard}>
            <Text style={styles.moduleEmoji}>🚶</Text>
            <Text style={styles.moduleTitle}>Atividade</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moduleCard}>
            <Text style={styles.moduleEmoji}>🍎</Text>
            <Text style={styles.moduleTitle}>Nutrição</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moduleCard}>
            <Text style={styles.moduleEmoji}>😴</Text>
            <Text style={styles.moduleTitle}>Sono</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moduleCard}>
            <Text style={styles.moduleEmoji}>🩸</Text>
            <Text style={styles.moduleTitle}>Ciclo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moduleCard}>
            <Text style={styles.moduleEmoji}>💊</Text>
            <Text style={styles.moduleTitle}>Medicamentos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moduleCard}>
            <Text style={styles.moduleEmoji}>🧠</Text>
            <Text style={styles.moduleTitle}>Bem-estar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Água */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isWaterModalVisible}
        onRequestClose={() => setIsWaterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card variant="elevated" style={styles.modalCard}>
            <Text style={styles.modalTitle}>💧 Registrar Água</Text>
            
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Quantidade (ml)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="Ex: 250"
                placeholderTextColor={COLORS.textLight}
                value={waterAmount}
                onChangeText={setWaterAmount}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setIsWaterModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Salvar"
                variant="primary"
                onPress={handleAddWaterSubmit}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Modal de Refeição */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMealModalVisible}
        onRequestClose={() => setIsMealModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card variant="elevated" style={styles.modalCard}>
            <Text style={styles.modalTitle}>🍽️ Registrar Refeição</Text>
            
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Nome da Refeição</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Almoço"
                placeholderTextColor={COLORS.textLight}
                value={mealName}
                onChangeText={setMealName}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Peso (gramas)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="Ex: 350"
                placeholderTextColor={COLORS.textLight}
                value={mealWeight}
                onChangeText={setMealWeight}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Calorias (kcal)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="Ex: 450"
                placeholderTextColor={COLORS.textLight}
                value={mealCalories}
                onChangeText={setMealCalories}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setIsMealModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Salvar"
                variant="primary"
                onPress={handleAddMealSubmit}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  progressItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  warningText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  moodCard: {
    backgroundColor: COLORS.surface,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  moodOption: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  moodOptionSelected: {
    backgroundColor: COLORS.primaryLight + '30',
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodButton: {
    marginTop: SPACING.xs,
  },
  streakCard: {
    backgroundColor: COLORS.surface,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  streakCount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  streakLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  streakGoal: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  streakProgress: {
    marginTop: SPACING.xs,
  },
  streakProgressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.full,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  moduleEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  moduleTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalInputGroup: {
    marginBottom: SPACING.md,
  },
  modalLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: '#fafbfd',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    height: 48,
  },
});

export default HomeScreen;
