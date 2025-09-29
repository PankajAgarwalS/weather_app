import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./styles.css"; // Import the stylesheet for custom CSS classes

// 1. Data Models and Constants

// Note: Replace the .env file with a openweatherapi_key.
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"; // For 5-day forecast

// Represents the core weather data

interface CurrentWeatherData {
  city: string;
  country: string;
  temperature: number;
  condition: string;
  humidity: number;
  iconCode: string;
  windSpeed: number;
}

interface ForecastItem {
  timestamp: number;
  day: string;
  temp: number;
  iconCode: string;
}

// Represents the overall application state

interface WeatherState {
  currentData: CurrentWeatherData | null;
  forecastData: ForecastItem[];
  loading: boolean;
  error: string | null;
  lastCity: string | null;
}

// 2. Custom Hook for State Management and Fetching

const initialWeatherState: WeatherState = {
  currentData: null,
  forecastData: [],
  loading: false,
  error: null,
  // Bonus Feature: Load last city from storage
  lastCity: localStorage.getItem("lastCity") || null,
};

const mapCurrentData = (json: any): CurrentWeatherData => ({
  city: json.name,
  country: json.sys.country,
  temperature: Math.round(json.main.temp), // Round to nearest integer
  condition: json.weather[0].main,
  humidity: json.main.humidity,
  iconCode: json.weather[0].icon,
  windSpeed: json.wind.speed,
});

/** Helper to map 5-day forecast data */
const mapForecastData = (json: any): ForecastItem[] => {
  // OpenWeatherMap returns data every 3 hours. We pick one reading per day (e.g., around 12 PM).
  const forecastMap = new Map<string, ForecastItem>();

  // Day formatting helper
  const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

  json.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split("T")[0];
    const hour = date.getHours();

    if (!forecastMap.has(dayKey) || (hour >= 11 && hour <= 13)) {
      forecastMap.set(dayKey, {
        timestamp: item.dt,
        day: dayFormatter.format(date),
        temp: Math.round(item.main.temp),
        iconCode: item.weather[0].icon,
      });
    }
  });

  const todayKey = new Date().toISOString().split("T")[0];
  const forecastArray = Array.from(forecastMap.values());

  // Only return the next 5 days
  return forecastArray
    .filter((item) => {
      const itemDateKey = new Date(item.timestamp * 1000)
        .toISOString()
        .split("T")[0];
      return itemDateKey !== todayKey;
    })
    .slice(0, 5);
};

