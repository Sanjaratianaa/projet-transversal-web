"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DefiCard } from "@/components/defis/defi-card"
import { BadgeCollection } from "@/components/defis/badge-collection"
import { Trophy, Target, Star, Award } from "lucide-react"

export default function DefisPage() {
  const [defis, setDefis] = useState([
    {
      id: 1,
      titre: "Économiseur du mois",
      description: "Réduisez vos dépenses de 10% ce mois-ci",
      objectif: 10,
      progres: 7,
      recompense: "Badge Économe",
      difficulte: "moyen",
      date_limite: "2024-12-31",
      statut: "en_cours",
      type: "depense",
    },
    {
      id: 2,
      titre: "Objectif épargne",
      description: "Épargnez 500,000 Ar ce mois",
      objectif: 500000,
      progres: 350000,
      recompense: "Badge Épargnant",
      difficulte: "facile",
      date_limite: "2024-12-31",
      statut: "en_cours",
      type: "epargne",
    },
    {
      id: 3,
      titre: "Maître du budget",
      description: "Respectez votre budget pendant 30 jours",
      objectif: 30,
      progres: 30,
      recompense: "Badge Maître Budget",
      difficulte: "difficile",
      date_limite: "2024-11-30",
      statut: "termine",
      type: "depense",
    },
    {
      id: 4,
      titre: "Revenus supplémentaires",
      description: "Générez 200,000 Ar de revenus supplémentaires",
      objectif: 200000,
      progres: 150000,
      recompense: "Badge Entrepreneur",
      difficulte: "difficile",
      date_limite: "2024-12-31",
      statut: "en_cours",
      type: "revenu",
    },
  ])

  const handleCompleteDefi = (id: number) => {
    setDefis(defis.map((defi) => (defi.id === id ? { ...defi, statut: "termine" } : defi)))
  }

  const defisEnCours = defis.filter((d) => d.statut === "en_cours")
  const defisTermines = defis.filter((d) => d.statut === "termine")

  const stats = {
    total: defis.length,
    termines: defisTermines.length,
    enCours: defisEnCours.length,
    badges: 3, // Nombre de badges obtenus
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Défis & Gamification</h1>
            <p className="text-muted-foreground mt-1">Relevez des défis et gagnez des badges</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Défis totaux</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En cours</CardTitle>
                <Star className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.enCours}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terminés</CardTitle>
                <Trophy className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.termines}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges obtenus</CardTitle>
                <Award className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{stats.badges}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="defis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="defis" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Défis Actifs
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Collection de Badges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="defis" className="space-y-6">
              <Tabs defaultValue="en_cours" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="en_cours">En cours ({defisEnCours.length})</TabsTrigger>
                  <TabsTrigger value="termines">Terminés ({defisTermines.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="en_cours">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {defisEnCours.map((defi) => (
                      <DefiCard key={defi.id} defi={defi} onComplete={handleCompleteDefi} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="termines">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {defisTermines.map((defi) => (
                      <DefiCard key={defi.id} defi={defi} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="badges" className="space-y-6">
              <BadgeCollection />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
