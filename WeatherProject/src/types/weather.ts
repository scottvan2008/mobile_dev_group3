export interface CurrentWeather {
  temperature: number
  weathercode: number
  windspeed: number
  winddirection: number
  time: string
  is_day: number
  precipitation: number
  humidity: number
  apparent_temperature: number
}

export interface DailyWeather {
  time: string[]
  weathercode: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  sunrise: string[]
  sunset: string[]
  precipitation_sum: number[]
  precipitation_probability_max: number[]
}

export interface HourlyWeather {
  time: string[]
  temperature_2m: number[]
  weathercode: number[]
  precipitation_probability: number[]
}

export interface WeatherData {
  current: CurrentWeather
  daily: DailyWeather
  hourly: HourlyWeather
  latitude: number
  longitude: number
}

export interface LocationData {
  name: string
  latitude: number
  longitude: number
}

export interface SearchResult {
  name: string
  country: string
  latitude: number
  longitude: number
}

export interface WeatherInfo {
  description: string
  icon: string
  gradient: readonly [string, string, ...string[]]
}

export interface SavedLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  created_at: string
  weather?: {
    temperature: number
    weathercode: number
    is_day: number
    temperature_max?: number
    temperature_min?: number
  }
  isLoadingWeather?: boolean
}

