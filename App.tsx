
import React, { useState, useEffect, useRef } from 'react';
import { AppState, Goal, Task, TaskType, DailyEntry, BinaryResult } from './types';
import GlassCard from './components/GlassCard';
import Dashboard from './components/Dashboard';
import TaskCard from './components/TaskCard';
import Insights from './components/Insights';
import TaskSetupItem from './components/TaskSetupItem';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('shado_track_state');
    return saved ? JSON.parse(saved) : { currentGoal: null, history: [] };
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
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tasks: [
      { id: '1', label: 'Strategic Planning', type: TaskType.BINARY },
      { id: '2', label: 'Focus Blocks', type: TaskType.QUANTITATIVE, unit: 'hrs' }
    ]
  });

  useEffect(() => {
    localStorage.setItem('shado_track_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.currentGoal) {
      const todayStr = new Date().toISOString().split('T')[0];
      const existing = state.history.find(h => h.date === todayStr);
      if (existing) {
        setCurrentEntry(existing);
      } else {
        setCurrentEntry({ date: todayStr, results: {} });
      }
    } else {
      setActiveTab('setup');
    }
  }, [state.currentGoal, state.history]);

  const handleTaskChange = (taskId: string, val: BinaryResult | number) => {
    if (!currentEntry) return;
    const updatedEntry = {
      ...currentEntry,
      results: { ...currentEntry.results, [taskId]: val }
    };
    setCurrentEntry(updatedEntry);

    const newHistory = state.history.filter(h => h.date !== updatedEntry.date);
    setState(prev => ({ ...prev, history: [...newHistory, updatedEntry] }));
  };

  const addTaskToSetup = () => {
    setSetupData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: Math.random().toString(36).substr(2, 9), label: '', type: TaskType.BINARY }]
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

  const onDragStartSetup = (index: number) => {
    dragItem.current = index;
  };

  const onDragOverSetup = (index: number) => {
    dragOverItem.current = index;
  };

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

  const onDragStartDaily = (index: number) => {
    dragItem.current = index;
  };

  const onDragOverDaily = (index: number) => {
    dragOverItem.current = index;
  };

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
      id: Math.random().toString(36).substr(2, 9),
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
              className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Inception</label>
              <input 
                type="date" 
                value={setupData.startDate}
                onChange={(e) => setSetupData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-4 py-3 text-white text-xs focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Completion</label>
              <input 
                type="date" 
                value={setupData.endDate}
                onChange={(e) => setSetupData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-4 py-3 text-white text-xs focus:outline-none focus:border-white/20"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Operational Units</h2>
        <button 
          onClick={addTaskToSetup}
          className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all uppercase"
        >
          + Add Unit
        </button>
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

      <button 
        onClick={finalizeGoal}
        className="w-full mt-8 py-5 rounded-3xl bg-white text-black font-black text-lg hover:bg-neutral-200 transition-all tracking-tight uppercase"
      >
        INITIALIZE SHADO
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen px-4 py-8 relative">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-baseline gap-1">
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">SHADO</h1>
          <span className="text-xs font-bold tracking-[0.4em] text-white/20 uppercase">PROTOCOL</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/5 glass flex items-center justify-center">
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
        </div>
      </header>

      {activeTab === 'setup' && renderSetup()}

      {activeTab === 'today' && state.currentGoal && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-2">
            <h2 className="text-xl font-medium tracking-tight text-white/60">{state.currentGoal.title}</h2>
          </div>
          <Dashboard goal={state.currentGoal} />
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">Current Deck</h2>
          <div className="space-y-1">
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
          <div className="pb-24"></div>
        </div>
      )}

      {activeTab === 'insights' && state.currentGoal && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-2xl font-black tracking-tight mb-6 text-white uppercase">Analytics</h2>
           <Insights state={state} />
        </div>
      )}

      <footer className="mt-auto py-8 text-center animate-in fade-in duration-1000">
        <p className="text-[10px] font-bold tracking-[0.4em] text-white/10 uppercase">
          © nagu
        </p>
      </footer>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] glass-dark rounded-full p-2 flex justify-around items-center z-50 border border-white/5 shadow-2xl">
        <button 
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${activeTab === 'today' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-widest">Active</span>
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${activeTab === 'insights' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-widest">Insights</span>
        </button>
        <button 
          onClick={() => { if(confirm("Terminate protocol and reset?")) { setState({ currentGoal: null, history: [] }); setActiveTab('setup'); } }}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${activeTab === 'setup' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-widest">Config</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
