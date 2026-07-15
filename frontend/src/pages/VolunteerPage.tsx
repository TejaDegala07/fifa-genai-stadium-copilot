// =============================================================================
// VOLUNTEER HUB PAGE
// =============================================================================

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HandHelping, Clock, MapPin, CheckCircle, AlertTriangle, Loader2, RefreshCw, Star } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { useAI } from '../hooks/useAI';
import { MOCK_VOLUNTEER_TASKS } from '../data/mockData';
import { cn, timeAgo, formatDuration } from '../utils/helpers';
import type { VolunteerTask } from '../types';
import toast from 'react-hot-toast';

const PRIORITY_STYLES = {
  low: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  medium: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  high: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  critical: 'border-red-500/20 bg-red-500/5 text-red-400',
};

const TaskCard: React.FC<{ task: VolunteerTask; onAccept: (id: string) => void; index: number }> = ({
  task, onAccept, index
}) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.07 }}
    className={cn('glass-card-hover p-5 border', PRIORITY_STYLES[task.priority])}
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('text-xs font-bold uppercase px-2 py-0.5 rounded-full border', PRIORITY_STYLES[task.priority])}>
            {task.priority}
          </span>
          <span className="text-xs text-muted-foreground font-mono">{task.id}</span>
        </div>
        <h3 className="font-semibold text-foreground">{task.title}</h3>
      </div>
      {task.status === 'unassigned' && (
        <button
          onClick={() => onAccept(task.id)}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-primary/15 text-primary border border-primary/30 text-xs font-semibold hover:bg-primary/25 transition-colors"
          aria-label={`Accept task: ${task.title}`}
        >
          Accept
        </button>
      )}
      {task.status !== 'unassigned' && (
        <span className={cn(
          'flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium',
          task.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400' :
          task.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
          'bg-amber-500/15 text-amber-400'
        )}>
          {task.status.replace('_', ' ')}
        </span>
      )}
    </div>

    <p className="text-sm text-foreground/80 leading-relaxed mb-3">{task.description}</p>

    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5" />
        {task.zone}
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        ~{formatDuration(task.estimatedMinutes)}
      </div>
      <div className="flex items-center gap-1">
        <Star className="w-3.5 h-3.5" />
        {timeAgo(task.createdAt)}
      </div>
    </div>

    {task.skills && task.skills.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {task.skills.map((skill) => (
          <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-muted-foreground">
            {skill}
          </span>
        ))}
      </div>
    )}
  </motion.div>
);

export const VolunteerPage: React.FC = () => {
  const { data: aiData, isLoading, assignTasks, isUsingMock } = useAI();

  useEffect(() => {
    assignTasks();
  }, []);

  const handleAccept = (id: string) => {
    toast.success(`Task ${id} accepted! Navigation to zone started.`);
  };

  const counts = {
    critical: MOCK_VOLUNTEER_TASKS.filter(t => t.priority === 'critical').length,
    unassigned: MOCK_VOLUNTEER_TASKS.filter(t => t.status === 'unassigned').length,
    inProgress: MOCK_VOLUNTEER_TASKS.filter(t => t.status === 'in_progress').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <SectionHeader
        title="Volunteer Hub"
        subtitle="AI-assigned tasks with priority routing and real-time guidance"
        icon={HandHelping}
        actions={
          <button
            onClick={() => assignTasks()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 text-sm hover:bg-primary/25 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh AI Assignments
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical Tasks', value: counts.critical, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
          { label: 'Unassigned', value: counts.unassigned, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'In Progress', value: counts.inProgress, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        ].map(({ label, value, color }) => (
          <div key={label} className={cn('glass-card p-4 text-center border', color)}>
            <div className="text-2xl font-bold font-display">{value}</div>
            <div className="text-xs mt-0.5 opacity-70">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task list */}
        <div className="lg:col-span-2 space-y-4">
          {MOCK_VOLUNTEER_TASKS.map((task, i) => (
            <TaskCard key={task.id} task={task} onAccept={handleAccept} index={i} />
          ))}
        </div>

        {/* Right: AI assignments */}
        <div className="space-y-4">
          <AIResponseCard
            response={aiData}
            isLoading={isLoading}
            isUsingMock={isUsingMock}
            title="AI Task Assignment"
          />

          {/* My Status */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4">My Status</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Current Zone', value: 'West Lower (G)' },
                { label: 'Status', value: 'Available' },
                { label: 'Tasks Completed', value: '3 today' },
                { label: 'Languages', value: 'EN, ES' },
                { label: 'Certifications', value: 'First Aid, Crowd Mgmt' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
