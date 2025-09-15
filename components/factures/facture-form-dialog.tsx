"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon, EditIcon } from "lucide-react"
import { FactureFormData, Facture, FactureForm } from "./facture-form"
import { useToast } from "@/hooks/use-toast"

interface FactureFormDialogProps {
  facture?: Facture
  onSubmit: (data: FactureFormData) => void
  trigger?: React.ReactNode
  children?: React.ReactNode
}

export default function FactureFormDialog({ facture, onSubmit, trigger, children }: FactureFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (data: FactureFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      setOpen(false)
      toast({
        title: facture ? "Facture modifiée" : "Facture ajoutée",
        description: facture
          ? "La facture a été modifiée avec succès."
          : "La nouvelle facture a été ajoutée avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const defaultTrigger = (
    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
      {facture ? (
        <>
          <EditIcon className="h-4 w-4 mr-2" />
          Modifier
        </>
      ) : (
        <>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvelle facture
        </>
      )}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || children || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{facture ? "Modifier la facture" : "Nouvelle facture"}</DialogTitle>
        </DialogHeader>
        <FactureForm facture={facture} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
