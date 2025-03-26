import { View, Text, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import type { DailyWeather } from "../../types/weather"
import { formatDate, formatTime } from "../../utils/weather"

interface DayDetailsProps {
  dailyWeather: DailyWeather
  selectedDay: number
}

export const DayDetails = ({ dailyWeather, selectedDay }: DayDetailsProps) => {
  if (selectedDay === null) return null

  return (
    <View style={styles.dayDetailsContainer}>
      <Text style={styles.dayDetailsTitle}>
        {selectedDay === 0 ? "Today" : formatDate(dailyWeather.time[selectedDay])}
      </Text>
      <View style={styles.dayDetailsContent}>
        <View style={styles.dayDetailItem}>
          <Icon name="weather-sunset-up" size={22} color="white" />
          <Text style={styles.dayDetailLabel}>Sunrise</Text>
          <Text style={styles.dayDetailValue}>{formatTime(dailyWeather.sunrise[selectedDay])}</Text>
        </View>
        <View style={styles.dayDetailItem}>
          <Icon name="weather-sunset-down" size={22} color="white" />
          <Text style={styles.dayDetailLabel}>Sunset</Text>
          <Text style={styles.dayDetailValue}>{formatTime(dailyWeather.sunset[selectedDay])}</Text>
        </View>
        <View style={styles.dayDetailItem}>
          <Icon name="water" size={22} color="white" />
          <Text style={styles.dayDetailLabel}>Precipitation</Text>
          <Text style={styles.dayDetailValue}>{dailyWeather.precipitation_sum[selectedDay]} mm</Text>
        </View>
        <View style={styles.dayDetailItem}>
          <Icon name="umbrella" size={22} color="white" />
          <Text style={styles.dayDetailLabel}>Chance of Rain</Text>
          <Text style={styles.dayDetailValue}>{dailyWeather.precipitation_probability_max[selectedDay]}%</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dayDetailValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

