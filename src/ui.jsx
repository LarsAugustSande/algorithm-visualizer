import { useEffect, useId, useState } from "react";

export function Page({ kicker, title, thm, lede, children }) {
  return (
    <article>
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      {thm ? <p className="thm">{thm}</p> : null}
      {lede ? <p className="lede">{lede}</p> : null}
      {children}
    </article>
  );
}

export function Choice({ value, options, onChange }) {
  return (
    <div className="choice">
      {options.map((o) => (
        <button key={o.id} type="button" className={value === o.id ? "on" : ""} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <p className="legend">
      {items.map((it) => (
        <span key={it.label}>
          <i style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </p>
  );
}

export function Player({ frames, resetKey, speed = 680, render }) {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    setI(0);
    setPlay(false);
  }, [resetKey]);

  useEffect(() => {
    if (!play) return undefined;
    if (i >= frames.length - 1) {
      setPlay(false);
      return undefined;
    }
    const t = setTimeout(() => setI((v) => Math.min(frames.length - 1, v + 1)), speed);
    return () => clearTimeout(t);
  }, [play, i, frames.length, speed]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlay(false);
        setI((v) => Math.min(frames.length - 1, v + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlay(false);
        setI((v) => Math.max(0, v - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [frames.length]);

  const idx = Math.min(i, Math.max(0, frames.length - 1));
  const frame = frames[idx];
  if (!frame) return null;

  return (
    <div>
      <div className="stage">{render(frame, idx)}</div>
      <p className="note">{frame.note}</p>
      <div className="controls">
        <button type="button" onClick={() => { setPlay(false); setI(0); }}>start</button>
        <button type="button" onClick={() => { setPlay(false); setI((v) => Math.max(0, v - 1)); }} disabled={idx === 0}>forrige</button>
        <button type="button" onClick={() => setPlay((p) => !p)}>{play ? "pause" : "spill"}</button>
        <button type="button" onClick={() => { setPlay(false); setI((v) => Math.min(frames.length - 1, v + 1)); }} disabled={idx === frames.length - 1}>neste</button>
        <span className="step">{idx + 1} / {frames.length}</span>
        <span className="hint">piltaster</span>
      </div>
    </div>
  );
}

function curve(x1, y1, x2, y2, bend) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const inset = 24;
  const sx = x1 + ux * inset + px * bend * 0.12;
  const sy = y1 + uy * inset + py * bend * 0.12;
  const ex = x2 - ux * (inset + 2) + px * bend * 0.12;
  const ey = y2 - uy * (inset + 2) + py * bend * 0.12;
  const cx = (x1 + x2) / 2 + px * bend;
  const cy = (y1 + y2) / 2 + py * bend;
  const lx = 0.25 * sx + 0.5 * cx + 0.25 * ex;
  const ly = 0.25 * sy + 0.5 * cy + 0.25 * ey;
  return {
    d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
    lx,
    ly,
  };
}

export function Graph({ width, height, nodes, edges, onNode }) {
  const uid = useId().replace(/:/g, "");
  const drawn = edges.map((e, i) => {
    const a = nodes.find((n) => n.id === e.u);
    const b = nodes.find((n) => n.id === e.v);
    if (!a || !b) return null;
    const rev = edges.some((o) => o.u === e.v && o.v === e.u);
    const bend = e.bend ?? (rev ? 30 : 0);
    return { ...e, i, ...curve(a.x, a.y, b.x, b.y, bend) };
  }).filter(Boolean);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="graph">
      <defs>
        {drawn.map((e) => (
          <marker key={e.i} id={`${uid}-${e.i}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={e.color || "#1c1916"} />
          </marker>
        ))}
      </defs>
      {drawn.map((e) => {
        const label = e.label || "";
        const lw = Math.max(16, label.length * 6.4 + 8);
        return (
          <g key={e.i} opacity={e.dim ? 0.35 : 1}>
            <path
              d={e.d}
              fill="none"
              stroke={e.color || "#1c1916"}
              strokeWidth={e.width || 1.6}
              strokeDasharray={e.dashed ? "5 4" : undefined}
              markerEnd={e.plain ? undefined : `url(#${uid}-${e.i})`}
            />
            {label ? (
              <g>
                <rect x={e.lx - lw / 2} y={e.ly - 8} width={lw} height={15} fill="#fbf7ef" />
                <text x={e.lx} y={e.ly + 3} textAnchor="middle" className="elabel" fill="#1c1916">{label}</text>
              </g>
            ) : null}
          </g>
        );
      })}
      {nodes.map((n) => (
        <g key={n.id} onClick={onNode ? () => onNode(n.id) : undefined} style={{ cursor: onNode ? "pointer" : "default" }}>
          {n.tag ? (
            <text x={n.x} y={n.y - (n.r || 20) - 8} textAnchor="middle" className="ntag" fill="#6f655b">{n.tag}</text>
          ) : null}
          <circle cx={n.x} cy={n.y} r={n.r || 20} fill={n.fill || "#fffdf8"} stroke={n.stroke || "#1c1916"} strokeWidth={n.sw || 1.6} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="nlabel" fill={n.ink || "#1c1916"}>{n.label ?? n.id}</text>
          {n.sub ? (
            <text x={n.x} y={n.y + (n.r || 20) + 14} textAnchor="middle" className="nsub" fill="#1c1916">{n.sub}</text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

export function Gantt({ t0, t1, rows, marks = [] }) {
  const w = 680;
  const rowH = 34;
  const left = 28;
  const top = 26;
  const h = top + Math.max(1, rows.length) * rowH + 18;
  const span = Math.max(1, t1 - t0);
  const X = (t) => left + ((t - t0) / span) * (w - left - 16);
  const ticks = [];
  for (let t = t0; t <= t1; t += 1) ticks.push(t);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="graph">
      {ticks.map((t) => (
        <text key={t} x={X(t)} y={14} textAnchor="middle" className="tick" fill="#6f655b">{t}</text>
      ))}
      <line x1={left} y1={top - 6} x2={w - 16} y2={top - 6} stroke="#1c1916" />
      {marks.map((m, i) => (
        <line key={i} x1={X(m.t)} y1={top - 4} x2={X(m.t)} y2={h - 8} stroke="#9d2c24" strokeDasharray="3 3" />
      ))}
      {rows.map((row, i) =>
        row.bars.map((b, k) => {
          const x = X(b.s);
          const width = Math.max(8, X(b.f) - X(b.s));
          const y = top + i * rowH + 6;
          return (
            <g key={`${i}-${k}`}>
              <rect x={x} y={y} width={width} height={22} fill={b.fill || "#fffdf8"} stroke="#1c1916" />
              <text x={x + width / 2} y={y + 15} textAnchor="middle" className="tick" fill={b.ink || "#1c1916"}>{b.text}</text>
            </g>
          );
        })
      )}
    </svg>
  );
}

export function finite(n) {
  return typeof n === "number" && Number.isFinite(n) ? String(n) : "";
}
