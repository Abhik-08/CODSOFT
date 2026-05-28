package com.abhik.numbergame;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.annotation.SessionScope;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

// 1. Added allowCredentials = "true" so the browser can send and store the Session Cookie
@CrossOrigin(origins = "https://codsoft-eosin-nu.vercel.app", allowCredentials = "true")
@RestController
@RequestMapping("/game")
// 2. Added SessionScope so every browser tab/user gets their own variables
@SessionScope
public class GameController {

    int randomNumber = new Random().nextInt(100) + 1;

    int attemptsLeft = 5;

    int score = 0;

    boolean gameFinished = false;

    @GetMapping("/guess")
    public Map<String, Object> guessNumber(@RequestParam int guess) {

        Map<String, Object> response = new HashMap<>();

        // STOP if game already finished
        if (gameFinished) {
            response.put("message", "Game Finished! Press Play Again.");
            response.put("gameFinished", true);
            return response;
        }

        // decrease attempts
        attemptsLeft--;

        // CORRECT GUESS
        if (guess == randomNumber) {
            int roundScore = attemptsLeft * 20;
            score += roundScore;

            response.put("message", "🎉 Correct Guess!");
            response.put("score", score);
            response.put("attemptsLeft", attemptsLeft);
            response.put("correctNumber", randomNumber);
            response.put("won", true);

            gameFinished = true;
            return response;
        }

        // TOO HIGH
        if (guess > randomNumber) {
            response.put("message", "📈 Too High!");
        }
        // TOO LOW
        else {
            response.put("message", "📉 Too Low!");
        }

        // always send attempts left
        response.put("attemptsLeft", attemptsLeft);

        // GAME OVER
        if (attemptsLeft <= 0) {
            response.put("message", "❌ Game Over!");
            response.put("correctNumber", randomNumber);
            response.put("gameOver", true);

            gameFinished = true;
        }

        return response;
    }

    @GetMapping("/restart")
    public Map<String, Object> restartGame() {

        randomNumber = new Random().nextInt(100) + 1;
        attemptsLeft = 5;
        gameFinished = false;

        Map<String, Object> response = new HashMap<>();
        response.put("message", "New Game Started!");

        return response;
    }
}