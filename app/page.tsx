'use client';

import { useEffect, useRef, useState } from 'react';

const colors = ['#ed1c24', '#1747d1', '#ffd21f'];

export default function Home() {
  const [dots, setDots] = useState<Array<{ id: number; x: number; y: number; nx: number; ny: number; size: number; color: string }>>([]);
  const [stage, setStage] = useState<'intro' | 'draw'>('intro');
  const [posterOpen, setPosterOpen] = useState(false);
  const [thought, setThought] = useState('I only meant to place one.');
  const [soundOn, setSoundOn] = useState(true);
  const [posterUrl, setPosterUrl] = useState('');
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!posterOpen) {
      setPosterUrl('');
      return;
    }
    setPosterUrl(createPosterDataUrl(thought));
  }, [posterOpen, dots, thought]);

  function playDotSound(colorIndex: number, dotIndex: number) {
    if (!soundOn) return;

    const AudioContextClass = window.AudioContext;
    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === 'suspended') void context.resume();

    const now = context.currentTime;
    const baseNotes = [261.63, 329.63, 392];
    const frequency = baseNotes[colorIndex] * (1 + Math.min(dotIndex, 24) * 0.012);
    const oscillator = context.createOscillator();
    const overtone = context.createOscillator();
    const gain = context.createGain();
    const overtoneGain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(frequency * 2, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.025, now + 0.008);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    oscillator.connect(gain).connect(context.destination);
    overtone.connect(overtoneGain).connect(context.destination);
    oscillator.start(now);
    overtone.start(now);
    oscillator.stop(now + 0.25);
    overtone.stop(now + 0.16);
  }

  function addDot(event: React.PointerEvent<HTMLElement>) {
    if (stage !== 'draw' || posterOpen) return;
    const box = event.currentTarget.getBoundingClientRect();
    const id = Date.now() + dots.length;
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    const colorIndex = dots.length % colors.length;
    playDotSound(colorIndex, dots.length);
    setDots((all) => [...all, { id, x, y, nx: x / box.width, ny: y / box.height, size: 22 + (id % 48), color: colors[colorIndex] }]);
  }

  function createPosterDataUrl(selectedThought = thought) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#f7f2e9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    dots.forEach((dot, index) => {
      const x = dot.nx * canvas.width;
      const y = dot.ny * 1010;
      const radius = Math.max(12, dot.size * 1.35);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = dot.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      if (index % 3 === 0) {
        ctx.strokeStyle = '#11100d';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#11100d';
    ctx.font = '800 26px Arial';
    ctx.fillText('SALON FORMAT / EXPERIMENT 01', 70, 70);
    ctx.font = 'italic 126px Georgia';
    ctx.fillStyle = '#1747d1';
    ctx.fillText('INTO THE', 68, 1040);
    ctx.font = '112px Georgia';
    ctx.fillStyle = '#ed1c24';
    ctx.fillText('INFINITE', 68, 1145);
    ctx.fillStyle = '#11100d';
    ctx.font = '30px Georgia';
    wrapText(ctx, `“${selectedThought}”`, 70, 1215, 840, 39);
    ctx.font = '700 22px Arial';
    ctx.fillText(`${dots.length} DOTS · MY INFINITY STUDY`, 70, 1310);
    ctx.font = '18px Arial';
    ctx.fillText('INDEPENDENT CONCEPT PROJECT · 2026', 650, 1310);

    return canvas.toDataURL('image/png');
  }

  function confirmSave() {
    if (typeof navigator.vibrate === 'function') navigator.vibrate([35, 35, 75]);
    setSaveConfirmed(true);
    window.setTimeout(() => setSaveConfirmed(false), 2600);
  }

  async function downloadPoster() {
    if (!posterUrl) return;

    const blob = await fetch(posterUrl).then((response) => response.blob());

    const filename = 'my-infinity-study-salon-format.png';
    const file = new File([blob], filename, { type: 'image/png' });
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const canShareFile = typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare({ files: [file] }));

    if (isMobile && canShareFile) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Infinity Study',
          text: 'My personal dot study from the Salon Format experience.',
        });
        confirmSave();
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
    confirmSave();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    words.forEach((word) => {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = `${word} `;
        y += lineHeight;
      } else line = test;
    });
    ctx.fillText(line, x, y);
  }

  return (
    <main className={`experience ${stage === 'draw' ? 'drawing' : ''}`} onPointerDown={addDot}>
      <div className="grain" aria-hidden="true" />
      {stage === 'intro' && <><span className="seed seed-b" /><span className="seed seed-c" /></>}
      {stage === 'draw' && dots.map((dot) => <span className="made-dot" aria-hidden="true" key={dot.id} style={{ left: dot.x, top: dot.y, width: dot.size, height: dot.size, background: dot.color }} />)}

      <header>
        <a className="salon" href="#" aria-label="Salon Format" onPointerDown={(e) => e.stopPropagation()}><img src="./sf-mark.png" alt="" /></a>
        <p>{stage === 'intro' ? <>EXPERIMENT 01<br />REPETITION</> : <>MY INFINITY STUDY<br />{String(dots.length).padStart(2, '0')} DOTS</>}</p>
        <div className="header-actions" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" aria-label={soundOn ? 'Sound ausschalten' : 'Sound einschalten'} aria-pressed={soundOn} onClick={() => setSoundOn((value) => !value)}>SOUND&nbsp;&nbsp;{soundOn ? '●' : '○'}</button>
          {stage === 'draw' && <button type="button" onClick={() => setDots([])}>CLEAR&nbsp;&nbsp;×</button>}
        </div>
      </header>

      {stage === 'intro' ? <section className="hero" aria-labelledby="title">
        <div className="copy">
          <p className="eyebrow">AN INDEPENDENT EDUCATIONAL STUDY OF REPETITION, SCALE AND INFINITY — IN TRIBUTE TO YAYOI KUSAMA</p>
          <h1 id="title"><span>INTO</span><span>THE</span><span>INFINITE</span></h1>
          <p className="intro">Make your own field of dots. At the end, choose a line and download the whole thing as your poster.</p>
          <button className="enter" type="button" onPointerDown={(e) => { e.stopPropagation(); setStage('draw'); }}>START <b>↘</b></button>
          <p className="project-note">Independent educational concept project by SALON FORMAT. Created as a tribute to Yayoi Kusama and an exploration of repetition, scale and infinity. This project is not affiliated with or commissioned by Yayoi Kusama Inc., the Yayoi Kusama Foundation or the Yayoi Kusama Museum.</p>
        </div>

        <figure className="abstract-field" aria-label="Abstrakte Komposition aus Papierflächen und Kreisen">
          <img src="./abstract-pastel-study.png" alt="Abstrakte Komposition aus pastellkreidigen Papierflächen und Kreisen" />
          <figcaption><strong>YAYOI KUSAMA</strong><span>1929—2026</span><small>MATSUMOTO → NEW YORK → TOKYO</small></figcaption>
        </figure>
      </section> : <section className="drawing-field" aria-label="Persönliche Zeichenfläche">
        {dots.length === 0 && <div className="drawing-instruction"><span>01</span><p>Your turn.</p><small>Tap the blank space. Add as many dots as you like.</small></div>}
        {dots.length > 0 && dots.length < 5 && <p className="drawing-whisper">Enough to feel like a pattern yet?</p>}
        {dots.length >= 5 && <button className="finish" type="button" onPointerDown={(e) => { e.stopPropagation(); setPosterOpen(true); }}>FINISH MY STUDY <b>↗</b></button>}
      </section>}

      <footer>
        <p>{stage === 'intro' ? 'MAKE A FIELD OF DOTS. KEEP IT AS A POSTER.' : 'TAP THE FIELD TO LET THE PATTERN GROW.'}</p>
        <p>{stage === 'intro' ? '1929—2026' : `${String(dots.length).padStart(2, '0')} DOTS`}</p>
        <p>{stage === 'intro' ? 'AN INDEPENDENT EDUCATIONAL CONCEPT PROJECT' : 'EACH TAP ADDS TO THE PATTERN.'}</p>
      </footer>
      {posterOpen && (
        <section className="poster-panel" aria-modal="true" role="dialog" aria-labelledby="poster-title" onPointerDown={(e) => e.stopPropagation()}>
          <button className="close" type="button" aria-label="Poster schließen" onClick={() => setPosterOpen(false)}>×</button>
          <div className="poster-preview">
            {posterUrl && <img src={posterUrl} alt="Vorschau des persönlichen Infinity-Study-Posters" />}
          </div>
          <div className="poster-copy">
            <p className="step">YOUR PATTERN / YOUR THOUGHT</p>
            <h2 id="poster-title">Keep a trace<br />of what changed.</h2>
            <p>Pick the line that fits. It will appear on your poster.</p>
            <div className="thoughts">
              {[
                'I got bored and wanted it to end.',
                'I only meant to place one.',
                'I could have kept going forever.',
              ].map((option) => <button className={thought === option ? 'selected' : ''} key={option} type="button" onClick={() => { setThought(option); setPosterUrl(createPosterDataUrl(option)); setSaveConfirmed(false); }}>{option}</button>)}
            </div>
            <button className={`download ${saveConfirmed ? 'confirmed' : ''}`} type="button" disabled={!posterUrl} onClick={downloadPoster}>{saveConfirmed ? 'SAVED / SHARED ✓' : 'SAVE / SHARE MY INFINITY STUDY ↓'}</button>
            <small>PNG · on mobile, choose “Save Image” in the share menu</small>
          </div>
        </section>
      )}
    </main>
  );
}
