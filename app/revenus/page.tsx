"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { RevenuForm } from "@/components/revenus/revenu-form"
import { RevenuTable } from "@/components/revenus/revenu-table"
import { PlafondConfig } from "@/components/revenus/plafond-config"
import { Plus, TrendingUp, DollarSign, Target, Percent } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Revenu {
  id: string
  nom: string
  type: "fixe" | "variable"
  montant: number
  frequence: "mensuelle" | "annuelle" | "ponctuelle"
  dateDebut: Date
  plafondUtilisation: number
  description?: string
}

// Mock data
const mockRevenus: Revenu[] = [
  {
    id: "1",
    nom: "Salaire principal",
    type: "fixe",
    montant: 2500000,
    frequence: "mensuelle",
    dateDebut: new Date("2024-01-01"),
    plafondUtilisation: 80,
    description: "Salaire mensuel fixe",
  },
  {
    id: "2",
    nom: "Freelance développement",
    type: "variable",
    montant: 800000,
    frequence: "mensuelle",
    dateDebut: new Date("2024-01-15"),
    plafondUtilisation: 70,
    description: "Revenus de projets freelance",
  },
  {
    id: "3",
    nom: "Dividendes actions",
    type: "variable",
    montant: 150000,
    frequence: "annuelle",
    dateDebut: new Date("2024-01-01"),
    plafondUtilisation: 90,
    description: "Dividendes annuels",
  },
]

// Mock current usage data (percentage of each revenue source used)
const mockUtilisationActuelle = {
  "1": 65, // 65% of salary used
  "2": 45, // 45% of freelance income used
  "3": 20, // 20% of dividends used
}

export default function RevenusPage() {
  const [revenus, setRevenus] = useState<Revenu[]>(mockRevenus)
  const [selectedRevenu, setSelectedRevenu] = useState<Revenu | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [plafondGlobal, setPlafondGlobal] = useState(2500000) // Global monthly spending limit
  const [utilisationActuelle, setUtilisationActuelle] = useState(mockUtilisationActuelle)
  const { toast } = useToast()

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenus = revenus.length
    const revenusMensuels = revenus.filter((r) => r.frequence === "mensuelle")
    const revenusAnnuels = revenus.filter((r) => r.frequence === "annuelle")
    const revenusPonctuels = revenus.filter((r) => r.frequence === "ponctuelle")

    // Calculate total monthly revenue (convert annual to monthly)
    const montantMensuelTotal = revenus.reduce((sum, revenu) => {
      let montantMensuel = revenu.montant
      if (revenu.frequence === "annuelle") {
        montantMensuel = revenu.montant / 12
      } else if (revenu.frequence === "ponctuelle") {
        montantMensuel = 0 // Don't count one-time revenues in monthly total
      }
      return sum + montantMensuel
    }, 0)

    // Calculate total available amount (considering usage limits)
    const montantDisponible = revenus.reduce((sum, revenu) => {
      let montantMensuel = revenu.montant
      if (revenu.frequence === "annuelle") {
        montantMensuel = revenu.montant / 12
      } else if (revenu.frequence === "ponctuelle") {
        montantMensuel = 0
      }
      const montantUtilisable = (montantMensuel * revenu.plafondUtilisation) / 100
      return sum + montantUtilisable
    }, 0)

    // Calculate current usage
    const utilisationGlobale = revenus.reduce((sum, revenu) => {
      const utilisation = utilisationActuelle[revenu.id] || 0
      let montantMensuel = revenu.montant
      if (revenu.frequence === "annuelle") {
        montantMensuel = revenu.montant / 12
      } else if (revenu.frequence === "ponctuelle") {
        montantMensuel = 0
      }
      return sum + (montantMensuel * utilisation) / 100
    }, 0)

    return {
      totalRevenus,
      revenusMensuels: revenusMensuels.length,
      revenusAnnuels: revenusAnnuels.length,
      revenusPonctuels: revenusPonctuels.length,
      montantMensuelTotal,
      montantDisponible,
      utilisationGlobale,
    }
  }, [revenus, utilisationActuelle])

  const handleAddRevenu = () => {
    setSelectedRevenu(undefined)
    setIsFormOpen(true)
  }

  const handleEditRevenu = (revenu: Revenu) => {
    setSelectedRevenu(revenu)
    setIsFormOpen(true)
  }

  const handleDeleteRevenu = (id: string) => {
    setRevenus((prev) => prev.filter((r) => r.id !== id))
    // Remove usage data for deleted revenue
    setUtilisationActuelle((prev) => {
      const newUtilisation = { ...prev }
      delete newUtilisation[id]
      return newUtilisation
    })
    toast({
      title: "Revenu supprimé",
      description: "Le revenu a été supprimé avec succès.",
    })
  }

  const handleSubmitRevenu = (revenuData: Revenu) => {
    if (selectedRevenu) {
      // Edit existing revenu
      setRevenus((prev) => prev.map((r) => (r.id === selectedRevenu.id ? { ...revenuData, id: selectedRevenu.id } : r)))
      toast({
        title: "Revenu modifié",
        description: "Le revenu a été modifié avec succès.",
      })
    } else {
      // Add new revenu
      const newRevenu = {
        ...revenuData,
        id: Date.now().toString(),
      }
      setRevenus((prev) => [...prev, newRevenu])
      // Initialize usage at 0%
      setUtilisationActuelle((prev) => ({ ...prev, [newRevenu.id]: 0 }))
      toast({
        title: "Revenu ajouté",
        description: "Le nouveau revenu a été ajouté avec succès.",
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
              <h1 className="text-3xl font-bold text-foreground">Gestion des Revenus</h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos sources de revenus, définissez des plafonds d'utilisation et suivez votre budget
              </p>
            </div>
            <Button onClick={handleAddRevenu} className="bg-primary">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau revenu
            </Button>
          </div>

          {/* Statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sources de revenus</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenus}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.revenusMensuels} mensuels, {stats.revenusAnnuels} annuels
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus mensuels</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.montantMensuelTotal)}</div>
                <p className="text-xs text-muted-foreground">Total des revenus mensuels</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Montant disponible</CardTitle>
                <Target className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{formatCurrency(stats.montantDisponible)}</div>
                <p className="text-xs text-muted-foreground">Selon les plafonds définis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisation actuelle</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.utilisationGlobale)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.montantDisponible > 0
                    ? `${((stats.utilisationGlobale / stats.montantDisponible) * 100).toFixed(1)}% utilisé`
                    : "0% utilisé"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main content tabs */}
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">Sources de revenus</TabsTrigger>
              <TabsTrigger value="plafond">Plafond global</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des revenus</CardTitle>
                  <CardDescription>{revenus.length} source(s) de revenus enregistrée(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenuTable
                    revenus={revenus}
                    onEdit={handleEditRevenu}
                    onDelete={handleDeleteRevenu}
                    utilisationActuelle={utilisationActuelle}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plafond" className="space-y-6">
              <PlafondConfig
                plafondGlobal={plafondGlobal}
                utilisationActuelle={stats.utilisationGlobale}
                onPlafondChange={setPlafondGlobal}
              />
            </TabsContent>
          </Tabs>

          {/* Form dialog */}
          <RevenuForm
            revenu={selectedRevenu}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={handleSubmitRevenu}
          />
        </main>
      </div>
    </div>
  )
}
