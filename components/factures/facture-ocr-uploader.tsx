"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Camera, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FactureOCRUploaderProps {
  onTextExtracted: (text: string) => void
}

export function FactureOCRUploader({ onTextExtracted }: FactureOCRUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const processImage = async (file: File) => {
    setIsProcessing(true)

    try {
      // Simulate OCR processing with Tesseract.js
      // In a real implementation, you would use:
      // import Tesseract from 'tesseract.js';
      // const { data: { text } } = await Tesseract.recognize(file, 'fra');

      // For demo purposes, simulate processing time and return mock text
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockExtractedText = `
Facture N° 2024-001
Fournisseur: EDF Madagascar
Type: Électricité
Montant: 125,000 Ar
Date d'émission: 15/01/2024
Date d'échéance: 15/02/2024
Description: Consommation électrique janvier 2024
      `.trim()

      setExtractedText(mockExtractedText)
      onTextExtracted(mockExtractedText)

      toast({
        title: "Texte extrait avec succès",
        description: "Les informations de la facture ont été analysées.",
      })
    } catch (error) {
      toast({
        title: "Erreur lors de l'extraction",
        description: "Impossible d'analyser l'image. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      processImage(file)
    } else {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive",
      })
    }
  }

  const handleCameraCapture = () => {
    // In a real implementation, you would open camera interface
    toast({
      title: "Fonctionnalité à venir",
      description: "La capture par caméra sera disponible prochainement.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Scanner une facture (OCR)
        </CardTitle>
        <CardDescription>
          Téléchargez une photo de votre facture pour extraire automatiquement les informations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="h-20 flex-col"
          >
            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin mb-2" /> : <Upload className="h-6 w-6 mb-2" />}
            {isProcessing ? "Traitement..." : "Télécharger une image"}
          </Button>

          <Button
            variant="outline"
            onClick={handleCameraCapture}
            disabled={isProcessing}
            className="h-20 flex-col bg-transparent"
          >
            <Camera className="h-6 w-6 mb-2" />
            Prendre une photo
          </Button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        {extractedText && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Texte extrait :</h4>
            <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-line">{extractedText}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
