import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const pulse = {
  animate: {
    scale: [1, 1.04, 1],
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  },
};

const PANELS = {
  rules: {
    title: "Rules",
    items: [
      { heading: "Objective", body: "Guess the secret number hidden between 1 and 100." },
      { heading: "Attempts", body: "You get exactly 5 attempts per round. Use them wisely." },
      { heading: "Hints", body: "After each wrong guess you'll be told if the answer is higher or lower." },
      { heading: "Game Over", body: "If all 5 attempts are exhausted without a correct guess, the round ends and the number is revealed." },
      { heading: "New Round", body: "Hit Play Again to reset attempts and start a fresh round. Your total score carries over." },
    ],
  },
  scoring: {
    title: "Scoring",
    items: [
      { heading: "How points are calculated", body: "Score = Attempts Remaining × 20 at the moment of a correct guess." },
      { heading: "Guess on attempt 1", body: "4 attempts left → 4 × 20 = 80 pts" },
      { heading: "Guess on attempt 2", body: "3 attempts left → 3 × 20 = 60 pts" },
      { heading: "Guess on attempt 3", body: "2 attempts left → 2 × 20 = 40 pts" },
      { heading: "Guess on attempt 4", body: "1 attempt left → 1 × 20 = 20 pts" },
      { heading: "Guess on attempt 5", body: "0 attempts left → 0 × 20 = 0 pts" },
      { heading: "Wrong all 5", body: "No points awarded. Score does not decrease." },
      { heading: "Total Score", body: "Points accumulate across all rounds in a session. Try to beat your personal best!" },
    ],
  },
};

