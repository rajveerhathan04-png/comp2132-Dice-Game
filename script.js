// Main Game Controller Object
class DiceGame {
    constructor() {
        this.players = {
            player: new Player('Player'),
            computer: new Player('Computer')
        };
        this.currentRound = 1;
        this.maxRounds = 3;
        this.isGameActive = false;
        this.isRolling = false;
        this.gameHistory = [];
        
        this.init();
    }

    // Initialize the game
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.resetGame();
        this.updateDisplay();
    }

    // Cache DOM elements
    cacheDOM() {
        // Dice elements
        this.playerDice1 = document.getElementById('player-dice1');
        this.playerDice2 = document.getElementById('player-dice2');
        this.computerDice1 = document.getElementById('computer-dice1');
        this.computerDice2 = document.getElementById('computer-dice1');
        
        // Score elements
        this.playerRoundScore = document.getElementById('player-round-score');
        this.playerTotalScore = document.getElementById('player-total-score');
        this.computerRoundScore = document.getElementById('computer-round-score');
        this.computerTotalScore = document.getElementById('computer-total-score');
        
        // Game info elements
        this.roundNumber = document.getElementById('round-number');
        this.gameMessage = document.getElementById('game-message');
        this.historyList = document.getElementById('history-list');
        
        // Buttons
        this.rollBtn = document.getElementById('roll-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.rulesToggle = document.getElementById('rules-toggle');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        // Modal elements
        this.winnerModal = document.getElementById('winner-modal');
        this.winnerResult = document.getElementById('winner-result');
        this.playerFinalScore = document.getElementById('player-final-score');
        this.computerFinalScore = document.getElementById('computer-final-score');
        
        // Close modal button
        this.closeModal = document.querySelector('.close-modal');
    }

    // Bind event listeners
    bindEvents() {
        this.rollBtn.addEventListener('click', () => this.rollDice());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.rulesToggle.addEventListener('click', () => this.toggleRules());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.closeModal.addEventListener('click', () => this.hideModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.winnerModal) {
                this.hideModal();
            }
        });
    }

    // Dice object
    Dice = {
        roll: function() {
            return Math.floor(Math.random() * 6) + 1;
        },
        
        getImagePath: function(value) {
            return `images/dice-${value}.jpg`;
        },
        
        animate: function(diceElement) {
            return new Promise((resolve) => {
                diceElement.classList.add('rolling');
                
                // Create a rolling animation by changing dice faces rapidly
                let rolls = 0;
                const maxRolls = 10;
                const rollInterval = setInterval(() => {
                    const tempValue = this.roll();
                    const img = diceElement.querySelector('.dice-image');
                    img.src = this.getImagePath(tempValue);
                    img.alt = `Dice showing ${tempValue}`;
                    
                    rolls++;
                    if (rolls >= maxRolls) {
                        clearInterval(rollInterval);
                        setTimeout(() => {
                            diceElement.classList.remove('rolling');
                            resolve();
                        }, 100);
                    }
                }, 80);
            });
        }
    };

    // Score calculation function
    calculateScore(dice1, dice2) {
        // Rule 1: If any die is 1, score is 0
        if (dice1 === 1 || dice2 === 1) {
            return 0;
        }
        
        // Rule 2: If dice are equal, score is sum * 2
        if (dice1 === dice2) {
            return (dice1 + dice2) * 2;
        }
        
        // Rule 3: Otherwise, score is sum
        return dice1 + dice2;
    }

    // Roll dice for both player and computer
    async rollDice() {
        if (this.isRolling || !this.isGameActive || this.currentRound > this.maxRounds) return;
        
        this.isRolling = true;
        this.rollBtn.disabled = true;
        
        // Reset round scores
        this.players.player.roundScore = 0;
        this.players.computer.roundScore = 0;
        
        // Update game message
        this.gameMessage.textContent = 'Rolling dice...';
        this.gameMessage.style.color = '#f39c12';
        
        // Animate both player dice
        await Promise.all([
            this.Dice.animate(this.playerDice1),
            this.Dice.animate(this.playerDice2),
            this.Dice.animate(this.computerDice1),
            this.Dice.animate(this.computerDice2)
        ]);
        
        // Get final dice values
        const playerDice1 = this.Dice.roll();
        const playerDice2 = this.Dice.roll();
        const computerDice1 = this.Dice.roll();
        const computerDice2 = this.Dice.roll();
        
        // Update dice images with final values
        this.updateDiceImages(playerDice1, playerDice2, computerDice1, computerDice2);
        
        // Calculate scores
        const playerScore = this.calculateScore(playerDice1, playerDice2);
        const computerScore = this.calculateScore(computerDice1, computerDice2);
        
        // Update player scores
        this.players.player.roundScore = playerScore;
        this.players.player.totalScore += playerScore;
        this.players.computer.roundScore = computerScore;
        this.players.computer.totalScore += computerScore;
        
        // Add to history
        this.addToHistory(playerDice1, playerDice2, playerScore, computerDice1, computerDice2, computerScore);
        
        // Update display
        this.updateDisplay();
        
        // Check round winner
        this.checkRoundWinner(playerScore, computerScore);
        
        // Move to next round or end game
        this.currentRound++;
        this.roundNumber.textContent = this.currentRound;
        
        if (this.currentRound > this.maxRounds) {
            this.endGame();
        } else {
            this.gameMessage.textContent = `Round ${this.currentRound} ready! Click "Roll Dice" to continue.`;
            this.gameMessage.style.color = '#2c3e50';
        }
        
        this.isRolling = false;
        this.rollBtn.disabled = false;
    }

    // Update dice images on screen
    updateDiceImages(p1, p2, c1, c2) {
        // Player dice
        const playerImg1 = this.playerDice1.querySelector('.dice-image');
        const playerImg2 = this.playerDice2.querySelector('.dice-image');
        playerImg1.src = this.Dice.getImagePath(p1);
        playerImg1.alt = `Player dice showing ${p1}`;
        playerImg2.src = this.Dice.getImagePath(p2);
        playerImg2.alt = `Player dice showing ${p2}`;
        
        // Computer dice
        const computerImg1 = this.computerDice1.querySelector('.dice-image');
        const computerImg2 = this.computerDice2.querySelector('.dice-image');
        computerImg1.src = this.Dice.getImagePath(c1);
        computerImg1.alt = `Computer dice showing ${c1}`;
        computerImg2.src = this.Dice.getImagePath(c2);
        computerImg2.alt = `Computer dice showing ${c2}`;
    }

    // Update all display elements
    updateDisplay() {
        // Update scores
        this.playerRoundScore.textContent = this.players.player.roundScore;
        this.playerTotalScore.textContent = this.players.player.totalScore;
        this.computerRoundScore.textContent = this.players.computer.roundScore;
        this.computerTotalScore.textContent = this.players.computer.totalScore;
        
        // Update round number
        this.roundNumber.textContent = this.currentRound;
        
        // Highlight active player
        this.highlightActivePlayer();
    }

    // Highlight the current round winner
    highlightActivePlayer() {
        const playerSection = document.getElementById('player-section');
        const computerSection = document.getElementById('computer-section');
        
        // Remove all highlights first
        playerSection.classList.remove('active', 'winner-highlight');
        computerSection.classList.remove('active', 'winner-highlight');
        
        // Add highlight to winner of last round
        if (this.players.player.roundScore > this.players.computer.roundScore) {
            playerSection.classList.add('active');
        } else if (this.players.computer.roundScore > this.players.player.roundScore) {
            computerSection.classList.add('active');
        }
    }

    // Check and display round winner
    checkRoundWinner(playerScore, computerScore) {
        let message = '';
        
        if (playerScore > computerScore) {
            message = `Player wins round ${this.currentRound}!`;
            this.gameMessage.style.color = '#3498db';
        } else if (computerScore > playerScore) {
            message = `Computer wins round ${this.currentRound}!`;
            this.gameMessage.style.color = '#e74c3c';
        } else {
            message = `Round ${this.currentRound} is a draw!`;
            this.gameMessage.style.color = '#f39c12';
        }
        
        this.gameMessage.textContent = message;
    }

    // Add round to history
    addToHistory(p1, p2, pScore, c1, c2, cScore) {
        const historyItem = {
            round: this.currentRound,
            playerDice: [p1, p2],
            playerScore: pScore,
            computerDice: [c1, c2],
            computerScore: cScore,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.gameHistory.unshift(historyItem);
        this.updateHistoryDisplay();
    }

    // Update history display
    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        
        if (this.gameHistory.length === 0) {
            this.historyList.innerHTML = '<p class="history-empty">No rolls yet. Start playing!</p>';
            return;
        }
        
        this.gameHistory.forEach((item, index) => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.style.animationDelay = `${index * 0.1}s`;
            
            historyElement.innerHTML = `
                <p><strong>Round ${item.round}</strong> - ${item.timestamp}</p>
                <p>Player: 🎲${item.playerDice[0]}+🎲${item.playerDice[1]} = 
                   <span class="history-score">${item.playerScore} pts</span></p>
                <p>Computer: 🎲${item.computerDice[0]}+🎲${item.computerDice[1]} = 
                   <span class="history-score">${item.computerScore} pts</span></p>
            `;
            
            this.historyList.appendChild(historyElement);
        });
    }

    // End the game and show results
    endGame() {
        this.isGameActive = false;
        this.rollBtn.disabled = true;
        
        const playerTotal = this.players.player.totalScore;
        const computerTotal = this.players.computer.totalScore;
        
        // Update final scores in modal
        this.playerFinalScore.textContent = playerTotal;
        this.computerFinalScore.textContent = computerTotal;
        
        // Determine winner
        let winnerHTML = '';
        if (playerTotal > computerTotal) {
            winnerHTML = `
                <div class="winner-icon player-win">
                    <i class="fas fa-trophy"></i>
                </div>
                <h3>Player Wins! 🎉</h3>
                <p>Congratulations! You defeated the computer with ${playerTotal} points!</p>
            `;
            // Add winner highlight
            document.getElementById('player-section').classList.add('winner-highlight');
        } else if (computerTotal > playerTotal) {
            winnerHTML = `
                <div class="winner-icon computer-win">
                    <i class="fas fa-robot"></i>
                </div>
                <h3>Computer Wins! 🤖</h3>
                <p>The computer won with ${computerTotal} points. Better luck next time!</p>
            `;
            document.getElementById('computer-section').classList.add('winner-highlight');
        } else {
            winnerHTML = `
                <div class="winner-icon draw">
                    <i class="fas fa-handshake"></i>
                </div>
                <h3>It's a Draw! ⚖️</h3>
                <p>Both players scored ${playerTotal} points. What a close match!</p>
            `;
        }
        
        this.winnerResult.innerHTML = winnerHTML;
        this.showModal();
    }

    // Show winner modal
    showModal() {
        this.winnerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Hide winner modal
    hideModal() {
        this.winnerModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    // Reset the game to initial state
    resetGame() {
        this.currentRound = 1;
        this.isGameActive = true;
        this.isRolling = false;
        this.gameHistory = [];
        
        // Reset players
        this.players.player.reset();
        this.players.computer.reset();
        
        // Reset dice images
        this.updateDiceImages(1, 1, 1, 1);
        
        // Update display
        this.updateDisplay();
        this.updateHistoryDisplay();
        
        // Reset UI elements
        this.roundNumber.textContent = this.currentRound;
        this.gameMessage.textContent = 'Click "Roll Dice" to start the game!';
        this.gameMessage.style.color = '#2c3e50';
        
        // Enable roll button
        this.rollBtn.disabled = false;
        
        // Remove winner highlights
        document.getElementById('player-section').classList.remove('winner-highlight');
        document.getElementById('computer-section').classList.remove('winner-highlight');
        
        // Hide modal if open
        this.hideModal();
    }

    // Toggle rules panel visibility
    toggleRules() {
        const rulesPanel = document.querySelector('.rules-panel');
        const isVisible = rulesPanel.style.display !== 'none';
        
        if (isVisible) {
            rulesPanel.style.display = 'none';
            this.rulesToggle.innerHTML = '<i class="fas fa-question-circle"></i> Show Rules';
        } else {
            rulesPanel.style.display = 'block';
            this.rulesToggle.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Rules';
        }
    }
}

// Player Object
class Player {
    constructor(name) {
        this.name = name;
        this.roundScore = 0;
        this.totalScore = 0;
    }
    
    reset() {
        this.roundScore = 0;
        this.totalScore = 0;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new DiceGame();
    
    // Expose game instance globally for debugging (optional)
    window.game = game;
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (game.isGameActive && !game.isRolling) {
                game.rollDice();
            }
        }
        
        if (e.key === 'r' || e.key === 'R') {
            game.resetGame();
        }
        
        if (e.key === 'Escape') {
            game.hideModal();
        }
    });
    
    // Add instructions for keyboard shortcuts
    console.log('🎮 Game Controls:');
    console.log('• Space/Enter: Roll Dice');
    console.log('• R: Reset Game');
    console.log('• Escape: Close Modal');
});