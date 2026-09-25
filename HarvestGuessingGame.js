let secretWeight = 0;
let minWeight = 1;
let maxWeight = 100;
let maxDays = 7;
let daysLeft = 7;
let guesses = [];
let startTime = 0;
let currentFieldName = "";

let gamesPlayed = 0;
let wins = 0;
let bestScore = 0;
let totalPoints = 0;
let historyLog = [];

window.onload = function() {
  loadData();
  
  const input = document.getElementById("guess-input");
  if (input) {
    input.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        submitGuess();
      }
    });
  }
};

function loadData() {
  const saved = localStorage.getItem("harvest_journal");
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    gamesPlayed = data.gamesPlayed || 0;
    wins = data.wins || 0;
    bestScore = data.bestScore || 0;
    totalPoints = data.totalPoints || 0;
    historyLog = data.historyLog || [];
  } catch (e) {}
}

function saveData() {
  const data = {
    gamesPlayed: gamesPlayed,
    wins: wins,
    bestScore: bestScore,
    totalPoints: totalPoints,
    historyLog: historyLog
  };
  localStorage.setItem("harvest_journal", JSON.stringify(data));
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.remove("hidden");
  }
}

function selectField(min, max, days, name) {
  minWeight = min;
  maxWeight = max;
  maxDays = days;
  daysLeft = days;
  currentFieldName = name;
  
  secretWeight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
  guesses = [];
  startTime = Date.now();

  document.getElementById("field-title").innerText = currentFieldName;
  document.getElementById("days-left").innerText = daysLeft;
  document.getElementById("game-message").innerText = `Guess the weight between ${minWeight} and ${maxWeight} lbs.`;
  document.getElementById("hint-box").classList.add("hidden");
  document.getElementById("guess-input").value = "";

  showScreen("game-screen");
}

function printHint(guess) {
  const diff = Math.abs(secretWeight - guess);
  let hintText = "";

  if (diff <= 2) {
    hintText = "Hint: Very hot! You are within 2 lbs.";
  } else if (diff <= 10) {
    hintText = "Hint: Getting warm! Within 10 lbs.";
  } else {
    hintText = "Hint: Cold! Far from the target.";
  }

  if (daysLeft <= Math.floor(maxDays / 2)) {
    const parity = (secretWeight % 2 === 0) ? "EVEN" : "ODD";
    hintText += `<br>Extra Hint: The weight is an <strong>${parity}</strong> number.`;
  }

  const hintBox = document.getElementById("hint-box");
  hintBox.innerHTML = hintText;
  hintBox.classList.remove("hidden");
}

function submitGuess() {
  const inputEl = document.getElementById("guess-input");
  const rawValue = inputEl.value.trim();
  const guess = parseInt(rawValue, 10);

  if (isNaN(guess)) {
    document.getElementById("game-message").innerText = "Please enter a valid number.";
    return;
  }

  if (guess < minWeight || guess > maxWeight) {
    document.getElementById("game-message").innerText = `Out of range! Guess between ${minWeight} and ${maxWeight} lbs.`;
    return;
  }

  guesses.push(guess);
  inputEl.value = "";

  if (guess === secretWeight) {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const roundScore = Math.max(0, (maxWeight - minWeight) * 10 + (daysLeft * 50) - (elapsedSeconds * 2));

    gamesPlayed++;
    wins++;
    totalPoints += roundScore;
    
    let isHighScore = false;
    if (roundScore > bestScore) {
      bestScore = roundScore;
      isHighScore = true;
    }

    historyLog.push(`WON - Target: ${secretWeight} lbs in ${guesses.length} tries (+${roundScore} pts)`);
    saveData();

    let winMsg = `🎉 YOU GOT IT! The crop weight was ${secretWeight} lbs!<br>`;
    winMsg += `Time taken: ${elapsedSeconds}s | Score: ${roundScore} pts (Total Points: ${totalPoints})`;
    if (isHighScore) winMsg += `<br><strong>⭐ New Best Single-Game Score! ⭐</strong>`;

    document.getElementById("game-message").innerHTML = winMsg;
    document.getElementById("hint-box").classList.add("hidden");
    setTimeout(() => showScreen("menu-screen"), 3500);
    return;
  }

  daysLeft--;
  document.getElementById("days-left").innerText = daysLeft;

  if (daysLeft <= 0) {
    gamesPlayed++;
    historyLog.push(`LOST - Target was ${secretWeight} lbs`);
    saveData();

    document.getElementById("game-message").innerText = `Out of days! The exact weight was ${secretWeight} lbs.`;
    document.getElementById("hint-box").classList.add("hidden");
    setTimeout(() => showScreen("menu-screen"), 3000);
    return;
  }

  const direction = (guess < secretWeight) ? "HEAVIER" : "LIGHTER";
  document.getElementById("game-message").innerText = `Too ${guess < secretWeight ? "light" : "heavy"}! The crop is ${direction}.`;
  printHint(guess);
}

function quitGame() {
  showScreen("menu-screen");
}

function showStats() {
  document.getElementById("stat-played").innerText = gamesPlayed;
  document.getElementById("stat-wins").innerText = wins;
  document.getElementById("stat-best").innerText = bestScore;
  document.getElementById("stat-total-points").innerText = totalPoints;

  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";

  if (historyLog.length === 0) {
    historyList.innerHTML = "<li>No games played yet.</li>";
  } else {
    historyLog.slice(-5).reverse().forEach(record => {
      const li = document.createElement("li");
      li.innerText = record;
      historyList.appendChild(li);
      
    });
  }

  showScreen("stats-screen");
}
