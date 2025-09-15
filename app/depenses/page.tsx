"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DepenseForm } from "@/components/depenses/depense-form"
import { DepenseTable } from "@/components/depenses/depense-table"
import { DepenseChart } from "@/components/depenses/depense-chart"
import { BudgetAlert } from "@/components/depenses/budget-alert"
import { Plus, TrendingDown, Calculator, AlertTriangle, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

// Mock data
const mockDepenses: Depense[] = [
  {
    id: "1",
    description: "Courses alimentaires",
    categorie: "alimentation",
    montant: 85000,
    type: "variable",
    frequence: "hebdomadaire",
    date: new Date("2024-01-15"),
    notes: "Supermarché Score",
  },
  {
    id: "2",
    description: "Essence voiture",
    categorie: "transport",
    montant: 45000,
    type: "variable",
    frequence: "hebdomadaire",
    date: new Date("2024-01-10"),
    notes: "Station Total",
  },
  {
    id: "3",
    description: "Loyer appartement",
    categorie: "logement",
    montant: 600000,
    type: "fixe",
    frequence: "mensuelle",
    date: new Date("2024-01-01"),
    notes: "Loyer mensuel",
  },
  {
    id: "4",
    description: "Consultation médecin",
    categorie: "sante",
    montant: 25000,
    type: "variable",
    frequence: "unique",
    date: new Date("2024-01-20"),
    notes: "Visite de routine",
  },
  {
    id: "5",
    description: "Cinéma",
    categorie: "loisirs",
    montant: 15000,
    type: "variable",
    frequence: "unique",
    date: new Date("2024-01-18"),
    notes: "Sortie en famille",
  },
]

export default function DepensesPage() {
  const [depenses, setDepenses] = useState<Depense[]>(mockDepenses)
  const [selectedDepense, setSelectedDepense] = useState<Depense | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { toast } = useToast()

  // Calculate statistics
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const currentMonthDepenses = depenses.filter((depense) => {
      const depenseDate = new Date(depense.date)
      return depenseDate.getMonth() === currentMonth && depenseDate.getFullYear() === currentYear
    })

    const totalDepenses = depenses.length
    const totalMontant = depenses.reduce((sum, d) => sum + d.montant, 0)
    const montantMoisActuel = currentMonthDepenses.reduce((sum, d) => sum + d.montant, 0)
    const depensesFixes = depenses.filter((d) => d.type === "fixe").length
    const depensesVariables = depenses.filter((d) => d.type === "variable").length

    return {
      totalDepenses,
      totalMontant,
      montantMoisActuel,
      depensesFixes,
      depensesVariables,
    }
  }, [depenses])

  const handleAddDepense = () => {
    setSelectedDepense(undefined)
    setIsFormOpen(true)
  }

  const handleEditDepense = (depense: Depense) => {
    setSelectedDepense(depense)
    setIsFormOpen(true)
  }

  const handleDeleteDepense = (id: string) => {
    setDepenses((prev) => prev.filter((d) => d.id !== id))
    toast({
      title: "Dépense supprimée",
      description: "La dépense a été supprimée avec succès.",
    })
  }

  const handleSubmitDepense = (depenseData: Depense) => {
    if (selectedDepense) {
      // Edit existing depense
      setDepenses((prev) =>
        prev.map((d) => (d.id === selectedDepense.id ? { ...depenseData, id: selectedDepense.id } : d)),
      )
      toast({
        title: "Dépense modifiée",
        description: "La dépense a été modifiée avec succès.",
      })
    } else {
      // Add new depense
      const newDepense = {
        ...depenseData,
        id: Date.now().toString(),
      }
      setDepenses((prev) => [...prev, newDepense])
      toast({
        title: "Dépense ajoutée",
        description: "La nouvelle dépense a été ajoutée avec succès.",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion des Dépenses</h1>
              <p className="text-muted-foreground mt-1">
                Suivez vos dépenses, gérez votre budget et analysez vos habitudes de consommation
              </p>
            </div>
            <Button onClick={handleAddDepense}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle dépense
            </Button>
          </div>

          {/* Statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total dépenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDepenses}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.depensesFixes} fixes, {stats.depensesVariables} variables
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Montant total</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalMontant)}</div>
                <p className="text-xs text-muted-foreground">Toutes dépenses confondues</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
                <BarChart3 className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{formatCurrency(stats.montantMoisActuel)}</div>
                <p className="text-xs text-muted-foreground">Dépenses du mois actuel</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget</CardTitle>
                <AlertTriangle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">75%</div>
                <p className="text-xs text-muted-foreground">Budget mensuel utilisé</p>
              </CardContent>
            </Card>
          </div>

          {/* Main content tabs */}
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">Liste des dépenses</TabsTrigger>
              <TabsTrigger value="budget">Suivi budget</TabsTrigger>
              <TabsTrigger value="analytics">Analyses</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des dépenses</CardTitle>
                  <CardDescription>{depenses.length} dépense(s) enregistrée(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <DepenseTable depenses={depenses} onEdit={handleEditDepense} onDelete={handleDeleteDepense} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <BudgetAlert depenses={depenses} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <DepenseChart depenses={depenses} />
            </TabsContent>
          </Tabs>

          {/* Form dialog */}
          <DepenseForm
            depense={selectedDepense}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={handleSubmitDepense}
          />
        </main>
      </div>
    </div>
  )
}
