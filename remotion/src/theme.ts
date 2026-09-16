import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
export const display = loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;
export const body = loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;
export const C = {
  navy: "#0B1226",
  navy2: "#131C3A",
  ink: "#1B1464",
  mint: "#3FE08F",
  mintDim: "#1F7F53",
  cream: "#F3F0E7",
  muted: "#9AA6C4",
  amber: "#F5B54A",
};
export const ease = [0.16, 1, 0.3, 1] as const;
