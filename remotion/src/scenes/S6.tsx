import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, body, display } from "../theme";
import { Fade, Eyebrow, Title, useRise } from "../components/Kit";

const peers = [
  { n: "Peer A", v: 0.88 }, { n: "Peer B", v: 0.72 }, { n: "You", v: 0.46 }, { n: "Peer C", v: 0.63 }, { n: "Peer D", v: 0.95 },
];

export const S6: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const box = useRise(30, 26);
  return (
    <Fade dur={dur}>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 130px", gap: 80 }}>
        <div style={{ flex: 1 }}>
          <Eyebrow text="Benchmark & report" />
          <Title size={62}>Know where you<br />stand. Prove it.</Title>
          <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap" }}>
            {["Industry benchmarks", "Scorecard", "One-click export"].map((t, i) => {
              const st = useRise(50 + i * 10, 20);
              return <span key={t} style={{ ...st, fontFamily: body, fontSize: 19, color: C.mint, border: `1px solid ${C.mint}44`, background: `${C.mint}12`, padding: "9px 18px", borderRadius: 999 }}>{t}</span>;
            })}
          </div>
        </div>
        <div style={{ ...box, width: 720, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, padding: 30 }}>
          <div style={{ fontFamily: body, fontSize: 18, color: C.muted, marginBottom: 26 }}>Construction sector · tCO2e per £m revenue</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 26, height: 300 }}>
            {peers.map((p, i) => {
              const h = interpolate(f, [30 + i * 9, 76 + i * 9], [0, p.v], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const me = p.n === "You";
              return (
                <div key={p.n} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: h * 250, borderRadius: "10px 10px 0 0", background: me ? C.mint : "rgba(255,255,255,0.14)", boxShadow: me ? `0 0 40px ${C.mint}55` : "none" }} />
                  <div style={{ fontFamily: body, fontSize: 18, color: me ? C.mint : C.muted, marginTop: 14, fontWeight: me ? 700 : 400 }}>{p.n}</div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Fade>
  );
};
