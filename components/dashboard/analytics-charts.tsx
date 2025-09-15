"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from "recharts"

const monthlyData = [
  { month: "Jan", revenus: 2200000, depenses: 1800000, benefice: 400000 },
  { month: "Fév", revenus: 2400000, depenses: 1900000, benefice: 500000 },
  { month: "Mar", revenus: 2300000, depenses: 2100000, benefice: 200000 },
  { month: "Avr", revenus: 2600000, depenses: 1950000, benefice: 650000 },
  { month: "Mai", revenus: 2500000, depenses: 1850000, benefice: 650000 },
  { month: "Juin", revenus: 2700000, depenses: 2000000, benefice: 700000 },
]

const categoryData = [
  { name: "Alimentation", value: 450000, color: "#4CAF50" }, // Vert vif
  { name: "Transport", value: 320000, color: "#2196F3" },    // Bleu
  { name: "Logement", value: 680000, color: "#FF9800" },     // Orange
  { name: "Santé", value: 180000, color: "#F44336" },        // Rouge
  { name: "Loisirs", value: 220000, color: "#9C27B0" },      // Violet
  { name: "Autres", value: 150000, color: "#607D8B" },       // Gris bleuâtre
];

const forecastData = [
  { month: "Juil", actual: 2700000, predicted: 2750000 },
  { month: "Août", actual: null, predicted: 2800000 },
  { month: "Sep", actual: null, predicted: 2850000 },
  { month: "Oct", actual: null, predicted: 2900000 },
  { month: "Nov", actual: null, predicted: 2950000 },
  { month: "Déc", actual: null, predicted: 3000000 },
]

const previsionData = [
  { month: "Juil", revenus: 2800000, depenses: 2050000, benefice: 750000 },
  { month: "Août", revenus: 2900000, depenses: 2100000, benefice: 800000 },
  { month: "Sep", revenus: 3000000, depenses: 2150000, benefice: 850000 },
]

export function AnalyticsCharts() {
  const formatCurrency = (value: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value) + " Ar"
    )
  }

  // Trouver le maximum pour normaliser les barres
  const maxValue = Math.max(
    ...previsionData.map((item) => Math.max(item.revenus, item.depenses))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue vs Expenses Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Évolution Revenus vs Dépenses</CardTitle>
          <CardDescription>Comparaison mensuelle des revenus et dépenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="revenus" stroke="#228B22" strokeWidth={3} name="Revenus" />
              <Line type="monotone" dataKey="depenses" stroke="#FFD700" strokeWidth={3} name="Dépenses" />
              <Line
                type="monotone"
                dataKey="benefice"
                stroke="#32CD32"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Bénéfice"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des Dépenses</CardTitle>
          <CardDescription>Par catégorie ce mois</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Prévision Revenue et depense */}
      <Card>
        <CardHeader>
          <CardTitle>Prévisions financières</CardTitle>
          <CardDescription>Projection basée sur l'historique</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={previsionData}
              margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis
                tickFormatter={(value) => `${value.toLocaleString()} Ar`}
              />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()} Ar`}
              />
              <Tooltip formatter={(value: number) => value.toLocaleString() + " Ar"} />
              <Legend />
              <Bar dataKey="revenus" name="Revenus" fill="#228B22" />
              <Bar dataKey="depenses" name="Dépenses" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
