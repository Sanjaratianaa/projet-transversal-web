"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { FactureForm } from "@/components/factures/facture-form"
import { FactureTable } from "@/components/factures/facture-table"
import { FactureFilters } from "@/components/factures/facture-filters"
import { FactureOCRUploader } from "@/components/factures/facture-ocr-uploader"
import { Plus, FileText, TrendingUp, AlertTriangle, CheckCircleIcon, FileTextIcon, AlertTriangleIcon, CoinsIcon, TrendingUpIcon, ClockIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Facture {
  id: string
  fournisseur: string
  type: string
  montant: number
  dateEmission: Date
  dateEcheance: Date
  statut: "payee" | "en_attente" | "en_retard"
  description?: string
}

// Mock data
const mockFactures: Facture[] = [
  {
    id: "1",
    fournisseur: "EDF Madagascar",
    type: "electricite",
    montant: 125000,
    dateEmission: new Date("2024-01-15"),
    dateEcheance: new Date("2024-02-15"),
    statut: "payee",
    description: "Consommation électrique janvier 2024",
  },
  {
    id: "2",
    fournisseur: "JIRAMA",
    type: "eau",
    montant: 45000,
    dateEmission: new Date("2024-01-10"),
    dateEcheance: new Date("2024-02-10"),
    statut: "en_attente",
    description: "Facture d'eau janvier 2024",
  },
  {
    id: "3",
    fournisseur: "Orange Madagascar",
    type: "internet",
    montant: 89000,
    dateEmission: new Date("2024-01-01"),
    dateEcheance: new Date("2024-01-31"),
    statut: "en_retard",
    description: "Abonnement internet janvier 2024",
  },
]

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>(mockFactures)
  const [selectedFacture, setSelectedFacture] = useState<Facture | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    statut: "",
    dateDebut: undefined as Date | undefined,
    dateFin: undefined as Date | undefined,
  })

  const { toast } = useToast()

  // Filter factures based on current filters
  const filteredFactures = useMemo(() => {
    return factures.filter((facture) => {
      const matchesSearch = !filters.search || facture.fournisseur.toLowerCase().includes(filters.search.toLowerCase())

      const matchesType = !filters.type || facture.type === filters.type
      const matchesStatut = !filters.statut || facture.statut === filters.statut

      const matchesDateDebut = !filters.dateDebut || facture.dateEmission >= filters.dateDebut

      const matchesDateFin = !filters.dateFin || facture.dateEmission <= filters.dateFin

      return matchesSearch && matchesType && matchesStatut && matchesDateDebut && matchesDateFin
    })
  }, [factures, filters])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredFactures.length
    const payees = filteredFactures.filter((f) => f.statut === "payee").length
    const enAttente = filteredFactures.filter((f) => f.statut === "en_attente").length
    const enRetard = filteredFactures.filter((f) => f.statut === "en_retard").length
    const montantTotal = filteredFactures.reduce((sum, f) => sum + f.montant, 0)
    const montantPaye = filteredFactures.filter((i) => i.statut === "payee").reduce((sum, i) => sum + i.montant, 0)

    return { 
      total, 
      payees, 
      enAttente, 
      enRetard, 
      montantTotal,
      montantPaye,
      montantRestant: montantTotal - montantPaye, }
  }, [filteredFactures])

  const paymentRate = stats.total > 0 ? (stats.payees / stats.total) * 100 : 0

  const handleAddFacture = () => {
    setSelectedFacture(undefined)
    setIsFormOpen(true)
  }

  const handleEditFacture = (facture: Facture) => {
    setSelectedFacture(facture)
    setIsFormOpen(true)
  }

  const handleDeleteFacture = (id: string) => {
    setFactures((prev) => prev.filter((f) => f.id !== id))
    toast({
      title: "Facture supprimée",
      description: "La facture a été supprimée avec succès.",
    })
  }

  const handleSubmitFacture = (factureData: Facture) => {
    if (selectedFacture) {
      // Edit existing facture
      setFactures((prev) =>
        prev.map((f) => (f.id === selectedFacture.id ? { ...factureData, id: selectedFacture.id } : f)),
      )
      toast({
        title: "Facture modifiée",
        description: "La facture a été modifiée avec succès.",
      })
    } else {
      // Add new facture
      const newFacture = {
        ...factureData,
        id: Date.now().toString(),
      }
      setFactures((prev) => [...prev, newFacture])
      toast({
        title: "Facture ajoutée",
        description: "La nouvelle facture a été ajoutée avec succès.",
      })
    }
  }

  const handleExport = (format: "pdf" | "excel") => {
    toast({
      title: `Export ${format.toUpperCase()}`,
      description: `L'export en ${format.toUpperCase()} sera disponible prochainement.`,
    })
  }

  const handleOCRTextExtracted = (text: string) => {
    // In a real implementation, you would parse the extracted text
    // and pre-fill the form with the extracted data
    toast({
      title: "Texte extrait",
      description: "Vous pouvez maintenant créer une facture avec ces informations.",
    })
    handleAddFacture()
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
              <h1 className="text-3xl font-bold text-foreground">Gestion des Factures</h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos factures, suivez les paiements et analysez vos dépenses
              </p>
            </div>
            <Button onClick={handleAddFacture}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </div>

          {/* Statistics cards */}
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

          {/* OCR Uploader */}
          <FactureOCRUploader onTextExtracted={handleOCRTextExtracted} />

          {/* Filters */}
          <FactureFilters onFiltersChange={setFilters} onExport={handleExport} />

          {/* Factures table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des factures</CardTitle>
              <CardDescription>{filteredFactures.length} facture(s) trouvée(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <FactureTable factures={filteredFactures} onEdit={handleEditFacture} onDelete={handleDeleteFacture} />
            </CardContent>
          </Card>

          {/* Form dialog */}
          <FactureForm
            facture={selectedFacture}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={handleSubmitFacture}
          />
        </main>
      </div>
    </div>
  )
}
