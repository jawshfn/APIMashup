// API Keys
const openWeatherMapApiKey = "491269f346e95db500c682d855377422";
const rawgApiKey = "3e99314476234a0caec319e2d5d0eed7";

const searchButton = document.getElementById("search-button");
const locationInput = document.getElementById("location");
const gameSearchInput = document.getElementById("game-search");
const weatherContainer = document.getElementById("weather-container");
const gameContainer = document.getElementById("game-container");

// Event listener for search
searchButton.addEventListener("click", () => {
    const location = locationInput.value;
    const gameSearchQuery = gameSearchInput.value;

    if (location) {
        getWeatherForecast(location);
    }

    if (gameSearchQuery) {
        searchVideoGames(gameSearchQuery);
    }
});

// Fetch weather data from OpenWeatherMap API
async function getWeatherForecast(location) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${openWeatherMapApiKey}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        displayWeatherForecast(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Display the weather forecast
function displayWeatherForecast(weatherData) {
    const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
    const weatherHtml = `
        <h3>${weatherData.name}</h3>
        <img src="${weatherIconUrl}" alt="Weather icon">
        <p>Temperature: ${weatherData.main.temp}°C</p>
        <p>Weather: ${weatherData.weather[0].description}</p>
        <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
    `;
    weatherContainer.innerHTML = weatherHtml;
}

// Fetch video game data from RAWG Video Games API
async function searchVideoGames(query) {
    const apiUrl = `https://api.rawg.io/api/games?key=${rawgApiKey}&search=${query}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const gameDetailsPromises = data.results.map(async game => {
            return await fetchGameDetails(game.id);
        });
        const gameDetailsList = await Promise.all(gameDetailsPromises);
        displayVideoGameResults(gameDetailsList);
    } catch (error) {
        console.error("Error fetching video game data:", error);
    }
}

// Fetch individual game details from RAWG Video Games API
async function fetchGameDetails(gameId) {
    const apiUrl = `https://api.rawg.io/api/games/${gameId}?key=${rawgApiKey}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching game details:", error);
    }
}

// Display video game search results
function displayVideoGameResults(gameResults) {
    // Ensure there is not an existing sort element, remove if there is
    const existingSortSelect = document.getElementById("sort-select");
    if (existingSortSelect) {
        existingSortSelect.remove();
    }

    // Create new sort select element and add to page
    const sortSelect = document.createElement("select");
    sortSelect.id = "sort-select";
    sortSelect.innerHTML = `
        <option value="default">Sort by Rating</option>
        <option value="asc">Low to High</option>
        <option value="desc">High to Low</option>
    `;
    sortSelect.addEventListener("change", () => {
        const selectedOption = sortSelect.value;
        displaySortedVideoGameResults(gameResults, selectedOption);
    });
    gameContainer.insertAdjacentElement("beforebegin", sortSelect);

    // Display initial game results with default sorting
    displaySortedVideoGameResults(gameResults, "default");
}
// Function to display video game search results with sorting
function displaySortedVideoGameResults(gameResults, sortOption) {
    let sortedGames = gameResults.slice();
    if (sortOption === "asc") {
        sortedGames.sort((a, b) => a.rating - b.rating);
    } else if (sortOption === "desc") {
        sortedGames.sort((a, b) => b.rating - a.rating);
    }
    let gameHtml = "";
    for (const game of sortedGames) {
        const store = game.stores && game.stores.length > 0 ? game.stores[0].store.name : "Not available";
        const gameImage = game.background_image;
        gameHtml += `
            <div class="game-result">
                <div class="game-info">
                    <h3>${game.name}</h3>
                    <p>Release Date: ${game.released}</p>
                    <p>Rating: ${game.rating} / 5</p>
                    <p>Available Store: ${store}</p>
                </div>
                <div class="game-image">
                    <img src="${gameImage}" alt="${game.name}">
                </div>
            </div>
        `;
    }
    gameContainer.innerHTML = gameHtml;
}



