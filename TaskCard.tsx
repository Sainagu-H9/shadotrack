
import React, { useState } from 'react';
import { Task, TaskType, BinaryResult } from '../types';
import GlassCard from './GlassCard';

interface TaskCardProps {
  task: Task;
  index: number;
  value: BinaryResult | number | undefined;
  onChange: (val: BinaryResult | number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  index,
  value, 
  onChange,
  onDragStart,
  onDragOver,
  onDragEnd
}) => {
  const [showReason, setShowReason] = useState(
    task.type === TaskType.BINARY && 
    (value as BinaryResult)?.success === false
  );

  const handleBinaryChange = (success: boolean) => {
    if (!success) {
      setShowReason(true);
      onChange({ success, reason: (value as BinaryResult)?.reason || '' });
    } else {
      setShowReason(false);
      onChange({ success, reason: undefined });
    }
  };

  const handleReasonChange = (reason: string) => {
    onChange({ success: false, reason });
  };

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
      <GlassCard className="mb-4 overflow-hidden relative group-hover:border-white/20 transition-all border-white/5 bg-neutral-900/30">
        <div className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-white/5 group-hover:text-white/30 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2z" />
          </svg>
        </div>

        <div className="pl-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-base tracking-tight leading-tight text-white/90">{task.label.toUpperCase()}</h3>
              {task.description && (
                <p className="text-[10px] text-white/20 mt-1 leading-relaxed max-w-[90%] font-medium">{task.description}</p>
              )}
            </div>
            {task.type === TaskType.QUANTITATIVE && task.unit && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 whitespace-nowrap ml-2 uppercase">
                {task.unit}
              </span>
            )}
          </div>

          {task.type === TaskType.BINARY ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleBinaryChange(true)}
                  className={`py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 border ${
                    (value as BinaryResult)?.success === true
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 text-glow-emerald'
                      : 'bg-white/5 border-white/5 text-white/20 grayscale'
                  }`}
                >
                  <span className="font-black text-xs tracking-widest">SUCCESS</span>
                </button>
                <button
                  onClick={() => handleBinaryChange(false)}
                  className={`py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 border ${
                    (value as BinaryResult)?.success === false
                      ? 'bg-rose-900/20 border-rose-800/50 text-rose-500 text-glow-crimson'
                      : 'bg-white/5 border-white/5 text-white/20 grayscale'
                  }`}
                >
                  <span className="font-black text-xs tracking-widest">FAILURE</span>
                </button>
              </div>

              <div 
                className={`transition-all duration-300 overflow-hidden ${
                  showReason ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <input
                  type="text"
                  placeholder="Reason for deviation..."
                  value={(value as BinaryResult)?.reason || ''}
                  onChange={(e) => handleReasonChange(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-rose-200/60 placeholder-white/10 focus:outline-none focus:border-rose-900/40 transition-colors italic"
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="number"
                placeholder="0.0"
                value={value as number || ''}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-4 text-3xl font-black text-white placeholder-white/5 focus:outline-none focus:border-white/20 text-glow-neutral transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default TaskCard;
