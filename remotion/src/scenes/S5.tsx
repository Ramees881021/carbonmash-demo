import { AbsoluteFill } from "remotion";
import { C, body, display } from "../theme";
import { Fade, Eyebrow, Title, useRise } from "../components/Kit";

const rows = [
  { u: "R. Raja", a: "UPDATE", e: "Scope 2 · Electricity", old: "1,240,000 kWh", nw: "1,318,500 kWh", t: "09:14" },
  { u: "S. Ahmed", a: "CREATE", e: "Scope 1 · Refrigerant R410a", old: "—", nw: "42 kg", t: "10:02" },
  { u: "L. Chen", a: "UPDATE", e: "Factor source", old: "DEFRA 2024", nw: "DEFRA 2025", t: "11:47" },
  { u: "R. Raja", a: "UPDATE", e: "Data quality", old: "Estimated", nw: "Site actual", t: "14:26" },
];
const col = (a: string) => (a === "CREATE" ? C.mint : a === "DELETE" ? "#F5978C" : "#5FD0FF");

export const S5: React.FC<{ dur: number }> = ({ dur }) => (
  <Fade dur={dur}>
    <AbsoluteFill style={{ padding: "90px 140px", justifyContent: "center" }}>
      <Eyebrow text="Audit trail" />
      <Title size={64}>Every number is defensible</Title>
      <div style={{ marginTop: 44, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 2fr 2.4fr 0.7fr", padding: "16px 26px", background: "rgba(255,255,255,0.05)", fontFamily: body, fontSize: 16, letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>
          <span>User</span><span>Action</span><span>Entry</span><span>Change</span><span>Time</span>
        </div>
        {rows.map((r, i) => {
          const st = useRise(34 + i * 16, 22);
          return (
            <div key={r.e} style={{ ...st, display: "grid", gridTemplateColumns: "1.1fr 1fr 2fr 2.4fr 0.7fr", alignItems: "center", padding: "22px 26px", borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: body, fontSize: 20, color: C.cream }}>
              <span>{r.u}</span>
              <span><span style={{ fontSize: 15, fontWeight: 600, color: col(r.a), border: `1px solid ${col(r.a)}55`, background: `${col(r.a)}14`, padding: "5px 12px", borderRadius: 999 }}>{r.a}</span></span>
              <span style={{ color: C.muted }}>{r.e}</span>
              <span><span style={{ color: "#F5978C", textDecoration: "line-through", opacity: 0.8 }}>{r.old}</span><span style={{ color: C.muted, margin: "0 12px" }}>→</span><span style={{ color: C.mint, fontWeight: 600 }}>{r.nw}</span></span>
              <span style={{ color: C.muted, fontFamily: display }}>{r.t}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  </Fade>
);
