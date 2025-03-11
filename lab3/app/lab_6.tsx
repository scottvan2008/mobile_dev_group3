import { createStackNavigator } from "@react-navigation/stack";
import UsersScreen from "../components/UsersScreen";

const Stack = createStackNavigator();

export default function Lab6() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Users" component={UsersScreen} />
        </Stack.Navigator>
    );
}
