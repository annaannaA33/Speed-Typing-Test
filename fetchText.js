async function fetchText() {
    try {
        const response = await fetch("https://poetrydb.org/random");
        const data = await response.json();
        const text = data[0].lines.join(" ");

        return text.substring(0, 500);
    } catch (error) {
        console.error("Error fetching text:", error);
        return "Error fetching text. Please try again.";
    }
}
export { fetchText };
