"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { PretForm } from "@/components/prets/pret-form"
import { PretTable } from "@/components/prets/pret-table"
import { PretSimulation } from "@/components/prets/pret-simulation"
import { PretCalendar } from "@/components/prets/pret-calendar"
import { Plus, CreditCard, Calculator, TrendingDown, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Pret {
  id: string
  creancier: string
  montant: number
  taux: number
  duree: number
  dateDebut: Date
  statut: "actif" | "termine" | "suspendu"
  description?: string
  montantTotal?: number
  mensualite?: number
}

// Mock data
const mockPrets: Pret[] = [
  {
    id: "1",
    creancier: "Banque Centrale de Madagascar",
    montant: 5000000,
    taux: 15,
    duree: 36,
    dateDebut: new Date("2023-06-01"),
    statut: "actif",
    description: "Prêt immobilier",
    montantTotal: 6750000,
    mensualite: 187500,
  },
  {
    id: "2",
    creancier: "Microfinance OTIV",
    montant: 1500000,
    taux: 18,
    duree: 24,
    dateDebut: new Date("2024-01-15"),
    statut: "actif",
    description: "Prêt professionnel",
    montantTotal: 1890000,
    mensualite: 78750,
  },
  {
    id: "3",
    creancier: "Coopérative de crédit",
    montant: 800000,
    taux: 12,
    duree: 12,
    dateDebut: new Date("2023-12-01"),
    statut: "termine",
    description: "Prêt personnel",
    montantTotal: 852000,
    mensualite: 71000,
  },
]

export default function PretsPage() {
  const [prets, setPrets] = useState<Pret[]>(mockPrets)
  const [selectedPret, setSelectedPret] = useState<Pret | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [calendarPret, setCalendarPret] = useState<Pret | undefined>()
  const { toast } = useToast()

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPrets = prets.length
    const pretsActifs = prets.filter((p) => p.statut === "actif")
    const pretsTermines = prets.filter((p) => p.statut === "termine")
    const pretsSuspendus = prets.filter((p) => p.statut === "suspendu")

    const montantTotalEmprunte = prets.reduce((sum, p) => sum + p.montant, 0)
    const montantTotalARembourser = pretsActifs.reduce((sum, p) => sum + (p.montantTotal || p.montant), 0)
    const mensualitesTotales = pretsActifs.reduce((sum, p) => sum + (p.mensualite || 0), 0)

    return {
      totalPrets,
      pretsActifs: pretsActifs.length,
      pretsTermines: pretsTermines.length,
      pretsSuspendus: pretsSuspendus.length,
      montantTotalEmprunte,
      montantTotalARembourser,
      mensualitesTotales,
    }
  }, [prets])

  const handleAddPret = () => {
    setSelectedPret(undefined)
    setIsFormOpen(true)
  }

  const handleEditPret = (pret: Pret) => {
    setSelectedPret(pret)
    setIsFormOpen(true)
  }

  const handleDeletePret = (id: string) => {
    setPrets((prev) => prev.filter((p) => p.id !== id))
    toast({
      title: "Prêt supprimé",
      description: "Le prêt a été supprimé avec succès.",
    })
  }

  const handleSubmitPret = (pretData: Pret) => {
    if (selectedPret) {
      // Edit existing pret
      setPrets((prev) => prev.map((p) => (p.id === selectedPret.id ? { ...pretData, id: selectedPret.id } : p)))
      toast({
        title: "Prêt modifié",
        description: "Le prêt a été modifié avec succès.",
      })
    } else {
      // Add new pret
      const newPret = {
        ...pretData,
        id: Date.now().toString(),
      }
      setPrets((prev) => [...prev, newPret])
      toast({
        title: "Prêt ajouté",
        description: "Le nouveau prêt a été ajouté avec succès.",
      })
    }
  }

  const handleSimulate = (pret: Pret) => {
    toast({
      title: "Simulation",
      description: "Utilisez l'onglet Simulation pour analyser ce prêt.",
    })
  }

  const handleViewCalendar = (pret: Pret) => {
    setCalendarPret(pret)
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

  if (calendarPret) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:ml-64">
          <Header />
          <main className="p-6">
            <PretCalendar pret={calendarPret} onClose={() => setCalendarPret(undefined)} />
          </main>
        </div>
      </div>
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
              <h1 className="text-3xl font-bold text-foreground">Gestion des Prêts</h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos prêts, simulez des scénarios et suivez vos remboursements
              </p>
            </div>
            <Button onClick={handleAddPret} className="bg-primary">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau prêt
            </Button>
          </div>

          {/* Statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prêts actifs</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pretsActifs}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pretsTermines} terminés, {stats.pretsSuspendus} suspendus
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Montant emprunté</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.montantTotalEmprunte)}</div>
                <p className="text-xs text-muted-foreground">Capital initial total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">À rembourser</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(stats.montantTotalARembourser)}
                </div>
                <p className="text-xs text-muted-foreground">Montant total restant</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensualités totales</CardTitle>
                <Calculator className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{formatCurrency(stats.mensualitesTotales)}</div>
                <p className="text-xs text-muted-foreground">Paiements mensuels</p>
              </CardContent>
            </Card>
          </div>

          {/* Main content tabs */}
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">Liste des prêts</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des prêts</CardTitle>
                  <CardDescription>{prets.length} prêt(s) enregistré(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <PretTable
                    prets={prets}
                    onEdit={handleEditPret}
                    onDelete={handleDeletePret}
                    onSimulate={handleSimulate}
                    onViewCalendar={handleViewCalendar}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="simulation" className="space-y-6">
              <PretSimulation />
            </TabsContent>
          </Tabs>

          {/* Form dialog */}
          <PretForm pret={selectedPret} open={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleSubmitPret} />
        </main>
      </div>
    </div>
  )
}
