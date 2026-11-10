import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Intro.css';

// All timings in seconds, measured from the start of the timeline.
export const CONFIG = {
  glowIn: { at: 0, dur: 0.4 },
  draw: { at: 0.4, dur: 1.2 }, // strokes draw + slide + rotate into place
  pulse: { at: 1.6, dur: 0.4 }, // ring + glow burst
  slide: { at: 2.0, dur: 1.2 }, // mark slides left
  letters: { delay: 0.15, dur: 0.6, stagger: 0.08 }, // relative to slide.at
  line: { at: 3.2, dur: 0.6 }, // sweep under wordmark
  exit: { at: 3.8, dur: 0.7 }, // scale + blur + fade out
  reduced: { fade: 1, hold: 0.6, out: 0.4 }, // prefers-reduced-motion
  skipFade: 0.3,
  ease: 'expo.out', // ~ cubic-bezier(0.22, 1, 0.36, 1)
  drawEase: 'power2.inOut',
  overshoot: 'back.out(1.2)',
  parallax: 16, // px, mouse parallax strength (0 disables)
};

const C = CONFIG;

// Mark: a leaf split into two butt-capped strokes (traced from the brand image). viewBox 0 0 44 62.
const STROKE_A = 'M24 6C8 20 4 38 17 51';
const STROKE_B = 'M30.4 15C38 22 39 44 18.4 57.6';

// Wordmark letters as monoline strokes on a 100-high grid: [path, width, gap-before (em)].
const LETTERS = [
  ['M10 0V62Q10 90 38 90H60', 60, 0],
  ['M46.5 10A36.5 40 0 1 0 46.5 90A36.5 40 0 1 0 46.5 10', 93, 0.06],
  ['M73.6 23.2A36.5 40 0 1 0 73.6 76.8', 93, 0.17],
  ['M10 0V55A35 35 0 0 0 80 55V0', 90, 0.14],
  ['M68 24C62 12 48 10 38 10C22 10 14 22 18 33C22 44 40 46 54 52C68 58 70 74 58 82C48 90 28 90 12 76', 80, 0.14],
];

