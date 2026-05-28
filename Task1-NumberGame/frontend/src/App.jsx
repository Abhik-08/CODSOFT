import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./assets/number_game_logo.png";

// ─── DESIGN TOKENS ──────────────────────────────────────────────
const T = {
  cream:  "#FFFDF5",
  black:  "#000000",
  red:    "#FF6B6B",
  yellow: "#FFD93D",
  violet: "#C4B5FD",
  white:  "#FFFFFF",
};

// ─── HARD SHADOW HELPER ─────────────────────────────────────────
const shadow = (size = 8, color = T.black) =>
  `${size}px ${size}px 0px 0px ${color}`;

// ─── HALFTONE PATTERN ───────────────────────────────────────────
const halftone = {
  backgroundImage: "radial-gradient(#000 1.5px, transparent 1.5px)",
  backgroundSize: "20px 20px",
};

// ─── GRID PATTERN ───────────────────────────────────────────────
const gridPattern = {
  backgroundImage: `
    linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
  `,
  backgroundSize: "40px 40px",
};

// ─── ANIMATION VARIANTS ─────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const popUp = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", bounce: 0.55, duration: 0.6 },
  },
};

const slideIn = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1, x: 0,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

// ─── PANEL DATA ─────────────────────────────────────────────────
const PANELS = {
  rules: {
    title: "RULES",
    bg: T.yellow,
    items: [
      { heading: "OBJECTIVE", body: "Guess the secret number hidden between 1 and 100." },
      { heading: "ATTEMPTS",  body: "You get exactly 5 attempts per round. Use them wisely." },
      { heading: "HINTS",     body: "After each wrong guess you'll be told if the answer is higher or lower." },
      { heading: "GAME OVER", body: "If all 5 attempts are exhausted without a correct guess, the round ends." },
    ],
  },
  scoring: {
    title: "SCORING",
    bg: T.violet,
    items: [
      { heading: "CALCULATION",  body: "Score = Attempts Remaining × 20 at the moment of a correct guess." },
      { heading: "TOTAL SCORE",  body: "Points accumulate across all rounds in a session. Beat your personal best!" },
    ],
  },
};

