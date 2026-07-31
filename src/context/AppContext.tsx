import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { StorageService } from '../services/storage';
import { StepData, WaterEntry, MealEntry, MoodEntry } from '../types';

interface AppState {
  steps: number;
  stepsHistory: StepData[];
  water: number;
  waterHistory: WaterEntry[];
  mealsHistory: MealEntry[];
  calories: number;
  sleep: number;
  streak: number;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STEPS'; payload: number }
  | { type: 'SET_STEPS_HISTORY'; payload: StepData[] }
  | { type: 'ADD_WATER'; payload: number }
  | { type: 'SET_WATER_HISTORY'; payload: WaterEntry[] }
  | { type: 'ADD_MEAL'; payload: MealEntry }
  | { type: 'SET_MEAL_HISTORY'; payload: MealEntry[] }
  | { type: 'SET_CALORIES'; payload: number }
  | { type: 'SET_SLEEP'; payload: number }
  | { type: 'SET_STREAK'; payload: number }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

const initialState: AppState = {
  steps: 0,
  stepsHistory: [],
  water: 0,
  waterHistory: [],
  mealsHistory: [],
  calories: 0,
  sleep: 0,
  streak: 7,
  isLoading: true,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_STEPS':
      return { ...state, steps: action.payload };
    case 'SET_STEPS_HISTORY':
      return { ...state, stepsHistory: action.payload };
    case 'ADD_WATER':
      return { ...state, water: state.water + action.payload };
    case 'SET_WATER_HISTORY':
      return { ...state, waterHistory: action.payload };
    case 'ADD_MEAL':
      return { 
        ...state, 
        calories: state.calories + action.payload.calories, 
        mealsHistory: [...state.mealsHistory, action.payload] 
      };
    case 'SET_MEAL_HISTORY':
      return { ...state, mealsHistory: action.payload };
    case 'SET_CALORIES':
      return { ...state, calories: action.payload };
    case 'SET_SLEEP':
      return { ...state, sleep: action.payload };
    case 'SET_STREAK':
      return { ...state, streak: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addWater: (amount: number) => Promise<void>;
  addMeal: (name: string, calories: number, protein?: number, carbs?: number, fat?: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadStoredData = async () => {
    try {
      const [stepsHistory, waterHistory, mealsHistory] = await Promise.all([
        StorageService.getSteps(),
        StorageService.getWaterEntries(),
        StorageService.getMeals(),
      ]);

      const today = new Date().toISOString().split('T')[0];
      
      const todayWater = waterHistory
        .filter(w => {
          const wDate = typeof w.timestamp === 'string' ? w.timestamp : w.timestamp.toISOString();
          return wDate.startsWith(today);
        })
        .reduce((sum, w) => sum + w.amount, 0);

      const todaySteps = stepsHistory
        .filter(s => s.date === today)
        .reduce((sum, s) => sum + s.count, 0);

      const todayCalories = mealsHistory
        .filter(m => {
          const mDate = typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString();
          return mDate.startsWith(today);
        })
        .reduce((sum, m) => sum + m.calories, 0);

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          stepsHistory,
          waterHistory,
          mealsHistory,
          water: todayWater,
          steps: todaySteps,
          calories: todayCalories,
          streak: 7,
        },
      });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addWater = async (amount: number) => {
    try {
      dispatch({ type: 'ADD_WATER', payload: amount });

      const newEntry: WaterEntry = {
        id: Date.now().toString(),
        amount,
        timestamp: new Date(),
      };

      const updatedHistory = [...state.waterHistory, newEntry];
      await StorageService.saveWaterEntries(updatedHistory);
      dispatch({ type: 'SET_WATER_HISTORY', payload: updatedHistory });
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  const addMeal = async (
    name: string, 
    calories: number, 
    protein: number = 0, 
    carbs: number = 0, 
    fat: number = 0
  ) => {
    try {
      const newEntry: MealEntry = {
        id: Date.now().toString(),
        name,
        calories,
        protein,
        carbs,
        fat,
        timestamp: new Date(),
      };

      dispatch({ type: 'ADD_MEAL', payload: newEntry });

      const updatedHistory = [...state.mealsHistory, newEntry];
      await StorageService.saveMeals(updatedHistory);
      dispatch({ type: 'SET_MEAL_HISTORY', payload: updatedHistory });
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const refreshData = async () => {
    await loadStoredData();
  };

  useEffect(() => {
    loadStoredData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, addWater, addMeal, refreshData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
