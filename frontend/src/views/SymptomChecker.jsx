import { useState } from 'react';
import axios from 'axios';
import { 
  Mic, Activity, Send, Info, 
  AlertCircle, Languages, Brain, 
  CheckCircle, Stethoscope, RefreshCw,
  ArrowRight, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL ?? `${window.location.origin}/api`;

const languageOptions = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'hi-IN', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'es-ES', name: 'Español (Spanish)', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français (French)', flag: '🇫🇷' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
];

export default function SymptomChecker() {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('en-US');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support Speech Recognition.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setText(prev => (prev ? prev + " " : "") + transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 bg-accent-gold/10 dark:bg-indigo-500/20 border border-accent-gold/20 dark:border-indigo-500/20 px-4 py-1.5 rounded-full text-brown-900 dark:text-indigo-400 text-[10px] font-black tracking-[0.3em] uppercase mb-4"
                >
                    <Brain size={14} /> Neural Diagnostics Active
                </motion.div>
                <h1 className="text-5xl font-serif text-brown-900 dark:text-white leading-tight">Identify symptoms with <br/> <span className="text-brown-600 dark:text-slate-600 italic font-normal">neural precision.</span></h1>
                <p className="text-brown-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">Describe your clinical state in plain language. Our engine deciphers dialect and medical nuance.</p>
            </div>

            {/* Input Portal */}
            <div className="glass-strong bg-card-beige/50 dark:bg-white/5 rounded-[50px] p-10 border border-brown-100 dark:border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-gold to-brown-900 dark:from-indigo-500 dark:to-purple-500 opacity-50" />
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Languages size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-600 dark:text-slate-400" />
                            <select 
                                className="bg-warm-light dark:bg-white/5 border border-brown-100 dark:border-white/10 rounded-2xl py-2 pl-9 pr-4 text-[10px] font-black text-brown-900 dark:text-slate-300 uppercase tracking-widest focus:ring-0 focus:border-brown-900 dark:focus:border-indigo-500"
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                            >
                                {languageOptions.map(opt => (
                                    <option key={opt.code} value={opt.code}>{opt.flag} {opt.name}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={startListening}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                isListening 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'bg-accent-gold/10 text-brown-900 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-brown-900 dark:hover:bg-indigo-500 hover:text-white'
                            }`}
                        >
                            {isListening ? <RefreshCw size={14} className="animate-spin" /> : <Mic size={14} />}
                            {isListening ? 'Listening...' : 'Voice Input'}
                        </button>
                    </div>
                    {text && (
                        <button onClick={() => setText('')} className="text-[10px] font-black text-brown-600 dark:text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                            Purge Buffer
                        </button>
                    )}
                </div>

                <textarea 
                    className="w-full bg-warm-light dark:bg-black/20 border border-brown-100 dark:border-white/5 rounded-[40px] p-8 text-lg font-medium text-brown-900 dark:text-white placeholder-brown-600 dark:placeholder-slate-400 focus:outline-none focus:border-brown-900 dark:focus:border-indigo-500 transition-all min-h-[200px] shadow-inner"
                    placeholder="E.g., I have a persistent sharp pain in my lower abdomen that gets worse when I move, and I've been feeling slightly chills since this morning..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />

                <button 
                    onClick={analyze}
                    disabled={loading || !text.trim()}
                    className="mt-8 w-full bg-brown-900 hover:bg-brown-900/90 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black py-5 rounded-[28px] shadow-2xl shadow-brown-900/20 dark:shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Activity size={24} className="animate-pulse" /> Deciphering Neural Patterns...
                        </>
                    ) : (
                        <>
                            <Stethoscope size={24} /> Initialize AI Analysis
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </>
                    )}
                </button>
            </div>

            {/* Results Engine */}
            <AnimatePresence>
                {results && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                             <div className="flex-shrink-0 w-12 h-12 bg-accent-gold/10 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-brown-900 dark:text-indigo-500 font-black text-xl">
                                <Activity size={24} />
                             </div>
                             <div className="h-px w-full bg-brown-100 dark:bg-white/5" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass-strong bg-card-beige/50 dark:bg-white/5 p-10 rounded-[40px] border border-brown-100 dark:border-white/5 shadow-xl">
                                <h3 className="text-[10px] font-black text-accent-gold dark:text-indigo-500 uppercase tracking-[0.4em] mb-8">Extracted Vitals</h3>
                                <div className="flex flex-wrap gap-3">
                                    {results.symptoms_found.map(s => (
                                        <span key={s} className="px-4 py-2 bg-brown-900/10 dark:bg-indigo-500/10 text-brown-900 dark:text-indigo-400 rounded-xl text-xs font-bold border border-brown-900/20 dark:border-indigo-500/20">
                                            {s}
                                        </span>
                                    ))}
                                    {results.symptoms_found.length === 0 && <p className="text-brown-600 dark:text-slate-500 text-xs italic">No specific symptoms extracted.</p>}
                                </div>
                            </div>

                            <div className="glass-strong bg-card-beige/50 dark:bg-white/5 p-10 rounded-[40px] border border-brown-100 dark:border-white/5 shadow-xl">
                                <h3 className="text-[10px] font-black text-accent-gold dark:text-indigo-500 uppercase tracking-[0.4em] mb-8">Diagnostic Probabilities</h3>
                                <div className="space-y-6">
                                    {results.possible_conditions.map((c, i) => (
                                        <div key={i} className="group">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-bold text-brown-900 dark:text-white uppercase tracking-tight">{c.disease}</span>
                                                <span className="text-xs font-black text-brown-900 dark:text-indigo-500">{c.confidence}%</span>
                                            </div>
                                            <div className="h-2 bg-brown-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${c.confidence}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-brown-900 dark:bg-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {results.possible_conditions.length === 0 && <p className="text-brown-600 dark:text-slate-500 text-xs italic">Confidence threshold not met.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="glass-strong bg-card-beige/50 dark:bg-white/5 p-10 rounded-[40px] border border-brown-100 dark:border-white/5 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck size={18} className="text-accent-gold dark:text-indigo-400" />
                                <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 uppercase tracking-[0.4em]">Survivor Guidance</span>
                            </div>
                            <h3 className="text-2xl font-serif text-brown-900 dark:text-white mb-4">How survivors manage this condition</h3>
                            <p className="text-brown-700 dark:text-slate-300 leading-relaxed text-sm">
                                {results.survivor_advice || "When specific guidance is unavailable, focus on rest, hydration, monitoring your symptoms, and seeking medical help when needed."}
                            </p>
                        </div>

                        {/* Critical Triage Advice */}
                        <div className="relative p-10 bg-brown-900 dark:bg-white/5 rounded-[50px] border border-brown-900/10 dark:border-white/5 shadow-2xl overflow-hidden group">
                           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                              <ShieldCheck size={200} />
                           </div>
                           <div className="relative z-10">
                              <div className="flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest mb-6 px-4 py-2 bg-red-500/10 w-fit rounded-full border border-red-500/20">
                                 <AlertCircle size={16} /> AI Triage Protocol
                              </div>
                              <h4 className="text-3xl font-serif text-white mb-6 leading-tight">Neural Intelligence <br/> <span className="text-white/60 dark:text-slate-500">Analysis Summary</span></h4>
                              <p className="text-white/80 dark:text-slate-400 text-lg leading-relaxed mb-8 max-w-3xl">
                                {results.advice}
                              </p>
                              <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-6">
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white/60 dark:text-slate-500 uppercase tracking-widest">Precautionary Disclosure</p>
                                    <p className="text-[10px] text-white/70 dark:text-slate-600 max-w-xs font-bold leading-relaxed">
                                        This analysis is informational. Consult a certified medical professional for definitive diagnosis.
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Atmosphere footer */}
            <div className="text-center py-20 opacity-20">
                <Activity size={100} className="mx-auto text-brown-900 dark:text-indigo-500" strokeWidth={0.5} />
            </div>
        </div>
    );
}
