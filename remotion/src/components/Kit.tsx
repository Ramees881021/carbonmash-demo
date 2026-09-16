import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, display, body } from "../theme";

export const Fade: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 14, dur - 16, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const useRise = (delay: number, d = 22) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 200 }, durationInFrames: d });
  return { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px)` };
};

export const Eyebrow: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const st = useRise(delay);
  return (
    <div style={{ ...st, display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
      <div style={{ width: 44, height: 2, background: C.mint }} />
      <span style={{ fontFamily: body, fontSize: 20, letterSpacing: 4, color: C.mint, fontWeight: 600, textTransform: "uppercase" }}>{text}</span>
    </div>
  );
};

export const Title: React.FC<{ children: React.ReactNode; delay?: number; size?: number }> = ({ children, delay = 6, size = 84 }) => {
  const st = useRise(delay, 26);
  return <h1 style={{ ...st, fontFamily: display, fontWeight: 700, fontSize: size, lineHeight: 1.03, color: C.cream, margin: 0, letterSpacing: -2 }}>{children}</h1>;
};

export const Sub: React.FC<{ children: React.ReactNode; delay?: number; width?: number }> = ({ children, delay = 16, width = 720 }) => {
  const st = useRise(delay);
  return <p style={{ ...st, fontFamily: body, fontSize: 27, lineHeight: 1.5, color: C.muted, margin: "24px 0 0", maxWidth: width }}>{children}</p>;
};

export const Card: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const st = useRise(delay, 24);
  return (
    <div style={{ ...st, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, padding: 26, ...style }}>
      {children}
    </div>
  );
};
