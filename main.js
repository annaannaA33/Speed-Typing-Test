import { fetchText } from "./fetchText.js";
import { saveResults, getAllResults } from "./storage.js";

let startTime;
let endTime;
const testDuration = 10; // 60 seconds for the test
let correctCharacters = 0;
let totalCharacters = 0;
let errors = 0;
let correctWords = 0;
let timerInterval;
const resetBtn = document.getElementById("resetBtn");
const textDisplay = document.getElementById("textDisplay");
const userInput = document.getElementById("user-input");
const wpmDisplay = document.getElementById("wpm");
const chpmDisplay = document.getElementById("chpm");
const mistsDisplay = document.getElementById("mists");
const accuracyDisplay = document.getElementById("accuracy");
const timeLeftDisplay = document.getElementById("timeLeft");

document.addEventListener("DOMContentLoaded", async () => {
    await startTest();
});

async function startTest() {
    resetTest(); // Reset previous results
    const text = await fetchText();
    textDisplay.textContent = text;
    userInput.disabled = false;
    userInput.focus();
    document.getElementById("result-previous").style.display = "block";
    document.getElementById("comparison").style.display = "block";
}

function resetTest() {
    clearInterval(timerInterval);
    startTime = null;
    endTime = null;
    correctCharacters = 0;
    totalCharacters = 0;
    errors = 0;
    correctWords = 0;
    wpmDisplay.textContent = "0";
    chpmDisplay.textContent = "0";
    mistsDisplay.textContent = "0";
    accuracyDisplay.textContent = "0%";
    timeLeftDisplay.textContent = testDuration;
    userInput.value = "";
    userInput.focus();
}

retryBtn.addEventListener("click", resetTest);

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        retryBtn.click();
    }
});

resetBtn.addEventListener("click", startTest);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        resetBtn.click();
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
        document.getElementById("result-previous").style.opacity = 1;
        document.getElementById("comparison").style.opacity = 1;
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
        wpm,
        chpm: cpm,
        mists: errors,
        accuracy,
        date: new Date().toLocaleString(),
    });
}

userInput.addEventListener("input", () => {
    if (!startTime) {
        startTime = new Date();
        timerInterval = startTimer(testDuration);
    }

    let userText = userInput.value;
    let displayText = textDisplay.textContent;
    let highlightedText = "";
    document.getElementById("result-previous").style.opacity = 0;
    document.getElementById("comparison").style.opacity = 0;

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

document.addEventListener("DOMContentLoaded", async () => {
    await displayPreviousResults();
});

async function displayPreviousResults() {
    const previousResults = getPreviousResults();
    const resultPreviousDiv = document.getElementById("result-previous");

    // Update div with previous results
    resultPreviousDiv.querySelector("#wpm").textContent = previousResults.wpm;
    resultPreviousDiv.querySelector("#chpm").textContent = previousResults.chpm;
    resultPreviousDiv.querySelector("#mists").textContent =
        previousResults.mists;
    resultPreviousDiv.querySelector(
        "#accuracy"
    ).textContent = `${previousResults.accuracy}%`;
}

function getPreviousResults() {
    // get data from getAllResults()
    const allResults = getAllResults();

    // previous result is before the current one
    const previousResultIndex = allResults.length - 1;

    if (previousResultIndex >= 0) {
        return allResults[previousResultIndex];
    } else {
        // If there are no previous results, return empty
        return {
            wpm: 0,
            chpm: 0,
            mists: 0,
            accuracy: 0,
        };
    }
}

function compareResults() {
    const currentResults = {
        wpm: parseInt(
            document.getElementById("results").querySelector("#wpm").textContent
        ),
        chpm: parseInt(
            document.getElementById("results").querySelector("#chpm")
                .textContent
        ),
        mists: parseInt(
            document.getElementById("results").querySelector("#mists")
                .textContent
        ),
        accuracy: parseInt(
            document
                .getElementById("results")
                .querySelector("#accuracy")
                .textContent.replace("%", "")
        ),
    };

    const previousResults = {
        wpm: parseInt(
            document.getElementById("result-previous").querySelector("#wpm")
                .textContent
        ),
        chpm: parseInt(
            document.getElementById("result-previous").querySelector("#chpm")
                .textContent
        ),
        mists: parseInt(
            document.getElementById("result-previous").querySelector("#mists")
                .textContent
        ),
        accuracy: parseInt(
            document
                .getElementById("result-previous")
                .querySelector("#accuracy")
                .textContent.replace("%", "")
        ),
    };

    // Calculate change for each metric
    const wpmChange = currentResults.wpm - previousResults.wpm;
    const chpmChange = currentResults.chpm - previousResults.chpm;
    const mistsChange = currentResults.mists - previousResults.mists;
    const accuracyChange = currentResults.accuracy - previousResults.accuracy;

    // Show change in div with id "comparison"
    const comparisonDiv = document.getElementById("comparison");

    let wpmChangeText, chpmChangeText, mistsChangeText, accuracyChangeText;

    if (wpmChange === 0) {
        wpmChangeText = "No change";
    } else if (currentResults.wpm > previousResults.wpm) {
        wpmChangeText = "Improved by " + wpmChange + " words per minute";
    } else {
        wpmChangeText =
            "Worsened by " + Math.abs(wpmChange) + " words per minute";
    }

    if (chpmChange === 0) {
        chpmChangeText = "No change";
    } else if (currentResults.chpm > previousResults.chpm) {
        chpmChangeText = "Improved by " + chpmChange + " characters per minute";
    } else {
        chpmChangeText =
            "Worsened by " + Math.abs(chpmChange) + " characters per minute";
    }

    if (mistsChange === 0) {
        mistsChangeText = "No change";
    } else if (currentResults.mists > previousResults.mists) {
        mistsChangeText = "Decreased by " + mistsChange + " mistakes";
    } else {
        mistsChangeText = "Increased by " + Math.abs(mistsChange) + " mistakes";
    }

    if (accuracyChange === 0) {
        accuracyChangeText = "No change";
    } else if (currentResults.accuracy > previousResults.accuracy) {
        accuracyChangeText = "Improved by " + accuracyChange + "%";
    } else {
        accuracyChangeText = "Worsened by " + Math.abs(accuracyChange) + "%";
    }

    comparisonDiv.innerHTML = `
    <p>WPM: ${wpmChangeText}</p>
    <p>CPM: ${chpmChangeText}</p>
    <p>MIST: ${mistsChangeText}</p>
    <p>ACCURACY: ${accuracyChangeText}</p>
`;
}

document.addEventListener("DOMContentLoaded", async () => {
    compareResults();
});
