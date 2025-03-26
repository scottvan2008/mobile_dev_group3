"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import MapView, { Marker } from "react-native-maps"
import { Dimensions } from "react-native"
import type { LocationData } from "@/types/weather"
import { getWeatherInfo } from "@/utils/weather"

interface MapPanelProps {
  visible: boolean
  onClose: () => void
  location: LocationData
  weatherCode?: number
  isDay?: number
}

export function MapPanel({ visible, onClose, location, weatherCode = 0, isDay = 1 }: MapPanelProps) {
  const [mapAnimation] = useState(new Animated.Value(visible ? 1 : 0))
  const weatherInfo = getWeatherInfo(weatherCode, isDay)

  useEffect(() => {
    Animated.timing(mapAnimation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [visible])

  const mapPanelHeight = mapAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Dimensions.get("window").height * 0.7],
  })

  return (
    <Animated.View style={[styles.mapPanel, { height: mapPanelHeight }]}>
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>Weather Map</Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      {visible && location && location.latitude !== 0 && location.longitude !== 0 && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.name}
            description={weatherInfo.description}
          >
            <View style={styles.markerContainer}>
              <Icon name={weatherInfo.icon} size={24} color="#4FC3F7" />
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
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#4FC3F7",
  },
})

