// =============================================================================
// EMERGENCY COPILOT PAGE
// =============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon, Heart, Flame, Baby, Package,
  AlertTriangle, Wrench, CloudRain, Send, Mic,
  MicOff, Clock, CheckCircle, Phone, Radio
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { useAI } from '../hooks/useAI';
import { useVoice } from '../hooks/useVoice';
import { useIncidentStore, useUserStore } from '../store/useAppStore';
import { MOCK_INCIDENTS } from '../data/mockData';
import {
  getIncidentTypeLabel, getSeverityBgClass,
  timeAgo, formatTime, sanitizeText
} from '../utils/helpers';
import { cn } from '../utils/helpers';
import type { IncidentType } from '../data/constants';
import { INCIDENT_TYPES } from '../data/constants';
import type { Incident } from '../types';
import toast from 'react-hot-toast';

// ---- Incident Type Selector ------------------------------------------------

const INCIDENT_OPTIONS = [
  { type: INCIDENT_TYPES.MEDICAL, label: 'Medical', icon: Heart, color: 'text-red-400 bg-red-500/15 border-red-500/25', urgent: true },
  { type: INCIDENT_TYPES.FIGHT, label: 'Fight / Altercation', icon: AlertTriangle, color: 'text-orange-400 bg-orange-500/15 border-orange-500/25', urgent: true },
  { type: INCIDENT_TYPES.FIRE, label: 'Fire / Smoke', icon: Flame, color: 'text-red-500 bg-red-600/15 border-red-600/25', urgent: true },
  { type: INCIDENT_TYPES.LOST_CHILD, label: 'Lost Child', icon: Baby, color: 'text-amber-400 bg-amber-500/15 border-amber-500/25', urgent: false },
  { type: INCIDENT_TYPES.SUSPICIOUS_OBJECT, label: 'Suspicious Object', icon: Package, color: 'text-orange-400 bg-orange-500/15 border-orange-500/25', urgent: true },
  { type: INCIDENT_TYPES.STAMPEDE, label: 'Crowd Surge', icon: AlertOctagon, color: 'text-red-400 bg-red-500/15 border-red-500/25', urgent: true },
  { type: INCIDENT_TYPES.INFRASTRUCTURE, label: 'Infrastructure', icon: Wrench, color: 'text-blue-400 bg-blue-500/15 border-blue-500/25', urgent: false },
  { type: INCIDENT_TYPES.WEATHER, label: 'Weather Hazard', icon: CloudRain, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/25', urgent: false },
];

// ---- Incident Timeline -----------------------------------------------------

const IncidentTimeline: React.FC<{ incident: Incident }> = ({ incident }) => (
  <div className="space-y-2">
    {incident.timeline.map((entry, i) => (
      <div key={i} className="flex gap-3 text-sm">
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
          {i < incident.timeline.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
        </div>
        <div className="pb-3 min-w-0">
          <div className="font-medium text-foreground">{entry.event}</div>
          <div className="text-xs text-muted-foreground">{entry.actor} • {timeAgo(entry.timestamp)}</div>
          {entry.note && <div className="text-xs text-muted-foreground mt-0.5 italic">{entry.note}</div>}
        </div>
      </div>
    ))}
  </div>
);

// ---- Active Incident Card --------------------------------------------------

const IncidentCard: React.FC<{ incident: Incident; onSelect: (i: Incident) => void }> = ({
  incident, onSelect
}) => {
  const statusColors: Record<string, string> = {
    reported: 'bg-amber-500/15 text-amber-400',
    acknowledged: 'bg-blue-500/15 text-blue-400',
    in_progress: 'bg-orange-500/15 text-orange-400',
    resolved: 'bg-emerald-500/15 text-emerald-400',
    closed: 'bg-gray-500/15 text-gray-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'glass-card-hover p-4 cursor-pointer border',
        incident.severity === 'critical' ? 'border-red-500/30' :
        incident.severity === 'high' ? 'border-orange-500/25' : 'border-white/8'
      )}
      onClick={() => onSelect(incident)}
      role="button"
      tabIndex={0}
      aria-label={`View incident ${incident.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
          incident.severity === 'critical' ? 'bg-red-400 animate-pulse' :
          incident.severity === 'high' ? 'bg-orange-400' : 'bg-amber-400'
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">{incident.id}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[incident.status])}>
              {incident.status.replace('_', ' ')}
            </span>
          </div>
          <h4 className="font-semibold text-sm text-foreground">{getIncidentTypeLabel(incident.type)}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{incident.location.zoneLabel}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(incident.reportedAt)}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ---- Main Page -------------------------------------------------------------

export const EmergencyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: aiData, isLoading, reportEmergency, isUsingMock } = useAI();
  const { incidents, addIncident, updateIncident } = useIncidentStore();
  const { user } = useUserStore();

  const { isListening, transcript, startListening, stopListening, isSupported } = useVoice(
    (text) => setDescription((prev) => prev + ' ' + text)
  );

  // Auto-open report form if ?action=report
  useEffect(() => {
    if (searchParams.get('action') === 'report') {
      setSelectedType(null);
    }
  }, [searchParams]);

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed'
  );

  const handleSubmit = async () => {
    if (!selectedType || !description.trim()) {
      toast.error('Please select incident type and provide a description');
      return;
    }

    const clean = sanitizeText(description);
    const loc = sanitizeText(location || `Section ${user.section ?? 'Unknown'}`);

    // Add to incident store
    const newIncident: Incident = {
      id: `INC-2026-${String(incidents.length + 100).padStart(3, '0')}`,
      type: selectedType,
      severity: ['fire', 'stampede', 'suspicious_object'].includes(selectedType) ? 'critical' :
                ['medical', 'fight'].includes(selectedType) ? 'high' : 'medium',
      location: { zoneId: 'user-report', zoneLabel: loc },
      reportedBy: user.name,
      reportedAt: new Date().toISOString(),
      status: 'reported',
      description: clean,
      timeline: [{
        timestamp: new Date().toISOString(),
        event: 'Incident reported via StadiumIQ app',
        actor: user.name,
      }],
    };

    addIncident(newIncident);
    await reportEmergency(selectedType, clean, loc);
    setSubmitted(true);
    toast.success('Emergency reported — AI triage complete');
  };

  const handleReset = () => {
    setSelectedType(null);
    setDescription('');
    setLocation('');
    setSubmitted(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <SectionHeader
        title="Emergency Copilot"
        subtitle="AI-powered incident triage, routing, and response coordination"
        icon={AlertOctagon}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-red-400 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>{activeIncidents.length} Active</span>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Report Form */}
        <div className="lg:col-span-2 space-y-5">
          {!submitted ? (
            <>
              {/* Incident Type */}
              <div className="glass-card p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">1</span>
                  What is happening?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INCIDENT_OPTIONS.map(({ type, label, icon: Icon, color, urgent }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200',
                        selectedType === type
                          ? `${color} scale-[1.02]`
                          : 'border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground'
                      )}
                      aria-pressed={selectedType === type}
                    >
                      {urgent && selectedType !== type && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" aria-label="Urgent" />
                      )}
                      <Icon className="w-6 h-6" aria-hidden="true" />
                      <span className="text-xs font-medium leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="glass-card p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">2</span>
                  Describe the situation
                </h2>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(sanitizeText(e.target.value))}
                    placeholder="Provide as much detail as possible — location, number of people involved, injuries, severity..."
                    rows={4}
                    maxLength={500}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/40 focus:bg-white/8 transition-all"
                    aria-label="Incident description"
                    aria-describedby="desc-count"
                  />
                  <div id="desc-count" className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    {description.length}/500
                  </div>
                </div>

                {/* Voice input */}
                {isSupported && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={cn(
                      'mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200',
                      isListening
                        ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                        : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8'
                    )}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                    aria-pressed={isListening}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isListening ? 'Listening... tap to stop' : 'Voice Description'}
                  </button>
                )}
              </div>

              {/* Location */}
              <div className="glass-card p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">3</span>
                  Location (optional — uses your section by default)
                </h2>
                <input
                  value={location}
                  onChange={(e) => setLocation(sanitizeText(e.target.value))}
                  placeholder={`E.g. Section E, Row 22, near Gate 5 (default: your section ${user.section})`}
                  maxLength={150}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-white/8 transition-all"
                  aria-label="Incident location"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!selectedType || !description.trim() || isLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all duration-200',
                  selectedType && description.trim() && !isLoading
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-glow-red'
                    : 'bg-white/10 text-muted-foreground cursor-not-allowed'
                )}
                aria-label="Submit emergency report"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Report Emergency — Get AI Response
                  </>
                )}
              </button>
            </>
          ) : (
            /* Submitted state */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 border-emerald-500/20 text-center space-y-4"
            >
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Incident Reported</h2>
              <p className="text-muted-foreground text-sm">
                Your report has been received and AI triage is complete. Emergency teams have been notified.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
                >
                  Report Another
                </button>
              </div>
            </motion.div>
          )}

          {/* AI Response */}
          {(aiData || isLoading) && (
            <AIResponseCard
              response={aiData}
              isLoading={isLoading}
              isUsingMock={isUsingMock}
              title="AI Emergency Triage"
            />
          )}
        </div>

        {/* Right: Active Incidents */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              Active Incidents ({activeIncidents.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
              {activeIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onSelect={setSelectedIncident}
                />
              ))}
            </div>
          </div>

          {/* Selected Incident Detail */}
          <AnimatePresence>
            {selectedIncident && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{selectedIncident.id}</h3>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                    aria-label="Close incident detail"
                  >
                    ✕
                  </button>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-foreground">{selectedIncident.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedIncident.location.zoneLabel}</p>
                </div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Timeline</h4>
                <IncidentTimeline incident={selectedIncident} />
                {selectedIncident.assignedTeam && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedIncident.assignedTeam}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
