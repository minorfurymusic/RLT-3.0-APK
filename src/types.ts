export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'goal' | 'medication' | 'event' | 'exercise' | 'nutrition' | 'system' | 'announcement';
  read: boolean;
  targetPath?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  time: string;
  type: 'medical' | 'exam' | 'medication' | 'workout' | 'nutrition';
  synced?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string | null;
  onboardingCompleted: boolean;
  // Essential Information
  age?: number;
  weight?: number;
  height?: number;
  sex?: 'Male' | 'Female' | 'Other';
  stepGoal: number;
  // Personal Information
  ethnicity?: string;
  address?: string;
  bodyFatPercentage?: number;
  waistCircumference?: number;
  workActivityType?: 'Sedentary' | 'Active' | 'Very Active';
  preferredTrainingTime?: string;
  foodRestrictions?: string;
  foodPreference?: 'Vegetarian' | 'Balanced' | 'Low Carb' | string;
  stimulantConsumption?: string;
  sleepQuality?: string;
  mentalHealthHistory?: MentalHealthResponse[];
}

export interface SelectedCondition {
  id: string;
  category: string;
  condition: string;
  details?: string[];
  notes?: string;
  status?: 'Active' | 'Controlled' | 'Recovered' | 'Chronic';
  yearDiagnosed?: number;
  severity?: string;
  affectedBodyArea?: string;
}

export interface HealthGoal {
  id: string;
  category: 'Performance' | 'Nutrition' | 'Well-being' | 'Lifestyle' | 'Mental Health';
  title: string;
  description: string;
  selected: boolean;
  type: 'toggle' | 'options' | 'input' | 'numeric' | 'time';
  options?: string[];
  selectedOption?: string;
  inputValue?: string; // For descriptions like Food Reeducation
  targetValue?: number; // For training days, caloric deficit
  timeValue?: string; // For bedtime
  current?: number;
  target?: number;
  unit?: string;
}

export interface HealthRecord {
  id: string;
  metric: 'calories' | 'protein' | 'hydration' | 'steps' | 'healthScore';
  value: number;
  date: string; // ISO string
}

export interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'medication' | 'appointment' | 'exercise';
}

export type HistoryCategory = 'Medical History' | 'Exams' | 'Consultations' | 'Emergency' | 'Family History' | 'Stress Reports' | 'Medical Certificates';

export interface Note {
  id: string;
  date: string; // ISO string
  text: string;
}

export interface BaseHistoryRecord {
  id: string;
  category: HistoryCategory;
  date: string;
  notes?: Note[];
  attachmentUrl?: string;
  files?: AttachedFile[];
}

export interface MedicalHistoryRecord extends BaseHistoryRecord {
  category: 'Medical History';
  conditionName: string;
  conditionCategory: string;
  details?: string[];
  bodyLocation?: string;
  severity?: string;
  status: 'Active' | 'Controlled' | 'Recovered' | 'Chronic';
}

export type ExamCategory = 
  | 'Blood Tests' 
  | 'Hormonal Tests' 
  | 'Cardiovascular Tests' 
  | 'Imaging Exams' 
  | 'Metabolic Tests' 
  | 'Nutritional Biomarkers' 
  | 'Kidney Function Tests' 
  | 'Liver Function Tests' 
  | 'Inflammatory Markers' 
  | 'Genetic Tests' 
  | 'Urine Tests' 
  | 'Stool Tests' 
  | 'Other Exams';

export type ExamStatus = 'Normal' | 'Attention Required' | 'Abnormal' | 'Pending Results';

export interface BiomarkerResult {
  name: string;
  value: string | number;
  unit: string;
  referenceRange?: string;
  status?: ExamStatus;
  method?: string;
  material?: string;
}

export interface ExamRecord extends BaseHistoryRecord {
  category: 'Exams';
  examName: string;
  examCategory: ExamCategory;
  provider: string;
  doctorResponsible?: string;
  status: ExamStatus;
  results: BiomarkerResult[];
  attachmentType?: 'pdf' | 'image';
  bodyRegion?: string; // For imaging exams
  methodUsed?: string;
  materialUsed?: string;
}

export type ConsultationStatus = 'Scheduled' | 'Completed' | 'Canceled';

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribingDoctor: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string; // 'pdf' | 'image' | 'document' | 'word' etc
  url: string;
}

export interface TreatmentPlan {
  medication?: string;
  medications?: Prescription[];
  physicalTherapy?: string;
  lifestyle?: string;
  dietary?: string;
  exercise?: string;
}

