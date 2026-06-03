import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Manrope";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["700", "800"], subsets: ["latin"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;

const NAVY = "#0B1220";
const NAVY_2 = "#111A2E";
const AMBER = "#F5A524";
const AMBER_2 = "#FFC04D";
const GREEN = "#19C37D";
const TEXT = "#F4F6FB";
const MUTED = "#8A93A6";

// ---------- Persistent background ----------
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 80) * 30;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(80% 60% at 50% 0%, ${NAVY_2} 0%, ${NAVY} 70%)` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          left: -200 + drift,
          top: -200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${AMBER}33, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          right: -250 - drift,
          bottom: -250,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GREEN}22, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Phone frame ----------
const Phone: React.FC<{ children: React.ReactNode; floatDelay?: number }> = ({ children, floatDelay = 0 }) => {
  const frame = useCurrentFrame();
  const float = Math.sin((frame + floatDelay) / 40) * 8;
  return (
    <div
      style={{
        width: 620,
        height: 1270,
        borderRadius: 70,
        background: "linear-gradient(180deg,#1a2238,#0d1424)",
        padding: 18,
        boxShadow: "0 60px 120px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.04) inset",
        transform: `translateY(${float}px)`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 54,
          background: NAVY,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 180,
            height: 32,
            borderRadius: 20,
            background: "#000",
            zIndex: 20,
          }}
        />
        {children}
      </div>
    </div>
  );
};

// ---------- Cursor ----------
const Cursor: React.FC<{ from: [number, number]; to: [number, number]; start: number; tapAt: number }> = ({
  from,
  to,
  start,
  tapAt,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = p * p * (3 - 2 * p);
  const x = from[0] + (to[0] - from[0]) * eased;
  const y = from[1] + (to[1] - from[1]) * eased;
  const tap = frame >= tapAt && frame <= tapAt + 20;
  const ringScale = interpolate(frame, [tapAt, tapAt + 20], [0.5, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringOp = interpolate(frame, [tapAt, tapAt + 20], [0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {tap && (
        <div
          style={{
            position: "absolute",
            left: to[0] - 40,
            top: to[1] - 40,
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: `4px solid ${AMBER}`,
            transform: `scale(${ringScale})`,
            opacity: ringOp,
            zIndex: 30,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: x - 18,
          top: y - 18,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
          border: "2px solid rgba(0,0,0,0.15)",
          zIndex: 30,
        }}
      />
    </>
  );
};

// ---------- Caption ----------
const Caption: React.FC<{ kicker: string; title: string }> = ({ kicker, title }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: op,
        transform: `translateY(${y}px)`,
        fontFamily: body,
        color: TEXT,
        zIndex: 5,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "6px 14px",
          borderRadius: 999,
          background: `${AMBER}1F`,
          border: `1px solid ${AMBER}55`,
          color: AMBER,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: display,
          fontWeight: 800,
          fontSize: 56,
          lineHeight: 1.05,
          padding: "0 60px",
        }}
      >
        {title}
      </div>
    </div>
  );
};

// =========================================================
// Scene 1 — Intro
// =========================================================
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const titleOp = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: TEXT, fontFamily: body }}>
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: 60,
          background: `linear-gradient(135deg, ${AMBER}, ${AMBER_2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 30px 80px ${AMBER}55`,
          transform: `scale(${s})`,
        }}
      >
        <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="#0B1220" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 22h12V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v18Z" />
          <path d="M15 9h2a3 3 0 0 1 3 3v6a2 2 0 0 1-4 0v-3" />
          <path d="M6 6h6v5H6z" />
        </svg>
      </div>
      <div
        style={{
          marginTop: 50,
          fontFamily: display,
          fontWeight: 800,
          fontSize: 110,
          letterSpacing: -2,
          opacity: titleOp,
        }}
      >
        TankFinder
      </div>
      <div style={{ marginTop: 16, fontSize: 30, color: MUTED, opacity: subOp, letterSpacing: 1 }}>
        Live-Spritpreise in Deutschland
      </div>
      <div
        style={{
          marginTop: 40,
          padding: "10px 22px",
          borderRadius: 999,
          background: `${GREEN}1F`,
          border: `1px solid ${GREEN}55`,
          color: GREEN,
          fontSize: 24,
          fontWeight: 600,
          opacity: subOp,
        }}
      >
        So funktioniert's
      </div>
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 2 — Onboarding (GPS button)
// =========================================================
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Caption kicker="Schritt 1" title="Standort wählen" />
      <Phone>
        <div style={{ position: "absolute", inset: 0, padding: "90px 36px 36px", fontFamily: body, color: TEXT }}>
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div
              style={{
                margin: "0 auto",
                width: 140,
                height: 140,
                borderRadius: 40,
                background: `linear-gradient(135deg, ${AMBER}, ${AMBER_2})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 20px 50px ${AMBER}55`,
              }}
            >
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#0B1220" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 22s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z" />
              </svg>
            </div>
            <div style={{ marginTop: 30, fontFamily: display, fontSize: 44, fontWeight: 800 }}>Willkommen!</div>
            <div style={{ marginTop: 10, fontSize: 22, color: MUTED, lineHeight: 1.4 }}>
              Wähle deinen Standort, um<br /> günstige Tankstellen zu finden.
            </div>
          </div>

          {/* GPS button */}
          <div
            id="gps-btn"
            style={{
              marginTop: 70,
              padding: "26px 24px",
              borderRadius: 28,
              background: `linear-gradient(135deg, ${AMBER}, ${AMBER_2})`,
              color: "#0B1220",
              fontWeight: 700,
              fontSize: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              boxShadow: `0 14px 40px ${AMBER}55`,
              transform: frame >= 95 && frame < 110 ? "scale(0.96)" : "scale(1)",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0B1220" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            Standort verwenden
          </div>

          <div
            style={{
              marginTop: 18,
              padding: "22px 24px",
              borderRadius: 28,
              border: "1.5px solid rgba(255,255,255,0.12)",
              color: TEXT,
              fontSize: 24,
              textAlign: "center",
            }}
          >
            Stadt wählen
          </div>
        </div>
        <Cursor from={[700, 1100]} to={[310, 880]} start={50} tapAt={95} />
      </Phone>
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 3 — Region picker
// =========================================================
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const lands = ["Bayern", "Berlin", "Hamburg", "Hessen", "Sachsen", "NRW"];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Caption kicker="Alternative" title="Oder Bundesland wählen" />
      <Phone floatDelay={20}>
        <div style={{ position: "absolute", inset: 0, padding: "90px 30px 30px", fontFamily: body, color: TEXT }}>
          <div style={{ fontFamily: display, fontSize: 38, fontWeight: 800, marginTop: 20 }}>Bundesländer</div>
          <div style={{ fontSize: 20, color: MUTED, marginTop: 6 }}>Wähle ein Bundesland und eine Stadt.</div>

          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {lands.map((l, i) => {
              const op = interpolate(frame, [10 + i * 5, 30 + i * 5], [0, 1], { extrapolateRight: "clamp" });
              const y = interpolate(frame, [10 + i * 5, 30 + i * 5], [20, 0], { extrapolateRight: "clamp" });
              const highlight = i === 0 && frame >= 70;
              return (
                <div
                  key={l}
                  style={{
                    padding: "26px 18px",
                    borderRadius: 20,
                    background: highlight ? `${AMBER}22` : "rgba(255,255,255,0.04)",
                    border: highlight ? `1.5px solid ${AMBER}` : "1.5px solid rgba(255,255,255,0.08)",
                    fontSize: 24,
                    fontWeight: 600,
                    opacity: op,
                    transform: `translateY(${y}px)`,
                    color: highlight ? AMBER : TEXT,
                  }}
                >
                  {l}
                </div>
              );
            })}
          </div>
        </div>
        <Cursor from={[700, 200]} to={[200, 540]} start={40} tapAt={70} />
      </Phone>
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 4 — Station list sorted by price
// =========================================================
const stations = [
  { brand: "JET", name: "JET München Mitte", price: "1,679", dist: "0,8", color: "#EC4899" },
  { brand: "Shell", name: "Shell Tankstelle", price: "1,719", dist: "1,4", color: "#FACC15" },
  { brand: "Aral", name: "Aral Maximilianstr.", price: "1,749", dist: "2,1", color: "#3B82F6" },
  { brand: "TOTAL", name: "TOTAL Energies", price: "1,789", dist: "2,8", color: "#F97316" },
];

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Caption kicker="Schritt 2" title="Günstigste zuerst" />
      <Phone>
        <div style={{ position: "absolute", inset: 0, padding: "90px 24px 30px", fontFamily: body, color: TEXT }}>
          <div
            style={{
              marginTop: 10,
              padding: "12px 18px",
              borderRadius: 999,
              background: `${GREEN}1A`,
              border: `1px solid ${GREEN}55`,
              color: GREEN,
              fontSize: 18,
              fontWeight: 700,
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            ↓ Bester Preis: 1,679 €
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            {stations.map((s, i) => {
              const op = interpolate(frame, [15 + i * 8, 35 + i * 8], [0, 1], { extrapolateRight: "clamp" });
              const y = interpolate(frame, [15 + i * 8, 35 + i * 8], [30, 0], { extrapolateRight: "clamp" });
              const isBest = i === 0;
              return (
                <div
                  key={s.name}
                  style={{
                    padding: 18,
                    borderRadius: 22,
                    background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    border: isBest ? `1.5px solid ${AMBER}` : "1.5px solid rgba(255,255,255,0.08)",
                    opacity: op,
                    transform: `translateY(${y}px)`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {isBest && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 12,
                        background: AMBER,
                        color: "#0B1220",
                        fontSize: 14,
                        fontWeight: 800,
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}
                    >
                      #1
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        background: `${s.color}25`,
                        color: s.color,
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      {s.brand}
                    </div>
                    <div style={{ fontSize: 12, color: GREEN }}>● Geöffnet</div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{s.name}</div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>E5</div>
                      <div style={{ fontFamily: display, fontSize: 32, fontWeight: 800, color: isBest ? AMBER : TEXT }}>
                        {s.price} €
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: `${AMBER}22`,
                        color: AMBER,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {s.dist} km
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 5 — Tap "Route starten" → Maps
// =========================================================
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const mapOp = interpolate(frame, [110, 140], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Caption kicker="Schritt 3" title="Route in Maps öffnen" />
      <Phone>
        <div style={{ position: "absolute", inset: 0, padding: "90px 24px 30px", fontFamily: body, color: TEXT }}>
          <div
            style={{
              marginTop: 80,
              padding: 22,
              borderRadius: 26,
              background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: `1.5px solid ${AMBER}`,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 12, right: 14, background: AMBER, color: "#0B1220", padding: "3px 12px", borderRadius: 999, fontSize: 14, fontWeight: 800 }}>
              #1 BESTPREIS
            </div>
            <div style={{ padding: "4px 10px", display: "inline-block", borderRadius: 8, background: "#EC489925", color: "#EC4899", fontSize: 14, fontWeight: 800 }}>JET</div>
            <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700 }}>JET München Mitte</div>
            <div style={{ marginTop: 6, fontSize: 16, color: MUTED }}>Schillerstraße 12, 80336 München</div>

            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { l: "E5", v: "1,679", best: true },
                { l: "E10", v: "1,629", best: false },
                { l: "Diesel", v: "1,589", best: false },
              ].map((f) => (
                <div
                  key={f.l}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: f.best ? `1.5px solid ${AMBER}` : "1px solid rgba(255,255,255,0.1)",
                    background: f.best ? `${AMBER}15` : "rgba(255,255,255,0.03)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 12, color: MUTED, letterSpacing: 1 }}>{f.l}</div>
                  <div style={{ fontFamily: display, fontWeight: 800, fontSize: 22, color: f.best ? AMBER : TEXT }}>
                    {f.v}
                  </div>
                </div>
              ))}
            </div>

            {/* Route starten button */}
            <div
              style={{
                marginTop: 22,
                padding: "22px 18px",
                borderRadius: 18,
                background: `linear-gradient(135deg, ${AMBER}, ${AMBER_2})`,
                color: "#0B1220",
                fontWeight: 800,
                fontSize: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                boxShadow: frame >= 95 ? `0 0 0 8px ${AMBER}33` : `0 10px 30px ${AMBER}55`,
                transform: frame >= 95 && frame < 110 ? "scale(0.96)" : "scale(1)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0B1220" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Route starten
            </div>
          </div>

          {/* Maps overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: mapOp,
              background: "linear-gradient(180deg, #1a2a1f, #0e1a14)",
              borderRadius: 54,
              overflow: "hidden",
            }}
          >
            {/* mock map */}
            <svg width="100%" height="100%" viewBox="0 0 400 800" style={{ position: "absolute", inset: 0 }}>
              <rect width="400" height="800" fill="#1a2a1f" />
              <g stroke="#2d4a37" strokeWidth="2" fill="none">
                <path d="M0 200 L400 250" />
                <path d="M0 400 L400 380" />
                <path d="M0 600 L400 620" />
                <path d="M100 0 L120 800" />
                <path d="M280 0 L260 800" />
              </g>
              <path d="M80 700 Q180 500 220 380 T340 120" stroke={AMBER} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="0 0" />
              <circle cx="80" cy="700" r="14" fill="#3B82F6" stroke="#fff" strokeWidth="3" />
              <circle cx="340" cy="120" r="16" fill={AMBER} stroke="#fff" strokeWidth="3" />
            </svg>
            <div
              style={{
                position: "absolute",
                top: 70,
                left: 20,
                right: 20,
                padding: "16px 18px",
                borderRadius: 18,
                background: "rgba(11,18,32,0.85)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: TEXT,
                fontFamily: body,
                backdropFilter: "blur(6px)",
              }}
            >
              <div style={{ fontSize: 14, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>Route zu</div>
              <div style={{ fontFamily: display, fontSize: 22, fontWeight: 800 }}>JET München Mitte</div>
              <div style={{ marginTop: 6, fontSize: 16, color: GREEN, fontWeight: 600 }}>● 6 Min · 2,1 km</div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 30,
                left: 20,
                right: 20,
                padding: "18px",
                borderRadius: 18,
                background: AMBER,
                color: "#0B1220",
                fontFamily: display,
                fontWeight: 800,
                fontSize: 24,
                textAlign: "center",
              }}
            >
              Navigation starten
            </div>
          </div>
        </div>
        <Cursor from={[400, 1100]} to={[310, 940]} start={50} tapAt={95} />
      </Phone>
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 6 — Outro
// =========================================================
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  const op = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: TEXT, fontFamily: body }}>
      <div
        style={{
          fontFamily: display,
          fontWeight: 800,
          fontSize: 110,
          textAlign: "center",
          lineHeight: 1,
          transform: `scale(${s})`,
        }}
      >
        Spare bei<br />
        <span style={{ color: AMBER }}>jedem Tankstopp.</span>
      </div>
      <div style={{ marginTop: 40, fontSize: 32, color: MUTED, opacity: op, textAlign: "center" }}>
        Jetzt TankFinder nutzen.
      </div>
      <div
        style={{
          marginTop: 80,
          opacity: op,
          padding: "12px 22px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: 22,
          color: MUTED,
        }}
      >
        Erstellt von <span style={{ color: TEXT, fontWeight: 700 }}>DS Interactive</span>
      </div>
    </AbsoluteFill>
  );
};

// =========================================================
// Main
// =========================================================
export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      {/* 1800 frames total */}
      <Sequence from={0} durationInFrames={180}><Scene1 /></Sequence>
      <Sequence from={180} durationInFrames={300}><Scene2 /></Sequence>
      <Sequence from={480} durationInFrames={270}><Scene3 /></Sequence>
      <Sequence from={750} durationInFrames={360}><Scene4 /></Sequence>
      <Sequence from={1110} durationInFrames={420}><Scene5 /></Sequence>
      <Sequence from={1530} durationInFrames={270}><Scene6 /></Sequence>
    </AbsoluteFill>
  );
};
