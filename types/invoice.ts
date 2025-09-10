export type InvoiceType = "electricite" | "eau" | "internet" | "gaz" | "telephone" | "assurance" | "autre"

export type InvoiceStatus = "payee" | "en_attente" | "en_retard"

export interface Invoice {
  id: string
  fournisseur: string
  type: InvoiceType
  montant: number
  dateEmission: string
  dateEcheance: string
  statut: InvoiceStatus
  description?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceFilters {
  type?: InvoiceType
  statut?: InvoiceStatus
  dateDebut?: string
  dateFin?: string
  fournisseur?: string
}

export interface InvoiceFormData {
  fournisseur: string
  type: InvoiceType
  montant: string
  dateEmission: string
  dateEcheance: string
  statut: InvoiceStatus
  description?: string
}

export interface OCRResult {
  fournisseur?: string
  montant?: number
  dateEmission?: string
  dateEcheance?: string
  confidence: number
}
