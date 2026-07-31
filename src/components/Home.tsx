import { 
  Bell, 
  Beef, 
  FitnessCenter, 
  Droplets, 
  Footprints, 
  Medication, 
  Calendar, 
  Walk, 
  Lightbulb, 
  Dumbbell, 
  Stethoscope, 
  Flame, 
  ChevronRight, 
  Sparkles, 
  Utensils, 
  X, 
  TrendingUp, 
  Check, 
  Brain,
  ArrowLeft,
  CheckCircle2,
  Loader2
} from './Icons';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useHealth } from '../context/HealthContext';
import { cn } from '../lib/utils';
import { GoogleGenAI, Type } from "@google/genai";
import { MentalHealthResponse } from '../types';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function Home() {
  const navigate = useNavigate();
  const { 
    getTodayValue, 
    profile, 
    goals,
    avatar, 
    notifications, 
    events, 
    markNotificationRead, 
    dismissNotification,
    dismissedNotificationIds,
    getDailyWaterTarget, 
    getFatLossEstimation,
    getDailyCalorieTarget,
    getProteinTarget,
    mentalHealthScore,
    isDayEnded,
    meals,
    routines,
    historyRecords,
    insights
  } = useHealth();
  
  const [view, setView] = useState<'main' | 'mental'>('main');

  const todaySteps = getTodayValue('steps');
  const todayCalories = meals.filter(m => new Date(m.date).toDateString() === new Date().toDateString())
    .reduce((sum, m) => sum + m.calories, 0);
  const dailyCalorieTarget = getDailyCalorieTarget();

  const healthScore = getTodayValue('healthScore');
  const calories = getTodayValue('calories');
  const protein = getTodayValue('protein');
  const water = getTodayValue('hydration');
  const steps = getTodayValue('steps');

  const calorieTarget = getDailyCalorieTarget();
  const waterTarget = getDailyWaterTarget();
  const proteinTarget = getProteinTarget();
  const { deficit, fatLossKg, status } = getFatLossEstimation();

  const unreadCount = notifications.filter(n => !n.read && !dismissedNotificationIds.includes(n.id)).length;
  const visibleNotifications = notifications
    .filter(n => !dismissedNotificationIds.includes(n.id))
    .slice(0, 2);
  const todayEvents = events.filter(e => new Date(e.date).toDateString() === new Date().toDateString());

  const stressManagementGoal = goals.find(g => g.id === 'g12' && g.selected);
  const mentalHealthGoal = goals.find(g => g.id === 'g15' && g.selected);

  // Goal completion logic
  const isCalorieGoalMet = isDayEnded && (
    (goals.find(g => g.id === 'g1' && g.selected) ? calories >= calorieTarget : calories <= calorieTarget)
  );
  const isProteinGoalMet = isDayEnded && protein >= proteinTarget;
  const isWaterGoalMet = isDayEnded && water >= waterTarget;
  const isStepsGoalMet = isDayEnded && steps >= profile.stepGoal;

  const isCalorieMissed = isDayEnded && !isCalorieGoalMet;
  const isProteinMissed = isDayEnded && !isProteinGoalMet;
  const isWaterMissed = isDayEnded && !isWaterGoalMet;
  const isStepsMissed = isDayEnded && !isStepsGoalMet;

  if (view === 'mental') {
    return <MentalWellBeing onBack={() => setView('main')} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col pb-24"
    >
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/profile')}
            className="size-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary overflow-hidden transition-transform active:scale-90"
          >
            {avatar ? (
              <img className="w-full h-full object-cover" src={avatar} alt="Profile" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-primary font-bold">{profile.name.substring(0, 2).toUpperCase()}</div>
            )}
          </button>
          <button 
            onClick={() => navigate('/calendar')}
            className="text-left transition-opacity active:opacity-60"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold leading-tight">Good morning, {profile.name.split(' ')[0]} 👋</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              <ChevronRight className="size-3" />
            </p>
          </button>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="size-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 relative"
        >
          <Bell className="size-5 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Notifications Section */}
      {visibleNotifications.length > 0 && (
        <section className="px-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Notifications</h3>
            <button 
              onClick={() => visibleNotifications.forEach(n => dismissNotification(n.id))}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {visibleNotifications.map(n => (
              <div key={n.id} className="relative group">
                <button
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.targetPath) navigate(n.targetPath);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all active:scale-[0.98]",
                    n.read ? "bg-slate-50/50 border-slate-100 opacity-60" : "bg-primary/5 border-primary/20 shadow-sm"
                  )}
                >
                  <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{n.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{n.description}</p>
                  </div>
                  <ChevronRight className="size-3 text-slate-300" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(n.id);
                  }}
                  className="absolute -top-1 -right-1 size-5 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center border border-white dark:border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3 text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Health Score */}
      <section className="px-6 mb-6">
        <button 
          onClick={() => setView('mental')}
          className="w-full text-left bg-white dark:bg-slate-900 p-6 rounded-3xl border border-primary/10 shadow-sm flex items-center justify-between group transition-all hover:bg-primary/5"
        >
          <div className="flex-1">
            <h2 className="text-lg font-bold">Health Score</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Excellent! You're in the top 15% of your age group.</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-primary">
              Improve your score <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="relative flex items-center justify-center size-24">
            <svg className="size-24 transform -rotate-90">
              <circle className="text-slate-100 dark:text-slate-800" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="10"></circle>
              <circle 
                className="text-primary transition-all duration-1000" 
                cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black leading-none">{healthScore}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">/100</span>
            </div>
          </div>
        </button>
      </section>

      {/* Mental Health Score (Conditional) */}
      {(stressManagementGoal || mentalHealthGoal) && (
        <section className="px-6 mb-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setView('mental')}
            className={cn(
              "p-6 rounded-3xl border flex flex-col gap-4 cursor-pointer transition-all hover:shadow-md",
              mentalHealthScore < 65 
                ? "bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20" 
                : "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/20"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center",
                  mentalHealthScore < 65 ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"
                )}>
                  <Brain className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Mental Well-being</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weekly Average</p>
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-2xl font-black",
                  mentalHealthScore < 65 ? "text-rose-500" : "text-indigo-500"
                )}>{mentalHealthScore}%</span>
              </div>
            </div>

            <div className="h-2 w-full bg-white/50 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${mentalHealthScore}%` }}
                className={cn(
                  "h-full rounded-full",
                  mentalHealthScore < 65 ? "bg-rose-500" : "bg-indigo-500"
                )}
              />
            </div>

            {mentalHealthScore < 65 ? (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
                It looks like you've been under more stress lately. Remember to take deep breaths and prioritize your rest. You're doing great! 💙
              </p>
            ) : (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium leading-relaxed">
                Your mental resilience is strong! Keep maintaining your healthy routines and mindfulness practices.
              </p>
            ) }
          </motion.div>
        </section>
      )}

      {/* Daily Goals */}
      <section className="px-6 mb-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Daily Goals</h3>
          </div>
          <div className="space-y-4">
            <GoalItem 
              onClick={() => navigate('/nutrition')}
              icon={<Flame className="size-4 text-orange-500" />} 
              label="Calories" 
              current={Math.round(calories)} 
              target={Math.round(calorieTarget)} 
              unit="kcal" 
              color="bg-orange-500" 
              isCompleted={isCalorieGoalMet}
              isMissed={isCalorieMissed}
            />
            
            {/* Fat Loss Trend bar repositioned */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-secondary flex items-center gap-2">
                  <TrendingUp className="size-4" /> Fat Loss Trend
                </span>
                <span className="text-slate-500 font-bold uppercase text-[10px]">{status}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (fatLossKg / 0.1) * 100)}%` }}
                  className="h-full bg-secondary rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 italic">
                <span>Based on activity & nutrition</span>
                <span>{fatLossKg.toFixed(3)} kg est.</span>
              </div>
            </div>

            <GoalItem 
              onClick={() => navigate('/nutrition')}
              icon={<Beef className="size-4 text-blue-500" />} 
              label="Protein" 
              current={Math.round(protein)} 
              target={proteinTarget} 
              unit="g" 
              color="bg-blue-500" 
              isCompleted={isProteinGoalMet}
              isMissed={isProteinMissed}
            />
            <GoalItem 
              onClick={() => navigate('/metric/hydration')}
              icon={<Droplets className="size-4 text-cyan-500" />} 
              label="Water" 
              current={water.toFixed(1)} 
              target={waterTarget.toFixed(1)} 
              unit="L" 
              color="bg-cyan-500" 
              isCompleted={isWaterGoalMet}
              isMissed={isWaterMissed}
            />
            <GoalItem 
              onClick={() => navigate('/metric/steps')}
              icon={<Footprints className="size-4 text-emerald-500" />} 
              label="Steps" 
              current={steps} 
              target={profile.stepGoal} 
              unit="" 
              color="bg-emerald-500" 
              isCompleted={isStepsGoalMet}
              isMissed={isStepsMissed}
            />
          </div>
        </div>
      </section>

      {/* Daily Agenda */}
      <section className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">Daily Agenda</h3>
          <button onClick={() => navigate('/calendar')} className="text-xs text-primary font-bold">Manage</button>
        </div>
        <div className="space-y-3">
          {todayEvents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400">No events scheduled for today</p>
            </div>
          ) : (
            todayEvents.map(event => (
              <AgendaItem 
                key={event.id}
                onClick={() => navigate('/calendar')}
                icon={
                  event.type === 'medical' ? <Stethoscope className="size-5 text-blue-600" /> :
                  event.type === 'workout' ? <Walk className="size-5 text-emerald-600" /> :
                  event.type === 'medication' ? <Medication className="size-5 text-red-600" /> :
                  <Utensils className="size-5 text-orange-600" />
                } 
                title={event.title} 
                desc={event.description} 
                time={event.time} 
                bgColor={
                  event.type === 'medical' ? "bg-blue-100" :
                  event.type === 'workout' ? "bg-emerald-100" :
                  event.type === 'medication' ? "bg-red-100" :
                  "bg-orange-100"
                } 
              />
            ))
          )}
        </div>
      </section>

      {/* Smart Insights */}
      <section className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">Smart Insights</h3>
          <button onClick={() => navigate('/insights')} className="text-xs text-primary font-bold">View All</button>
        </div>
        <div className="space-y-3">
          {insights.slice(0, 3).map(insight => (
            <button 
              key={insight.id}
              onClick={() => navigate('/insights')}
              className="w-full text-left bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4 transition-transform active:scale-[0.98]"
            >
              <div className={cn(
                "size-10 rounded-lg flex items-center justify-center shrink-0",
                insight.category === 'Nutrition' ? "bg-orange-100 text-orange-600" :
                insight.category === 'Fitness' ? "bg-emerald-100 text-emerald-600" :
                insight.category === 'Health' ? "bg-blue-100 text-blue-600" :
                "bg-indigo-100 text-indigo-600"
              )}>
                {insight.category === 'Nutrition' ? <Utensils className="size-5" /> :
                 insight.category === 'Fitness' ? <Dumbbell className="size-5" /> :
                 insight.category === 'Health' ? <Stethoscope className="size-5" /> :
                 <Brain className="size-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{insight.category} Insight</span>
                  {insight.type === 'warning' && <span className="size-1.5 rounded-full bg-red-500" />}
                </div>
                <h4 className="font-bold text-sm">{insight.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{insight.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Daily Agenda */}
      <section className="px-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Daily Agenda</h3>
        <div className="space-y-3">
          <AgendaItem 
            icon={<Utensils className="size-5 text-orange-500" />}
            title="Breakfast"
            time="08:00 AM"
            status="completed"
          />
          <AgendaItem 
            icon={<Dumbbell className="size-5 text-emerald-500" />}
            title="Workout"
            time="10:30 AM"
            status="pending"
          />
          <AgendaItem 
            icon={<Brain className="size-5 text-indigo-500" />}
            title="Meditation"
            time="06:00 PM"
            status="pending"
          />
        </div>
      </section>

      <MentalWellBeing onBack={() => setView('main')} />
      
      <div className="h-24" />
    </motion.div>
  );
}

function MentalWellBeing({ onBack }: { onBack: () => void }) {
  const { profile, addMentalHealthResponse, routines, historyRecords, goals } = useHealth();
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [questions, setQuestions] = useState<{ id: string; text: string; options: { label: string; value: number }[] }[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const model = "gemini-3-flash-preview";
      
      // Prepare context for AI
      const context = {
        goals: goals?.filter(g => g.selected).map(g => g.title),
        recentExercises: routines.slice(0, 3).map(r => r.name),
        recentMedical: historyRecords.slice(0, 2).map(h => 
          'conditionName' in h ? h.conditionName : 
          'examName' in h ? h.examName : 
          'doctorName' in h ? h.doctorName : h.category
        ),
        lastMentalScore: profile.mentalHealthHistory?.[0]?.score
      };

      const prompt = `Generate 5 adaptive mental well-being questions for a health app. 
      Context: ${JSON.stringify(context)}.
      The questions should be empathetic and relevant to the user's current health journey.
      Return a JSON array of objects with: id, text, and 4 options (label and value 1-10).`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.NUMBER }
                    },
                    required: ["label", "value"]
                  }
                }
              },
              required: ["id", "text", "options"]
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setQuestions(data);
      setStep('quiz');
    } catch (error) {
      console.error("Error generating questions:", error);
      // Fallback questions
      setQuestions([
        { id: '1', text: 'How would you rate your overall mood today?', options: [{label: 'Great', value: 10}, {label: 'Good', value: 7}, {label: 'Okay', value: 5}, {label: 'Not good', value: 2}] },
        { id: '2', text: 'How well did you sleep last night?', options: [{label: 'Perfectly', value: 10}, {label: 'Well', value: 7}, {label: 'Interrupted', value: 4}, {label: 'Barely slept', value: 1}] },
        { id: '3', text: 'How stressed have you felt today?', options: [{label: 'Not at all', value: 10}, {label: 'Mildly', value: 7}, {label: 'Moderately', value: 4}, {label: 'Extremely', value: 1}] },
      ]);
      setStep('quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setAnalyzing(true);
    const totalScore = Object.values(answers).reduce((a: number, b: number) => a + b, 0);
    const maxScore = questions.length * 10;
    const finalScore = Math.round(((totalScore as number) / (maxScore as number)) * 100);

    const mentalResponse: Omit<MentalHealthResponse, 'id'> = {
      date: new Date().toISOString(),
      answers: questions.map(q => ({
        questionId: q.id,
        question: q.text,
        answer: answers[q.id]
      })),
      score: finalScore
    };

    addMentalHealthResponse(mentalResponse);

    try {
      const model = "gemini-3-flash-preview";
      const prompt = `Based on these mental health quiz results (Score: ${finalScore}/100) and answers: ${JSON.stringify(mentalResponse.answers)}, provide a short, supportive, and actionable insight (max 3 sentences).`;
      
      const response = await genAI.models.generateContent({
        model,
        contents: prompt
      });
      setAiInsight(response.text);
    } catch (error) {
      setAiInsight("Great job completing your check-in! Consistency is key to maintaining your well-being.");
    } finally {
      setAnalyzing(false);
      setStep('result');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="p-6 flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-xl font-bold">Mental Well-being</h1>
      </header>

      <main className="px-6">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="size-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="size-12 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">How are you feeling?</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Take a quick, AI-powered check-in to track your mental resilience and get personalized insights.
              </p>
              <button 
                onClick={generateQuestions}
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
                {loading ? 'Preparing your check-in...' : 'Start Check-in'}
              </button>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Question {Object.keys(answers).length + 1} of {questions.length}
                </span>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1 w-6 rounded-full transition-colors",
                        i < Object.keys(answers).length ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                      )} 
                    />
                  ))}
                </div>
              </div>

              {questions.map((q, idx) => {
                if (idx !== Object.keys(answers).length) return null;
                return (
                  <div key={q.id} className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {q.text}
                    </h3>
                    <div className="grid gap-3">
                      {q.options.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                          className="w-full p-5 text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary transition-colors flex items-center justify-between group"
                        >
                          <span className="font-medium">{opt.label}</span>
                          <div className="size-5 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-primary transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {Object.keys(answers).length === questions.length && (
                <button 
                  onClick={handleFinish}
                  disabled={analyzing}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  {analyzing ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
                  {analyzing ? 'Analyzing results...' : 'Finish Check-in'}
                </button>
              )}
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="relative size-48 mx-auto mb-8">
                <svg className="size-48 transform -rotate-90">
                  <circle className="text-slate-100 dark:text-slate-800" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
                  <circle 
                    className="text-indigo-500 transition-all duration-1000" 
                    cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"
                    strokeDasharray="502.4"
                    strokeDashoffset={502.4 - (502.4 * (profile.mentalHealthHistory?.[0]?.score || 0)) / 100}
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-indigo-600">{profile.mentalHealthHistory?.[0]?.score}%</span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Resilience</span>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 mb-8 text-left">
                <div className="flex items-center gap-2 mb-3 text-indigo-600">
                  <Sparkles className="size-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">AI Insight</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{aiInsight}"
                </p>
              </div>

              <button 
                onClick={onBack}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

function GoalItem({ icon, label, current, target, unit, color, onClick, isCompleted, isMissed }: any) {
  const progress = Math.min(100, (current / target) * 100);
  return (
    <button onClick={onClick} className="w-full text-left group">
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-medium flex items-center gap-2 group-hover:text-primary transition-colors">
            {icon} {label}
            {isCompleted && <Check className="size-3 text-emerald-500 font-bold" />}
            {isMissed && <X className="size-3 text-red-500 font-bold" />}
          </span>
          <span className={cn(
            "text-slate-500", 
            isCompleted && "text-emerald-500 font-bold",
            isMissed && "text-red-500 font-bold"
          )}>
            {current}{unit} / {target}{unit}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCompleted ? "bg-emerald-500" : (isMissed ? "bg-red-500" : color)
            )} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </button>
  );
}

interface AgendaItemProps {
  key?: any;
  icon: React.ReactNode; 
  title: string; 
  time: string; 
  status?: 'completed' | 'pending';
  desc?: string;
  bgColor?: string;
  onClick?: () => void;
}

function AgendaItem({ 
  icon, 
  title, 
  time, 
  status, 
  desc, 
  bgColor, 
  onClick 
}: AgendaItemProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "size-10 rounded-xl flex items-center justify-center",
          bgColor || (status === 'completed' ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-50 dark:bg-slate-800")
        )}>
          {icon}
        </div>
        <div className="text-left">
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-xs text-slate-500">{desc || time}</p>
        </div>
      </div>
      {status ? (
        status === 'completed' ? (
          <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="size-4 text-white" />
          </div>
        ) : (
          <div className="size-6 rounded-full border-2 border-slate-200 dark:border-slate-700" />
        )
      ) : (
        <ChevronRight className="size-4 text-slate-400" />
      )}
    </button>
  );
}
