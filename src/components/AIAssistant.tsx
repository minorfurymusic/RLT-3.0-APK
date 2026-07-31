import { useState, useRef, useEffect } from 'react';
import { Menu, Settings, SmartToy, Send } from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { useHealth } from '../context/HealthContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function AIAssistant() {
  const { profile, historyRecords } = useHealth();
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: "Hello! I'm your health companion. How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const healthContext = `
      User Profile:
      - Age: ${profile.age || 'Not set'}
      - Sex: ${profile.sex || 'Not set'}
      - Weight: ${profile.weight ? profile.weight + 'kg' : 'Not set'}
      - Height: ${profile.height ? profile.height + 'cm' : 'Not set'}
      - Medical History: ${profile.selectedConditions?.map(c => 
          `${c.condition} (${c.category}): Status: ${c.status || 'N/A'}, Year: ${c.yearDiagnosed || 'N/A'}, Severity: ${c.severity || 'N/A'}`
        ).join('; ') || 'None'}
      
      Health Records (History & Exams):
      ${historyRecords.map(r => {
        if (r.category === 'Exams') {
          return `- Exam: ${r.examName} (${r.examCategory}), Date: ${r.date}, Status: ${r.status}, Results: ${r.results?.map(res => `${res.name}: ${res.value} ${res.unit} (Ref: ${res.referenceRange}) - ${res.status}`).join(', ')}`;
        }
        if (r.category === 'Medical History') {
          return `- Condition: ${r.conditionName} (${r.conditionCategory}), Date: ${r.date}, Status: ${r.status}, Notes: ${r.notes || 'None'}`;
        }
        if (r.category === 'Consultations') {
          return `- Consultation: Dr. ${r.doctorName} (${r.specialty}), Date: ${r.date}, Location: ${r.location}, Status: ${r.status}, Reason: ${r.reason}, Diagnosis: ${r.diagnosis || 'None'}, Treatment: ${JSON.stringify(r.treatmentPlan)}, Follow-up: ${r.followUpDate || 'None'}`;
        }
        return `- ${r.category}: ${r.date}, Notes: ${r.notes || 'None'}`;
      }).join('\n')}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMessage].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `You are VitalSync AI, a helpful health and wellness companion. 
          Use the following user health context to provide personalized insights, alerts, and recommendations:
          ${healthContext}
          Always be encouraging and professional. Remind users that you are not a replacement for professional medical advice.`,
        }
      });

      const aiContent = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: aiContent }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start">
          <Menu className="size-6" />
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">VitalSync AI</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Settings className="size-6" />
          </button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}
            >
              {m.role === 'assistant' && (
                <div className="bg-primary/10 rounded-full w-10 h-10 shrink-0 flex items-center justify-center border border-primary/20">
                  <SmartToy className="size-6 text-primary" />
                </div>
              )}
              <div className={`flex flex-1 flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${m.role === 'assistant' ? 'text-primary/80 ml-1' : 'text-slate-400 dark:text-slate-500 mr-1'}`}>
                  {m.role === 'assistant' ? 'VitalSync AI' : 'You'}
                </p>
                <div className={`text-sm font-normal leading-relaxed max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border ${
                  m.role === 'assistant' 
                    ? 'rounded-bl-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-100 dark:border-slate-700' 
                    : 'rounded-br-none bg-secondary text-white border-secondary shadow-md shadow-secondary/20'
                }`}>
                  {m.content}
                </div>
              </div>
              {m.role === 'user' && (
                <div className="bg-slate-200 dark:bg-slate-700 rounded-full w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-slate-500">person</span>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-3"
            >
              <div className="bg-primary/10 rounded-full w-10 h-10 shrink-0 flex items-center justify-center border border-primary/20">
                <SmartToy className="size-6 text-primary" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-100 dark:border-slate-700">
                <div className="flex gap-1">
                  <div className="size-1.5 bg-secondary/40 rounded-full animate-bounce"></div>
                  <div className="size-1.5 bg-secondary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="size-1.5 bg-secondary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
        <div className="relative flex items-center">
          <input 
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-3 px-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100" 
            placeholder="Type your message..." 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 bg-secondary text-white p-2 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <Send className="size-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-3 px-4">
          This assistant does not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}
