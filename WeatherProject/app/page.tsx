import { View, Text } from "react-native"
import Index from "./index.tsx"
import Locations from "./locations.tsx"
import WeatherDetails from "./weather-details.tsx"

export default function Page() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>This is the Page component.</Text>
      <Index />
      <Locations />
      <WeatherDetails />
    </View>
  )
}

