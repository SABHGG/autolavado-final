import Header from "@/components/(landingPage)/header"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <div className="flex flex-col justify-between min-h-svh bg-background">
      <Header />
      <div className="w-full max-w-sm mx-auto p-6 md:p-10">
        <LoginForm />
      </div>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © 2025 HARDSOFT. Todos los derechos reservados.
      </footer>
    </div>
  )
}
