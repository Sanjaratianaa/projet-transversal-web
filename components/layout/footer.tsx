export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="flex items-center justify-center w-8 h-8 bg-secondary rounded-full">
              <span className="text-sm font-bold text-secondary-foreground">MF</span>
            </div>
            <span className="text-lg font-semibold">MesFactures</span>
          </div>
          <div className="text-sm text-muted-foreground">© 2024 MesFactures. Tous droits réservés.</div>
        </div>
      </div>
    </footer>
  )
}
