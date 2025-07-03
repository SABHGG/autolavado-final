import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'

const testimonials = [
    {
        name: 'María G.',
        comment: 'Excelente servicio, mi coche quedó impecable. ¡Volveré seguro!',
        rating: 5
    },
    {
        name: 'Carlos R.',
        comment: 'Rápido y profesional. Me encanta cómo cuidan cada detalle.',
        rating: 5
    },
    {
        name: 'Laura M.',
        comment: 'El mejor autolavado de la ciudad. Siempre superan mis expectativas.',
        rating: 5
    }
]

export default function Testimonials() {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Lo Que Dicen Nuestros Clientes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle>{testimonial.name}</CardTitle>
                                <div className="flex">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="text-yellow-400 fill-current" />
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{testimonial.comment}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}