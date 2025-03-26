import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import type { DailyWeather } from "../../types/weather"
import { formatDate, formatTemperature, getWeatherInfo } from "../../utils/weather"

interface DailyForecastProps {
  dailyWeather: DailyWeather
  selectedDay: number
  setSelectedDay: (day: number) => void
  useCelsius: boolean
}

export const DailyForecast = ({ dailyWeather, selectedDay, setSelectedDay, useCelsius }: DailyForecastProps) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>7-Day Forecast</Text>
      <View style={styles.dailyContainer}>
        {dailyWeather.time.map((day, index) => {
          const dayInfo = getWeatherInfo(dailyWeather.weathercode[index])
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
                {dailyWeather.precipitation_probability_max[index] > 30 && (
                  <Text style={styles.rainChance}>{dailyWeather.precipitation_probability_max[index]}%</Text>
                )}
              </View>
              <View style={styles.tempRange}>
                <Text style={styles.maxTemp}>
                  {formatTemperature(dailyWeather.temperature_2m_max[index], useCelsius).replace("°C", "°")}
                </Text>
                <Text style={styles.minTemp}>
                  {formatTemperature(dailyWeather.temperature_2m_min[index], useCelsius).replace("°C", "°")}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionContainer: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
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
  dayName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    width: 80,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dailyIconContainer: { flexDirection: "row", alignItems: "center" },
  rainChance: {
    color: "#E1F5FE",
    fontSize: 12,
    marginLeft: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tempRange: { flexDirection: "row", width: 80, justifyContent: "flex-end" },
  maxTemp: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  minTemp: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

