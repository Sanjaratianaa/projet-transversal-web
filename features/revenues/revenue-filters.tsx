"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FilterIcon, XIcon, SearchIcon } from "lucide-react"
import type { RevenueFilters } from "@/types/revenue"
import { REVENUE_TYPES, REVENUE_FREQUENCIES } from "@/lib/revenue-utils"

interface RevenueFiltersProps {
  filters: RevenueFilters
  onFiltersChange: (filters: RevenueFilters) => void
  onClearFilters: () => void
  totalCount: number
  filteredCount: number
}

export default function RevenueFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: RevenueFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof RevenueFilters, value: string) => {
    const newFilters = { ...filters }
    if (value === "" || value === "all") {
      delete newFilters[key]
    } else {
      newFilters[key] = value as any
    }
    onFiltersChange(newFilters)
  }

  const activeFiltersCount = Object.keys(filters).length
  const hasActiveFilters = activeFiltersCount > 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FilterIcon className="h-5 w-5" />
            Filtres
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredCount} / {totalCount} revenus
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
              <FilterIcon className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Recherche par nom */}
          <div className="space-y-2">
            <Label htmlFor="search-nom" className="text-sm font-medium">
              Rechercher un revenu
            </Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-nom"
                placeholder="Ex: Salaire, Freelance..."
                value={filters.nom || ""}
                onChange={(e) => handleFilterChange("nom", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtres en ligne */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type de revenu */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type de revenu</Label>
              <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {REVENUE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${type.value === "fixe" ? "bg-green-500" : "bg-yellow-500"}`}
                        />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fréquence */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fréquence</Label>
              <Select
                value={filters.frequence || "all"}
                onValueChange={(value) => handleFilterChange("frequence", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les fréquences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les fréquences</SelectItem>
                  {REVENUE_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-2 bg-transparent"
              >
                <XIcon className="h-4 w-4" />
                Effacer les filtres
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
