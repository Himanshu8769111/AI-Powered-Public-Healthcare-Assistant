import { motion } from 'framer-motion';
import pillImg from '../assets/pill.png';

export default function PillExplosion() {
  const pills = [
    { x: -180, y: -120, r: -25, scale: 0.7, delay: 0.1 },
    { x: 190, y: -150, r: 45, scale: 0.6, delay: 0.2 },
    { x: -220, y: 140, r: 85, scale: 0.5, delay: 0.3 },
    { x: 210, y: 160, r: -75, scale: 0.8, delay: 0.4 },
    { x: -80, y: -200, r: 15, scale: 0.4, delay: 0.5 },
    { x: 90, y: 220, r: 120, scale: 0.6, delay: 0.6 }
  ];

  return (
    <section className="py-40 relative flex flex-col items-center justify-center overflow-hidden bg-warm-light/50 dark:bg-slate-950">
      {/* Central Core element */}
      <motion.div 
        whileHover="hover"
        className="relative z-10 w-64 h-64 rounded-[50px] border border-brown-100 dark:border-white/10 flex flex-col items-center justify-center text-center p-6 bg-white/80 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-gold/10 to-transparent dark:from-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[50px]" />
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 tracking-[0.3em] uppercase block mb-3">Therapeutic Matrix</span>
        <h3 className="text-3xl font-serif text-brown-900 dark:text-white leading-tight mb-2">Molecular <br />Triage</h3>
        <p className="text-[10px] text-accent-gold dark:text-indigo-400 font-black uppercase tracking-widest mt-2">Hover to Disperse</p>

        {/* Floating Pills */}
        {pills.map((pill, i) => (
          <motion.div
            key={i}
            variants={{
              hover: {
                x: pill.x,
                y: pill.y,
                rotate: pill.r,
                scale: pill.scale,
                transition: { type: "spring", stiffness: 100, damping: 12, delay: pill.delay }
              }
            }}
            initial={{ x: 0, y: 0, rotate: 0, scale: 0 }}
            className="absolute w-24 h-24 pointer-events-none z-0"
          >
            <img src={pillImg} alt="Pill Graphic" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
