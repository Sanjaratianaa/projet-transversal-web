"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon, EditIcon, TrashIcon, EyeIcon } from "lucide-react"
import type { Revenue, RevenueFormData } from "@/types/revenue"
import { formatCurrency, REVENUE_TYPES, REVENUE_FREQUENCIES } from "@/lib/revenue-utils"
import RevenueFormDialog from "./depense-form-dialog"

interface RevenueTableProps {
  revenues: Revenue[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onUpdateRevenue: (id: string, data: RevenueFormData) => void
  onDeleteRevenue: (id: string) => void
}

export default function RevenueTable({
  revenues,
  currentPage,
  totalPages,
  onPageChange,
  onUpdateRevenue,
  onDeleteRevenue,
}: RevenueTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [revenueToDelete, setRevenueToDelete] = useState<Revenue | null>(null)

  const handleDeleteClick = (revenue: Revenue) => {
    setRevenueToDelete(revenue)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (revenueToDelete) {
      onDeleteRevenue(revenueToDelete.id)
      setDeleteDialogOpen(false)
      setRevenueToDelete(null)
    }
  }

  const getTypeLabel = (type: string) => {
    return REVENUE_TYPES.find((t) => t.value === type)?.label || type
  }

  const getFrequenceLabel = (frequence: string) => {
    return REVENUE_FREQUENCIES.find((f) => f.value === frequence)?.label || frequence
  }

  if (revenues.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Aucune source de revenus trouvée</h3>
            <p className="text-muted-foreground">Commencez par ajouter votre première source de revenus.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sources de revenus</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Plafond</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenues.map((revenue) => (
                  <TableRow key={revenue.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{revenue.nom}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(revenue.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{formatCurrency(revenue.montant)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {getFrequenceLabel(revenue.frequence)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {revenue.plafondActif && revenue.plafondMensuel ? (
                        <Badge variant="outline" className="text-xs text-orange-600">
                          {formatCurrency(revenue.plafondMensuel)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Aucun</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {/* Voir les détails */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Voir les détails
                        </Button>

                        {/* Modifier */}
                        <RevenueFormDialog
                          revenue={revenue}
                          onSubmit={(data) => onUpdateRevenue(revenue.id, data)}
                          trigger={
                            <Button variant="ghost" size="sm" className="justify-start">
                              <EditIcon className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                          }
                        />

                        {/* Supprimer */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(revenue)}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la source de revenus</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la source <strong>{revenueToDelete?.nom}</strong> d'un montant de{" "}
              <strong>{revenueToDelete ? formatCurrency(revenueToDelete.montant) : ""}</strong> ?
              <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
