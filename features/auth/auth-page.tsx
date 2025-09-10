"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-2xl font-bold text-primary-foreground">MF</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">MesFactures</h1>
          <p className="text-muted-foreground">Gérez vos factures et dépenses facilement</p>
        </div>

        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center text-card-foreground">
              {activeTab === "login" ? "Connexion" : "Inscription"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {activeTab === "login" ? "Connectez-vous à votre compte" : "Créez votre compte gratuitement"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-sm font-medium">
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="register" className="text-sm font-medium">
                  Inscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
