import { motion } from 'framer-motion';

const tags = [
  "neural triage",
  "encrypted files",
  "offline cache",
  "immediate response",
  "ai medical probe",
  "humanitarian core",
  "resilient pathing",
  "decentralized network"
];

export default function Marquee({ reverse = false }) {
  const direction = reverse ? [0, -1000] : [-1000, 0];

  return (
    <div className="w-full overflow-hidden py-10 bg-slate-950 flex select-none relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      <motion.div 
        animate={{ x: direction }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 35
        }}
        className="flex whitespace-nowrap gap-16 pr-16"
      >
        {/* Render tags twice to make infinite scroll work */}
        {[...Array(3)].map((_, groupIndex) => (
          <div key={groupIndex} className="flex gap-16">
            {tags.map((tag, i) => (
              <span 
                key={i} 
                className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter text-slate-900 dark:text-slate-900 hover:text-accent-gold dark:hover:text-indigo-900 transition-colors duration-500 font-[Anton]"
                style={{ WebkitTextStroke: "1px rgba(255,255,255,0.04)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