const useWeather = () => {
  const [state, setState] = useState<WeatherState>(initialWeatherState);

  const fetchWeather = useCallback(async (city: string) => {
    // 1. Reset state and show loading indicator
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      forecastData: [],
    }));

    if (!API_KEY || API_KEY === "YOUR_OPENWEATHERMAP_API_KEY_HERE") {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Please set a valid OpenWeatherMap API Key in the code.",
      }));
      return;
    }

    try {
      // --- Fetch Current Weather ---
      const currentResponse = await fetch(
        `${CURRENT_WEATHER_URL}?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!currentResponse.ok) {
        // Log key for debugging if it's the 401 error
        if (currentResponse.status === 401) {
          console.log(
            `DEBUG: API Key loaded (first 4 chars): ${API_KEY.substring(0, 4)}`
          );
          throw new Error(
            "Invalid API Key (HTTP 401). Please ensure your OpenWeatherMap key is correct and fully activated (this can take a few minutes after generation)."
          );
        }
        if (currentResponse.status === 404) {
          throw new Error(`City "${city}" not found.`);
        }
        throw new Error(
          `Failed to fetch current weather data. HTTP Status: ${currentResponse.status}`
        );
      }

      const currentJson = await currentResponse.json();
      const currentData = mapCurrentData(currentJson);

      // --- Fetch 5-Day Forecast (Bonus) ---
      const forecastResponse = await fetch(
        `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`
      );
      let forecastData: ForecastItem[] = [];

      if (forecastResponse.ok) {
        const forecastJson = await forecastResponse.json();
        forecastData = mapForecastData(forecastJson);
      } else {
        console.warn(
          `Could not fetch 5-day forecast (Status: ${forecastResponse.status})`
        );
      }

      // 4. Update state (success) and save last city (Bonus)
      localStorage.setItem("lastCity", city);

      setState({
        currentData,
        forecastData,
        loading: false,
        error: null,
        lastCity: city,
      });
    } catch (err) {
      // 5. Update state (error)
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []); // Empty dependency array means this function is created once

  // Bonus Feature: Fetch last city on initial load
  useEffect(() => {
    if (state.lastCity && !state.currentData && !state.error) {
      fetchWeather(state.lastCity);
    }
  }, [state.lastCity, state.currentData, state.error, fetchWeather]);

  return { ...state, fetchWeather };
};

// 3. Components

/** Helper to get the icon URL */
const getIconUrl = (iconCode: string) =>
  `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

// --- SearchBar Component ---
const SearchBar: React.FC<{
  onSearch: (city: string) => void;
  lastCity: string | null;
}> = ({ onSearch, lastCity }) => {
  const [input, setInput] = useState(lastCity || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        placeholder="Enter city name..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">
        <i className="fas fa-search"></i>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: "18px", height: "18px" }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </form>
  );
};

// --- WeatherDisplay Component ---
const WeatherDisplay: React.FC<{ data: CurrentWeatherData }> = ({ data }) => {
  return (
    <div className="weather-card">
      <div className="weather-header">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {data.city}, {data.country}
          </h2>
          <p className="text-gray-500">{data.condition}</p>
        </div>
        <img
          src={getIconUrl(data.iconCode)}
          alt={data.condition}
          className="weather-icon"
        />
      </div>

      <p className="detail-value text-7xl font-extrabold text-indigo-700">
        {data.temperature}°C
      </p>

      <div className="weather-details">
        <div className="detail-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-indigo-500"
          >
            <path d="M12 2a10 10 0 0 0 9.54 6.78A6.87 6.87 0 0 1 12 21a6.87 6.87 0 0 1-9.54-14.22A10 10 0 0 0 12 2z"></path>
          </svg>
          <div>
            <span className="detail-label">Humidity</span>
            <p className="detail-value text-2xl">{data.humidity}%</p>
          </div>
        </div>
        <div className="detail-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-indigo-500"
          >
            <path d="M7 21v-3H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h15l4 4-4 4h-4v3a2 2 0 0 1-2 2H7z"></path>
          </svg>
          <div>
            <span className="detail-label">Wind</span>
            <p className="detail-value text-2xl">{data.windSpeed} km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ForecastDisplay Component ---
const ForecastDisplay: React.FC<{ data: ForecastItem[] }> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="forecast-section">
      <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
        5-Day Forecast
      </h3>
      <div className="forecast-grid">
        {data.map((item) => (
          <div key={item.timestamp} className="forecast-item">
            <p className="forecast-day">{item.day}</p>
            <img
              src={getIconUrl(item.iconCode)}
              alt="forecast icon"
              style={{ width: "40px", height: "40px", margin: "0 auto" }}
            />
            <p className="forecast-temp">{item.temp}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- App Component (Main Container) ---
const App: React.FC = () => {
  const { currentData, forecastData, loading, error, fetchWeather, lastCity } =
    useWeather();

  // Memoize the prompt based on the state
  const promptMessage = useMemo(() => {
    if (!currentData && !loading && !error && lastCity) {
      return `Weather for the last searched city (${lastCity}) is loading...`;
    }
    if (!currentData && !loading && !error) {
      return "Enter a city above to get the current weather and 5-day forecast.";
    }
    return null;
  }, [currentData, loading, error, lastCity]);

  return (
    <div className="weather-container">
      <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
        Simple Weather Viewer
      </h1>

      <SearchBar onSearch={fetchWeather} lastCity={lastCity} />

      {/* Core Feature: Loading Indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Fetching weather data...</p>
        </div>
      )}

      {/* Core Feature: Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Initial Prompt Message */}
      {promptMessage && !loading && (
        <div className="default-prompt">
          <p>{promptMessage}</p>
        </div>
      )}

      {/* Core Feature: Weather Data Display */}
      {currentData && !loading && <WeatherDisplay data={currentData} />}

      {/* Bonus Feature: 5-Day Forecast */}
      {forecastData.length > 0 && !loading && (
        <ForecastDisplay data={forecastData} />
      )}
    </div>
  );
};

export default App;
