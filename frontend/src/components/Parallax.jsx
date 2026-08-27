import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Parallax({ children, yRange = [0, 0], xRange = [0, 0], className = "" }) {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], yRange);
  const x = useTransform(scrollYProgress, [0, 1], xRange);

  return (
    <motion.div ref={ref} style={{ y, x }} className={className}>
      {children}
    </motion.div>
  );
}
