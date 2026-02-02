
import React from 'react';
import { Goal } from '../types';
import GlassCard from './GlassCard';

interface DashboardProps {
  goal: Goal;
}

const Dashboard: React.FC<DashboardProps> = ({ goal }) => {
  const getDaysRemaining = () => {
    const today = new Date();
    const end = new Date(goal.endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();
  const totalDays = Math.ceil((new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100));

  return (
    <div className="space-y-6 mb-8">
      <GlassCard className="text-center relative overflow-hidden border-white/5 bg-neutral-900/40">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-white/30 tracking-[0.4em] uppercase mb-2">Days Remaining</p>
          <div className="text-8xl font-black text-white text-glow-neutral mb-4 tracking-tighter">
            {daysRemaining}
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-white/20 italic tracking-wider">UNTIL {new Date(goal.endDate).toLocaleDateString().toUpperCase()}</p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 bg-black border-white/5" variant="dark">
          <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-1">Metrics</p>
          <p className="text-2xl font-black text-white">{goal.tasks.length}</p>
        </GlassCard>
        <GlassCard className="p-4 bg-black border-white/5" variant="dark">
          <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-1">Stability</p>
          <p className="text-2xl font-black text-neutral-400">NOMINAL</p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
