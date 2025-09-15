"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, CalendarIcon, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { format, addMonths, isBefore, isSameMonth } from "date-fns"
import { fr } from "date-fns/locale"

interface Pret {
  id: string
  creancier: string
  montant: number
  taux: number
  duree: number
  dateDebut: Date
  statut: "actif" | "termine" | "suspendu"
  description?: string
  montantTotal?: number
  mensualite?: number
}

interface PretCalendarProps {
  pret: Pret
  onClose: () => void
}

interface Echeance {
  mois: number
  date: Date
  montant: number
  statut: "paye" | "en_attente" | "en_retard"
}

export function PretCalendar({ pret, onClose }: PretCalendarProps) {
  const [echeances, setEcheances] = useState<Echeance[]>(() => {
    // Generate payment schedule
    const schedule: Echeance[] = []
    const today = new Date()

    for (let mois = 1; mois <= pret.duree; mois++) {
      const dateEcheance = addMonths(pret.dateDebut, mois - 1)
      let statut: "paye" | "en_attente" | "en_retard" = "en_attente"

      if (pret.statut === "termine") {
        statut = "paye"
      } else if (isBefore(dateEcheance, today) && !isSameMonth(dateEcheance, today)) {
        statut = "en_retard"
      } else if (isBefore(dateEcheance, today) || isSameMonth(dateEcheance, today)) {
        // Simulate some payments as paid (for demo)
        statut = mois <= Math.floor(pret.duree * 0.3) ? "paye" : "en_attente"
      }

      schedule.push({
        mois,
        date: dateEcheance,
        montant: pret.mensualite || 0,
        statut,
      })
    }

    return schedule
  })

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + " Ar"
    )
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "paye":
        return (
          <Badge className="bg-primary text-primary-foreground">
            <CheckCircle className="mr-1 h-3 w-3" />
            Payé
          </Badge>
        )
      case "en_attente":
        return (
          <Badge variant="outline" className="border-secondary text-secondary">
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        )
      case "en_retard":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            En retard
          </Badge>
        )
      default:
        return <Badge variant="primary">{statut}</Badge>
    }
  }

  const togglePaymentStatus = (index: number) => {
    setEcheances((prev) =>
      prev.map((echeance, i) => {
        if (i === index) {
          const newStatut = echeance.statut === "paye" ? "en_attente" : "paye"
          return { ...echeance, statut: newStatut }
        }
        return echeance
      }),
    )
  }

  // Calculate statistics
  const stats = {
    totalEcheances: echeances.length,
    payees: echeances.filter((e) => e.statut === "paye").length,
    enAttente: echeances.filter((e) => e.statut === "en_attente").length,
    enRetard: echeances.filter((e) => e.statut === "en_retard").length,
    montantPaye: echeances.filter((e) => e.statut === "paye").reduce((sum, e) => sum + e.montant, 0),
    montantRestant: echeances.filter((e) => e.statut !== "paye").reduce((sum, e) => sum + e.montant, 0),
  }

  const prochainePaiement = echeances.find((e) => e.statut === "en_attente")
  const paiementsEnRetard = echeances.filter((e) => e.statut === "en_retard")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendrier de remboursement</h2>
          <p className="text-muted-foreground">
            {pret.creancier} - {formatCurrency(pret.montant)} sur {pret.duree} mois
          </p>
        </div>
        <Button onClick={onClose} variant="outline">
          Fermer
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Échéances payées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.payees}</div>
            <p className="text-xs text-muted-foreground">sur {stats.totalEcheances} échéances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Montant payé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.montantPaye)}</div>
            <p className="text-xs text-muted-foreground">Total versé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Montant restant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{formatCurrency(stats.montantRestant)}</div>
            <p className="text-xs text-muted-foreground">À rembourser</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.enRetard}</div>
            <p className="text-xs text-muted-foreground">Paiements en retard</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {paiementsEnRetard.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Paiements en retard</AlertTitle>
          <AlertDescription>
            Vous avez {paiementsEnRetard.length} paiement(s) en retard pour un montant total de{" "}
            {formatCurrency(paiementsEnRetard.reduce((sum, p) => sum + p.montant, 0))}.
          </AlertDescription>
        </Alert>
      )}

      {prochainePaiement && (
        <Alert>
          <CalendarIcon className="h-4 w-4" />
          <AlertTitle>Prochain paiement</AlertTitle>
          <AlertDescription>
            Le prochain paiement de {formatCurrency(prochainePaiement.montant)} est prévu le{" "}
            {format(prochainePaiement.date, "dd MMMM yyyy", { locale: fr })}.
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Échéancier de remboursement
          </CardTitle>
          <CardDescription>Cliquez sur une échéance pour marquer comme payée/non payée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {echeances.map((echeance, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => togglePaymentStatus(index)}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium">Échéance {echeance.mois}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(echeance.date, "dd MMM yyyy", { locale: fr })}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-mono">{formatCurrency(echeance.montant)}</div>
                  {getStatutBadge(echeance.statut)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
