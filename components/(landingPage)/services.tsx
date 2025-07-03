import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplet, Sparkles, Clock, Car } from 'lucide-react'

const services = [
    {
        icon: <Droplet className="h-8 w-8 text-primary" />,
        title: 'Lavado Básico',
        description: 'Limpieza exterior completa con champú de alta calidad.'
    },
    {
        icon: <Sparkles className="h-8 w-8 text-primary" />,
        title: 'Lavado Premium',
        description: 'Incluye limpieza exterior e interior detallada.'
    },
    {
        icon: <Clock className="h-8 w-8 text-primary" />,
        title: 'Lavado Exprés',
        description: 'Servicio rápido para cuando tienes prisa.'
    },
    {
        icon: <Car className="h-8 w-8 text-primary" />,
        title: 'Detallado Completo',
        description: 'Tratamiento completo para dejar tu coche como nuevo.'
    }
]

export default function Services() {
    return (
        <section id="servicios" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {service.icon}
                                    {service.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{service.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}