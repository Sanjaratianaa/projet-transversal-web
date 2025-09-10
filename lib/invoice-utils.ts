import type { Invoice, InvoiceStatus, InvoiceType } from "@/types/invoice"

export const INVOICE_TYPES: { value: InvoiceType; label: string }[] = [
  { value: "electricite", label: "Électricité" },
  { value: "eau", label: "Eau" },
  { value: "internet", label: "Internet" },
  { value: "gaz", label: "Gaz" },
  { value: "telephone", label: "Téléphone" },
  { value: "assurance", label: "Assurance" },
  { value: "autre", label: "Autre" },
]

export const INVOICE_STATUSES: { value: InvoiceStatus; label: string; color: string }[] = [
  { value: "payee", label: "Payée", color: "bg-green-100 text-green-800" },
  { value: "en_attente", label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { value: "en_retard", label: "En retard", color: "bg-red-100 text-red-800" },
]

export function validateInvoiceForm(data: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!data.fournisseur?.trim()) {
    errors.fournisseur = "Le fournisseur est requis"
  }

  if (!data.type) {
    errors.type = "Le type de facture est requis"
  }

  const montant = Number.parseFloat(data.montant)
  if (!data.montant || isNaN(montant) || montant <= 0) {
    errors.montant = "Le montant doit être supérieur à 0"
  }

  if (!data.dateEmission) {
    errors.dateEmission = "La date d'émission est requise"
  }

  if (!data.dateEcheance) {
    errors.dateEcheance = "La date d'échéance est requise"
  }

  if (data.dateEmission && data.dateEcheance && new Date(data.dateEmission) > new Date(data.dateEcheance)) {
    errors.dateEcheance = "La date d'échéance doit être postérieure à la date d'émission"
  }

  if (!data.statut) {
    errors.statut = "Le statut est requis"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MGA", // Changed from EUR to MGA (Ariary)
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(dateString))
}

export function getStatusColor(status: InvoiceStatus): string {
  const statusConfig = INVOICE_STATUSES.find((s) => s.value === status)
  return statusConfig?.color || "bg-gray-100 text-gray-800"
}

export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.statut === "payee") return false
  return new Date(invoice.dateEcheance) < new Date()
}

export function generateInvoiceId(): string {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
