"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useState } from "react"

interface Depense {
  id: string
  description: string
  categorie: string
  montant: number
  type: "fixe" | "variable"
  frequence: "unique" | "mensuelle" | "annuelle" | "hebdomadaire"
  date: Date
  notes?: string
}

interface DepenseChartProps {
  depenses: Depense[]
}

const COLORS = ["#FFD700", "#228B22", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]

const getCategorieLabel = (categorie: string) => {
  const categories: Record<string, string> = {
    alimentation: "Alimentation",
    transport: "Transport",
    logement: "Logement",
    sante: "Santé",
    education: "Éducation",
    loisirs: "Loisirs",
    vetements: "Vêtements",
    services: "Services",
    autre: "Autre",
  }
  return categories[categorie] || categorie
}

export function DepenseChart({ depenses }: DepenseChartProps) {
  const [chartType, setChartType] = useState<"category" | "monthly">("category")

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + " Ar"
    )
  }

  // Group expenses by category
  const expensesByCategory = depenses.reduce(
    (acc, depense) => {
      const category = getCategorieLabel(depense.categorie)
      acc[category] = (acc[category] || 0) + depense.montant
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }))

  // Group expenses by month
  const expensesByMonth = depenses.reduce(
    (acc, depense) => {
      const month = depense.date.toLocaleDateString("fr-FR", { year: "numeric", month: "short" })
      acc[month] = (acc[month] || 0) + depense.montant
      return acc
    },
    {} as Record<string, number>,
  )

  const monthlyData = Object.entries(expensesByMonth)
    .map(([name, montant]) => ({
      name,
      montant,
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analyse des dépenses</CardTitle>
            <CardDescription>Visualisation de vos dépenses par catégorie et période</CardDescription>
          </div>
          <Select value={chartType} onValueChange={(value: "category" | "monthly") => setChartType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Par catégorie</SelectItem>
              <SelectItem value="monthly">Par mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === "category" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <h4 className="text-sm font-medium mb-4">Répartition par catégorie</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div>
              <h4 className="text-sm font-medium mb-4">Montants par catégorie</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#FFD700" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-medium mb-4">Évolution mensuelle</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="montant" fill="#228B22" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
