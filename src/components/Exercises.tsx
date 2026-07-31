import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Bell, 
  Walk, 
  FitnessCenter, 
  History, 
  ChevronRight, 
  Plus, 
  Settings, 
  X, 
  Play, 
  Square, 
  Timer, 
  Map, 
  Flame, 
  TrendingUp, 
  Dumbbell, 
  Info, 
  Edit3, 
  Check, 
  Trash2, 
  Clock, 
  Calendar,
  ArrowLeft,
  Zap,
  Save,
  Loader2
} from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import { useHealth } from '../context/HealthContext';
import { ExerciseRoutine, ActivityTracking, GymExercise, GymSet, ActivityType } from '../types';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function Exercises() {
  const { routines, updateRoutine, addRoutine, deleteRoutine, profile, updateProfile, getTodayValue, addActivity, addGymLog } = useHealth();
  const [isRoutineSettingsOpen, setIsRoutineSettingsOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<ExerciseRoutine | null>(null);
  const [activeActivity, setActiveActivity] = useState<ActivityTracking | null>(null);
  const [isGymLogOpen, setIsGymLogOpen] = useState(false);
  const [selectedExerciseForLog, setSelectedExerciseForLog] = useState<any>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [isEditingTypeSpecific, setIsEditingTypeSpecific] = useState(false);

  const todaySteps = getTodayValue('steps');
  const stepGoalAchieved = todaySteps >= profile.stepGoal;

  const handleStartActivity = (type: 'walking' | 'running' | 'cycling' | 'gym') => {
    const newActivity: ActivityTracking = {
      id: Math.random().toString(36).substr(2, 9),
      type: type === 'gym' ? 'walking' : type, // ActivityTracking type doesn't support gym yet, but we'll use it for the timer
      startTime: new Date().toISOString(),
      duration: 0,
      distance: 0,
      avgSpeed: 0,
      calories: 0,
      elevation: 0
    };
    // We'll handle 'gym' separately in the UI
    if (type === 'gym') {
      setActiveActivity({ ...newActivity, type: 'gym' as any });
    } else {
      setActiveActivity(newActivity);
    }
  };

  if (isEditingTypeSpecific && editingRoutine) {
    if (editingRoutine.type === 'gym') {
      return <GymRoutineEditor routine={editingRoutine} onBack={() => setIsEditingTypeSpecific(false)} onComplete={(calories) => {
        addActivity({
          id: Math.random().toString(36).substr(2, 9),
          type: 'gym',
          name: editingRoutine.name,
          duration: 60, // Default or calculated
          calories,
          date: new Date().toISOString()
        });
        updateRoutine(editingRoutine.id, { completed: true });
        setIsEditingTypeSpecific(false);
      }} />;
    }
    if (['walking', 'running', 'cycling'].includes(editingRoutine.type)) {
      return <CardioRoutineEditor routine={editingRoutine} onBack={() => setIsEditingTypeSpecific(false)} onComplete={(activity) => {
        addActivity(activity);
        updateRoutine(editingRoutine.id, { completed: true });
        setIsEditingTypeSpecific(false);
      }} />;
    }
    return <OtherRoutineEditor routine={editingRoutine} onBack={() => setIsEditingTypeSpecific(false)} onComplete={(activity) => {
      addActivity(activity);
      updateRoutine(editingRoutine.id, { completed: true });
      setIsEditingTypeSpecific(false);
    }} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col pb-24"
    >
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">Exercises</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <TrainingInsights />
        
        {/* Daily Routines */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">Daily Routines</h2>
            <button 
              onClick={() => setIsRoutineSettingsOpen(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-primary"
            >
              <Plus className="size-6" />
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Step Goal */}
            {routines.some(r => r.type === 'walking' || r.type === 'running') && (
              <div 
                onClick={() => {
                  const routine = routines.find(r => r.type === 'walking' || r.type === 'running');
                  if (routine) {
                    setEditingRoutine(routine);
                    setIsEditingTypeSpecific(true);
                  }
                }}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-primary/10 shadow-sm group cursor-pointer hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                      <Walk className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Step Goal</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{todaySteps.toLocaleString()} / {profile.stepGoal.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-emerald-500">
                      {Math.round((todaySteps / profile.stepGoal) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (todaySteps / profile.stepGoal) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Scheduled Routines for Today */}
            {routines.filter(r => {
              const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
              if (r.repeat === 'Every day') return true;
              if (r.repeat === 'Monday-Friday' && !['Saturday', 'Sunday'].includes(today)) return true;
              if (Array.isArray(r.repeat) && r.repeat.includes(today)) return true;
              return false;
            }).map(routine => (
              <div 
                key={routine.id} 
                onClick={() => {
                  setEditingRoutine(routine);
                  setIsEditingTypeSpecific(true);
                }}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-primary/10 shadow-sm flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${
                    routine.type === 'gym' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {routine.type === 'gym' ? <FitnessCenter className="size-6" /> : <Walk className="size-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{routine.name}</h3>
                    <p className="text-xs text-slate-500">{routine.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRoutine(routine.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateRoutine(routine.id, { completed: !routine.completed });
                    }}
                    className={`size-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      routine.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary'
                    }`}
                  >
                    {routine.completed ? <Check className="size-4" /> : <div className="size-4 rounded-full bg-transparent"></div>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Start Activity */}
        <section className="sticky bottom-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md -mx-4 px-4 py-4 border-t border-primary/10 z-10">
          <h2 className="text-slate-900 dark:text-slate-100 text-sm font-bold leading-tight mb-3 uppercase tracking-wider opacity-60">Start Activity</h2>
          <div className="grid grid-cols-3 gap-3">
            <ActivityButton 
              icon={<Walk className="size-5" />} 
              label="Walking" 
              onClick={() => handleStartActivity('walking')}
            />
            <ActivityButton 
              icon={<Walk className="size-5" />} 
              label="Running" 
              onClick={() => handleStartActivity('running')}
            />
            <ActivityButton 
              icon={<Walk className="size-5" />} 
              label="Cycling" 
              onClick={() => handleStartActivity('cycling')}
            />
          </div>
        </section>

        {/* Gym Exercise Library - Only visible when Gym is active or selected */}
        {activeActivity?.type === 'gym' && (
          <section>
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight mb-4">Gym Exercise Library</h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
              {['All', 'Lower Body', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(group => (
                <button 
                  key={group}
                  onClick={() => setSelectedMuscleGroup(group === 'All' ? null : group)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    (selectedMuscleGroup === group || (group === 'All' && !selectedMuscleGroup))
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 gap-3 mt-4">
              {EXERCISE_LIBRARY
                .filter(ex => !selectedMuscleGroup || ex.muscleGroup === selectedMuscleGroup)
                .map(ex => (
                  <div key={ex.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="size-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
                      {ex.illustration}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{ex.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase">{ex.muscleGroup}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedExerciseForLog(ex);
                        setIsGymLogOpen(true);
                      }}
                      className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase"
                    >
                      Add Sets
                    </button>
                  </div>
                ))}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isRoutineSettingsOpen && (
          <RoutineSettingsModal 
            onClose={() => setIsRoutineSettingsOpen(false)} 
            routines={routines}
            stepGoal={profile.stepGoal}
            onUpdateStepGoal={(goal) => updateProfile({ stepGoal: goal })}
            onAddRoutine={addRoutine}
            onRemoveRoutine={deleteRoutine}
            onUpdateRoutine={updateRoutine}
          />
        )}
        {activeActivity && (
          <ActivityTrackingModal 
            activity={activeActivity} 
            onClose={() => setActiveActivity(null)}
            onSave={(tracking) => {
              addActivity(tracking);
              setActiveActivity(null);
            }}
          />
        )}
        {isGymLogOpen && (
          <GymLogModal 
            onClose={() => {
              setIsGymLogOpen(false);
              setSelectedExerciseForLog(null);
            }}
            initialExercise={selectedExerciseForLog}
            onSave={(log) => {
              addGymLog(log);
              setIsGymLogOpen(false);
              setSelectedExerciseForLog(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ActivityButton({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col gap-2 rounded-2xl border border-primary/10 bg-white dark:bg-slate-900 p-4 items-center transition-all hover:bg-primary/5 active:scale-95 shadow-sm"
    >
      <div className="text-primary bg-primary/10 p-3 rounded-full">
        {icon}
      </div>
      <span className="text-slate-800 dark:text-slate-200 text-xs font-bold">{label}</span>
    </button>
  );
}

function GymRoutineEditor({ routine, onBack, onComplete }: { routine: ExerciseRoutine, onBack: () => void, onComplete: (calories: number) => void }) {
  const { addGymLog } = useHealth();
  const [logs, setLogs] = useState<any[]>([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentMuscle, setCurrentMuscle] = useState('Chest');
  const [sets, setSets] = useState<any[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredExercises = EXERCISE_LIBRARY.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([...sets, { weight: lastSet?.weight || 0, reps: lastSet?.reps || 0 }]);
  };

  const finishExercise = () => {
    if (!currentExercise) return;
    setLogs([...logs, { 
      id: Math.random().toString(36).substr(2, 9),
      name: currentExercise, 
      muscle: currentMuscle, 
      sets: [...sets]
    }]);
    setCurrentExercise('');
    setSearchTerm('');
    setSets([]);
  };

  const calculateCalories = () => {
    let totalVolume = 0;
    logs.forEach(log => {
      log.sets.forEach((s: any) => {
        totalVolume += (s.weight || 0) * (s.reps || 0);
      });
    });
    
    const baseCals = 150; 
    const volumeCals = totalVolume * 0.05; 
    
    return Math.round(baseCals + volumeCals);
  };

  const handleComplete = () => {
    const calories = calculateCalories();
    
    // Log each exercise to gymLogs for AI analysis
    logs.forEach(log => {
      addGymLog({
        date: new Date().toISOString(),
        exerciseId: EXERCISE_LIBRARY.find(ex => ex.name === log.name)?.id || 'custom',
        exerciseName: log.name,
        muscleGroup: log.muscle,
        sets: log.sets.map((s: any) => ({
          weight: s.weight,
          reps: s.reps,
          completed: true
        })),
        volume: log.sets.reduce((acc: number, s: any) => acc + (s.weight * s.reps), 0),
        notes: ''
      });
    });

    onComplete(calories);
  };

  const removeLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const updateSetInLog = (logId: string, setIndex: number, field: 'weight' | 'reps', value: number) => {
    setLogs(prev => prev.map(log => {
      if (log.id === logId) {
        const newSets = [...log.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...log, sets: newSets };
      }
      return log;
    }));
  };

  if (isReviewing) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
        <header className="p-4 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsReviewing(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <ArrowLeft className="size-5" />
            </button>
            <h1 className="font-bold">Review Workout</h1>
          </div>
          <button 
            onClick={handleComplete}
            className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Check className="size-4" /> Complete
          </button>
        </header>

        <main className="p-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-primary/10 shadow-sm text-center">
            <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="size-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-1">{calculateCalories()} kcal</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Estimated Burn</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold px-2 flex items-center justify-between">
              <span>Exercises Summary</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Edit values if needed</span>
            </h3>
            {logs.map((log) => (
              <div key={log.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-primary/5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{log.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{log.muscle}</p>
                  </div>
                  <button onClick={() => removeLog(log.id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {log.sets.map((set: any, i: number) => (
                    <div key={i} className="grid grid-cols-3 gap-3 items-center">
                      <span className="text-[10px] font-bold text-slate-400">SET {i+1}</span>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-xs text-center font-bold"
                          value={set.weight}
                          onChange={e => updateSetInLog(log.id, i, 'weight', Number(e.target.value))}
                        />
                        <span className="text-[8px] font-bold text-slate-400">KG</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-xs text-center font-bold"
                          value={set.reps}
                          onChange={e => updateSetInLog(log.id, i, 'reps', Number(e.target.value))}
                        />
                        <span className="text-[8px] font-bold text-slate-400">REPS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsReviewing(false)}
            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold text-sm hover:border-primary hover:text-primary transition-all"
          >
            + Add More Exercises
          </button>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="p-4 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="font-bold">{routine.name}</h1>
        </div>
        <button 
          onClick={() => setIsReviewing(true)}
          disabled={logs.length === 0}
          className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          Finish Workout
        </button>
      </header>

      <main className="p-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-primary/10 shadow-sm">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Plus className="size-4 text-primary" /> Add Exercise
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <div className="relative">
                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search exercise..."
                  value={searchTerm}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentExercise(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>

              {showSuggestions && searchTerm && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl max-h-60 overflow-y-auto no-scrollbar">
                  {filteredExercises.length > 0 ? (
                    filteredExercises.map(ex => (
                      <button
                        key={ex.id}
                        onClick={() => {
                          setCurrentExercise(ex.name);
                          setSearchTerm(ex.name);
                          setCurrentMuscle(ex.muscleGroup);
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none"
                      >
                        <span className="text-lg">{ex.illustration}</span>
                        <div className="text-left">
                          <p className="text-sm font-bold">{ex.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ex.muscleGroup}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="w-full p-4 text-xs text-slate-400 font-bold italic"
                    >
                      No matches found. Use custom name.
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Muscle Group</label>
                <select 
                  value={currentMuscle}
                  onChange={(e) => setCurrentMuscle(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm"
                >
                  {['Chest', 'Back', 'Lower Body', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <button 
                  onClick={addSet}
                  className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:border-primary hover:text-primary transition-colors"
                >
                  + Add Set
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {sets.map((set, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                  <span className="text-[10px] font-bold text-primary w-8">SET {i+1}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Weight"
                      value={set.weight || ''}
                      onChange={(e) => {
                        const newSets = [...sets];
                        newSets[i].weight = Number(e.target.value);
                        setSets(newSets);
                      }}
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-center text-sm font-bold"
                    />
                    <span className="text-[10px] font-bold text-slate-400">kg</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Reps"
                      value={set.reps || ''}
                      onChange={(e) => {
                        const newSets = [...sets];
                        newSets[i].reps = Number(e.target.value);
                        setSets(newSets);
                      }}
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-center text-sm font-bold"
                    />
                    <span className="text-[10px] font-bold text-slate-400">reps</span>
                  </div>
                  <button onClick={() => setSets(sets.filter((_, idx) => idx !== i))} className="p-1 text-slate-300 hover:text-red-400">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={finishExercise}
              disabled={!currentExercise || sets.length === 0}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold disabled:opacity-50 shadow-xl shadow-slate-900/10 dark:shadow-white/5 transition-all active:scale-[0.98]"
            >
              Log Exercise
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold flex items-center gap-2 px-2">
            <History className="size-4 text-slate-400" /> Workout Log
          </h2>
          {logs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Dumbbell className="size-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">No exercises logged yet</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm">{log.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">{log.muscle}</span>
                    <button onClick={() => removeLog(log.id)} className="text-red-400 p-1">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {log.sets.map((s: any, j: number) => (
                    <div key={j} className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                      {s.weight}kg x {s.reps}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </motion.div>
  );
}

function CardioRoutineEditor({ routine, onBack, onComplete }: { routine: ExerciseRoutine, onBack: () => void, onComplete: (activity: ActivityTracking) => void }) {
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const timerRef = useRef<any>(null);

  const startTracking = () => {
    setIsTracking(true);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTracking = () => {
    setIsTracking(false);
    clearInterval(timerRef.current);
  };

  const calculateCalories = () => {
    const rate = routine.type === 'running' ? 10 : routine.type === 'walking' ? 5 : 8;
    return (duration / 60) * rate;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="p-4 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="font-bold">{routine.name}</h1>
        </div>
        {!isTracking && (
          <button 
            onClick={() => onComplete({
              id: Math.random().toString(36).substr(2, 9),
              type: routine.type as ActivityType,
              name: routine.name,
              duration: Math.round(duration / 60),
              distance,
              calories: calculateCalories(),
              startTime: new Date().toISOString(),
              avgSpeed: distance / (duration / 3600) || 0,
              elevation: 0
            })}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
          >
            Save Activity
          </button>
        )}
      </header>

      <main className="p-4 flex flex-col items-center justify-center flex-1 space-y-12">
        <div className="text-center">
          <div className="size-48 rounded-full border-8 border-primary/10 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin" style={{ animationDuration: isTracking ? '2s' : '0s', opacity: isTracking ? 1 : 0 }}></div>
            <span className="text-4xl font-black tracking-tighter">{formatTime(duration)}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-primary/5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Distance</span>
            <div className="flex items-center justify-center gap-1">
              {isTracking ? (
                <span className="text-xl font-bold">{distance.toFixed(2)}</span>
              ) : (
                <input 
                  type="number" 
                  value={distance || ''}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-16 text-xl font-bold bg-transparent text-center border-b border-primary/20 focus:border-primary outline-none"
                />
              )}
              <span className="text-xs font-bold text-slate-400">km</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-primary/5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Calories</span>
            <p className="text-xl font-bold">{Math.round(calculateCalories())} <span className="text-xs font-bold text-slate-400">kcal</span></p>
          </div>
        </div>

        <div className="flex gap-4">
          {!isTracking ? (
            <button 
              onClick={startTracking}
              className="size-20 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
            >
              <Play className="size-8 fill-current" />
            </button>
          ) : (
            <button 
              onClick={stopTracking}
              className="size-20 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 hover:scale-105 transition-transform"
            >
              <Square className="size-8 fill-current" />
            </button>
          )}
        </div>
      </main>
    </motion.div>
  );
}

function TrainingInsights() {
  const { gymLogs, profile } = useHealth();
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsight = async () => {
    if (gymLogs.length === 0) return;
    setIsLoading(true);
    
    const context = `
      User Profile: ${JSON.stringify(profile)}
      Recent Gym Logs (Last 10): ${JSON.stringify(gymLogs.slice(0, 10))}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Analyze my training history and provide a short, actionable insight (max 3 sentences). Focus on muscle group balance, progress, or intensity. Context: ${context}` }] }],
      });
      setInsight(response.text || "Keep pushing your limits!");
    } catch (error) {
      console.error(error);
      setInsight("Focus on consistency to see better results.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateInsight();
  }, [gymLogs.length]);

  if (gymLogs.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-[2.5rem] border border-primary/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Zap className="size-12 text-primary" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="size-6 bg-primary rounded-lg flex items-center justify-center">
          <TrendingUp className="size-3.5 text-white" />
        </div>
        <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Training Insight</h3>
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="size-3 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Analyzing history...</span>
        </div>
      ) : (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
          {insight}
        </p>
      )}
    </div>
  );
}

function OtherRoutineEditor({ routine, onBack, onComplete }: { routine: ExerciseRoutine, onBack: () => void, onComplete: (activity: ActivityTracking) => void }) {
  const [name, setName] = useState(routine.name);
  const [duration, setDuration] = useState(30);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedCalories, setEstimatedCalories] = useState(0);

  const estimateCalories = async () => {
    setIsEstimating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Estimate calories burned for this activity: ${name} for ${duration} minutes. Return ONLY the number.`,
      });
      const kcal = parseInt(response.text.trim()) || 0;
      setEstimatedCalories(kcal);
    } catch (error) {
      console.error(error);
      setEstimatedCalories(duration * 6); 
    } finally {
      setIsEstimating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (name && duration) estimateCalories();
    }, 1000);
    return () => clearTimeout(timer);
  }, [name, duration]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="p-4 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="font-bold">Other Activity</h1>
        </div>
        <button 
          onClick={() => onComplete({
            id: Math.random().toString(36).substr(2, 9),
            type: 'other',
            name,
            duration,
            calories: estimatedCalories,
            startTime: new Date().toISOString(),
            distance: 0,
            avgSpeed: 0,
            elevation: 0
          })}
          className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
        >
          Save Activity
        </button>
      </header>

      <main className="p-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Activity Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-lg font-bold"
              placeholder="e.g. Yoga, Swimming, Tennis"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (minutes)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="5" 
                max="180" 
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-xl font-black text-primary w-16 text-right">{duration}m</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">AI Estimated Burn</span>
              <div className="flex items-center gap-2">
                {isEstimating ? (
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <p className="text-3xl font-black text-emerald-500">{estimatedCalories} <span className="text-xs font-bold opacity-60">kcal</span></p>
                )}
              </div>
            </div>
            <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Zap className="size-6" />
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}

// --- Modals ---

function RoutineSettingsModal({ onClose, routines, stepGoal, onUpdateStepGoal, onAddRoutine, onRemoveRoutine }: any) {
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState('08:00');
  const [newRoutineType, setNewRoutineType] = useState<'walking' | 'running' | 'cycling' | 'gym' | 'steps' | 'other'>('walking');
  const [repeatType, setRepeatType] = useState<'Every day' | 'Monday-Friday' | 'More'>('Every day');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [tempStepGoal, setTempStepGoal] = useState(stepGoal);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAdd = () => {
    if (!newRoutineName.trim()) return;
    
    let repeat: 'Every day' | 'Monday-Friday' | string[] = repeatType === 'More' ? selectedDays : repeatType;
    if (repeatType === 'More' && selectedDays.length === 0) repeat = 'Every day';

    onAddRoutine({
      name: newRoutineName,
      time: newRoutineTime,
      completed: false,
      type: newRoutineType,
      repeat,
      stepGoal: newRoutineType === 'steps' ? tempStepGoal : undefined
    });
    
    if (newRoutineType === 'steps') {
      onUpdateStepGoal(tempStepGoal);
    }
    
    onClose();
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-8 pb-12 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold">Routine Settings</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
            <X className="size-6" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Routine Type Selection */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 px-1">Routine Type</h4>
            <div className="grid grid-cols-3 gap-2">
              {['steps', 'walking', 'running', 'cycling', 'gym', 'other'].map((type) => (
                <button
                  key={type}
                  onClick={() => setNewRoutineType(type as any)}
                  className={`py-3 rounded-2xl text-xs font-bold capitalize transition-all border-2 ${
                    newRoutineType === type 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Step Goal - Only if Steps is selected */}
          {newRoutineType === 'steps' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400">Step Goal</h4>
                <span className="text-xl font-black text-primary">{tempStepGoal.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="30000" 
                step="500" 
                value={tempStepGoal} 
                onChange={(e) => setTempStepGoal(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                <span>1,000</span>
                <span>30,000</span>
              </div>
            </div>
          )}

          {/* Routine Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 px-1">Routine Details</h4>
            <input 
              type="text" 
              placeholder="Routine Name (e.g. Morning Run)" 
              value={newRoutineName}
              onChange={(e) => setNewRoutineName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-5 text-sm font-bold"
            />
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-5">
              <Clock className="size-5 text-slate-400" />
              <input 
                type="time" 
                value={newRoutineTime}
                onChange={(e) => setNewRoutineTime(e.target.value)}
                className="bg-transparent border-none text-sm font-bold flex-1 focus:ring-0"
              />
            </div>
          </div>

          {/* Repeat Settings */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 px-1">Repeat</h4>
            <div className="flex gap-2">
              {['Every day', 'Monday-Friday', 'More'].map((type) => (
                <button
                  key={type}
                  onClick={() => setRepeatType(type as any)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${
                    repeatType === type 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {repeatType === 'More' && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${
                      selectedDays.includes(day)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Routines */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 px-1">Scheduled Routines</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
              {routines.map((r: ExerciseRoutine) => (
                <div key={r.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      {r.type === 'gym' ? <FitnessCenter className="size-5" /> : <Walk className="size-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{r.name}</p>
                      <p className="text-[10px] text-slate-500">{r.time} • {Array.isArray(r.repeat) ? r.repeat.map(d => d.slice(0, 3)).join(', ') : r.repeat}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveRoutine(r.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            Save Routine
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ActivityTrackingModal({ activity, onClose, onSave }: any) {
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
        // Mock distance increase
        setDistance(prev => prev + 0.0015);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const avgSpeed = elapsed > 0 ? (distance / (elapsed / 3600)) : 0;
  const calories = distance * 60; // Mock calculation

  const handleFinish = () => {
    onSave({
      ...activity,
      duration: elapsed,
      distance: parseFloat(distance.toFixed(2)),
      avgSpeed: parseFloat(avgSpeed.toFixed(1)),
      calories: Math.round(calories),
      endTime: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-[110] bg-primary flex flex-col p-8 text-white">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
            <Walk className="size-6" />
          </div>
          <h3 className="text-xl font-bold capitalize">{activity.type}</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10">
          <X className="size-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">Duration</p>
          <h2 className="text-7xl font-black tabular-nums">{formatTime(elapsed)}</h2>
        </div>

        <div className="grid grid-cols-2 w-full gap-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Distance</p>
            <p className="text-3xl font-black">{distance.toFixed(2)} <span className="text-sm font-bold opacity-60">km</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Avg Speed</p>
            <p className="text-3xl font-black">{avgSpeed.toFixed(1)} <span className="text-sm font-bold opacity-60">km/h</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Calories</p>
            <p className="text-3xl font-black">{Math.round(calories)} <span className="text-sm font-bold opacity-60">kcal</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Elevation</p>
            <p className="text-3xl font-black">12 <span className="text-sm font-bold opacity-60">m</span></p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-12">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="size-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          {isPaused ? <Play className="size-8 fill-white" /> : <Timer className="size-8" />}
        </button>
        <button 
          onClick={handleFinish}
          className="size-24 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-transform"
        >
          <Square className="size-10 fill-primary" />
        </button>
      </div>
    </div>
  );
}

function GymLogModal({ onClose, onSave, initialExercise }: any) {
  const [selectedExercise, setSelectedExercise] = useState<GymExercise | null>(initialExercise || null);
  const [sets, setSets] = useState<GymSet[]>([{ weight: 0, reps: 0 }]);
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);

  const handleAddSet = () => {
    setSets([...sets, { weight: sets[sets.length - 1].weight, reps: sets[sets.length - 1].reps }]);
  };

  const handleUpdateSet = (index: number, field: keyof GymSet, value: number) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const handleSave = () => {
    if (!selectedExercise) return;
    
    // Calculate estimated calories: (total weight * reps) * 0.05
    const totalWeight = sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
    const caloriesBurned = Math.round(totalWeight * 0.05);

    onSave({
      date: new Date().toISOString(),
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      muscleGroup: selectedExercise.muscleGroup,
      sets,
      caloriesBurned
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-8 pb-12 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold">{selectedExercise ? 'Log Sets' : 'Select Exercise'}</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
            <X className="size-6" />
          </button>
        </div>

        {!selectedExercise ? (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
              {['All', 'Lower Body', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(group => (
                <button 
                  key={group}
                  onClick={() => setMuscleGroup(group === 'All' ? null : group)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    (muscleGroup === group || (group === 'All' && !muscleGroup))
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {EXERCISE_LIBRARY
                .filter(ex => !muscleGroup || ex.muscleGroup === muscleGroup)
                .map(ex => (
                  <button 
                    key={ex.id}
                    onClick={() => setSelectedExercise(ex)}
                    className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="size-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-xl shadow-sm">
                      {ex.illustration}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{ex.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{ex.muscleGroup}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl">
              <div className="size-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                {selectedExercise.illustration}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg leading-tight">{selectedExercise.name}</h4>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">{selectedExercise.muscleGroup}</p>
                <p className="text-[10px] text-slate-500 mt-1">{selectedExercise.equipment}</p>
              </div>
              {!initialExercise && (
                <button onClick={() => setSelectedExercise(null)} className="text-xs font-bold text-primary uppercase">Change</button>
              )}
            </div>

            <div className="space-y-4">
              {sets.map((set, index) => (
                <div key={index} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weight (kg)</label>
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        onChange={(e) => handleUpdateSet(index, 'weight', parseFloat(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border-none rounded-xl py-2 px-3 text-sm font-bold"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Reps</label>
                      <input 
                        type="number" 
                        value={set.reps || ''} 
                        onChange={(e) => handleUpdateSet(index, 'reps', parseInt(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border-none rounded-xl py-2 px-3 text-sm font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {sets.length > 1 && (
                    <button 
                      onClick={() => setSets(sets.filter((_, i) => i !== index))}
                      className="text-slate-300 hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={handleAddSet}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 font-bold text-sm hover:border-primary hover:text-primary transition-all"
              >
                + Add Set
              </button>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform"
            >
              Finish Exercise
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
