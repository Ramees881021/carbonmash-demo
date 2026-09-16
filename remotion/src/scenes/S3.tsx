import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from "remotion";
import { C, body, display } from "../theme";
import { Fade, Eyebrow, Title, useRise } from "../components/Kit";

const Scope: React.FC<{ n: string; label: string; items: string[]; delay: number; accent: string }> = ({ n, label, items, delay, accent }) => {
  const st = useRise(delay, 26);
  return (
    <div style={{ ...st, flex: 1, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, padding: 26 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: display, fontSize: 46, fontWeight: 700, color: accent }}>{n}</span>
        <span style={{ fontFamily: body, fontSize: 20, color: C.cream, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((t, i) => {
          const s = useRise(delay + 14 + i * 6, 18);
          return <div key={t} style={{ ...s, fontFamily: body, fontSize: 19, color: C.muted, display: "flex", gap: 10 }}><span style={{ color: accent }}>—</span>{t}</div>;
        })}
      </div>
    </div>
  );
};

export const S3: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const row = useRise(190, 26);
  const fill = interpolate(f, [230, 275], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const res = interpolate(f, [280, 310], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const val = Math.round(interpolate(res, [0, 1], [0, 18420]));
  return (
    <Fade dur={dur}>
      <AbsoluteFill style={{ padding: "90px 120px", justifyContent: "center" }}>
        <Eyebrow text="One workspace" />
        <Title size={66}>Scope 1, 2 and 3 — factors applied automatically</Title>
        <div style={{ display: "flex", gap: 22, marginTop: 48 }}>
          <Scope n="01" label="Direct" items={["Stationary combustion", "Mobile fleet", "Refrigerants"]} delay={40} accent={C.mint} />
          <Scope n="02" label="Energy" items={["Purchased electricity", "Location & market", "Grid intensity"]} delay={62} accent="#5FD0FF" />
          <Scope n="03" label="Value chain" items={["Purchased goods", "Business travel", "Commuting & waste"]} delay={84} accent={C.amber} />
        </div>
        <div style={{ ...row, marginTop: 40, display: "flex", alignItems: "center", gap: 20, background: "rgba(63,224,143,0.07)", border: `1px solid ${C.mint}44`, borderRadius: 18, padding: "22px 28px" }}>
          <span style={{ fontFamily: body, fontSize: 21, color: C.cream }}>Diesel · 12,400 litres</span>
          <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.1)", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: `${fill * 100}%`, background: C.mint }} />
          </div>
          <span style={{ fontFamily: body, fontSize: 19, color: C.muted, opacity: fill }}>DEFRA 2025 · 2.6868 kgCO2e/L</span>
          <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.1)", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: `${res * 100}%`, background: C.mint }} />
          </div>
          <span style={{ fontFamily: display, fontSize: 30, fontWeight: 700, color: C.mint, opacity: res, minWidth: 240, textAlign: "right" }}>
            {val.toLocaleString()} kgCO2e
          </span>
        </div>
      </AbsoluteFill>
    </Fade>
  );
};
