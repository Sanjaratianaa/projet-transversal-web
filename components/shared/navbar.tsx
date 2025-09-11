"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileTextIcon, UserIcon, HomeIcon, CoinsIcon, DollarSign } from "lucide-react"

export default function Navbar() {
  return (
    <Card className="border-b rounded-none">
      <CardContent className="p-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-full">
              <span className="text-sm font-bold text-primary-foreground">MF</span>
            </div>
            MesFactures
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <HomeIcon className="h-4 w-4" />
                Accueil
              </Button>
            </Link>
            <Link href="/factures">
              <Button variant="ghost" className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                Mes Factures
              </Button>
            </Link>
            <Link href="/revenus">
              <Button variant="ghost" className="flex items-center gap-2">
                <CoinsIcon className="h-4 w-4" />
                Mes Revenus
              </Button>
            </Link>
            <Link href="/depenses">
              <Button variant="ghost" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Mes Dépenses
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <UserIcon className="h-4 w-4" />
                Se connecter
              </Button>
            </Link>
          </div>
        </nav>
      </CardContent>
    </Card>
  )
}
