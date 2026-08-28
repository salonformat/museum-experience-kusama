'use client';

import { useState } from 'react';

const colors = ['#ed1c24', '#1747d1', '#ffd21f'];

export default function Home() {
  const [dots, setDots] = useState<Array<{ id: number; x: number; y: number; nx: number; ny: number; size: number; color: string }>>([]);
  const [stage, setStage] = useState<'intro' | 'draw'>('intro');
  const [posterOpen, setPosterOpen] = useState(false);
  const [thought, setThought] = useState('I only meant to place one.');

  function addDot(event: React.PointerEvent<HTMLElement>) {
    if (stage !== 'draw' || posterOpen) return;
    const box = event.currentTarget.getBoundingClientRect();
    const id = Date.now() + dots.length;
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    setDots((all) => [...all, { id, x, y, nx: x / box.width, ny: y / box.height, size: 22 + (id % 48), color: colors[id % 3] }]);
  }

  function downloadPoster() {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    wrapText(ctx, `“${thought}”`, 70, 1215, 840, 39);
    ctx.font = '700 22px Arial';
    ctx.fillText(`${dots.length} DOTS · MY INFINITY STUDY`, 70, 1310);
    ctx.font = '18px Arial';
    ctx.fillText('Independent concept prototype · AI-assisted original illustration', 565, 1310);

    const link = document.createElement('a');
    link.download = 'my-infinity-study-salon-format.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
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
        <a className="salon" href="#" onPointerDown={(e) => e.stopPropagation()}>SALON<br />FORMAT</a>
        <p>{stage === 'intro' ? <>EXPERIMENT 01<br />REPETITION</> : <>MY INFINITY STUDY<br />{String(dots.length).padStart(2, '0')} DOTS</>}</p>
        {stage === 'intro' ? <button type="button" aria-label="Sound einschalten" onPointerDown={(e) => e.stopPropagation()}>SOUND&nbsp;&nbsp;○</button> : <button type="button" onPointerDown={(e) => { e.stopPropagation(); setDots([]); }}>CLEAR&nbsp;&nbsp;×</button>}
      </header>

      {stage === 'intro' ? <section className="hero" aria-labelledby="title">
        <div className="copy">
          <p className="eyebrow">A SMALL INTERACTIVE HOMAGE TO YAYOI KUSAMA</p>
          <h1 id="title"><span>INTO</span><span>THE</span><span>INFINITE</span></h1>
          <p className="intro">Make your own field of dots. At the end, choose a line and download the whole thing as your poster.</p>
          <button className="enter" type="button" onPointerDown={(e) => { e.stopPropagation(); setStage('draw'); }}>START <b>↘</b></button>
        </div>

        <figure className="portrait">
          <img src="/kusama-faceless-illustration.png" alt="Abstrakte gesichtslose Collage als Hommage an Yayoi Kusama" />
          <figcaption>YAYOI KUSAMA<br /><span>1929—2026</span></figcaption>
          <i>repetition<br />changes space</i>
        </figure>
      </section> : <section className="drawing-field" aria-label="Persönliche Zeichenfläche">
        {dots.length === 0 && <div className="drawing-instruction"><span>01</span><p>Start with a dot.<br />Then keep going.</p><small>Tap anywhere. Your dots become a poster.</small></div>}
        {dots.length > 0 && dots.length < 5 && <p className="drawing-whisper">Enough to feel like a pattern yet?</p>}
        {dots.length >= 5 && <button className="finish" type="button" onPointerDown={(e) => { e.stopPropagation(); setPosterOpen(true); }}>FINISH MY STUDY <b>↗</b></button>}
      </section>}

      <footer>
        <p>{stage === 'intro' ? 'MAKE A FIELD OF DOTS. KEEP IT AS A POSTER.' : 'TAP THE FIELD TO LET THE PATTERN GROW.'}</p>
        <p>{stage === 'intro' ? '1929—2026' : `${String(dots.length).padStart(2, '0')} DOTS`}</p>
        <p>{stage === 'intro' ? 'AN INDEPENDENT CONCEPT PROTOTYPE' : 'YOUR GESTURE BECOMES THE WORK'}</p>
      </footer>
      {posterOpen && (
        <section className="poster-panel" aria-modal="true" role="dialog" aria-labelledby="poster-title" onPointerDown={(e) => e.stopPropagation()}>
          <button className="close" type="button" aria-label="Poster schließen" onClick={() => setPosterOpen(false)}>×</button>
          <div className="poster-preview" aria-hidden="true">
            <div>{dots.map((dot) => <span key={dot.id} style={{ background: dot.color, width: `${Math.max(10, dot.size * .55)}px`, height: `${Math.max(10, dot.size * .55)}px`, left: `${dot.nx * 100}%`, top: `${dot.ny * 78}%` }} />)}</div>
            <b>INTO THE<br /><em>INFINITE</em></b>
            <small>{dots.length} DOTS · MY INFINITY STUDY</small>
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
              ].map((option) => <button className={thought === option ? 'selected' : ''} key={option} type="button" onClick={() => setThought(option)}>{option}</button>)}
            </div>
            <button className="download" type="button" onClick={downloadPoster}>DOWNLOAD MY INFINITY STUDY ↓</button>
            <small>PNG · made from the dots you placed · ready to keep or share</small>
          </div>
        </section>
      )}
    </main>
  );
}
