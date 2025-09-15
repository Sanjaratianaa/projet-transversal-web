"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react"

export function FinancialInsights() {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  const insights = [
    {
      type: "success",
      icon: CheckCircle,
      title: "Objectif d'épargne atteint",
      description: "Vous avez économisé 15% de plus que prévu ce mois",
      value: "+15%",
      color: "text-green-600",
    },
    {
      type: "warning",
      icon: AlertTriangle,
      title: "Dépenses alimentaires élevées",
      description: "Vos dépenses alimentaires ont augmenté de 23% ce mois",
      value: "+23%",
      color: "text-yellow-600",
    },
    {
      type: "info",
      icon: TrendingUp,
      title: "Revenus en croissance",
      description: "Tendance positive sur les 3 derniers mois",
      value: "+8%",
      color: "text-blue-600",
    },
    {
      type: "suggestion",
      icon: Lightbulb,
      title: "Opportunité d'investissement",
      description: "Vous pourriez investir 300,000 Ar basé sur votre flux de trésorerie",
      value: formatCurrency(300000),
      color: "text-purple-600",
    },
  ]

  const budgetProgress = [
    { category: "Alimentation", spent: 450000, budget: 500000, percentage: 90 },
    { category: "Transport", spent: 320000, budget: 400000, percentage: 80 },
    { category: "Logement", spent: 680000, budget: 700000, percentage: 97 },
    { category: "Loisirs", spent: 220000, budget: 300000, percentage: 73 },
  ]

  return (
    <div className="space-y-6">
      {/* Financial Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Analyses Financières</CardTitle>
          <CardDescription>Insights automatiques basés sur vos données</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon
            return (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                <IconComponent className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge
                      variant={
                        insight.type === "success"
                          ? "default"
                          : insight.type === "warning"
                            ? "destructive"
                            : "primary"
                      }
                    >
                      {insight.value}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progression des Budgets</CardTitle>
          <CardDescription>Suivi en temps réel de vos budgets par catégorie</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetProgress.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.category}</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${item.percentage > 90
                      ? "bg-red-600"
                      : item.percentage > 50
                        ? "bg-secondary"
                        : "bg-primary"
                    }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-xs mt-1">
                <span className={`font-medium ${item.percentage > 90
                    ? "text-red-600"
                    : item.percentage > 50
                      ? "text-secondary"
                      : "text-primary"
                  }`}>
                  {item.percentage}% utilisé
                </span>
                <span className="text-muted-foreground">{formatCurrency(item.budget - item.spent)} restant</span>
              </div>

            </div>
          ))}
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle>Score de Santé Financière</CardTitle>
          <CardDescription>Évaluation globale de votre situation financière</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#228B22"
                  strokeWidth="2"
                  strokeDasharray="75, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-secondary">75</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">Bonne Santé Financière</h3>
              <p className="text-sm text-muted-foreground">
                Votre gestion financière est sur la bonne voie. Continuez vos efforts d'épargne.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">A</div>
                <div className="text-xs text-muted-foreground">Épargne</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">B</div>
                <div className="text-xs text-muted-foreground">Dépenses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">A</div>
                <div className="text-xs text-muted-foreground">Revenus</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
