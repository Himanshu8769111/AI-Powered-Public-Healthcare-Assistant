import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function MagneticCursor() {
  const [visible, setVisible] = useState(false);

  // Position of mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for lagging trail cursor
  const trailX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const trailY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Primary Cursor Dot */}
      <motion.div 
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-accent-gold dark:bg-indigo-400 pointer-events-none z-[99999]"
      />
      {/* Lagging Ring Trail */}
      <motion.div 
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-accent-gold/40 dark:border-indigo-400/40 pointer-events-none z-[99998]"
      />
    </>
  );
}
