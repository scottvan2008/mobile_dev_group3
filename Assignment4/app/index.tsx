import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import SignIn from "../components/sign-in";
import { supabase } from "../src/supabase";
import { Redirect } from "expo-router";

export default function Index() {
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [initializing, setInitializing] = useState<boolean>(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsSignedIn(!!session);
            if (session) {
                fetchUserDetails(session.user.id);
            }
            setInitializing(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsSignedIn(!!session);
            if (session) {
                fetchUserDetails(session.user.id);
            } else {
                setUsername("");
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserDetails = async (userId: string) => {
        const { data, error } = await supabase
            .from("user_details")
            .select("first_name, last_name")
            .eq("uuid", userId)
            .single();
        if (data && !error) {
            setUsername(`${data.first_name} ${data.last_name}`);
        }
    };

    if (initializing) return null;

    return (
        <View style={styles.container}>
            {isSignedIn ? (
                <Redirect href={`/tabs/welcome?username=${username}`} />
            ) : (
                <SignIn
                    setIsSignedIn={setIsSignedIn}
                    username={username}
                    setUsername={setUsername}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
});
