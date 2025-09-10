"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusIcon, SaveIcon, InfoIcon } from "lucide-react"
import type { Revenue, RevenueFormData } from "@/types/revenue"
import { REVENUE_TYPES, REVENUE_FREQUENCIES, validateRevenueForm } from "@/lib/revenue-utils"

interface RevenueFormProps {
  revenue?: Revenue
  onSubmit: (data: RevenueFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function RevenueForm({ revenue, onSubmit, onCancel, isLoading = false }: RevenueFormProps) {
  const [formData, setFormData] = useState<RevenueFormData>({
    nom: revenue?.nom || "",
    type: revenue?.type || "fixe",
    montant: revenue?.montant?.toString() || "",
    frequence: revenue?.frequence || "mensuelle",
    plafondActif: revenue?.plafondActif || false,
    plafondMensuel: revenue?.plafondMensuel?.toString() || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleInputChange = (field: keyof RevenueFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleBlur = (field: keyof RevenueFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))

    const validation = validateRevenueForm(formData)
    if (validation.errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validation.errors[field] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateRevenueForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      return
    }

    onSubmit(formData)
  }

  const isEditing = !!revenue

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2 text-xl">
          {isEditing ? <SaveIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
          {isEditing ? "Modifier la source de revenus" : "Nouvelle source de revenus"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm font-medium">
              Nom de la source *
            </Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => handleInputChange("nom", e.target.value)}
              onBlur={() => handleBlur("nom")}
              placeholder="Ex: Salaire, Freelance, Prime..."
              className={errors.nom ? "border-destructive" : ""}
            />
            {errors.nom && touched.nom && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{errors.nom}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Type et Montant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type de revenus *
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_TYPES.map((type) => (
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
                Montant (Ar) *
              </Label>
              <Input
                id="montant"
                type="number"
                step="1"
                min="0"
                value={formData.montant}
                onChange={(e) => handleInputChange("montant", e.target.value)}
                onBlur={() => handleBlur("montant")}
                placeholder="0"
                className={errors.montant ? "border-destructive" : ""}
              />
              {errors.montant && touched.montant && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errors.montant}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Fréquence */}
          <div className="space-y-2">
            <Label htmlFor="frequence" className="text-sm font-medium">
              Fréquence *
            </Label>
            <Select value={formData.frequence} onValueChange={(value) => handleInputChange("frequence", value)}>
              <SelectTrigger className={errors.frequence ? "border-destructive" : ""}>
                <SelectValue placeholder="Sélectionner une fréquence" />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.frequence && touched.frequence && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{errors.frequence}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Plafond */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="plafondActif"
                checked={formData.plafondActif}
                onCheckedChange={(checked) => handleInputChange("plafondActif", !!checked)}
              />
              <Label htmlFor="plafondActif" className="text-sm font-medium">
                Appliquer un plafond d'utilisation
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Définit une limite mensuelle pour cette source de revenus. Utile pour les revenus variables.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {formData.plafondActif && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="plafondMensuel" className="text-sm font-medium">
                  Plafond mensuel (Ar) *
                </Label>
                <Input
                  id="plafondMensuel"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.plafondMensuel}
                  onChange={(e) => handleInputChange("plafondMensuel", e.target.value)}
                  onBlur={() => handleBlur("plafondMensuel")}
                  placeholder="0"
                  className={errors.plafondMensuel ? "border-destructive" : ""}
                />
                {errors.plafondMensuel && touched.plafondMensuel && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.plafondMensuel}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
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
