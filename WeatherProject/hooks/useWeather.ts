"use client"

import { useState, useEffect, useRef } from "react"
import type { WeatherData, LocationData } from "@/types/weather"

export function useWeather(location: LocationData) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const weatherRequestRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchWeatherData(location.latitude, location.longitude)

    return () => {
      if (weatherRequestRef.current) {
        clearTimeout(weatherRequestRef.current)
      }
    }
  }, [location.latitude, location.longitude])

  const fetchWeatherData = async (lat: number, lon: number) => {
    if (weatherRequestRef.current) {
      clearTimeout(weatherRequestRef.current)
    }

    weatherRequestRef.current = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,is_day,precipitation,relative_humidity_2m,apparent_temperature&hourly=temperature_2m,weathercode,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max&timezone=auto`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
        const data = await response.json()
        if (!data.current || !data.daily || !data.hourly) throw new Error("Invalid weather data received")

        const weatherDataObj = {
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

        setWeatherData(weatherDataObj)
      } catch (error: unknown) {
        console.error("Error fetching weather data:", error)
        setError(error instanceof Error ? error.message || "Failed to load weather data" : "An unknown error occurred")
      } finally {
        setLoading(false)
        weatherRequestRef.current = null
      }
    }, 300)
  }

  return { weatherData, loading, error, refetch: () => fetchWeatherData(location.latitude, location.longitude) }
}

