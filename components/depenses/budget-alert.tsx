"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, TrendingUp } from "lucide-react"

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

interface BudgetAlertProps {
  depenses: Depense[]
  budgetLimits?: Record<string, number>
}

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

export function BudgetAlert({ depenses, budgetLimits }: BudgetAlertProps) {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  // Default budget limits (in Ariary)
  const defaultBudgetLimits = {
    alimentation: 500000,
    transport: 200000,
    logement: 800000,
    sante: 150000,
    education: 100000,
    loisirs: 200000,
    vetements: 100000,
    services: 150000,
    autre: 100000,
  }

  const limits = budgetLimits || defaultBudgetLimits

  // Calculate current month expenses by category
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const currentMonthExpenses = depenses.filter((depense) => {
    const expenseDate = new Date(depense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  const expensesByCategory = currentMonthExpenses.reduce(
    (acc, depense) => {
      acc[depense.categorie] = (acc[depense.categorie] || 0) + depense.montant
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate budget status for each category
  const budgetStatus = Object.entries(limits).map(([category, limit]) => {
    const spent = expensesByCategory[category] || 0
    const percentage = (spent / limit) * 100
    const remaining = limit - spent

    return {
      category,
      categoryLabel: getCategorieLabel(category),
      limit,
      spent,
      percentage: Math.min(percentage, 100),
      remaining,
      isOverBudget: spent > limit,
      isNearLimit: percentage >= 80 && percentage < 100,
    }
  })

  const overBudgetCategories = budgetStatus.filter((status) => status.isOverBudget)
  const nearLimitCategories = budgetStatus.filter((status) => status.isNearLimit)

  const totalBudget = Object.values(limits).reduce((sum, limit) => sum + limit, 0)
  const totalSpent = Object.values(expensesByCategory).reduce((sum, spent) => sum + spent, 0)
  const totalPercentage = (totalSpent / totalBudget) * 100

  return (
    <div className="space-y-6">
      {/* Overall Budget Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Budget global ce mois
          </CardTitle>
          <CardDescription>Suivi de votre budget mensuel total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
              </span>
              <span className="text-sm text-muted-foreground">{totalPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(totalPercentage, 100)} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Restant: {formatCurrency(totalBudget - totalSpent)}</span>
              {totalPercentage >= 100 ? (
                <span className="text-destructive font-medium">Budget dépassé</span>
              ) : totalPercentage >= 80 ? (
                <span className="text-secondary font-medium">Attention au budget</span>
              ) : (
                <span className="text-primary font-medium">Dans les limites</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(overBudgetCategories.length > 0 || nearLimitCategories.length > 0) && (
        <div className="space-y-4">
          {overBudgetCategories.map((status) => (
            <Alert key={status.category} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Budget dépassé - {status.categoryLabel}</AlertTitle>
              <AlertDescription>
                Vous avez dépensé {formatCurrency(status.spent)} sur un budget de {formatCurrency(status.limit)}.
                Dépassement de {formatCurrency(status.spent - status.limit)}.
              </AlertDescription>
            </Alert>
          ))}

          {nearLimitCategories.map((status) => (
            <Alert key={status.category}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Attention - {status.categoryLabel}</AlertTitle>
              <AlertDescription>
                Vous avez utilisé {status.percentage.toFixed(1)}% de votre budget. Il vous reste{" "}
                {formatCurrency(status.remaining)}.
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Budget Details by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Détail par catégorie</CardTitle>
          <CardDescription>Suivi de vos budgets par catégorie de dépenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetStatus.map((status) => (
              <div key={status.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{status.categoryLabel}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(status.spent)} / {formatCurrency(status.limit)}
                  </span>
                </div>
                <Progress
                  value={status.percentage}
                  className={`h-2 ${
                    status.isOverBudget
                      ? "[&>div]:bg-destructive"
                      : status.isNearLimit
                        ? "[&>div]:bg-secondary"
                        : "[&>div]:bg-primary"
                  }`}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{status.percentage.toFixed(1)}%</span>
                  <span>
                    {status.isOverBudget ? (
                      <span className="text-destructive">Dépassé de {formatCurrency(status.spent - status.limit)}</span>
                    ) : (
                      <span>Restant: {formatCurrency(status.remaining)}</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
