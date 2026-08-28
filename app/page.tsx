'use client';

import { useState } from 'react';

const colors = ['#ed1c24', '#1747d1', '#ffd21f'];

export default function Home() {
  const [dots, setDots] = useState<Array<{ id: number; x: number; y: number; size: number; color: string }>>([]);
  const [started, setStarted] = useState(false);

  function addDot(event: React.PointerEvent<HTMLElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const id = Date.now() + dots.length;
    setStarted(true);
    setDots((all) => [...all, { id, x: event.clientX - box.left, y: event.clientY - box.top, size: 22 + (id % 48), color: colors[id % 3] }]);
  }

  return (
    <main className={`experience ${started ? 'started' : ''}`} onPointerDown={addDot}>
      <div className="grain" aria-hidden="true" />
      <span className="seed seed-a" /><span className="seed seed-b" /><span className="seed seed-c" />
      {dots.map((dot) => <span className="made-dot" aria-hidden="true" key={dot.id} style={{ left: dot.x, top: dot.y, width: dot.size, height: dot.size, background: dot.color }} />)}

      <header>
        <a className="salon" href="#" onPointerDown={(e) => e.stopPropagation()}>SALON<br />FORMAT</a>
        <p>EXPERIMENT 01<br />REPETITION</p>
        <button type="button" aria-label="Sound einschalten" onPointerDown={(e) => e.stopPropagation()}>SOUND&nbsp;&nbsp;○</button>
      </header>

      <section className="hero" aria-labelledby="title">
        <div className="copy">
          <p className="eyebrow">ONE DOT. THEN ANOTHER.</p>
          <h1 id="title"><span>INTO</span><span>THE</span><span>INFINITE</span></h1>
          <p className="intro">A small digital experiment about repetition, scale and the moment a pattern begins to exceed its surface.</p>
          <button className="enter" type="button" onPointerDown={(e) => { e.stopPropagation(); setStarted(true); }}>PLACE THE FIRST DOT <b>↘</b></button>
        </div>

        <figure className="portrait">
          <img src="/kusama-editorial-portrait.png" alt="Eigenständige abstrakte redaktionelle Porträtillustration" />
          <figcaption>YAYOI KUSAMA<br /><span>1929—2026</span></figcaption>
          <i>repetition<br />changes space</i>
        </figure>
      </section>

      <footer><p>CLICK ANYWHERE TO LET THE PATTERN GROW.</p><p>{String(dots.length).padStart(2, '0')} DOTS</p><p>AN INTERACTIVE CONCEPT PROTOTYPE</p></footer>
      {!started && <div className="first-dot"><span /></div>}
    </main>
  );
}
