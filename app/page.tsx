import Header from '@/components/(landingPage)/header'
import Hero from "@/components/(landingPage)/hero"
import Services from '@/components/(landingPage)/services'
import WhyChooseUs from '@/components/(landingPage)/why-choose-us'
import Testimonials from '@/components/(landingPage)/testimonials'
import AppointmentForm from '@/components/(landingPage)/appointment-form'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Services />
        <WhyChooseUs />
        <Testimonials />
        <AppointmentForm />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © 2024 AutoLavado Exprés. Todos los derechos reservados.
      </footer>
    </div>
  )
}