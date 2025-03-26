import { View, Text, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import type { WeatherInfo } from "@/types/weather"

interface WeatherCardProps {
  temperature: number
  weatherInfo: WeatherInfo
  description: string
  useCelsius?: boolean
  apparentTemperature?: number
}

export function WeatherCard({
  temperature,
  weatherInfo,
  description,
  useCelsius = true,
  apparentTemperature,
}: WeatherCardProps) {
  const formatTemperature = (c: number) => (useCelsius ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`)

  return (
    <View style={styles.currentWeather}>
      <Icon name={weatherInfo.icon} size={120} color="white" style={styles.weatherIcon} />
      <Text style={styles.temperature}>{formatTemperature(temperature)}</Text>
      {apparentTemperature && <Text style={styles.feelsLike}>Feels like {formatTemperature(apparentTemperature)}</Text>}
      <Text style={styles.weatherDescription}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  currentWeather: { alignItems: "center", padding: 20 },
  weatherIcon: { marginBottom: 10 },
  temperature: {
    fontSize: 72,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  feelsLike: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  weatherDescription: {
    fontSize: 20,
    color: "white",
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
})

