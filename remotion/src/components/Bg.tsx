import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C } from "../theme";

export const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 220) * 60;
  const drift2 = Math.cos(f / 170) * 80;
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 800px at ${18 + drift / 12}% ${12 + drift2 / 30}%, ${C.navy2} 0%, transparent 60%), radial-gradient(900px 700px at 88% 90%, rgba(63,224,143,0.10) 0%, transparent 65%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          transform: `translate(${drift / 8}px, ${drift2 / 10}px)`,
          maskImage: "radial-gradient(80% 70% at 50% 45%, black, transparent)",
        }}
      />
      {[0, 1, 2].map((i) => {
        const y = interpolate((f + i * 400) % 1200, [0, 1200], [1150, -250]);
        return (
          <div key={i} style={{ position: "absolute", left: `${12 + i * 33}%`, top: y, width: 3, height: 190,
            background: `linear-gradient(180deg, transparent, ${C.mint}55, transparent)`, filter: "blur(1px)" }} />
        );
      })}
    </AbsoluteFill>
  );
};
