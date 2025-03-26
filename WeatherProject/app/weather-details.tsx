"use client"
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { LinearGradient } from "expo-linear-gradient"
import MapView, { Marker } from "react-native-maps"

interface CurrentWeather {
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
interface DailyWeather {
  time: string[]
  weathercode: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  sunrise: string[]
  sunset: string[]
  precipitation_sum: number[]
  precipitation_probability_max: number[]
}
interface HourlyWeather {
  time: string[]
  temperature_2m: number[]
  weathercode: number[]
  precipitation_probability: number[]
}
interface WeatherData {
  current: CurrentWeather
  daily: DailyWeather
  hourly: HourlyWeather
}
interface WeatherInfo {
  description: string
  icon: string
  gradient: readonly [string, string, ...string[]]
}

export default function WeatherDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [useCelsius, setUseCelsius] = useState(true)
  const [selectedDay, setSelectedDay] = useState(0)
  const [showMap, setShowMap] = useState(false)

  const mapAnimation = useRef(new Animated.Value(0)).current

  const latitude = Number.parseFloat(params.latitude as string)
  const longitude = Number.parseFloat(params.longitude as string)
  const locationName = params.locationName as string

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      setLoadingWeather(true)
      setErrorMessage(null)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,is_day,precipitation,relative_humidity_2m,apparent_temperature&hourly=temperature_2m,weathercode,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max&timezone=auto`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      const data = await response.json()
      if (!data.current || !data.daily || !data.hourly) throw new Error("Invalid weather data received")
      setWeatherData({
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
      })
    } catch (error: unknown) {
      console.error("Error fetching weather data:", error)
      setErrorMessage(
        error instanceof Error ? error.message || "Failed to load weather data" : "An unknown error occurred",
      )
    } finally {
      setLoadingWeather(false)
    }
  }

  const toggleMap = () => {
    Animated.timing(mapAnimation, {
      toValue: showMap ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start()
    setShowMap(!showMap)
  }

  const formatTemperature = (c: number) => (useCelsius ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`)
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      timeZone: "UTC",
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  const getWeatherInfo = (code: number, isDay = 1): WeatherInfo => {
    const map: { [key: number]: WeatherInfo } = {
      0: {
        description: "Clear sky",
        icon: isDay ? "weather-sunny" : "weather-night",
        gradient: isDay ? (["#87CEEB", "#48D1CC"] as const) : (["#1A237E", "#4FC3F7"] as const),
      },
      1: {
        description: "Mainly clear",
        icon: isDay ? "weather-partly-cloudy" : "weather-night-partly-cloudy",
        gradient: isDay ? (["#87CEEB", "#00BFFF"] as const) : (["#1A237E", "#4FC3F7"] as const),
      },
      2: {
        description: "Partly cloudy",
        icon: isDay ? "weather-partly-cloudy" : "weather-night-partly-cloudy",
        gradient: isDay ? (["#87CEEB", "#B0E0E6"] as const) : (["#1A237E", "#4FC3F7"] as const),
      },
      3: {
        description: "Overcast",
        icon: "weather-cloudy",
        gradient: ["#B0E0E6", "#87CEEB"] as const,
      },
      45: {
        description: "Fog",
        icon: "weather-fog",
        gradient: ["#B0BEC5", "#78909C"] as const,
      },
      48: {
        description: "Depositing rime fog",
        icon: "weather-fog",
        gradient: ["#B0BEC5", "#78909C"] as const,
      },
      51: {
        description: "Light drizzle",
        icon: "weather-rainy",
        gradient: ["#90CAF9", "#42A5F5"] as const,
      },
      53: {
        description: "Moderate drizzle",
        icon: "weather-rainy",
        gradient: ["#90CAF9", "#42A5F5"] as const,
      },
      55: {
        description: "Heavy drizzle",
        icon: "weather-pouring",
        gradient: ["#90CAF9", "#1E88E5"] as const,
      },
      56: {
        description: "Light freezing drizzle",
        icon: "weather-snowy-rainy",
        gradient: ["#BBDEFB", "#90CAF9"] as const,
      },
      57: {
        description: "Heavy freezing drizzle",
        icon: "weather-snowy-rainy",
        gradient: ["#BBDEFB", "#90CAF9"] as const,
      },
      61: {
        description: "Light rain",
        icon: "weather-rainy",
        gradient: ["#90CAF9", "#42A5F5"] as const,
      },
      63: {
        description: "Moderate rain",
        icon: "weather-rainy",
        gradient: ["#90CAF9", "#42A5F5"] as const,
      },
      65: {
        description: "Heavy rain",
        icon: "weather-pouring",
        gradient: ["#90CAF9", "#1E88E5"] as const,
      },
      66: {
        description: "Light freezing rain",
        icon: "weather-snowy-rainy",
        gradient: ["#BBDEFB", "#90CAF9"] as const,
      },
      67: {
        description: "Heavy freezing rain",
        icon: "weather-snowy-rainy",
        gradient: ["#BBDEFB", "#90CAF9"] as const,
      },
      71: {
        description: "Light snow",
        icon: "weather-snowy",
        gradient: ["#E1F5FE", "#B3E5FC"] as const,
      },
      73: {
        description: "Moderate snow",
        icon: "weather-snowy",
        gradient: ["#E1F5FE", "#B3E5FC"] as const,
      },
      75: {
        description: "Heavy snow",
        icon: "weather-snowy-heavy",
        gradient: ["#E1F5FE", "#81D4FA"] as const,
      },
      77: {
        description: "Snow grains",
        icon: "weather-snowy",
        gradient: ["#E1F5FE", "#B3E5FC"] as const,
      },
      80: {
        description: "Light rain showers",
        icon: "weather-rainy",
        gradient: ["#90CAF9", "#42A5F5"] as const,
      },
      81: {
        description: "Moderate rain showers",
        icon: "weather-rainy",
        gradient: ["#90CAF9", "#42A5F5"] as const,
      },
      82: {
        description: "Heavy rain showers",
        icon: "weather-pouring",
        gradient: ["#90CAF9", "#1E88E5"] as const,
      },
      85: {
        description: "Light snow showers",
        icon: "weather-snowy",
        gradient: ["#E1F5FE", "#B3E5FC"] as const,
      },
      86: {
        description: "Heavy snow showers",
        icon: "weather-snowy-heavy",
        gradient: ["#E1F5FE", "#81D4FA"] as const,
      },
      95: {
        description: "Thunderstorm",
        icon: "weather-lightning",
        gradient: ["#616161", "#424242"] as const,
      },
      96: {
        description: "Thunderstorm with light hail",
        icon: "weather-lightning-rainy",
        gradient: ["#616161", "#424242"] as const,
      },
      99: {
        description: "Thunderstorm with heavy hail",
        icon: "weather-hail",
        gradient: ["#616161", "#424242"] as const,
      },
    }
    return (
      map[code] || {
        description: "Unknown",
        icon: "weather-cloudy",
        gradient: ["#87CEEB", "#48D1CC"] as const,
      }
    )
  }
  const getCurrentHourlyWeather = () => {
    if (!weatherData) return []
    const now = new Date(),
      currentHour = now.getHours()
    const hourlyData: any[] = []
    let found = false,
      count = 0
    for (let i = 0; i < weatherData.hourly.time.length && count < 24; i++) {
      const hTime = new Date(weatherData.hourly.time[i])
      if (!found && hTime.getHours() === currentHour && hTime.getDate() === now.getDate()) found = true
      if (found) {
        hourlyData.push({
          time: weatherData.hourly.time[i],
          temperature: weatherData.hourly.temperature_2m[i],
          weathercode: weatherData.hourly.weathercode[i],
          precipitation_probability: weatherData.hourly.precipitation_probability[i],
        })
        count++
      }
    }
    return hourlyData
  }

  useEffect(() => {
    fetchWeatherData(latitude, longitude)
  }, [latitude, longitude])

  const currentWeatherInfo = weatherData?.current
    ? getWeatherInfo(weatherData.current.weathercode, weatherData.current.is_day)
    : {
        description: "Loading...",
        icon: "weather-cloudy",
        gradient: ["#87CEEB", "#48D1CC"] as const,
      }

  const mapPanelHeight = mapAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Dimensions.get("window").height * 0.7],
  })

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={[...currentWeatherInfo.gradient]} style={styles.gradientBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMap} style={styles.locationButton}>
            <Icon name="map-marker" size={20} color="white" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationName}
            </Text>
            <Icon name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setUseCelsius(!useCelsius)} style={styles.unitButton}>
            <Text style={styles.unitText}>{useCelsius ? "°C" : "°F"}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loadingWeather ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Loading weather data...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={50} color="white" />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchWeatherData(latitude, longitude)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            weatherData && (
              <>
                <View style={styles.currentWeather}>
                  <Icon name={currentWeatherInfo.icon} size={120} color="white" style={styles.weatherIcon} />
                  <Text style={styles.temperature}>{formatTemperature(weatherData.current.temperature)}</Text>
                  <Text style={styles.feelsLike}>
                    Feels like {formatTemperature(weatherData.current.apparent_temperature)}
                  </Text>
                  <Text style={styles.weatherDescription}>{currentWeatherInfo.description}</Text>
                  <View style={styles.weatherDetails}>
                    <View style={styles.detailItem}>
                      <Icon name="water-percent" size={22} color="white" />
                      <Text style={styles.detailValue}>{weatherData.current.humidity}%</Text>
                      <Text style={styles.detailLabel}>Humidity</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="weather-windy" size={22} color="white" />
                      <Text style={styles.detailValue}>{weatherData.current.windspeed} km/h</Text>
                      <Text style={styles.detailLabel}>Wind</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="water" size={22} color="white" />
                      <Text style={styles.detailValue}>{weatherData.current.precipitation} mm</Text>
                      <Text style={styles.detailLabel}>Rain</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>24-Hour Forecast</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hourlyContainer}
                  >
                    {getCurrentHourlyWeather().map((hour, index) => {
                      const hourInfo = getWeatherInfo(hour.weathercode)
                      const hourTime = new Date(hour.time)
                      const isNow = index === 0
                      return (
                        <View key={hour.time} style={[styles.hourlyItem, isNow && styles.currentHourItem]}>
                          <Text style={styles.hourlyTime}>{isNow ? "Now" : hourTime.getHours() + ":00"}</Text>
                          <Icon name={hourInfo.icon} size={24} color="white" />
                          <Text style={styles.hourlyTemp}>{formatTemperature(hour.temperature)}</Text>
                          {hour.precipitation_probability > 0 && (
                            <View style={styles.precipContainer}>
                              <Icon name="water" size={12} color="#E1F5FE" />
                              <Text style={styles.precipText}>{hour.precipitation_probability}%</Text>
                            </View>
                          )}
                        </View>
                      )
                    })}
                  </ScrollView>
                </View>
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>7-Day Forecast</Text>
                  <View style={styles.dailyContainer}>
                    {weatherData.daily.time.map((day, index) => {
                      const dayInfo = getWeatherInfo(weatherData.daily.weathercode[index])
                      const isToday = index === 0
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[styles.dailyItem, selectedDay === index && styles.selectedDayItem]}
                          onPress={() => setSelectedDay(index)}
                        >
                          <Text style={styles.dayName}>{isToday ? "Today" : formatDate(day).split(",")[0]}</Text>
                          <View style={styles.dailyIconContainer}>
                            <Icon name={dayInfo.icon} size={24} color="white" />
                            {weatherData.daily.precipitation_probability_max[index] > 30 && (
                              <Text style={styles.rainChance}>
                                {weatherData.daily.precipitation_probability_max[index]}%
                              </Text>
                            )}
                          </View>
                          <View style={styles.tempRange}>
                            <Text style={styles.maxTemp}>
                              {formatTemperature(weatherData.daily.temperature_2m_max[index]).replace("°C", "°")}
                            </Text>
                            <Text style={styles.minTemp}>
                              {formatTemperature(weatherData.daily.temperature_2m_min[index]).replace("°C", "°")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>
                {selectedDay !== null && (
                  <View style={styles.dayDetailsContainer}>
                    <Text style={styles.dayDetailsTitle}>
                      {selectedDay === 0 ? "Today" : formatDate(weatherData.daily.time[selectedDay])}
                    </Text>
                    <View style={styles.dayDetailsContent}>
                      <View style={styles.dayDetailItem}>
                        <Icon name="weather-sunset-up" size={22} color="white" />
                        <Text style={styles.dayDetailLabel}>Sunrise</Text>
                        <Text style={styles.dayDetailValue}>{formatTime(weatherData.daily.sunrise[selectedDay])}</Text>
                      </View>
                      <View style={styles.dayDetailItem}>
                        <Icon name="weather-sunset-down" size={22} color="white" />
                        <Text style={styles.dayDetailLabel}>Sunset</Text>
                        <Text style={styles.dayDetailValue}>{formatTime(weatherData.daily.sunset[selectedDay])}</Text>
                      </View>
                      <View style={styles.dayDetailItem}>
                        <Icon name="water" size={22} color="white" />
                        <Text style={styles.dayDetailLabel}>Precipitation</Text>
                        <Text style={styles.dayDetailValue}>{weatherData.daily.precipitation_sum[selectedDay]} mm</Text>
                      </View>
                      <View style={styles.dayDetailItem}>
                        <Icon name="umbrella" size={22} color="white" />
                        <Text style={styles.dayDetailLabel}>Chance of Rain</Text>
                        <Text style={styles.dayDetailValue}>
                          {weatherData.daily.precipitation_probability_max[selectedDay]}%
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                <View style={styles.poweredByContainer}>
                  <Text style={styles.poweredByText}>Powered by Open-Meteo API</Text>
                  <Text style={styles.updatedText}>Last updated: {new Date().toLocaleTimeString()}</Text>
                </View>
              </>
            )
          )}
        </ScrollView>
        <Animated.View style={[styles.mapPanel, { height: mapPanelHeight }]}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Location Map</Text>
            <TouchableOpacity onPress={toggleMap}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {showMap && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: latitude,
                  longitude: longitude,
                }}
                title={locationName}
                description={weatherData?.current ? currentWeatherInfo.description : "Loading..."}
              >
                <View style={styles.markerContainer}>
                  <Icon name={currentWeatherInfo.icon} size={24} color="#4FC3F7" />
                </View>
              </Marker>
            </MapView>
          )}
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  gradientBackground: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: { padding: 8 },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
    marginHorizontal: 8,
  },
  locationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  unitButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 8,
    minWidth: 40,
    alignItems: "center",
  },
  unitText: { color: "white", fontSize: 16, fontWeight: "bold" },
  scrollContent: { paddingBottom: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { color: "white", fontSize: 16, marginTop: 12 },
  errorContainer: { padding: 20, alignItems: "center" },
  errorText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  retryButtonText: { color: "white", fontWeight: "600" },
  currentWeather: { alignItems: "center", padding: 20 },
  weatherIcon: { marginBottom: 10 },
  temperature: { fontSize: 72, fontWeight: "bold", color: "white" },
  feelsLike: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  weatherDescription: { fontSize: 20, color: "white", marginTop: 8 },
  weatherDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
  },
  detailItem: { alignItems: "center" },
  detailValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  detailLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  sectionContainer: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  hourlyContainer: { paddingBottom: 8 },
  hourlyItem: {
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    minWidth: 70,
  },
  currentHourItem: { backgroundColor: "rgba(255,255,255,0.3)" },
  hourlyTime: { color: "white", fontSize: 14, marginBottom: 8 },
  hourlyTemp: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  precipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  precipText: { color: "#E1F5FE", fontSize: 12, marginLeft: 2 },
  dailyContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    overflow: "hidden",
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  selectedDayItem: { backgroundColor: "rgba(255,255,255,0.3)" },
  dayName: { color: "white", fontSize: 16, fontWeight: "500", width: 80 },
  dailyIconContainer: { flexDirection: "row", alignItems: "center" },
  rainChance: { color: "#E1F5FE", fontSize: 12, marginLeft: 4 },
  tempRange: { flexDirection: "row", width: 80, justifyContent: "flex-end" },
  maxTemp: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  minTemp: { color: "rgba(255,255,255,0.7)", fontSize: 16 },
  dayDetailsContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
  },
  dayDetailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  dayDetailsContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayDetailItem: { alignItems: "center", width: "48%", marginBottom: 16 },
  dayDetailLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  dayDetailValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
  },
  poweredByContainer: {
    marginTop: 20,
    alignItems: "center",
    paddingBottom: 20,
  },
  poweredByText: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  updatedText: { color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 4 },
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
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mapTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  map: { flex: 1 },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#4FC3F7",
  },
})

