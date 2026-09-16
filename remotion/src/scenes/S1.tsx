import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, display, body } from "../theme";
import { Fade } from "../components/Kit";

export const S1: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 34 });
  const line = interpolate(f, [22, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const t = spring({ frame: f - 26, fps, config: { damping: 200 }, durationInFrames: 30 });
  const tag = spring({ frame: f - 46, fps, config: { damping: 200 }, durationInFrames: 26 });
  return (
    <Fade dur={dur}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.94, 1])})`, background: "rgba(255,255,255,0.95)", padding: "18px 34px", borderRadius: 16 }}>
          <Img src={staticFile("images/carbonmash-logo.webp")} style={{ height: 78, display: "block" }} />
        </div>
        <div style={{ width: interpolate(line, [0, 1], [0, 560]), height: 1, background: `linear-gradient(90deg, transparent, ${C.mint}, transparent)`, margin: "44px 0 34px" }} />
        <h1 style={{ opacity: t, transform: `translateY(${interpolate(t, [0, 1], [30, 0])}px)`, fontFamily: display, fontWeight: 700, fontSize: 112, color: C.cream, margin: 0, letterSpacing: -3 }}>
          Net-Z <span style={{ color: C.mint }}>Platform</span>
        </h1>
        <p style={{ opacity: tag, fontFamily: body, fontSize: 26, letterSpacing: 9, color: C.muted, marginTop: 26, textTransform: "uppercase" }}>Carbon, tackled</p>
      </AbsoluteFill>
    </Fade>
  );
};
