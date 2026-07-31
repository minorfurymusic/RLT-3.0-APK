import React, { useState, useRef } from 'react';
import { Menu, Bell, Camera, Edit3, Sparkles, ChevronRight, Plus, X, Trash2, Loader2, Check } from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import { useHealth } from '../context/HealthContext';
import { Meal } from '../types';
import { GoogleGenAI } from "@google/genai";

export default function Nutrition() {
  const { meals, addMeal, updateMeal, deleteMeal, getTodayValue, getDailyCalorieTarget, isDayEnded, endDay, reopenDay } = useHealth();
  const [view, setView] = useState<'main' | 'history' | 'daily'>('main');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealInput, setMealInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calories = getTodayValue('calories');
  const proteinValue = getTodayValue('protein');
  const targetCalories = Math.round(getDailyCalorieTarget());
  const targetProtein = 150;
  const progress = (calories / targetCalories) * 100;

  const handleAnalyzeMeal = async () => {
    if (!mealInput && !selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      let prompt = "Analyze this meal and return a JSON object with the following fields: calories (number), protein (number), carbs (number), fat (number), description (string), portionSize (string). ";
      if (mealInput) prompt += `Meal description: ${mealInput}`;
      
      let response;
      if (selectedImage) {
        const base64Data = selectedImage.split(',')[1];
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          },
          config: { responseMimeType: "application/json" }
        });
      } else {
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
      }

      const result = JSON.parse(response.text || '{}');
      
      const newMeal: Omit<Meal, 'id'> = {
        description: result.description || mealInput || 'New Meal',
        type: 'Lunch', // Default or detected
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString(),
        calories: result.calories || 0,
        protein: result.protein || 0,
        carbs: result.carbs || 0,
        fat: result.fat || 0,
        portionSize: result.portionSize || '1 serving',
        imageUrl: selectedImage || undefined
      };

      addMeal(newMeal);
      setIsAddingMeal(false);
      setMealInput('');
      setSelectedImage(null);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const todayMeals = meals.filter(m => new Date(m.date).toDateString() === new Date().toDateString());

  if (view === 'history') {
    return <NutritionHistory onBack={() => setView('main')} onSelectDay={(date) => { setSelectedDate(date); setView('daily'); }} meals={meals} />;
  }

  if (view === 'daily') {
    return <DailyNutritionDetail date={selectedDate} onBack={() => setView('main')} meals={meals} onDelete={deleteMeal} onUpdate={updateMeal} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col pb-24"
    >
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 border-b border-primary/10">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold tracking-tight">Nutrition</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Daily Macro Overview</h2>
            <div className="flex items-center gap-2">
              {isDayEnded ? (
                <button 
                  onClick={reopenDay}
                  className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-500/20 transition-colors"
                >
                  <Check className="size-3" /> Day Ended (Reopen)
                </button>
              ) : (
                <button 
                  onClick={endDay}
                  className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  End Day
                </button>
              )}
              <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Today</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-primary/5 shadow-sm flex items-center gap-6">
              <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                <svg className="h-full w-full transform -rotate-90">
                  <circle className="text-primary/10" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="8"></circle>
                  <circle 
                    className="text-primary" 
                    cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="8"
                    strokeDasharray="213.6"
                    strokeDashoffset={213.6 - (213.6 * progress) / 100}
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-bold leading-none">{Math.round(calories)}</span>
                  <span className="text-[10px] opacity-60">kcal</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-semibold">Calories</span>
                  <span className="text-xs text-slate-500">Target: {targetCalories}</span>
                </div>
                <div className="text-xs text-slate-400">{Math.max(0, targetCalories - Math.round(calories))} kcal remaining</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MacroCard label="Protein" current={`${Math.round(proteinValue)}g`} target={`${targetProtein}g`} progress={(proteinValue / targetProtein) * 100} />
              <MacroCard label="Carbs" current={`${Math.round(todayMeals.reduce((s, m) => s + m.carbs, 0))}g`} target="250g" progress={(todayMeals.reduce((s, m) => s + m.carbs, 0) / 250) * 100} />
              <MacroCard label="Fat" current={`${Math.round(todayMeals.reduce((s, m) => s + m.fat, 0))}g`} target="70g" progress={(todayMeals.reduce((s, m) => s + m.fat, 0) / 70) * 100} />
              <MacroCard label="Fiber" current="25g" target="35g" progress={71} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Add Meal</h2>
          {isDayEnded ? (
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500">Day has been ended. No more meals can be logged today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setIsAddingMeal(true);
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                className="flex flex-col items-center justify-center p-6 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                <Camera className="size-8 mb-2" />
                <span className="text-sm font-semibold">Take Photo</span>
              </button>
              <button 
                onClick={() => setIsAddingMeal(true)}
                className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 border border-primary/20 rounded-xl hover:scale-[1.02] transition-transform"
              >
                <Edit3 className="size-8 mb-2 text-primary" />
                <span className="text-sm font-semibold">Type Description</span>
              </button>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Today's Meals</h2>
          </div>
          <div className="space-y-3">
            {todayMeals.length > 0 ? (
              todayMeals.map(meal => (
                <MealItem 
                  key={meal.id}
                  meal={meal}
                  onDelete={() => deleteMeal(meal.id)}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500">No meals logged today</p>
              </div>
            )}
          </div>
        </section>
        {/* Macro History */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Macro History</h2>
            <button 
              onClick={() => setView('history')}
              className="text-xs font-bold text-primary flex items-center gap-1"
            >
              View All <ChevronRight className="size-3" />
            </button>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map(daysAgo => {
              const date = new Date();
              date.setDate(date.getDate() - daysAgo);
              const dayMeals = meals.filter(m => new Date(m.date).toDateString() === date.toDateString());
              const dayCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
              const dayProtein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
              const dayCarbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
              const dayFat = dayMeals.reduce((sum, m) => sum + m.fat, 0);

              return (
                <div 
                  key={daysAgo}
                  onClick={() => {
                    setSelectedDate(date.toISOString());
                    setView('daily');
                  }}
                  className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-primary/5 shadow-sm flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="flex gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{Math.round(dayCalories)}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">kcal</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{Math.round(dayProtein)}g</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Prot</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{Math.round(dayCarbs)}g</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Carb</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{Math.round(dayFat)}g</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Fat</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isAddingMeal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Log New Meal</h3>
                  <button onClick={() => setIsAddingMeal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X className="size-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <textarea 
                      value={mealInput}
                      onChange={(e) => setMealInput(e.target.value)}
                      placeholder="What did you eat? (e.g., 2 eggs and toast)"
                      className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm"
                      >
                        <Camera className="size-5 text-primary" />
                      </button>
                    </div>
                  </div>

                  {selectedImage && (
                    <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={selectedImage} className="w-full h-full object-cover" alt="Meal preview" />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full backdrop-blur-md"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )}

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <button 
                    onClick={handleAnalyzeMeal}
                    disabled={isAnalyzing || (!mealInput && !selectedImage)}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5" />
                        Analyze & Log Meal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NutritionHistory({ onBack, onSelectDay, meals }: { onBack: () => void, onSelectDay: (date: string) => void, meals: Meal[] }) {
  // Group meals by day
  const days = Array.from(new Set(meals.map(m => new Date(m.date).toDateString())))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col pb-24"
    >
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 border-b border-primary/10 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ChevronRight className="size-6 rotate-180" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Macro History</h1>
      </header>

      <main className="p-4 space-y-3">
        {days.map(dayStr => {
          const date = new Date(dayStr);
          const dayMeals = meals.filter(m => new Date(m.date).toDateString() === dayStr);
          const dayCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
          const dayProtein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
          const dayCarbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
          const dayFat = dayMeals.reduce((sum, m) => sum + m.fat, 0);

          return (
            <div 
              key={dayStr}
              onClick={() => onSelectDay(date.toISOString())}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-primary/5 shadow-sm flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer group"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{Math.round(dayCalories)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">kcal</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{Math.round(dayProtein)}g</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Prot</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{Math.round(dayCarbs)}g</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Carb</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{Math.round(dayFat)}g</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Fat</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
          );
        })}
      </main>
    </motion.div>
  );
}

function DailyNutritionDetail({ date, onBack, meals, onDelete, onUpdate }: { 
  date: string, 
  onBack: () => void, 
  meals: Meal[], 
  onDelete: (id: string) => void,
  onUpdate: (id: string, data: Partial<Meal>) => void
}) {
  const dayDate = new Date(date);
  const dayMeals = meals.filter(m => new Date(m.date).toDateString() === dayDate.toDateString());
  
  const totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = dayMeals.reduce((sum, m) => sum + m.fat, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col pb-24"
    >
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 border-b border-primary/10 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ChevronRight className="size-6 rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Daily Details</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {dayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-primary/5 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Total Calories</span>
            <p className="text-2xl font-black text-primary">{Math.round(totalCalories)} <span className="text-xs font-bold opacity-60">kcal</span></p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-primary/5 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Total Protein</span>
            <p className="text-2xl font-black text-blue-500">{Math.round(totalProtein)} <span className="text-xs font-bold opacity-60">g</span></p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-primary/5 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Total Carbs</span>
            <p className="text-2xl font-black text-amber-500">{Math.round(totalCarbs)} <span className="text-xs font-bold opacity-60">g</span></p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-primary/5 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Total Fat</span>
            <p className="text-2xl font-black text-emerald-500">{Math.round(totalFat)} <span className="text-xs font-bold opacity-60">g</span></p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">Meals</h2>
          <div className="space-y-3">
            {dayMeals.length > 0 ? (
              dayMeals.map(meal => (
                <MealItem 
                  key={meal.id}
                  meal={meal}
                  onDelete={() => onDelete(meal.id)}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500">No meals logged for this day</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </motion.div>
  );
}

function MacroCard({ label, current, target, progress }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-primary/5">
      <div className="flex justify-between text-xs mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-primary">{current}/{target}</span>
      </div>
      <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
        <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }}></div>
      </div>
    </div>
  );
}

function MealItem({ meal, onDelete }: any) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-primary/5 group">
      <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700">
        {meal.imageUrl ? (
          <img className="h-full w-full object-cover" src={meal.imageUrl} alt={meal.description} referrerPolicy="no-referrer" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Edit3 className="size-6 text-slate-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold truncate">{meal.description}</h4>
        <p className="text-xs text-slate-500">{meal.type} • {meal.time}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{meal.calories} kcal</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{meal.protein}g Protein</span>
        </div>
      </div>
      <button 
        onClick={onDelete}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
      >
        <Trash2 className="size-5" />
      </button>
    </div>
  );
}
