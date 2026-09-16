import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, body, display } from "../theme";
import { Fade, Eyebrow, Title, Sub, useRise } from "../components/Kit";

const Cell: React.FC<{ i: number; bad: boolean }> = ({ i, bad }) => {
  const f = useCurrentFrame();
  const app = interpolate(f, [40 + i * 2.2, 58 + i * 2.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = bad ? 0.5 + 0.5 * Math.sin((f - 90) / 7) : 0;
  return (
    <div style={{ height: 30, borderRadius: 5, opacity: app,
      background: bad ? `rgba(245,120,110,${0.22 + flash * 0.3})` : "rgba(255,255,255,0.07)",
      border: bad ? "1px solid rgba(245,120,110,0.7)" : "1px solid rgba(255,255,255,0.06)" }} />
  );
};

export const S2: React.FC<{ dur: number }> = ({ dur }) => {
  const grid = useRise(34, 30);
  const bads = new Set([7, 13, 22, 29, 34, 41, 48, 55, 61]);
  return (
    <Fade dur={dur}>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 130px", gap: 90 }}>
        <div style={{ flex: 1 }}>
          <Eyebrow text="The problem" />
          <Title size={72}>Carbon data still<br />lives in spreadsheets</Title>
          <Sub width={620}>Broken formulas. Missing activity data. Out-of-date emission factors. Audit season becomes a scramble.</Sub>
          <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap" }}>
            {["Version chaos", "Stale factors", "No audit trail"].map((t, i) => {
              const st = useRise(70 + i * 10, 20);
              return (
                <span key={t} style={{ ...st, fontFamily: body, fontSize: 19, color: "#F5978C", border: "1px solid rgba(245,151,140,0.4)", background: "rgba(245,151,140,0.08)", padding: "9px 18px", borderRadius: 999 }}>{t}</span>
              );
            })}
          </div>
        </div>
        <div style={{ ...grid, width: 660 }}>
          <div style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: 22 }}>
            <div style={{ fontFamily: display, fontSize: 17, color: C.muted, marginBottom: 16, letterSpacing: 2 }}>FY24_emissions_v7_FINAL(2).xlsx</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {Array.from({ length: 70 }).map((_, i) => <Cell key={i} i={i} bad={bads.has(i)} />)}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Fade>
  );
};
