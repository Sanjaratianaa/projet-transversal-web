"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, PlusIcon, SaveIcon, ScanIcon } from "lucide-react"
import type { Invoice, InvoiceFormData } from "@/types/invoice"
import { INVOICE_TYPES, INVOICE_STATUSES, validateInvoiceForm } from "@/lib/invoice-utils"

interface InvoiceFormProps {
  invoice?: Invoice
  onSubmit: (data: InvoiceFormData) => void
  onCancel: () => void
  isLoading?: boolean
  isFromOCR?: boolean
}

export default function InvoiceForm({
  invoice,
  onSubmit,
  onCancel,
  isLoading = false,
  isFromOCR = false,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    fournisseur: invoice?.fournisseur || "",
    type: invoice?.type || "electricite",
    montant: invoice?.montant?.toString() || "",
    dateEmission: invoice?.dateEmission || new Date().toISOString().split("T")[0],
    dateEcheance: invoice?.dateEcheance || "",
    statut: invoice?.statut || "en_attente",
    description: invoice?.description || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleInputChange = (field: keyof InvoiceFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleBlur = (field: keyof InvoiceFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))

    // Validate field on blur
    const validation = validateInvoiceForm(formData)
    if (validation.errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validation.errors[field] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateInvoiceForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      return
    }

    onSubmit(formData)
  }

  const isEditing = !!invoice

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2 text-xl">
          {isFromOCR ? (
            <ScanIcon className="h-5 w-5" />
          ) : isEditing ? (
            <SaveIcon className="h-5 w-5" />
          ) : (
            <PlusIcon className="h-5 w-5" />
          )}
          {isFromOCR ? "Facture scannée" : isEditing ? "Modifier la facture" : "Nouvelle facture"}
        </CardTitle>
        {isFromOCR && (
          <Alert className="mt-2">
            <ScanIcon className="h-4 w-4" />
            <AlertDescription>
              Cette facture a été créée à partir d'un scan OCR. Vérifiez les informations avant de sauvegarder.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fournisseur */}
          <div className="space-y-2">
            <Label htmlFor="fournisseur" className="text-sm font-medium">
              Fournisseur *
            </Label>
            <Input
              id="fournisseur"
              value={formData.fournisseur}
              onChange={(e) => handleInputChange("fournisseur", e.target.value)}
              onBlur={() => handleBlur("fournisseur")}
              placeholder="Ex: EDF, Orange, Veolia..."
              className={errors.fournisseur ? "border-destructive" : ""}
            />
            {errors.fournisseur && touched.fournisseur && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{errors.fournisseur}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Type et Montant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type de facture *
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && touched.type && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errors.type}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant" className="text-sm font-medium">
                Montant (Ar) * {/* Changed from € to Ar */}
              </Label>
              <Input
                id="montant"
                type="number"
                step="0.01"
                min="0"
                value={formData.montant}
                onChange={(e) => handleInputChange("montant", e.target.value)}
                onBlur={() => handleBlur("montant")}
                placeholder="0.00"
                className={errors.montant ? "border-destructive" : ""}
              />
              {errors.montant && touched.montant && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errors.montant}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateEmission" className="text-sm font-medium">
                Date d'émission *
              </Label>
              <div className="relative">
                <Input
                  id="dateEmission"
                  type="date"
                  value={formData.dateEmission}
                  onChange={(e) => handleInputChange("dateEmission", e.target.value)}
                  onBlur={() => handleBlur("dateEmission")}
                  className={errors.dateEmission ? "border-destructive" : ""}
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.dateEmission && touched.dateEmission && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errors.dateEmission}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateEcheance" className="text-sm font-medium">
                Date d'échéance *
              </Label>
              <div className="relative">
                <Input
                  id="dateEcheance"
                  type="date"
                  value={formData.dateEcheance}
                  onChange={(e) => handleInputChange("dateEcheance", e.target.value)}
                  onBlur={() => handleBlur("dateEcheance")}
                  className={errors.dateEcheance ? "border-destructive" : ""}
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.dateEcheance && touched.dateEcheance && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errors.dateEcheance}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="statut" className="text-sm font-medium">
              Statut *
            </Label>
            <Select value={formData.statut} onValueChange={(value) => handleInputChange("statut", value)}>
              <SelectTrigger className={errors.statut ? "border-destructive" : ""}>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${status.color.includes("green") ? "bg-green-500" : status.color.includes("yellow") ? "bg-yellow-500" : "bg-red-500"}`}
                      />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.statut && touched.statut && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{errors.statut}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (optionnel)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Informations complémentaires..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isEditing ? "Modification..." : "Ajout..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isEditing ? <SaveIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                  {isEditing ? "Modifier" : "Ajouter"}
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 sm:flex-initial bg-transparent"
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
