"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SettingsIcon, AlertTriangleIcon, CheckCircleIcon, SaveIcon } from "lucide-react"
import { formatCurrency } from "@/lib/revenue-utils"
import type { GlobalCeiling } from "@/types/revenue"

interface GlobalCeilingCardProps {
  globalCeiling: GlobalCeiling
  onUpdateCeiling: (newCeiling: number) => void
}

export default function GlobalCeilingCard({ globalCeiling, onUpdateCeiling }: GlobalCeilingCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newCeiling, setNewCeiling] = useState(globalCeiling.plafond.toString())
  const [error, setError] = useState("")

  const handleSave = () => {
    const ceiling = Number(newCeiling)
    if (isNaN(ceiling) || ceiling <= 0) {
      setError("Le plafond doit être un nombre positif")
      return
    }

    onUpdateCeiling(ceiling)
    setIsEditing(false)
    setError("")
  }

  const handleCancel = () => {
    setNewCeiling(globalCeiling.plafond.toString())
    setIsEditing(false)
    setError("")
  }

  const isOverLimit = globalCeiling.pourcentage > 100
  const isNearLimit = globalCeiling.pourcentage > 80 && globalCeiling.pourcentage <= 100

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2 text-xl">
          <SettingsIcon className="h-5 w-5" />
          Plafond Global Mensuel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Configuration du plafond */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Plafond général (Ar)</Label>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Input
                type="number"
                step="1"
                min="0"
                value={newCeiling}
                onChange={(e) => {
                  setNewCeiling(e.target.value)
                  setError("")
                }}
                placeholder="Montant du plafond"
                className={error ? "border-destructive" : ""}
              />
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {formatCurrency(globalCeiling.plafond)}
              </Badge>
            </div>
          )}
        </div>

        {/* Barre de progression */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Utilisation actuelle</Label>
            <Badge variant={isOverLimit ? "destructive" : isNearLimit ? "secondary" : "outline"} className="text-sm">
              {globalCeiling.pourcentage}%
            </Badge>
          </div>

          <Progress
            value={Math.min(globalCeiling.pourcentage, 100)}
            className="h-3"
            style={
              {
                "--progress-background": isOverLimit
                  ? "rgb(239 68 68)"
                  : isNearLimit
                    ? "rgb(245 158 11)"
                    : "rgb(34 197 94)",
              } as React.CSSProperties
            }
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(globalCeiling.utilisation)} utilisés</span>
            <span>{formatCurrency(globalCeiling.plafond)} maximum</span>
          </div>
        </div>

        {/* Messages d'alerte */}
        {isOverLimit && (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Dépassement de plafond !</strong> Vous avez dépassé votre plafond mensuel de{" "}
              {formatCurrency(globalCeiling.utilisation - globalCeiling.plafond)}.
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && (
          <Alert className="border-orange-200 bg-orange-50 text-orange-800">
            <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <strong>Attention !</strong> Vous approchez de votre plafond mensuel. Il vous reste{" "}
              {formatCurrency(globalCeiling.plafond - globalCeiling.utilisation)} disponibles.
            </AlertDescription>
          </Alert>
        )}

        {!isOverLimit && !isNearLimit && globalCeiling.pourcentage > 0 && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Utilisation normale. Il vous reste {formatCurrency(globalCeiling.plafond - globalCeiling.utilisation)}{" "}
              disponibles ce mois-ci.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
