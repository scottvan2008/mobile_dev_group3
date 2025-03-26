import { View, Text, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import type { CurrentWeather } from "@/types/weather"

interface WeatherDetailsProps {
  currentWeather: CurrentWeather
}

export function WeatherDetails({ currentWeather }: WeatherDetailsProps) {
  return (
    <View style={styles.weatherDetails}>
      <View style={styles.detailItem}>
        <Icon name="water-percent" size={22} color="white" />
        <Text style={styles.detailValue}>{currentWeather.humidity}%</Text>
        <Text style={styles.detailLabel}>Humidity</Text>
      </View>
      <View style={styles.detailItem}>
        <Icon name="weather-windy" size={22} color="white" />
        <Text style={styles.detailValue}>{currentWeather.windspeed} km/h</Text>
        <Text style={styles.detailLabel}>Wind</Text>
      </View>
      <View style={styles.detailItem}>
        <Icon name="water" size={22} color="white" />
        <Text style={styles.detailValue}>{currentWeather.precipitation} mm</Text>
        <Text style={styles.detailLabel}>Rain</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  weatherDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
  },
  detailItem: {
    alignItems: "center",
  },
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

