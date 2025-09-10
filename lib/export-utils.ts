import type { Invoice } from "@/types/invoice"
import { formatCurrency, formatDate, INVOICE_TYPES, INVOICE_STATUSES } from "./invoice-utils"

export type ExportFormat = "pdf" | "excel" | "csv"

export interface ExportOptions {
  format: ExportFormat
  includeColumns: string[]
  dateFormat: "short" | "long"
  includeStats: boolean
  filename?: string
}

export const EXPORT_COLUMNS = [
  { key: "fournisseur", label: "Fournisseur" },
  { key: "type", label: "Type" },
  { key: "montant", label: "Montant" },
  { key: "dateEmission", label: "Date d'émission" },
  { key: "dateEcheance", label: "Date d'échéance" },
  { key: "statut", label: "Statut" },
  { key: "description", label: "Description" },
]

export function getTypeLabel(type: string): string {
  return INVOICE_TYPES.find((t) => t.value === type)?.label || type
}

export function getStatusLabel(status: string): string {
  return INVOICE_STATUSES.find((s) => s.value === status)?.label || status
}

export function formatInvoiceForExport(invoice: Invoice, options: ExportOptions) {
  const formatted: Record<string, any> = {}

  if (options.includeColumns.includes("fournisseur")) {
    formatted.fournisseur = invoice.fournisseur
  }
  if (options.includeColumns.includes("type")) {
    formatted.type = getTypeLabel(invoice.type)
  }
  if (options.includeColumns.includes("montant")) {
    formatted.montant = formatCurrency(invoice.montant)
  }
  if (options.includeColumns.includes("dateEmission")) {
    formatted.dateEmission = options.dateFormat === "long" ? formatDate(invoice.dateEmission) : invoice.dateEmission
  }
  if (options.includeColumns.includes("dateEcheance")) {
    formatted.dateEcheance = options.dateFormat === "long" ? formatDate(invoice.dateEcheance) : invoice.dateEcheance
  }
  if (options.includeColumns.includes("statut")) {
    formatted.statut = getStatusLabel(invoice.statut)
  }
  if (options.includeColumns.includes("description")) {
    formatted.description = invoice.description || ""
  }

  return formatted
}

export function exportToCSV(invoices: Invoice[], options: ExportOptions): void {
  const headers = options.includeColumns.map((col) => EXPORT_COLUMNS.find((c) => c.key === col)?.label || col)

  const rows = invoices.map((invoice) => {
    const formatted = formatInvoiceForExport(invoice, options)
    return options.includeColumns.map((col) => formatted[col] || "")
  })

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", options.filename || `factures_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportToPDF(invoices: Invoice[], options: ExportOptions): Promise<void> {
  // Mock PDF export - in real implementation, would use jsPDF
  const headers = options.includeColumns.map((col) => EXPORT_COLUMNS.find((c) => c.key === col)?.label || col)

  const rows = invoices.map((invoice) => {
    const formatted = formatInvoiceForExport(invoice, options)
    return options.includeColumns.map((col) => formatted[col] || "")
  })

  // Simulate PDF generation
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Create a simple text representation for demo
  const content = [
    "RAPPORT DE FACTURES",
    "===================",
    "",
    `Généré le: ${new Date().toLocaleDateString("fr-FR")}`,
    `Nombre de factures: ${invoices.length}`,
    "",
    headers.join(" | "),
    "-".repeat(headers.join(" | ").length),
    ...rows.map((row) => row.join(" | ")),
  ].join("\n")

  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", options.filename || `factures_${new Date().toISOString().split("T")[0]}.txt`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportToExcel(invoices: Invoice[], options: ExportOptions): Promise<void> {
  // Mock Excel export - in real implementation, would use xlsx library
  const headers = options.includeColumns.map((col) => EXPORT_COLUMNS.find((c) => c.key === col)?.label || col)

  const rows = invoices.map((invoice) => {
    const formatted = formatInvoiceForExport(invoice, options)
    return options.includeColumns.map((col) => formatted[col] || "")
  })

  // Simulate Excel generation
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Create CSV format as fallback for demo
  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", options.filename || `factures_${new Date().toISOString().split("T")[0]}.xlsx`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function performExport(invoices: Invoice[], options: ExportOptions): Promise<void> {
  switch (options.format) {
    case "csv":
      exportToCSV(invoices, options)
      break
    case "pdf":
      await exportToPDF(invoices, options)
      break
    case "excel":
      await exportToExcel(invoices, options)
      break
    default:
      throw new Error(`Format d'export non supporté: ${options.format}`)
  }
}
