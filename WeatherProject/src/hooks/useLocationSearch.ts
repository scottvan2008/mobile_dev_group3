"use client"

import { useState, useEffect } from "react"
import { searchLocations as searchLocationsApi } from "../services/weatherService"
import type { SearchResult } from "../types/weather"

export const useLocationSearch = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchLocationsApi(query)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching locations:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchQuery.trim().length >= 2 ? searchLocations(searchQuery.trim()) : setSearchResults([])
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchLocations,
  }
}