export interface ConsultationRecord extends BaseHistoryRecord {
  category: 'Consultations';
  doctorName: string;
  specialty: string;
  professionalType?: ProfessionalType;
  location: string; // clinic / hospital / online
  reason: string;
  status: ConsultationStatus;
  diagnosis?: string;
  treatmentPlan?: TreatmentPlan;
  followUpDate?: string; // ISO string
  prescriptions?: Prescription[];
  medicalReportNotes?: string;
  hasMedicalCertificate?: boolean;
  medicalCertificate?: MedicalCertificate;
}

export type ProfessionalType = 
  | 'Dentist' 
  | 'Speech Therapist' 
  | 'Nutritionist' 
  | 'Psychologist' 
  | 'Psychiatrist' 
  | 'Physiotherapist' 
  | 'Orthopedist' 
  | 'Cardiologist' 
  | 'Endocrinologist' 
  | 'Dermatologist' 
  | 'Neurologist' 
  | 'General Practitioner'
  | 'Other';

export interface MedicalCertificate {
  doctorName: string;
  date: string;
  duration: string;
  reason: string;
  notes: string;
  file?: AttachedFile;
}

export interface FamilyHistoryCondition {
  condition: string;
  category: string;
  ageAtOnset?: number;
  cancerDetails?: {
    type: string;
    affectedOrgan: string;
  };
  notes?: string;
}

export interface FamilyHistoryRecord extends BaseHistoryRecord {
  category: 'Family History';
  relativeName: string;
  relationship: string;
  age?: number;
  isLiving: boolean;
  conditions: FamilyHistoryCondition[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface EmergencyMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
  prescribingDoctor?: string;
}

export interface EmergencyRecord extends BaseHistoryRecord {
  category: 'Emergency';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: {
    medication: string[];
    food: string[];
    environmental: string[];
  };
  currentMedications: EmergencyMedication[];
  criticalConditions: string[];
  emergencyContacts: EmergencyContact[];
  organDonorStatus: 'Registered' | 'Not registered' | 'Prefer not to say';
  emergencyInstructions?: string;
}

export interface StressReportRecord extends BaseHistoryRecord {
  category: 'Stress Reports';
  stressLevel: number;
  mood: string;
  sleepQuality: string;
  triggers: string[];
  physicalSymptoms: string[];
  source?: 'Work' | 'Traffic' | 'Family' | 'Financial' | 'Health' | 'Other' | 'Others';
  stressNotes?: string;
  voiceUrl?: string;
  transcription?: string;
}

export interface MedicalCertificateRecord extends BaseHistoryRecord {
  category: 'Medical Certificates';
  doctorName: string;
  duration: string;
  reason: string;
}

export type HistoryRecord = MedicalHistoryRecord | ExamRecord | ConsultationRecord | EmergencyRecord | FamilyHistoryRecord | StressReportRecord | MedicalCertificateRecord;

export interface Meal {
  id: string;
  name?: string;
  description: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Post-workout' | 'Custom';
  time: string;
  date: string; // ISO string
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionSize: string;
  imageUrl?: string;
}

export interface WaterLog {
  id: string;
  amount: number; // in ml
  time: string;
  date: string; // ISO string
}

export interface ExerciseRoutine {
  id: string;
  name: string;
  time: string;
  completed: boolean;
  type: 'walking' | 'running' | 'cycling' | 'gym' | 'steps' | 'other';
  repeat: 'Every day' | 'Monday-Friday' | string[];
  stepGoal?: number;
  // Manual tracking fields
  distance?: number; // km
  duration?: number; // minutes
  calories?: number;
  avgSpeed?: number;
  gymExercises?: {
    exerciseId: string;
    sets: GymSet[];
  }[];
  otherActivityName?: string;
}

export type ActivityType = 'walking' | 'running' | 'cycling' | 'gym' | 'other';

export interface ActivityTracking {
  id: string;
  name?: string;
  type: 'walking' | 'running' | 'cycling' | 'gym' | 'other';
  startTime: string;
  endTime?: string;
  duration: number; // seconds
  distance: number; // km
  avgSpeed: number; // km/h
  calories: number;
  elevation: number; // m
}

export interface GymExercise {
  id: string;
  name: string;
  muscleGroup: 'Lower Body' | 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
  equipment: string;
  illustration: string;
}

export interface GymSet {
  weight: number;
  reps: number;
}

export interface GymWorkoutLog {
  id: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: GymSet[];
  totalReps: number;
  weight: number;
  volume: number;
  caloriesBurned: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface MentalHealthResponse {
  id: string;
  date: string; // ISO string
  answers: {
    questionId: string;
    question: string;
    answer: number | string;
  }[];
  score: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'Nutrition' | 'Fitness' | 'Health' | 'Mental Well-Being';
  type: 'insight' | 'suggestion' | 'warning' | 'motivational';
  date: string;
}
