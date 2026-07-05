import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';
import {
  Activity, MapPin, Zap, ChevronDown,
  Check, Globe, Smartphone, Cpu, ArrowRight,
  Shield, Navigation, User, Code2, Briefcase, MessageCircle, ExternalLink, Mail, Phone,
  AlertTriangle, Pill, Moon, Sun
} from 'lucide-react';

import VibeInputBox from '../components/VibeInputBox';
import StickyFeatureNav from '../components/StickyFeatureNav';
import Marquee from '../components/Marquee';
import MagneticCursor from '../components/MagneticCursor';
import PillExplosion from '../components/PillExplosion';
import Parallax from '../components/Parallax';
import Preloader from '../components/Preloader';
import Magnetic from '../components/Magnetic';
import ExplodedAssembly from '../components/ExplodedAssembly';
import pillImg from '../assets/pill.png';

// Shared scroll-reveal variants
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: i * 0.12 }
  })
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

const blurReveal = {
  hidden: { opacity: 0, filter: 'blur(20px)', y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 1, ease: [0.23, 1, 0.32, 1], delay: i * 0.1 }
  })
};

// Scroll Progress Bar
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%', background: 'linear-gradient(90deg, #c5a059, #6366f1, #a855f7)' }}
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none"
    />
  );
}

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-xl font-sans font-semibold text-brown-900 dark:text-slate-100 group-hover:text-accent-gold dark:group-hover:text-indigo-400 transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-slate-400 group-hover:text-indigo-500 transition-colors"
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="pb-6 text-brown-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RevealText = ({ text, delayOffset = 0 }) => {
  return text.split(' ').map((word, i) => (
    <motion.span
      key={i}
      variants={blurReveal}
      custom={delayOffset + i}
      className="inline-block mr-[0.2em]"
    >
      {word}
    </motion.span>
  ));
};

