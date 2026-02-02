
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AppState, TaskType, BinaryResult } from '../types';
import GlassCard from './GlassCard';

interface InsightsProps {
  state: AppState;
}

const COLORS = ['#ffffff', '#a3a3a3', '#525252', '#262626', '#171717'];

const Insights: React.FC<InsightsProps> = ({ state }) => {
  const { currentGoal, history } = state;

  const stats = useMemo(() => {
    if (!currentGoal || history.length === 0) return null;

    let totalBinaryCount = 0;
    let successBinaryCount = 0;
    const failureReasons: Record<string, number> = {};

    history.forEach(entry => {
      Object.entries(entry.results).forEach(([taskId, result]) => {
        const task = currentGoal.tasks.find(t => t.id === taskId);
        if (task?.type === TaskType.BINARY) {
          totalBinaryCount++;
          const res = result as BinaryResult;
          if (res.success) {
            successBinaryCount++;
          } else if (res.reason) {
            failureReasons[res.reason] = (failureReasons[res.reason] || 0) + 1;
          }
        }
      });
    });

    const successRate = totalBinaryCount > 0 ? (successBinaryCount / totalBinaryCount) * 100 : 0;
    const quantTask = currentGoal.tasks.find(t => t.type === TaskType.QUANTITATIVE);
    const trendData = history.slice(-7).map(entry => ({
      date: entry.date.split('-').slice(1).join('/'),
      val: Number(entry.results[quantTask?.id || '']) || 0
    }));

    const reasonData = Object.entries(failureReasons).map(([name, value]) => ({ name, value }));

    return { successRate, trendData, reasonData, quantLabel: quantTask?.label || 'Value' };
  }, [currentGoal, history]);

  if (!stats) {
    return (
      <GlassCard className="text-center py-20 bg-neutral-900/20 border-white/5">
        <p className="text-white/20 italic text-sm">Awaiting operational data...</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center justify-center p-8 bg-black border-white/5">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Integrity</p>
          <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
               <circle 
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={364}
                strokeDashoffset={364 - (364 * stats.successRate) / 100}
                className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all duration-1000"
               />
             </svg>
             <span className="absolute text-3xl font-black text-white">{Math.round(stats.successRate)}%</span>
          </div>
        </GlassCard>

        {stats.reasonData.length > 0 && (
          <GlassCard className="p-4 bg-black border-white/5">
             <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Deviation Source</p>
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                    data={stats.reasonData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                   >
                     {stats.reasonData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </GlassCard>
        )}
      </div>

      {stats.trendData.length > 0 && (
        <GlassCard className="p-4 bg-black border-white/5">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6">{stats.quantLabel.toUpperCase()} OUTPUT</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.1)" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.1)" fontSize={9} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#000', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                   labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#ffffff" 
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                  strokeWidth={2}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Insights;
