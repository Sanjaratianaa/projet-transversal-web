export interface Revenue {
  id: string
  nom: string
  type: "fixe" | "variable"
  montant: number
  frequence: "mensuelle" | "annuelle" | "ponctuelle"
  plafondActif: boolean
  plafondMensuel?: number
  dateCreation: string
  dateModification: string
}

export interface RevenueFormData {
  nom: string
  type: "fixe" | "variable"
  montant: string
  frequence: "mensuelle" | "annuelle" | "ponctuelle"
  plafondActif: boolean
  plafondMensuel?: string
}

export interface RevenueFilters {
  nom?: string
  type?: "fixe" | "variable"
  frequence?: "mensuelle" | "annuelle" | "ponctuelle"
}

export interface RevenueStats {
  total: number
  fixes: number
  variables: number
  montantTotal: number
  montantMensuel: number
  montantAnnuel: number
}

export interface GlobalCeiling {
  plafond: number
  utilisation: number
  pourcentage: number
}
