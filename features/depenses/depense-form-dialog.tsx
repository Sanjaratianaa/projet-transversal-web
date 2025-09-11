"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon, EditIcon } from "lucide-react"
import RevenueForm from "./depense-form"
import type { Revenue, RevenueFormData } from "@/types/revenue"
import { useToast } from "@/hooks/use-toast"

interface RevenueFormDialogProps {
  revenue?: Revenue
  onSubmit: (data: RevenueFormData) => void
  trigger?: React.ReactNode
  children?: React.ReactNode
}

export default function RevenueFormDialog({ revenue, onSubmit, trigger, children }: RevenueFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (data: RevenueFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      setOpen(false)
      toast({
        title: revenue ? "Source modifiée" : "Source ajoutée",
        description: revenue
          ? "La source de revenus a été modifiée avec succès."
          : "La nouvelle source de revenus a été ajoutée avec succès.",
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
      {revenue ? (
        <>
          <EditIcon className="h-4 w-4 mr-2" />
          Modifier
        </>
      ) : (
        <>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvelle source
        </>
      )}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || children || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {revenue ? "Modifier la source de revenus" : "Nouvelle source de revenus"}
          </DialogTitle>
        </DialogHeader>
        <RevenueForm revenue={revenue} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
