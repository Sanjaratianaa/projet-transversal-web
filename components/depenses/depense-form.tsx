"use client"

import type React from "react"

import { useState } from "react"
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

interface Depense {
  id?: string
  description: string
  categorie: string
  montant: number
  type: "fixe" | "variable"
  frequence: "unique" | "mensuelle" | "annuelle" | "hebdomadaire"
  date: Date
  notes?: string
}

interface DepenseFormProps {
  depense?: Depense
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (depense: Depense) => void
}

const categorieOptions = [
  { value: "alimentation", label: "Alimentation" },
  { value: "transport", label: "Transport" },
  { value: "logement", label: "Logement" },
  { value: "sante", label: "Santé" },
  { value: "education", label: "Éducation" },
  { value: "loisirs", label: "Loisirs" },
  { value: "vetements", label: "Vêtements" },
  { value: "services", label: "Services" },
  { value: "autre", label: "Autre" },
]

const typeOptions = [
  { value: "fixe", label: "Fixe" },
  { value: "variable", label: "Variable" },
]

const frequenceOptions = [
  { value: "unique", label: "Unique" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "mensuelle", label: "Mensuelle" },
  { value: "annuelle", label: "Annuelle" },
]

export function DepenseForm({ depense, open, onOpenChange, onSubmit }: DepenseFormProps) {
  const [formData, setFormData] = useState<Depense>({
    description: depense?.description || "",
    categorie: depense?.categorie || "",
    montant: depense?.montant || 0,
    type: depense?.type || "variable",
    frequence: depense?.frequence || "unique",
    date: depense?.date || new Date(),
    notes: depense?.notes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const isLoading = false;

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise"
    }

    if (!formData.categorie) {
      newErrors.categorie = "La catégorie est requise"
    }

    if (!formData.montant || formData.montant <= 0) {
      newErrors.montant = "Le montant doit être supérieur à 0"
    }

    if (!formData.date) {
      newErrors.date = "La date est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({ ...formData, id: depense?.id })
    onOpenChange(false)
  }

  const handleInputChange = (field: keyof Depense, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              {depense ? (
                <SaveIcon className="h-5 w-5" />
              ) : (
                <PlusIcon className="h-5 w-5" />
              )}
              {depense ? "Modifier la dépense" : "Nouvelle dépense"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={errors.description ? "border-destructive" : ""}
                  placeholder="Ex: Courses alimentaires, Essence..."
                />
                {errors.description && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">
                      {errors.description}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Catégorie & Montant */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categorie" className="text-sm font-medium">
                    Catégorie *
                  </Label>
                  <Select
                    value={formData.categorie}
                    onValueChange={(value) => handleInputChange("categorie", value)}
                  >
                    <SelectTrigger
                      className={errors.categorie ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorieOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categorie && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.categorie}
                      </AlertDescription>
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
                    step="0.01"
                    min="0"
                    value={formData.montant}
                    onChange={(e) =>
                      handleInputChange("montant", Number.parseFloat(e.target.value) || 0)
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
              </div>

              {/* Type & Fréquence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Type *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequence" className="text-sm font-medium">
                    Fréquence *
                  </Label>
                  <Select
                    value={formData.frequence}
                    onValueChange={(value) => handleInputChange("frequence", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une fréquence" />
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

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground",
                        errors.date && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "dd/MM/yyyy", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => handleInputChange("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">
                      {errors.date}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes (optionnel)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Informations supplémentaires..."
                  rows={3}
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
                      {depense ? "Modification..." : "Ajout..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {depense ? <SaveIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                      {depense ? "Modifier" : "Ajouter"}
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
    //   <DialogContent className="sm:max-w-[500px]">
    //     <DialogHeader>
    //       <DialogTitle>{depense ? "Modifier la dépense" : "Nouvelle dépense"}</DialogTitle>
    //       <DialogDescription>
    //         {depense ? "Modifiez les informations de la dépense." : "Ajoutez une nouvelle dépense à votre budget."}
    //       </DialogDescription>
    //     </DialogHeader>

    //     <form onSubmit={handleSubmit} className="space-y-4">
    //       <div className="space-y-2">
    //         <Label htmlFor="description">Description</Label>
    //         <Input
    //           id="description"
    //           value={formData.description}
    //           onChange={(e) => handleInputChange("description", e.target.value)}
    //           className={errors.description ? "border-destructive" : ""}
    //           placeholder="Ex: Courses alimentaires, Essence..."
    //         />
    //         {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
    //       </div>

    //       <div className="grid grid-cols-2 gap-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="categorie">Catégorie</Label>
    //           <Select value={formData.categorie} onValueChange={(value) => handleInputChange("categorie", value)}>
    //             <SelectTrigger className={errors.categorie ? "border-destructive" : ""}>
    //               <SelectValue placeholder="Sélectionner une catégorie" />
    //             </SelectTrigger>
    //             <SelectContent>
    //               {categorieOptions.map((option) => (
    //                 <SelectItem key={option.value} value={option.value}>
    //                   {option.label}
    //                 </SelectItem>
    //               ))}
    //             </SelectContent>
    //           </Select>
    //           {errors.categorie && <p className="text-sm text-destructive">{errors.categorie}</p>}
    //         </div>

    //         <div className="space-y-2">
    //           <Label htmlFor="montant">Montant (Ar)</Label>
    //           <Input
    //             id="montant"
    //             type="number"
    //             value={formData.montant}
    //             onChange={(e) => handleInputChange("montant", Number.parseFloat(e.target.value) || 0)}
    //             className={errors.montant ? "border-destructive" : ""}
    //             placeholder="0"
    //             min="0"
    //             step="0.01"
    //           />
    //           {errors.montant && <p className="text-sm text-destructive">{errors.montant}</p>}
    //         </div>
    //       </div>

    //       <div className="grid grid-cols-2 gap-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="type">Type</Label>
    //           <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
    //             <SelectTrigger>
    //               <SelectValue />
    //             </SelectTrigger>
    //             <SelectContent>
    //               {typeOptions.map((option) => (
    //                 <SelectItem key={option.value} value={option.value}>
    //                   {option.label}
    //                 </SelectItem>
    //               ))}
    //             </SelectContent>
    //           </Select>
    //         </div>

    //         <div className="space-y-2">
    //           <Label htmlFor="frequence">Fréquence</Label>
    //           <Select value={formData.frequence} onValueChange={(value) => handleInputChange("frequence", value)}>
    //             <SelectTrigger>
    //               <SelectValue />
    //             </SelectTrigger>
    //             <SelectContent>
    //               {frequenceOptions.map((option) => (
    //                 <SelectItem key={option.value} value={option.value}>
    //                   {option.label}
    //                 </SelectItem>
    //               ))}
    //             </SelectContent>
    //           </Select>
    //         </div>
    //       </div>

    //       <div className="space-y-2">
    //         <Label>Date</Label>
    //         <Popover>
    //           <PopoverTrigger asChild>
    //             <Button
    //               variant="outline"
    //               className={cn(
    //                 "w-full justify-start text-left font-normal",
    //                 !formData.date && "text-muted-foreground",
    //                 errors.date && "border-destructive",
    //               )}
    //             >
    //               <CalendarIcon className="mr-2 h-4 w-4" />
    //               {formData.date ? (
    //                 format(formData.date, "dd/MM/yyyy", { locale: fr })
    //               ) : (
    //                 <span>Sélectionner une date</span>
    //               )}
    //             </Button>
    //           </PopoverTrigger>
    //           <PopoverContent className="w-auto p-0">
    //             <Calendar
    //               mode="single"
    //               selected={formData.date}
    //               onSelect={(date) => handleInputChange("date", date)}
    //               initialFocus
    //             />
    //           </PopoverContent>
    //         </Popover>
    //         {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
    //       </div>

    //       <div className="space-y-2">
    //         <Label htmlFor="notes">Notes (optionnel)</Label>
    //         <Textarea
    //           id="notes"
    //           value={formData.notes}
    //           onChange={(e) => handleInputChange("notes", e.target.value)}
    //           placeholder="Informations supplémentaires..."
    //           rows={3}
    //         />
    //       </div>

    //       <DialogFooter>
    //         <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
    //           Annuler
    //         </Button>
    //         <Button type="submit">{depense ? "Modifier" : "Ajouter"}</Button>
    //       </DialogFooter>
    //     </form>
    //   </DialogContent>
    // </Dialog>
  )
}
