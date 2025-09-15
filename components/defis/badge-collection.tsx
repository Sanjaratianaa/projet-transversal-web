"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target, Award, Crown, Medal } from "lucide-react"

export function BadgeCollection() {
  const badges = [
    {
      id: 1,
      nom: "Premier Pas",
      description: "Créer votre premier objectif",
      icone: Target,
      obtenu: true,
      date_obtention: "2024-01-15",
      rarete: "commun",
    },
    {
      id: 2,
      nom: "Épargnant Régulier",
      description: "Épargner pendant 30 jours consécutifs",
      icone: Star,
      obtenu: true,
      date_obtention: "2024-02-10",
      rarete: "rare",
    },
    {
      id: 3,
      nom: "Maître du Budget",
      description: "Respecter votre budget pendant 3 mois",
      icone: Crown,
      obtenu: false,
      date_obtention: null,
      rarete: "legendaire",
    },
    {
      id: 4,
      nom: "Chasseur d'Objectifs",
      description: "Atteindre 5 objectifs financiers",
      icone: Trophy,
      obtenu: true,
      date_obtention: "2024-03-05",
      rarete: "rare",
    },
    {
      id: 5,
      nom: "Économe Expert",
      description: "Réduire vos dépenses de 20%",
      icone: Medal,
      obtenu: false,
      date_obtention: null,
      rarete: "rare",
    },
    {
      id: 6,
      nom: "Visionnaire Financier",
      description: "Planifier des objectifs à long terme",
      icone: Award,
      obtenu: false,
      date_obtention: null,
      rarete: "legendaire",
    },
  ]

  const getRarityColor = (rarete: string) => {
    switch (rarete) {
      case "commun":
        return "bg-gray-100 text-gray-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "legendaire":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const obtenus = badges.filter((b) => b.obtenu).length
  const total = badges.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-secondary" />
          Collection de Badges
        </CardTitle>
        <CardDescription>
          Vous avez obtenu {obtenus} badges sur {total} disponibles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const IconComponent = badge.icone
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  badge.obtenu
                    ? "border-secondary bg-secondary/5 hover:bg-secondary/10"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                <div className="text-center space-y-2">
                  <div
                    className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      badge.obtenu ? "bg-secondary text-secondary-foreground" : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{badge.nom}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  </div>
                  <Badge className={getRarityColor(badge.rarete)} variant="primary">
                    {badge.rarete}
                  </Badge>
                  {badge.obtenu && badge.date_obtention && (
                    <p className="text-xs text-muted-foreground">
                      Obtenu le {new Date(badge.date_obtention).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
