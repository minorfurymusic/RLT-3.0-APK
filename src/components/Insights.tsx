import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lightbulb, ChevronRight, Sparkles, Activity, Utensils, Clock, Dumbbell, Heart, Brain, Zap } from './Icons';
import { cn } from '../lib/utils';
import { useHealth } from '../context/HealthContext';

export default function Insights() {
  const navigate = useNavigate();
  const { goals, userProfile } = useHealth();

  const dynamicInsights = useMemo(() => {
    const list = [];
    
    // Muscle Gain Insights
    const muscleGainGoal = goals.find(g => g.id === 'muscle-gain');
    if (muscleGainGoal?.selectedOption === 'Yes') {
      list.push({
        id: 'muscle-1',
        title: 'Hypertrophy Strategy',
        content: 'Focus on 8-12 reps per set with progressive overload. Aim for 1.8g of protein per kg of body weight.',
        icon: <Dumbbell className="size-5" />,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
      });
      list.push({
        id: 'muscle-2',
        title: 'Training Frequency',
        content: 'For optimal muscle growth, hit each muscle group 2 times per week with at least 48h rest between.',
        icon: <Activity className="size-5" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
      });
    }

    // Endurance Insights
    const enduranceGoal = goals.find(g => g.id === 'endurance');
    if (enduranceGoal?.selectedOption === 'Yes') {
      list.push({
        id: 'endurance-1',
        title: 'Cardio Progression',
        content: 'Increase your weekly running distance by no more than 10% to prevent overuse injuries.',
        icon: <Zap className="size-5" />,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
      });
      list.push({
        id: 'endurance-2',
        title: 'Cycling Efficiency',
        content: 'Maintain a cadence of 80-90 RPM during long rides to optimize aerobic capacity.',
        icon: <Heart className="size-5" />,
        color: 'text-rose-500',
        bgColor: 'bg-rose-50',
      });
    }

    // Fat Loss Insights
    const fatLossGoal = goals.find(g => g.id === 'fat-loss');
    if (fatLossGoal?.selectedOption === 'Yes') {
      list.push({
        id: 'fat-loss-1',
        title: 'Caloric Deficit',
        content: `Target a daily deficit of 300-500 kcal for sustainable fat loss of ~0.5kg per week.`,
        icon: <Utensils className="size-5" />,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
      });
    }

    // Stress Management Insights
    const stressGoal = goals.find(g => g.id === 'stress-management');
    if (stressGoal?.selectedOption === 'Yes') {
      list.push({
        id: 'stress-1',
        title: 'Mental Resilience',
        content: 'Your current stress patterns suggest adding 10 minutes of mindfulness in the morning.',
        icon: <Brain className="size-5" />,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
      });
    }

    // Default insights if list is short
    if (list.length < 3) {
      list.push({
        id: 'default-1',
        title: 'Hydration Alert',
        content: 'You tend to drink 30% less water on weekends. Try setting a reminder.',
        icon: <Clock className="size-5" />,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-50',
      });
    }

    return list;
  }, [goals, userProfile]);

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronRight className="size-6 rotate-180" />
        </button>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Lightbulb className="size-6" />
        </div>
        <h1 className="text-xl font-bold">Smart Insights</h1>
      </header>

      <main className="p-6 space-y-4">
        <div className="bg-gradient-to-br from-secondary to-primary p-6 rounded-[2rem] text-white shadow-xl shadow-primary/20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="size-6" />
            <h2 className="text-lg font-bold">AI Analysis</h2>
          </div>
          <p className="text-white/90 leading-relaxed">
            Based on your active goals and recent logs, we've generated personalized recommendations to help you reach your targets faster.
          </p>
        </div>

        <div className="grid gap-4">
          {dynamicInsights.map((insight, index) => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex gap-4"
            >
              <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", insight.bgColor)}>
                <div className={insight.color}>{insight.icon}</div>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{insight.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{insight.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
          <p className="text-sm text-slate-400">New insights are generated every 24 hours based on your logged data.</p>
        </div>
      </main>
    </div>
  );
}
