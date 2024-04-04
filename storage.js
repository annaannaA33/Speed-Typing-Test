export function saveResults(results) {
    const resultsKey = "typingTestResults";
    const storedResults = localStorage.getItem(resultsKey);
    let allResults = storedResults ? JSON.parse(storedResults) : [];
    if (Array.isArray(allResults)) {
        allResults.push(results);
        localStorage.setItem(resultsKey, JSON.stringify(allResults));
    } else {
        console.error("Error: allResults is not an array");
        localStorage.removeItem("userData");
    }
}

export function getAllResults() {
    const resultsKey = "typingTestResults";
    const storedResults = localStorage.getItem(resultsKey);
    try {
        return storedResults ? JSON.parse(storedResults) : [];
    } catch (error) {
        console.error("Error parsing stored results:", error);
        return [];
    }
}
