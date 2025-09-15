"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Target, Calendar, TrendingUp, MoreHorizontal, Edit, Trash2, Plus } from "lucide-react"

interface ObjectifCardProps {
  objectif: {
    id: number
    titre: string
    description: string
    montant_cible: number
    montant_actuel: number
    date_limite: string
    categorie: string
    priorite: string
    statut: string
  }
  onEdit: (objectif: any) => void
  onDelete: (id: number) => void
  onAddFunds: (id: number) => void
}

export function ObjectifCard({ objectif, onEdit, onDelete, onAddFunds }: ObjectifCardProps) {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  const progress = (objectif.montant_actuel / objectif.montant_cible) * 100
  const daysLeft = Math.ceil((new Date(objectif.date_limite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case "elevee":
        return "destructive"
      case "moyenne":
        return "default"
      case "faible":
        return "primary"
      default:
        return "default"
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "atteint":
        return "text-green-600"
      case "en_cours":
        return "text-blue-600"
      case "en_retard":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{objectif.titre}</CardTitle>
            <CardDescription>{objectif.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(objectif)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddFunds(objectif.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter des fonds
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(objectif.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getPriorityColor(objectif.priorite)}>{objectif.priorite}</Badge>
          <Badge variant="outline" className="capitalize">
            {objectif.categorie}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="font-medium text-primary">{formatCurrency(objectif.montant_actuel)}</span>
            <span className="text-muted-foreground">{formatCurrency(objectif.montant_cible)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{daysLeft > 0 ? `${daysLeft} jours restants` : "Échéance dépassée"}</span>
          </div>
          <div className={`flex items-center gap-1 font-medium ${getStatusColor(objectif.statut)}`}>
            <Target className="h-4 w-4" />
            <span className="capitalize">{objectif.statut.replace("_", " ")}</span>
          </div>
        </div>

        {progress >= 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Objectif atteint ! Félicitations !</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
