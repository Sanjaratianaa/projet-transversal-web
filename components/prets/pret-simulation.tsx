"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Calculator } from "lucide-react"

interface SimulationParams {
  montant: number
  taux: number
  duree: number
}

interface SimulationResult {
  mensualite: number
  montantTotal: number
  interetsTotal: number
  tableauAmortissement: Array<{
    mois: number
    mensualite: number
    capital: number
    interets: number
    capitalRestant: number
  }>
}

export function PretSimulation() {
  const [params, setParams] = useState<SimulationParams>({
    montant: 1000000,
    taux: 12,
    duree: 24,
  })

  const [scenarios, setScenarios] = useState<Array<{ name: string; result: SimulationResult }>>([])

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + " Ar"
    )
  }

  const calculateLoan = (montant: number, taux: number, duree: number): SimulationResult => {
    const principal = montant
    const monthlyRate = taux / 100 / 12
    const numberOfPayments = duree

    let mensualite = 0
    let montantTotal = 0

    if (taux === 0) {
      mensualite = principal / numberOfPayments
      montantTotal = principal
    } else {
      mensualite =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      montantTotal = mensualite * numberOfPayments
    }

    const interetsTotal = montantTotal - principal

    // Generate amortization table
    const tableauAmortissement = []
    let capitalRestant = principal

    for (let mois = 1; mois <= duree; mois++) {
      const interetsMois = taux === 0 ? 0 : capitalRestant * monthlyRate
      const capitalMois = mensualite - interetsMois
      capitalRestant = Math.max(0, capitalRestant - capitalMois)

      tableauAmortissement.push({
        mois,
        mensualite: Math.round(mensualite),
        capital: Math.round(capitalMois),
        interets: Math.round(interetsMois),
        capitalRestant: Math.round(capitalRestant),
      })
    }

    return {
      mensualite: Math.round(mensualite),
      montantTotal: Math.round(montantTotal),
      interetsTotal: Math.round(interetsTotal),
      tableauAmortissement,
    }
  }

  const currentResult = calculateLoan(params.montant, params.taux, params.duree)

  const handleAddScenario = () => {
    const scenarioName = `Scénario ${scenarios.length + 1}`
    const result = calculateLoan(params.montant, params.taux, params.duree)
    setScenarios((prev) => [...prev, { name: scenarioName, result }])
  }

  const handleClearScenarios = () => {
    setScenarios([])
  }

  // Prepare chart data for amortization
  const chartData = currentResult.tableauAmortissement.map((row) => ({
    mois: `M${row.mois}`,
    capital: row.capital,
    interets: row.interets,
    capitalRestant: row.capitalRestant,
  }))

  return (
    <div className="space-y-6">
      {/* Simulation Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Simulateur de prêt
          </CardTitle>
          <CardDescription>Calculez les mensualités et comparez différents scénarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montant">Montant (Ar)</Label>
              <Input
                id="montant"
                type="number"
                value={params.montant}
                onChange={(e) => setParams((prev) => ({ ...prev, montant: Number.parseFloat(e.target.value) || 0 }))}
                min="0"
                step="10000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taux">Taux annuel (%)</Label>
              <Input
                id="taux"
                type="number"
                value={params.taux}
                onChange={(e) => setParams((prev) => ({ ...prev, taux: Number.parseFloat(e.target.value) || 0 }))}
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duree">Durée</Label>
              <Select
                value={params.duree.toString()}
                onValueChange={(value) => setParams((prev) => ({ ...prev, duree: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 mois</SelectItem>
                  <SelectItem value="12">1 an</SelectItem>
                  <SelectItem value="18">18 mois</SelectItem>
                  <SelectItem value="24">2 ans</SelectItem>
                  <SelectItem value="36">3 ans</SelectItem>
                  <SelectItem value="48">4 ans</SelectItem>
                  <SelectItem value="60">5 ans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleAddScenario} variant="outline">
              Ajouter au comparatif
            </Button>
            {scenarios.length > 0 && (
              <Button onClick={handleClearScenarios} variant="outline">
                Effacer les scénarios
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Results */}
      <Card>
        <CardHeader>
          <CardTitle>Résultats de la simulation</CardTitle>
          <CardDescription>Calculs basés sur les paramètres actuels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{formatCurrency(currentResult.mensualite)}</p>
              <p className="text-sm text-muted-foreground">Mensualité</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatCurrency(currentResult.montantTotal)}</p>
              <p className="text-sm text-muted-foreground">Montant total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{formatCurrency(currentResult.interetsTotal)}</p>
              <p className="text-sm text-muted-foreground">Intérêts totaux</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Comparison */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison des scénarios</CardTitle>
            <CardDescription>Comparez les différentes simulations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Scénario</th>
                    <th className="text-right p-2">Mensualité</th>
                    <th className="text-right p-2">Montant total</th>
                    <th className="text-right p-2">Intérêts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-muted/50">
                    <td className="p-2 font-medium">Simulation actuelle</td>
                    <td className="text-right p-2">{formatCurrency(currentResult.mensualite)}</td>
                    <td className="text-right p-2">{formatCurrency(currentResult.montantTotal)}</td>
                    <td className="text-right p-2">{formatCurrency(currentResult.interetsTotal)}</td>
                  </tr>
                  {scenarios.map((scenario, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{scenario.name}</td>
                      <td className="text-right p-2">{formatCurrency(scenario.result.mensualite)}</td>
                      <td className="text-right p-2">{formatCurrency(scenario.result.montantTotal)}</td>
                      <td className="text-right p-2">{formatCurrency(scenario.result.interetsTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Amortization */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Graphiques</TabsTrigger>
          <TabsTrigger value="amortization">Tableau d'amortissement</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition mensuelle</CardTitle>
                <CardDescription>Capital vs Intérêts par mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.slice(0, 12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="capital" stackId="a" fill="#228B22" name="Capital" />
                    <Bar dataKey="interets" stackId="a" fill="#FFD700" name="Intérêts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capital restant</CardTitle>
                <CardDescription>Évolution du capital restant dû</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line
                      type="monotone"
                      dataKey="capitalRestant"
                      stroke="#228B22"
                      strokeWidth={2}
                      name="Capital restant"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="amortization">
          <Card>
            <CardHeader>
              <CardTitle>Tableau d'amortissement</CardTitle>
              <CardDescription>Détail mensuel du remboursement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2">Mois</th>
                      <th className="text-right p-2">Mensualité</th>
                      <th className="text-right p-2">Capital</th>
                      <th className="text-right p-2">Intérêts</th>
                      <th className="text-right p-2">Capital restant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResult.tableauAmortissement.map((row) => (
                      <tr key={row.mois} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{row.mois}</td>
                        <td className="text-right p-2">{formatCurrency(row.mensualite)}</td>
                        <td className="text-right p-2">{formatCurrency(row.capital)}</td>
                        <td className="text-right p-2">{formatCurrency(row.interets)}</td>
                        <td className="text-right p-2">{formatCurrency(row.capitalRestant)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
