import { View, Text, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import type { CurrentWeather as CurrentWeatherType } from "../../types/weather"
import { formatTemperature } from "../../utils/weather"
import { getWeatherInfo } from "../../utils/weather"

interface CurrentWeatherProps {
  weatherData: CurrentWeatherType
  useCelsius: boolean
}

export const CurrentWeather = ({ weatherData, useCelsius }: CurrentWeatherProps) => {
  const weatherInfo = getWeatherInfo(weatherData.weathercode, weatherData.is_day)

  return (
    <View style={styles.currentWeather}>
      <Icon name={weatherInfo.icon} size={120} color="white" style={styles.weatherIcon} />
      <Text style={styles.temperature}>{formatTemperature(weatherData.temperature, useCelsius)}</Text>
      <Text style={styles.feelsLike}>Feels like {formatTemperature(weatherData.apparent_temperature, useCelsius)}</Text>
      <Text style={styles.weatherDescription}>{weatherInfo.description}</Text>
      <View style={styles.weatherDetails}>
        <View style={styles.detailItem}>
          <Icon name="water-percent" size={22} color="white" />
          <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
          <Text style={styles.detailLabel}>Humidity</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="weather-windy" size={22} color="white" />
          <Text style={styles.detailValue}>{weatherData.windspeed} km/h</Text>
          <Text style={styles.detailLabel}>Wind</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="water" size={22} color="white" />
          <Text style={styles.detailValue}>{weatherData.precipitation} mm</Text>
          <Text style={styles.detailLabel}>Rain</Text>
        </View>
      </View>
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
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

