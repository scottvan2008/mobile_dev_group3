import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import MapView, { Marker } from "react-native-maps"
import type { LocationData } from "../../types/weather"
import type { WeatherInfo } from "../../types/weather"

interface MapPanelProps {
  showMap: boolean
  mapAnimation: Animated.Value
  currentLocation: LocationData
  toggleMap: () => void
  currentWeatherInfo: WeatherInfo
}

export const MapPanel = ({ showMap, mapAnimation, currentLocation, toggleMap, currentWeatherInfo }: MapPanelProps) => {
  const mapPanelHeight = mapAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Dimensions.get("window").height * 0.7],
  })

  return (
    <Animated.View style={[styles.mapPanel, { height: mapPanelHeight }]}>
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>Weather Map</Text>
        <TouchableOpacity onPress={toggleMap}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      {showMap && currentLocation.latitude !== 0 && currentLocation.longitude !== 0 && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title={currentLocation.name}
            description={currentWeatherInfo.description}
          >
            <View style={styles.markerContainer}>
              <Icon name={currentWeatherInfo.icon} size={24} color="#4FC3F7" />
            </View>
          </Marker>
        </MapView>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
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

