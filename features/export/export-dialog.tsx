"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { DownloadIcon, FileTextIcon, FileSpreadsheetIcon, FileIcon, InfoIcon } from "lucide-react"
import type { Invoice } from "@/types/invoice"
import { EXPORT_COLUMNS, performExport, type ExportFormat, type ExportOptions } from "@/lib/export-utils"
import { useToast } from "@/hooks/use-toast"

interface ExportDialogProps {
  invoices: Invoice[]
  trigger?: React.ReactNode
}

export default function ExportDialog({ invoices, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const [options, setOptions] = useState<ExportOptions>({
    format: "csv",
    includeColumns: ["fournisseur", "type", "montant", "dateEmission", "dateEcheance", "statut"],
    dateFormat: "short",
    includeStats: true,
    filename: `factures_${new Date().toISOString().split("T")[0]}`,
  })

  const handleFormatChange = (format: ExportFormat) => {
    setOptions((prev) => ({
      ...prev,
      format,
      filename: `factures_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : format}`,
    }))
  }

  const handleColumnToggle = (columnKey: string, checked: boolean) => {
    setOptions((prev) => ({
      ...prev,
      includeColumns: checked
        ? [...prev.includeColumns, columnKey]
        : prev.includeColumns.filter((col) => col !== columnKey),
    }))
  }

  const handleExport = async () => {
    if (options.includeColumns.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une colonne à exporter.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      await performExport(invoices, options)

      clearInterval(progressInterval)
      setProgress(100)

      toast({
        title: "Export réussi",
        description: `${invoices.length} factures exportées au format ${options.format.toUpperCase()}.`,
      })

      setTimeout(() => {
        setOpen(false)
        setProgress(0)
      }, 1000)
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'export.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case "pdf":
        return <FileTextIcon className="h-4 w-4" />
      case "excel":
        return <FileSpreadsheetIcon className="h-4 w-4" />
      case "csv":
        return <FileIcon className="h-4 w-4" />
    }
  }

  const getFormatDescription = (format: ExportFormat) => {
    switch (format) {
      case "pdf":
        return "Document PDF avec mise en forme"
      case "excel":
        return "Fichier Excel (.xlsx) pour analyse"
      case "csv":
        return "Fichier CSV pour import/export"
    }
  }

  const defaultTrigger = (
    <Button variant="outline" className="bg-transparent">
      <DownloadIcon className="h-4 w-4 mr-2" />
      Exporter
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DownloadIcon className="h-5 w-5" />
            Exporter les factures
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info */}
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Vous allez exporter <strong>{invoices.length} factures</strong> selon les filtres appliqués.
            </AlertDescription>
          </Alert>

          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Format d'export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(["csv", "excel", "pdf"] as ExportFormat[]).map((format) => (
                <div
                  key={format}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    options.format === format ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => handleFormatChange(format)}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={options.format === format}
                      onChange={() => handleFormatChange(format)}
                      className="text-primary"
                    />
                    {getFormatIcon(format)}
                    <div>
                      <div className="font-medium">{format.toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">{getFormatDescription(format)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Column Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Colonnes à inclure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXPORT_COLUMNS.map((column) => (
                  <div key={column.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.key}
                      checked={options.includeColumns.includes(column.key)}
                      onCheckedChange={(checked) => handleColumnToggle(column.key, checked as boolean)}
                    />
                    <Label htmlFor={column.key} className="text-sm font-medium cursor-pointer">
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline">{options.includeColumns.length} colonnes sélectionnées</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Format des dates</Label>
                  <Select
                    value={options.dateFormat}
                    onValueChange={(value: "short" | "long") => setOptions((prev) => ({ ...prev, dateFormat: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Court (2024-01-15)</SelectItem>
                      <SelectItem value="long">Long (15 janvier 2024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filename">Nom du fichier</Label>
                  <Input
                    id="filename"
                    value={options.filename}
                    onChange={(e) => setOptions((prev) => ({ ...prev, filename: e.target.value }))}
                    placeholder="factures_export"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeStats"
                  checked={options.includeStats}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeStats: checked as boolean }))}
                />
                <Label htmlFor="includeStats" className="text-sm cursor-pointer">
                  Inclure les statistiques (PDF uniquement)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {isExporting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DownloadIcon className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Export en cours...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting || options.includeColumns.length === 0}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Export en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Exporter {invoices.length} factures
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isExporting}
              className="flex-1 sm:flex-initial bg-transparent"
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
