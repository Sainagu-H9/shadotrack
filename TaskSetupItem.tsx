
import React from 'react';
import { Task, TaskType } from '../types';
import GlassCard from './GlassCard';

interface TaskSetupItemProps {
  task: Partial<Task>;
  index: number;
  onUpdate: (updates: Partial<Task>) => void;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
}

const TaskSetupItem: React.FC<TaskSetupItemProps> = ({ 
  task, 
  index, 
  onUpdate, 
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd
}) => {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDragEnd={onDragEnd}
      className="group"
    >
      <GlassCard 
        variant="dark" 
        className="p-4 mb-3 border-l-2 border-l-white/20 flex items-center gap-3 bg-neutral-900/60 border-white/5 group-hover:border-l-white transition-all"
      >
        <div className="cursor-grab active:cursor-grabbing text-white/5 hover:text-white/40 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2z" />
          </svg>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-1.5">
              <input
                type="text"
                placeholder="Unit Label"
                value={task.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="bg-transparent border-b border-white/5 focus:border-white/20 outline-none text-white text-base font-bold w-full transition-colors uppercase tracking-tight"
              />
              <input
                type="text"
                placeholder="Detailed objectives..."
                value={task.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className="bg-transparent text-[10px] text-white/20 focus:text-white/40 outline-none w-full italic"
              />
            </div>
            <button 
              onClick={onRemove}
              className="text-white/10 hover:text-rose-500 transition-colors p-1 ml-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/5">
              <button
                onClick={() => onUpdate({ type: TaskType.BINARY, unit: undefined })}
                className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest transition-all ${
                  task.type === TaskType.BINARY 
                  ? 'bg-white text-black' 
                  : 'text-white/20'
                }`}
              >
                BINARY
              </button>
              <button
                onClick={() => onUpdate({ type: TaskType.QUANTITATIVE })}
                className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest transition-all ${
                  task.type === TaskType.QUANTITATIVE 
                  ? 'bg-white text-black' 
                  : 'text-white/20'
                }`}
              >
                VALUE
              </button>
            </div>

            {task.type === TaskType.QUANTITATIVE && (
              <input
                type="text"
                placeholder="UNIT"
                value={task.unit || ''}
                onChange={(e) => onUpdate({ unit: e.target.value })}
                className="bg-black/40 border border-white/5 rounded-lg px-3 py-1 text-[9px] text-white font-black focus:outline-none focus:border-white/20 w-16 uppercase tracking-widest"
              />
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TaskSetupItem;
