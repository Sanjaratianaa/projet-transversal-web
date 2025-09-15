"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, TrashIcon, EditIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import FactureFormDialog from "./facture-form-dialog"

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

interface FactureTableProps {
  factures: Facture[]
  onEdit: (facture: Facture) => void
  onDelete: (id: string) => void
}

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case "payee":
      return <Badge className="bg-primary text-primary-foreground">Payée</Badge>
    case "en_attente":
      return (
        <Badge variant="outline" className="border-secondary text-secondary">
          En attente
        </Badge>
      )
    case "en_retard":
      return <Badge variant="destructive">En retard</Badge>
    default:
      return <Badge variant="primary">{statut}</Badge>
  }
}

const getTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    electricite: "Électricité",
    eau: "Eau",
    internet: "Internet",
    telephone: "Téléphone",
    gaz: "Gaz",
    assurance: "Assurance",
    loyer: "Loyer",
    autre: "Autre",
  }
  return types[type] || type
}

export function FactureTable({ factures, onEdit, onDelete }: FactureTableProps) {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  if (factures.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune facture trouvée</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Date d'émission</TableHead>
            <TableHead>Date d'échéance</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {factures.map((facture) => (
            <TableRow key={facture.id}>
              <TableCell className="font-medium">{facture.fournisseur}</TableCell>
              <TableCell>{getTypeLabel(facture.type)}</TableCell>
              <TableCell className="font-mono">{formatCurrency(facture.montant)}</TableCell>
              <TableCell>{format(facture.dateEmission, "dd/MM/yyyy", { locale: fr })}</TableCell>
              <TableCell>{format(facture.dateEcheance, "dd/MM/yyyy", { locale: fr })}</TableCell>
              <TableCell>{getStatutBadge(facture.statut)}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  {/* Modifier */}
                  <FactureFormDialog
                    facture={facture}
                    onSubmit={() => onEdit(facture)}
                    trigger={
                      <Button variant="ghost" size="sm" className="justify-start">
                        <EditIcon className="h-4 w-4 mr-2" />
                      </Button>
                    } 
                  />

                  {/* Supprimer */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(facture.id)}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(facture)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(facture.id)} className="text-destructive">
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
