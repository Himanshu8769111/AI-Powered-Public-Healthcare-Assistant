import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function StickyFeatureNav({ sections }) {
  const [activeId, setActiveId] = useState(sections?.[0]?.id || '');

  useEffect(() => {
    if (!sections?.length) return;

    const observers = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  return (
    <nav className="flex flex-col gap-1">
      {sections?.map(({ id, label }) => {
        const isActive = activeId === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              setActiveId(id);
            }}
            className={`group flex items-center gap-4 py-2 transition-all duration-300 ${
              isActive
                ? 'text-brown-900 dark:text-white'
                : 'text-brown-600/50 dark:text-slate-600 hover:text-brown-700 dark:hover:text-slate-400'
            }`}
          >
            <div className="relative flex items-center justify-center w-4">
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute w-1.5 h-1.5 rounded-full bg-accent-gold dark:bg-indigo-500"
                />
              )}
              {!isActive && (
                <div className="w-1 h-1 rounded-full bg-brown-300 dark:bg-slate-700 group-hover:bg-brown-500 dark:group-hover:bg-slate-500 transition-colors" />
              )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'translate-x-1' : ''}`}>
              {label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
