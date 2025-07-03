import { CheckCircle } from 'lucide-react'

const reasons = [
    'Equipo profesional y experimentado',
    'Productos de limpieza ecológicos',
    'Atención rápida y eficiente',
    'Tecnología de lavado avanzada',
    'Satisfacción garantizada'
]

export default function WhyChooseUs() {
    return (
        <section id="por-que-nosotros" className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Por Qué Elegirnos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <img
                            src="/placeholder.svg?height=400&width=600"
                            alt="Equipo de AutoLavado Exprés"
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                    <div>
                        <ul className="space-y-4">
                            {reasons.map((reason, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="text-primary" />
                                    <span>{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}