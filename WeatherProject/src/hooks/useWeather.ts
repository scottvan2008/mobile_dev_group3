"use client"

import { useState, useRef } from "react"
import type { WeatherData, LocationData } from "../types/weather"
import { fetchWeatherData } from "../services/weatherService"
import * as Location from "expo-location"

export const useWeather = (initialLocation?: LocationData) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<LocationData>(
    initialLocation || { name: "Loading...", latitude: 0, longitude: 0 },
  )

  const weatherRequestRef = useRef<NodeJS.Timeout | null>(null)

  const getWeatherForLocation = async (lat: number, lon: number) => {
    if (weatherRequestRef.current) {
      clearTimeout(weatherRequestRef.current)
    }

    weatherRequestRef.current = setTimeout(async () => {
      try {
        setLoadingWeather(true)
        setErrorMessage(null)
        const data = await fetchWeatherData(lat, lon)
        setWeatherData(data)
      } catch (error: unknown) {
        console.error("Error fetching weather data:", error)
        setErrorMessage(
          error instanceof Error ? error.message || "Failed to load weather data" : "An unknown error occurred",
        )
      } finally {
        setLoadingWeather(false)
        weatherRequestRef.current = null
      }
    }, 300)
  }

  const getLocationAndWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMessage("Location permission denied. Using default location.")
        setCurrentLocation({
          name: "New York (Default)",
          latitude: 40.7128,
          longitude: -74.006,
        })
        return getWeatherForLocation(40.7128, -74.006)
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      try {
        const revGeo = await Location.reverseGeocodeAsync({ latitude, longitude })
        let locName = "Unknown Location"
        if (revGeo && revGeo.length > 0) {
          const parts = []
          if (revGeo[0]?.city) parts.push(revGeo[0].city)
          if (revGeo[0]?.region && (!revGeo[0]?.city || revGeo[0].region !== revGeo[0].city)) {
            parts.push(revGeo[0].region)
          }
          if (parts.length > 0) {
            locName = parts.join(", ")
          }
        }
        setCurrentLocation({ name: locName, latitude, longitude })
      } catch (geoError) {
        console.error("Error in reverse geocoding:", geoError)
        setCurrentLocation({ name: "Current Location", latitude, longitude })
      }
      getWeatherForLocation(latitude, longitude)
    } catch (error) {
      console.error("Error getting location:", error)
      setErrorMessage("Failed to get location. Using default location.")
      setCurrentLocation({
        name: "New York (Default)",
        latitude: 40.7128,
        longitude: -74.006,
      })
      getWeatherForLocation(40.7128, -74.006)
    }
  }

  return {
    weatherData,
    loadingWeather,
    errorMessage,
    currentLocation,
    setCurrentLocation,
    getWeatherForLocation,
    getLocationAndWeather,
  }
}

