import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { HealthRecord, Notification, CalendarEvent, UserProfile, HealthGoal, Meal, WaterLog, ExerciseRoutine, GymWorkoutLog, ActivityTracking, HistoryRecord, HistoryCategory, StressReportRecord, MentalHealthResponse, Insight, MedicalHistoryRecord } from '../types';

interface HealthContextType {
  records: HealthRecord[];
  notifications: Notification[];
  events: CalendarEvent[];
  profile: UserProfile;
  goals: HealthGoal[];
  meals: Meal[];
  waterLogs: WaterLog[];
  routines: ExerciseRoutine[];
  gymLogs: GymWorkoutLog[];
  activities: ActivityTracking[];
  historyRecords: HistoryRecord[];
  insights: Insight[];
  isDayEnded: boolean;
  dismissedNotificationIds: string[];
  addRecord: (metric: HealthRecord['metric'], value: number) => void;
  updateRecord: (id: string, value: number) => void;
  deleteRecord: (id: string) => void;
  getTodayValue: (metric: HealthRecord['metric']) => number;
  getHistory: (metric: HealthRecord['metric']) => HealthRecord[];
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateGoal: (id: string, goal: Partial<HealthGoal>) => void;
  setAvatar: (avatar: string | null) => void;
  // Meal CRUD
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, meal: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  // Water CRUD
  addWaterLog: (log: Omit<WaterLog, 'id'>) => void;
  updateWaterLog: (id: string, log: Partial<WaterLog>) => void;
  deleteWaterLog: (id: string) => void;
  // Routine CRUD
  addRoutine: (routine: Omit<ExerciseRoutine, 'id'>) => void;
  updateRoutine: (id: string, routine: Partial<ExerciseRoutine>) => void;
  deleteRoutine: (id: string) => void;
  // Gym Log CRUD
  addGymLog: (log: Omit<GymWorkoutLog, 'id'>) => void;
  deleteGymLog: (id: string) => void;
  // Activity Tracking CRUD
  addActivity: (activity: ActivityTracking) => void;
  // History Records CRUD
  addHistoryRecord: (record: Omit<HistoryRecord, 'id'>) => void;
  updateHistoryRecord: (id: string, record: Partial<HistoryRecord>) => void;
  deleteHistoryRecord: (id: string) => void;
  // Helpers
  getDailyWaterTarget: () => number;
  getFatLossEstimation: () => { deficit: number; fatLossKg: number; status: 'deficit' | 'maintenance' | 'surplus'; totalBurned: number };
  getDailyCalorieTarget: () => number;
  getProteinTarget: () => number;
  mentalHealthScore: number;
  endDay: () => void;
  reopenDay: () => void;
  addMentalHealthResponse: (response: Omit<MentalHealthResponse, 'id'>) => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

const DEFAULT_GOALS: HealthGoal[] = [
  // Performance
  { id: 'g1', category: 'Performance', title: 'Muscle Gain', description: 'Focus on hypertrophy and strength training.', selected: false, type: 'toggle' },
  { id: 'g2', category: 'Performance', title: 'Endurance Improvement', description: 'Improve running or cycling stamina.', selected: false, type: 'toggle' },
  { id: 'g3', category: 'Performance', title: 'Flexibility and Mobility', description: 'Reduce body stiffness and improve range of motion.', selected: false, type: 'toggle' },
  { id: 'g5', category: 'Performance', title: 'Training for Specific Event', description: 'Preparation for competitions, fitness tests, or races.', selected: false, type: 'numeric', targetValue: 4, unit: 'days/week' },
  // Nutrition
  { id: 'g6', category: 'Nutrition', title: 'Food Reeducation', description: 'Focus on food quality instead of restrictive dieting.', selected: false, type: 'input', inputValue: '' },
  { id: 'g7', category: 'Nutrition', title: 'Fat Loss', description: 'Strategic caloric deficit with focus on health.', selected: false, type: 'numeric', targetValue: 500, unit: 'kcal/day' },
  { id: 'g8', category: 'Nutrition', title: 'Increase Protein Intake', description: 'Track macros to reach daily protein target.', selected: true, type: 'options', options: ['Increase Protein Intake', 'Maintain Protein Intake', 'Do Not Track Protein Goal'], selectedOption: 'Maintain Protein Intake' },
  { id: 'g9', category: 'Nutrition', title: 'Reduce Ultra-Processed Foods', description: 'Decrease sugar and industrialized foods.', selected: false, type: 'toggle' },
  { id: 'g10', category: 'Nutrition', title: 'Optimized Hydration', description: 'Set and maintain a daily water intake goal.', selected: true, type: 'toggle' },
  // Well-being
  { id: 'g11', category: 'Well-being', title: 'Sleep Hygiene', description: 'Sleep a specific number of hours or improve sleep quality.', selected: false, type: 'time', timeValue: '22:00' },
  { id: 'g12', category: 'Well-being', title: 'Stress Management', description: 'Meditation, breathing practices, or active breaks.', selected: false, type: 'toggle' },
  { id: 'g13', category: 'Well-being', title: 'Addiction Reduction', description: 'Reduce caffeine, alcohol, or tobacco consumption.', selected: false, type: 'toggle' },
  { id: 'g14', category: 'Well-being', title: 'Longevity', description: 'Focus on long-term health markers.', selected: false, type: 'toggle' },
  { id: 'g15', category: 'Well-being', title: 'Mental Health', description: 'Encourage hobbies, relaxation, and digital detox.', selected: false, type: 'toggle' },
];

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<HealthRecord[]>(() => {
    const saved = localStorage.getItem('health_records');
    return saved ? JSON.parse(saved) : [
      { id: '1', metric: 'calories', value: 1200, date: new Date().toISOString() },
      { id: '2', metric: 'protein', value: 75, date: new Date().toISOString() },
      { id: '3', metric: 'hydration', value: 1.5, date: new Date().toISOString() },
      { id: '4', metric: 'steps', value: 6500, date: new Date().toISOString() },
      { id: '5', metric: 'healthScore', value: 83, date: new Date().toISOString() },
    ];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('health_notifications');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Goal Achieved!', description: 'You reached your step goal for today.', time: '2h ago', type: 'goal', read: false, targetPath: '/metric/steps' },
      { id: '2', title: 'Medication Reminder', description: 'Time for your Vitamin D.', time: '4h ago', type: 'medication', read: true, targetPath: '/history' },
      { id: '3', title: 'Upcoming Event', description: 'Doctor Appointment starts in 15 minutes.', time: 'Just now', type: 'event', read: false, targetPath: '/calendar' },
    ];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('health_events');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Doctor Appointment', description: 'General Checkup - Dr. Smith', date: new Date().toISOString(), time: '02:30 PM', type: 'medical' },
      { id: '2', title: 'Evening Walk', description: 'Park Loop - 30 min', date: new Date().toISOString(), time: '06:00 PM', type: 'workout' },
    ];
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('health_profile');
    const defaultProfile = {
      name: 'Jean R.',
      email: 'jeanrsl098@gmail.com',
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMS9VcpPxB-rzWX68nHrXe-Xma7EI6d1TZYQNQbNlgtoCBu3V8-e-NPpeLSrMY3R9ffbZuqIlAGaOv4YhfXTVNwZH_QkyEnoSbumOC9HVfT7j2snA17jRi-02uUGyhIBy0aE-c0O8Jg4yCe9OpwLjsIOiWeO7x80znxqATFVXQ-s33fT7KiglktsorqiT6FdZZzjT0QEDnpdf5YOsN9ei_S6nDBnmu7ti2dgLuw2a5OWX9ErSmEY5HkYME_pdU8BiEgcw_gbzcn80",
      onboardingCompleted: true,
      age: 28,
      weight: 75,
      height: 180,
      sex: 'Male',
      stepGoal: 10000,
      workActivityType: 'Active',
      sleepQuality: 'Good',
    };
    if (!saved) return defaultProfile as UserProfile;
    const parsed = JSON.parse(saved);
    return { ...defaultProfile, ...parsed } as UserProfile;
  });

  const [goals, setGoals] = useState<HealthGoal[]>(() => {
    const saved = localStorage.getItem('health_goals');
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('health_meals');
    return saved ? JSON.parse(saved) : [
      { id: '1', description: 'Oatmeal with berries', type: 'Breakfast', time: '08:00 AM', date: new Date().toISOString(), calories: 350, protein: 12, carbs: 60, fat: 8, portionSize: '1 bowl' },
      { id: '2', description: 'Grilled chicken salad', type: 'Lunch', time: '01:00 PM', date: new Date().toISOString(), calories: 450, protein: 35, carbs: 15, fat: 20, portionSize: '1 plate' },
    ];
  });

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem('health_water');
    return saved ? JSON.parse(saved) : [
      { id: '1', amount: 500, time: '09:00 AM', date: new Date().toISOString() },
      { id: '2', amount: 500, time: '11:30 AM', date: new Date().toISOString() },
      { id: '3', amount: 500, time: '02:00 PM', date: new Date().toISOString() },
    ];
  });

  const [routines, setRoutines] = useState<ExerciseRoutine[]>(() => {
    const saved = localStorage.getItem('health_routines');
    const defaultRoutines = [
      { id: '1', name: 'Morning Walk', time: '07:00 AM', completed: false, type: 'walking' },
      { id: '2', name: 'Gym Session', time: '05:30 PM', completed: false, type: 'gym' },
    ];
    if (!saved) return defaultRoutines as ExerciseRoutine[];
    const parsed = JSON.parse(saved);
    // Basic migration: if any routine lacks 'type' or 'time', it's old data.
    if (Array.isArray(parsed) && parsed.some((r: any) => !r.type || !r.time)) {
       return defaultRoutines as ExerciseRoutine[];
    }
    return parsed;
  });

  const [gymLogs, setGymLogs] = useState<GymWorkoutLog[]>(() => {
    const saved = localStorage.getItem('health_gym_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<ActivityTracking[]>(() => {
    const saved = localStorage.getItem('health_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem('health_history_records');
    const defaultRecords: HistoryRecord[] = [
      {
        id: 'h1',
        category: 'Medical History',
        conditionName: 'Seasonal Allergies',
        conditionCategory: 'Respiratory',
        status: 'Active',
        date: new Date().toISOString(),
        notes: [
          { id: 'n1', date: new Date().toISOString(), text: 'Worse during spring' }
        ]
      },
      {
        id: 'h2',
        category: 'Exams',
        examName: 'Complete Blood Count',
        examCategory: 'Blood Tests',
        provider: 'Central Lab',
        doctorResponsible: 'Dr. Sarah Wilson',
        status: 'Normal',
        date: new Date().toISOString(),
        results: [
          { name: 'Hemoglobin', value: 14.2, unit: 'g/dL', referenceRange: '13.5-17.5', status: 'Normal' },
          { name: 'Hematocrit', value: 42.5, unit: '%', referenceRange: '41-50', status: 'Normal' },
          { name: 'White Blood Cells', value: 6500, unit: 'cells/uL', referenceRange: '4,500-11,000', status: 'Normal' }
        ],
        notes: [
          { id: 'n2', date: new Date().toISOString(), text: 'Annual checkup results' }
        ]
      },
      {
        id: 'h3',
        category: 'Exams',
        examName: 'Lipid Profile',
        examCategory: 'Metabolic Tests',
        provider: 'City Diagnostics',
        doctorResponsible: 'Dr. Sarah Wilson',
        status: 'Attention Required',
        date: new Date(Date.now() - 86400000 * 30).toISOString(),
        results: [
          { name: 'Total Cholesterol', value: 210, unit: 'mg/dL', referenceRange: '< 200', status: 'Attention Required' },
          { name: 'LDL Cholesterol', value: 135, unit: 'mg/dL', referenceRange: '< 100', status: 'Attention Required' },
          { name: 'HDL Cholesterol', value: 45, unit: 'mg/dL', referenceRange: '> 40', status: 'Normal' },
          { name: 'Triglycerides', value: 160, unit: 'mg/dL', referenceRange: '< 150', status: 'Attention Required' }
        ],
        notes: [
          { id: 'n3', date: new Date(Date.now() - 86400000 * 30).toISOString(), text: 'Slightly elevated cholesterol. Recommended diet adjustments.' }
        ]
      },
      {
        id: 'h4',
        category: 'Consultations',
        doctorName: 'Dr. Maria Silva',
        specialty: 'Cardiology',
        professionalType: 'Cardiologist',
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        location: 'City Hospital',
        status: 'Completed',
        reason: 'Routine heart checkup',
        diagnosis: 'Mild hypertension',
        treatmentPlan: {
          medication: 'Lisinopril 10mg once daily',
          lifestyle: 'Reduce salt intake',
          dietary: 'DASH diet recommended',
          exercise: 'Moderate walking 30 mins daily'
        },
        prescriptions: [
          { id: 'p1', medicationName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', prescribingDoctor: 'Dr. Maria Silva' }
        ],
        followUpDate: new Date(Date.now() + 86400000 * 90).toISOString(),
        notes: [
          { id: 'n4', date: new Date(Date.now() - 86400000 * 7).toISOString(), text: 'Patient reported occasional dizziness.' }
        ]
      }
    ];

    if (!saved) return defaultRecords;
    const parsed = JSON.parse(saved);
    
    // Migration for notes: string -> Note[]
    return parsed.map((r: any) => {
      if (typeof r.notes === 'string') {
        return {
          ...r,
          notes: r.notes ? [{ id: Math.random().toString(36).substr(2, 9), date: r.date || new Date().toISOString(), text: r.notes }] : []
        };
      }
      return r;
    });
  });

  const [insights, setInsights] = useState<Insight[]>(() => {
    const saved = localStorage.getItem('health_insights');
    return saved ? JSON.parse(saved) : [
      {
        id: 'i1',
        title: 'Protein Intake',
        description: 'You are 20g short of your protein goal today. Consider adding a snack.',
        category: 'Nutrition',
        type: 'suggestion',
        date: new Date().toISOString()
      },
      {
        id: 'i2',
        title: 'Great Consistency!',
        description: 'You have completed your step goal for 3 days in a row.',
        category: 'Fitness',
        type: 'motivational',
        date: new Date().toISOString()
      }
    ];
  });

  const getDailyWaterTarget = useCallback(() => {
    const weight = profile.weight || 70;
    let target = (weight * 35) / 1000; // in Liters

    // AI Adjustment based on stimulants/substances
    const stimulants = profile.stimulantConsumption?.toLowerCase() || '';
    if (stimulants.includes('coffee')) target += 0.25;
    if (stimulants.includes('creatine')) target += 0.5;
    if (stimulants.includes('alcohol')) target += 0.5;
    if (stimulants.includes('testosterone')) target += 0.3;
    
    return target;
  }, [profile]);

  const getDailyCalorieTarget = useCallback(() => {
    // Simplified BMR calculation (Mifflin-St Jeor Equation)
    const weight = profile.weight || 75;
    const height = profile.height || 180;
    const age = profile.age || 28;
    const sex = profile.sex || 'Male';
    
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += (sex === 'Male' ? 5 : -161);
    
    const multiplier = profile.workActivityType === 'Sedentary' ? 1.2 : 
                       profile.workActivityType === 'Active' ? 1.5 : 1.8;
    
    // Exercise calories burned from Daily Routines activities (ActivityTracking)
    const today = new Date().toDateString();
    const exerciseBurned = activities
      .filter(a => new Date(a.startTime).toDateString() === today)
      .reduce((sum, a) => sum + a.calories, 0);

    // Gym calories
    const gymBurned = gymLogs
      .filter(l => new Date(l.date).toDateString() === today)
      .reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);

    // Steps calories (calculated from steps tracked during the day)
    // Formula: 0.04 calories per step (average)
    const steps = records.filter(r => r.metric === 'steps' && new Date(r.date).toDateString() === today).reduce((sum, r) => sum + r.value, 0) || 7240;
    const stepsBurned = steps * 0.04;

    // Additional allowance if step goal exceeded
    const stepGoal = profile.stepGoal || 10000;
    let bonusCalories = 0;
    if (steps > stepGoal) {
      bonusCalories = (steps - stepGoal) * 0.05; // Slightly higher reward for extra steps
    }
    
    const tdee = bmr * multiplier + exerciseBurned + gymBurned + stepsBurned + bonusCalories;
    
    // Check goals for Cutting vs Bulking
    const fatLossGoal = goals.find(g => g.id === 'g7' && g.selected);
    const muscleGainGoal = goals.find(g => g.id === 'g1' && g.selected);
    
    if (muscleGainGoal) {
      return tdee + 300; // Target surplus level
    }
    
    if (fatLossGoal) {
      return tdee - (fatLossGoal.targetValue || 500);
    }
    
    return tdee; // Daily Calorie Maximum / Maintenance
  }, [profile, activities, gymLogs, records, goals]);

  const mentalHealthScore = useMemo(() => {
    const stressReports = historyRecords.filter(r => r.category === 'Stress Reports') as StressReportRecord[];
    if (stressReports.length === 0) return 100;

    // Get reports from last 7 days
    const last7Days = stressReports.filter(r => {
      const date = new Date(r.date);
      const now = new Date();
      return (now.getTime() - date.getTime()) <= (7 * 24 * 60 * 60 * 1000);
    });

    if (last7Days.length === 0) return 100;

    const avgStress = last7Days.reduce((acc, curr) => acc + curr.stressLevel, 0) / last7Days.length;
    // Score is inverse of stress (10 stress = 0 score, 1 stress = 100 score)
    const score = Math.max(0, Math.min(100, 100 - (avgStress - 1) * 11));
    return Math.round(score);
  }, [historyRecords]);

  const getProteinTarget = useCallback(() => {
    const weight = profile.weight || 75;
    const age = profile.age || 28;
    const proteinGoal = goals.find(g => g.id === 'g8');
    const muscleGainGoal = goals.find(g => g.id === 'g1' && g.selected);

    if (!proteinGoal || proteinGoal.selectedOption === 'Do Not Track Protein Goal') return 0;

    let multiplier = 1.0;

    if (muscleGainGoal) {
      multiplier = proteinGoal.selectedOption === 'Increase Protein Intake' ? 2.0 : 1.6;
    } else if (age > 60) {
      multiplier = proteinGoal.selectedOption === 'Increase Protein Intake' ? 1.8 : 1.4;
    } else {
      multiplier = proteinGoal.selectedOption === 'Increase Protein Intake' ? 1.5 : 1.2;
    }

    return Math.round(weight * multiplier);
  }, [profile, goals]);

  useEffect(() => {
    const generateInsights = () => {
      const newInsights: Insight[] = [];
      const today = new Date().toDateString();
      
      // Nutrition Analysis
      const consumed = meals.filter(m => new Date(m.date).toDateString() === today).reduce((sum, m) => sum + m.calories, 0);
      const calorieTarget = getDailyCalorieTarget();
      const proteinConsumed = meals.filter(m => new Date(m.date).toDateString() === today).reduce((sum, m) => sum + m.protein, 0);
      const proteinTarget = getProteinTarget();
      
      if (consumed > calorieTarget * 1.1) {
        newInsights.push({
          id: 'ni1',
          title: 'Calorie Surplus',
          description: 'You have exceeded your calorie target for today. Try to balance it tomorrow.',
          category: 'Nutrition',
          type: 'warning',
          date: new Date().toISOString()
        });
      }
      
      if (proteinTarget > 0 && proteinConsumed < proteinTarget * 0.8) {
        newInsights.push({
          id: 'ni2',
          title: 'Low Protein',
          description: 'Your protein intake is low today. Consider a high-protein snack.',
          category: 'Nutrition',
          type: 'suggestion',
          date: new Date().toISOString()
        });
      }

      // Exercise Analysis
      const steps = records.filter(r => r.metric === 'steps' && new Date(r.date).toDateString() === today).reduce((sum, r) => sum + r.value, 0) || 7240;
      const stepGoal = profile.stepGoal || 10000;
      
      if (steps < stepGoal * 0.5) {
        newInsights.push({
          id: 'fi1',
          title: 'Low Activity',
          description: 'You have been quite sedentary today. A short walk could help!',
          category: 'Fitness',
          type: 'suggestion',
          date: new Date().toISOString()
        });
      } else if (steps >= stepGoal) {
        newInsights.push({
          id: 'fi2',
          title: 'Goal Reached!',
          description: 'You completed all your daily goals today. Great job!',
          category: 'Fitness',
          type: 'motivational',
          date: new Date().toISOString()
        });
      }

      // Medical Risk
      const activeConditions = historyRecords.filter(r => r.category === 'Medical History' && (r as any).status === 'Active') as MedicalHistoryRecord[];
      if (activeConditions.length > 0) {
        newInsights.push({
          id: 'hi1',
          title: 'Health Awareness',
          description: `Remember to monitor your ${activeConditions[0].conditionName} today.`,
          category: 'Health',
          type: 'insight',
          date: new Date().toISOString()
        });
      }

      // Mental Well-being
      if (mentalHealthScore < 60) {
        newInsights.push({
          id: 'mi1',
          title: 'Stress Alert',
          description: 'Your stress levels have been high. Consider a 5-minute breathing exercise.',
          category: 'Mental Well-Being',
          type: 'suggestion',
          date: new Date().toISOString()
        });
      }

      setInsights(prev => {
        // Only update if something meaningful changed to avoid loops
        if (JSON.stringify(prev) === JSON.stringify(newInsights)) return prev;
        return newInsights;
      });
    };

    const timer = setTimeout(generateInsights, 2000);
    return () => clearTimeout(timer);
  }, [meals, records, profile, historyRecords, mentalHealthScore, routines, getDailyCalorieTarget, getProteinTarget]);

  const [isDayEnded, setIsDayEnded] = useState<boolean>(() => {
    const saved = localStorage.getItem('health_day_ended');
    if (!saved) return false;
    const { date, ended } = JSON.parse(saved);
    return date === new Date().toDateString() ? ended : false;
  });

  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('health_dismissed_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('health_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('health_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('health_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('health_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('health_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('health_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('health_water', JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem('health_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('health_gym_logs', JSON.stringify(gymLogs));
  }, [gymLogs]);

  useEffect(() => {
    localStorage.setItem('health_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('health_history_records', JSON.stringify(historyRecords));
  }, [historyRecords]);

  useEffect(() => {
    localStorage.setItem('health_insights', JSON.stringify(insights));
  }, [insights]);

  useEffect(() => {
    localStorage.setItem('health_day_ended', JSON.stringify({ date: new Date().toDateString(), ended: isDayEnded }));
  }, [isDayEnded]);

  useEffect(() => {
    localStorage.setItem('health_dismissed_notifications', JSON.stringify(dismissedNotificationIds));
  }, [dismissedNotificationIds]);

  const addRecord = (metric: HealthRecord['metric'], value: number) => {
    const newRecord: HealthRecord = {
      id: Math.random().toString(36).substr(2, 9),
      metric,
      value,
      date: new Date().toISOString(),
    };
    setRecords(prev => [newRecord, ...prev]);
  };

  const updateRecord = (id: string, value: number) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, value } : r));
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const getTodayValue = (metric: HealthRecord['metric']) => {
    const today = new Date().toDateString();
    
    if (metric === 'calories') {
      return meals
        .filter(m => new Date(m.date).toDateString() === today)
        .reduce((sum, m) => sum + m.calories, 0);
    }
    
    if (metric === 'protein') {
      return meals
        .filter(m => new Date(m.date).toDateString() === today)
        .reduce((sum, m) => sum + m.protein, 0);
    }
    
    if (metric === 'hydration') {
      return waterLogs
        .filter(w => new Date(w.date).toDateString() === today)
        .reduce((sum, w) => sum + w.amount, 0) / 1000; // Convert ml to L
    }

    if (metric === 'steps') {
      // Mocked synced steps
      return 7240; 
    }

    if (metric === 'healthScore') {
      // 1. Nutrition Quality (25%)
      const calorieTarget = getDailyCalorieTarget();
      const consumed = meals
        .filter(m => new Date(m.date).toDateString() === today)
        .reduce((sum, m) => sum + m.calories, 0);
      const proteinTarget = getProteinTarget();
      const proteinConsumed = meals
        .filter(m => new Date(m.date).toDateString() === today)
        .reduce((sum, m) => sum + m.protein, 0);
      
      const calorieScore = consumed > 0 ? Math.max(0, 100 - Math.min(100, Math.abs((consumed - calorieTarget) / calorieTarget) * 100)) : 50;
      const proteinScore = proteinTarget > 0 ? Math.min(100, (proteinConsumed / proteinTarget) * 100) : 100;
      const nutritionScore = (calorieScore + proteinScore) / 2;

      // 2. Exercise Consistency (25%)
      const stepGoal = profile.stepGoal || 10000;
      const steps = records.filter(r => r.metric === 'steps' && new Date(r.date).toDateString() === today).reduce((sum, r) => sum + r.value, 0) || 7240;
      const stepScore = Math.min(100, (steps / stepGoal) * 100);
      
      const completedRoutines = routines.filter(r => r.completed).length;
      const totalRoutines = routines.length;
      const routineScore = totalRoutines > 0 ? (completedRoutines / totalRoutines) * 100 : 70;
      const exerciseScore = (stepScore + routineScore) / 2;

      // 3. Medical Risk Indicators (25%)
      const activeConditions = historyRecords.filter(r => r.category === 'Medical History' && (r as any).status === 'Active').length;
      const examIssues = historyRecords.filter(r => r.category === 'Exams' && (r as any).status === 'Abnormal').length;
      const medicalScore = Math.max(0, 100 - (activeConditions * 15 + examIssues * 10));

      // 4. Mental Well-being (25%)
      const mentalScore = mentalHealthScore;

      // Weighted average
      const totalScore = 
        (nutritionScore * 0.25) + 
        (exerciseScore * 0.25) + 
        (medicalScore * 0.25) + 
        (mentalScore * 0.25);

      return Math.round(totalScore);
    }

    return records
      .filter(r => r.metric === metric && new Date(r.date).toDateString() === today)
      .reduce((sum, r) => sum + r.value, 0);
  };

  const getHistory = (metric: HealthRecord['metric']) => {
    return records.filter(r => r.metric === metric).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismissNotification = (id: string) => {
    setDismissedNotificationIds(prev => [...prev, id]);
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, eventUpdate: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...eventUpdate } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const updateProfile = (profileUpdate: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...profileUpdate }));
  };

  const updateGoal = (id: string, goalUpdate: Partial<HealthGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goalUpdate } : g));
  };

  const setAvatar = (newAvatar: string | null) => {
    setProfile(prev => ({ ...prev, avatar: newAvatar }));
  };

  // Meal CRUD
  const addMeal = (meal: Omit<Meal, 'id'>) => {
    const newMeal: Meal = { ...meal, id: Math.random().toString(36).substr(2, 9) };
    setMeals(prev => [newMeal, ...prev]);
  };

  const updateMeal = (id: string, mealUpdate: Partial<Meal>) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, ...mealUpdate } : m));
  };

  const deleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  // Water CRUD
  const addWaterLog = (log: Omit<WaterLog, 'id'>) => {
    const newLog: WaterLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
    setWaterLogs(prev => [newLog, ...prev]);
  };

  const updateWaterLog = (id: string, logUpdate: Partial<WaterLog>) => {
    setWaterLogs(prev => prev.map(w => w.id === id ? { ...w, ...logUpdate } : w));
  };

  const deleteWaterLog = (id: string) => {
    setWaterLogs(prev => prev.filter(w => w.id !== id));
  };

  // Routine CRUD
  const addRoutine = (routine: Omit<ExerciseRoutine, 'id'>) => {
    const newRoutine: ExerciseRoutine = { ...routine, id: Math.random().toString(36).substr(2, 9) };
    setRoutines(prev => [...prev, newRoutine]);
  };

  const updateRoutine = (id: string, routineUpdate: Partial<ExerciseRoutine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...routineUpdate } : r));
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const addGymLog = (log: Omit<GymWorkoutLog, 'id'>) => {
    const newLog: GymWorkoutLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
    setGymLogs(prev => [newLog, ...prev]);
  };

  const deleteGymLog = (id: string) => {
    setGymLogs(prev => prev.filter(l => l.id !== id));
  };

  const addActivity = (activity: ActivityTracking) => {
    setActivities(prev => [activity, ...prev]);
  };

  const addHistoryRecord = (record: Omit<HistoryRecord, 'id'>) => {
    const newRecord: HistoryRecord = { ...record, id: Math.random().toString(36).substr(2, 9) } as HistoryRecord;
    setHistoryRecords(prev => [newRecord, ...prev]);
  };

  const updateHistoryRecord = (id: string, recordUpdate: Partial<HistoryRecord>) => {
    setHistoryRecords(prev => prev.map(r => r.id === id ? { ...r, ...recordUpdate } as HistoryRecord : r));
  };

  const deleteHistoryRecord = (id: string) => {
    setHistoryRecords(prev => prev.filter(r => r.id !== id));
  };

  const getFatLossEstimation = () => {
    const today = new Date().toDateString();
    const consumed = meals
      .filter(m => new Date(m.date).toDateString() === today)
      .reduce((sum, m) => sum + m.calories, 0);
    
    const calorieTarget = getDailyCalorieTarget();
    
    // For estimation, we use the TDEE (maintenance)
    // If we are bulking, the target is higher, but deficit is still relative to TDEE
    const muscleGainGoal = goals.find(g => g.id === 'g1' && g.selected);
    const tdee = muscleGainGoal ? calorieTarget - 300 : calorieTarget;
    
    const deficit = tdee - consumed;
    const fatLossKg = Math.max(0, deficit / 7700);
    
    let status: 'deficit' | 'maintenance' | 'surplus' = 'maintenance';
    if (deficit > 200) status = 'deficit';
    else if (deficit < -200) status = 'surplus';
    
    return { deficit, fatLossKg, status, totalBurned: tdee };
  };

  const endDay = () => {
    setIsDayEnded(true);
  };

  const reopenDay = () => {
    setIsDayEnded(false);
  };

  const addMentalHealthResponse = (response: Omit<MentalHealthResponse, 'id'>) => {
    const newResponse: MentalHealthResponse = { ...response, id: Math.random().toString(36).substr(2, 9) };
    setProfile(prev => ({
      ...prev,
      mentalHealthHistory: [newResponse, ...(prev.mentalHealthHistory || [])]
    }));
  };

  return (
    <HealthContext.Provider value={{ 
      records, 
      notifications, 
      events, 
      profile,
      goals,
      meals,
      waterLogs,
      routines,
      gymLogs,
      activities,
      historyRecords,
      insights,
      isDayEnded,
      dismissedNotificationIds,
      avatar: profile.avatar,
      addRecord, 
      updateRecord, 
      deleteRecord, 
      getTodayValue, 
      getHistory,
      addNotification,
      markNotificationRead,
      dismissNotification,
      addEvent,
      updateEvent,
      deleteEvent,
      updateProfile,
      updateGoal,
      setAvatar,
      addMeal,
      updateMeal,
      deleteMeal,
      addWaterLog,
      updateWaterLog,
      deleteWaterLog,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      addGymLog,
      deleteGymLog,
      addActivity,
      addHistoryRecord,
      updateHistoryRecord,
      deleteHistoryRecord,
      getDailyWaterTarget,
      getFatLossEstimation,
      getDailyCalorieTarget,
      getProteinTarget,
      mentalHealthScore,
      endDay,
      reopenDay,
      addMentalHealthResponse
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}

