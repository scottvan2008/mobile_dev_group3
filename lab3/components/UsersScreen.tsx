import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { getUsers } from "../lib/supabase_crud";

interface User {
    id: number;
    name: string;
    email: string;
}

export default function UsersScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await getUsers();
                console.log("Fetched Users:", data); // Debugging log

                if (
                    Array.isArray(data) &&
                    data.every(
                        (item) =>
                            "id" in item && "name" in item && "email" in item
                    )
                ) {
                    setUsers(data as User[]);
                } else {
                    console.error("Invalid user data format:", data);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

    return (
        <View>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View>
                        <Text>Name: {item.name}</Text>
                        <Text>Email: {item.email}</Text>
                    </View>
                )}
            />
        </View>
    );
}
