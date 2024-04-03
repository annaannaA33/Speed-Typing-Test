import { fetchText } from "./fetchText.js";
import { saveResults, getAllResults } from "./storage.js";

let startTime,
    endTime,
    testDuration = 60; // 60 seconds for the test
let correctCharacters = 0,
    totalCharacters = 0,
    errors = 0;
let correctWords = 0;

let timerInterval;
const startBtn = document.getElementById("startBtn");
//const resetBtn = document.getElementById("resetBtn");
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
            console.log(`totalCharacters ${totalCharacters}`);
            if (userText[i] !== originalText[i]) {
                errors++;
                console.log(`errors ${errors}`);
            } else {
                correctCharacters++;
                console.log(`correctCharacters ${correctCharacters}`);
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
            highlightedText += `<span style="text-shadow: 1px 1px 2px rgba(2, 115, 115, 0.8); color: white;">${displayText[i]}</span>`;
        } else if (i < userText.length) {
            // Incorrect character, highlight in red
            highlightedText += `<span style="text-shadow: 1px 1px 2px rgba(115, 51, 0, 0.8); color: white;">${displayText[i]}</span>`;
        } else if (i < userText.length + 1) {
            highlightedText += `<span style="font-weight: bold;">${displayText[i]}</span>`;
        } else {
            // Unmatched character, display as is
            highlightedText += displayText[i];
        }
    }

    document.getElementById("textDisplay").innerHTML = highlightedText;
});

// Display previous results when page loads
document.addEventListener("DOMContentLoaded", () => {
    const lastResult = document.getElementById("lastResult");
    const resultsList = document.getElementById("resultsList");
    // get all results from localStorage
    const allResults = getAllResults();
    // If there are saved results

    if (allResults.length === 0) {
        // If there are no results

        lastResult.textContent = "No results available.";
        // Формируем строку с данными последнего результата
        const lastResultText = `WPM: ${lastResultObj.wpm}, CHPM: ${lastResultObj.chpm}, Mists: ${lastResultObj.mists}, Accuracy: ${lastResultObj.accuracy}%`;
        lastResult.textContent = lastResultText;
        return; //Terminate the function so you don't have to continue processing an empty list
    }

    const showResultsBtn = document.getElementById("showResultsBtn");
    // Add a button click event listener

    showResultsBtn.addEventListener("click", () => {
        // Clear the previous list of results, if any

        resultsList.innerHTML = "";
        // Getting the last 5 results

        const allResults = getAllResults();
        if (Array.isArray(allResults)) {
            const recentResults = allResults.slice(-5);
            // For each result, create a list element and add it to the list

            recentResults.forEach((result) => {
                const listItem = document.createElement("li");
                listItem.textContent = `WPM: ${result.wpm}, CHPM: ${result.chpm}, Mists: ${result.mists}, Accuracy: ${result.accuracy}% date: ${result.date}`;
                resultsList.appendChild(listItem);
            });
        } else {
            console.error("Error: allResults is not an array");
        }
    });
});
