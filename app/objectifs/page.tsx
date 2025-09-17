"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ObjectifForm } from "@/components/objectifs/objectif-form"
import { ObjectifCard } from "@/components/objectifs/objectif-card"
import { Plus, Target, Trophy } from "lucide-react"

export default function ObjectifsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingObjectif, setEditingObjectif] = useState(null)
  const [objectifs, setObjectifs] = useState([
    {
      id: 1,
      titre: "Achat d'une voiture",
      description: "Économiser pour acheter une voiture neuve",
      montant_cible: 15000000,
      montant_actuel: 8500000,
      date_limite: "2024-12-31",
      categorie: "transport",
      priorite: "elevee",
      statut: "en_cours",
      date_creation: "2024-01-15",
    },
    {
      id: 2,
      titre: "Fonds d'urgence",
      description: "Constituer un fonds d'urgence de 6 mois de salaire",
      montant_cible: 3000000,
      montant_actuel: 3000000,
      date_limite: "2024-06-30",
      categorie: "urgence",
      priorite: "elevee",
      statut: "atteint",
      date_creation: "2024-01-01",
    },
    {
      id: 3,
      titre: "Vacances en famille",
      description: "Voyage de vacances pour toute la famille",
      montant_cible: 2500000,
      montant_actuel: 1200000,
      date_limite: "2024-07-15",
      categorie: "loisirs",
      priorite: "moyenne",
      statut: "en_cours",
      date_creation: "2024-02-01",
    },
  ])

  const handleSubmit = (objectifData: any) => {
    if (editingObjectif) {
      setObjectifs(objectifs.map((obj) => (obj.id === editingObjectif.id ? objectifData : obj)))
      setEditingObjectif(null)
    } else {
      setObjectifs([...objectifs, objectifData])
    }
    setShowForm(false)
  }

  const handleEdit = (objectif: any) => {
    setEditingObjectif(objectif)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    setObjectifs(objectifs.filter((obj) => obj.id !== id))
  }

  const handleAddFunds = (id: number) => {
    // Simulation d'ajout de fonds
    const montant = prompt("Montant à ajouter (Ar):")
    if (montant && !isNaN(Number(montant))) {
      setObjectifs(
        objectifs.map((obj) =>
          obj.id === id ? { ...obj, montant_actuel: obj.montant_actuel + Number(montant) } : obj,
        ),
      )
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingObjectif(null)
  }

  const objectifsEnCours = objectifs.filter((obj) => obj.statut === "en_cours")
  const objectifsAtteints = objectifs.filter((obj) => obj.statut === "atteint")

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Objectifs Financiers</h1>
              <p className="text-muted-foreground mt-1">Définissez et suivez vos objectifs d'épargne</p>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel objectif
              </Button>
            )}
          </div>

          {showForm && <ObjectifForm onSubmit={handleSubmit} onCancel={handleCancel} initialData={editingObjectif} />}

          {!showForm && (
            <Tabs defaultValue="en_cours" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="en_cours" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  En cours ({objectifsEnCours.length})
                </TabsTrigger>
                <TabsTrigger value="atteints" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Atteints ({objectifsAtteints.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="en_cours" className="space-y-6">
                {objectifsEnCours.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">Aucun objectif en cours</h3>
                    <p className="text-muted-foreground mt-1">Créez votre premier objectif pour commencer</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {objectifsEnCours.map((objectif) => (
                      <ObjectifCard
                        key={objectif.id}
                        objectif={objectif}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddFunds={handleAddFunds}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="atteints" className="space-y-6">
                {objectifsAtteints.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">Aucun objectif atteint</h3>
                    <p className="text-muted-foreground mt-1">Continuez vos efforts pour atteindre vos objectifs</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {objectifsAtteints.map((objectif) => (
                      <ObjectifCard
                        key={objectif.id}
                        objectif={objectif}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddFunds={handleAddFunds}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  )
}
