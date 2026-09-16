import { AbsoluteFill, Sequence } from "remotion";
import { Bg } from "./components/Bg";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";
import { S6 } from "./scenes/S6";
import { S7 } from "./scenes/S7";

const D = [165, 372, 444, 351, 252, 174, 285];
const S = D.reduce<number[]>((a, d, i) => [...a, i === 0 ? 0 : a[i - 1] + D[i - 1]], []);
export const TOTAL = D.reduce((a, b) => a + b, 0);
const scenes = [S1, S2, S3, S4, S5, S6, S7];

export const MainVideo: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    {scenes.map((Comp, i) => (
      <Sequence key={i} from={S[i]} durationInFrames={D[i]}>
        <Comp dur={D[i]} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
