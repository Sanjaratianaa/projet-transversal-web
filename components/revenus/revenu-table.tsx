"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

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

interface RevenuTableProps {
  revenus: Revenu[]
  onEdit: (revenu: Revenu) => void
  onDelete: (id: string) => void
  utilisationActuelle?: Record<string, number> // Current usage by revenue ID
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case "fixe":
      return <Badge className="bg-primary text-primary-foreground">Fixe</Badge>
    case "variable":
      return (
        <Badge variant="outline" className="border-secondary text-secondary">
          Variable
        </Badge>
      )
    default:
      return <Badge variant="primary">{type}</Badge>
  }
}

const getFrequenceLabel = (frequence: string) => {
  const frequences: Record<string, string> = {
    mensuelle: "Mensuelle",
    annuelle: "Annuelle",
    ponctuelle: "Ponctuelle",
  }
  return frequences[frequence] || frequence
}

export function RevenuTable({ revenus, onEdit, onDelete, utilisationActuelle = {} }: RevenuTableProps) {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  if (revenus.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun revenu trouvé</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Fréquence</TableHead>
            <TableHead>Utilisation</TableHead>
            <TableHead>Date début</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenus.map((revenu) => {
            const utilisation = utilisationActuelle[revenu.id] || 0
            const montantUtilise = (revenu.montant * utilisation) / 100
            const montantRestant = revenu.montant - montantUtilise

            return (
              <TableRow key={revenu.id}>
                <TableCell className="font-medium">{revenu.nom}</TableCell>
                <TableCell>{getTypeBadge(revenu.type)}</TableCell>
                <TableCell className="font-mono">{formatCurrency(revenu.montant)}</TableCell>
                <TableCell>{getFrequenceLabel(revenu.frequence)}</TableCell>
                <TableCell>
                  <div className="space-y-2 min-w-[120px]">
                    <div className="flex items-center justify-between text-sm">
                      <span>{utilisation.toFixed(0)}%</span>
                      <span className="text-muted-foreground">{formatCurrency(montantRestant)} restant</span>
                    </div>
                    <Progress
                      value={Math.min(utilisation, 100)}
                      className={`h-2 ${
                        utilisation >= revenu.plafondUtilisation
                          ? "[&>div]:bg-destructive"
                          : utilisation >= revenu.plafondUtilisation * 0.8
                            ? "[&>div]:bg-secondary"
                            : "[&>div]:bg-primary"
                      }`}
                    />
                  </div>
                </TableCell>
                <TableCell>{format(revenu.dateDebut, "dd/MM/yyyy", { locale: fr })}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(revenu)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(revenu.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
