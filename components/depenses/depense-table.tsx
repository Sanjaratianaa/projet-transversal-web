"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Depense {
  id: string
  description: string
  categorie: string
  montant: number
  type: "fixe" | "variable"
  frequence: "unique" | "mensuelle" | "annuelle" | "hebdomadaire"
  date: Date
  notes?: string
}

interface DepenseTableProps {
  depenses: Depense[]
  onEdit: (depense: Depense) => void
  onDelete: (id: string) => void
}

const getCategorieLabel = (categorie: string) => {
  const categories: Record<string, string> = {
    alimentation: "Alimentation",
    transport: "Transport",
    logement: "Logement",
    sante: "Santé",
    education: "Éducation",
    loisirs: "Loisirs",
    vetements: "Vêtements",
    services: "Services",
    autre: "Autre",
  }
  return categories[categorie] || categorie
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
    unique: "Unique",
    hebdomadaire: "Hebdomadaire",
    mensuelle: "Mensuelle",
    annuelle: "Annuelle",
  }
  return frequences[frequence] || frequence
}

export function DepenseTable({ depenses, onEdit, onDelete }: DepenseTableProps) {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  if (depenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune dépense trouvée</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Fréquence</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {depenses.map((depense) => (
            <TableRow key={depense.id}>
              <TableCell className="font-medium">{depense.description}</TableCell>
              <TableCell>{getCategorieLabel(depense.categorie)}</TableCell>
              <TableCell className="font-mono">{formatCurrency(depense.montant)}</TableCell>
              <TableCell>{getTypeBadge(depense.type)}</TableCell>
              <TableCell>{getFrequenceLabel(depense.frequence)}</TableCell>
              <TableCell>{format(depense.date, "dd/MM/yyyy", { locale: fr })}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(depense)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(depense.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
