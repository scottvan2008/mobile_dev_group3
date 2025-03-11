import supabase from "./supabase";
const TABLE_NAME = "users";

export async function getUsers() {
    const { data, error } = await supabase.from(TABLE_NAME).select("*");

    if (error) {
        console.error("Supabase error:", error); // Log error if any
        return [];
    }

    console.log("Supabase raw response:", data); // Log actual response from Supabase
    return data;
}