// ─── SIDE PANEL ─────────────────────────────────────────────────
function Panel({ id, onClose }) {
  const data = PANELS[id];
  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex", justifyContent: "flex-end",
      }}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(460px, 100vw)",
          height: "100%",
          backgroundColor: data.bg,
          borderLeft: `4px solid ${T.black}`,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Panel header */}
        <div style={{
          padding: "20px 28px",
          borderBottom: `4px solid ${T.black}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: T.black,
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "20px", fontWeight: 900,
            letterSpacing: "0.15em", color: data.bg,
          }}>
            {data.title}
          </span>
          <motion.button
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.85 }}
            onClick={onClose}
            style={{
              background: data.bg, border: `3px solid ${data.bg}`,
              width: 40, height: 40, cursor: "pointer",
              fontWeight: 900, fontSize: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </motion.button>
        </div>

        {/* Panel items */}
        <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", gap: "28px" }}>
          {data.items.map((item, i) => (
            <motion.div
              key={item.heading}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.09, type: "spring" }}
              style={{
                backgroundColor: T.white,
                border: `4px solid ${T.black}`,
                boxShadow: shadow(6),
                padding: "20px 22px",
              }}
            >
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px", fontWeight: 900,
                letterSpacing: "0.25em",
                color: T.black, marginBottom: "8px", margin: "0 0 8px",
              }}>
                {item.heading}
              </p>
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "15px", fontWeight: 700,
                color: T.black, lineHeight: "1.6", margin: 0,
              }}>
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── STAT CARD ──────────────────────────────────────────────────
function StatCard({ label, value, accent, rotate = 0 }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: shadow(14) }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{
        backgroundColor: accent || T.white,
        border: `4px solid ${T.black}`,
        boxShadow: shadow(8),
        padding: "24px 28px",
        transform: `rotate(${rotate}deg)`,
        cursor: "default",
      }}
    >
      <p style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "11px", fontWeight: 900,
        letterSpacing: "0.25em",
        color: T.black, margin: "0 0 12px",
      }}>
        {label}
      </p>
      <motion.p
        key={String(value)}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(28px, 4vw, 42px)",
          fontWeight: 900, color: T.black,
          margin: 0, lineHeight: 1.1,
          wordBreak: "break-word",
        }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────
export default function App() {
  // ── All original state ──
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Awaiting your command...");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [correctNumber, setCorrectNumber] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  // ── All original logic ──
  useEffect(() => {
    fetch("https://codsoft-s5i9.onrender.com/game/restart", { credentials: "include" })
      .catch((e) => console.log("Initial reset failed:", e));
  }, []);

  const restartGame = async () => {
    try {
      await fetch("https://codsoft-s5i9.onrender.com/game/restart", { credentials: "include" });
    } catch (e) {
      console.log("Backend failed to restart, resetting frontend anyway.");
    }
    setAttemptsLeft(5);
    setMessage("System Initialized. Make your move.");
    setCorrectNumber(null);
    setGameFinished(false);
    setGuess("");
  };

  const checkGuess = async () => {
    if (!guess || gameFinished) return;
    const currentAttempts = attemptsLeft - 1;
    setAttemptsLeft(currentAttempts);
    try {
      const response = await fetch(
        `https://codsoft-s5i9.onrender.com/game/guess?guess=${guess}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setMessage(data.message || "No signal from base.");
      if (data.score !== undefined) setScore(data.score);
      const hasWon = data.won === true;
      if (hasWon || currentAttempts <= 0) {
        setGameFinished(true);
        if (data.correctNumber !== undefined) setCorrectNumber(data.correctNumber);
      }
      setGuess("");
    } catch (error) {
      console.log(error);
      setMessage("Backend Connection Interrupted.");
      if (currentAttempts <= 0) setGameFinished(true);
    }
  };

  // ── Attempt bar ──
  const attemptDots = [5, 4, 3, 2, 1];

  return (
    <>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body {
          margin: 0;
          background-color: ${T.cream};
          font-family: 'Space Grotesk', sans-serif;
        }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }

        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div style={{
        backgroundColor: T.cream,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        position: "relative",
      }}>
        {/* ── Side panels ── */}
        <AnimatePresence>
          {activePanel && <Panel id={activePanel} onClose={() => setActivePanel(null)} />}
        </AnimatePresence>

        {/* ══════════════ MARQUEE TICKER ══════════════ */}
        <div style={{
          backgroundColor: T.black, borderBottom: `4px solid ${T.black}`,
          overflow: "hidden", padding: "10px 0",
        }}>
          <div style={{
            display: "inline-flex", gap: "60px",
            animation: "marquee 18s linear infinite",
            whiteSpace: "nowrap",
          }}>
            {Array(8).fill("★ GUESS THE NUMBER ★ 5 ATTEMPTS ★ BEAT YOUR SCORE ★ ARE YOU READY").map((t, i) => (
              <span key={i} style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "13px", fontWeight: 900,
                letterSpacing: "0.25em", color: T.yellow,
                textTransform: "uppercase",
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* ══════════════ HEADER ══════════════ */}
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 220 }}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "18px 48px",
            borderBottom: `4px solid ${T.black}`,
            backgroundColor: T.cream,
            position: "sticky", top: 0, zIndex: 100,
          }}
        >
          {/* Logo block */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              border: `4px solid ${T.black}`,
              boxShadow: shadow(5),
              overflow: "hidden",
              width: 50, height: 50,
            }}>
              <motion.img
                src={logo}
                alt="NumGame Logo"
                animate={{ rotate: [0, 4, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div>
              <p style={{
                margin: 0, fontSize: "18px", fontWeight: 900,
                letterSpacing: "0.1em", color: T.black,
              }}>NUMGAME</p>
              <p style={{
                margin: 0, fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.25em", color: "#555",
              }}>1–100 CHALLENGE</p>
            </div>
          </div>

          {/* Nav buttons */}
          <nav style={{ display: "flex", gap: "12px" }}>
            {["rules", "scoring"].map((item) => (
              <motion.button
                key={item}
                onClick={() => setActivePanel(item)}
                whileHover={{
                  backgroundColor: T.black, color: T.cream,
                  boxShadow: shadow(4),
                }}
                whileTap={{ scale: 0.93 }}
                transition={{ duration: 0.1 }}
                style={{
                  background: "transparent",
                  border: `3px solid ${T.black}`,
                  padding: "8px 18px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "12px", fontWeight: 900,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  color: T.black,
                  transition: "background 0.1s, color 0.1s",
                }}
              >
                {item}
              </motion.button>
            ))}
          </nav>
        </motion.header>

        {/* ══════════════ HERO ══════════════ */}
        <section style={{
          padding: "60px 48px 0",
          position: "relative",
          overflow: "hidden",
          ...gridPattern,
        }}>
          {/* Giant watermark ? */}
          <div style={{
            position: "absolute", top: "-40px", right: "-20px",
            fontSize: "clamp(280px, 35vw, 480px)",
            fontWeight: 900, color: "transparent",
            WebkitTextStroke: `3px rgba(0,0,0,0.07)`,
            pointerEvents: "none", userSelect: "none",
            lineHeight: 1,
          }}>
            ?
          </div>

          <motion.div variants={stagger} initial="hidden" animate="show">
            {/* Label pill */}
            <motion.div variants={popUp} style={{ marginBottom: "24px" }}>
              <span style={{
                display: "inline-block",
                backgroundColor: T.red,
                border: `3px solid ${T.black}`,
                boxShadow: shadow(4),
                padding: "6px 16px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px", fontWeight: 900,
                letterSpacing: "0.3em", color: T.black,
                textTransform: "uppercase",
                transform: "rotate(-1deg)",
              }}>
                ★ SYSTEM ONLINE // 5 ATTEMPTS ★
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={popUp}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(72px, 13vw, 140px)",
                fontWeight: 900, margin: "0 0 8px",
                lineHeight: 0.88, color: T.black,
                letterSpacing: "-0.03em",
              }}
            >
              NUMBER
            </motion.h1>

            <motion.h1
              variants={popUp}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(72px, 13vw, 140px)",
                fontWeight: 900, margin: "0 0 40px",
                lineHeight: 0.88,
                color: "transparent",
                WebkitTextStroke: `5px ${T.black}`,
                letterSpacing: "-0.03em",
                display: "inline-block",
                transform: "rotate(1.5deg)",
              }}
            >
              GAME
            </motion.h1>

            {/* Attempt pips */}
            <motion.div
              variants={popUp}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "60px",
              }}
            >
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px", fontWeight: 900,
                letterSpacing: "0.3em", color: T.black,
              }}>LIVES</span>
              {attemptDots.map((pip) => (
                <motion.div
                  key={pip}
                  animate={attemptsLeft >= pip
                    ? { backgroundColor: T.red, scale: 1 }
                    : { backgroundColor: "#ddd", scale: 0.75 }
                  }
                  transition={{ duration: 0.2 }}
                  style={{
                    width: 22, height: 22,
                    border: `3px solid ${T.black}`,
                    boxShadow: shadow(3),
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════════ GAME SECTION ══════════════ */}
        <main style={{ flex: 1, padding: "0 48px 80px", position: "relative", zIndex: 1 }}>

          {/* ── Input + Buttons row ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "stretch",
              marginBottom: "56px",
            }}
          >
            {/* Number input */}
            <motion.div variants={slideIn} style={{ flex: "1 1 260px" }}>
              <p style={{
                margin: "0 0 6px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px", fontWeight: 900,
                letterSpacing: "0.3em", color: T.black,
              }}>
                YOUR GUESS (1–100)
              </p>
              <input
                type="number"
                placeholder="???"
                value={guess}
                disabled={gameFinished}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") checkGuess(); }}
                style={{
                  width: "100%",
                  height: "72px",
                  backgroundColor: T.white,
                  border: `4px solid ${T.black}`,
                  boxShadow: shadow(6),
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "36px", fontWeight: 900,
                  textAlign: "center", color: T.black,
                  outline: "none",
                  cursor: gameFinished ? "not-allowed" : "text",
                  opacity: gameFinished ? 0.45 : 1,
                  transition: "box-shadow 0.1s",
                }}
                onFocus={(e) => {
                  if (!gameFinished) {
                    e.target.style.backgroundColor = T.yellow;
                    e.target.style.boxShadow = shadow(8);
                  }
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = T.white;
                  e.target.style.boxShadow = shadow(6);
                }}
              />
            </motion.div>

            {/* Execute button */}
            <motion.div variants={slideIn} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <p style={{
                margin: "0 0 6px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px", fontWeight: 900,
                letterSpacing: "0.3em", color: "transparent",
              }}>
                &nbsp;
              </p>
              <motion.button
                whileHover={!gameFinished ? {
                  backgroundColor: T.black, color: T.yellow,
                  boxShadow: shadow(10),
                } : {}}
                whileTap={!gameFinished ? {
                  x: 4, y: 4, boxShadow: "0px 0px 0px 0px #000",
                } : {}}
                onClick={checkGuess}
                disabled={gameFinished}
                style={{
                  height: "72px",
                  padding: "0 36px",
                  backgroundColor: T.red,
                  border: `4px solid ${T.black}`,
                  boxShadow: shadow(6),
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "18px", fontWeight: 900,
                  letterSpacing: "0.15em",
                  color: T.black,
                  cursor: gameFinished ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  opacity: gameFinished ? 0.3 : 1,
                  transition: "background 0.1s, color 0.1s, box-shadow 0.1s",
                  whiteSpace: "nowrap",
                }}
              >
                EXECUTE →
              </motion.button>
            </motion.div>

            {/* Reboot button */}
            <AnimatePresence>
              {gameFinished && (
                <motion.div
                  variants={slideIn}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.7 }}
                  style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
                >
                  <p style={{
                    margin: "0 0 6px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "11px", fontWeight: 900,
                    letterSpacing: "0.3em", color: "transparent",
                  }}>
                    &nbsp;
                  </p>
                  <motion.button
                    whileHover={{
                      backgroundColor: T.black, color: T.yellow,
                      boxShadow: shadow(10),
                    }}
                    whileTap={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #000" }}
                    onClick={restartGame}
                    style={{
                      height: "72px",
                      padding: "0 36px",
                      backgroundColor: T.yellow,
                      border: `4px solid ${T.black}`,
                      boxShadow: shadow(6),
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "18px", fontWeight: 900,
                      letterSpacing: "0.15em",
                      color: T.black,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      transition: "background 0.1s, color 0.1s, box-shadow 0.1s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ↺ REBOOT
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Correct number reveal ── */}
          <AnimatePresence>
            {correctNumber && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", bounce: 0.65 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "48px",
                  backgroundColor: T.violet,
                  border: `4px solid ${T.black}`,
                  boxShadow: shadow(10),
                  padding: "16px 28px",
                }}
              >
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "12px", fontWeight: 900,
                  letterSpacing: "0.25em", color: T.black,
                }}>
                  TARGET WAS
                </span>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "48px", fontWeight: 900,
                  color: T.black, lineHeight: 1,
                }}>
                  {correctNumber}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Stats dashboard ── */}
          <div style={{
            borderTop: `4px solid ${T.black}`,
            paddingTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
          }}>
            <StatCard
              label="STATUS LOG"
              value={message}
              accent={T.white}
              rotate={-0.8}
            />
            <StatCard
              label="ATTEMPTS LEFT"
              value={attemptsLeft}
              accent={attemptsLeft <= 1 ? T.red : T.yellow}
              rotate={0.5}
            />
            <StatCard
              label="GLOBAL SCORE"
              value={score}
              accent={T.violet}
              rotate={-0.5}
            />
          </div>

          {/* ── Decorative halftone strip ── */}
          <div style={{
            marginTop: "60px",
            height: "48px",
            border: `4px solid ${T.black}`,
            ...halftone,
            opacity: 0.18,
          }} />
        </main>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer style={{
          backgroundColor: T.black,
          borderTop: `4px solid ${T.black}`,
          padding: "20px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "12px", fontWeight: 900,
            letterSpacing: "0.25em", color: T.yellow,
          }}>
            ★ NUMGAME — GUESS THE SECRET ★
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.15em", color: "#555",
          }}>
            1 – 100 // {attemptsLeft} ATTEMPTS REMAINING
          </span>
        </footer>
      </div>
    </>
  );
}