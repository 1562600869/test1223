class YachtGame {
    constructor() {
        this.dice = [1, 1, 1, 1, 1];
        this.selected = [false, false, false, false, false];
        this.rollCount = 0;
        this.isFirstRoll = true;
        this.canScore = false;
        this.scores = {
            ones: null,
            twos: null,
            threes: null,
            fours: null,
            fives: null,
            sixes: null,
            threeOfAKind: null,
            fourOfAKind: null,
            fullHouse: null,
            smallStraight: null,
            largeStraight: null,
            yacht: null,
            chance: null
        };
        this.diceRenderers = [];
        this.rolling = false;
        this.highScore = this.loadHighScore();
        this.init();
    }

    init() {
        this.initDiceRenderers();
        this.bindEvents();
        this.updateUI();
        this.updateHighScoreDisplay();
    }

    initDiceRenderers() {
        for (let i = 0; i < 5; i++) {
            const canvas = document.getElementById(`dice${i}`);
            const renderer = new DiceRenderer(canvas);
            renderer.draw(this.dice[i], this.selected[i]);
            this.diceRenderers.push(renderer);
        }
    }

    bindEvents() {
        for (let i = 0; i < 5; i++) {
            const canvas = document.getElementById(`dice${i}`);
            canvas.addEventListener('click', () => this.handleDiceClick(i));
        }

        document.getElementById('rollBtn').addEventListener('click', () => this.handleRollClick());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.hideGameOverModal();
            this.newGame();
        });

        const scoreItems = document.querySelectorAll('.score-item');
        scoreItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (item.classList.contains('filled')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                const category = item.dataset.category;
                this.handleScoreClick(category);
            });
        });
    }

    handleDiceClick(index) {
        if (this.rolling || this.isFirstRoll) return;

        this.selected[index] = !this.selected[index];
        this.diceRenderers[index].setSelected(this.selected[index]);
    }

    handleRollClick() {
        if (this.rolling || this.rollCount >= 3) return;
        if (this.isGameOver()) return;

        this.rollDice();
    }

    rollDice() {
        if (this.isFirstRoll) {
            this.selected = [false, false, false, false, false];
            for (let i = 0; i < 5; i++) {
                this.diceRenderers[i].setSelected(false);
            }
            this.isFirstRoll = false;
            this.canScore = false;
        }

        this.rollCount++;
        this.rolling = true;

        const diceToRoll = [];
        for (let i = 0; i < 5; i++) {
            if (!this.selected[i]) {
                diceToRoll.push(i);
            }
        }

        let completed = 0;
        const rollDuration = 600 + Math.random() * 400;

        diceToRoll.forEach(index => {
            this.diceRenderers[index].startRollAnimation(rollDuration, () => {
                this.dice[index] = Math.floor(Math.random() * 6) + 1;
                this.diceRenderers[index].draw(this.dice[index], this.selected[index]);
                completed++;
                if (completed === diceToRoll.length) {
                    this.rolling = false;
                    this.canScore = true;
                    this.updateUI();
                }
            });
        });

        if (diceToRoll.length === 0) {
            this.rolling = false;
            this.canScore = true;
        }

        this.updateUI();
    }

    handleScoreClick(category) {
        if (this.scores[category] !== null) return;
        if (this.rolling) return;
        if (this.isFirstRoll) return;
        if (!this.canScore) return;
        if (this.isGameOver()) return;

        const score = this.calculateScore(category);
        this.scores[category] = score;

        this.resetForNextRound();

        this.updateUI();

        if (this.isGameOver()) {
            this.endGame();
        }
    }

    resetForNextRound() {
        this.dice = [1, 1, 1, 1, 1];
        this.selected = [false, false, false, false, false];
        this.rollCount = 0;
        this.isFirstRoll = true;
        this.canScore = false;

        for (let i = 0; i < 5; i++) {
            this.diceRenderers[i].draw(this.dice[i], false);
        }
    }

    calculateScore(category) {
        const dice = [...this.dice].sort((a, b) => a - b);
        const counts = this.getCountMap(dice);
        const sum = dice.reduce((a, b) => a + b, 0);

        switch (category) {
            case 'ones':
                return (counts[1] || 0) * 1;
            case 'twos':
                return (counts[2] || 0) * 2;
            case 'threes':
                return (counts[3] || 0) * 3;
            case 'fours':
                return (counts[4] || 0) * 4;
            case 'fives':
                return (counts[5] || 0) * 5;
            case 'sixes':
                return (counts[6] || 0) * 6;

            case 'threeOfAKind':
                return this.hasNOfAKind(counts, 3) ? sum : 0;
            case 'fourOfAKind':
                return this.hasNOfAKind(counts, 4) ? sum : 0;
            case 'fullHouse':
                return this.isFullHouse(counts) ? 25 : 0;
            case 'smallStraight':
                return this.isSmallStraight(dice) ? 30 : 0;
            case 'largeStraight':
                return this.isLargeStraight(dice) ? 40 : 0;
            case 'yacht':
                return this.hasNOfAKind(counts, 5) ? 50 : 0;
            case 'chance':
                return sum;

            default:
                return 0;
        }
    }

    getCountMap(dice) {
        const counts = {};
        dice.forEach(d => {
            counts[d] = (counts[d] || 0) + 1;
        });
        return counts;
    }

    hasNOfAKind(counts, n) {
        return Object.values(counts).some(count => count >= n);
    }

    isFullHouse(counts) {
        const values = Object.values(counts).sort((a, b) => b - a);
        return values.length === 2 && values[0] === 3 && values[1] === 2;
    }

    isSmallStraight(dice) {
        const unique = [...new Set(dice)];
        if (unique.length < 4) return false;
        const straights = [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]];
        return straights.some(s => s.every(n => unique.includes(n)));
    }

    isLargeStraight(dice) {
        const unique = [...new Set(dice)];
        if (unique.length < 5) return false;
        const sum = unique.reduce((a, b) => a + b, 0);
        return sum === 15 || sum === 20;
    }

    getUpperTotal() {
        const upper = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
        return upper.reduce((total, cat) => {
            return total + (this.scores[cat] !== null ? this.scores[cat] : 0);
        }, 0);
    }

    getLowerTotal() {
        const lower = ['threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yacht', 'chance'];
        return lower.reduce((total, cat) => {
            return total + (this.scores[cat] !== null ? this.scores[cat] : 0);
        }, 0);
    }

    getTotalScore() {
        return this.getUpperTotal() + this.getLowerTotal();
    }

    getScoreCount() {
        return Object.values(this.scores).filter(s => s !== null).length;
    }

    isGameOver() {
        return this.getScoreCount() >= 13;
    }

    endGame() {
        const totalScore = this.getTotalScore();

        if (totalScore > this.highScore) {
            this.highScore = totalScore;
            this.saveHighScore();
        }

        this.showGameOverModal(totalScore);
    }

    showGameOverModal(finalScore) {
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('modalHighScore').textContent = this.highScore;

        const highScoreText = document.getElementById('highScoreText');
        if (finalScore >= this.highScore && finalScore > 0) {
            highScoreText.textContent = '🎉 新纪录！';
        } else {
            highScoreText.textContent = '历史最高分';
        }

        document.getElementById('gameOverModal').classList.remove('hidden');
    }

    hideGameOverModal() {
        document.getElementById('gameOverModal').classList.add('hidden');
    }

    newGame() {
        this.dice = [1, 1, 1, 1, 1];
        this.selected = [false, false, false, false, false];
        this.rollCount = 0;
        this.isFirstRoll = true;
        this.canScore = false;
        this.rolling = false;

        this.scores = {
            ones: null,
            twos: null,
            threes: null,
            fours: null,
            fives: null,
            sixes: null,
            threeOfAKind: null,
            fourOfAKind: null,
            fullHouse: null,
            smallStraight: null,
            largeStraight: null,
            yacht: null,
            chance: null
        };

        for (let i = 0; i < 5; i++) {
            this.diceRenderers[i].draw(this.dice[i], this.selected[i]);
        }

        this.updateUI();
        this.updateHighScoreDisplay();
    }

    updateUI() {
        document.getElementById('rollsLeft').textContent = 3 - this.rollCount;

        const rollBtn = document.getElementById('rollBtn');
        rollBtn.disabled = this.rolling || this.rollCount >= 3 || this.isGameOver();

        Object.keys(this.scores).forEach(category => {
            const scoreEl = document.querySelector(`[data-score="${category}"]`);
            const itemEl = document.querySelector(`[data-category="${category}"]`);

            if (this.scores[category] !== null) {
                scoreEl.textContent = this.scores[category];
                itemEl.classList.add('filled');
                itemEl.classList.add('disabled');
            } else {
                if (this.canScore && !this.isGameOver()) {
                    const previewScore = this.calculateScore(category);
                    scoreEl.textContent = previewScore;
                    itemEl.classList.remove('filled');
                    itemEl.classList.remove('disabled');
                } else {
                    scoreEl.textContent = '-';
                    itemEl.classList.remove('filled');
                    if (!this.canScore || this.isGameOver()) {
                        itemEl.classList.add('disabled');
                    } else {
                        itemEl.classList.remove('disabled');
                    }
                }
            }
        });

        document.getElementById('upperTotal').textContent = this.getUpperTotal();
        document.getElementById('grandTotal').textContent = this.getTotalScore();
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('yachtHighScore'), 10) || 0;
    }

    saveHighScore() {
        localStorage.setItem('yachtHighScore', this.highScore.toString());
    }

    updateHighScoreDisplay() {
        document.getElementById('highScore').textContent = this.highScore;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.yachtGame = new YachtGame();
});
