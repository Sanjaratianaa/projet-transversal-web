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
import type { Invoice, InvoiceFormData } from "@/types/invoice"
import { formatCurrency, formatDate, getStatusColor, INVOICE_TYPES } from "@/lib/invoice-utils"
import InvoiceFormDialog from "./invoice-form-dialog"

interface InvoiceTableProps {
  invoices: Invoice[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onUpdateInvoice: (id: string, data: InvoiceFormData) => void
  onDeleteInvoice: (id: string) => void
}

export default function InvoiceTable({
  invoices,
  currentPage,
  totalPages,
  onPageChange,
  onUpdateInvoice,
  onDeleteInvoice,
}: InvoiceTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      onDeleteInvoice(invoiceToDelete.id)
      setDeleteDialogOpen(false)
      setInvoiceToDelete(null)
    }
  }

  const getTypeLabel = (type: string) => {
    return INVOICE_TYPES.find((t) => t.value === type)?.label || type
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Aucune facture trouvée</h3>
            <p className="text-muted-foreground">Commencez par ajouter votre première facture.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Date d'échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.fournisseur}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(invoice.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{formatCurrency(invoice.montant)}</TableCell>
                    <TableCell>{formatDate(invoice.dateEmission)}</TableCell>
                    <TableCell>{formatDate(invoice.dateEcheance)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.statut)}>
                        {invoice.statut === "payee"
                          ? "Payée"
                          : invoice.statut === "en_attente"
                            ? "En attente"
                            : "En retard"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {/* Voir les détails */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start"
                          onClick={() => console.log("Voir", invoice.id)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Voir les détails
                        </Button>

                        {/* Modifier */}
                        <InvoiceFormDialog
                          invoice={invoice}
                          onSubmit={(data) => onUpdateInvoice(invoice.id, data)}
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
                          onClick={() => handleDeleteClick(invoice)}
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
            <AlertDialogTitle>Supprimer la facture</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la facture de <strong>{invoiceToDelete?.fournisseur}</strong> d'un
              montant de <strong>{invoiceToDelete ? formatCurrency(invoiceToDelete.montant) : ""}</strong> ?
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
