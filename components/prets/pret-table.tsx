"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Calculator, Calendar } from "lucide-react"
import { differenceInMonths } from "date-fns"

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

interface PretTableProps {
  prets: Pret[]
  onEdit: (pret: Pret) => void
  onDelete: (id: string) => void
  onSimulate: (pret: Pret) => void
  onViewCalendar: (pret: Pret) => void
}

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case "actif":
      return <Badge className="bg-primary text-primary-foreground">Actif</Badge>
    case "termine":
      return (
        <Badge variant="outline" className="border-secondary text-secondary">
          Terminé
        </Badge>
      )
    case "suspendu":
      return <Badge variant="destructive">Suspendu</Badge>
    default:
      return <Badge variant="primary">{statut}</Badge>
  }
}

export function PretTable({ prets, onEdit, onDelete, onSimulate, onViewCalendar }: PretTableProps) {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  const calculateProgress = (pret: Pret) => {
    if (pret.statut === "termine") return 100
    if (pret.statut === "suspendu") return 0

    const monthsElapsed = differenceInMonths(new Date(), pret.dateDebut)
    const progress = Math.max(0, Math.min(100, (monthsElapsed / pret.duree) * 100))
    return progress
  }

  const calculateRemainingAmount = (pret: Pret) => {
    if (pret.statut === "termine") return 0
    if (!pret.montantTotal) return pret.montant

    const progress = calculateProgress(pret)
    const amountPaid = (pret.montantTotal * progress) / 100
    return Math.max(0, pret.montantTotal - amountPaid)
  }

  if (prets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun prêt trouvé</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Créancier</TableHead>
            <TableHead>Montant initial</TableHead>
            <TableHead>Taux</TableHead>
            <TableHead>Mensualité</TableHead>
            <TableHead>Progression</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prets.map((pret) => {
            const progress = calculateProgress(pret)
            const remainingAmount = calculateRemainingAmount(pret)

            return (
              <TableRow key={pret.id}>
                <TableCell className="font-medium">{pret.creancier}</TableCell>
                <TableCell className="font-mono">{formatCurrency(pret.montant)}</TableCell>
                <TableCell>{pret.taux}%</TableCell>
                <TableCell className="font-mono">{formatCurrency(pret.mensualite || 0)}</TableCell>
                <TableCell>
                  <div className="space-y-2 min-w-[120px]">
                    <div className="flex items-center justify-between text-sm">
                      <span>{progress.toFixed(0)}%</span>
                      <span className="text-muted-foreground">{formatCurrency(remainingAmount)} restant</span>
                    </div>
                    <Progress
                      value={progress}
                      className={`h-2 ${
                        pret.statut === "termine"
                          ? "[&>div]:bg-primary"
                          : pret.statut === "suspendu"
                            ? "[&>div]:bg-destructive"
                            : "[&>div]:bg-secondary"
                      }`}
                    />
                  </div>
                </TableCell>
                <TableCell>{getStatutBadge(pret.statut)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(pret)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSimulate(pret)}>
                        <Calculator className="mr-2 h-4 w-4" />
                        Simuler
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewCalendar(pret)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendrier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(pret.id)} className="text-destructive">
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
