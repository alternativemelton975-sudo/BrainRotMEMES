import { LEVELS } from './BrainRotMEMES.js';

document.addEventListener("DOMContentLoaded", () => {

    let currentLevelIndex = 0;
    let currentGameData = LEVELS[currentLevelIndex];

    const ThickOfIt = document.getElementById("ThickOfIt");
    const JohnPork = document.getElementById("JohnPork");
    const ChillGuy = document.getElementById("ChillGuy");
    const scoreDisplay = document.getElementById("score");
    const timerDisplay = document.getElementById("timer");
    const startBtn = document.getElementById("start-btn");

    let gameScore = 0;
    let chillGuySpeed = 5;
    let johnPorkSpeed = 10;

    let timeLeft = 60;
    let timerInterval = null;

    // FIX: gameOverPermanent must be global so timer can access it
    let gameOverPermanent = false;

    function loadLevel(index) {
        currentLevelIndex = index;
        currentGameData = LEVELS[index];

        gameScore = 0;
        scoreDisplay.innerText = "Points: 0";

        chillGuySpeed = 5 * currentGameData.speedMultiplier;
        johnPorkSpeed = 10 * currentGameData.speedMultiplier;

        // Reset timer
        clearInterval(timerInterval);
        timeLeft = currentGameData.timeLimit || 60;
        timerDisplay.innerText = "Time: " + timeLeft;

        startTimer();

        alert("Level " + currentGameData.levelNumber + " reached!");
    }

    startBtn.addEventListener("click", () => {
        startBtn.remove();
        document.getElementById("game-container").style.display = "block";
        startGame();
    });

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.innerText = "Time: " + timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                gameOverPermanent = true;

                alert("Time's up!");
                window.onkeydown = null;
                window.onkeyup = null;
            }
        }, 1000);
    }

    function startGame() {

        // FIX: Reset gameOverPermanent at start
        gameOverPermanent = false;

        loadLevel(0);

        let ThickOfItJumping = false;
        let ThickOfItMovingRight = false;
        let ThickOfItMovingLeft = false;

        let gameContainerWidth = document.getElementById("game-container").offsetWidth;
        let ThickOfItPosition = 95;

        ThickOfIt.style.left = ThickOfItPosition + "px";
        ThickOfIt.style.bottom = "95px";

        function checkLevelProgress() {
            if (gameScore >= currentGameData.targetScore) {
                if (currentLevelIndex < LEVELS.length - 1) {
                    loadLevel(currentLevelIndex + 1);
                } else {
                    alert("You beat all levels!");
                }
            }
        }

        function jump() {
            if (!ThickOfItJumping && !gameOverPermanent) {
                ThickOfItJumping = true;

                let pos = 95;
                let peak = 300;
                let speed = 20;

                let jumpInterval = setInterval(() => {
                    if (pos < peak) {
                        pos += speed;
                        ThickOfIt.style.bottom = pos + "px";
                    } else {
                        clearInterval(jumpInterval);
                        fall();
                    }
                }, 30);
            }
        }

        function fall() {
            let pos = parseInt(ThickOfIt.style.bottom) || 300;
            let speed = 20;

            let fallInterval = setInterval(() => {
                if (pos > 95) {
                    pos -= speed;
                    ThickOfIt.style.bottom = pos + "px";
                } else {
                    clearInterval(fallInterval);
                    ThickOfItJumping = false;
                }
            }, 30);
        }

        function moveThickOfIt(direction) {
            if (gameOverPermanent) return;

            let step = 20;
            let proposedPosition =
                ThickOfItPosition + (direction === "right" ? step : -step);

            let maxPosition = gameContainerWidth - ThickOfIt.offsetWidth;

            if (proposedPosition >= 0 && proposedPosition <= maxPosition) {
                ThickOfItPosition = proposedPosition;
                ThickOfIt.style.left = ThickOfItPosition + "px";

                if (direction === "right") {
                    ThickOfIt.classList.remove("flipped");
                } else {
                    ThickOfIt.classList.add("flipped");
                }
            }
        }

        function checkCollision(obstaclePos, obstacleBottom) {
            let ThickBottom = parseInt(ThickOfIt.style.bottom) || 95;

            let horizontalHit =
                obstaclePos < ThickOfItPosition + 70 &&
                obstaclePos > ThickOfItPosition - 70;

            let verticalHit =
                ThickBottom < obstacleBottom + 70 &&
                ThickBottom > obstacleBottom - 70;

            return horizontalHit && verticalHit;
        }

        function moveObstacle(obstacle) {
            let gameContainerWidth = document.getElementById("game-container").offsetWidth;
            let obstaclePosition = gameContainerWidth;

            let obstacleBottom = (obstacle.id === "ChillGuy") ? 150 : 95;
            obstacle.style.bottom = obstacleBottom + "px";

            obstacle.style.left = obstaclePosition + "px";
            obstacle.style.display = "block";

            let obstacleTimer = setInterval(() => {

                if (gameOverPermanent) {
                    clearInterval(obstacleTimer);
                    obstacle.style.display = "none";
                    return;
                }

                let speed = (obstacle.id === "ChillGuy") ? chillGuySpeed : johnPorkSpeed;
                obstaclePosition -= speed;

                obstacle.style.left = obstaclePosition + "px";

                if (checkCollision(obstaclePosition, obstacleBottom)) {
                    clearInterval(obstacleTimer);
                    obstacle.style.display = "none";

                    if (obstacle.id === "JohnPork") {
                        gameOverPermanent = true;

                        ThickOfItMovingLeft = false;
                        ThickOfItMovingRight = false;

                        window.onkeydown = null;
                        window.onkeyup = null;

                        alert("Bigge Cheese");
                        return;
                    }

                    if (obstacle.id === "ChillGuy") {
                        gameScore += 10;
                        scoreDisplay.innerText = "Points: " + gameScore;

                        checkLevelProgress();

                        if (!gameOverPermanent) {
                            setTimeout(() => moveObstacle(obstacle), 5000);
                        }
                    }
                }

                if (obstaclePosition < -60) {
                    clearInterval(obstacleTimer);
                    obstacle.style.display = "none";

                    if (!gameOverPermanent) {
                        let respawnDelay = (obstacle.id === "ChillGuy") ? 5000 : 200;
                        setTimeout(() => moveObstacle(obstacle), respawnDelay);
                    }
                }

            }, 20);
        }

        window.addEventListener("keydown", event => {
            if (gameOverPermanent) return;

            switch (event.key) {
                case " ":
                case "ArrowUp":
                case "w":
                    jump();
                    break;
                case "ArrowRight":
                case "d":
                    ThickOfItMovingRight = true;
                    break;
                case "ArrowLeft":
                case "a":
                    ThickOfItMovingLeft = true;
                    break;
            }
        });

        window.addEventListener("keyup", event => {
            if (gameOverPermanent) return;

            switch (event.key) {
                case "ArrowRight":
                case "d":
                    ThickOfItMovingRight = false;
                    break;
                case "ArrowLeft":
                case "a":
                    ThickOfItMovingLeft = false;
                    break;
            }
        });

        setInterval(() => {
            if (ThickOfItMovingRight) {
                moveThickOfIt("right");
            } else if (ThickOfItMovingLeft) {
                moveThickOfIt("left");
            }
        }, 30);

        moveObstacle(JohnPork);
        moveObstacle(ChillGuy);
    }
});
