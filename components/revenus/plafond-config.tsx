"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Settings, AlertTriangle, TrendingUp, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PlafondConfigProps {
  plafondGlobal: number
  utilisationActuelle: number
  onPlafondChange: (nouveauPlafond: number) => void
}

export function PlafondConfig({ plafondGlobal, utilisationActuelle, onPlafondChange }: PlafondConfigProps) {
  const [nouveauPlafond, setNouveauPlafond] = useState(plafondGlobal)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  const pourcentageUtilisation = plafondGlobal > 0 ? (utilisationActuelle / plafondGlobal) * 100 : 0
  const montantRestant = Math.max(0, plafondGlobal - utilisationActuelle)

  const handleSave = () => {
    if (nouveauPlafond <= 0) {
      toast({
        title: "Erreur",
        description: "Le plafond doit être supérieur à 0",
        variant: "destructive",
      })
      return
    }

    onPlafondChange(nouveauPlafond)
    setIsEditing(false)
    toast({
      title: "Plafond mis à jour",
      description: `Le nouveau plafond mensuel est de ${formatCurrency(nouveauPlafond)}`,
    })
  }

  const handleCancel = () => {
    setNouveauPlafond(plafondGlobal)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Global Budget Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Configuration du plafond global
          </CardTitle>
          <CardDescription>Définissez votre plafond de dépenses mensuel basé sur vos revenus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plafond">Nouveau plafond mensuel (Ar)</Label>
                <Input
                  id="plafond"
                  type="number"
                  value={nouveauPlafond}
                  onChange={(e) => setNouveauPlafond(Number.parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="1000"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(plafondGlobal)}</p>
                  <p className="text-sm text-muted-foreground">Plafond mensuel actuel</p>
                </div>
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Usage Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Utilisation du plafond ce mois
          </CardTitle>
          <CardDescription>Suivi de votre consommation par rapport au plafond défini</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {formatCurrency(utilisationActuelle)} / {formatCurrency(plafondGlobal)}
              </span>
              <span className="text-sm text-muted-foreground">{pourcentageUtilisation.toFixed(1)}%</span>
            </div>
            <Progress
              value={Math.min(pourcentageUtilisation, 100)}
              className={`h-3 ${
                pourcentageUtilisation >= 80
                  ? "[&>div]:bg-destructive"
                  : pourcentageUtilisation >= 50
                    ? "[&>div]:bg-secondary"
                    : "[&>div]:bg-primary"
              }`}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Restant: {formatCurrency(montantRestant)}</span>
              {pourcentageUtilisation >= 100 ? (
                <span className="text-destructive font-medium">Plafond dépassé</span>
              ) : pourcentageUtilisation >= 80 ? (
                <span className="text-secondary font-medium">Attention au plafond</span>
              ) : (
                <span className="text-primary font-medium">Dans les limites</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {pourcentageUtilisation >= 100 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Plafond dépassé</AlertTitle>
          <AlertDescription>
            Vous avez dépassé votre plafond mensuel de {formatCurrency(utilisationActuelle - plafondGlobal)}. Révisez
            vos dépenses ou augmentez votre plafond.
          </AlertDescription>
        </Alert>
      )}

      {pourcentageUtilisation >= 80 && pourcentageUtilisation < 100 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention au plafond</AlertTitle>
          <AlertDescription>
            Vous avez utilisé {pourcentageUtilisation.toFixed(1)}% de votre plafond mensuel. Il vous reste{" "}
            {formatCurrency(montantRestant)}.
          </AlertDescription>
        </Alert>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
          <CardDescription>Conseils pour optimiser votre gestion financière</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {pourcentageUtilisation < 50 && (
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>
                  Excellente gestion ! Vous utilisez seulement {pourcentageUtilisation.toFixed(1)}% de votre plafond.
                  Considérez augmenter votre épargne.
                </p>
              </div>
            )}
            {pourcentageUtilisation >= 50 && pourcentageUtilisation < 80 && (
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                <p>
                  Utilisation modérée de votre plafond. Surveillez vos dépenses pour rester dans les limites ce mois.
                </p>
              </div>
            )}
            {pourcentageUtilisation >= 80 && (
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                <p>
                  Attention ! Réduisez vos dépenses non essentielles ou augmentez votre plafond si vos revenus le
                  permettent.
                </p>
              </div>
            )}
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
              <p>Conseil : Définissez votre plafond à 70-80% de vos revenus totaux pour maintenir une épargne saine.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
