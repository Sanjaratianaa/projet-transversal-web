"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FilterIcon, XIcon, SearchIcon } from "lucide-react"
import type { InvoiceFilters } from "@/types/invoice"
import { INVOICE_TYPES, INVOICE_STATUSES } from "@/lib/invoice-utils"

interface InvoiceFiltersProps {
  filters: InvoiceFilters
  onFiltersChange: (filters: InvoiceFilters) => void
  onClearFilters: () => void
  totalCount: number
  filteredCount: number
}

export default function InvoiceFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: InvoiceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof InvoiceFilters, value: string) => {
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
              {filteredCount} / {totalCount} factures
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
              <FilterIcon className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Recherche par fournisseur */}
          <div className="space-y-2">
            <Label htmlFor="search-fournisseur" className="text-sm font-medium">
              Rechercher un fournisseur
            </Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-fournisseur"
                placeholder="Ex: EDF, Orange..."
                value={filters.fournisseur || ""}
                onChange={(e) => handleFilterChange("fournisseur", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtres en ligne */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type de facture */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type de facture</Label>
              <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {INVOICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Statut</Label>
              <Select value={filters.statut || "all"} onValueChange={(value) => handleFilterChange("statut", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {INVOICE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            status.color.includes("green")
                              ? "bg-green-500"
                              : status.color.includes("yellow")
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date de début */}
            <div className="space-y-2">
              <Label htmlFor="date-debut" className="text-sm font-medium">
                Date de début
              </Label>
              <Input
                id="date-debut"
                type="date"
                value={filters.dateDebut || ""}
                onChange={(e) => handleFilterChange("dateDebut", e.target.value)}
              />
            </div>

            {/* Date de fin */}
            <div className="space-y-2">
              <Label htmlFor="date-fin" className="text-sm font-medium">
                Date de fin
              </Label>
              <Input
                id="date-fin"
                type="date"
                value={filters.dateFin || ""}
                onChange={(e) => handleFilterChange("dateFin", e.target.value)}
              />
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
