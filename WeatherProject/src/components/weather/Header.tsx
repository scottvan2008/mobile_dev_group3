import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import type { LocationData } from "../../types/weather"

interface HeaderProps {
  prevCityData: LocationData | null
  isViewingSavedLocation: boolean
  toggleSearch: () => void
  router: any
  setPrevCityData: (data: LocationData | null) => void
  currentLocation: LocationData
  toggleMap: () => void
  isSignedIn: boolean
  isLocationSaved: boolean
  saveCurrentLocation: () => void
  useCelsius: boolean
  setUseCelsius: (value: boolean) => void
}

export const Header = ({
  prevCityData,
  isViewingSavedLocation,
  toggleSearch,
  router,
  setPrevCityData,
  currentLocation,
  toggleMap,
  isSignedIn,
  isLocationSaved,
  saveCurrentLocation,
  useCelsius,
  setUseCelsius,
}: HeaderProps) => {
  return (
    <View style={styles.header}>
      {prevCityData || isViewingSavedLocation ? (
        <TouchableOpacity
          onPress={() => {
            router.replace("/")
            setPrevCityData(null)
          }}
          style={styles.iconButton}
        >
          <Icon name="home" size={22} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={toggleSearch} style={styles.iconButton}>
          <Icon name="magnify" size={22} color="white" />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={toggleMap} style={styles.locationButton}>
        <Icon name="map-marker" size={18} color="white" />
        <Text style={styles.locationText} numberOfLines={1}>
          {currentLocation.name}
        </Text>
        <Icon name="chevron-down" size={18} color="white" />
      </TouchableOpacity>
      <View style={styles.headerRightButtons}>
        {isSignedIn && !isLocationSaved && (
          <TouchableOpacity onPress={saveCurrentLocation} style={styles.addButton}>
            <Icon name="plus" size={18} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setUseCelsius(!useCelsius)} style={styles.unitButton}>
          <Text style={styles.unitText}>{useCelsius ? "°C" : "°F"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  locationText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 6,
    maxWidth: 180,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerRightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
    padding: 6,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  unitButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
    padding: 6,
    minWidth: 36,
    alignItems: "center",
  },
  unitText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

