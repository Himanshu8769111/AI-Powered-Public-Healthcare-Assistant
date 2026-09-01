import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, User, Bell, FileText, MapPin, AlertTriangle,
  LogOut, Menu, X, Brain, ChevronRight, Moon, Sun,
  Stethoscope, Mic, Send, RefreshCw, Languages, AlertCircle,
  ShieldCheck, ArrowRight, CheckCircle, Plus, Trash2, Phone,
  Mail, Edit3, Save, Camera, Clock, Pill, Heart, Home,
  Siren, Navigation, Shield, Volume2, VolumeX
} from 'lucide-react';
import { startAlarmSound, stopAlarmSound, testAlarmSound } from '../utils/alarmSound';

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = rawApiUrl 
  ? (rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl)
  : `${window.location.origin}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

// ─── Sidebar Navigation ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home', label: 'Overview', icon: Home },
  { id: 'symptoms', label: 'AI Diagnosis', icon: Brain },
  { id: 'reminders', label: 'Medicine Alarm', icon: Bell },
  { id: 'records', label: 'Health Records', icon: FileText },
  { id: 'locator', label: 'Hospital Map', icon: MapPin },
  { id: 'sos', label: 'Emergency SOS', icon: Siren },
  { id: 'profile', label: 'My Profile', icon: User },
];

// ─── Overview / Home Panel ────────────────────────────────────────────────────
function OverviewPanel({ profile, reminders, records }) {
  const userName = profile?.name || localStorage.getItem('user_name') || 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Reminders Active', value: reminders.filter(r => r.active).length, icon: Bell, color: 'from-violet-500 to-indigo-600' },
    { label: 'Health Records', value: records.length, icon: FileText, color: 'from-emerald-500 to-teal-600' },
    { label: 'Today\'s Pills', value: reminders.length, icon: Pill, color: 'from-amber-500 to-orange-600' },
    { label: 'Health Score', value: '87%', icon: Heart, color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-sm text-slate-400 mb-1">{greeting},</p>
        <h1 className="text-4xl font-bold text-white">{userName.split(' ')[0]} <span className="text-slate-500">👋</span></h1>
        <p className="text-slate-400 mt-2">Here's your health dashboard overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Analyze Symptoms', desc: 'Use AI to check your health', icon: Brain, color: 'bg-indigo-600', id: 'symptoms' },
            { label: 'Set Medicine Alarm', desc: 'Never miss a dose', icon: Bell, color: 'bg-violet-600', id: 'reminders' },
            { label: 'Emergency SOS', desc: 'Alert your emergency contact', icon: Siren, color: 'bg-red-600', id: 'sos' },
          ].map(q => (
            <button key={q.id} className="group text-left bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
              <div className={`w-10 h-10 ${q.color} rounded-xl flex items-center justify-center mb-4`}>
                <q.icon size={18} className="text-white" />
              </div>
              <div className="font-semibold text-white text-sm">{q.label}</div>
              <div className="text-xs text-slate-500 mt-1">{q.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent reminders */}
      {reminders.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Today's Medicines</h2>
          <div className="space-y-3">
            {reminders.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                  <Pill size={16} className="text-violet-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">{r.medicine_name}</div>
                  <div className="text-xs text-slate-500">{r.dosage} · {r.time}</div>
                </div>
                <Clock size={14} className="text-slate-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Symptom Checker Panel ────────────────────────────────────────────────
const languageOptions = [
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
];

function SymptomsPanel() {
  const location = useLocation();
  const [text, setText] = useState(location.state?.query || '');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    rec = new SR();
    rec.lang = language;
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onresult = e => setText(p => (p ? p + ' ' : '') + e.results[0][0].transcript);
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await axios.post(`${API_BASE}/analyze-symptoms`, { text });
      setResults(res.data);
    } catch (e) {
      console.error(e);
      setResults({
        error: "Failed to analyze symptoms.",
        details: e.response?.data?.error || e.message || "Please check network or backend connection."
      });
    } finally {
      setLoading(false);
    }
  };

  const symptomsFound = Array.isArray(results?.symptoms_found) ? results.symptoms_found : [];
  const possibleConditions = Array.isArray(results?.possible_conditions) ? results.possible_conditions : [];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-3">
          <Brain size={12} /> Neural Diagnostics Active
        </div>
        <h1 className="text-3xl font-bold text-white">AI Symptom Analysis</h1>
        <p className="text-slate-400 mt-2">Describe how you feel in plain language — our AI will analyze it.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <select
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {languageOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.flag} {opt.name}</option>
              ))}
            </select>
            <button
              onClick={startListening}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                }`}
            >
              {isListening ? <RefreshCw size={14} className="animate-spin" /> : <Mic size={14} />}
              {isListening ? 'Listening...' : 'Voice'}
            </button>
          </div>
          {text && (
            <button onClick={() => { setText(''); setResults(null); }} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
              Clear
            </button>
          )}
        </div>

        <textarea
          className="w-full bg-black/20 border border-white/5 rounded-2xl p-6 text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all min-h-[180px] resize-none"
          placeholder="E.g., I have a persistent headache behind my eyes, slight fever since yesterday, and feel very tired..."
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <button
          onClick={analyze}
          disabled={loading || !text.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
        >
          {loading ? <><Activity size={20} className="animate-pulse" /> Analyzing...</> : <><Stethoscope size={20} /> Run AI Analysis <ArrowRight size={18} /></>}
        </button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {results.error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4 text-red-400">
                <AlertTriangle size={28} />
                <div>
                  <h4 className="font-bold text-sm">{results.error}</h4>
                  <p className="text-xs text-slate-400 mt-1">{results.details}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Symptoms Detected</h3>
                    <div className="flex flex-wrap gap-2">
                      {symptomsFound.map(s => (
                        <span key={s} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-500/20">{s}</span>
                      ))}
                      {symptomsFound.length === 0 && <p className="text-slate-500 text-xs">No specific symptoms found.</p>}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Possible Conditions</h3>
                    <div className="space-y-4">
                      {possibleConditions.map((c, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold text-white">{c.disease}</span>
                            <span className="text-indigo-400 font-bold">{c.confidence}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${c.confidence}%` }} transition={{ duration: 1.2 }} className="h-full bg-indigo-500 rounded-full" />
                          </div>
                        </div>
                      ))}
                      {possibleConditions.length === 0 && <p className="text-slate-500 text-xs">Confidence threshold not met.</p>}
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} /> Survivor Guidance
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{results.survivor_advice || "Focus on hydration, rest, and monitoring symptoms."}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3 text-red-400 text-xs font-bold uppercase tracking-widest">
                    <AlertCircle size={14} /> AI Triage Advice
                  </div>
                  <p className="text-white text-sm leading-relaxed">{results.advice || results.assessment}</p>
                  <p className="text-slate-500 text-xs mt-4">⚠️ This is AI-generated information. Always consult a certified doctor.</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Medicine Reminders Panel ─────────────────────────────────────────────────
function RemindersPanel({ reminders, setReminders }) {
  const [form, setForm] = useState({ medicine_name: '', dosage: '', time: '' });
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [testingAudio, setTestingAudio] = useState(false);

  const handleTestSound = () => {
    setTestingAudio(true);
    testAlarmSound();
    setTimeout(() => setTestingAudio(false), 3600);
  };

  const addReminder = async () => {
    if (!form.medicine_name || !form.time) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/reminders`, form, getAuthHeaders());
      setReminders(prev => [...prev, { ...form, id: res.data.id, active: true }]);
      setForm({ medicine_name: '', dosage: '', time: '' });
      setAdding(false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const deleteReminder = async (id) => {
    try {
      await axios.delete(`${API_BASE}/reminders/${id}`, getAuthHeaders());
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Medicine Alarms</h1>
          <p className="text-slate-400 mt-1">Manage your medication schedule and audio reminders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTestSound}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all ${testingAudio
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
          >
            <Volume2 size={16} className={testingAudio ? 'animate-bounce' : ''} />
            {testingAudio ? 'Testing Alarm Sound...' : 'Test Alarm Sound'}
          </button>
          <button
            onClick={() => setAdding(!adding)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          >
            <Plus size={16} /> Add Reminder
          </button>
        </div>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white/5 border border-violet-500/30 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">New Reminder</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                placeholder="Medicine name"
                value={form.medicine_name}
                onChange={e => setForm(p => ({ ...p, medicine_name: e.target.value }))}
              />
              <input
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                placeholder="Dosage (e.g. 500mg)"
                value={form.dosage}
                onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))}
              />
              <input
                type="time"
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                value={form.time}
                onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={addReminder} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Reminder'}
              </button>
              <button onClick={() => setAdding(false)} className="text-slate-400 hover:text-white text-sm px-4 py-2.5 transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reminders.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p>No reminders set yet. Add your first medicine alarm.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 group">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Pill size={20} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{r.medicine_name}</div>
                <div className="text-sm text-slate-400">{r.dosage || 'No dosage specified'}</div>
              </div>
              <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold">
                <Clock size={14} />
                {r.time}
              </div>
              <button onClick={() => deleteReminder(r.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Health Records Panel ──────────────────────────────────────────────────────
function RecordsPanel({ records, setRecords }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const addRecord = async () => {
    if (!form.title) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/records`, form, getAuthHeaders());
      setRecords(prev => [{ ...form, id: res.data.id, date_added: new Date().toISOString() }, ...prev]);
      setForm({ title: '', description: '' });
      setAdding(false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Health Records</h1>
          <p className="text-slate-400 mt-1">Store and manage your personal health history.</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
        >
          <Plus size={16} /> Add Record
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white/5 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">New Health Record</h3>
            <input
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="Record title (e.g., Blood Test Results)"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
            <textarea
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[100px] resize-none"
              placeholder="Description or notes..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
            <div className="flex gap-3">
              <button onClick={addRecord} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Record'}
              </button>
              <button onClick={() => setAdding(false)} className="text-slate-400 hover:text-white text-sm px-4 py-2.5 transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {records.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p>No health records yet. Add your first record.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-white">{r.title}</div>
                  {r.description && <p className="text-sm text-slate-400 mt-1">{r.description}</p>}
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0 ml-4">
                  {r.date_added ? new Date(r.date_added).toLocaleDateString() : 'Just now'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hospital Locator Panel ───────────────────────────────────────────────────
function LocatorPanel() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);

  const locate = () => {
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('found');
      },
      () => setStatus('error')
    );
  };

  const mapUrl = coords
    ? `https://www.google.com/maps/search/hospitals+near+me/@${coords.lat},${coords.lng},14z`
    : `https://www.google.com/maps/search/hospitals+near+me`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Hospital Locator</h1>
        <p className="text-slate-400 mt-1">Find the nearest hospitals and medical facilities.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Navigation size={16} className="text-teal-400" /> Use My Location</h3>
          <p className="text-sm text-slate-400 mb-4">Allow location access to find hospitals near you automatically.</p>
          <button
            onClick={locate}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${status === 'locating' ? 'bg-teal-500/20 text-teal-300 animate-pulse' :
              status === 'found' ? 'bg-emerald-500/20 text-emerald-300' :
                'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
          >
            {status === 'locating' ? '📡 Detecting...' : status === 'found' ? `✅ Location Found (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})` : '📍 Detect My Location'}
          </button>
          {status === 'found' && (
            <a href={mapUrl} target="_blank" rel="noreferrer"
              className="mt-3 w-full block py-3 rounded-xl font-bold text-sm text-center bg-indigo-600 hover:bg-indigo-700 text-white transition-all">
              Open Hospitals Near Me →
            </a>
          )}
          {status === 'error' && <p className="text-xs text-red-400 mt-2">Could not get location. Please enable location access.</p>}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><MapPin size={16} className="text-teal-400" /> Search by City</h3>
          <input
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 mb-3"
            placeholder="Enter city or area..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <a
            href={`https://www.google.com/maps/search/hospitals+near+${encodeURIComponent(query || 'me')}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full py-3 rounded-xl font-bold text-sm text-center bg-teal-600 hover:bg-teal-700 text-white transition-all"
          >
            Search on Google Maps →
          </a>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Map Preview</p>
        </div>
        <iframe
          title="Hospital Locator Map"
          src={coords
            ? `https://maps.google.com/maps?q=hospitals+near+${coords.lat},${coords.lng}&output=embed`
            : `https://maps.google.com/maps?q=hospitals+near+me&output=embed`}
          className="w-full h-96 border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// ─── Emergency SOS Panel ──────────────────────────────────────────────────────
function SOSPanel({ profile }) {
  const [activated, setActivated] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const triggerSOS = async () => {
    setSending(true);
    setResult(null);
    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const res = await axios.post(`${API_BASE}/sos`, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }, getAuthHeaders());
          setResult({ type: 'success', msg: res.data.message });
          setActivated(true);
          setSending(false);
        },
        async () => {
          const res = await axios.post(`${API_BASE}/sos`, { lat: 'Unknown', lng: 'Unknown' }, getAuthHeaders());
          setResult({ type: 'partial', msg: res.data.message });
          setActivated(true);
          setSending(false);
        }
      );
    } catch (e) {
      setResult({ type: 'error', msg: e.response?.data?.error || 'SOS failed. Try again.' });
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Emergency SOS</h1>
        <p className="text-slate-400 mt-1">Instantly alert your emergency contact with your location.</p>
      </div>

      {!profile?.emergency_email && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">No emergency contact set</p>
            <p className="text-amber-400/70 text-xs mt-1">Go to <strong>My Profile</strong> to add an emergency email address. SOS will still trigger but no email will be sent.</p>
          </div>
        </div>
      )}

      {profile?.emergency_email && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-300 font-semibold text-sm">Emergency contact configured</p>
            <p className="text-emerald-400/70 text-xs mt-0.5">{profile.emergency_email}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-8 py-10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={triggerSOS}
          disabled={sending || activated}
          className={`w-52 h-52 rounded-full border-8 transition-all duration-500 flex items-center justify-center flex-col gap-2 font-black uppercase tracking-widest text-sm shadow-2xl ${activated
            ? 'border-red-400 bg-red-600 text-white shadow-red-500/50 animate-pulse'
            : sending
              ? 'border-orange-400 bg-orange-500/20 text-orange-300'
              : 'border-red-600 bg-red-950 text-red-400 hover:bg-red-900 hover:border-red-400 shadow-red-950/50'
            }`}
        >
          <Siren size={48} />
          {sending ? 'Sending...' : activated ? 'ACTIVE' : 'SOS'}
        </motion.button>

        <p className="text-slate-500 text-sm text-center max-w-sm">
          {activated ? '🚨 Emergency alert sent. Help is on the way.' : 'Tap the button to broadcast your emergency. Your location will be shared with your emergency contact.'}
        </p>

        {result && (
          <div className={`px-6 py-3 rounded-2xl text-sm font-semibold ${result.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : result.type === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
            {result.msg}
          </div>
        )}

        {activated && (
          <button onClick={() => { setActivated(false); setResult(null); }} className="text-xs text-slate-500 hover:text-white transition-colors">
            Reset SOS
          </button>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">What happens when you trigger SOS?</h3>
        <div className="space-y-2">
          {[
            'Your current GPS location is captured',
            'An emergency email is sent to your emergency contact',
            'The email includes a Google Maps link to your location',
            'You can configure your emergency contact in My Profile',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-slate-400">
              <span className="w-5 h-5 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Panel ────────────────────────────────────────────────────────────
function ProfilePanel({ profile, setProfile }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Please select an image smaller than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, profile_photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/profile`, form, getAuthHeaders());
      setProfile(res.data.user);
      localStorage.setItem('user_name', res.data.user.name);
      if (res.data.user.profile_photo) {
        localStorage.setItem('user_photo', res.data.user.profile_photo);
      }
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to save profile changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your personal identity, medical details, and emergency contacts.</p>
        </div>
        {editing ? (
          <div className="flex gap-3">
            <button onClick={() => { setEditing(false); setForm({ ...profile }); }} className="text-slate-400 hover:text-white text-sm px-4 py-2.5 transition-colors">Cancel</button>
            <button onClick={saveProfile} disabled={loading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
              <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            <Edit3 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm px-4 py-3 rounded-xl">
          <CheckCircle size={16} /> Profile saved successfully!
        </motion.div>
      )}

      {/* Avatar & Photo Upload Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 border border-white/10 rounded-3xl p-6">
        <div className="relative group">
          {(editing ? form.profile_photo : profile?.profile_photo) ? (
            <img
              src={editing ? form.profile_photo : profile?.profile_photo}
              alt={profile?.name || 'User'}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 shadow-xl">
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          {editing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-lg border border-white/20 transition-all hover:scale-105"
              title="Upload photo"
            >
              <Camera size={14} />
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="text-2xl font-bold text-white truncate">{profile?.name || 'User'}</div>
          <div className="text-sm text-slate-400 truncate">{profile?.email || ''}</div>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <span className="bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-500/20">
              🩸 Blood Group: {profile?.blood_group || form.blood_group || 'Not Set'}
            </span>
            <span className="bg-violet-500/10 text-violet-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-violet-500/20">
              🎂 DOB: {profile?.dob || form.dob || 'Not Set'}
            </span>
          </div>

          {editing && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Profile Photo URL (or click camera icon above to upload photo):</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="https://example.com/my-photo.jpg"
                value={form.profile_photo || ''}
                onChange={e => setForm(p => ({ ...p, profile_photo: e.target.value }))}
              />
            </div>
          )}
        </div>
      </div>

      {/* Editable Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <User size={12} /> Full Name
          </label>
          {editing ? (
            <input
              type="text"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="Your full name"
              value={form.name || ''}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          ) : (
            <p className="text-sm text-white font-medium">{profile?.name || <span className="text-slate-500 italic">Not set</span>}</p>
          )}
        </div>

        {/* Email Address (Read-only) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Mail size={12} /> Email Address (Primary Identity)
          </label>
          <p className="text-sm text-white font-medium opacity-80">{profile?.email}</p>
        </div>

        {/* Emergency Contact Email */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <AlertTriangle size={12} /> Emergency Contact Email
          </label>
          {editing ? (
            <input
              type="email"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              placeholder="emergency@email.com"
              value={form.emergency_email || ''}
              onChange={e => setForm(p => ({ ...p, emergency_email: e.target.value }))}
            />
          ) : (
            <p className="text-sm text-white font-medium">{profile?.emergency_email || <span className="text-slate-500 italic">Not set</span>}</p>
          )}
        </div>

        {/* Blood Group */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Heart size={12} /> Blood Group
          </label>
          {editing ? (
            <select
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={form.blood_group || ''}
              onChange={e => setForm(p => ({ ...p, blood_group: e.target.value }))}
            >
              <option value="">Select Blood Group...</option>
              {bloodGroupOptions.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-white font-medium">{profile?.blood_group ? <span className="px-2.5 py-1 bg-red-500/20 text-red-300 rounded-lg font-bold border border-red-500/30">{profile.blood_group}</span> : <span className="text-slate-500 italic">Not set</span>}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Clock size={12} /> Date of Birth
          </label>
          {editing ? (
            <input
              type="date"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              value={form.dob || ''}
              onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
            />
          ) : (
            <p className="text-sm text-white font-medium">{profile?.dob || <span className="text-slate-500 italic">Not set</span>}</p>
          )}
        </div>

        {/* Contact Number */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Phone size={12} /> Contact Number
          </label>
          {editing ? (
            <input
              type="tel"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="+91 XXXXX XXXXX"
              value={form.contact_number || ''}
              onChange={e => setForm(p => ({ ...p, contact_number: e.target.value }))}
            />
          ) : (
            <p className="text-sm text-white font-medium">{profile?.contact_number || <span className="text-slate-500 italic">Not set</span>}</p>
          )}
        </div>

        {/* Address */}
        <div className="sm:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <MapPin size={12} /> Address
          </label>
          {editing ? (
            <input
              type="text"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="Your full home address"
              value={form.address || ''}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
            />
          ) : (
            <p className="text-sm text-white font-medium">{profile?.address || <span className="text-slate-500 italic">Not set</span>}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Shell ──────────────────────────────────────────────────────────
export default function Dashboard({ theme, toggleTheme, setToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [records, setRecords] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [activeAlarm, setActiveAlarm] = useState(null);
  const triggeredAlarmsRef = useRef(new Set());

  // Sync tab from location state or URL hash if provided
  useEffect(() => {
    if (location.state?.tab && NAV_ITEMS.find(n => n.id === location.state.tab)) {
      setActiveTab(location.state.tab);
    } else {
      const hash = location.hash?.replace('#', '');
      if (hash && NAV_ITEMS.find(n => n.id === hash)) setActiveTab(hash);
    }
  }, [location.hash, location.state]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { navigate('/auth'); return; }

    const fetchAll = async () => {
      try {
        const headers = getAuthHeaders();
        const [profileRes, remindersRes, recordsRes] = await Promise.all([
          axios.get(`${API_BASE}/profile`, headers),
          axios.get(`${API_BASE}/reminders`, headers),
          axios.get(`${API_BASE}/records`, headers),
        ]);
        setProfile(profileRes.data);
        setReminders(remindersRes.data);
        setRecords(recordsRes.data);
      } catch (e) {
        if (e.response?.status === 401) { navigate('/auth'); }
        console.error(e);
      } finally { setDataLoading(false); }
    };
    fetchAll();
  }, []);

  // Background Medicine Alarm Sound Checker
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkAlarms = () => {
      if (!reminders || reminders.length === 0) return;
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      reminders.forEach(r => {
        if (r.active !== false && r.time === currentHHMM) {
          const triggerKey = `${r.id}_${currentHHMM}`;
          if (!triggeredAlarmsRef.current.has(triggerKey)) {
            triggeredAlarmsRef.current.add(triggerKey);
            startAlarmSound();
            setActiveAlarm(r);

            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('⏰ Medicine Alarm Ringing!', {
                  body: `Time for your medicine: ${r.medicine_name} (${r.dosage || 'Take prescribed dose'})`,
                });
              } catch (e) { }
            }
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 4000);
    checkAlarms();

    return () => clearInterval(interval);
  }, [reminders]);

  const dismissAlarm = () => {
    stopAlarmSound();
    setActiveAlarm(null);
  };

  const handleLogout = () => {
    stopAlarmSound();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_photo');
    if (setToken) setToken('');
    navigate('/');
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'home': return <OverviewPanel profile={profile} reminders={reminders} records={records} />;
      case 'symptoms': return <SymptomsPanel />;
      case 'reminders': return <RemindersPanel reminders={reminders} setReminders={setReminders} />;
      case 'records': return <RecordsPanel records={records} setRecords={setRecords} />;
      case 'locator': return <LocatorPanel />;
      case 'sos': return <SOSPanel profile={profile} />;
      case 'profile': return <ProfilePanel profile={profile} setProfile={setProfile} />;
      default: return <OverviewPanel profile={profile} reminders={reminders} records={records} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex relative">
      {/* Active Alarm Sound Alert Modal */}
      {activeAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border-2 border-violet-500 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-[0_0_60px_rgba(139,92,246,0.6)]"
          >
            <div className="relative mx-auto w-24 h-24 bg-violet-600/30 rounded-full flex items-center justify-center animate-pulse">
              <Bell size={48} className="text-violet-400 animate-bounce" />
              <div className="absolute inset-0 border-4 border-violet-500 rounded-full animate-ping opacity-75" />
            </div>
            <div>
              <span className="bg-violet-500/20 text-violet-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-violet-500/30">
                ⏰ Medicine Alarm Ringing
              </span>
              <h2 className="text-3xl font-bold text-white mt-3">{activeAlarm.medicine_name}</h2>
              <p className="text-slate-300 text-lg mt-1 font-semibold">{activeAlarm.dosage || 'Take prescribed dose'}</p>
              <p className="text-violet-400 text-sm mt-2 font-mono font-bold">Scheduled Time: {activeAlarm.time}</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={dismissAlarm}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <VolumeX size={20} /> Stop Alarm Sound
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0f172a] border-r border-white/10 z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <div className="font-black text-white text-sm">MedAssist AI</div>
              <div className="text-[10px] text-slate-500">Health Dashboard</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon size={17} />
              {item.label}
              {activeTab === item.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Home size={17} />
            Back to Landing
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-white hover:bg-red-500/10 transition-all"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-0">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-10 bg-[#020617]/90 backdrop-blur-xl border-b border-white/10 px-5 py-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white transition-colors">
            <Menu size={22} />
          </button>
          <div className="font-black text-white text-sm">MedAssist AI</div>
          {profile?.profile_photo ? (
            <img src={profile.profile_photo} alt={profile.name} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10">
          {dataLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Activity size={40} className="animate-pulse text-indigo-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading your health data...</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
