
---

# 🌤️ Simple Weather Viewer

<div align="center">
  <img width="45%" alt="Weather App Screenshot 1" src="https://github.com/user-attachments/assets/3c833ba4-5c56-4b0e-9f4f-98af6f51e5b4" />
  <img width="45%" alt="Weather App Screenshot 2" src="https://github.com/user-attachments/assets/8de5814c-e382-4afb-9a91-4b7e019a1581" />
</div>

---

## 📖 Project Description

**Simple Weather Viewer** is a responsive **single-page application (SPA)** built with **React + TypeScript**.
It fetches and displays **current weather conditions** and a **5-day forecast** for any city worldwide using the **OpenWeatherMap API**.

This project demonstrates:

* Effective **state management**
* **API consumption** best practices
* **Responsive UI design**

---

## ✨ Core Features

* 🔎 **Search Functionality** – Enter any city to retrieve current and forecasted weather.
* 🌡️ **Real-time Data Display** – Shows temperature, condition (e.g., *Clear, Clouds*), humidity, and wind speed.
* 🔄 **User Feedback** – Loading indicators during fetch and clear error messages (e.g., *City not found*).
* 💾 **Persistence (Bonus)** – Last searched city is saved via `localStorage` and auto-loaded on revisit.
* 📅 **5-Day Forecast (Bonus)** – Integrated forecast view alongside current conditions.

---

## ⚙️ Setup and Running the Application

### ✅ Prerequisites

* [Node.js](https://nodejs.org/) and npm installed

### 📦 Installation

```bash
# Clone the repository
git clone PankajAgarwalS/weather_app
cd weather_app

# Install dependencies
npm install
```

### 🔑 API Key Configuration (Crucial)

1. Get a **free API key** from [OpenWeatherMap](https://openweathermap.org/api).
2. Create a `.env` file in the project root.
3. Add your key:

   ```env
   VITE_OPENWEATHER_API_KEY="YOUR_PERSONAL_OPENWEATHERMAP_KEY_HERE"
   ```

⚠️ This file is excluded from Git via `.gitignore` for security.

### 🚀 Running the App

```bash
npm run dev
```

---

## 🧪 Testing and Verification

| **Test Case**        | **Steps**                        | **Expected Outcome**                      |
| -------------------- | -------------------------------- | ----------------------------------------- |
| ✅ Successful Search  | Enter *Tokyo* and search         | Shows current + 5-day forecast            |
| ❌ City Not Found     | Enter gibberish (e.g., *xyz123*) | Error message: *City 'xyz123' not found.* |
| ⏳ Loading Indicator  | Search for any city              | Spinner/loading message briefly visible   |
| 💾 Last City (Bonus) | Search, refresh the page         | Last searched city auto-loads             |

---

## 🛠️ Technical Decisions & Assumptions

### 🔧 Technology Stack

* **Frontend**: React + TypeScript
* **State Management**: `useState` + custom hook `useWeather`
* **Styling**: Custom modular **CSS** (no Tailwind for broader compatibility)

### 🎨 Design Choices

* **API Key Security** – Uses `VITE_OPENWEATHER_API_KEY` env variable (never committed to Git).
* **Clear Error Messaging** – Specific handling (e.g., 404) with user-friendly messages.
* **Data Modeling** – Strong typing with interfaces (`WeatherData`, `WeatherState`).


---

## 📜 License

This project is licensed under the **MIT License** – feel free to use and modify.

---
