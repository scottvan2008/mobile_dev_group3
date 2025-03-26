import { View, Text, StyleSheet } from "react-native"

export function Footer() {
  return (
    <View style={styles.poweredByContainer}>
      <Text style={styles.poweredByText}>Powered by Open-Meteo API</Text>
      <Text style={styles.updatedText}>Last updated: {new Date().toLocaleTimeString()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
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