export default function Intro({ onComplete }) {
  const root = useRef(null);
  const canvas = useRef(null);
  const skip = useRef(() => {});

  useEffect(() => {
    const el = root.current;
    const $ = (s) => el.querySelectorAll(s);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dead = false;
    let tl;
    let raf = 0;
    const done = () => {
      if (!dead) {
        dead = true;
        onComplete();
      }
    };

    const ctx = gsap.context(() => {
      skip.current = () => {
        tl?.kill();
        gsap.to(el, { opacity: 0, duration: C.skipFade, onComplete: done });
      };
    }, el);

    const build = () => {
      if (dead) return;
      ctx.add(() => {
        const mark = el.querySelector('.intro__mark');
        const word = el.querySelector('.intro__word');
        const paths = $('.intro__stroke');
        const [a, b] = paths;

        if (reduced) {
          gsap.set(paths, { strokeDashoffset: 0, opacity: 1 });
          gsap.set($('.intro__ch'), { y: 0, opacity: 1 });
          gsap.set(el.querySelector('.intro__glow'), { opacity: 0.5 });
          gsap.set(el.querySelector('.intro__line'), { scaleX: 1 });
          gsap.set(el.querySelector('.intro__grid'), { opacity: 0.05 });
          tl = gsap.timeline({ onComplete: done });
          tl.from(el.querySelector('.intro__stage'), { opacity: 0, duration: C.reduced.fade })
            .to(el, { opacity: 0, duration: C.reduced.out }, `+=${C.reduced.hold}`);
          return;
        }

        // Start with the mark centred on screen; slide moves it to its place.
        const gap = word.getBoundingClientRect().left - mark.getBoundingClientRect().right;
        gsap.set(mark, { x: (word.getBoundingClientRect().width + gap) / 2 });
        gsap.set([a, b], { svgOrigin: '22 31' });
        gsap.set(a, { x: -60, y: -48, rotation: -40 });
        gsap.set(b, { x: 60, y: 48, rotation: 40 });

        tl = gsap.timeline({ onComplete: done });
        tl.to('.intro__glow', { opacity: 0.35, duration: C.glowIn.dur, ease: 'power2.out' }, C.glowIn.at)
          // draw + move into place
          .to(paths, { opacity: 1, duration: 0.2 }, C.draw.at)
          .to(paths, { strokeDashoffset: 0, duration: C.draw.dur, ease: C.drawEase }, C.draw.at)
          .to(paths, { x: 0, y: 0, rotation: 0, duration: C.draw.dur, ease: C.overshoot }, C.draw.at)
          // pulse
          .fromTo('.intro__ring', { scale: 0.6, opacity: 0.8 }, { scale: 2.6, opacity: 0, duration: C.pulse.dur * 1.5, ease: C.ease, immediateRender: false }, C.pulse.at)
          .to('.intro__glow', { opacity: 0.8, duration: C.pulse.dur / 2, yoyo: true, repeat: 1, ease: 'power2.out' }, C.pulse.at)
          .to('.intro__mark-inner', { scale: 1.08, duration: C.pulse.dur / 2, ease: 'power2.out', yoyo: true, repeat: 1 }, C.pulse.at)
          // slide + letters
          .to('.intro__grid', { opacity: 0.05, duration: C.slide.dur }, C.slide.at)
          .to(mark, { x: 0, duration: C.slide.dur, ease: C.ease }, C.slide.at)
          .to('.intro__glow', { opacity: 0.3, duration: C.slide.dur }, C.slide.at)
          .fromTo(
            '.intro__ch',
            { y: '100%', opacity: 0, filter: 'blur(4px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: C.letters.dur, ease: C.ease, stagger: C.letters.stagger },
            C.slide.at + C.letters.delay,
          )
          // line sweep
          .to('.intro__line', { scaleX: 1, duration: C.line.dur, ease: 'power3.inOut' }, C.line.at)
          // exit
          .to(el, { scale: 1.06, opacity: 0, duration: C.exit.dur, ease: 'power2.inOut' }, C.exit.at);
      });
    };

    // Measure after the font is in so the wordmark width is right.
    (document.fonts?.ready ?? Promise.resolve()).then(build);

    // Particles: ~40 dots, plain 2D canvas, dpr 1.
    const cv = canvas.current;
    if (!reduced && cv) {
      const g = cv.getContext('2d');
      let pts = [];
      const size = () => {
        cv.width = window.innerWidth;
        cv.height = window.innerHeight;
        const n = Math.min(50, Math.round((cv.width * cv.height) / 30000));
        pts = Array.from({ length: n }, () => ({
          x: Math.random() * cv.width,
          y: Math.random() * cv.height,
          r: Math.random() * 1.1 + 0.4,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -Math.random() * 0.2 - 0.05,
          a: Math.random() * 0.4 + 0.1,
        }));
      };
      size();
      window.addEventListener('resize', size);
      const loop = () => {
        g.clearRect(0, 0, cv.width, cv.height);
        g.fillStyle = '#fff';
        for (const p of pts) {
          p.x = (p.x + p.vx + cv.width) % cv.width;
          p.y = (p.y + p.vy + cv.height) % cv.height;
          g.globalAlpha = p.a;
          g.beginPath();
          g.arc(p.x, p.y, p.r, 0, 6.2832);
          g.fill();
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
      cv.cleanup = () => window.removeEventListener('resize', size);
    }

    // Mouse parallax (fine pointers only).
    let onMove;
    if (!reduced && C.parallax && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const stage = el.querySelector('.intro__stage');
      const qx = gsap.quickTo(stage, 'x', { duration: 0.8, ease: 'power3.out' });
      const qy = gsap.quickTo(stage, 'y', { duration: 0.8, ease: 'power3.out' });
      onMove = (e) => {
        qx((e.clientX / window.innerWidth - 0.5) * -C.parallax);
        qy((e.clientY / window.innerHeight - 0.5) * -C.parallax);
      };
      window.addEventListener('pointermove', onMove, { passive: true });
    }

    const onKey = (e) => e.key === 'Escape' && skip.current();
    window.addEventListener('keydown', onKey);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      cv?.cleanup?.();
      window.removeEventListener('keydown', onKey);
      if (onMove) window.removeEventListener('pointermove', onMove);
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div ref={root} className="intro" role="group" aria-label="Locus" onClick={() => skip.current()}>
      <div className="intro__grid" />
      <canvas ref={canvas} className="intro__particles" aria-hidden="true" />
      <div className="intro__glow" />
      <div className="intro__vignette" />

      <div className="intro__stage">
        <div className="intro__brand">
          <div className="intro__mark">
            <div className="intro__mark-inner">
              <span className="intro__ring" />
              <svg viewBox="0 0 44 62" aria-hidden="true" focusable="false">
                <path className="intro__stroke" d={STROKE_A} pathLength="1" />
                <path className="intro__stroke" d={STROKE_B} pathLength="1" />
              </svg>
            </div>
          </div>
          <div className="intro__word" aria-hidden="true">
            {LETTERS.map(([d, w, gap], i) => (
              <span className="intro__mask" key={i} style={{ marginLeft: `${gap}em` }}>
                <svg className="intro__ch" viewBox={`0 0 ${w} 100`} style={{ width: `${w / 100}em` }}>
                  <path d={d} />
                </svg>
              </span>
            ))}
          </div>
        </div>
        <div className="intro__line" />
      </div>

      <button
        type="button"
        className="intro__skip"
        onClick={(e) => {
          e.stopPropagation();
          skip.current();
        }}
      >
        Skip
      </button>
    </div>
  );
}
