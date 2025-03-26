"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/src/supabase"
import { Alert } from "react-native"

export function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [isProcessingAction, setIsProcessingAction] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setIsSignedIn(!!session)
        if (session) {
          setUserId(session.user.id)
          fetchUserDetails(session.user.id)
        }
        setInitializing(false)
      } catch (error) {
        console.error("Error checking session:", error)
        setInitializing(false)
      }
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsSignedIn(!!session)
      if (session) {
        setUserId(session.user.id)
        fetchUserDetails(session.user.id)
      } else {
        setUsername("")
        setUserId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_details")
        .select("first_name, last_name")
        .eq("uuid", userId)
        .single()
      if (data && !error) setUsername(`${data.first_name} ${data.last_name}`)
    } catch (e) {
      console.error("Error fetching user details:", e)
    }
  }

  const handleSignOut = async () => {
    if (isProcessingAction) return

    try {
      setIsProcessingAction(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        Alert.alert("Error", "Failed to sign out.")
        return
      }
    } catch (error) {
      console.error("Error during sign out:", error)
      Alert.alert("Error", "An unexpected error occurred during sign out.")
    } finally {
      setIsProcessingAction(false)
    }
  }

  return {
    isSignedIn,
    username,
    userId,
    initializing,
    isProcessingAction,
    setIsProcessingAction,
    handleSignOut,
  }
}

