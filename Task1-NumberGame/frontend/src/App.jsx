import { useState } from "react";

function App() {

  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [score, setScore] = useState(0);

  const checkGuess = async () => {

    if (!guess) return;

    const response = await fetch(
      `http://localhost:8080/game/guess?guess=${guess}`
    );

    const data = await response.json();

    setMessage(data.message);
    setAttemptsLeft(data.attemptsLeft);

    if (data.score) {
      setScore(data.score);
    }

    if (data.gameOver) {
      alert("Game Over! Starting New Round.");
    }

    setGuess("");
  };

  return (

    <div
      style={{
        backgroundColor: "#0A0A0A",
        color: "#FAFAFA",
        minHeight: "100vh",
        padding: "60px 30px",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
    >

      <p
        style={{
          color: "#737373",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontSize: "14px",
          marginBottom: "20px"
        }}
      >
        CodSoft Internship Task 1
      </p>

      <h1
        style={{
          fontSize: "96px",
          fontWeight: "800",
          lineHeight: "0.9",
          letterSpacing: "-0.06em",
          margin: "0",
          maxWidth: "900px"
        }}
      >
        NUMBER
        <br />
        GAME
      </h1>

      <div
        style={{
          width: "120px",
          height: "4px",
          backgroundColor: "#FF3D00",
          marginTop: "30px",
          marginBottom: "40px"
        }}
      />

      <p
        style={{
          color: "#737373",
          fontSize: "18px",
          maxWidth: "500px",
          lineHeight: "1.7",
          marginBottom: "50px"
        }}
      >
        Guess the correct number between 1 and 100.
        You have limited attempts. Every correct answer
        increases your score.
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >

        <input
          type="number"
          placeholder="ENTER YOUR GUESS"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              checkGuess();
            }
          }}
          style={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #262626",
            color: "#FAFAFA",
            padding: "18px",
            width: "320px",
            fontSize: "18px",
            outline: "none"
          }}
        />

        <button
          onClick={checkGuess}
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
            textTransform: "uppercase"
          }}
        >
          Submit Guess
        </button>

      </div>

      <div
        style={{
          marginTop: "60px",
          borderTop: "1px solid #262626",
          paddingTop: "30px",
          display: "flex",
          gap: "80px",
          flexWrap: "wrap"
        }}
      >

        <div>
          <p
            style={{
              color: "#737373",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "13px"
            }}
          >
            Message
          </p>

          <h2
            style={{
              fontSize: "40px",
              letterSpacing: "-0.04em",
              marginTop: "10px"
            }}
          >
            {message || "Waiting..."}
          </h2>
        </div>

        <div>
          <p
            style={{
              color: "#737373",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "13px"
            }}
          >
            Attempts Left
          </p>

          <h2
            style={{
              fontSize: "40px",
              letterSpacing: "-0.04em",
              marginTop: "10px"
            }}
          >
            {attemptsLeft}
          </h2>
        </div>

        <div>
          <p
            style={{
              color: "#737373",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "13px"
            }}
          >
            Score
          </p>

          <h2
            style={{
              fontSize: "40px",
              letterSpacing: "-0.04em",
              marginTop: "10px"
            }}
          >
            {score}
          </h2>
        </div>

      </div>

    </div>
  );
}

export default App;