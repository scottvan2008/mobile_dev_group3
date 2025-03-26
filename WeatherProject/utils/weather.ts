import type { WeatherInfo } from "@/types/weather"

export function getWeatherInfo(code: number, isDay = 1): WeatherInfo {
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
    // ... other weather codes
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

  // Default fallback if code not found
  return (
    map[code] || {
      description: "Unknown",
      icon: "weather-cloudy",
      gradient: isDay ? (["#5C9CE5", "#48D1CC"] as const) : (["#2C3E50", "#4682B4"] as const),
    }
  )
}

export function formatTemperature(c: number, useCelsius = true) {
  return useCelsius ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

