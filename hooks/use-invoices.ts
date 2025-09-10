"use client"

import { useState, useCallback, useMemo } from "react"
import type { Invoice, InvoiceFilters, InvoiceFormData } from "@/types/invoice"
import { validateInvoiceForm, generateInvoiceId, isInvoiceOverdue } from "@/lib/invoice-utils"

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filters, setFilters] = useState<InvoiceFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Mock data for development
  const mockInvoices: Invoice[] = [
    {
      id: "INV-001",
      fournisseur: "EDF",
      type: "electricite",
      montant: 89.5,
      dateEmission: "2024-01-15",
      dateEcheance: "2024-02-15",
      statut: "payee",
      description: "Facture électricité janvier 2024",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "INV-002",
      fournisseur: "Orange",
      type: "internet",
      montant: 39.99,
      dateEmission: "2024-01-20",
      dateEcheance: "2024-02-20",
      statut: "en_attente",
      description: "Abonnement internet février 2024",
      createdAt: "2024-01-20T10:00:00Z",
      updatedAt: "2024-01-20T10:00:00Z",
    },
    {
      id: "INV-003",
      fournisseur: "Veolia",
      type: "eau",
      montant: 45.3,
      dateEmission: "2024-01-10",
      dateEcheance: "2024-01-25",
      statut: "en_retard",
      description: "Facture eau janvier 2024",
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-10T10:00:00Z",
    },
  ]

  // Initialize with mock data
  useState(() => {
    if (invoices.length === 0) {
      setInvoices(mockInvoices)
    }
  })

  const filteredInvoices = useMemo(() => {
    let filtered = invoices

    if (filters.type) {
      filtered = filtered.filter((invoice) => invoice.type === filters.type)
    }

    if (filters.statut) {
      filtered = filtered.filter((invoice) => invoice.statut === filters.statut)
    }

    if (filters.fournisseur) {
      filtered = filtered.filter((invoice) =>
        invoice.fournisseur.toLowerCase().includes(filters.fournisseur!.toLowerCase()),
      )
    }

    if (filters.dateDebut) {
      filtered = filtered.filter((invoice) => new Date(invoice.dateEmission) >= new Date(filters.dateDebut!))
    }

    if (filters.dateFin) {
      filtered = filtered.filter((invoice) => new Date(invoice.dateEmission) <= new Date(filters.dateFin!))
    }

    // Update overdue status
    filtered = filtered.map((invoice) => ({
      ...invoice,
      statut: isInvoiceOverdue(invoice) && invoice.statut !== "payee" ? "en_retard" : invoice.statut,
    }))

    return filtered.sort((a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime())
  }, [invoices, filters])

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredInvoices, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)

  const addInvoice = useCallback((formData: InvoiceFormData) => {
    const validation = validateInvoiceForm(formData)
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(", "))
    }

    const newInvoice: Invoice = {
      id: generateInvoiceId(),
      fournisseur: formData.fournisseur.trim(),
      type: formData.type,
      montant: Number.parseFloat(formData.montant),
      dateEmission: formData.dateEmission,
      dateEcheance: formData.dateEcheance,
      statut: formData.statut,
      description: formData.description?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setInvoices((prev) => [newInvoice, ...prev])
    return newInvoice
  }, [])

  const updateInvoice = useCallback((id: string, formData: InvoiceFormData) => {
    const validation = validateInvoiceForm(formData)
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(", "))
    }

    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              fournisseur: formData.fournisseur.trim(),
              type: formData.type,
              montant: Number.parseFloat(formData.montant),
              dateEmission: formData.dateEmission,
              dateEcheance: formData.dateEcheance,
              statut: formData.statut,
              description: formData.description?.trim(),
              updatedAt: new Date().toISOString(),
            }
          : invoice,
      ),
    )
  }, [])

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
  }, [])

  const updateFilters = useCallback((newFilters: InvoiceFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setCurrentPage(1)
  }, [])

  const stats = useMemo(() => {
    const total = invoices.length
    const payees = invoices.filter((i) => i.statut === "payee").length
    const enAttente = invoices.filter((i) => i.statut === "en_attente").length
    const enRetard = invoices.filter((i) => i.statut === "en_retard").length
    const montantTotal = invoices.reduce((sum, i) => sum + i.montant, 0)
    const montantPaye = invoices.filter((i) => i.statut === "payee").reduce((sum, i) => sum + i.montant, 0)

    return {
      total,
      payees,
      enAttente,
      enRetard,
      montantTotal,
      montantPaye,
      montantRestant: montantTotal - montantPaye,
    }
  }, [invoices])

  return {
    invoices: paginatedInvoices,
    allInvoices: filteredInvoices,
    filters,
    currentPage,
    totalPages,
    itemsPerPage,
    stats,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateFilters,
    clearFilters,
    setCurrentPage,
  }
}
