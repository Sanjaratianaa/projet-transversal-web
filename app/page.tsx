import InvoiceDashboard from "@/features/invoices/invoice-dashboard"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <InvoiceDashboard />
      </div>
    </div>
  )
}
