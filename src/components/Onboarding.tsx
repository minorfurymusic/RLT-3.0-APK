import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useHealth } from '../context/HealthContext';
import { ChevronRight, Check, Sparkles, FitnessCenter, Utensils, Lightbulb } from './Icons';
import { cn } from '../lib/utils';
import { HealthGoal } from '../types';

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, updateProfile, goals, updateGoal } = useHealth();
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Step 1 state
  const [age, setAge] = useState(profile.age || 25);
  const [weight, setWeight] = useState(profile.weight || 70);
  const [height, setHeight] = useState(profile.height || 175);
  const [sex, setSex] = useState(profile.sex || 'Male');

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      updateProfile({ 
        age, weight, height, sex, 
        onboardingCompleted: true 
      });
      navigate('/');
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
        />
      </div>

      <div className="flex-1 p-8 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Essential Info</h1>
                <p className="text-slate-500">Let's start with the basics to personalize your experience.</p>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase ml-1">Age</label>
                    <input 
                      type="number" 
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-4 px-6 font-bold text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase ml-1">Sex</label>
                    <select 
                      value={sex}
                      onChange={(e) => setSex(e.target.value as any)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-4 px-6 font-bold text-lg appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase ml-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-4 px-6 font-bold text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase ml-1">Height (cm)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-4 px-6 font-bold text-lg"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Your Goals</h1>
                <p className="text-slate-500">What do you want to achieve? Select all that apply.</p>
              </div>

              <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-6 pb-4">
                <GoalCategorySection 
                  title="Performance" 
                  icon={<FitnessCenter className="size-5" />}
                  goals={goals.filter(g => g.category === 'Performance')}
                  onToggle={(id, selected) => updateGoal(id, { selected })}
                />
                <GoalCategorySection 
                  title="Nutrition" 
                  icon={<Utensils className="size-5" />}
                  goals={goals.filter(g => g.category === 'Nutrition')}
                  onToggle={(id, selected) => updateGoal(id, { selected })}
                />
                <GoalCategorySection 
                  title="Well-being" 
                  icon={<Lightbulb className="size-5" />}
                  goals={goals.filter(g => g.category === 'Well-being')}
                  onToggle={(id, selected) => updateGoal(id, { selected })}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={handleNext}
          className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95 mt-6"
        >
          {step === totalSteps ? 'Get Started' : 'Continue'}
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function GoalCategorySection({ title, icon, goals, onToggle }: { title: string, icon: React.ReactNode, goals: HealthGoal[], onToggle: (id: string, selected: boolean) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-wider ml-1">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-2">
        {goals.map(goal => (
          <button
            key={goal.id}
            onClick={() => onToggle(goal.id, !goal.selected)}
            className={cn(
              "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4",
              goal.selected 
                ? "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30" 
                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
            )}
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm mb-0.5">{goal.title}</h3>
              <p className="text-xs text-slate-500 truncate">{goal.description}</p>
            </div>
            <div className={cn(
              "size-6 rounded-full border-2 flex items-center justify-center transition-all",
              goal.selected ? "bg-primary border-primary" : "border-slate-200 dark:border-slate-700"
            )}>
              {goal.selected && <Check className="size-4 text-white" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
