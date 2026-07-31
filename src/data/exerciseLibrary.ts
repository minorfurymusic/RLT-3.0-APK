import { GymExercise } from '../types';

export const EXERCISE_LIBRARY: GymExercise[] = [
  { id: 'e1', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell & Bench', illustration: '🏋️' },
  { id: 'e2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells & Incline Bench', illustration: '🏋️' },
  { id: 'e3', name: 'Chest Fly', muscleGroup: 'Chest', equipment: 'Pec Deck Machine', illustration: '🦋' },
  { id: 'e20', name: 'Push Ups', muscleGroup: 'Chest', equipment: 'Bodyweight', illustration: '💪' },
  
  { id: 'e4', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable Machine', illustration: '🧗' },
  { id: 'e5', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell', illustration: '💪' },
  { id: 'e6', name: 'Seated Row', muscleGroup: 'Back', equipment: 'Cable Machine', illustration: '🚣' },
  { id: 'e21', name: 'Pull Ups', muscleGroup: 'Back', equipment: 'Bodyweight', illustration: '🧗' },
  { id: 'e22', name: 'Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell', illustration: '🚣' },
  
  { id: 'e7', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells or Machine', illustration: '⬆️' },
  { id: 'e8', name: 'Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbells', illustration: '👐' },
  { id: 'e23', name: 'Front Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbells', illustration: '👐' },
  { id: 'e24', name: 'Face Pulls', muscleGroup: 'Shoulders', equipment: 'Cable Machine', illustration: '🎭' },
  
  { id: 'e9', name: 'Bicep Curl', muscleGroup: 'Arms', equipment: 'Dumbbells or Barbell', illustration: '💪' },
  { id: 'e10', name: 'Tricep Pushdown', muscleGroup: 'Arms', equipment: 'Cable Machine', illustration: '⬇️' },
  { id: 'e25', name: 'Hammer Curl', muscleGroup: 'Arms', equipment: 'Dumbbells', illustration: '🔨' },
  { id: 'e26', name: 'Skull Crushers', muscleGroup: 'Arms', equipment: 'Barbell', illustration: '💀' },
  
  { id: 'e11', name: 'Squat', muscleGroup: 'Lower Body', equipment: 'Barbell or Bodyweight', illustration: '🦵' },
  { id: 'e12', name: 'Leg Press', muscleGroup: 'Lower Body', equipment: 'Leg Press Machine', illustration: '🦵' },
  { id: 'e13', name: 'Leg Extension', muscleGroup: 'Lower Body', equipment: 'Leg Extension Machine', illustration: '🦵' },
  { id: 'e14', name: 'Hip Thrust', muscleGroup: 'Lower Body', equipment: 'Barbell & Bench', illustration: '🍑' },
  { id: 'e27', name: 'Lunges', muscleGroup: 'Lower Body', equipment: 'Dumbbells or Bodyweight', illustration: '🦵' },
  { id: 'e28', name: 'Calf Raise', muscleGroup: 'Lower Body', equipment: 'Machine or Bodyweight', illustration: '🦵' },
  
  { id: 'e16', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', illustration: '🧘' },
  { id: 'e17', name: 'Crunch', muscleGroup: 'Core', equipment: 'Bodyweight', illustration: '🧘' },
  
  { id: 'e18', name: 'Burpees', muscleGroup: 'Full Body', equipment: 'Bodyweight', illustration: '🔥' },
  { id: 'e19', name: 'Kettlebell Swing', muscleGroup: 'Full Body', equipment: 'Kettlebell', illustration: '🔔' },
];
