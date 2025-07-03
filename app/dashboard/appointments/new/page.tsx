"use client"

import { useRouter } from "next/navigation"
import { NewAppointmentForm } from "@/components/new-appointment-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function NewAppointmentPage() {
    const router = useRouter()

    const handleSuccess = () => {
        router.push("/dashboard/appointments")
        router.refresh() // Para actualizar la lista de citas
    }

    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Crear Nueva Cita</CardTitle>
                    <CardDescription>
                        Complete todos los campos para programar una nueva cita
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <NewAppointmentForm
                        onSuccess={handleSuccess}
                        onCancel={() => router.push("/dashboard/appointments")}
                    />
                </CardContent>
            </Card>
        </div>
    )
}