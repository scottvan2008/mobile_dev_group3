"use client"
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  StatusBar,
  BackHandler,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../src/hooks/useAuth"
import { useWeather } from "../src/hooks/useWeather"
import { useLocationSearch } from "../src/hooks/useLocationSearch"
import { useLocationManagement } from "../src/hooks/useLocationManagement"
import { getWeatherInfo } from "../src/utils/weather"
import { Header } from "../src/components/weather/Header"
import { CurrentWeather } from "../src/components/weather/CurrentWeather"
import { DailyForecast } from "../src/components/weather/DailyForecast"
import { DayDetails } from "../src/components/weather/DayDetails"
import { SearchPanel } from "../src/components/weather/SearchPanel"
import { MapPanel } from "../src/components/weather/MapPanel"
import { AuthSection } from "../src/components/weather/AuthSection"
import type { LocationData } from "../src/types/weather"

export default function Index() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [prevCityData, setPrevCityData] = useState<LocationData | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [useCelsius, setUseCelsius] = useState(true)
  const [selectedDay, setSelectedDay] = useState(0)
  const [isViewingSavedLocation, setIsViewingSavedLocation] = useState(false)

  const searchAnimation = useRef(new Animated.Value(0)).current
  const mapAnimation = useRef(new Animated.Value(0)).current

  const { isSignedIn, username, initializing, userId, isProcessingAction, setIsProcessingAction, handleSignOut } =
    useAuth()

  const {
    weatherData,
    loadingWeather,
    errorMessage,
    currentLocation,
    setCurrentLocation,
    getWeatherForLocation,
    getLocationAndWeather,
  } = useWeather()

  const { searchQuery, setSearchQuery, searchResults, isSearching } = useLocationSearch()

  const { isLocationSaved, checkIfLocationSaved, saveCurrentLocation } = useLocationManagement(userId, isSignedIn)

  useEffect(() => {
    const onBackPress = () => {
      if (prevCityData) {
        setCurrentLocation(prevCityData)
        getWeatherForLocation(prevCityData.latitude, prevCityData.longitude)
        setPrevCityData(null)
        return true
      }
      if (router.canGoBack && router.canGoBack()) {
        router.back()
        return true
      }
      return false
    }
    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress)
    return () => backHandler.remove()
  }, [router, prevCityData])

  useEffect(() => {
    const hasLocationParams = params.latitude && params.longitude && params.locationName

    if (hasLocationParams && !isViewingSavedLocation) {
      setCurrentLocation({
        name: params.locationName as string,
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
      })
      setIsViewingSavedLocation(true)
      getWeatherForLocation(Number(params.latitude), Number(params.longitude))
    } else if (
      !hasLocationParams &&
      !currentLocation.name.includes("Loading") &&
      !currentLocation.name.includes("Default")
    ) {
      // Skip if we already have a location
    } else if (!hasLocationParams && !isViewingSavedLocation) {
      getLocationAndWeather()
    }
  }, [])

  useEffect(() => {
    if (isSignedIn && currentLocation.latitude !== 0 && currentLocation.longitude !== 0) {
      checkIfLocationSaved(currentLocation)
    }
  }, [isSignedIn, currentLocation])

  const toggleSearch = () => {
    if (isProcessingAction) return
    setIsProcessingAction(true)
    Animated.timing(searchAnimation, {
      toValue: showSearch ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowSearch(!showSearch)
      setIsProcessingAction(false)
    })
  }

  const toggleMap = () => {
    if (isProcessingAction) return
    setIsProcessingAction(true)
    Animated.timing(mapAnimation, {
      toValue: showMap ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowMap(!showMap)
      setIsProcessingAction(false)
    })
  }

  const selectLocation = (location: any) => {
    if (isProcessingAction) return

    setIsProcessingAction(true)
    if (!prevCityData) setPrevCityData(currentLocation)
    const newLoc = {
      name: `${location.name}, ${location.country}`,
      latitude: location.latitude,
      longitude: location.longitude,
    }
    setCurrentLocation(newLoc)
    getWeatherForLocation(location.latitude, location.longitude)
    setSearchQuery("")
    toggleSearch()
    setIsProcessingAction(false)
  }

  if (initializing)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FC3F7" />
        <Text style={styles.loadingText}>Initializing app...</Text>
      </View>
    )

  const currentWeatherInfo = weatherData?.current
    ? getWeatherInfo(weatherData.current.weathercode, weatherData.current.is_day)
    : { description: "Loading...", icon: "weather-cloudy", gradient: ["#87CEEB", "#48D1CC"] as const }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentWeatherInfo.gradient[0] }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
          <LinearGradient colors={[...currentWeatherInfo.gradient]} style={styles.gradientBackground}>
            <Header
              prevCityData={prevCityData}
              isViewingSavedLocation={isViewingSavedLocation}
              toggleSearch={toggleSearch}
              router={router}
              setPrevCityData={setPrevCityData}
              currentLocation={currentLocation}
              toggleMap={toggleMap}
              isSignedIn={isSignedIn}
              isLocationSaved={isLocationSaved}
              saveCurrentLocation={() => saveCurrentLocation(currentLocation)}
              useCelsius={useCelsius}
              setUseCelsius={setUseCelsius}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {loadingWeather ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="white" />
                  <Text style={styles.loadingText}>Loading weather data...</Text>
                </View>
              ) : errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : (
                weatherData && (
                  <>
                    <CurrentWeather weatherData={weatherData.current} useCelsius={useCelsius} />
                    <DailyForecast
                      dailyWeather={weatherData.daily}
                      selectedDay={selectedDay}
                      setSelectedDay={setSelectedDay}
                      useCelsius={useCelsius}
                    />
                    <DayDetails dailyWeather={weatherData.daily} selectedDay={selectedDay} />
                    <AuthSection
                      isSignedIn={isSignedIn}
                      username={username}
                      handleSignOut={handleSignOut}
                      isProcessingAction={isProcessingAction}
                      setIsProcessingAction={setIsProcessingAction}
                    />
                    <View style={styles.poweredByContainer}>
                      <Text style={styles.poweredByText}>Powered by Open-Meteo API</Text>
                      <Text style={styles.updatedText}>Last updated: {new Date().toLocaleTimeString()}</Text>
                    </View>
                  </>
                )
              )}
            </ScrollView>
            <SearchPanel
              showSearch={showSearch}
              searchAnimation={searchAnimation}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              searchResults={searchResults}
              toggleSearch={toggleSearch}
              selectLocation={selectLocation}
            />
            <MapPanel
              showMap={showMap}
              mapAnimation={mapAnimation}
              currentLocation={currentLocation}
              toggleMap={toggleMap}
              currentWeatherInfo={currentWeatherInfo}
            />
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
  scrollContent: { paddingBottom: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  errorContainer: { padding: 20, alignItems: "center" },
  errorText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  poweredByContainer: {
    marginTop: 20,
    alignItems: "center",
    paddingBottom: 20,
  },
  poweredByText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  updatedText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

