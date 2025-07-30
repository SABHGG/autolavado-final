import { Button } from '@/components/ui/button'

export default function Hero() {
    return (
        <section className="relative h-[600px] flex items-center justify-center text-center text-white">
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: "url('/ghiblilogo.png')" }}
            />
            <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
                    Tu coche merece brillar
                </h1>
                <p className="text-xl sm:text-2xl mb-8">
                    Servicio de lavado profesional rápido y de calidad
                </p>
                <Button size="lg" asChild>
                    <a href="/login">Reserva tu cita ahora</a>
                </Button>
            </div>
        </section>
    )
}