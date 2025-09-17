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
  const isLoading = false;

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
      <DialogContent className="max-w-lg p-0">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              {revenu ? (
                <SaveIcon className="h-5 w-5" />
              ) : (
                <PlusIcon className="h-5 w-5" />
              )}
              {revenu ? "Modifier le revenu" : "Nouveau revenu"}
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
                  className={errors.nom ? "border-destructive" : ""}
                  placeholder="Ex: Salaire, Freelance, Dividendes..."
                />
                {errors.nom && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">
                      {errors.nom}
                    </AlertDescription>
                  </Alert>
                )}
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
                    <SelectTrigger
                      className={errors.type ? "border-destructive" : ""}
                    >
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
                  {errors.type && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.type}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequence" className="text-sm font-medium">
                    Fréquence *
                  </Label>
                  <Select
                    value={formData.frequence}
                    onValueChange={(value) => handleInputChange("frequence", value)}
                  >
                    <SelectTrigger
                      className={errors.frequence ? "border-destructive" : ""}
                    >
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
                  {errors.frequence && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.frequence}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Montant & Plafond */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="plafondUtilisation" className="text-sm font-medium">
                    Plafond d'utilisation (%)
                  </Label>
                  <Input
                    id="plafondUtilisation"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.plafondUtilisation}
                    onChange={(e) =>
                      handleInputChange(
                        "plafondUtilisation",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    className={errors.plafondUtilisation ? "border-destructive" : ""}
                    placeholder="80"
                  />
                  {errors.plafondUtilisation && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-sm">
                        {errors.plafondUtilisation}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Date */}
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (optionnel)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Détails sur cette source de revenu..."
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
                      {revenu ? "Modification..." : "Ajout..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {revenu ? (
                        <SaveIcon className="h-4 w-4" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                      {revenu ? "Modifier" : "Ajouter"}
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
    //       <DialogTitle>{revenu ? "Modifier le revenu" : "Nouveau revenu"}</DialogTitle>
    //       <DialogDescription>
    //         {revenu ? "Modifiez les informations du revenu." : "Ajoutez une nouvelle source de revenu."}
    //       </DialogDescription>
    //     </DialogHeader>

    //     <form onSubmit={handleSubmit} className="space-y-4">
    //       <div className="space-y-2">
    //         <Label htmlFor="nom">Nom de la source</Label>
    //         <Input
    //           id="nom"
    //           value={formData.nom}
    //           onChange={(e) => handleInputChange("nom", e.target.value)}
    //           className={errors.nom ? "border-destructive" : ""}
    //           placeholder="Ex: Salaire, Freelance, Dividendes..."
    //         />
    //         {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
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

    //       <div className="grid grid-cols-2 gap-4">
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

    //         <div className="space-y-2">
    //           <Label htmlFor="plafondUtilisation">Plafond d'utilisation (%)</Label>
    //           <Input
    //             id="plafondUtilisation"
    //             type="number"
    //             value={formData.plafondUtilisation}
    //             onChange={(e) => handleInputChange("plafondUtilisation", Number.parseInt(e.target.value) || 0)}
    //             className={errors.plafondUtilisation ? "border-destructive" : ""}
    //             placeholder="80"
    //             min="0"
    //             max="100"
    //           />
    //           {errors.plafondUtilisation && <p className="text-sm text-destructive">{errors.plafondUtilisation}</p>}
    //         </div>
    //       </div>

    //       <div className="space-y-2">
    //         <Label>Date de début</Label>
    //         <Popover>
    //           <PopoverTrigger asChild>
    //             <Button
    //               variant="outline"
    //               className={cn(
    //                 "w-full justify-start text-left font-normal",
    //                 !formData.dateDebut && "text-muted-foreground",
    //                 errors.dateDebut && "border-destructive",
    //               )}
    //             >
    //               <CalendarIcon className="mr-2 h-4 w-4" />
    //               {formData.dateDebut ? (
    //                 format(formData.dateDebut, "dd/MM/yyyy", { locale: fr })
    //               ) : (
    //                 <span>Sélectionner une date</span>
    //               )}
    //             </Button>
    //           </PopoverTrigger>
    //           <PopoverContent className="w-auto p-0">
    //             <Calendar
    //               mode="single"
    //               selected={formData.dateDebut}
    //               onSelect={(date) => handleInputChange("dateDebut", date)}
    //               initialFocus
    //             />
    //           </PopoverContent>
    //         </Popover>
    //         {errors.dateDebut && <p className="text-sm text-destructive">{errors.dateDebut}</p>}
    //       </div>

    //       <div className="space-y-2">
    //         <Label htmlFor="description">Description (optionnel)</Label>
    //         <Textarea
    //           id="description"
    //           value={formData.description}
    //           onChange={(e) => handleInputChange("description", e.target.value)}
    //           placeholder="Détails sur cette source de revenu..."
    //           rows={3}
    //         />
    //       </div>

    //       <DialogFooter>
    //         <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
    //           Annuler
    //         </Button>
    //         <Button type="submit">{revenu ? "Modifier" : "Ajouter"}</Button>
    //       </DialogFooter>
    //     </form>
    //   </DialogContent>
    // </Dialog>
  )
}
