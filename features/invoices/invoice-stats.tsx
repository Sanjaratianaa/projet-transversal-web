"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CoinsIcon, FileTextIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, TrendingUpIcon } from "lucide-react"
import { formatCurrency } from "@/lib/invoice-utils"

interface InvoiceStatsProps {
  stats: {
    total: number
    payees: number
    enAttente: number
    enRetard: number
    montantTotal: number
    montantPaye: number
    montantRestant: number
  }
}

export default function InvoiceStats({ stats }: InvoiceStatsProps) {
  const paymentRate = stats.total > 0 ? (stats.payees / stats.total) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total des factures */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des factures</CardTitle>
          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              {stats.payees} payées
            </Badge>
            {stats.enRetard > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
                {stats.enRetard} en retard
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Montant total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Montant total</CardTitle>
          <CoinsIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.montantTotal)}</div>
          <p className="text-xs text-muted-foreground mt-1">Toutes factures confondues</p>
        </CardContent>
      </Card>

      {/* Montant payé */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Montant payé</CardTitle>
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.montantPaye)}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUpIcon className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">{paymentRate.toFixed(1)}% payé</span>
          </div>
        </CardContent>
      </Card>

      {/* Montant restant */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Montant restant</CardTitle>
          <ClockIcon className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.montantRestant)}</div>
          <div className="flex items-center gap-2 mt-1">
            {stats.enAttente > 0 && (
              <Badge variant="secondary" className="text-xs">
                {stats.enAttente} en attente
              </Badge>
            )}
            {stats.enRetard > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.enRetard} en retard
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
