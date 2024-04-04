import { fetchText } from "./fetchText.js";
import { saveResults, getAllResults } from "./storage.js";

let startTime;
let endTime;
const testDuration = 60; // 60 seconds for the test
let correctCharacters = 0,
    totalCharacters = 0,
    errors = 0;
let correctWords = 0;

let timerInterval;
const startBtn = document.getElementById("startBtn");
const textDisplay = document.getElementById("textDisplay");
const userInput = document.getElementById("user-input");
const wpmDisplay = document.getElementById("wpm");
const chpmDisplay = document.getElementById("chpm");
const mistsDisplay = document.getElementById("mists");
const accuracyDisplay = document.getElementById("accuracy");
const timeLeftDisplay = document.getElementById("timeLeft");

startBtn.addEventListener("click", async () => {
    const text = await fetchText();
    textDisplay.textContent = text;
    startTime = new Date();
    timerInterval = startTimer(testDuration);
    userInput.disabled = false;
    userInput.focus();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        startBtn.click();
    }
});
function startTimer(time) {
    let timeLeft = time;
    let intervalId = setInterval(() => {
        timeLeft--;
        timeLeftDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(intervalId);
            timeLeft = 0;
            timeLeftDisplay.textContent = "0";
            calculateResults();
        }
    }, 1000);
    return intervalId;
}

function calculateResults() {
    endTime = new Date();
    let elapsedTime = (endTime - startTime) / 1000;
    let originalText = textDisplay.textContent.trim();
    let userText = userInput.value.trim();

    for (let i = 0; i < userText.length; i++) {
        if (i < originalText.length) {
            totalCharacters++;

            if (userText[i] !== originalText[i]) {
                errors++;
            } else {
                correctCharacters++;
            }
        }
    }

    let originalWords = originalText.split(/\s+/);
    let userWords = userText.split(/\s+/);
    for (let i = 0; i < userWords.length; i++) {
        if (userWords[i] === originalWords[i]) {
            correctWords++;
        }
    }

    let cpm = correctCharacters;
    let accuracy = Math.round((correctCharacters / totalCharacters) * 100 || 0);
    let wpm = correctWords;

    wpmDisplay.textContent = wpm;
    chpmDisplay.textContent = cpm;
    mistsDisplay.textContent = errors;
    accuracyDisplay.textContent = `${accuracy}%`;
    userInput.disabled = true;

    saveResults({
        wpm: wpm,
        chpm: cpm,
        mists: errors,
        accuracy: accuracy,
        date: new Date().toLocaleString(),
    });
}

function resetTest() {
    clearInterval(timerInterval);
    startTime = null;
    endTime = null;
    correctCharacters = 0;
    totalCharacters = 0;
    errors = 0;
    textDisplay.textContent = "";
    userInput.value = "";
    wpmDisplay.textContent = "0";
    chpmDisplay.textContent = "0";
    mistsDisplay.textContent = "0";
    accuracyDisplay.textContent = "0%";
    timeLeftDisplay.textContent = "60";
    startTest();
}

const retryBtn = document.getElementById("retryBtn");
retryBtn.addEventListener("click", resetTest);

userInput.addEventListener("input", () => {
    let userText = userInput.value;
    let displayText = textDisplay.textContent;
    let highlightedText = "";

    for (let i = 0; i < displayText.length; i++) {
        if (i < userText.length && displayText[i] === userText[i]) {
            // Correct character, highlight in green
            highlightedText += `<span style="color: green;">${displayText[i]}</span>`;
        } else if (i < userText.length) {
            // Incorrect character, highlight in red
            highlightedText += `<span style="color:red;">${displayText[i]}</span>`;
        } else if (i < userText.length + 1) {
            highlightedText += `<span style="background-color: #ADD8E6;">${displayText[i]}</span>`;
        } else {
            // Unmatched character, display as is
            highlightedText += displayText[i];
        }
    }

    document.getElementById("textDisplay").innerHTML = highlightedText;
});

function compareLastTestWithLastResult(getAllResults) {
    if (!lastResult) return "This is the first test";

    let improvements = 0;
    let totalMetrics = 4;

    if (lastTest.wpm > lastResult.wpm) improvements++;
    if (lastTest.chpm > lastResult.chpm) improvements++;
    if (lastTest.mists < lastResult.mists) improvements++;
    if (lastTest.accuracy > lastResult.accuracy) improvements++;

    let progress = (improvements / totalMetrics) * 100;
    return `Progress : ${progress.toFixed(2)}%`;
}

function displayResultsTable(allResults) {
    const resultsTable = document.getElementById("resultsTable");
    resultsTable.innerHTML = ""; // clean to make new
    //add header
    const tableHeader = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = ["Date", "WPM", "CHPM", "Mists", "Accuracy"];
    headers.forEach((headerText) => {
        const headerCell = document.createElement("th");
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    tableHeader.appendChild(headerRow);
    resultsTable.appendChild(tableHeader);

    const recentResults = allResults.slice(-5);

    recentResults.forEach((result) => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = result.date;
        row.appendChild(dateCell);

        // WPM
        const wpmCell = document.createElement("td");
        wpmCell.textContent = result.wpm;
        row.appendChild(wpmCell);

        // CHPM
        const chpmCell = document.createElement("td");
        chpmCell.textContent = result.chpm;
        row.appendChild(chpmCell);

        // Mists
        const mistsCell = document.createElement("td");
        mistsCell.textContent = result.mists;
        row.appendChild(mistsCell);

        // Accuracy
        const accuracyCell = document.createElement("td");
        accuracyCell.textContent = `${result.accuracy}%`;
        row.appendChild(accuracyCell);

        resultsTable.appendChild(row);
    });
}
document.getElementById("showResultsBtn").addEventListener("click", () => {
    const allResults = getAllResults();
    displayResultsTable(allResults);
});

let resultsVisible = false; // State variable to track visibility of results

document.getElementById("showResultsBtn").addEventListener("click", () => {
    const allResults = getAllResults();
    const resultsTable = document.getElementById("resultsTable");
    const btn = document.getElementById("showResultsBtn");

    if (!resultsVisible) {
        displayResultsTable(allResults);
        btn.textContent = "Hide results";
        resultsTable.style.display = "table";
    } else {
        resultsTable.style.display = "none";
        btn.textContent = "Show 5 previous results";
    }

    resultsVisible = !resultsVisible;
});
