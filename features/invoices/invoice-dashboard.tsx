"use client"
import { Button } from "@/components/ui/button"
import { PlusIcon, DownloadIcon, ScanIcon } from "lucide-react"
import InvoiceStats from "./invoice-stats"
import InvoiceFiltersComponent from "./invoice-filters"
import InvoiceTable from "./invoice-table"
import InvoiceFormDialog from "./invoice-form-dialog"
import OCRScannerDialog from "@/features/ocr/ocr-scanner-dialog"
import ExportDialog from "@/features/export/export-dialog"
import { useInvoices } from "@/hooks/use-invoices"
import type { InvoiceFormData } from "@/types/invoice"

export default function InvoiceDashboard() {
  const {
    invoices,
    allInvoices,
    filters,
    currentPage,
    totalPages,
    stats,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateFilters,
    clearFilters,
    setCurrentPage,
  } = useInvoices()

  console.log(invoices)

  const handleAddInvoice = (data: InvoiceFormData) => {
    addInvoice(data)
  }

  const handleUpdateInvoice = (id: string, data: InvoiceFormData) => {
    updateInvoice(id, data)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Factures</h1>
          <p className="text-muted-foreground">Gérez vos factures et suivez vos dépenses</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDialog invoices={allInvoices}>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <DownloadIcon className="h-4 w-4" />
              Exporter
            </Button>
          </ExportDialog>
          <OCRScannerDialog onSubmit={handleAddInvoice}>
            <Button variant="outline" className="bg-transparent">
              <ScanIcon className="h-4 w-4 mr-2" />
              Scanner
            </Button>
          </OCRScannerDialog>
          {/* <InvoiceFormDialog onSubmit={handleAddInvoice}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle facture
            </Button>
          </InvoiceFormDialog> */}
        </div>
      </div>

      {/* Statistics */}
      <InvoiceStats stats={stats} />

      {/* Filters */}
      <InvoiceFiltersComponent
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        totalCount={stats.total}
        filteredCount={allInvoices.length}
      />

      {/* Table */}
      <InvoiceTable
        invoices={invoices}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onUpdateInvoice={handleUpdateInvoice}
        onDeleteInvoice={deleteInvoice}
      />
    </div>
  )
}
