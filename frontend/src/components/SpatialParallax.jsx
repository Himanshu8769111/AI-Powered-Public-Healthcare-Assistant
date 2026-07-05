/**
 * SpatialParallax — Smooth 3D Scroll Component
 *
 * Performance strategy:
 *  • No useSpring → transforms respond instantly to scroll (eliminates JS lag)
 *  • will-change: transform on every animated layer → dedicated GPU compositing
 *  • No useState for scroll % → useMotionTemplate + motion.span (zero re-renders)
 *  • backdrop-filter only where truly needed (removed from image wrappers)
 *  • All transforms kept as compositor-only (translate/scale/rotate) — no layout props
 */
import React, { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';

// Images
import logoImg from '../assets/medassist_logo.jpg';
import projectImg from '../assets/project_photo.png';

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const FONT_DISPLAY = "'Anton', 'Impact', sans-serif";
const FONT_MONO    = "'Space Grotesk', 'Courier New', monospace";

/* ─── GPU-hint style to add to every animated element ───────────────────────── */
const GPU = { willChange: 'transform', backfaceVisibility: 'hidden' };

/* ─── Noise overlay ──────────────────────────────────────────────────────────── */
const NoiseOverlay = () => (
  <div
    aria-hidden="true"
    style={{
      pointerEvents: 'none',
      position: 'fixed',
      inset: 0,
      zIndex: 9997,
      opacity: 0.038,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '180px 180px',
    }}
  />
);

/* ─── Atmospheric glows ──────────────────────────────────────────────────────── */
const Glows = () => (
  <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <div style={{
      position: 'absolute', width: '70vw', height: '70vw', top: '-22%', left: '-18%',
      background: 'radial-gradient(circle, rgba(124,58,237,0.55) 0%, transparent 65%)',
      mixBlendMode: 'screen', filter: 'blur(80px)',
    }} />
    <div style={{
      position: 'absolute', width: '75vw', height: '75vw', bottom: '-28%', right: '-12%',
      background: 'radial-gradient(circle, rgba(23,37,129,0.65) 0%, transparent 65%)',
      mixBlendMode: 'screen', filter: 'blur(100px)',
    }} />
    <div style={{
      position: 'absolute', width: '50vw', height: '50vw', top: '28%', left: '22%',
      background: 'radial-gradient(circle, rgba(109,40,217,0.28) 0%, transparent 68%)',
      mixBlendMode: 'screen', filter: 'blur(120px)',
    }} />
  </div>
);

/* ─── Corner accents ─────────────────────────────────────────────────────────── */
const corners = [
  { top: 24, left: 24,    borderTop: '1px solid rgba(255,255,255,0.13)', borderLeft:   '1px solid rgba(255,255,255,0.13)' },
  { top: 24, right: 24,   borderTop: '1px solid rgba(255,255,255,0.13)', borderRight:  '1px solid rgba(255,255,255,0.13)' },
  { bottom: 24, left: 24, borderBottom: '1px solid rgba(255,255,255,0.13)', borderLeft: '1px solid rgba(255,255,255,0.13)' },
  { bottom: 24, right: 24,borderBottom: '1px solid rgba(255,255,255,0.13)', borderRight:'1px solid rgba(255,255,255,0.13)' },
];

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function SpatialParallax() {
  const ref = useRef(null);

  /* ── Scroll progress (0 → 1) — drives everything directly, no spring lag ── */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  /* ── Background typography: right → left, scale down ────────────────────── */
  const bgX     = useTransform(scrollYProgress, [0, 1], ['5%',   '-88%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.5,    0.48]);
  const bgOp    = useTransform(scrollYProgress, [0, 0.04, 0.88, 1], [0, 0.065, 0.065, 0]);

  /* ── Foreground typography: left → right, in front ──────────────────────── */
  const fgX  = useTransform(scrollYProgress, [0, 1], ['-6%',  '68%']);
  const fgY  = useTransform(scrollYProgress, [0, 1], ['10%', '-12%']);
  const fgOp = useTransform(scrollYProgress, [0, 0.08, 0.82, 1], [0, 1, 1, 0]);
  
  /* ── Logo Layer: slow zoom ──────────────────── */
  const logoZ  = useTransform(scrollYProgress, [0, 1], [-1200, 200]);
  const logoOp = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.15, 0.15, 0]);

  /* ── Project Layer: side fly-by ──────────────── */
  const projX  = useTransform(scrollYProgress, [0.2, 0.8], ['120vw', '-20vw']);
  const projZ  = useTransform(scrollYProgress, [0.2, 0.8], [-800, 400]);
  const projOp = useTransform(scrollYProgress, [0.15, 0.25, 0.75, 0.85], [0, 1, 1, 0]);



  /* ── Hero fade-out ───────────────────────────────────────────────────────── */
  const heroOp = useTransform(scrollYProgress, [0, 0.10, 0.18], [1, 1, 0]);
  const heroY  = useTransform(scrollYProgress, [0, 0.18], [0, -80]);

  /* ── HUD progress bar (no re-render — pure motion value) ────────────────── */
  const barW   = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const pctStr = useMotionTemplate`${useTransform(scrollYProgress, v => String(Math.round(v * 100)).padStart(2, '0'))}%`;

  return (
    <>
      <NoiseOverlay />

      <div style={{ position: 'relative' }}>
        {/* ══ 500vh scroll driver ══════════════════════════════════════════════ */}
        <section
          ref={ref}
          id="spatial-parallax"
          aria-label="3D Spatial Parallax"
          style={{ height: '500vh', position: 'relative' }}
        >
          {/* ══ Sticky 100vh viewport ════════════════════════════════════════ */}
          <div style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            background: '#000',
            perspective: '1200px',
          }}>

            <Glows />

            {/* Grid lines */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.011) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.011) 1px, transparent 1px)
              `,
              backgroundSize: '72px 72px',
            }} />

            {/* ═══ 3-D Stage ════════════════════════════════════════════════ */}
            <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>

              {/* BG text — translateZ:-400, behind images */}
              <motion.div style={{
                ...GPU,
                x: bgX, scale: bgScale, opacity: bgOp,
                translateZ: -400,
                position: 'absolute', top: '50%', left: 0,
                translateY: '-50%',
                whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 1,
              }}>
                <span style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 'clamp(90px, 18vw, 240px)',
                  fontWeight: 900, color: '#fff',
                  letterSpacing: '-0.01em', lineHeight: 0.95,
                  textTransform: 'uppercase', userSelect: 'none',
                }}>
                  MEDASSIST&nbsp;&nbsp;NEURAL&nbsp;&nbsp;HEALTH&nbsp;&nbsp;AI
                </span>
              </motion.div>

              {/* ── Logo Layer ──────────────────────── */}
              <motion.div style={{
                ...GPU,
                translateZ: logoZ, opacity: logoOp,
                position: 'absolute', top: '50%', left: '50%',
                translateX: '-50%', translateY: '-50%',
                width: 'clamp(300px, 40vw, 800px)',
                zIndex: 2,
              }}>
                <img src={logoImg} alt="" style={{ width: '100%', filter: 'brightness(0.7) contrast(1.2) grayscale(0.6)', borderRadius: '24px', opacity: 0.8 }} />
              </motion.div>

              {/* ── Project Layer ────────────────────── */}
              <motion.div style={{
                ...GPU,
                x: projX, translateZ: projZ, opacity: projOp,
                position: 'absolute', top: '20%',
                width: 'clamp(250px, 30vw, 600px)',
                zIndex: 5,
              }}>
                <img src={projectImg} alt="" style={{ width: '100%', filter: 'brightness(1.1)', borderRadius: '15px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }} />
              </motion.div>



              {/* ── FG text — translateZ:320, in front of images ──────────── */}
              <motion.div style={{
                ...GPU,
                x: fgX, y: fgY, opacity: fgOp,
                translateZ: 320,
                position: 'absolute', bottom: '9%', left: 0,
                whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 6,
              }}>
                <span style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 'clamp(40px, 7vw, 100px)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(139,92,246,0.85) 48%, rgba(255,255,255,0.5) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  userSelect: 'none',
                }}>
                  FEEL&nbsp;&nbsp;THE&nbsp;&nbsp;DEPTH
                </span>
              </motion.div>

              {/* ── HUD: progress bar (zero re-renders) ───────────────────── */}
              <div style={{
                position: 'absolute', bottom: 26, left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 12, pointerEvents: 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 130, height: 1, background: 'rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
                  <motion.div style={{
                    width: barW, height: '100%',
                    background: 'linear-gradient(90deg, #7c3aed, #1e3a8a)',
                    position: 'absolute', left: 0, top: 0,
                  }} />
                </div>
                <motion.span style={{ fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.28)', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em' }}>
                  {pctStr}
                </motion.span>
              </div>

            </div>{/* end 3D stage */}

            {/* Corner marks */}
            {corners.map((s, i) => (
              <div key={i} aria-hidden="true" style={{ position: 'absolute', width: 26, height: 26, pointerEvents: 'none', zIndex: 12, ...s }} />
            ))}

            {/* Side labels */}
            <div aria-hidden="true" style={{ position: 'absolute', right: 26, top: '50%', transform: 'translateY(-50%) rotate(90deg)', zIndex: 12, pointerEvents: 'none' }}>
              <span style={{ fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.14)', fontSize: 9, fontWeight: 600, letterSpacing: '0.4em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                SPATIAL DEPTH / SCROLL
              </span>
            </div>
            <div aria-hidden="true" style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', zIndex: 12, pointerEvents: 'none' }}>
              <span style={{ fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.10)', fontSize: 9, fontWeight: 600, letterSpacing: '0.4em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                MEDASSIST / NEURAL PROTOCOL
              </span>
            </div>

            {/* Vignette */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9,
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.86) 100%)',
            }} />

          </div>{/* end sticky */}
        </section>
      </div>
    </>
  );
}
