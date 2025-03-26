import type { WeatherInfo } from "../types/weather"

export const formatTemperature = (c: number, useCelsius = true) =>
  useCelsius ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  })

export const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

export const getWeatherInfo = (code: number, isDay = 1): WeatherInfo => {
  const map: { [key: number]: WeatherInfo } = {
    0: {
      description: "Clear sky",
      icon: isDay ? "weather-sunny" : "weather-night",
      gradient: isDay ? (["#4A90E2", "#48D1CC"] as const) : (["#1A237E", "#4FC3F7"] as const),
    },
    1: {
      description: "Mainly clear",
      icon: isDay ? "weather-partly-cloudy" : "weather-night-partly-cloudy",
      gradient: isDay ? (["#5C9CE5", "#00BFFF"] as const) : (["#1A237E", "#4FC3F7"] as const),
    },
    2: {
      description: "Partly cloudy",
      icon: isDay ? "weather-partly-cloudy" : "weather-night-partly-cloudy",
      gradient: isDay ? (["#5C9CE5", "#48D1CC"] as const) : (["#1A237E", "#4FC3F7"] as const),
    },
    3: {
      description: "Overcast",
      icon: "weather-cloudy",
      gradient: isDay ? (["#6E8EAE", "#87CEEB"] as const) : (["#2C3E50", "#34495E"] as const),
    },
    45: {
      description: "Fog",
      icon: "weather-fog",
      gradient: isDay ? (["#B0C4DE", "#D3D3D3"] as const) : (["#2F4F4F", "#708090"] as const),
    },
    48: {
      description: "Depositing rime fog",
      icon: "weather-fog",
      gradient: isDay ? (["#B0C4DE", "#D3D3D3"] as const) : (["#2F4F4F", "#708090"] as const),
    },
    51: {
      description: "Light drizzle",
      icon: "weather-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    53: {
      description: "Moderate drizzle",
      icon: "weather-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    55: {
      description: "Heavy drizzle",
      icon: "weather-pouring",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    56: {
      description: "Light freezing drizzle",
      icon: "weather-snowy-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    57: {
      description: "Heavy freezing drizzle",
      icon: "weather-snowy-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    61: {
      description: "Light rain",
      icon: "weather-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    63: {
      description: "Moderate rain",
      icon: "weather-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    65: {
      description: "Heavy rain",
      icon: "weather-pouring",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    66: {
      description: "Light freezing rain",
      icon: "weather-snowy-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    67: {
      description: "Heavy freezing rain",
      icon: "weather-snowy-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    71: {
      description: "Light snow",
      icon: "weather-snowy",
      gradient: isDay ? (["#B0C4DE", "#E0FFFF"] as const) : (["#2F4F4F", "#708090"] as const),
    },
    73: {
      description: "Moderate snow",
      icon: "weather-snowy",
      gradient: isDay ? (["#B0C4DE", "#E0FFFF"] as const) : (["#2F4F4F", "#708090"] as const),
    },
    75: {
      description: "Heavy snow",
      icon: "weather-snowy-heavy",
      gradient: isDay ? (["#B0C4DE", "#E0FFFF"] as const) : (["#2F4F4F", "#708090"] as const),
    },
    77: {
      description: "Snow grains",
      icon: "weather-snowy",
      gradient: isDay ? (["#B0C4DE", "#E0FFFF"] as const) : (["#2F4F4F", "#708090"] as const),
    },
    80: {
      description: "Light rain showers",
      icon: "weather-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    81: {
      description: "Moderate rain showers",
      icon: "weather-rainy",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    82: {
      description: "Heavy rain showers",
      icon: "weather-pouring",
      gradient: isDay ? (["#4682B4", "#87CEEB"] as const) : (["#2C3E50", "#4682B4"] as const),
    },
    85: {
      description: "Light snow showers",
      icon: "weather-snowy",
      gradient: isDay ? (["#B0C4DE", "#E0FFFF"] as const) : (["#2F4F4F", "#708090"] as const),
    },
    86: {
      description: "Heavy snow showers",
      icon: "weather-snowy-heavy",
      gradient: isDay ? (["#B0C4DE", "#E0FFFF"] as const) : (["#2F4F4F", "#708090"] as const),
    },
    95: {
      description: "Thunderstorm",
      icon: "weather-lightning",
      gradient: isDay ? (["#4A5568", "#718096"] as const) : (["#1A202C", "#2D3748"] as const),
    },
    96: {
      description: "Thunderstorm with light hail",
      icon: "weather-lightning-rainy",
      gradient: isDay ? (["#4A5568", "#718096"] as const) : (["#1A202C", "#2D3748"] as const),
    },
    99: {
      description: "Thunderstorm with heavy hail",
      icon: "weather-hail",
      gradient: isDay ? (["#4A5568", "#718096"] as const) : (["#1A202C", "#2D3748"] as const),
    },
  }
  return (
    map[code] || {
      description: "Unknown",
      icon: "weather-cloudy",
      gradient: isDay ? (["#5C9CE5", "#48D1CC"] as const) : (["#2C3E50", "#4682B4"] as const),
    }
  )
}

