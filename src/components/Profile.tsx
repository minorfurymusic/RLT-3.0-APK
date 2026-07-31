import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useHealth } from '../context/HealthContext';
import { ChevronRight, Camera, Trash2, ImageIcon, X, Plus, User, Info, Target, Settings, Check, Beef, Droplets, Footprints, Flame, Walk, Stethoscope, Medication, Utensils, Lightbulb, FitnessCenter } from './Icons';
import { cn } from '../lib/utils';
import { UserProfile, HealthGoal } from '../types';
import HealthConditionsManager from './HealthConditionsManager';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, updateProfile, goals, updateGoal, avatar, setAvatar } = useHealth();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        setIsAvatarModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setIsAvatarModalOpen(false);
  };

  const handleTakePhoto = () => {
    const simulatedPhoto = "https://picsum.photos/seed/user/400/400";
    setAvatar(simulatedPhoto);
    setIsAvatarModalOpen(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col min-h-full bg-white dark:bg-slate-950 pb-20"
    >
      <header className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronRight className="size-6 rotate-180" />
        </button>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col items-center">
        <div className="relative group">
          <div className="size-40 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ImageIcon className="size-16" />
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute bottom-2 right-2 size-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-transform hover:scale-110 active:scale-90"
          >
            <Camera className="size-5" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
          <button 
            onClick={() => setIsEditProfileModalOpen(true)}
            className="mt-4 px-6 py-2 bg-slate-100 dark:bg-slate-900 rounded-full font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        <div className="w-full mt-12 space-y-6">
          {/* Personal Information */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Info className="size-4" />
                Personal Information
              </h3>
              <button 
                onClick={() => setIsPersonalInfoModalOpen(true)}
                className="text-xs text-primary font-bold"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoCard label="Weight" value={`${profile.weight} kg`} />
              <InfoCard label="Height" value={`${profile.height} cm`} />
              <InfoCard label="Age" value={`${profile.age} years`} />
              <InfoCard label="Sex" value={profile.sex || 'N/A'} />
            </div>
          </section>

          {/* Health Goals */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="size-4" />
                Health Goals
              </h3>
              <button 
                onClick={() => setIsGoalsModalOpen(true)}
                className="text-xs text-primary font-bold"
              >
                Manage
              </button>
            </div>
            <div className="space-y-3">
              {goals.filter(g => g.selected).map(goal => (
                <div key={goal.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">{goal.title}</span>
                    <span className="text-xs text-slate-500">
                      {goal.type === 'numeric' && `${goal.targetValue}${goal.unit}`}
                      {goal.type === 'time' && `Bedtime: ${goal.timeValue}`}
                      {goal.type === 'options' && goal.selectedOption}
                      {goal.type === 'toggle' && 'Active'}
                      {goal.type === 'input' && 'Tracked'}
                    </span>
                  </div>
                  {goal.type === 'numeric' && goal.current !== undefined && goal.target !== undefined && (
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Account Settings */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
              <Settings className="size-4" />
              Account Settings
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <ProfileOption label="Privacy & Security" />
              <ProfileOption label="Language" />
              <ProfileOption label="Help & Support" />
            </div>
          </section>
          
          <button className="w-full py-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-colors">
            Log Out
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <Modal title="Edit Profile Photo" onClose={() => setIsAvatarModalOpen(false)}>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="size-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><ImageIcon className="size-5" /></div>
                <span className="font-bold text-sm">Upload from device</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
              <button onClick={handleTakePhoto} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="size-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Camera className="size-5" /></div>
                <span className="font-bold text-sm">Take a photo</span>
              </button>
              {avatar && (
                <button onClick={handleRemoveAvatar} className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center gap-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <div className="size-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><Trash2 className="size-5" /></div>
                  <span className="font-bold text-sm text-red-600">Remove photo</span>
                </button>
              )}
            </div>
          </Modal>
        )}

        {isEditProfileModalOpen && (
          <Modal title="Edit Profile" onClose={() => setIsEditProfileModalOpen(false)}>
            <div className="space-y-4">
              <Input label="Name" value={profile.name} onChange={(val) => updateProfile({ name: val })} />
              <Input label="Email" value={profile.email} onChange={(val) => updateProfile({ email: val })} />
              <button 
                onClick={() => setIsEditProfileModalOpen(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20"
              >
                Save Changes
              </button>
            </div>
          </Modal>
        )}

        {isPersonalInfoModalOpen && (
          <Modal title="Personal Information" onClose={() => setIsPersonalInfoModalOpen(false)}>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 -mx-1">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Age" type="number" value={profile.age} onChange={(val) => updateProfile({ age: Number(val) })} />
                <Input label="Weight (kg)" type="number" value={profile.weight} onChange={(val) => updateProfile({ weight: Number(val) })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Height (cm)" type="number" value={profile.height} onChange={(val) => updateProfile({ height: Number(val) })} />
                <Select label="Sex" value={profile.sex} options={['Male', 'Female', 'Other']} onChange={(val) => updateProfile({ sex: val as any })} />
              </div>
              <Input label="Ethnicity" value={profile.ethnicity} onChange={(val) => updateProfile({ ethnicity: val })} />
              <Input label="Address" value={profile.address} onChange={(val) => updateProfile({ address: val })} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Body Fat %" type="number" value={profile.bodyFatPercentage} onChange={(val) => updateProfile({ bodyFatPercentage: Number(val) })} />
                <Input label="Waist (cm)" type="number" value={profile.waistCircumference} onChange={(val) => updateProfile({ waistCircumference: Number(val) })} />
              </div>

              <Select 
                label="Work / Activity Type" 
                value={profile.workActivityType} 
                options={['Sedentary', 'Active', 'Very Active']} 
                onChange={(val) => updateProfile({ workActivityType: val as any })} 
              />

              <Input label="Preferred Training Time" value={profile.preferredTrainingTime} onChange={(val) => updateProfile({ preferredTrainingTime: val })} placeholder="e.g. 07:00 AM" />
              <Input label="Food Restrictions / Allergies" value={profile.foodRestrictions} onChange={(val) => updateProfile({ foodRestrictions: val })} />
              <Select 
                label="Food Preference" 
                value={profile.foodPreference} 
                options={['Vegetarian', 'Balanced', 'Low Carb']} 
                onChange={(val) => updateProfile({ foodPreference: val })} 
              />
              <Input label="Stimulant Consumption" value={profile.stimulantConsumption} onChange={(val) => updateProfile({ stimulantConsumption: val })} placeholder="e.g. Caffeine, Energy drinks" />
              <Input label="Sleep Quality" value={profile.sleepQuality} onChange={(val) => updateProfile({ sleepQuality: val })} placeholder="e.g. Good, 7-8 hours" />

              <button 
                onClick={() => setIsPersonalInfoModalOpen(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20 sticky bottom-0"
              >
                Save Information
              </button>
            </div>
          </Modal>
        )}

        {isGoalsModalOpen && (
          <Modal title="Manage Health Goals" onClose={() => setIsGoalsModalOpen(false)}>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 -mx-1">
              <GoalCategorySection 
                title="Performance" 
                icon={<FitnessCenter className="size-4" />}
                goals={goals.filter(g => g.category === 'Performance')}
                onUpdate={updateGoal}
              />
              <GoalCategorySection 
                title="Nutrition" 
                icon={<Utensils className="size-4" />}
                goals={goals.filter(g => g.category === 'Nutrition')}
                onUpdate={updateGoal}
              />
              <GoalCategorySection 
                title="Well-being" 
                icon={<Lightbulb className="size-4" />}
                goals={goals.filter(g => g.category === 'Well-being')}
                onUpdate={updateGoal}
              />
              <button 
                onClick={() => setIsGoalsModalOpen(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20 sticky bottom-0"
              >
                Done
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-bold text-sm">{value}</p>
    </div>
  );
}

function ProfileOption({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors group">
      <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary text-sm">{label}</span>
      <ChevronRight className="size-4 text-slate-400" />
    </button>
  );
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-8 pb-12 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-400 uppercase ml-1">{label}</label>
      <input 
        type={type} 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-5 font-bold text-sm"
      />
    </div>
  );
}

function Select({ label, value, options, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-400 uppercase ml-1">{label}</label>
      <select 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-5 font-bold text-sm appearance-none"
      >
        <option value="">Select Option</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function GoalCategorySection({ title, icon, goals, onUpdate }: { title: string, icon: React.ReactNode, goals: HealthGoal[], onUpdate: (id: string, update: Partial<HealthGoal>) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest ml-1">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-3">
        {goals.map(goal => (
          <div 
            key={goal.id} 
            className={cn(
              "p-4 rounded-2xl border transition-all",
              goal.selected 
                ? "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30" 
                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm">{goal.title}</h4>
                <p className="text-[10px] text-slate-500 truncate">{goal.description}</p>
              </div>
              <button 
                onClick={() => onUpdate(goal.id, { selected: !goal.selected })}
                className={cn(
                  "size-6 rounded-full border-2 flex items-center justify-center transition-all",
                  goal.selected ? "bg-primary border-primary" : "border-slate-200 dark:border-slate-700"
                )}
              >
                {goal.selected && <Check className="size-4 text-white" />}
              </button>
            </div>
            {goal.selected && (
              <div className="space-y-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {goal.type === 'numeric' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Target ({goal.unit})</label>
                    <input 
                      type="number" 
                      value={goal.targetValue || 0} 
                      onChange={(e) => onUpdate(goal.id, { targetValue: Number(e.target.value) })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 px-4 text-sm font-bold"
                    />
                  </div>
                )}
                {goal.type === 'input' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                    <textarea 
                      value={goal.inputValue || ''} 
                      onChange={(e) => onUpdate(goal.id, { inputValue: e.target.value })}
                      placeholder="What would you like to improve?"
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 px-4 text-sm font-medium min-h-[80px]"
                    />
                  </div>
                )}
                {goal.type === 'options' && goal.options && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Select Option</label>
                    <div className="flex flex-col gap-2">
                      {goal.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => onUpdate(goal.id, { selectedOption: opt })}
                          className={cn(
                            "text-left px-4 py-2 rounded-xl text-xs font-bold transition-colors",
                            goal.selectedOption === opt 
                              ? "bg-primary text-white" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {goal.type === 'time' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Target Time</label>
                    <input 
                      type="time" 
                      value={goal.timeValue || '22:00'} 
                      onChange={(e) => onUpdate(goal.id, { timeValue: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 px-4 text-sm font-bold"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