function Panel({ id, onClose }) {
  const data = PANELS[id];
  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        zIndex: 200,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 100vw)",
          height: "100%",
          backgroundColor: "#0F0F0F",
          borderLeft: "1px solid #1C1C1C",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            padding: "28px 36px",
            borderBottom: "1px solid #1C1C1C",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            backgroundColor: "#0F0F0F",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#FF3D00",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#FF3D00",
              }}
            >
              {data.title}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, color: "#FF3D00" }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              fontSize: "24px",
              cursor: "pointer",
              lineHeight: 1,
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            ×
          </motion.button>
        </div>

        {/* Panel Body */}
        <div style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "32px" }}>
          {data.items.map((item, i) => (
            <motion.div
              key={item.heading}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            >
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#FF3D00",
                  marginBottom: "8px",
                }}
              >
                {item.heading}
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: "#888",
                  lineHeight: "1.7",
                  margin: 0,
                }}
              >
                {item.body}
              </p>
              {i < data.items.length - 1 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#1A1A1A",
                    marginTop: "32px",
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function App() {
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Waiting...");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [correctNumber, setCorrectNumber] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const restartGame = async () => {
    await fetch("http://localhost:8080/game/restart");
    setAttemptsLeft(5);
    setMessage("New Game Started!");
    setCorrectNumber(null);
    setGameFinished(false);
    setGuess("");
  };

  const checkGuess = async () => {
    if (!guess || gameFinished) return;
    try {
      const response = await fetch(
        `http://localhost:8080/game/guess?guess=${guess}`
      );
      const data = await response.json();
      console.log(data);
      setMessage(data.message);
      if (data.attemptsLeft !== undefined) setAttemptsLeft(data.attemptsLeft);
      if (data.score !== undefined) setScore(data.score);
      if (data.correctNumber !== undefined) setCorrectNumber(data.correctNumber);
      if (data.won === true ||
          data.gameOver === true) {

        setGameFinished(true);
      };
      setGuess("");
    } catch (error) {
      console.log(error);
      setMessage("Backend Connection Error");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        color: "#FAFAFA",
        minHeight: "100vh",
        fontFamily: "'DM Mono', monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── SLIDE-IN PANEL ── */}
      <AnimatePresence>
        {activePanel && (
          <Panel id={activePanel} onClose={() => setActivePanel(null)} />
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 48px",
          borderBottom: "1px solid #1C1C1C",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(12px)",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <motion.div
            {...pulse}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#FF3D00",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#737373",
            }}
          >
            NumGame
          </span>
        </div>

        <nav style={{ display: "flex", gap: "32px" }}>
          {["rules", "scoring"].map((item) => (
            <motion.button
              key={item}
              onClick={() => setActivePanel(item)}
              whileHover={{ color: "#FF3D00" }}
              transition={{ duration: 0.2 }}
              style={{
                background: "none",
                border: "none",
                fontSize: "13px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#555",
                cursor: "pointer",
                padding: 0,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {item}
            </motion.button>
          ))}
        </nav>
      </motion.header>

      {/* ── HERO ── */}
      <section
        style={{
          padding: "90px 48px 60px",
          borderBottom: "1px solid #1C1C1C",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ghost background character */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          style={{
            position: "absolute",
            top: "-40px",
            right: "-20px",
            fontSize: "340px",
            fontWeight: "900",
            lineHeight: 1,
            color: "#FF3D00",
            pointerEvents: "none",
            userSelect: "none",
            letterSpacing: "-0.08em",
          }}
        >
          ?
        </motion.div>

        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{
            fontSize: "11px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#FF3D00",
            marginBottom: "18px",
          }}
        >
          1 – 100 · 5 Attempts · Score Attack
        </motion.p>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{
            fontSize: "clamp(60px, 10vw, 100px)",
            fontWeight: "800",
            lineHeight: "0.88",
            letterSpacing: "-0.05em",
            margin: "0 0 30px",
          }}
        >
          NUMBER
          <br />
          <span style={{ color: "#FF3D00" }}>GAME</span>
        </motion.h1>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ width: "60px", height: "3px", backgroundColor: "#FF3D00" }} />
          <div style={{ width: "16px", height: "3px", backgroundColor: "#2A2A2A" }} />
          <div style={{ width: "8px", height: "3px", backgroundColor: "#2A2A2A" }} />
        </motion.div>

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{
            color: "#555",
            fontSize: "16px",
            maxWidth: "520px",
            lineHeight: "1.8",
          }}
        >
          A secret number hides between 1 and 100. You have{" "}
          <span style={{ color: "#FAFAFA" }}>5 attempts</span> to find it.
          Every wrong guess costs you — fewer attempts means a{" "}
          <span style={{ color: "#FF3D00" }}>higher score</span>.
        </motion.p>
      </section>

      {/* ── GAME UI ── */}
      <main style={{ flex: 1, padding: "60px 48px" }}>
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "60px",
          }}
        >
          <input
            type="number"
            placeholder="ENTER YOUR GUESS"
            value={guess}
            disabled={gameFinished}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") checkGuess(); }}
            style={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #262626",
              color: "#FAFAFA",
              padding: "18px",
              width: "320px",
              fontSize: "18px",
              outline: "none",
              fontFamily: "'DM Mono', monospace",
            }}
          />

          <motion.button
            whileHover={{ scale: gameFinished ? 1 : 1.04 }}
            whileTap={{ scale: gameFinished ? 1 : 0.97 }}
            onClick={checkGuess}
            disabled={gameFinished}
            style={{
              background: "none",
              border: "none",
              color: "#FF3D00",
              fontSize: "16px",
              fontWeight: "700",
              letterSpacing: "0.15em",
              cursor: "pointer",
              borderBottom: "2px solid #FF3D00",
              paddingBottom: "8px",
              textTransform: "uppercase",
              opacity: gameFinished ? 0.5 : 1,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Submit Guess
          </motion.button>

          <AnimatePresence>
            {gameFinished && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={restartGame}
                style={{
                  backgroundColor: "#FF3D00",
                  border: "none",
                  color: "#0A0A0A",
                  padding: "16px 24px",
                  fontWeight: "700",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                Play Again
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {correctNumber && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                marginBottom: "40px",
                color: "#FF3D00",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              Correct Number: {correctNumber}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{
            borderTop: "1px solid #1C1C1C",
            paddingTop: "40px",
            display: "flex",
            gap: "80px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Message", value: message, color: "#FAFAFA" },
            { label: "Attempts Left", value: attemptsLeft, color: "#FAFAFA" },
            { label: "Total Score", value: score, color: "#FF3D00" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p
                style={{
                  color: "#737373",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                {label}
              </p>
              <motion.h2
                key={String(value)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ fontSize: "40px", color, margin: 0 }}
              >
                {value}
              </motion.h2>
            </div>
          ))}
        </motion.div>
      </main>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        style={{
          borderTop: "1px solid #1C1C1C",
          padding: "28px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#FF3D00",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#333",
            }}
          >
            NumGame · 2025
          </span>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "#333",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          Guess smart. Score high. Beat yourself.
        </p>
      </motion.footer>
    </div>
  );
}

export default App;