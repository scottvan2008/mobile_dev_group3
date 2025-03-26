import type { WeatherData } from "../types/weather"

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,is_day,precipitation,relative_humidity_2m,apparent_temperature&hourly=temperature_2m,weathercode,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max&timezone=auto`

  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

  const data = await response.json()
  if (!data.current || !data.daily || !data.hourly) throw new Error("Invalid weather data received")

  return {
    current: {
      temperature: data.current.temperature_2m,
      weathercode: data.current.weathercode,
      windspeed: data.current.windspeed_10m,
      winddirection: data.current.winddirection_10m,
      time: data.current.time,
      is_day: data.current.is_day,
      precipitation: data.current.precipitation,
      humidity: data.current.relative_humidity_2m,
      apparent_temperature: data.current.apparent_temperature,
    },
    daily: {
      time: data.daily.time,
      weathercode: data.daily.weathercode,
      temperature_2m_max: data.daily.temperature_2m_max,
      temperature_2m_min: data.daily.temperature_2m_min,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      precipitation_sum: data.daily.precipitation_sum,
      precipitation_probability_max: data.daily.precipitation_probability_max,
    },
    hourly: {
      time: data.hourly.time,
      temperature_2m: data.hourly.temperature_2m,
      weathercode: data.hourly.weathercode,
      precipitation_probability: data.hourly.precipitation_probability,
    },
    latitude: data.latitude,
    longitude: data.longitude,
  }
}

export const fetchLocationWeather = async (lat: number, lon: number) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
  )
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  const data = await res.json()

  return {
    temperature: data.current.temperature_2m,
    weathercode: data.current.weathercode,
    is_day: data.current.is_day,
    temperature_max: data.daily.temperature_2m_max[0],
    temperature_min: data.daily.temperature_2m_min[0],
  }
}

export const searchLocations = async (query: string) => {
  if (query.length < 2) return []

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
  )

  if (!res.ok) throw new Error("Search failed")
  const data = await res.json()

  return data.results
    ? data.results.map((r: any) => ({
        name: r.name,
        country: r.country,
        latitude: r.latitude,
        longitude: r.longitude,
      }))
    : []
}

