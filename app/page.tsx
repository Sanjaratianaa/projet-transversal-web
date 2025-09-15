import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to auth page by default
  redirect("/auth")
}
