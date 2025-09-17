"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { CalendarIcon, PlusIcon, SaveIcon, InfoIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Pret {
  id?: string
  creancier: string
  montant: number
  taux: number // Annual interest rate in percentage
  duree: number // Duration in months
  dateDebut: Date
  statut: "actif" | "termine" | "suspendu"
  description?: string
  // Calculated fields
  montantTotal?: number
  mensualite?: number
}

interface PretFormProps {
  pret?: Pret
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (pret: Pret) => void
}

const statutOptions = [
  { value: "actif", label: "Actif" },
  { value: "termine", label: "Terminé" },
  { value: "suspendu", label: "Suspendu" },
]

export function PretForm({ pret, open, onOpenChange, onSubmit }: PretFormProps) {
  const [formData, setFormData] = useState<Pret>({
    creancier: pret?.creancier || "",
    montant: pret?.montant || 0,
    taux: pret?.taux || 0,
    duree: pret?.duree || 12,
    dateDebut: pret?.dateDebut || new Date(),
    statut: pret?.statut || "actif",
    description: pret?.description || "",
  })

  const isLoading = false;

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calculatedValues, setCalculatedValues] = useState({
    mensualite: 0,
    montantTotal: 0,
  })

  // Calculate loan values when form data changes
  useEffect(() => {
    if (formData.montant > 0 && formData.taux >= 0 && formData.duree > 0) {
      const principal = formData.montant
      const monthlyRate = formData.taux / 100 / 12
      const numberOfPayments = formData.duree

      let mensualite = 0
      let montantTotal = 0

      if (formData.taux === 0) {
        // No interest
        mensualite = principal / numberOfPayments
        montantTotal = principal
      } else {
        // With interest - using standard loan formula
        mensualite =
          (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
        montantTotal = mensualite * numberOfPayments
      }

      setCalculatedValues({
        mensualite: Math.round(mensualite),
        montantTotal: Math.round(montantTotal),
      })
    } else {
      setCalculatedValues({ mensualite: 0, montantTotal: 0 })
    }
  }, [formData.montant, formData.taux, formData.duree])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.creancier.trim()) {
      newErrors.creancier = "Le créancier est requis"
    }

    if (!formData.montant || formData.montant <= 0) {
      newErrors.montant = "Le montant doit être supérieur à 0"
    }

    if (formData.taux < 0) {
      newErrors.taux = "Le taux ne peut pas être négatif"
    }

    if (!formData.duree || formData.duree <= 0) {
      newErrors.duree = "La durée doit être supérieure à 0"
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = "La date de début est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const pretData: Pret = {
      ...formData,
      id: pret?.id,
      montantTotal: calculatedValues.montantTotal,
      mensualite: calculatedValues.mensualite,
    }

    onSubmit(pretData)
    onOpenChange(false)
  }

  const handleInputChange = (field: keyof Pret, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              {pret ? (
                <SaveIcon className="h-5 w-5" />
              ) : (
                <PlusIcon className="h-5 w-5" />
              )}
              {pret ? "Modifier le prêt" : "Nouveau prêt"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Créancier & Statut */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creancier" className="text-sm font-medium">
                    Créancier *
                  </Label>
                  <Input
                    id="creancier"
                    value={formData.creancier}
                    onChange={(e) => handleInputChange("creancier", e.target.value)}
                    className={errors.creancier ? "border-destructive" : ""}
                    placeholder="Ex: Banque, Institution..."
                  />
                  {errors.creancier && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.creancier}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statut" className="text-sm font-medium">
                    Statut *
                  </Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value) => handleInputChange("statut", value)}
                  >
                    <SelectTrigger
                      className={errors.statut ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {statutOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.statut && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.statut}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Montant & Taux */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="montant" className="text-sm font-medium">
                    Montant emprunté (Ar) *
                  </Label>
                  <Input
                    id="montant"
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.montant}
                    onChange={(e) =>
                      handleInputChange(
                        "montant",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    className={errors.montant ? "border-destructive" : ""}
                    placeholder="0"
                  />
                  {errors.montant && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.montant}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taux" className="text-sm font-medium">
                    Taux d'intérêt annuel (%) *
                  </Label>
                  <Input
                    id="taux"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.taux}
                    onChange={(e) =>
                      handleInputChange("taux", Number.parseFloat(e.target.value) || 0)
                    }
                    className={errors.taux ? "border-destructive" : ""}
                    placeholder="0"
                  />
                  {errors.taux && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.taux}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Durée & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duree" className="text-sm font-medium">
                    Durée (mois) *
                  </Label>
                  <Input
                    id="duree"
                    type="number"
                    min="1"
                    max="360"
                    value={formData.duree}
                    onChange={(e) =>
                      handleInputChange("duree", Number.parseInt(e.target.value) || 0)
                    }
                    className={errors.duree ? "border-destructive" : ""}
                    placeholder="12"
                  />
                  {errors.duree && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.duree}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date de début *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dateDebut && "text-muted-foreground",
                          errors.dateDebut && "border-destructive"
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
                  {errors.dateDebut && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.dateDebut}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
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
                  placeholder="Détails sur ce prêt..."
                  rows={3}
                />
              </div>

              {/* Calculs automatiques */}
              {(calculatedValues.mensualite > 0 ||
                calculatedValues.montantTotal > 0) && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">Calculs automatiques :</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mensualité :</span>
                        <p className="font-medium">
                          {formatCurrency(calculatedValues.mensualite)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Montant total :</span>
                        <p className="font-medium">
                          {formatCurrency(calculatedValues.montantTotal)}
                        </p>
                      </div>
                    </div>
                    {calculatedValues.montantTotal > formData.montant && (
                      <p className="text-xs text-muted-foreground">
                        Intérêts totaux :{" "}
                        {formatCurrency(
                          calculatedValues.montantTotal - formData.montant
                        )}
                      </p>
                    )}
                  </div>
                )}

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
                      {pret ? "Modification..." : "Ajout..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {pret ? (
                        <SaveIcon className="h-4 w-4" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                      {pret ? "Modifier" : "Ajouter"}
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="flex-1 sm:flex-initial bg-transparent"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>

    // <Dialog open={open} onOpenChange={onOpenChange}>
    //   <DialogContent className="sm:max-w-[600px]">
    //     <DialogHeader>
    //       <DialogTitle>{pret ? "Modifier le prêt" : "Nouveau prêt"}</DialogTitle>
    //       <DialogDescription>
    //         {pret ? "Modifiez les informations du prêt." : "Ajoutez un nouveau prêt à votre portefeuille."}
    //       </DialogDescription>
    //     </DialogHeader>

    //     <form onSubmit={handleSubmit} className="space-y-4">
    //       <div className="grid grid-cols-2 gap-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="creancier">Créancier</Label>
    //           <Input
    //             id="creancier"
    //             value={formData.creancier}
    //             onChange={(e) => handleInputChange("creancier", e.target.value)}
    //             className={errors.creancier ? "border-destructive" : ""}
    //             placeholder="Ex: Banque, Institution..."
    //           />
    //           {errors.creancier && <p className="text-sm text-destructive">{errors.creancier}</p>}
    //         </div>

    //         <div className="space-y-2">
    //           <Label htmlFor="statut">Statut</Label>
    //           <Select value={formData.statut} onValueChange={(value) => handleInputChange("statut", value)}>
    //             <SelectTrigger>
    //               <SelectValue />
    //             </SelectTrigger>
    //             <SelectContent>
    //               {statutOptions.map((option) => (
    //                 <SelectItem key={option.value} value={option.value}>
    //                   {option.label}
    //                 </SelectItem>
    //               ))}
    //             </SelectContent>
    //           </Select>
    //         </div>
    //       </div>

    //       <div className="grid grid-cols-2 gap-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="montant">Montant emprunté (Ar)</Label>
    //           <Input
    //             id="montant"
    //             type="number"
    //             value={formData.montant}
    //             onChange={(e) => handleInputChange("montant", Number.parseFloat(e.target.value) || 0)}
    //             className={errors.montant ? "border-destructive" : ""}
    //             placeholder="0"
    //             min="0"
    //             step="1000"
    //           />
    //           {errors.montant && <p className="text-sm text-destructive">{errors.montant}</p>}
    //         </div>

    //         <div className="space-y-2">
    //           <Label htmlFor="taux">Taux d'intérêt annuel (%)</Label>
    //           <Input
    //             id="taux"
    //             type="number"
    //             value={formData.taux}
    //             onChange={(e) => handleInputChange("taux", Number.parseFloat(e.target.value) || 0)}
    //             className={errors.taux ? "border-destructive" : ""}
    //             placeholder="0"
    //             min="0"
    //             max="100"
    //             step="0.1"
    //           />
    //           {errors.taux && <p className="text-sm text-destructive">{errors.taux}</p>}
    //         </div>
    //       </div>

    //       <div className="grid grid-cols-2 gap-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="duree">Durée (mois)</Label>
    //           <Input
    //             id="duree"
    //             type="number"
    //             value={formData.duree}
    //             onChange={(e) => handleInputChange("duree", Number.parseInt(e.target.value) || 0)}
    //             className={errors.duree ? "border-destructive" : ""}
    //             placeholder="12"
    //             min="1"
    //             max="360"
    //           />
    //           {errors.duree && <p className="text-sm text-destructive">{errors.duree}</p>}
    //         </div>

    //         <div className="space-y-2">
    //           <Label>Date de début</Label>
    //           <Popover>
    //             <PopoverTrigger asChild>
    //               <Button
    //                 variant="outline"
    //                 className={cn(
    //                   "w-full justify-start text-left font-normal",
    //                   !formData.dateDebut && "text-muted-foreground",
    //                   errors.dateDebut && "border-destructive",
    //                 )}
    //               >
    //                 <CalendarIcon className="mr-2 h-4 w-4" />
    //                 {formData.dateDebut ? (
    //                   format(formData.dateDebut, "dd/MM/yyyy", { locale: fr })
    //                 ) : (
    //                   <span>Sélectionner une date</span>
    //                 )}
    //               </Button>
    //             </PopoverTrigger>
    //             <PopoverContent className="w-auto p-0">
    //               <Calendar
    //                 mode="single"
    //                 selected={formData.dateDebut}
    //                 onSelect={(date) => handleInputChange("dateDebut", date)}
    //                 initialFocus
    //               />
    //             </PopoverContent>
    //           </Popover>
    //           {errors.dateDebut && <p className="text-sm text-destructive">{errors.dateDebut}</p>}
    //         </div>
    //       </div>

    //       <div className="space-y-2">
    //         <Label htmlFor="description">Description (optionnel)</Label>
    //         <Textarea
    //           id="description"
    //           value={formData.description}
    //           onChange={(e) => handleInputChange("description", e.target.value)}
    //           placeholder="Détails sur ce prêt..."
    //           rows={3}
    //         />
    //       </div>

    //       {/* Calculated values display */}
    //       {(calculatedValues.mensualite > 0 || calculatedValues.montantTotal > 0) && (
    //         <div className="bg-muted p-4 rounded-lg space-y-2">
    //           <h4 className="font-medium text-sm">Calculs automatiques :</h4>
    //           <div className="grid grid-cols-2 gap-4 text-sm">
    //             <div>
    //               <span className="text-muted-foreground">Mensualité :</span>
    //               <p className="font-medium">{formatCurrency(calculatedValues.mensualite)}</p>
    //             </div>
    //             <div>
    //               <span className="text-muted-foreground">Montant total :</span>
    //               <p className="font-medium">{formatCurrency(calculatedValues.montantTotal)}</p>
    //             </div>
    //           </div>
    //           {calculatedValues.montantTotal > formData.montant && (
    //             <p className="text-xs text-muted-foreground">
    //               Intérêts totaux : {formatCurrency(calculatedValues.montantTotal - formData.montant)}
    //             </p>
    //           )}
    //         </div>
    //       )}

    //       <DialogFooter>
    //         <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
    //           Annuler
    //         </Button>
    //         <Button type="submit">{pret ? "Modifier" : "Ajouter"}</Button>
    //       </DialogFooter>
    //     </form>
    //   </DialogContent>
    // </Dialog>
  )
}
