"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("L'email est requis")
      return
    }

    if (!validateEmail(email)) {
      setError("Format d'email invalide")
      return
    }

    setError("")
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 1000)
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Email envoyé !</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
          </p>
        </div>
        <Button onClick={onBack} variant="outline" className="w-full bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la connexion
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pl-10 ${error ? "border-destructive" : ""}`}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={isLoading}>
        {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
      </Button>

      <Button type="button" onClick={onBack} variant="outline" className="w-full bg-transparent">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à la connexion
      </Button>
    </form>
  )
}
