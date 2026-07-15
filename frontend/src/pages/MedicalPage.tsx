// =============================================================================
// MEDICAL PAGE
// =============================================================================

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Heart, MapPin, Clock, AlertTriangle, Phone, Activity, RefreshCw, FileText } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { useAI } from '../hooks/useAI';
import { useIncidentStore } from '../store/useAppStore';
import { MOCK_POIS } from '../data/mockData';
import { aiService } from '../services/aiService';
import { timeAgo } from '../utils/helpers';
import { cn } from '../utils/helpers';
import toast from 'react-hot-toast';

const MEDICAL_STATS = [
  { label: 'Active Cases', value: 7, trend: '+2', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { label: 'Avg Response', value: '4.2 min', trend: '-8%', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Team Members', value: 24, trend: '', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { label: 'AEDs Online', value: 12, trend: '', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
];

const MEDICAL_POIS = MOCK_POIS.filter(p => p.type === 'medical');

export const MedicalPage: React.FC = () => {
  const { data: aiData, isLoading, reportEmergency, isUsingMock } = useAI();
  const { incidents } = useIncidentStore();

  const medicalIncidents = incidents.filter(i => i.type === 'medical' && i.status !== 'resolved');

  const handleGenerateReport = async (incidentId: string) => {
    try {
      const report = await aiService.generateIncidentReport(incidentId, {
        role: 'medical',
        language: 'en',
        timestamp: new Date().toISOString(),
      });
      toast.success('Incident report generated!');
      console.log('Report:', report);
    } catch {
      toast.error('Report generation failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <SectionHeader
        title="Medical Command"
        subtitle="Patient monitoring, triage, and AI-assisted medical response"
        icon={Stethoscope}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MEDICAL_STATS.map(({ label, value, trend, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={cn('glass-card p-5 border text-center', color)}
          >
            <div className="text-2xl font-bold font-display">{value}</div>
            <div className="text-xs mt-0.5 opacity-70">{label}</div>
            {trend && <div className="text-xs mt-1 font-medium opacity-90">{trend}</div>}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Medical Incidents */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400 animate-pulse" />
            Active Medical Incidents
          </h3>
          <div className="space-y-4">
            {medicalIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active medical incidents</p>
            ) : (
              medicalIncidents.map((inc) => (
                <div key={inc.id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{inc.id}</span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          inc.severity === 'high' ? 'bg-orange-500/15 text-orange-400' : 'bg-red-500/15 text-red-400'
                        )}>
                          {inc.severity.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground mt-1">{inc.description}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{inc.location.zoneLabel}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(inc.reportedAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGenerateReport(inc.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25 text-xs font-medium hover:bg-blue-500/25 transition-colors flex-shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      AI Report
                    </button>
                  </div>
                  {inc.assignedTeam && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{inc.assignedTeam} — on scene</span>
                    </div>
                  )}
                  {/* Mini timeline */}
                  <div className="space-y-1">
                    {inc.timeline.slice(-2).map((entry, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                        {entry.event} • {timeAgo(entry.timestamp)}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Medical stations + AI */}
        <div className="space-y-5">
          {/* Medical stations */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              Medical Stations
            </h3>
            <div className="space-y-3">
              {MEDICAL_POIS.map((poi) => (
                <div key={poi.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                  <div className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    poi.currentStatus === 'open' ? 'bg-emerald-400' :
                    poi.currentStatus === 'busy' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{poi.label}</div>
                    <div className="text-xs text-muted-foreground">Section {poi.section}</div>
                  </div>
                  <span className={cn('text-xs font-medium',
                    poi.currentStatus === 'open' ? 'text-emerald-400' :
                    poi.currentStatus === 'busy' ? 'text-amber-400' : 'text-red-400'
                  )}>
                    {poi.currentStatus}
                    {poi.waitTimeMinutes && ` · ${poi.waitTimeMinutes}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <AIResponseCard
            response={aiData}
            isLoading={isLoading}
            isUsingMock={isUsingMock}
            title="AI Medical Advisor"
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};
