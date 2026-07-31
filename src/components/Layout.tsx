import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, History, Utensils, FitnessCenter, Brain, Plus, X, Beef, Dumbbell, Droplets, Footprints, Walk, UtensilsIconLucide, Flame } from './Icons';
import { Share2, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('health_login');
    window.location.reload();
  };

  const quickAddOptions = [
    { label: 'Calories', icon: <Flame className="size-6" />, color: 'bg-orange-500', path: '/metric/calories' },
    { label: 'Protein', icon: <Beef className="size-6" />, color: 'bg-blue-500', path: '/metric/protein' },
    { label: 'Water', icon: <Droplets className="size-6" />, color: 'bg-cyan-500', path: '/metric/hydration' },
    { label: 'Steps', icon: <Footprints className="size-6" />, color: 'bg-emerald-500', path: '/metric/steps' },
    { label: 'Exercise', icon: <Walk className="size-6" />, color: 'bg-primary', path: '/exercises' },
    { label: 'Meal', icon: <UtensilsIconLucide className="size-6" />, color: 'bg-amber-500', path: '/nutrition' },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col max-w-md mx-auto border-x border-slate-200 dark:border-slate-800 relative">
      {/* Floating Logout Button at the top right */}
      <button 
        onClick={handleLogout}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 active:scale-95 transition-all shadow-sm"
        title="Sair"
      >
        <LogOut className="size-5" />
      </button>

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900 border-t border-slate-850 px-2 pb-6 pt-3 flex justify-between items-center z-50">
        <NavItem to="/" icon={<Home />} label="Início" />
        <NavItem to="/medical" icon={<History />} label="Médico" />
        <NavItem to="/ai" icon={<Brain />} label="Cérebro" />
        <NavItem to="/nutrition" icon={<Utensils />} label="Nutrição" />
        <NavItem to="/exercises" icon={<FitnessCenter />} label="Exercícios" />
        <NavItem to="/profile" icon={<Share2 />} label="Compartilhar" />
      </nav>

      {/* Quick Add Floating Button (on bottom right, above nav) */}
      <button 
        onClick={() => setIsQuickAddOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-blue-600 text-white size-12 rounded-full shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
      >
        <Plus className="size-6" />
      </button>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 pb-12"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Quick Log</h3>
                <button onClick={() => setIsQuickAddOpen(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <X className="size-6" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {quickAddOptions.map((option) => (
                  <button 
                    key={option.label}
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      navigate(option.path);
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={cn("size-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-active:scale-90", option.color)}>
                      {option.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-1 flex-col items-center gap-1 transition-colors",
          isActive ? "text-blue-500" : "text-slate-500"
        )
      }
    >
      <span className="[&>svg]:size-5">{icon}</span>
      <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
    </NavLink>
  );
}
