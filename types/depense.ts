export interface Depense {
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

export interface DepenseFormData {
  nom: string
  type: "fixe" | "variable"
  montant: string
  frequence: "mensuelle" | "annuelle" | "ponctuelle"
  plafondActif: boolean
  plafondMensuel?: string
}

export interface DepenseFilters {
  nom?: string
  type?: "fixe" | "variable"
  frequence?: "mensuelle" | "annuelle" | "ponctuelle"
}

export interface DepenseStats {
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
