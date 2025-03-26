export interface WeatherData {
  temperature: number
  weathercode: number
  is_day: number
  temperature_max?: number
  temperature_min?: number
}

export interface SavedLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  created_at: string
  weather?: WeatherData
  isLoadingWeather?: boolean
}

export interface SearchResult {
  name: string
  country: string
  latitude: number
  longitude: number
}

