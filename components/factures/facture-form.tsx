"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export interface Facture {
  id?: string
  fournisseur: string
  type: string
  montant: number
  dateEmission: Date
  dateEcheance: Date
  statut: "payee" | "en_attente" | "en_retard"
  description?: string
}

interface FactureFormProps {
  facture?: Facture
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (facture: Facture) => void
}

export interface FactureFormData {
  fournisseur: string
  type: "electricite" | "eau" | "internet" | "gaz" | "telephone" | "assurance" | "autre"
  montant: string
  dateEmission: string
  dateEcheance: string
  statut: "payee" | "en_attente" | "en_retard"
  description?: string
}

const typeOptions = [
  { value: "electricite", label: "Électricité" },
  { value: "eau", label: "Eau" },
  { value: "internet", label: "Internet" },
  { value: "telephone", label: "Téléphone" },
  { value: "gaz", label: "Gaz" },
  { value: "assurance", label: "Assurance" },
  { value: "loyer", label: "Loyer" },
  { value: "autre", label: "Autre" },
]

const statutOptions = [
  { value: "en_attente", label: "En attente" },
  { value: "payee", label: "Payée" },
  { value: "en_retard", label: "En retard" },
]

export function FactureForm({ facture, open, onOpenChange, onSubmit }: FactureFormProps) {
  const [formData, setFormData] = useState<Facture>({
    fournisseur: facture?.fournisseur || "",
    type: facture?.type || "",
    montant: facture?.montant || 0,
    dateEmission: facture?.dateEmission || new Date(),
    dateEcheance: facture?.dateEcheance || new Date(),
    statut: facture?.statut || "en_attente",
    description: facture?.description || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fournisseur.trim()) {
      newErrors.fournisseur = "Le fournisseur est requis"
    }

    if (!formData.type) {
      newErrors.type = "Le type est requis"
    }

    if (!formData.montant || formData.montant <= 0) {
      newErrors.montant = "Le montant doit être supérieur à 0"
    }

    if (!formData.dateEmission) {
      newErrors.dateEmission = "La date d'émission est requise"
    }

    if (!formData.dateEcheance) {
      newErrors.dateEcheance = "La date d'échéance est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({ ...formData, id: facture?.id })
    onOpenChange(false)
  }

  const handleInputChange = (field: keyof Facture, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{facture ? "Modifier la facture" : "Nouvelle facture"}</DialogTitle>
          <DialogDescription>
            {facture ? "Modifiez les informations de la facture." : "Ajoutez une nouvelle facture à votre système."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fournisseur">Fournisseur</Label>
              <Input
                id="fournisseur"
                value={formData.fournisseur}
                onChange={(e) => handleInputChange("fournisseur", e.target.value)}
                className={errors.fournisseur ? "border-destructive" : ""}
                placeholder="Ex: EDF, Orange..."
              />
              {errors.fournisseur && <p className="text-sm text-destructive">{errors.fournisseur}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montant">Montant (Ar)</Label>
              <Input
                id="montant"
                type="number"
                value={formData.montant}
                onChange={(e) => handleInputChange("montant", Number.parseFloat(e.target.value) || 0)}
                className={errors.montant ? "border-destructive" : ""}
                placeholder="0"
                min="0"
                step="0.01"
              />
              {errors.montant && <p className="text-sm text-destructive">{errors.montant}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => handleInputChange("statut", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statutOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date d'émission</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateEmission && "text-muted-foreground",
                      errors.dateEmission && "border-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateEmission ? (
                      format(formData.dateEmission, "dd/MM/yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateEmission}
                    onSelect={(date) => handleInputChange("dateEmission", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateEmission && <p className="text-sm text-destructive">{errors.dateEmission}</p>}
            </div>

            <div className="space-y-2">
              <Label>Date d'échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateEcheance && "text-muted-foreground",
                      errors.dateEcheance && "border-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateEcheance ? (
                      format(formData.dateEcheance, "dd/MM/yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateEcheance}
                    onSelect={(date) => handleInputChange("dateEcheance", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateEcheance && <p className="text-sm text-destructive">{errors.dateEcheance}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Détails supplémentaires..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{facture ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
