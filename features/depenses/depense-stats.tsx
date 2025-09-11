"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CoinsIcon, TrendingUpIcon, CalendarIcon, TargetIcon } from "lucide-react"
import { formatCurrency } from "@/lib/revenue-utils"
import type { DepenseStatsType } from "@/types/depense"

interface RevenueStatsProps {
  stats: DepenseStatsType
}

export default function RevenueStats({ stats }: RevenueStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total des sources */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sources de revenus</CardTitle>
          <TargetIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {stats.fixes} fixes
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {stats.variables} variables
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Revenus mensuels */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenus mensuels</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.montantMensuel)}</div>
          <p className="text-xs text-muted-foreground mt-1">Estimation mensuelle</p>
        </CardContent>
      </Card>

      {/* Revenus annuels */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenus annuels</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.montantAnnuel)}</div>
          <p className="text-xs text-muted-foreground mt-1">Projection annuelle</p>
        </CardContent>
      </Card>

      {/* Total général */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total configuré</CardTitle>
          <CoinsIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.montantTotal)}</div>
          <p className="text-xs text-muted-foreground mt-1">Toutes sources confondues</p>
        </CardContent>
      </Card>
    </div>
  )
}
