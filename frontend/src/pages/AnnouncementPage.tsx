// =============================================================================
// ANNOUNCEMENT GENERATOR PAGE
// =============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Smartphone, Share2, Radio, Globe,
  Copy, CheckCheck, Wand2, Loader2, Volume2, Mic
} from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { useAI } from '../hooks/useAI';
import { useUserStore } from '../store/useAppStore';
import { aiService } from '../services/aiService';
import { sanitizeText } from '../utils/helpers';
import { cn } from '../utils/helpers';
import { LANGUAGES } from '../data/constants';
import type { AnnouncementOutput } from '../types';
import toast from 'react-hot-toast';

type Tone = 'professional' | 'friendly' | 'urgent' | 'emergency';

const TONE_OPTIONS: { value: Tone; label: string; description: string; color: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal, authoritative', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, approachable', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  { value: 'urgent', label: 'Urgent', description: 'Immediate attention', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  { value: 'emergency', label: 'Emergency', description: 'Critical action', color: 'border-red-500/30 bg-red-500/10 text-red-400' },
];

const QUICK_TEMPLATES = [
  'Gate B is overcrowded. Fans please use Gate D or F.',
  'Medical team needed at Section E, Row 22.',
  'Match kickoff in 15 minutes. Please proceed to your seats.',
  'Lost child — approximately 7 years old, green shirt, near Concession G2.',
  'Post-match: All fans please proceed calmly to the nearest exit.',
  'NJ Transit trains are delayed 15 minutes. Shuttle buses available.',
];

const OutputBlock: React.FC<{ label: string; icon: React.ElementType; content: string; iconColor?: string }> = ({
  label, icon: Icon, content, iconColor = 'text-primary'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', iconColor)} aria-hidden="true" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-white/8"
          aria-label={`Copy ${label} announcement`}
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-foreground leading-relaxed">{content}</p>
        <div className="mt-2 text-xs text-muted-foreground">{content.length} characters</div>
      </div>
    </div>
  );
};

export const AnnouncementPage: React.FC = () => {
  const [situation, setSituation] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [includeTranslations, setIncludeTranslations] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [output, setOutput] = useState<AnnouncementOutput | null>(null);
  const [aiResponse, setAIResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserStore();

  const handleGenerate = async () => {
    const clean = sanitizeText(situation);
    if (!clean) {
      toast.error('Please describe the situation first');
      return;
    }
    setIsLoading(true);
    try {
      const { ai, output: o } = await aiService.generateAnnouncement(
        {
          situation: clean,
          tone,
          targetAudience: 'all',
          language: user.language,
          includeTranslations,
        },
        {
          role: user.role,
          language: user.language,
          timestamp: new Date().toISOString(),
        }
      );
      setOutput(o);
      setAIResponse(ai);
      toast.success('Announcements generated!');
    } catch (err) {
      toast.error('Generation failed — using demo output');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <SectionHeader
        title="AI Announcement Generator"
        subtitle="Generate professional multi-format, multilingual announcements instantly"
        icon={Megaphone}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Situation input */}
          <div className="glass-card p-5">
            <label htmlFor="situation" className="block text-sm font-semibold text-foreground mb-3">
              What's the situation?
            </label>
            <textarea
              id="situation"
              value={situation}
              onChange={(e) => setSituation(sanitizeText(e.target.value))}
              placeholder="E.g. Gate B is overcrowded with fans not moving. Alternative routing needed..."
              rows={4}
              maxLength={500}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/40 focus:bg-white/8 transition-all"
            />
            <div className="mt-2 text-xs text-muted-foreground text-right">{situation.length}/500</div>

            {/* Quick Templates */}
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Quick templates:</p>
              <div className="space-y-1">
                {QUICK_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSituation(t)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors truncate"
                  >
                    → {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tone selector */}
          <div className="glass-card p-5">
            <p className="text-sm font-semibold text-foreground mb-3">Tone</p>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map(({ value, label, description, color }) => (
                <button
                  key={value}
                  onClick={() => setTone(value)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all duration-200',
                    tone === value ? color : 'border-white/10 text-muted-foreground hover:border-white/20'
                  )}
                  aria-pressed={tone === value}
                >
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="glass-card p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Options</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIncludeTranslations(!includeTranslations)}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors duration-200 relative flex-shrink-0',
                  includeTranslations ? 'bg-primary' : 'bg-white/20'
                )}
                role="switch"
                aria-checked={includeTranslations}
                aria-label="Include multilingual translations"
                tabIndex={0}
              >
                <span className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                  includeTranslations ? 'left-5' : 'left-0.5'
                )} />
              </div>
              <span className="text-sm text-foreground">Include 7-language translations</span>
            </label>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={!situation.trim() || isLoading}
            className={cn(
              'w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all duration-200',
              situation.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-glow-blue'
                : 'bg-white/10 text-muted-foreground cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="w-5 h-5" /> Generate All Formats</>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-3 space-y-5">
          <AnimatePresence>
            {output ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <OutputBlock
                  label="📢 PA Announcement"
                  icon={Volume2}
                  content={output.pa}
                  iconColor="text-blue-400"
                />
                <OutputBlock
                  label="📱 SMS / Push Notification"
                  icon={Smartphone}
                  content={output.sms}
                  iconColor="text-emerald-400"
                />
                <OutputBlock
                  label="📲 Social Media"
                  icon={Share2}
                  content={output.socialMedia}
                  iconColor="text-purple-400"
                />
                <OutputBlock
                  label="📳 In-App Notification"
                  icon={Megaphone}
                  content={output.app}
                  iconColor="text-amber-400"
                />

                {/* Translations */}
                {output.translations && includeTranslations && (
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-foreground">Multilingual Versions</h3>
                    </div>
                    {/* Language tab strip */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide mb-4 pb-1">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setSelectedLang(lang.code)}
                          className={cn(
                            'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                            selectedLang === lang.code
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : 'text-muted-foreground border-white/10 hover:border-white/20'
                          )}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.code.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedLang}
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="p-4 rounded-xl bg-white/3 border border-white/8"
                      >
                        <p className="text-sm text-foreground leading-relaxed">
                          {output.translations[selectedLang as keyof typeof output.translations] ?? output.pa}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                {aiResponse && (
                  <AIResponseCard
                    response={aiResponse}
                    title="AI Generation Analysis"
                    compact={true}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Megaphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Ready to Generate</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Describe the situation and choose a tone. AI will generate PA, SMS, social media, and in-app announcements in 7 languages.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