export default function LandingPage({ theme, toggleTheme }) {
  const [isLoading, setIsLoading] = useState(true);
  const features = ['ai-symptoms', 'hospital-locator', 'global-impact', 'security', 'sos-protocol', 'team'];

  // 3D Motion Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-500, 500], [10, -10]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-10, 10]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div
      className="bg-warm-light dark:bg-slate-950 min-h-screen selection:bg-accent-gold/30 dark:selection:bg-indigo-500/30 selection:text-brown-900 dark:selection:text-indigo-200 transition-colors duration-500"
      style={{ cursor: 'none' }}
      onMouseMove={handleMouseMove}
    >
      <Preloader onComplete={() => setIsLoading(false)} />
      <ScrollProgressBar />
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <MagneticCursor />
            {/* Global Atmospheric Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              <Parallax yRange={[-100, 100]} xRange={[-50, 50]} className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%]">
                <img src={pillImg} alt="Pill background" className="w-full h-full object-contain opacity-20 dark:opacity-10 blur-[2px] rotate-[30deg]" />
              </Parallax>
              <Parallax yRange={[100, -100]} xRange={[50, -50]} className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%]">
                <img src={pillImg} alt="Pill background" className="w-full h-full object-contain opacity-20 dark:opacity-10 blur-[2px] rotate-[-15deg]" />
              </Parallax>

              {/* Additional Floating Parallax Shapes */}
              <Parallax yRange={[-200, 200]} xRange={[100, -100]} className="absolute top-[20%] right-[15%] w-32 h-32 opacity-20 dark:opacity-10">
                <img src={pillImg} alt="Pill floating" className="w-full h-full object-contain rotate-45" />
              </Parallax>
              <Parallax yRange={[300, -300]} xRange={[-150, 150]} className="absolute bottom-[20%] left-[10%] w-48 h-48 opacity-10">
                <img src={pillImg} alt="Pill floating" className="w-full h-full object-contain rotate-12" />
              </Parallax>
            </div>

            {/* Navigation */}
            <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4">
              <div className="glass-strong bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl px-12 py-3 rounded-full border border-white/20 dark:border-white/5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none">
                <div className="flex items-center gap-6 group cursor-pointer flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-brown-900 dark:from-indigo-500 dark:to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent-gold/30 dark:shadow-indigo-500/30 group-hover:scale-110 transition-all duration-500">
                    <Activity size={20} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-brown-900 dark:text-white uppercase tracking-tighter leading-none">medassist</span>
                    <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 uppercase tracking-[0.2em]">ai</span>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-10 ml-12 mr-12 flex-grow justify-center">
                  {[
                    { label: 'Diagnostic', href: '/symptoms', isRoute: true },
                    { label: 'Locator', href: '/hospitals', isRoute: true },
                    { label: 'Offline Mode', href: '#global-impact' },
                    { label: 'Security', href: '#security' },
                    { label: 'Emergency SOS', href: '/sos', isRoute: true },
                    { label: 'Team', href: '#team' }
                  ].map((link) => (
                    link.isRoute ? (
                      <Link key={link.label} to={link.href} className="text-[10px] font-black text-brown-600 dark:text-slate-400 hover:text-accent-gold dark:hover:text-indigo-200 transition-colors uppercase tracking-[0.3em]">
                        {link.label}
                      </Link>
                    ) : (
                      <a key={link.label} href={link.href} className="text-[10px] font-black text-brown-600 dark:text-slate-400 hover:text-accent-gold dark:hover:text-indigo-200 transition-colors uppercase tracking-[0.3em]">
                        {link.label}
                      </a>
                    )
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleTheme}
                    className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-indigo-500 hover:text-accent-gold dark:hover:text-white rounded-2xl transition-all shadow-xl text-brown-600 dark:text-slate-400 border border-brown-100 dark:border-white/5"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                  <Magnetic>
                    <Link
                      to="/auth"
                      className="shimmer-btn block bg-brown-900 dark:bg-white text-white dark:text-slate-900 px-10 py-3 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all text-center flex-shrink-0"
                    >
                      Get Started
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
              <div className="relative z-10 w-full max-w-5xl px-6 text-center">
                <Parallax yRange={[-30, 30]}>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-accent-gold/10 dark:bg-indigo-500/20 border border-accent-gold/20 dark:border-indigo-500/20 px-4 py-1.5 rounded-full text-accent-gold dark:text-indigo-400 text-[10px] font-black tracking-[0.2em] uppercase mb-10 shadow-lg"
                  >
                    <Zap size={12} fill="currentColor" />
                    <span>Neural Intelligence Protocol v4.0</span>
                  </motion.div>
                </Parallax>

                <motion.div style={{ rotateX, rotateY, perspective: 1000 }}>
                  <Parallax yRange={[-60, 60]}>
                    <h1 className="relative z-10 text-6xl md:text-8xl lg:text-9xl font-serif text-brown-900 dark:text-white leading-[1.05] tracking-tight mb-10 perspective-1000 overflow-visible pb-4">
                      <RevealText text="Healthcare" /> <br />
                      <span className="text-brown-600 dark:text-slate-600 font-normal italic">
                        <RevealText text="reimagined." delayOffset={0.5} />
                      </span>
                    </h1>
                  </Parallax>
                </motion.div>

                <Parallax yRange={[-20, 20]}>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="text-lg md:text-xl text-brown-600 dark:text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
                  >
                    Bridging the gap between symptoms and care with the world's most accessible AI engine.
                  </motion.p>
                </Parallax>

                <div className="relative max-w-2xl mx-auto">
                  <VibeInputBox />
                </div>
              </div>

              {/* Integration Stats Bar */}
              <div className="mt-32 w-full max-w-5xl px-4">
                <div className="glass-soft dark:bg-white/5 rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-12 border-brown-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="flex-shrink-0 flex flex-col gap-2 relative z-10 text-center md:text-left">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 tracking-[0.3em] uppercase">Core Network</span>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-slate-300 dark:text-slate-800">
                      <Globe size={32} />
                      <Smartphone size={32} />
                      <Cpu size={32} />
                    </div>
                  </div>

                  <div className="hidden md:block h-16 w-px bg-brown-100 dark:bg-white/10" />

                  <div className="flex-grow relative z-10 text-center md:text-left">
                    <div className="flex items-baseline gap-2 mb-4 justify-center md:justify-start">
                      <span className="text-4xl font-display font-black text-brown-900 dark:text-white">99.8%</span>
                      <span className="text-[10px] font-bold text-brown-600 dark:text-slate-600 uppercase tracking-widest">Uptime Accuracy</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-12 gap-y-4 text-brown-600 dark:text-slate-700">
                      {['WHO', 'UNICEF', 'RED CROSS'].map(brand => (
                        <span key={brand} className="text-sm font-black tracking-[0.25em]">{brand}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ecosystem Explosion */}
            <ExplodedAssembly />

            {/* Pill Explosion Section */}
            <PillExplosion />

            {/* Marquee 1 */}
            <Marquee />

            {/* Feature Showcase */}
            <section className="bg-card-beige/30 dark:bg-slate-900/50 py-40 px-6">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-32">
                <aside className="hidden lg:block sticky top-40 h-fit">
                  <div className="p-8 border-l-2 border-accent-gold/20 dark:border-indigo-500/20">
                    <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 tracking-[0.4em] uppercase block mb-8">Navigation</span>
                    <StickyFeatureNav sections={features} />
                  </div>
                </aside>

                <main className="flex flex-col gap-60">
                  {/* AI Symptoms Section */}
                  <motion.section
                    id="ai-symptoms"
                    className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
                  >
                    <Parallax yRange={[-40, 40]} className="depth-card relative p-1 glass-strong dark:bg-white/5 rounded-[50px] aspect-square overflow-hidden shadow-2xl border border-white/20 dark:border-white/5 group">
                      {/* Internal Neural Scanner UI */}
                      <div className="relative h-full w-full bg-slate-950 rounded-[48px] overflow-hidden p-10 flex flex-col justify-between">
                        <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none" />

                        {/* Scanner Laser Line */}
                        <motion.div
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-px bg-accent-gold/50 dark:bg-indigo-500/50 shadow-[0_0_15px_rgba(197,160,89,0.5)] dark:shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20 pointer-events-none"
                        />

                        <div className="flex justify-between items-start relative z-30">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                            <div className="w-3 h-3 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 uppercase tracking-[0.3em] font-display animate-pulse">Scanner Active</span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] font-sans">Neural Pathing: Sync</span>
                          </div>
                        </div>

                        <div className="flex-grow flex items-center justify-center p-8 relative">
                          {/* Background Brain Mask Glow */}
                          <div className="absolute w-64 h-64 bg-indigo-600/10 blur-[60px] rounded-full" />

                          <motion.div
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10"
                          >
                            <Activity size={200} className="text-white opacity-20" strokeWidth={0.2} />
                            <motion.div
                              animate={{ opacity: [0.1, 0.4, 0.1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Activity size={200} className="text-accent-gold/40 dark:text-indigo-500/40" strokeWidth={0.8} />
                            </motion.div>
                          </motion.div>

                          {/* Neural Nodes */}
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.5 }}
                              className="absolute w-1.5 h-1.5 bg-accent-gold dark:bg-indigo-500 rounded-full shadow-[0_0_8px_#c5a059] dark:shadow-[0_0_8px_#6366f1]"
                              style={{
                                top: `${20 + Math.random() * 60}%`,
                                left: `${20 + Math.random() * 60}%`
                              }}
                            />
                          ))}
                        </div>

                        <div className="glass-soft bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-xl relative z-30 flex items-center justify-between group-hover:translate-y-[-5px] transition-transform">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                              <Check size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white tracking-tight">Identity: Verified</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Protocol Integrity 100%</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex gap-1">
                              {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-1 h-3 bg-indigo-500/20 rounded-full" />
                              ))}
                            </div>
                            <span className="text-[8px] font-black text-accent-gold dark:text-indigo-500 uppercase">Analysis: Secure</span>
                          </div>
                        </div>
                      </div>
                    </Parallax>
                    <motion.div className="pr-10" variants={fadeRight}>
                      <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 tracking-[0.3em] uppercase block mb-4">Neural Engine</span>
                      <h2 className="text-5xl lg:text-6xl font-serif text-brown-900 dark:text-white mb-8 leading-[1.1]">AI Symptom <br /> Checker</h2>
                      <p className="text-brown-600 dark:text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                        Experience medical triage like never before. Our NLP model deciphers natural language and dialects to prioritize your safety in real-time.
                      </p>
                      <div className="grid gap-4">
                        {['Multilingual semantic understanding', 'Zero-data leakage architecture', 'Direct emergency medical routing'].map((item, i) => (
                          <motion.div key={i} custom={i} variants={fadeUp} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-warm-light dark:bg-indigo-500/10 flex items-center justify-center text-accent-gold dark:text-indigo-400">
                              <Check size={20} />
                            </div>
                            <span className="text-sm font-bold text-brown-900 dark:text-slate-300">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.section>

                  {/* Locator Section */}
                  <motion.section
                    id="hospital-locator"
                    className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
                  >
                    <motion.div className="order-2 md:order-1" variants={fadeLeft}>
                      <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 tracking-[0.3em] uppercase block mb-4">Mapping Protocol</span>
                      <h2 className="text-5xl lg:text-6xl font-serif text-brown-900 dark:text-white mb-8 leading-[1.1]">Seamless <br /> Locator</h2>
                      <p className="text-brown-600 dark:text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                        Find the nearest specialist with offline-first maps. Even in rural areas with poor connectivity, your safety is mapped.
                      </p>
                      <Magnetic>
                        <Link to="/hospitals" className="shimmer-btn flex items-center justify-center bg-brown-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 group w-fit">
                          Explore Map <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                      </Magnetic>
                    </motion.div>
                    <div className="order-1 md:order-2 relative p-1 glass-strong dark:bg-white/5 rounded-[50px] aspect-square overflow-hidden shadow-2xl border border-white/20 dark:border-white/5">
                      <div className="relative h-full w-full bg-slate-950 rounded-[48px] overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 grid-overlay opacity-10" />

                        {/* Pulsing Map Rings */}
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="absolute w-80 h-80 border-2 border-accent-gold/20 dark:border-indigo-500/20 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                          className="absolute w-80 h-80 border-2 border-accent-gold/10 dark:border-indigo-500/10 rounded-full"
                        />

                        <div className="relative z-10 flex flex-col items-center gap-6">
                          <MapPin size={100} strokeWidth={0.5} className="text-accent-gold dark:text-indigo-500 animate-bounce" />
                          <span className="text-[10px] font-black text-accent-gold/50 dark:text-indigo-500/50 uppercase tracking-[0.4em]">Optimizing Pathing</span>
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  {/* Offline Mode / Global Impact */}
                  <motion.section
                    id="global-impact" className="py-20"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
                    variants={fadeUp}
                  >
                    <div className="glass-strong dark:bg-white/5 rounded-[50px] p-12 md:p-20 border-brown-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Globe size={300} />
                      </div>
                      <div className="relative z-10 max-w-2xl">
                        <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 tracking-[0.3em] uppercase block mb-6">Humanitarian Reach</span>
                        <h2 className="text-5xl lg:text-7xl font-serif text-brown-900 dark:text-white mb-8 tracking-tight italic font-normal">Global <br /> <span className="font-bold text-brown-600 dark:text-slate-400 not-italic">Resilience.</span></h2>
                        <p className="text-brown-600 dark:text-slate-400 text-xl leading-relaxed mb-10 font-medium">
                          Our engine is designed to function in the most extreme conditions. With PWA technology and local caching, diagnostic data remains accessible even in dead zones.
                        </p>
                        <div className="flex flex-wrap gap-8">
                          <div className="space-y-2">
                            <p className="text-4xl font-display font-black text-accent-gold dark:text-white">40+</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Countries Reached</p>
                          </div>
                          <div className="w-px h-12 bg-brown-100 dark:bg-white/10" />
                          <div className="space-y-2">
                            <p className="text-4xl font-display font-black text-accent-gold dark:text-white">1M+</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Neural Probes Run</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  {/* Security Section */}
                  <motion.section
                    id="security"
                    className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
                  >
                    <div className="depth-card relative p-1 glass-strong dark:bg-white/5 rounded-[50px] aspect-square overflow-hidden shadow-2xl border border-white/20 dark:border-white/5 group">
                      <div className="relative h-full w-full bg-slate-50 dark:bg-slate-900 rounded-[48px] overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 grid-overlay opacity-10" />
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-48 h-48 bg-accent-gold/10 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-accent-gold dark:text-indigo-500 border border-accent-gold/20 dark:border-indigo-500/20"
                        >
                          <Shield size={64} strokeWidth={1.5} />
                        </motion.div>
                        <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-2">
                          <div className="mt-8 w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity }} className="w-1/2 h-full bg-accent-gold dark:bg-indigo-500" />
                          </div>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">Encrypted Data Stream Active</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 tracking-[0.3em] uppercase block mb-4">Encryption Layer</span>
                      <h2 className="text-5xl lg:text-6xl font-serif text-brown-900 dark:text-white mb-8 leading-[1.1]">Absolute <br /> Privacy.</h2>
                      <p className="text-brown-600 dark:text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                        Your health data is your own. We implement 256-bit AES end-to-end encryption. No identifiers are shared with third parties, ever.
                      </p>
                      <div className="space-y-4">
                        {[
                          'HIPAA Compliant Standards',
                          'Decentralized Identity Masking',
                          'Zero-Logs Forensic Policy'
                        ].map(item => (
                          <div key={item} className="flex items-center gap-4">
                            <Check size={16} className="text-accent-gold dark:text-indigo-500" />
                            <span className="text-xs font-bold text-brown-900 dark:text-slate-300 uppercase tracking-widest">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.section>

                  {/* Emergency SOS Section */}
                  <motion.section
                    id="sos-protocol" className="py-20"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
                    variants={fadeUp}
                  >
                    <div className="relative p-10 md:p-20 bg-red-600 rounded-[50px] overflow-hidden shadow-2xl shadow-red-500/20 group">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <div className="absolute inset-0 grid-overlay opacity-10" />

                      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                        <div className="max-w-xl text-center lg:text-left">
                          <div className="flex items-center justify-center lg:justify-start gap-2 text-red-100 text-[10px] font-black tracking-widest uppercase mb-4">
                            <AlertTriangle size={14} /> Immediate Response Protocol
                          </div>
                          <h3 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">One-Tap <br /> <span className="text-red-200/60 lowercase italic font-normal">emergency signal.</span></h3>
                          <p className="text-red-100/80 font-medium text-lg leading-relaxed">
                            In critical situations, seconds matter. Our SOS system instantly broadcasts your location to the nearest responders using low-frequency neural signals.
                          </p>
                        </div>
                        <Link to="/sos" className="bg-white text-red-600 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 transition-all">
                          Activate SOS Gateway
                        </Link>
                      </div>

                      <Activity size={300} className="absolute -right-20 -bottom-20 text-white opacity-5 rotate-12" />
                    </div>
                  </motion.section>
                </main>
              </div>
            </section>

            {/* Marquee 2 – reverse */}
            <Marquee reverse />

            {/* Testimonial Mural */}
            <motion.section
              className="bg-slate-50 dark:bg-slate-950 py-40 px-6 transition-colors duration-500"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
            >
              <div className="max-w-6xl mx-auto">
                <motion.div className="mb-24 text-center" variants={fadeUp}>
                  <h2 className="text-6xl lg:text-8xl font-serif text-brown-900 dark:text-white mb-8 tracking-tighter">Global <span className="text-accent-gold dark:text-indigo-500 italic">Validation.</span></h2>
                </motion.div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                  {[
                    { name: "Dr. Sarah Chen", handle: "@sarahchen_md", quote: "MedAssist bridges the critical gap in rural triage where accessibility was once impossible." },
                    { name: "Global Relief", handle: "@gr_global", quote: "The offline capability alone is a life-saver for our field missions." },
                    { name: "Michael Obi", handle: "@michael_obi", quote: "Instant, accurate, and completely free. This is the future." }
                  ].map((t, i) => (
                    <motion.div key={i} custom={i} variants={fadeUp} className="depth-card glass-strong dark:bg-white/5 rounded-[40px] p-10 border-brown-100 dark:border-white/10 break-inside-avoid shadow-2xl">
                      <p className="text-brown-900 dark:text-slate-200 text-xl font-medium leading-relaxed mb-10">"{t.quote}"</p>
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-brown-900 dark:text-white font-bold text-sm tracking-tight">{t.name}</h4>
                          <span className="text-slate-500 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">{t.handle}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Meet the Architect (Developer Info) */}
            <section id="team" className="bg-slate-50 dark:bg-slate-900/30 py-40 px-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full opacity-30 animate-pulse" />
                    <div className="relative glass-strong dark:bg-white/5 p-2 rounded-[60px] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden aspect-square">
                      <div className="h-full w-full bg-slate-50 dark:bg-slate-900 rounded-[58px] flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 grid-overlay opacity-20" />
                        <div className="relative z-10 flex flex-col items-center gap-6">
                          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-2xl">
                            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                              <span className="text-6xl font-serif text-slate-400 dark:text-white opacity-40">HG</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-3xl font-serif text-brown-900 dark:text-white mb-2">Himanshu Gupta</h3>
                            <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 uppercase tracking-[0.4em]">Lead Architect & Developer</span>
                          </div>
                        </div>

                        <div className="absolute inset-0 pointer-events-none">
                          {[
                            { t: 'React', x: '5%', y: '6%' },
                            { t: 'Python', x: '68%', y: '6%' },
                            { t: 'Gemini AI', x: '3%', y: '84%' },
                            { t: 'Supabase', x: '64%', y: '84%' }
                          ].map((tag, i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -10, 0] }}
                              transition={{ duration: 3 + i, repeat: Infinity }}
                              className="absolute bg-white/20 dark:bg-white/5 backdrop-blur-md border border-brown-100 dark:border-white/10 px-4 py-2 rounded-2xl text-[8px] font-black text-brown-900 dark:text-white uppercase tracking-widest"
                              style={{ top: tag.y, left: tag.x }}
                            >
                              {tag.t}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 tracking-[0.3em] uppercase block mb-4">Behind the Neural Core</span>
                      <h2 className="text-5xl lg:text-7xl font-serif text-brown-900 dark:text-white leading-tight mb-8">Crafting the <br /> <span className="text-brown-600 dark:text-slate-600 italic font-normal">Health Protocol</span></h2>
                      <p className="text-brown-600 dark:text-slate-400 text-xl leading-relaxed font-medium">
                        Built with a passion for humanitarian technology and high-fidelity design. This platform represents the intersection of advanced AI and human-centric medical accessibility.
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-brown-100 dark:border-white/5">
                      <div className="flex items-center gap-4 text-brown-600 dark:text-slate-300">
                        <div className="w-10 h-10 rounded-xl bg-card-beige dark:bg-white/5 flex items-center justify-center text-accent-gold dark:text-indigo-500">
                          <Phone size={18} />
                        </div>
                        <span className="font-medium text-lg text-brown-900 dark:text-white">+91 63943 79399</span>
                      </div>
                      <div className="flex items-center gap-4 text-brown-600 dark:text-slate-300">
                        <div className="w-10 h-10 rounded-xl bg-card-beige dark:bg-white/5 flex items-center justify-center text-accent-gold dark:text-indigo-500">
                          <Mail size={18} />
                        </div>
                        <div className="flex flex-col text-brown-900 dark:text-white">
                          <span className="font-medium">himanshu8769111@gmail.com</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-4">
                      <a href="mailto:himanshu8769111@gmail.com" className="flex items-center gap-3 px-8 py-4 bg-brown-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                        Get In Touch <ArrowRight size={16} />
                      </a>
                      <div className="flex gap-4">
                        <button className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border-brown-100 dark:border-white/10 flex items-center justify-center text-brown-900 dark:text-white hover:bg-card-beige dark:hover:bg-white/10 transition-all">
                          <Briefcase size={20} />
                        </button>
                        <button className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border-brown-100 dark:border-white/10 flex items-center justify-center text-brown-900 dark:text-white hover:bg-card-beige dark:hover:bg-white/10 transition-all">
                          <Code2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Neural Lattice (Tech Stack Section) */}
            <motion.section
              className="bg-slate-50 dark:bg-slate-900 py-40 px-6 relative overflow-hidden transition-colors duration-500"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <div className="absolute inset-0 grid-overlay opacity-10" />
              <motion.div className="max-w-7xl mx-auto text-center mb-32" variants={fadeUp}>
                <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 tracking-[0.4em] uppercase block mb-6">Internal Infrastructure</span>
                <h2 className="text-6xl md:text-8xl font-serif text-brown-900 dark:text-white mb-8 tracking-tighter">Powered by <br /> <span className="text-brown-600 dark:text-slate-600 italic">Advanced Neural Lattice.</span></h2>
              </motion.div>

              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                {[
                  { icon: <Code2 />, title: 'React 18', desc: 'High-performance neural rendering engine for seamless UI transitions.' },
                  { icon: <Zap />, title: 'Gemini AI', desc: 'State-of-the-art LLM processing for atmospheric diagnostic logic.' },
                  { icon: <Smartphone />, title: 'PWA Core', desc: 'Offline-first architecture ensuring availability in critical dead zones.' },
                  { icon: <Shield />, title: 'Supabase', desc: 'Military-grade encryption for decentralized medical identity data.' }
                ].map((tech, i) => (
                  <motion.div key={i} custom={i} variants={fadeUp} className="depth-card glass-strong dark:bg-white/5 p-8 rounded-[40px] border-brown-100 dark:border-white/10 hover:bg-card-beige dark:hover:bg-white/10 transition-all group">
                    <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 dark:bg-indigo-500/20 flex items-center justify-center text-accent-gold dark:text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
                      {tech.icon}
                    </div>
                    <h4 className="text-xl font-bold text-brown-900 dark:text-white mb-4 tracking-tight">{tech.title}</h4>
                    <p className="text-brown-600 dark:text-slate-500 text-sm leading-relaxed font-medium">{tech.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* FAQ Experience */}
            <section className="bg-warm-light dark:bg-slate-950 py-40 px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-5xl lg:text-6xl font-serif text-brown-900 dark:text-white text-center mb-24 tracking-tight">Answers for your <br /> health journey.</h2>
                <div className="space-y-4">
                  <FAQItem
                    question="How secure is my health profile?"
                    answer="We utilize 256-bit AES encryption at rest and TLS 1.3 in transit."
                  />
                  <FAQItem
                    question="Does it require a paid subscription?"
                    answer="MedAssist AI is a humanitarian project. The core assistant is free."
                  />
                  <FAQItem
                    question="Can it replace a real doctor?"
                    answer="Absolutely not. Our engine is a high-accuracy triage tool."
                  />
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-card-beige dark:bg-slate-900/80 border-t border-brown-100 dark:border-white/5 py-20 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-16">
                  {/* Brand */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <Activity className="text-accent-gold dark:text-indigo-400" size={32} />
                      <span className="font-display font-black text-2xl tracking-tighter text-brown-900 dark:text-white">
                        medassist <span className="text-accent-gold dark:text-indigo-400">ai</span>
                      </span>
                    </div>
                    <p className="text-brown-600 dark:text-slate-400 text-base max-w-xs font-medium leading-relaxed">
                      Advancing human health through atmospheric intelligence.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div className="flex flex-col gap-6">
                    <p className="text-[10px] font-black text-brown-900 dark:text-slate-500 uppercase tracking-[0.3em]">Navigation</p>
                    <div className="flex flex-col gap-4">
                      {[
                        { label: 'Ai symptoms', href: '/symptoms', isRoute: true },
                        { label: 'Hospital locator', href: '/hospitals', isRoute: true },
                        { label: 'Offline mode', href: '#global-impact' },
                        { label: 'Emergency sos', href: '/sos', isRoute: true },
                      ].map((item) => (
                        item.isRoute ? (
                          <Link key={item.label} to={item.href} className="text-sm font-bold text-brown-600 dark:text-slate-400 hover:text-accent-gold dark:hover:text-indigo-400 transition-colors tracking-tight capitalize">
                            {item.label}
                          </Link>
                        ) : (
                          <a key={item.label} href={item.href} className="text-sm font-bold text-brown-600 dark:text-slate-400 hover:text-accent-gold dark:hover:text-indigo-400 transition-colors tracking-tight capitalize">
                            {item.label}
                          </a>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Developer Info */}
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-black text-brown-600 dark:text-slate-600 uppercase tracking-[0.3em]">Lead Developer</p>
                    <p className="text-brown-900 dark:text-white font-bold text-lg">Himanshu Gupta</p>
                    <div className="flex flex-col gap-2">
                      <a href="tel:+916394379399" className="flex items-center gap-2 text-brown-600 dark:text-slate-400 hover:text-accent-gold dark:hover:text-indigo-400 transition-colors text-sm font-medium">
                        <Phone size={14} /> +91 63943 79399
                      </a>
                      <a href="mailto:himanshu8769111@gmail.com" className="flex items-center gap-2 text-brown-600 dark:text-slate-400 hover:text-accent-gold dark:hover:text-indigo-400 transition-colors text-sm font-medium">
                        <Mail size={14} /> himanshu8769111@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-brown-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-[10px] font-black text-brown-600 dark:text-slate-600 uppercase tracking-widest">&copy; 2026 MedAssist AI Labs · Designed & Built by Himanshu Gupta</span>
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent-gold/10 dark:bg-indigo-500/10 rounded-full border border-accent-gold/20 dark:border-indigo-500/20">
                    <div className="w-1.5 h-1.5 bg-accent-gold dark:bg-indigo-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-accent-gold dark:text-indigo-500 uppercase tracking-widest">System Operational</span>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
