import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./assets/number_game_logo.png";

// --- EPIC ANIMATION VARIANTS ---

const containerReveal = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemReveal = {
  hidden: { opacity: 0, y: 40, rotateX: -45 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring", bounce: 0.5, duration: 0.8 },
  },
};

const titleLetterReveal = {
  hidden: { opacity: 0, y: 50, rotateY: 90, scale: 0.5 },
  show: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    scale: 1,
    transition: { type: "spring", damping: 10, stiffness: 200 },
  },
};

const neonPulse = {
  animate: {
    boxShadow: [
      "0px 0px 5px rgba(255, 61, 0, 0.2)",
      "0px 0px 20px rgba(255, 61, 0, 0.6)",
      "0px 0px 5px rgba(255, 61, 0, 0.2)",
    ],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const PANELS = {
  rules: {
    title: "Rules",
    items: [
      { heading: "Objective", body: "Guess the secret number hidden between 1 and 100." },
      { heading: "Attempts", body: "You get exactly 5 attempts per round. Use them wisely." },
      { heading: "Hints", body: "After each wrong guess you'll be told if the answer is higher or lower." },
      { heading: "Game Over", body: "If all 5 attempts are exhausted without a correct guess, the round ends." },
    ],
  },
  scoring: {
    title: "Scoring",
    items: [
      { heading: "How points are calculated", body: "Score = Attempts Remaining × 20 at the moment of a correct guess." },
      { heading: "Total Score", body: "Points accumulate across all rounds in a session. Try to beat your personal best!" },
    ],
  },
};

function Panel({ id, onClose }) {
  const data = PANELS[id];
  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        zIndex: 200,
        display: "flex",
        justifyContent: "flex-end",
        perspective: "1500px",
      }}
    >
      <motion.div
        initial={{ x: "100%", rotateY: 25, scale: 0.9 }}
        animate={{ x: 0, rotateY: 0, scale: 1 }}
        exit={{ x: "100%", rotateY: 25, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 100vw)",
          height: "100%",
          backgroundColor: "#0A0A0A",
          borderLeft: "2px solid #FF3D00",
          boxShadow: "-20px 0px 50px rgba(255,61,0,0.1)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          transformOrigin: "right center",
        }}
      >
        <div style={{ padding: "28px 36px", borderBottom: "1px solid #1C1C1C", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", letterSpacing: "0.4em", color: "#FF3D00", fontWeight: "bold", textTransform: "uppercase" }}>
            {data.title}
          </span>
          <motion.button whileHover={{ scale: 1.4, rotate: 180, color: "#FF3D00" }} whileTap={{ scale: 0.8 }} onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: "28px", cursor: "pointer" }}>×</motion.button>
        </div>
        <div style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "32px" }}>
          {data.items.map((item, i) => (
            <motion.div key={item.heading} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, type: "spring" }} whileHover={{ scale: 1.02, x: 10 }}>
              <p style={{ fontSize: "12px", letterSpacing: "0.2em", color: "#FF3D00", marginBottom: "8px" }}>{item.heading}</p>
              <p style={{ fontSize: "16px", color: "#AAA", lineHeight: "1.7", margin: 0 }}>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function App() {
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Awaiting your command...");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [correctNumber, setCorrectNumber] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  // Force a clean backend session when you first load the page
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
      const response = await fetch(`https://codsoft-s5i9.onrender.com/game/guess?guess=${guess}`, {
        credentials: "include"
      });
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

  // Splitting title for staggered animation
  const titleLine1 = "NUMBER".split("");
  const titleLine2 = "GAME".split("");

  return (
    <div
      style={{
        backgroundColor: "#050505",
        color: "#FAFAFA",
        minHeight: "100vh",
        fontFamily: "'DM Mono', monospace",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        overflowX: "hidden"
      }}
    >
      <AnimatePresence>
        {activePanel && <Panel id={activePanel} onClose={() => setActivePanel(null)} />}
      </AnimatePresence>

      {/* HEADER */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "24px 48px", borderBottom: "1px solid #1C1C1C", zIndex: 100
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <motion.img
            src={logo}
            alt="Logo"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity
            }}
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #FF3D00",
              boxShadow: "0px 0px 20px rgba(255,61,0,0.6)"
            }}
          />
          <span
            style={{
              fontSize: "14px",
              letterSpacing: "0.3em",
              color: "#FFF",
              fontWeight: "bold"
            }}
          >
            NUMGAME
          </span>
        </div>
        <nav style={{ display: "flex", gap: "32px" }}>
          {["rules", "scoring"].map((item) => (
            <motion.button
              key={item} onClick={() => setActivePanel(item)}
              whileHover={{ scale: 1.1, color: "#FF3D00", textShadow: "0px 0px 8px rgba(255,61,0,0.8)" }}
              whileTap={{ scale: 0.9 }}
              style={{ background: "none", border: "none", fontSize: "14px", letterSpacing: "0.15em", color: "#666", cursor: "pointer", textTransform: "uppercase" }}
            >
              {item}
            </motion.button>
          ))}
        </nav>
      </motion.header>

      {/* HERO SECTION */}
      <section style={{ padding: "80px 48px", position: "relative" }}>
        {/* Massive 3D Rotating Watermark */}
        <motion.div
          animate={{ rotateY: [0, 360], scale: [1, 1.1, 1], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", top: "0", right: "10%", fontSize: "clamp(300px, 40vw, 500px)", fontWeight: "900", color: "#FF3D00", pointerEvents: "none", zIndex: 0 }}
        >
          ?
        </motion.div>

        <motion.div variants={containerReveal} initial="hidden" animate="show" style={{ position: "relative", zIndex: 1 }}>
          <motion.p variants={itemReveal} style={{ fontSize: "12px", letterSpacing: "0.4em", color: "#FF3D00", marginBottom: "20px" }}>
            SYSTEM ONLINE // 5 ATTEMPTS
          </motion.p>

          <motion.h1
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{
              fontSize: "clamp(70px, 12vw, 130px)",
              fontWeight: "900",
              lineHeight: "0.85",
              margin: "0 0 40px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              cursor: "default"
            }}
          >
            {/* NUMBER */}
            <motion.div
              style={{ display: "flex", overflow: "hidden" }}
              variants={containerReveal}
              whileHover={{ x: 12 }}
            >
              {titleLine1.map((char, i) => (
                <motion.span
                  key={i}
                  variants={titleLetterReveal}
                  whileHover={{
                    y: -10,
                    scale: 1.08,
                    textShadow: "0px 0px 20px rgba(255,255,255,0.5)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ display: "inline-block" }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>

            {/* GAME */}
            <motion.div
              style={{
                display: "flex",
                color: "#FF3D00",
                overflow: "hidden",
                textShadow: "0px 0px 20px rgba(255,61,0,0.5)"
              }}
              variants={containerReveal}
              whileHover={{ x: 18 }}
            >
              {titleLine2.map((char, i) => (
                <motion.span
                  key={i}
                  variants={titleLetterReveal}
                  whileHover={{
                    y: -12,
                    scale: 1.1,
                    textShadow: "0px 0px 30px rgba(255,61,0,0.9)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ display: "inline-block" }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          </motion.h1>
        </motion.div>
      </section>

      {/* GAME UI */}
      <main style={{ flex: 1, padding: "0 48px 60px", zIndex: 1 }}>
        <motion.div variants={containerReveal} initial="hidden" animate="show" style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center", marginBottom: "80px" }}>

          {/* Intense Neon Input */}
          <motion.input
            type="number"
            placeholder="[ ENTER DIGIT ]"
            value={guess}
            disabled={gameFinished}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") checkGuess(); }}
            whileFocus={{ scale: 1.05, borderColor: "#FF3D00", boxShadow: "0px 0px 25px rgba(255, 61, 0, 0.4)" }}
            style={{
              backgroundColor: "#111", border: "2px solid #222", color: "#FFF", padding: "24px", width: "340px",
              fontSize: "24px", outline: "none", fontWeight: "bold", textAlign: "center", transition: "0.2s", userSelect: "auto", cursor: "text"
            }}
          />

          <motion.button
            whileHover={{ scale: gameFinished ? 1 : 1.1, backgroundColor: "#FF3D00", color: "#000", boxShadow: "0px 0px 30px rgba(255, 61, 0, 0.8)" }}
            whileTap={{ scale: gameFinished ? 1 : 0.9 }}
            onClick={checkGuess}
            disabled={gameFinished}
            style={{
              backgroundColor: "transparent", border: "2px solid #FF3D00", color: "#FF3D00", padding: "24px 40px",
              fontSize: "20px", fontWeight: "900", cursor: gameFinished ? "not-allowed" : "pointer", textTransform: "uppercase", opacity: gameFinished ? 0.2 : 1, transition: "0.3s"
            }}
          >
            EXECUTE
          </motion.button>

          <AnimatePresence>
            {gameFinished && (
              <motion.button
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
                whileHover={{ scale: 1.1, boxShadow: "0px 0px 40px rgba(255, 255, 255, 0.5)" }}
                whileTap={{ scale: 0.9 }}
                onClick={restartGame}
                style={{ backgroundColor: "#FFF", border: "none", color: "#000", padding: "24px 40px", fontSize: "20px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}
              >
                REBOOT SYSTEM
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {correctNumber && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.7 }}
              style={{ padding: "20px", backgroundColor: "rgba(255,61,0,0.1)", borderLeft: "4px solid #FF3D00", color: "#FF3D00", fontSize: "28px", fontWeight: "900", marginBottom: "40px", display: "inline-block" }}
            >
              TARGET WAS: {correctNumber}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Dashboard Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px", borderTop: "1px solid #222", paddingTop: "60px" }}>
          {[
            { label: "STATUS LOG", value: message, color: "#FFF" },
            { label: "ATTEMPTS REMAINING", value: attemptsLeft, color: attemptsLeft <= 1 ? "#FF3D00" : "#FFF" },
            { label: "GLOBAL SCORE", value: score, color: "#FF3D00" },
          ].map(({ label, value, color }) => (
            <motion.div key={label} whileHover={{ y: -10, scale: 1.02 }} style={{ padding: "30px", backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", borderRadius: "12px" }}>
              <p style={{ color: "#555", fontSize: "14px", letterSpacing: "0.2em", marginBottom: "16px", fontWeight: "bold" }}>{label}</p>
              <motion.h2
                key={String(value)}
                initial={{ opacity: 0, scale: 0.2, rotateX: 90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                style={{ fontSize: "clamp(30px, 4vw, 45px)", color, margin: 0, textShadow: color === "#FF3D00" ? "0px 0px 15px rgba(255,61,0,0.4)" : "none" }}
              >
                {value}
              </motion.h2>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;