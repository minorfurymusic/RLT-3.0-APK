import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useHealth } from '../context/HealthContext';
import { ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, FileText, Medication, Walk, Utensils, Stethoscope } from './Icons';
import { cn } from '../lib/utils';
import { CalendarEvent } from '../types';

export default function Calendar() {
  const navigate = useNavigate();
  const { events, addEvent, deleteEvent } = useHealth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New event form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newType, setNewType] = useState<CalendarEvent['type']>('medical');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const filteredEvents = events.filter(e => new Date(e.date).toDateString() === selectedDate.toDateString());

  const handleAddEvent = () => {
    if (!newTitle) return;
    addEvent({
      title: newTitle,
      description: newDesc,
      date: selectedDate.toISOString(),
      time: newTime,
      type: newType,
      synced: true
    });
    setNewTitle('');
    setNewDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-full bg-white dark:bg-slate-950"
    >
      <header className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronRight className="size-6 rotate-180" />
          </button>
          <h1 className="text-xl font-bold">Calendar</h1>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="size-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
        >
          <Plus className="size-6" />
        </button>
      </header>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{monthNames[month]} {year}</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedDate(new Date(year, month - 1, 1))}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              <ChevronRight className="size-5 rotate-180" />
            </button>
            <button 
              onClick={() => setSelectedDate(new Date(year, month + 1, 1))}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-[10px] font-bold text-slate-400 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month;
            const hasEvents = events.some(e => {
              const d = new Date(e.date);
              return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
            });

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                  isSelected 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span className="text-sm font-bold">{day}</span>
                {hasEvents && !isSelected && (
                  <div className="size-1 rounded-full bg-primary absolute bottom-2"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events for Selected Day */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-t-[2.5rem] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Events</h3>
          <span className="text-xs text-slate-500 font-medium">{selectedDate.toDateString()}</span>
        </div>

        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-sm">No events scheduled for this day</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center shrink-0",
                  event.type === 'medical' ? "bg-blue-100 text-blue-600" :
                  event.type === 'workout' ? "bg-emerald-100 text-emerald-600" :
                  event.type === 'medication' ? "bg-red-100 text-red-600" :
                  "bg-orange-100 text-orange-600"
                )}>
                  {event.type === 'medical' ? <Stethoscope className="size-5" /> :
                   event.type === 'workout' ? <Walk className="size-5" /> :
                   event.type === 'medication' ? <Medication className="size-5" /> :
                   <Utensils className="size-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{event.title}</p>
                  <p className="text-xs text-slate-500">{event.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">{event.time}</p>
                  <button onClick={() => deleteEvent(event.id)} className="text-[10px] text-red-500 mt-1">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-8 pb-12"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Schedule Event</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Event title"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Description</label>
                  <input 
                    type="text" 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Details"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Time</label>
                    <input 
                      type="text" 
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Type</label>
                    <select 
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 font-bold appearance-none"
                    >
                      <option value="medical">Medical</option>
                      <option value="exam">Exam</option>
                      <option value="medication">Medication</option>
                      <option value="workout">Workout</option>
                      <option value="nutrition">Nutrition</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                  <CalendarIcon className="size-5 text-blue-500" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    This event will be synced with your Google and Apple calendars.
                  </p>
                </div>

                <button 
                  onClick={handleAddEvent}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 transition-transform active:scale-95"
                >
                  Schedule Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
