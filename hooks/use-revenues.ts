"use client"

import { useState, useMemo } from "react"
import type { Revenue, RevenueFormData, RevenueFilters, GlobalCeiling } from "@/types/revenue"
import { calculateRevenueStats, mockRevenues } from "@/lib/revenue-utils"

const ITEMS_PER_PAGE = 10

export function useRevenues() {
  const [revenues, setRevenues] = useState<Revenue[]>(mockRevenues)
  const [filters, setFilters] = useState<RevenueFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [globalCeiling, setGlobalCeiling] = useState<GlobalCeiling>({
    plafond: 5000000, // 5M Ar
    utilisation: 3300000, // 3.3M Ar utilisés
    pourcentage: 66,
  })

  // Filter revenues
  const filteredRevenues = useMemo(() => {
    return revenues.filter((revenue) => {
      if (filters.nom && !revenue.nom.toLowerCase().includes(filters.nom.toLowerCase())) {
        return false
      }
      if (filters.type && revenue.type !== filters.type) {
        return false
      }
      if (filters.frequence && revenue.frequence !== filters.frequence) {
        return false
      }
      return true
    })
  }, [revenues, filters])

  // Paginate revenues
  const paginatedRevenues = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredRevenues.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredRevenues, currentPage])

  const totalPages = Math.ceil(filteredRevenues.length / ITEMS_PER_PAGE)

  // Calculate stats
  const stats = useMemo(() => calculateRevenueStats(revenues), [revenues])

  const addRevenue = (data: RevenueFormData) => {
    const newRevenue: Revenue = {
      id: Date.now().toString(),
      nom: data.nom,
      type: data.type,
      montant: Number(data.montant),
      frequence: data.frequence,
      plafondActif: data.plafondActif,
      plafondMensuel: data.plafondMensuel ? Number(data.plafondMensuel) : undefined,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
    }
    setRevenues((prev) => [newRevenue, ...prev])
  }

  const updateRevenue = (id: string, data: RevenueFormData) => {
    setRevenues((prev) =>
      prev.map((revenue) =>
        revenue.id === id
          ? {
              ...revenue,
              nom: data.nom,
              type: data.type,
              montant: Number(data.montant),
              frequence: data.frequence,
              plafondActif: data.plafondActif,
              plafondMensuel: data.plafondMensuel ? Number(data.plafondMensuel) : undefined,
              dateModification: new Date().toISOString(),
            }
          : revenue,
      ),
    )
  }

  const deleteRevenue = (id: string) => {
    setRevenues((prev) => prev.filter((revenue) => revenue.id !== id))
  }

  const updateFilters = (newFilters: RevenueFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const updateGlobalCeiling = (newCeiling: number) => {
    const utilisation = globalCeiling.utilisation
    setGlobalCeiling({
      plafond: newCeiling,
      utilisation,
      pourcentage: newCeiling > 0 ? Math.round((utilisation / newCeiling) * 100) : 0,
    })
  }

  return {
    revenues: paginatedRevenues,
    allRevenues: filteredRevenues,
    filters,
    currentPage,
    totalPages,
    stats,
    globalCeiling,
    addRevenue,
    updateRevenue,
    deleteRevenue,
    updateFilters,
    clearFilters,
    setCurrentPage,
    updateGlobalCeiling,
  }
}
