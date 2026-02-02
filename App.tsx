import React, { useState, useEffect, useRef } from 'react';
import { AppState, Goal, Task, TaskType, DailyEntry, BinaryResult } from './types';
import GlassCard from './components/GlassCard';
import Dashboard from './components/Dashboard';
import TaskCard from './components/TaskCard';
import Insights from './components/Insights';
import TaskSetupItem from './components/TaskSetupItem';

const App: React.FC = () => {
  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = () => new Date().toLocaleDateString('en-CA');

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('shado_track_state'); //
      return saved ? JSON.parse(saved) : { currentGoal: null, history: [] }; // Added try/catch safety
    } catch (e) {
      console.error("Parse Error:", e);
      return { currentGoal: null, history: [] };
    }
  });

  const [activeTab, setActiveTab] = useState<'today' | 'insights' | 'setup'>('today');
  const [currentEntry, setCurrentEntry] = useState<DailyEntry | null>(null);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const [setupData, setSetupData] = useState<{
    title: string;
    startDate: string;
    endDate: string;
    tasks: Partial<Task>[];
  }>({
    title: "Performance Protocol",
    startDate: getLocalDateString(), // Standardized local date
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
    tasks: [
      { id: crypto.randomUUID(), label: 'Strategic Planning', type: TaskType.BINARY },
      { id: crypto.randomUUID(), label: 'Focus Blocks', type: TaskType.QUANTITATIVE, unit: 'hrs' }
    ]
  });

  useEffect(() => {
    localStorage.setItem('shado_track_state', JSON.stringify(state)); //
  }, [state]);

  useEffect(() => {
    if (state.currentGoal) {
      const todayStr = getLocalDateString();
      const existing = state.history.find(h => h.date === todayStr);
      if (existing) {
        setCurrentEntry(existing);
      } else {
        const newEntry = { date: todayStr, results: {} };
        setCurrentEntry(newEntry);
        // Ensure new empty entry exists in history
        setState(prev => ({ ...prev, history: [...prev.history, newEntry] }));
      }
    } else {
      setActiveTab('setup');
    }
  }, [state.currentGoal]);

  const handleTaskChange = (taskId: string, val: BinaryResult | number) => {
    if (!currentEntry) return;
    const todayStr = getLocalDateString();
    
    const updatedEntry = {
      ...currentEntry,
      results: { ...currentEntry.results, [taskId]: val }
    };
    setCurrentEntry(updatedEntry);

    setState(prev => {
      const filteredHistory = prev.history.filter(h => h.date !== todayStr);
      return { ...prev, history: [...filteredHistory, updatedEntry] };
    });
  };

  const addTaskToSetup = () => {
    setSetupData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: crypto.randomUUID(), label: '', type: TaskType.BINARY }] // Better ID generation
    }));
  };

  const removeTaskFromSetup = (id: string) => {
    setSetupData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const updateTaskInSetup = (id: string, updates: Partial<Task>) => {
    setSetupData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const onDragStartSetup = (index: number) => { dragItem.current = index; };
  const onDragOverSetup = (index: number) => { dragOverItem.current = index; };

  const onDragEndSetup = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const copy = [...setupData.tasks];
      const draggedItemContent = copy[dragItem.current];
      copy.splice(dragItem.current, 1);
      copy.splice(dragOverItem.current, 0, draggedItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setSetupData(prev => ({ ...prev, tasks: copy }));
    }
  };

  const onDragStartDaily = (index: number) => { dragItem.current = index; };
  const onDragOverDaily = (index: number) => { dragOverItem.current = index; };

  const onDragEndDaily = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && state.currentGoal) {
      const copy = [...state.currentGoal.tasks];
      const draggedItemContent = copy[dragItem.current];
      copy.splice(dragItem.current, 1);
      copy.splice(dragOverItem.current, 0, draggedItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setState(prev => ({
        ...prev,
        currentGoal: prev.currentGoal ? { ...prev.currentGoal, tasks: copy } : null
      }));
    }
  };

  const finalizeGoal = () => {
    if (!setupData.title || setupData.tasks.length === 0 || setupData.tasks.some(t => !t.label)) {
      alert("Please complete all task labels.");
      return;
    }
    
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: setupData.title,
      startDate: new Date(setupData.startDate).toISOString(),
      endDate: new Date(setupData.endDate).toISOString(),
      tasks: setupData.tasks as Task[]
    };
    
    setState({ currentGoal: newGoal, history: [] });
    setActiveTab('today');
  };

  const renderSetup = () => (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-32 px-1">
      <header className="mb-8 text-center">
        <div className="inline-block w-16 h-16 rounded-3xl bg-neutral-800 border border-neutral-700 mb-6 shadow-2xl flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/10"></div>
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-2 text-white">Shado Setup</h1>
        <p className="text-white/30 text-sm italic">Architecture of discipline.</p>
      </header>

      <GlassCard className="mb-6">
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Protocol Title</label>
            <input 
              type="text" 
              value={setupData.title}
              onChange={(e) => setSetupData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Inception</label>
              <input 
                type="date" 
                value={setupData.startDate}
                onChange={(e) => setSetupData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-4 py-3 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Completion</label>
              <input 
                type="date" 
                value={setupData.endDate}
                onChange={(e) => setSetupData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-4 py-3 text-white text-xs"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Operational Units</h2>
        <button onClick={addTaskToSetup} className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full uppercase">+</button>
      </div>

      <div className="space-y-1">
        {setupData.tasks.map((t, idx) => (
          <TaskSetupItem 
            key={t.id} 
            task={t} 
            index={idx}
            onUpdate={(u) => updateTaskInSetup(t.id!, u)} 
            onRemove={() => removeTaskFromSetup(t.id!)}
            onDragStart={onDragStartSetup}
            onDragOver={onDragOverSetup}
            onDragEnd={onDragEndSetup}
          />
        ))}
      </div>

      <button onClick={finalizeGoal} className="w-full mt-8 py-5 rounded-3xl bg-white text-black font-black uppercase">INITIALIZE SHADO</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen px-4 py-8 relative">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-baseline gap-1">
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">SHADO</h1>
        </div>
      </header>

      {activeTab === 'setup' && renderSetup()}
      {activeTab === 'today' && state.currentGoal && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Dashboard goal={state.currentGoal} />
          <div className="space-y-1 mt-6">
            {state.currentGoal.tasks.map((task, idx) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={idx}
                value={currentEntry?.results[task.id]}
                onChange={(val) => handleTaskChange(task.id, val)}
                onDragStart={onDragStartDaily}
                onDragOver={onDragOverDaily}
                onDragEnd={onDragEndDaily}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'insights' && state.currentGoal && <Insights state={state} />}

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] glass-dark rounded-full p-2 flex justify-around items-center z-50 border border-white/5">
        <button onClick={() => setActiveTab('today')} className={`flex-1 py-3 text-[9px] font-bold uppercase ${activeTab === 'today' ? 'text-white' : 'text-white/20'}`}>Active</button>
        <button onClick={() => setActiveTab('insights')} className={`flex-1 py-3 text-[9px] font-bold uppercase ${activeTab === 'insights' ? 'text-white' : 'text-white/20'}`}>Insights</button>
        <button onClick={() => { if(confirm("Terminate protocol?")) { setState({ currentGoal: null, history: [] }); setActiveTab('setup'); } }} className="flex-1 py-3 text-[9px] font-bold uppercase text-white/20">Reset</button>
      </nav>
    </div>
  );
};

export default App;
