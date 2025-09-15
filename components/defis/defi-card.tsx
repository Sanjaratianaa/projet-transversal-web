"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Star, Calendar, Target, CheckCircle } from "lucide-react"

interface DefiCardProps {
  defi: {
    id: number
    titre: string
    description: string
    objectif: number
    progres: number
    recompense: string
    difficulte: string
    date_limite: string
    statut: string
    type: string
  }
  onComplete?: (id: number) => void
}

export function DefiCard({ defi, onComplete }: DefiCardProps) {
  const progress = (defi.progres / defi.objectif) * 100
  const daysLeft = Math.ceil((new Date(defi.date_limite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const getDifficultyColor = (difficulte: string) => {
    switch (difficulte) {
      case "facile":
        return "bg-green-100 text-green-800"
      case "moyen":
        return "bg-yellow-100 text-yellow-800"
      case "difficile":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "epargne":
        return Target
      case "depense":
        return Trophy
      case "revenu":
        return Star
      default:
        return Target
    }
  }

  const TypeIcon = getTypeIcon(defi.type)

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${defi.statut === "termine" ? "bg-green-50 border-green-200" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-5 w-5 text-secondary" />
              <CardTitle className="text-lg">{defi.titre}</CardTitle>
              {defi.statut === "termine" && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>
            <CardDescription>{defi.description}</CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(defi.difficulte)}>{defi.difficulte}</Badge>
          <Badge variant="outline" className="capitalize">
            {defi.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="font-medium text-primary">{defi.progres}</span>
            <span className="text-muted-foreground">{defi.objectif}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{daysLeft > 0 ? `${daysLeft} jours restants` : "Terminé"}</span>
          </div>
          <div className="flex items-center gap-1 text-secondary font-medium">
            <Trophy className="h-4 w-4" />
            <span>{defi.recompense}</span>
          </div>
        </div>

        {progress >= 100 && defi.statut !== "termine" && (
          <Button onClick={() => onComplete?.(defi.id)} className="w-full bg-secondary hover:bg-secondary/90">
            <Trophy className="h-4 w-4 mr-2" />
            Réclamer la récompense
          </Button>
        )}

        {defi.statut === "termine" && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Défi terminé ! Récompense obtenue</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
