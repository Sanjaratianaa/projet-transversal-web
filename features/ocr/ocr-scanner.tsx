"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  CameraIcon,
  UploadIcon,
  ScanIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  FileImageIcon,
} from "lucide-react"
import type { OCRResult } from "@/types/invoice"

interface OCRScannerProps {
  onResult: (result: OCRResult) => void
  onCancel: () => void
}

export default function OCRScanner({ onResult, onCancel }: OCRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Mock OCR function (in real implementation, would use Tesseract.js)
  const performOCR = useCallback(async (imageData: string): Promise<OCRResult> => {
    // Simulate OCR processing with progress updates
    setProgress(0)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setProgress(25)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setProgress(50)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setProgress(75)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setProgress(100)

    // Mock OCR result - in real implementation, this would be actual text extraction
    const mockResults: OCRResult[] = [
      {
        fournisseur: "EDF",
        montant: 89.5,
        dateEmission: "2024-01-15",
        dateEcheance: "2024-02-15",
        confidence: 0.85,
      },
      {
        fournisseur: "Orange",
        montant: 39.99,
        dateEmission: "2024-01-20",
        dateEcheance: "2024-02-20",
        confidence: 0.92,
      },
      {
        fournisseur: "Veolia Eau",
        montant: 45.3,
        dateEmission: "2024-01-10",
        dateEcheance: "2024-02-10",
        confidence: 0.78,
      },
    ]

    return mockResults[Math.floor(Math.random() * mockResults.length)]
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (err) {
      setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageData)
        stopCamera()
        processImage(imageData)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setCapturedImage(imageData)
        processImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (imageData: string) => {
    setIsScanning(true)
    setError(null)
    setProgress(0)

    try {
      const result = await performOCR(imageData)
      setOcrResult(result)
    } catch (err) {
      setError("Erreur lors de l'analyse de l'image. Veuillez réessayer.")
    } finally {
      setIsScanning(false)
      setProgress(0)
    }
  }

  const handleAcceptResult = () => {
    if (ocrResult) {
      onResult(ocrResult)
    }
  }

  const handleRetry = () => {
    setCapturedImage(null)
    setOcrResult(null)
    setError(null)
    setProgress(0)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "Excellente"
    if (confidence >= 0.6) return "Bonne"
    return "Faible"
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanIcon className="h-5 w-5" />
          Scanner une facture
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <XCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!capturedImage && !showCamera && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Prenez une photo de votre facture ou uploadez une image pour extraire automatiquement les informations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={startCamera} className="h-24 flex-col gap-2 bg-primary hover:bg-primary/90">
                <CameraIcon className="h-8 w-8" />
                Prendre une photo
              </Button>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-24 flex-col gap-2 bg-transparent"
              >
                <UploadIcon className="h-8 w-8" />
                Uploader une image
              </Button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        )}

        {showCamera && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play()
                  }
                }}
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/50 m-4 rounded-lg pointer-events-none" />
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={capturePhoto} className="bg-primary hover:bg-primary/90">
                <CameraIcon className="h-4 w-4 mr-2" />
                Capturer
              </Button>
              <Button variant="outline" onClick={stopCamera} className="bg-transparent">
                Annuler
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Facture capturée"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Badge className="absolute top-2 right-2 bg-primary">
                <FileImageIcon className="h-3 w-3 mr-1" />
                Image capturée
              </Badge>
            </div>

            {isScanning && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ScanIcon className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Analyse en cours...</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {ocrResult && !isScanning && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Analyse terminée</span>
                  <Badge className={getConfidenceColor(ocrResult.confidence)}>
                    Confiance: {getConfidenceLabel(ocrResult.confidence)} ({Math.round(ocrResult.confidence * 100)}%)
                  </Badge>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Informations extraites :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {ocrResult.fournisseur && (
                      <div>
                        <span className="text-muted-foreground">Fournisseur:</span>
                        <div className="font-medium">{ocrResult.fournisseur}</div>
                      </div>
                    )}
                    {ocrResult.montant && (
                      <div>
                        <span className="text-muted-foreground">Montant:</span>
                        <div className="font-medium">{ocrResult.montant.toFixed(2)} Ar</div>
                      </div>
                    )}
                    {ocrResult.dateEmission && (
                      <div>
                        <span className="text-muted-foreground">Date d'émission:</span>
                        <div className="font-medium">
                          {new Date(ocrResult.dateEmission).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    )}
                    {ocrResult.dateEcheance && (
                      <div>
                        <span className="text-muted-foreground">Date d'échéance:</span>
                        <div className="font-medium">
                          {new Date(ocrResult.dateEcheance).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Alert>
                  <CheckCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Vérifiez les informations extraites avant de continuer. Vous pourrez les modifier dans le
                    formulaire.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {ocrResult && !isScanning && (
            <>
              <Button onClick={handleAcceptResult} className="flex-1 bg-primary hover:bg-primary/90">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Utiliser ces informations
              </Button>
              <Button variant="outline" onClick={handleRetry} className="flex-1 sm:flex-initial bg-transparent">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isScanning}
            className={`${ocrResult ? "flex-1 sm:flex-initial" : "w-full"} bg-transparent`}
          >
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
