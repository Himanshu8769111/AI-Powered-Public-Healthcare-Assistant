import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const statuses = [
  "Initializing Neural Lattice...",
  "Loading Diagnostic Modules...",
  "Calibrating Offline Cache...",
  "Configuring Triage Paths...",
  "Applying 256-bit Encryption...",
  "Establishing Secure Connection..."
];

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    // Increment progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500); // Small pause at 100%
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4; // increment between 4% and 11%
        return Math.min(prev + step, 100);
      });
    }, 150);

    // Rotate status messages
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statuses.length);
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[99999] bg-warm-light dark:bg-slate-950 flex flex-col justify-between p-12 select-none"
    >
      <div className="flex justify-between w-full text-brown-600 dark:text-slate-500 font-black text-[10px] tracking-[0.3em] uppercase">
        <span>MedAssist AI Labs</span>
        <span>Version 4.0</span>
      </div>

      <div className="flex flex-col items-start gap-4">
        {/* Loading status */}
        <motion.span 
          key={statusIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-brown-900 dark:text-white font-serif italic text-2xl md:text-3xl"
        >
          {statuses[statusIndex]}
        </motion.span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 w-full">
        <div className="w-full md:max-w-xl h-[2px] bg-brown-100 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
            className="h-full bg-accent-gold dark:bg-indigo-500" 
          />
        </div>

        <span className="text-8xl md:text-[12rem] font-black text-accent-gold dark:text-indigo-500 leading-none tracking-tighter">
          {progress.toString().padStart(3, '0')}
        </span>
      </div>
    </motion.div>
  );
}
