import { motion } from 'framer-motion';
import img1 from '../assets/spatial_img1.png';
import img2 from '../assets/spatial_img2.png';

export default function ExplodedAssembly() {
  return (
    <section className="py-40 px-6 relative overflow-hidden bg-slate-50 dark:bg-slate-900/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 tracking-[0.3em] uppercase block mb-4">Spatial Architecture</span>
          <h2 className="text-5xl lg:text-7xl font-serif text-brown-900 dark:text-white leading-[1.05] mb-8">Exploded <br /><span className="text-brown-600 dark:text-slate-600 font-normal italic">interface.</span></h2>
          <p className="text-brown-600 dark:text-slate-400 text-xl leading-relaxed font-medium">
            Explore the multi-layered design system backing the MedAssist framework. Each layer isolates diagnostic protocols, secure offline indices, and neural analysis.
          </p>
        </div>

        <div className="relative flex justify-center items-center h-[500px]">
          {/* Main 3D Perspective Box */}
          <div className="relative w-80 h-96 [perspective:1000px] [transform-style:preserve-3d]">
            {/* Layer 1 (Back Layer) */}
            <motion.div 
              whileHover={{ translateZ: 50, rotateX: 20, rotateY: -20 }}
              initial={{ translateZ: 0, rotateX: 15, rotateY: -15 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="absolute inset-0 shadow-2xl rounded-[30px] border border-brown-100 dark:border-white/10 bg-card-beige/50 dark:bg-slate-800/40 backdrop-blur-md overflow-hidden flex items-center justify-center p-4 [transform-style:preserve-3d]"
            >
              <img src={img1} alt="Spatial layer 1" className="w-full h-full object-contain opacity-80" />
              <div className="absolute bottom-6 left-6 text-brown-900 dark:text-white text-[10px] font-black uppercase tracking-widest bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/20">
                01 / Interface View
              </div>
            </motion.div>

            {/* Layer 2 (Front Layer) */}
            <motion.div 
              whileHover={{ translateZ: 150, rotateX: 20, rotateY: -20 }}
              initial={{ translateZ: 80, rotateX: 15, rotateY: -15 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="absolute inset-0 shadow-2xl rounded-[30px] border border-accent-gold/30 dark:border-indigo-500/30 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md overflow-hidden flex items-center justify-center p-4 [transform-style:preserve-3d] pointer-events-none"
            >
              <img src={img2} alt="Spatial layer 2" className="w-full h-full object-contain" />
              <div className="absolute bottom-6 left-6 text-accent-gold dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/20">
                02 / Diagnostic Layer
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
