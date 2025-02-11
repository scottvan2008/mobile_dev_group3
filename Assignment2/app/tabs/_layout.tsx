import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Calgary from "./calgary"; 
import Edmonton from "./edmonton"; 

const Tab = createBottomTabNavigator();

export default function Tabs() {
    return (
        <Tab.Navigator
        screenOptions={{
            tabBarLabelStyle: { fontSize: 16, fontWeight: "bold" },
            tabBarActiveTintColor: "purple",
            tabBarInactiveTintColor: "gray",
            headerShown: false,
          }}
          
           >

           <Tab.Screen name="Calgary" component={Calgary} options={{
               tabBarIcon: () => (
                   <Ionicons  options={{ tabBarLabel: "Calgary" }} color={"purple"}  />
               ),
           }} />

           <Tab.Screen name="Edmonton" component={Edmonton} options={{
               tabBarIcon: () => (
                   <Ionicons  options={{ tabBarLabel: "Edmonton" }} color={"purple"} />
               ),
           }} />
           </Tab.Navigator>
);}