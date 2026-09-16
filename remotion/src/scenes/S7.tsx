import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { C, body, display } from "../theme";
import { Fade, useRise } from "../components/Kit";

export const S7: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const t = useRise(10, 30);
  const s = useRise(40, 26);
  const l = useRise(70, 26);
  const glow = 0.5 + 0.5 * Math.sin(f / 24);
  return (
    <Fade dur={dur}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...t, textAlign: "center" }}>
          <h1 style={{ fontFamily: display, fontWeight: 700, fontSize: 96, color: C.cream, margin: 0, letterSpacing: -3 }}>
            Enterprise-grade.<br /><span style={{ color: C.mint, textShadow: `0 0 ${30 + glow * 40}px ${C.mint}66` }}>Most cost-effective.</span>
          </h1>
        </div>
        <p style={{ ...s, fontFamily: body, fontSize: 28, color: C.muted, marginTop: 34, maxWidth: 900, textAlign: "center" }}>
          Full-scope carbon accounting, audit-ready evidence and benchmarking — in one platform.
        </p>
        <div style={{ ...l, marginTop: 62, background: "rgba(255,255,255,0.95)", padding: "16px 30px", borderRadius: 14 }}>
          <Img src={staticFile("images/carbonmash-logo.webp")} style={{ height: 62, display: "block" }} />
        </div>
        <p style={{ ...l, fontFamily: body, fontSize: 21, letterSpacing: 6, color: C.mint, marginTop: 26, textTransform: "uppercase" }}>Net-Z Platform</p>
      </AbsoluteFill>
    </Fade>
  );
};
