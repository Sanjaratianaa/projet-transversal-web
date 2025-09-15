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

interface Revenu {
  id?: string
  nom: string
  type: "fixe" | "variable"
  montant: number
  frequence: "mensuelle" | "annuelle" | "ponctuelle"
  dateDebut: Date
  plafondUtilisation: number // Percentage (0-100)
  description?: string
}

interface RevenuFormProps {
  revenu?: Revenu
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (revenu: Revenu) => void
}

const typeOptions = [
  { value: "fixe", label: "Fixe" },
  { value: "variable", label: "Variable" },
]

const frequenceOptions = [
  { value: "mensuelle", label: "Mensuelle" },
  { value: "annuelle", label: "Annuelle" },
  { value: "ponctuelle", label: "Ponctuelle" },
]

export function RevenuForm({ revenu, open, onOpenChange, onSubmit }: RevenuFormProps) {
  const [formData, setFormData] = useState<Revenu>({
    nom: revenu?.nom || "",
    type: revenu?.type || "fixe",
    montant: revenu?.montant || 0,
    frequence: revenu?.frequence || "mensuelle",
    dateDebut: revenu?.dateDebut || new Date(),
    plafondUtilisation: revenu?.plafondUtilisation || 80,
    description: revenu?.description || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis"
    }

    if (!formData.montant || formData.montant <= 0) {
      newErrors.montant = "Le montant doit être supérieur à 0"
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = "La date de début est requise"
    }

    if (formData.plafondUtilisation < 0 || formData.plafondUtilisation > 100) {
      newErrors.plafondUtilisation = "Le plafond doit être entre 0 et 100%"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({ ...formData, id: revenu?.id })
    onOpenChange(false)
  }

  const handleInputChange = (field: keyof Revenu, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{revenu ? "Modifier le revenu" : "Nouveau revenu"}</DialogTitle>
          <DialogDescription>
            {revenu ? "Modifiez les informations du revenu." : "Ajoutez une nouvelle source de revenu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la source</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => handleInputChange("nom", e.target.value)}
              className={errors.nom ? "border-destructive" : ""}
              placeholder="Ex: Salaire, Freelance, Dividendes..."
            />
            {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequence">Fréquence</Label>
              <Select value={formData.frequence} onValueChange={(value) => handleInputChange("frequence", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequenceOptions.map((option) => (
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
              <Label htmlFor="plafondUtilisation">Plafond d'utilisation (%)</Label>
              <Input
                id="plafondUtilisation"
                type="number"
                value={formData.plafondUtilisation}
                onChange={(e) => handleInputChange("plafondUtilisation", Number.parseInt(e.target.value) || 0)}
                className={errors.plafondUtilisation ? "border-destructive" : ""}
                placeholder="80"
                min="0"
                max="100"
              />
              {errors.plafondUtilisation && <p className="text-sm text-destructive">{errors.plafondUtilisation}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date de début</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateDebut && "text-muted-foreground",
                    errors.dateDebut && "border-destructive",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateDebut ? (
                    format(formData.dateDebut, "dd/MM/yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dateDebut}
                  onSelect={(date) => handleInputChange("dateDebut", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.dateDebut && <p className="text-sm text-destructive">{errors.dateDebut}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Détails sur cette source de revenu..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{revenu ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
