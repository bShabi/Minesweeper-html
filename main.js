const difficulties = {
    beginner: {
        rows: 9,
        cols: 9,
        mines: 10
    },
    intermediate: {
        rows: 16,
        cols: 16,
        mines: 40
    },
    expert: {
        rows: 24,
        cols: 24,
        mines: 99
    }
};

let board = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let firstClick = true;
let timer = 0;
let timerInterval;
let currentDifficulty = difficulties.beginner;
let flagCount = 0;

function initializeBoard() {
    const {
        rows,
        cols
    } = currentDifficulty;
    board = Array(rows).fill().map(() => Array(cols).fill(0));
    revealed = Array(rows).fill().map(() => Array(cols).fill(false));
    flagged = Array(rows).fill().map(() => Array(cols).fill(false));
    gameOver = false;
    firstClick = true;
    flagCount = 0;

    updateDisplay();
    createBoard();
    resetTimer();
}

// Replace the entire createBoard function with this:
function createBoard() {
const gameBoard = document.getElementById('gameBoard');
const { rows, cols } = currentDifficulty;

gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
gameBoard.innerHTML = '';

// Responsive cell size calculation
const viewportWidth = Math.min(window.innerWidth - 32, 500);
const viewportHeight = window.innerHeight - 200; // Account for header and controls
const maxSize = Math.min(viewportWidth / cols, viewportHeight / rows, 40);
const cellSize = Math.max(maxSize, 32); // Minimum 32px for touch

for (let i = 0; i < rows; i++) {
for (let j = 0; j < cols; j++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
    
    // Touch-friendly event handling
    if ('ontouchstart' in window) {
        let touchTimeout;
        let touchStartTime;
        
        cell.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartTime = new Date().getTime();
            touchTimeout = setTimeout(() => {
                handleRightClick(i, j);
            }, 500);
        });
        
        cell.addEventListener('touchend', (e) => {
            const touchEndTime = new Date().getTime();
            clearTimeout(touchTimeout);
            if (touchEndTime - touchStartTime < 500) {
                handleClick(i, j);
            }
        });
    } else {
        cell.onclick = () => handleClick(i, j);
        cell.oncontextmenu = (e) => {
            e.preventDefault();
            handleRightClick(i, j);
        };
    }
    
    gameBoard.appendChild(cell);
}
}
}

function placeMines(firstRow, firstCol) {
    const {
        rows,
        cols,
        mines
    } = currentDifficulty;
    let minesPlaced = 0;

    while (minesPlaced < mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);

        if (board[row][col] !== -1 &&
            (Math.abs(row - firstRow) > 1 || Math.abs(col - firstCol) > 1)) {
            board[row][col] = -1;
            minesPlaced++;
        }
    }

    // Calculate numbers
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] !== -1) {
                let count = 0;
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && board[ni][nj] === -1) {
                            count++;
                        }
                    }
                }
                board[i][j] = count;
            }
        }
    }
}

function handleClick(row, col) {
    if (gameOver || flagged[row][col]) return;

    if (firstClick) {
        firstClick = false;
        placeMines(row, col);
        startTimer();
    }

    if (board[row][col] === -1) {
        gameOver = true;
        revealAll();
        clearInterval(timerInterval);
        return;
    }

    revealCell(row, col);
    checkWin();
}

function handleRightClick(row, col) {
    if (gameOver || revealed[row][col]) return;

    flagged[row][col] = !flagged[row][col];
    flagCount += flagged[row][col] ? 1 : -1;
    updateDisplay();
}

function revealCell(row, col) {
    if (revealed[row][col] || flagged[row][col]) return;

    revealed[row][col] = true;
    const cell = document.getElementsByClassName('cell')[row * currentDifficulty.cols + col];
    cell.classList.add('revealed');

    if (board[row][col] === 0) {
        // Reveal neighbors for empty cells
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                const ni = row + di;
                const nj = col + dj;
                if (ni >= 0 && ni < currentDifficulty.rows &&
                    nj >= 0 && nj < currentDifficulty.cols) {
                    revealCell(ni, nj);
                }
            }
        }
    } else if (board[row][col] > 0) {
        cell.textContent = board[row][col];
        cell.classList.add(`number-${board[row][col]}`);
    }
}

function revealAll() {
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < currentDifficulty.rows; i++) {
        for (let j = 0; j < currentDifficulty.cols; j++) {
            const cell = cells[i * currentDifficulty.cols + j];
            if (board[i][j] === -1) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            } else if (!revealed[i][j]) {
                revealed[i][j] = true;
                cell.classList.add('revealed');
                if (board[i][j] > 0) {
                    cell.textContent = board[i][j];
                    cell.classList.add(`number-${board[i][j]}`);
                }
            }
        }
    }
}

function checkWin() {
    for (let i = 0; i < currentDifficulty.rows; i++) {
        for (let j = 0; j < currentDifficulty.cols; j++) {
            if (board[i][j] !== -1 && !revealed[i][j]) return;
        }
    }
    gameOver = true;
    clearInterval(timerInterval);
    alert('Congratulations! You won! 🎉');
}

function updateDisplay() {
    document.getElementById('mineCount').textContent = currentDifficulty.mines;
    document.getElementById('flagCount').textContent = flagCount;
}

function startTimer() {
    timer = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        document.getElementById('timer').textContent =
            timer.toString().padStart(3, '0');
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timer = 0;
    document.getElementById('timer').textContent = '000';
}

function changeDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    currentDifficulty = difficulties[difficulty];
    newGame();
}

function newGame() {
    clearInterval(timerInterval);
    initializeBoard();
}
// Add this after your other initialization code
window.addEventListener('resize', () => {
    createBoard();
    // Restore the current game state
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < currentDifficulty.rows; i++) {
        for (let j = 0; j < currentDifficulty.cols; j++) {
            const cell = cells[i * currentDifficulty.cols + j];
            if (revealed[i][j]) {
                cell.classList.add('revealed');
                if (board[i][j] > 0) {
                    cell.textContent = board[i][j];
                    cell.classList.add(`number-${board[i][j]}`);
                }
            }
            if (flagged[i][j]) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            }
        }
    }
});

// Add orientation change handling
window.addEventListener('orientationchange', () => {
    setTimeout(createBoard, 100);
});
// Initialize the game
initializeBoard();
