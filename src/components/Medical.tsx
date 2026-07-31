import React, { useState, useRef } from 'react';
import { 
  Search, 
  Stethoscope, 
  FileText, 
  ImageIcon, 
  Syringe, 
  ChevronRight, 
  Plus, 
  Activity, 
  FitnessCenter, 
  History as HistoryIcon,
  AlertCircle,
  Users,
  X,
  Trash2,
  Edit3,
  PlusCircle,
  ClipboardList,
  CalendarPlus,
  Paperclip,
  MapPin,
  Clock,
  Medication,
  AlertTriangle,
  Heart,
  ShieldAlert,
  Phone,
  Mail,
  Check
} from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import { useHealth } from '../context/HealthContext';
import { HistoryCategory, HistoryRecord } from '../types';
import HealthConditionsManager from './HealthConditionsManager';
import HistoryForm from './HistoryForm';
import { cn } from '../lib/utils';

export default function Medical() {
  const { historyRecords, deleteHistoryRecord, updateHistoryRecord, gymLogs } = useHealth();
  const [activeTab, setActiveTab] = useState<'medical' | 'workouts'>('medical');
  const [selectedCategory, setSelectedCategory] = useState<HistoryCategory | 'All'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingCategory, setAddingCategory] = useState<HistoryCategory | null>(null);
  const [activeNotesRecordId, setActiveNotesRecordId] = useState<string | null>(null);
  const [selectedRecordForFile, setSelectedRecordForFile] = useState<HistoryRecord | null>(null);
  const [isViewingFile, setIsViewingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileAttach = (record: HistoryRecord) => {
    setSelectedRecordForFile(record);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedRecordForFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = reader.result as string;
        updateHistoryRecord(selectedRecordForFile.id, {
          attachmentUrl: fileData,
          files: [{ id: Math.random().toString(36).substr(2, 9), name: file.name, url: fileData, type: file.type }]
        });
        setSelectedRecordForFile(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewFile = (record: HistoryRecord) => {
    setSelectedRecordForFile(record);
    setIsViewingFile(true);
  };

  // Get categories that have records
  const categoriesWithRecords = Array.from(new Set(historyRecords.map(r => r.category)));
  
  const filteredRecords = selectedCategory === 'All' 
    ? historyRecords 
    : historyRecords.filter(r => r.category === selectedCategory);

  const categories: HistoryCategory[] = ['Medical History', 'Exams', 'Consultations', 'Medical Certificates', 'Emergency', 'Family History', 'Stress Reports'];

  const getCategoryIcon = (category: HistoryCategory) => {
    switch (category) {
      case 'Medical History': return <Activity className="size-4" />;
      case 'Exams': return <FileText className="size-4" />;
      case 'Consultations': return <Stethoscope className="size-4" />;
      case 'Medical Certificates': return <ClipboardList className="size-4" />;
      case 'Emergency': return <AlertCircle className="size-4" />;
      case 'Family History': return <Users className="size-4" />;
      case 'Stress Reports': return <ShieldAlert className="size-4" />;
    }
  };

  const getCategoryColor = (category: HistoryCategory) => {
    switch (category) {
      case 'Medical History': return 'bg-blue-100 text-blue-600';
      case 'Exams': return 'bg-amber-100 text-amber-600';
      case 'Consultations': return 'bg-emerald-100 text-emerald-600';
      case 'Medical Certificates': return 'bg-indigo-100 text-indigo-600';
      case 'Emergency': return 'bg-red-100 text-red-600';
      case 'Family History': return 'bg-purple-100 text-purple-600';
      case 'Stress Reports': return 'bg-orange-100 text-orange-600';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col min-h-full bg-white dark:bg-slate-950"
    >
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Medical</h1>
            <button 
              onClick={() => {
                setAddingCategory(null);
                setIsAddModalOpen(true);
              }}
              className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              selectedCategory === 'All' 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
            )}
          >
            All Records
          </button>
          {categories.filter(cat => historyRecords.some(r => r.category === cat)).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2",
                selectedCategory === cat 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
              )}
            >
              {getCategoryIcon(cat)}
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'medical' && (
            <motion.div
              key="medical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredRecords.length === 0 ? (
                <div className="text-center py-20">
                  <div className="size-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <FileText className="size-10" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No records found</h3>
                  <p className="text-sm text-slate-500 max-w-[240px] mx-auto">
                    Start by adding your first medical record using the button below.
                  </p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <RecordCard 
                    key={record.id} 
                    record={record} 
                    onDelete={() => deleteHistoryRecord(record.id)}
                    onAddNote={() => setActiveNotesRecordId(record.id)}
                    onFileAttach={handleFileAttach}
                    onViewFile={handleViewFile}
                    icon={getCategoryIcon(record.category)}
                    color={getCategoryColor(record.category)}
                  />
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'workouts' && (
            <motion.div
              key="workouts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {gymLogs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="size-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <FitnessCenter className="size-10" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No workouts yet</h3>
                  <p className="text-sm text-slate-500 max-w-[240px] mx-auto">
                    Log your gym sessions in the Exercises section to see them here.
                  </p>
                </div>
              ) : (
                gymLogs.map((log) => (
                  <div key={log.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary">
                          <FitnessCenter className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">{log.exerciseName}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full">{log.caloriesBurned} kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {log.sets.map((set, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Set {idx + 1}</span>
                          <span className="text-sm font-bold">{set.weight}kg × {set.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Record Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-8 pb-12 shadow-2xl max-h-[95vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white dark:bg-slate-900 z-10 py-2">
                <h3 className="text-2xl font-bold">Add Record</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <X className="size-6" />
                </button>
              </div>

              {!addingCategory ? (
                <div className="grid grid-cols-1 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setAddingCategory(cat)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group"
                    >
                      <div className={cn("size-12 rounded-2xl flex items-center justify-center", getCategoryColor(cat))}>
                        {getCategoryIcon(cat)}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-sm block">{cat}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">New Entry</span>
                      </div>
                      <ChevronRight className="size-5 ml-auto text-slate-300 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto">
                   <button 
                    onClick={() => setAddingCategory(null)}
                    className="text-xs font-bold text-primary mb-6 flex items-center gap-1"
                  >
                    <ChevronRight className="size-3 rotate-180" />
                    Back to Categories
                  </button>
                  
                  {addingCategory === 'Medical History' ? (
                    <HealthConditionsManager onComplete={() => setIsAddModalOpen(false)} />
                  ) : (
                    <HistoryForm 
                      category={addingCategory} 
                      onComplete={() => {
                        setIsAddModalOpen(false);
                        setAddingCategory(null);
                      }} 
                      onCancel={() => setAddingCategory(null)}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {activeNotesRecordId && (
          <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-8 pb-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Record Notes</h3>
                <button onClick={() => setActiveNotesRecordId(null)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <X className="size-5" />
                </button>
              </div>
              
              {historyRecords.find(r => r.id === activeNotesRecordId) && (
                <NotesPanel 
                  record={historyRecords.find(r => r.id === activeNotesRecordId)!}
                  onClose={() => setActiveNotesRecordId(null)}
                  onUpdate={updateHistoryRecord}
                />
              )}
            </motion.div>
          </div>
        )}
        {isViewingFile && selectedRecordForFile && (
          <FileViewerModal 
            record={selectedRecordForFile}
            onClose={() => {
              setIsViewingFile(false);
              setSelectedRecordForFile(null);
            }}
            onDelete={() => {
              updateHistoryRecord(selectedRecordForFile.id, { attachmentUrl: undefined, files: [] });
              setIsViewingFile(false);
              setSelectedRecordForFile(null);
            }}
            onReplace={() => {
              setIsViewingFile(false);
              fileInputRef.current?.click();
            }}
            onUpdate={(updates: any) => {
              updateHistoryRecord(selectedRecordForFile.id, updates);
            }}
          />
        )}
      </AnimatePresence>

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,image/*"
        className="hidden"
      />
    </motion.div>
  );
}

interface RecordCardProps {
  key?: string | number;
  record: HistoryRecord;
  onDelete: () => void;
  onAddNote: () => void;
  onFileAttach: (record: HistoryRecord) => void;
  onViewFile: (record: HistoryRecord) => void;
  icon: React.ReactNode;
  color: string;
}

function RecordCard({ record, onDelete, onAddNote, onFileAttach, onViewFile, icon, color }: RecordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={cn("size-12 rounded-2xl flex items-center justify-center", color)}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                {'conditionName' in record ? record.conditionName : 
                 'examName' in record ? record.examName : 
                 'doctorName' in record ? `${('professionalType' in record ? record.professionalType : '') || 'Consultation'}: ${record.doctorName}` : 
                 'bloodType' in record ? 'Emergency Health Profile' : 
                 'relativeName' in record ? `${record.relativeName}'s History` : 
                 'stressLevel' in record ? `Stress: ${record.source || 'General'}` : 'Record'}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.category}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors"
            >
              <Edit3 className="size-4" />
            </button>
            <button 
              onClick={onDelete}
              className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {'status' in record && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                record.status === 'Active' || record.status === 'Abnormal' || record.status === 'Canceled' ? "bg-red-100 text-red-600" :
                record.status === 'Controlled' || record.status === 'Normal' || record.status === 'Completed' ? "bg-emerald-100 text-emerald-600" :
                record.status === 'Recovered' || record.status === 'Pending Results' || record.status === 'Scheduled' ? "bg-blue-100 text-blue-600" : 
                record.status === 'Attention Required' ? "bg-amber-100 text-amber-600" : "bg-purple-100 text-purple-600"
              )}>
                {record.status}
              </span>
            </div>
          )}

          {'specialty' in record && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialty</span>
              <span className="text-xs font-bold">{record.specialty}</span>
            </div>
          )}

          {'examCategory' in record && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</span>
              <span className="text-xs font-bold">{record.examCategory}</span>
            </div>
          )}

          {'bloodType' in record && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Type</span>
              <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">{record.bloodType}</span>
            </div>
          )}

          {'relationship' in record && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relationship</span>
              <span className="text-xs font-bold">{record.relationship}</span>
            </div>
          )}

          {'stressLevel' in record && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stress Level</span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  record.stressLevel >= 8 ? "bg-red-100 text-red-600" :
                  record.stressLevel >= 5 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                )}>
                  {record.stressLevel}/10
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all",
                    record.stressLevel >= 8 ? "bg-red-500" :
                    record.stressLevel >= 5 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${record.stressLevel * 10}%` }}
                />
              </div>
              {record.stressNotes && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 italic">"{record.stressNotes}"</p>
                </div>
              )}
            </div>
          )}

          {'criticalConditions' in record && record.criticalConditions?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {record.criticalConditions.map((cond, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[8px] font-bold uppercase tracking-wider border border-red-100">
                  {cond}
                </span>
              ))}
            </div>
          )}

          {'conditions' in record && record.conditions?.length > 0 && (
            <div className="mt-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Conditions</span>
              <div className="flex flex-wrap gap-1">
                {record.conditions.slice(0, 3).map((cond, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[8px] font-bold uppercase tracking-wider border border-purple-100">
                    {cond.condition}
                  </span>
                ))}
                {record.conditions?.length > 3 && (
                  <span className="text-[8px] font-bold text-slate-400">+ {(record.conditions?.length || 0) - 3} more</span>
                )}
              </div>
            </div>
          )}

          {'results' in record && record.results?.length > 0 && (
            <div className="mt-2 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Key Results</span>
              <div className="grid grid-cols-2 gap-2">
                {record.results.slice(0, 4).map((res, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-medium truncate">{res.name}</p>
                    <p className="text-xs font-bold">{res.value} <span className="text-[10px] font-normal text-slate-500">{res.unit}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="py-2.5 bg-primary/5 text-primary dark:bg-primary/10 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-primary/10"
            >
              View Details
            </button>
            <button 
              onClick={() => {
                const hasFile = ('attachmentUrl' in record && record.attachmentUrl) || ('files' in record && record.files && record.files.length > 0);
                if (hasFile) {
                  onViewFile(record);
                } else {
                  onFileAttach(record);
                }
              }}
              className="py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Paperclip className="size-3" />
              {('attachmentUrl' in record && record.attachmentUrl) || ('files' in record && record.files && record.files.length > 0) ? 'View Attached Result File' : 'Attach Result File'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 border-t border-slate-50 dark:border-slate-800 pt-4"
          >
            <div className="space-y-4">
              {'bloodType' in record && (
                <div className="space-y-4">
                  {/* Allergies */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Allergies</span>
                    <div className="grid grid-cols-1 gap-2">
                      {record.allergies.medication?.length > 0 && (
                        <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                          <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Medication</p>
                          <p className="text-xs">{record.allergies.medication.join(', ')}</p>
                        </div>
                      )}
                      {record.allergies.food?.length > 0 && (
                        <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                          <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Food</p>
                          <p className="text-xs">{record.allergies.food.join(', ')}</p>
                        </div>
                      )}
                      {record.allergies.environmental?.length > 0 && (
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Environmental</p>
                          <p className="text-xs">{record.allergies.environmental.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Emergency Contacts</span>
                    <div className="space-y-2">
                      {record.emergencyContacts.map((contact, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-bold">{contact.name}</p>
                              <p className="text-[10px] font-bold text-primary uppercase">{contact.relationship}</p>
                            </div>
                            {contact.isPrimary && (
                              <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-bold uppercase rounded-md">Primary</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <Phone className="size-3" />
                              {contact.phone}
                            </div>
                            {contact.email && (
                              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                <Mail className="size-3" />
                                {contact.email}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Organ Donor & Instructions */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Organ Donor Status</span>
                      <p className="text-xs font-bold">{record.organDonorStatus}</p>
                    </div>
                    {record.emergencyInstructions && (
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Emergency Instructions</span>
                        <p className="text-xs italic">"{record.emergencyInstructions}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {'relativeName' in record && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Age / Status</span>
                      <p className="text-xs font-bold">{record.age} years • {record.isLiving ? 'Living' : 'Deceased'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Relationship</span>
                      <p className="text-xs font-bold">{record.relationship}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Detailed Conditions</span>
                    <div className="space-y-2">
                      {record.conditions.map((cond, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold">{cond.condition}</p>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-bold uppercase rounded-md border border-purple-100">
                              {cond.category}
                            </span>
                          </div>
                          {cond.ageAtOnset && (
                            <p className="text-[10px] text-slate-500 mb-2">Diagnosed at age {cond.ageAtOnset}</p>
                          )}
                          {cond.cancerDetails && (
                            <div className="mt-2 p-2 bg-red-50/30 rounded-lg border border-red-100/50">
                              <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Oncology Details</p>
                              <p className="text-[10px]"><span className="font-bold">Type:</span> {cond.cancerDetails.type}</p>
                              <p className="text-[10px]"><span className="font-bold">Organ:</span> {cond.cancerDetails.affectedOrgan}</p>
                            </div>
                          )}
                          {cond.notes && (
                            <p className="text-[10px] text-slate-400 italic mt-2">"{cond.notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {'stressLevel' in record && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mood</span>
                      <p className="text-xs font-bold">{record.mood}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Sleep Quality</span>
                      <p className="text-xs font-bold">{record.sleepQuality}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Triggers</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {record.triggers.map((trigger, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold border border-slate-100 dark:border-slate-800">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Physical Symptoms</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {record.physicalSymptoms.map((symptom, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold border border-slate-100 dark:border-slate-800">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {'location' in record && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3 text-slate-400" />
                    <span className="text-xs font-bold">{record.location}</span>
                  </div>
                </div>
              )}

              {'reason' in record && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Reason for Visit</span>
                  <p className="text-xs font-medium">{record.reason}</p>
                </div>
              )}

              {'diagnosis' in record && record.diagnosis && (
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Diagnosis</span>
                  <p className="text-xs font-bold text-primary">{record.diagnosis}</p>
                </div>
              )}

              {'treatmentPlan' in record && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Treatment Plan</span>
                  <div className="grid grid-cols-1 gap-2">
                    {record.treatmentPlan.medication && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-start gap-3">
                        <Medication className="size-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Medication</p>
                          <p className="text-xs">{record.treatmentPlan.medication}</p>
                        </div>
                      </div>
                    )}
                    {record.treatmentPlan.lifestyle && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-start gap-3">
                        <Activity className="size-4 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Lifestyle</p>
                          <p className="text-xs">{record.treatmentPlan.lifestyle}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {'prescriptions' in record && record.prescriptions?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Prescriptions</span>
                  <div className="space-y-2">
                    {record.prescriptions.map((p, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold">{p.medicationName}</p>
                          <span className="text-[10px] font-bold text-primary">{p.dosage}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">{p.frequency} • {p.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {'followUpDate' in record && record.followUpDate && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center gap-2">
                    <CalendarPlus className="size-4 text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Follow-up</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{new Date(record.followUpDate).toLocaleDateString()}</span>
                </div>
              )}

              {'provider' in record && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Provider / Lab</span>
                  <span className="text-xs font-bold">{record.provider}</span>
                </div>
              )}

              {'doctorResponsible' in record && record.doctorResponsible && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Doctor</span>
                  <span className="text-xs font-bold">{record.doctorResponsible}</span>
                </div>
              )}

              {'results' in record && record.results?.length > 4 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">All Results</span>
                  <div className="space-y-1">
                    {record.results.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800 last:border-0">
                        <span className="text-xs">{res.name}</span>
                        <div className="text-right">
                          <span className="text-xs font-bold">{res.value} {res.unit}</span>
                          {res.referenceRange && <p className="text-[8px] text-slate-400">Ref: {res.referenceRange}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {record.notes && record.notes?.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Latest Note</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{record.notes?.[record.notes.length - 1]?.text}"</p>
                  {record.notes?.length > 1 && (
                    <button onClick={onAddNote} className="text-[10px] font-bold text-primary mt-2 uppercase tracking-widest">View all {record.notes?.length} notes</button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal Placeholder */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-8 pb-12 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Edit Record</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <X className="size-5" />
                </button>
              </div>
              <HistoryForm 
                category={record.category} 
                initialData={record}
                onComplete={() => setIsEditModalOpen(false)} 
                onCancel={() => setIsEditModalOpen(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotesPanel({ record, onClose, onUpdate }: { record: HistoryRecord, onClose: () => void, onUpdate: (id: string, data: Partial<HistoryRecord>) => void }) {
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      text: newNote
    };
    onUpdate(record.id, {
      notes: [...(record.notes || []), note]
    });
    setNewNote('');
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdate(record.id, {
      notes: record.notes?.filter(n => n.id !== noteId)
    });
  };

  const handleUpdateNote = (noteId: string) => {
    onUpdate(record.id, {
      notes: record.notes?.map(n => n.id === noteId ? { ...n, text: editText } : n)
    });
    setEditingNoteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Notes History</h4>
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
          {(!record.notes || record.notes.length === 0) ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">No notes yet. Add your first note below.</p>
          ) : (
            record.notes.map((note) => (
              <div key={note.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-primary uppercase">{new Date(note.date).toLocaleDateString()}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditText(note.text);
                      }}
                      className="text-slate-400 hover:text-primary"
                    >
                      <Edit3 className="size-3" />
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <textarea 
                      className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20 min-h-[60px]"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateNote(note.id)} className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg">Save</button>
                      <button onClick={() => setEditingNoteId(null)} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-[10px] font-bold rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{note.text}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Add New Note</label>
        <textarea 
          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
          placeholder="Type your note here..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button 
          onClick={handleAddNote}
          disabled={!newNote.trim()}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <PlusCircle className="size-4" />
          Add Note
        </button>
      </div>
    </div>
  );
}

function FileViewerModal({ record, onClose, onDelete, onReplace, onUpdate }: { 
  record: HistoryRecord, 
  onClose: () => void, 
  onDelete: () => void, 
  onReplace: () => void,
  onUpdate: (updates: Partial<HistoryRecord>) => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(record.files?.[0]?.name || 'Document');

  const file = record.files?.[0] || { 
    id: 'legacy', 
    url: (record as any).attachmentUrl || '', 
    name: 'Document', 
    type: 'image',
    date: record.date
  };
  const isImage = file.type?.startsWith('image') || (!file.type && file.url?.startsWith('data:image'));

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <div>
              {isEditing ? (
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-primary/20 rounded-lg px-2 py-1 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                  autoFocus
                />
              ) : (
                <h3 className="font-bold text-lg">{editName}</h3>
              )}
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{record.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button 
                onClick={() => {
                  onUpdate({ files: [{ ...file, name: editName, id: (file as any).id }] });
                  setIsEditing(false);
                }}
                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full"
              >
                <Check className="size-5" />
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-primary rounded-full">
                <Edit3 className="size-5" />
              </button>
            )}
            <button onClick={onReplace} className="p-2 text-slate-400 hover:text-primary rounded-full">
              <PlusCircle className="size-5" />
            </button>
            <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 rounded-full">
              <Trash2 className="size-5" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full ml-2">
              <X className="size-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[300px]">
          {isImage ? (
            <img src={file.url} alt={editName} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" />
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="size-24 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-primary">
                <FileText className="size-12" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{editName}</p>
                <p className="text-xs text-slate-500 mt-1">Document Preview not available</p>
              </div>
              <a 
                href={file.url} 
                download={editName}
                className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
