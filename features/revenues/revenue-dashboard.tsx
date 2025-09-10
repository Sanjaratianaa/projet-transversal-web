"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import RevenueStats from "./revenue-stats"
import RevenueTable from "./revenue-table"
import RevenueFormDialog from "./revenue-form-dialog"
import GlobalCeilingCard from "./global-ceiling-card"
import RevenueFilters from "./revenue-filters"
import { useRevenues } from "@/hooks/use-revenues"
import type { RevenueFormData } from "@/types/revenue"

export default function RevenueDashboard() {
  const {
    revenues,
    allRevenues,
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
  } = useRevenues()

  const handleAddRevenue = (data: RevenueFormData) => {
    addRevenue(data)
  }

  const handleUpdateRevenue = (id: string, data: RevenueFormData) => {
    updateRevenue(id, data)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Revenus</h1>
          <p className="text-muted-foreground">Gérez vos sources de revenus et suivez vos plafonds</p>
        </div>
        <div className="flex items-center gap-2">
          <RevenueFormDialog onSubmit={handleAddRevenue}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter une source
            </Button>
          </RevenueFormDialog>
        </div>
      </div>

      {/* Statistics */}
      <RevenueStats stats={stats} />

      {/* Filters */}
      <RevenueFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        totalCount={allRevenues.length}
        filteredCount={allRevenues.length}
      />

      {/* Two-column layout for main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sources de revenus - 2/3 width */}
        <div className="lg:col-span-2">
          <RevenueTable
            revenues={revenues}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onUpdateRevenue={handleUpdateRevenue}
            onDeleteRevenue={deleteRevenue}
          />
        </div>

        {/* Plafond global - 1/3 width */}
        <div className="lg:col-span-1">
          <GlobalCeilingCard globalCeiling={globalCeiling} onUpdateCeiling={updateGlobalCeiling} />
        </div>
      </div>
    </div>
  )
}
