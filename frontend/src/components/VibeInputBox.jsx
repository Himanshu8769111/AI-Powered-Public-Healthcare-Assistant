import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowRight } from 'lucide-react';

const placeholders = [
  "Describe your symptoms in plain language...",
  "e.g., persistent headache and mild fever since yesterday...",
  "e.g., joint pain and body fatigue...",
  "Type or speak how you feel..."
];

export default function VibeInputBox() {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSpeech = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => (prev ? prev + " " : "") + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Redirect to Dashboard Symptom Checker with query state
    navigate('/dashboard', { state: { tab: 'symptoms', query: query.trim() } });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="glass-strong bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl p-2 rounded-full border border-white/20 dark:border-white/5 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-none relative group"
    >
      <button 
        type="button" 
        onClick={handleSpeech}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'text-brown-600 dark:text-slate-400 hover:text-accent-gold dark:hover:text-indigo-400 hover:bg-brown-50 dark:hover:bg-white/5'
        }`}
        title="Speak your symptoms"
      >
        <Mic size={20} />
      </button>

      <div className="flex-grow relative px-4 overflow-hidden">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none py-3 text-brown-900 dark:text-white placeholder-transparent text-sm md:text-base font-sans"
        />
        <AnimatePresence>
          {!query && (
            <motion.span 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-brown-600 dark:text-slate-400 text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis w-11/12"
            >
              {placeholders[placeholderIndex]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <button 
        type="submit"
        className="w-12 h-12 bg-brown-900 dark:bg-white text-white dark:text-slate-950 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
      >
        <ArrowRight size={20} />
      </button>
    </form>
  );
}
