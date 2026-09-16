import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, body, display } from "../theme";
import { Fade, Eyebrow, Title, useRise } from "../components/Kit";

const Kpi: React.FC<{ label: string; value: number; suffix: string; delay: number; decimals?: number }> = ({ label, value, suffix, delay, decimals = 0 }) => {
  const f = useCurrentFrame();
  const st = useRise(delay, 24);
  const p = interpolate(f, [delay + 6, delay + 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ ...st, flex: 1, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: "22px 24px" }}>
      <div style={{ fontFamily: body, fontSize: 17, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: display, fontSize: 46, fontWeight: 700, color: C.cream, marginTop: 8 }}>
        {(value * p).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        <span style={{ fontSize: 20, color: C.mint, marginLeft: 8 }}>{suffix}</span>
      </div>
    </div>
  );
};

export const S4: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const chart = useRise(96, 28);
  const bars = [
    { l: "Scope 1", v: 0.34, c: C.mint },
    { l: "Scope 2", v: 0.22, c: "#5FD0FF" },
    { l: "Scope 3", v: 0.92, c: C.amber },
  ];
  const path = interpolate(f, [140, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pts = Array.from({ length: 8 }).map((_, i) => ({ x: 50 + i * 81, req: 45 + i * 28, act: 50 + i * 31 - (i % 2) * 6 }));
  const shown = Math.max(2, Math.round(path * pts.length));
  const line = (k: "req" | "act") => pts.slice(0, shown).map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p[k]}`).join(" ");
  return (
    <Fade dur={dur}>
      <AbsoluteFill style={{ padding: "80px 120px", justifyContent: "center" }}>
        <Eyebrow text="Live dashboard" />
        <Title size={64}>From raw data to board-ready insight</Title>
        <div style={{ display: "flex", gap: 20, marginTop: 40 }}>
          <Kpi label="Total footprint" value={41862} suffix="tCO2e" delay={40} />
          <Kpi label="Per £m revenue" value={18.4} suffix="tCO2e" delay={54} decimals={1} />
          <Kpi label="Per employee" value={6.2} suffix="tCO2e" delay={68} decimals={1} />
          <Kpi label="vs base year" value={23} suffix="% ↓" delay={82} />
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 26 }}>
          <div style={{ ...chart, width: 500, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: 24 }}>
            <div style={{ fontFamily: body, fontSize: 18, color: C.muted, marginBottom: 20 }}>Emissions by scope</div>
            {bars.map((b, i) => {
              const w = interpolate(f, [110 + i * 12, 155 + i * 12], [0, b.v], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={b.l} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: body, fontSize: 16, color: C.cream, marginBottom: 7 }}>{b.l}</div>
                  <div style={{ height: 16, borderRadius: 8, background: "rgba(255,255,255,0.07)" }}>
                    <div style={{ height: 16, borderRadius: 8, width: `${(w / 1) * 100}%`, background: b.c }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ ...chart, flex: 1, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: body, fontSize: 18, color: C.muted }}>SBTi pathway adherence</span>
              <span style={{ fontFamily: body, fontSize: 17, color: C.mint, fontWeight: 600 }}>On track</span>
            </div>
            <svg width="100%" height={230} viewBox="0 0 660 280">
              {[0, 1, 2, 3].map((i) => <line key={i} x1={40} x2={620} y1={60 + i * 60} y2={60 + i * 60} stroke="rgba(255,255,255,0.07)" />)}
              <path d={line("req")} stroke={C.muted} strokeWidth={3} fill="none" strokeDasharray="8 8" />
              <path d={line("act")} stroke={C.mint} strokeWidth={5} fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </AbsoluteFill>
    </Fade>
  );
};
