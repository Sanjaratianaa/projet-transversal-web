"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScanIcon } from "lucide-react"
import OCRScanner from "./ocr-scanner"
import InvoiceFormDialog from "@/features/invoices/invoice-form-dialog"
import InvoiceForm from "@/features/invoices/invoice-form"
import type { OCRResult, InvoiceFormData } from "@/types/invoice"

interface OCRScannerDialogProps {
  onSubmit: (data: InvoiceFormData) => void
  trigger?: React.ReactNode
}

export default function OCRScannerDialog({ onSubmit, trigger }: OCRScannerDialogProps) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)

  const handleOCRResult = (result: OCRResult) => {
    setOcrResult(result)
    setScannerOpen(false)
    setFormOpen(true)
  }

  const handleFormSubmit = (data: InvoiceFormData) => {
    onSubmit(data)
    setFormOpen(false)
    setOcrResult(null)
  }

  const handleScannerCancel = () => {
    setScannerOpen(false)
    setOcrResult(null)
  }

  const handleFormCancel = () => {
    setFormOpen(false)
    setOcrResult(null)
  }

  // Convert OCR result to form data
  const getPrefilledFormData = (): Partial<InvoiceFormData> => {
    if (!ocrResult) return {}

    return {
      fournisseur: ocrResult.fournisseur || "",
      montant: ocrResult.montant?.toString() || "",
      dateEmission: ocrResult.dateEmission || "",
      dateEcheance: ocrResult.dateEcheance || "",
      type: "autre", // Default type, user can change
      statut: "en_attente", // Default status
    }
  }

  const defaultTrigger = (
    <Button variant="outline" className="bg-transparent">
      <ScanIcon className="h-4 w-4 mr-2" />
      Scanner une facture
    </Button>
  )

  return (
    <>
      {/* OCR Scanner Dialog */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Scanner une facture</DialogTitle>
          </DialogHeader>
          <OCRScanner onResult={handleOCRResult} onCancel={handleScannerCancel} />
        </DialogContent>
      </Dialog>

      {/* Form Dialog with pre-filled data */}
      <InvoiceFormDialog
        onSubmit={handleFormSubmit}
        trigger={null}
        invoice={
          ocrResult
            ? ({
                id: "",
                ...getPrefilledFormData(),
                createdAt: "",
                updatedAt: "",
              } as any)
            : undefined
        }
      />

      {/* Manual dialog control for form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Nouvelle facture depuis OCR</DialogTitle>
          </DialogHeader>
          {ocrResult && (
            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Informations détectées par OCR</h3>
                <p className="text-sm text-muted-foreground">
                  Les champs ci-dessous ont été pré-remplis automatiquement. Vérifiez et modifiez si nécessaire.
                </p>
              </div>
              <InvoiceForm
                invoice={
                  {
                    id: "",
                    ...getPrefilledFormData(),
                    createdAt: "",
                    updatedAt: "",
                  } as any
                }
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
