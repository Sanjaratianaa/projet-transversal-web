import type { Revenue, RevenueFormData, RevenueStats } from "@/types/revenue"

export const REVENUE_TYPES = [
  { value: "fixe", label: "Fixe" },
  { value: "variable", label: "Variable" },
] as const

export const REVENUE_FREQUENCIES = [
  { value: "mensuelle", label: "Mensuelle" },
  { value: "annuelle", label: "Annuelle" },
  { value: "ponctuelle", label: "Ponctuelle" },
] as const

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("MGA", "Ar")
}

export function validateRevenueForm(data: RevenueFormData): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!data.nom.trim()) {
    errors.nom = "Le nom est requis"
  }

  if (!data.type) {
    errors.type = "Le type est requis"
  }

  if (!data.montant || isNaN(Number(data.montant)) || Number(data.montant) <= 0) {
    errors.montant = "Le montant doit être un nombre positif"
  }

  if (!data.frequence) {
    errors.frequence = "La fréquence est requise"
  }

  if (
    data.plafondActif &&
    (!data.plafondMensuel || isNaN(Number(data.plafondMensuel)) || Number(data.plafondMensuel) <= 0)
  ) {
    errors.plafondMensuel = "Le plafond mensuel doit être un nombre positif"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function calculateRevenueStats(revenues: Revenue[]): RevenueStats {
  const stats = revenues.reduce(
    (acc, revenue) => {
      acc.total += 1
      if (revenue.type === "fixe") acc.fixes += 1
      if (revenue.type === "variable") acc.variables += 1

      acc.montantTotal += revenue.montant

      // Convert to monthly amount for comparison
      if (revenue.frequence === "mensuelle") {
        acc.montantMensuel += revenue.montant
      } else if (revenue.frequence === "annuelle") {
        acc.montantMensuel += revenue.montant / 12
      }

      // Convert to annual amount
      if (revenue.frequence === "annuelle") {
        acc.montantAnnuel += revenue.montant
      } else if (revenue.frequence === "mensuelle") {
        acc.montantAnnuel += revenue.montant * 12
      }

      return acc
    },
    {
      total: 0,
      fixes: 0,
      variables: 0,
      montantTotal: 0,
      montantMensuel: 0,
      montantAnnuel: 0,
    },
  )

  return stats
}

// Mock data for development
export const mockRevenues: Revenue[] = [
  {
    id: "1",
    nom: "Salaire Principal",
    type: "fixe",
    montant: 2500000,
    frequence: "mensuelle",
    plafondActif: false,
    dateCreation: "2024-01-01",
    dateModification: "2024-01-01",
  },
  {
    id: "2",
    nom: "Freelance Développement",
    type: "variable",
    montant: 800000,
    frequence: "mensuelle",
    plafondActif: true,
    plafondMensuel: 1000000,
    dateCreation: "2024-01-15",
    dateModification: "2024-01-15",
  },
  {
    id: "3",
    nom: "Prime Annuelle",
    type: "fixe",
    montant: 5000000,
    frequence: "annuelle",
    plafondActif: false,
    dateCreation: "2024-01-01",
    dateModification: "2024-01-01",
  },
]
