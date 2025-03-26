"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Animated,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { supabase } from "../src/supabase"
import { useRouter } from "expo-router"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import * as Location from "expo-location"
import MapView, { Marker } from "react-native-maps"
import { LinearGradient } from "expo-linear-gradient"

interface WeatherData {
  temperature: number
  weathercode: number
  is_day: number
  temperature_max?: number
  temperature_min?: number
}
interface SavedLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  created_at: string
  weather?: WeatherData
  isLoadingWeather?: boolean
}
interface SearchResult {
  name: string
  country: string
  latitude: number
  longitude: number
}
interface WeatherInfo {
  description: string
  icon: string
  gradient: readonly [string, string, ...string[]]
}

export default function Locations() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(true)
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isProcessingAction, setIsProcessingAction] = useState(false)

  const mapAnim = useRef(new Animated.Value(0)).current
  const weatherRequestsInProgress = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        Alert.alert("Error", "Unable to fetch user data.")
        router.push("/")
        return
      }
      setUserId(userData.user.id)
      const { data, error } = await supabase
        .from("user_details")
        .select("first_name, last_name")
        .eq("uuid", userData.user.id)
        .single()
      if (error || !data) Alert.alert("Error", "Unable to fetch user details.")
      else setFullName(`${data.first_name} ${data.last_name}`)
      await fetchSavedLocations(userData.user.id)
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedLocations = async (uid: string) => {
    try {
      setLoadingLocations(true)
      const { data, error } = await supabase
        .from("saved_locations")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
      if (error) Alert.alert("Error", "Unable to fetch your saved locations.")
      else {
        const locs = (data || []).map((loc: any) => ({
          ...loc,
          isLoadingWeather: true,
        }))
        setSavedLocations(locs)
        if (locs.length) fetchWeatherForLocations(locs)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingLocations(false)
      setRefreshing(false)
    }
  }

  const fetchWeatherForLocations = async (locs: SavedLocation[]) => {
    const updated = [...locs]
    const batchSize = 2 // Reduce batch size

    for (let i = 0; i < updated.length; i += batchSize) {
      const batch = updated.slice(i, i + batchSize)
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const promises = batch.map(async (loc) => {
        try {
          const weather = await fetchWeatherForLocation(loc.latitude, loc.longitude)
          const idx = updated.findIndex((l) => l.id === loc.id)
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              weather: weather ?? undefined,
              isLoadingWeather: false,
            }
          }
        } catch (err) {
          console.error(err)
          const idx = updated.findIndex((l) => l.id === loc.id)
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              isLoadingWeather: false,
            }
          }
        }
      })

      await Promise.all(promises)
      setSavedLocations([...updated])
    }
  }

  const fetchWeatherForLocation = async (lat: number, lon: number): Promise<WeatherData | null> => {
    const requestKey = `${lat}-${lon}`
    if (weatherRequestsInProgress.current.has(requestKey)) {
      return null
    }

    weatherRequestsInProgress.current.add(requestKey)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
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
    } catch (e) {
      console.error(e)
      return null
    } finally {
      weatherRequestsInProgress.current.delete(requestKey)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    userId ? fetchSavedLocations(userId) : setRefreshing(false)
  }

  const handleLogout = async () => {
    if (isProcessingAction) return

    try {
      setIsProcessingAction(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        Alert.alert("Error", "Failed to sign out.")
        return
      }
      router.push("/")
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "An unexpected error occurred.")
    } finally {
      setIsProcessingAction(false)
    }
  }

  const toggleMap = (loc?: SavedLocation) => {
    setSelectedLocation(loc || null)
    Animated.timing(mapAnim, {
      toValue: showMap ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start()
    setShowMap(!showMap)
  }

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
      )
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setSearchResults(
        data.results
          ? data.results.map((r: any) => ({
              name: r.name,
              country: r.country,
              latitude: r.latitude,
              longitude: r.longitude,
            }))
          : [],
      )
    } catch (e) {
      console.error(e)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const saveLocation = async (loc: SearchResult) => {
    if (!userId || isProcessingAction) return

    try {
      setIsProcessingAction(true)
      const locName = `${loc.name}, ${loc.country}`

      const isDuplicate = savedLocations.some(
        (existingLoc) =>
          Math.abs(existingLoc.latitude - loc.latitude) < 0.01 &&
          Math.abs(existingLoc.longitude - loc.longitude) < 0.01,
      )

      if (isDuplicate) {
        Alert.alert("Duplicate Location", "This location is already in your saved locations.")
        return
      }

      const { error } = await supabase
        .from("saved_locations")
        .insert([
          {
            user_id: userId,
            name: locName,
            latitude: loc.latitude,
            longitude: loc.longitude,
          },
        ])
        .select()
      if (error) Alert.alert("Error", "Unable to save location.")
      else {
        Alert.alert("Success", `${locName} saved.`)
        fetchSavedLocations(userId)
        setSearchQuery("")
        setSearchResults([])
      }
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "Unexpected error.")
    } finally {
      setIsProcessingAction(false)
    }
  }

  const deleteLocation = async (locId: string) => {
    if (isProcessingAction) return

    try {
      setIsProcessingAction(true)
      const { error } = await supabase.from("saved_locations").delete().eq("id", locId)
      if (error) Alert.alert("Error", "Unable to delete location.")
      else if (userId) fetchSavedLocations(userId)
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "Unexpected error.")
    } finally {
      setIsProcessingAction(false)
    }
  }

  const viewWeather = (loc: SavedLocation) => {
    if (isProcessingAction) return

    setIsProcessingAction(true)
    router.push({
      pathname: "/",
      params: {
        latitude: loc.latitude.toString(),
        longitude: loc.longitude.toString(),
        locationName: loc.name,
      },
    })
    setTimeout(() => {
      setIsProcessingAction(false)
    }, 1000)
  }

  const getCurrentLocation = async () => {
    if (isProcessingAction) return

    try {
      setIsProcessingAction(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission required.")
        return
      }

      const loc = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = loc.coords

      const isDuplicate = savedLocations.some(
        (existingLoc) =>
          Math.abs(existingLoc.latitude - latitude) < 0.01 && Math.abs(existingLoc.longitude - longitude) < 0.01,
      )

      if (isDuplicate) {
        Alert.alert("Duplicate Location", "Your current location is already saved.")
        return
      }

      let locName = "Current Location"
      try {
        const rev = await Location.reverseGeocodeAsync({ latitude, longitude })
        if (rev && rev.length > 0) {
          const parts = []
          if (rev[0]?.city) parts.push(rev[0].city)
          if (rev[0]?.region && (!rev[0]?.city || rev[0].region !== rev[0].city)) {
            parts.push(rev[0].region)
          }
          if (rev[0]?.country) parts.push(rev[0].country)
          if (parts.length > 0) {
            locName = parts.join(", ")
          }
        }
      } catch (geoError) {
        console.error("Error in reverse geocoding:", geoError)
      }

      if (userId) {
        const { error } = await supabase
          .from("saved_locations")
          .insert([
            {
              user_id: userId,
              name: locName,
              latitude,
              longitude,
            },
          ])
          .select()

        if (error) Alert.alert("Error", "Unable to save your current location.")
        else {
          Alert.alert("Success", "Current location saved.")
          fetchSavedLocations(userId)
        }
      }
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "Unable to get your current location.")
    } finally {
      setIsProcessingAction(false)
    }
  }

  const getWeatherInfo = (code: number, isDay = 1): WeatherInfo => {
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

  const formatTemperature = (c: number) => `${Math.round(c)}°C`
  const mapPanelHeight = mapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Dimensions.get("window").height * 0.7],
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchLocations(searchQuery.trim())
      } else {
        setSearchResults([])
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const renderLocationItem = ({ item }: { item: SavedLocation }) => {
    const weatherInfo = item.weather ? getWeatherInfo(item.weather.weathercode, item.weather.is_day) : null

    return (
      <TouchableOpacity onPress={() => viewWeather(item)} style={styles.locationCardContainer}>
        {weatherInfo ? (
          <LinearGradient colors={[...weatherInfo.gradient]} style={styles.locationCard}>
            <View style={styles.locationCardContent}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation()
                    Alert.alert("Delete Location", `Delete ${item.name}?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", onPress: () => deleteLocation(item.id), style: "destructive" },
                    ])
                  }}
                >
                  <Icon name="delete" size={20} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              </View>

              <View style={styles.weatherInfo}>
                {item.isLoadingWeather ? (
                  <ActivityIndicator size="small" color="white" />
                ) : item.weather ? (
                  <View style={styles.weatherContent}>
                    <Icon name={weatherInfo.icon} size={32} color="white" style={styles.weatherIcon} />
                    <View style={styles.weatherDetails}>
                      <Text style={styles.weatherDescription}>{weatherInfo.description}</Text>
                      <View style={styles.temperatureRow}>
                        <Text style={styles.temperature}>{formatTemperature(item.weather.temperature)}</Text>
                        {item.weather.temperature_max !== undefined && item.weather.temperature_min !== undefined && (
                          <Text style={styles.tempRange}>
                            {formatTemperature(item.weather.temperature_min)} -{" "}
                            {formatTemperature(item.weather.temperature_max)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.weatherUnavailable}>Weather unavailable</Text>
                )}
              </View>
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.locationCard, { backgroundColor: "#4A90E2" }]}>
            <View style={styles.locationCardContent}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation()
                    Alert.alert("Delete Location", `Delete ${item.name}?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", onPress: () => deleteLocation(item.id), style: "destructive" },
                    ])
                  }}
                >
                  <Icon name="delete" size={20} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              </View>

              <View style={styles.weatherInfo}>
                {item.isLoadingWeather ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.weatherUnavailable}>Weather unavailable</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="map-marker-off" size={50} color="rgba(255,255,255,0.7)" />
      <Text style={styles.emptyStateText}>You haven't saved any locations yet.</Text>
      <Text style={styles.emptyStateSubtext}>Add locations to quickly access weather forecasts.</Text>
    </View>
  )

  const renderSearchResultItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.searchResultItem} onPress={() => saveLocation(item)}>
      <Icon name="map-marker" size={20} color="#666" />
      <View style={styles.searchResultTextContainer}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultCountry}>{item.country}</Text>
      </View>
      <Icon name="plus-circle" size={20} color="#4FC3F7" />
    </TouchableOpacity>
  )

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FC3F7" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    )

  const gradientColors = ["#4A90E2", "#48D1CC"] as const

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: gradientColors[0] }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
          <LinearGradient colors={[...gradientColors]} style={styles.gradientBackground}>
            <View style={styles.header}>
              <View>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.nameText}>{fullName}</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.homeButton} onPress={() => router.push("/")}>
                  <Icon name="home" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Icon name="logout" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.content}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Saved Locations</Text>
              </View>

              <View style={styles.searchInputContainer}>
                <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for a city to add..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="words"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                    <Icon name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              {isSearching ? (
                <View style={styles.searchResultsContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.searchingText}>Searching...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <View style={styles.searchResultsContainer}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => `${item.name}-${item.latitude}-${item.longitude}`}
                    renderItem={renderSearchResultItem}
                    style={styles.searchResultsList}
                  />
                </View>
              ) : searchQuery.length > 0 ? (
                <View style={styles.searchResultsContainer}>
                  <Text style={styles.noResultsText}>No locations found. Try a different search term.</Text>
                </View>
              ) : null}

              {loadingLocations ? (
                <ActivityIndicator style={styles.locationsLoading} color="white" />
              ) : (
                <FlatList
                  data={savedLocations}
                  keyExtractor={(item) => item.id}
                  renderItem={renderLocationItem}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  contentContainerStyle={styles.locationsList}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={renderEmptyState}
                  ListFooterComponent={
                    <View style={styles.appInfo}>
                      <Text style={styles.appInfoText}>Weather App v1.0</Text>
                      <Text style={styles.appInfoSubtext}>Powered by Open-Meteo API</Text>
                    </View>
                  }
                />
              )}
            </View>
            <Animated.View style={[styles.mapPanel, { height: mapPanelHeight }]}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{selectedLocation ? selectedLocation.name : "Location Map"}</Text>
                <TouchableOpacity onPress={() => toggleMap()}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {showMap && selectedLocation && (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                    }}
                    title={selectedLocation.name}
                  >
                    <View style={styles.markerContainer}>
                      <Icon name="map-marker" size={24} color="#4FC3F7" />
                    </View>
                  </Marker>
                </MapView>
              )}
              {showMap && selectedLocation && (
                <View style={styles.mapActions}>
                  <TouchableOpacity style={styles.mapActionButton} onPress={() => viewWeather(selectedLocation)}>
                    <Icon name="weather-partly-cloudy" size={20} color="white" />
                    <Text style={styles.mapActionText}>View Weather</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1 },
  gradientBackground: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EBF8FF",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#4A5568" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  homeButton: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 8,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  clearButton: { padding: 4 },
  searchResultsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    maxHeight: 200,
  },
  searchResultsList: {
    maxHeight: 180,
  },
  searchingText: {
    textAlign: "center",
    padding: 10,
    color: "#666",
  },
  noResultsText: {
    textAlign: "center",
    padding: 10,
    color: "#666",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchResultTextContainer: { flex: 1, marginLeft: 12 },
  searchResultName: { fontSize: 16, color: "#333" },
  searchResultCountry: { fontSize: 14, color: "#666" },
  locationsLoading: { marginTop: 20, alignSelf: "center" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: 30,
    marginTop: 10,
  },
  emptyStateText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 15,
    textAlign: "center",
  },
  emptyStateSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  locationsList: { paddingBottom: 20, flexGrow: 1 },
  locationCardContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  locationCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  locationCardContent: {
    padding: 14,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  locationName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    flex: 1,
    paddingRight: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  weatherInfo: {
    marginTop: 0,
  },
  weatherContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherIcon: {
    marginRight: 12,
  },
  weatherDetails: {
    flex: 1,
  },
  weatherDescription: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  temperatureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  temperature: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginRight: 8,
  },
  tempRange: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: "rgba(229, 62, 62, 0.3)",
    borderRadius: 20,
    padding: 8,
  },
  appInfo: { alignItems: "center", marginTop: 30, marginBottom: 20 },
  appInfoText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  appInfoSubtext: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  mapPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
    zIndex: 9,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  panelTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  map: { flex: 1 },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#4FC3F7",
  },
  mapActions: { padding: 16, borderTopWidth: 1, borderTopColor: "#eee" },
  mapActionButton: {
    backgroundColor: "#4FC3F7",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mapActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  weatherUnavailable: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontStyle: "italic",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

