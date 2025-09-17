"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, PiggyBank, Home, Car } from "lucide-react"

interface ObjectifFormProps {
  onSubmit: (objectif: any) => void
  onCancel: () => void
  initialData?: any
}

export function ObjectifForm({ onSubmit, onCancel, initialData }: ObjectifFormProps) {
  const [formData, setFormData] = useState({
    titre: initialData?.titre || "",
    description: initialData?.description || "",
    montant_cible: initialData?.montant_cible || "",
    montant_actuel: initialData?.montant_actuel || "0",
    date_limite: initialData?.date_limite || "",
    categorie: initialData?.categorie || "",
    priorite: initialData?.priorite || "moyenne",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      montant_cible: Number.parseFloat(formData.montant_cible),
      montant_actuel: Number.parseFloat(formData.montant_actuel),
      id: initialData?.id || Date.now(),
      date_creation: initialData?.date_creation || new Date().toISOString(),
      statut: initialData?.statut || "en_cours",
    })
  }

  const categories = [
    { value: "epargne", label: "Épargne générale", icon: PiggyBank },
    { value: "logement", label: "Logement", icon: Home },
    { value: "transport", label: "Transport", icon: Car },
    { value: "education", label: "Éducation", icon: Target },
    { value: "investissement", label: "Investissement", icon: TrendingUp },
    { value: "urgence", label: "Fonds d'urgence", icon: Target },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Modifier l'objectif" : "Nouvel objectif"}</CardTitle>
        <CardDescription>Définissez vos objectifs financiers pour mieux gérer votre épargne</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre de l'objectif</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Ex: Achat d'une voiture"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie</Label>
              <Select
                value={formData.categorie}
                onValueChange={(value) => setFormData({ ...formData, categorie: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const IconComponent = cat.icon
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant_cible">Montant cible (Ar)</Label>
              <Input
                id="montant_cible"
                type="number"
                value={formData.montant_cible}
                onChange={(e) => setFormData({ ...formData, montant_cible: e.target.value })}
                placeholder="5000000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant_actuel">Montant actuel (Ar)</Label>
              <Input
                id="montant_actuel"
                type="number"
                value={formData.montant_actuel}
                onChange={(e) => setFormData({ ...formData, montant_actuel: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_limite">Date limite</Label>
              <Input
                id="date_limite"
                type="date"
                value={formData.date_limite}
                onChange={(e) => setFormData({ ...formData, date_limite: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorite">Priorité</Label>
              <Select
                value={formData.priorite}
                onValueChange={(value) => setFormData({ ...formData, priorite: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faible">Faible</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="elevee">Élevée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre objectif..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {initialData ? "Mettre à jour" : "Créer l'objectif"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
